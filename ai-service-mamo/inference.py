import torch
import torchvision.transforms as transforms
import numpy as np
import cv2
import base64
from io import BytesIO
from PIL import Image

IMG_SIZE = 300


def preprocess(image_bytes: bytes, device: str):
    nparr = np.frombuffer(image_bytes, np.uint8)
    img   = cv2.imdecode(nparr, cv2.IMREAD_GRAYSCALE)
    if img is None:
        raise ValueError("Image illisible")
    clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
    img   = clahe.apply(img)
    img   = cv2.resize(img, (IMG_SIZE, IMG_SIZE),
                       interpolation=cv2.INTER_AREA)
    img_display = np.stack(
        [img.astype(np.float32) / 255.0] * 3, axis=-1
    )
    normalize = transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
    tensor = torch.tensor(
        img_display.transpose(2, 0, 1),
        dtype=torch.float32
    ).unsqueeze(0)
    tensor = normalize(tensor.squeeze(0)).unsqueeze(0)
    tensor = tensor.to(device)
    return tensor, img_display


class GradCAM:
    def __init__(self, model):
        self.model       = model
        self.gradients   = None
        self.activations = None
        target = self.model.backbone.features[-1]

        def forward_hook(module, input, output):
            self.activations = output.detach()

        def backward_hook(module, grad_in, grad_out):
            self.gradients = grad_out[0].detach()

        target.register_forward_hook(forward_hook)
        target.register_full_backward_hook(backward_hook)

    def generate(self, tensor):
        self.model.eval()
        self.model.zero_grad()
        tensor.requires_grad_(True)
        output = self.model(tensor)
        score  = torch.sigmoid(output).item()
        output.backward()
        grads   = self.gradients[0]
        acts    = self.activations[0]
        weights = grads.mean(dim=(1, 2))
        cam = torch.zeros(acts.shape[1:])
        for i, w in enumerate(weights):
            cam += w * acts[i]
        cam = torch.clamp(cam, min=0)
        if cam.max() > 0:
            cam = cam / cam.max()
        heatmap = cv2.resize(
            cam.cpu().numpy(),
            (IMG_SIZE, IMG_SIZE),
            interpolation=cv2.INTER_CUBIC
        )
        if heatmap.max() > 0:
            heatmap = heatmap / heatmap.max()
        return heatmap, score


def birads_from_score(score: float) -> dict:
    if score < 0.20:
        return {'label': 'BI-RADS 1', 'description': 'Négatif',
                'recommendation': 'Surveillance annuelle',
                'action': 'routine', 'color': '#1D9E75'}
    elif score < 0.40:
        return {'label': 'BI-RADS 2', 'description': 'Bénin',
                'recommendation': 'Surveillance annuelle',
                'action': 'surveillance', 'color': '#5DCAA5'}
    elif score < 0.55:
        return {'label': 'BI-RADS 3', 'description': 'Probablement bénin',
                'recommendation': 'Contrôle à 6 mois',
                'action': 'surveillance_rapprochee', 'color': '#EF9F27'}
    elif score < 0.70:
        return {'label': 'BI-RADS 4A', 'description': 'Suspicion faible',
                'recommendation': 'Biopsie à discuter',
                'action': 'biopsie_optionnelle', 'color': '#F0997B'}
    elif score < 0.85:
        return {'label': 'BI-RADS 4B', 'description': 'Suspicion intermédiaire',
                'recommendation': 'Biopsie écho-guidée recommandée',
                'action': 'biopsie_recommandee', 'color': '#D85A30'}
    elif score < 0.95:
        return {'label': 'BI-RADS 4C', 'description': 'Suspicion élevée',
                'recommendation': 'Biopsie urgente',
                'action': 'biopsie_urgente', 'color': '#E24B4A'}
    else:
        return {'label': 'BI-RADS 5', 'description': 'Malin probable',
                'recommendation': 'Biopsie urgente + bilan extension',
                'action': 'biopsie_urgente', 'color': '#A32D2D'}


def get_bounding_box(heatmap: np.ndarray) -> dict:
    threshold = 0.40 * heatmap.max()
    binary    = (heatmap >= threshold).astype(np.uint8) * 255
    contours, _ = cv2.findContours(
        binary, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE
    )
    if not contours:
        return None
    largest    = max(contours, key=cv2.contourArea)
    x, y, w, h = cv2.boundingRect(largest)
    max_idx    = np.unravel_index(np.argmax(heatmap), heatmap.shape)
    hot_y, hot_x = max_idx
    return {
        'x': int(x), 'y': int(y),
        'w': int(w), 'h': int(h),
        'cx': int(x + w // 2), 'cy': int(y + h // 2),
        'hot_x': int(hot_x), 'hot_y': int(hot_y),
        'area_pct': round((w * h) / (IMG_SIZE ** 2) * 100, 2)
    }


def get_quadrant(bbox: dict) -> dict:
    if bbox is None:
        return {'quadrant': 'Indéterminé', 'short': 'N/A',
                'position_text': 'Localisation non disponible'}
    cx, cy  = bbox['hot_x'], bbox['hot_y']
    center  = IMG_SIZE // 2
    is_upper = cy < center
    is_right = cx > center
    dist = np.sqrt(
        ((cx - center) / center * 100) ** 2 +
        ((cy - center) / center * 100) ** 2
    )
    if   is_upper and is_right:      q, s = 'Quadrant supéro-externe', 'QSE'
    elif is_upper and not is_right:  q, s = 'Quadrant supéro-interne', 'QSI'
    elif not is_upper and is_right:  q, s = 'Quadrant inféro-externe', 'QIE'
    else:                            q, s = 'Quadrant inféro-interne', 'QII'
    zone = ('région centrale'     if dist < 30 else
            'zone médio-mammaire' if dist < 60 else
            'zone périphérique')
    return {
        'quadrant': q, 'short': s,
        'position_text': f'{q}, {zone}'
    }


def image_to_base64(img_array: np.ndarray) -> str:
    img_uint8 = (np.clip(img_array, 0, 1) * 255).astype(np.uint8)
    pil_img   = Image.fromarray(img_uint8)
    buffer    = BytesIO()
    pil_img.save(buffer, format='PNG')
    b64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
    return f"data:image/png;base64,{b64}"


def generate_overlay(img_display, heatmap):
    colored = cv2.applyColorMap(
        (heatmap * 255).astype(np.uint8), cv2.COLORMAP_JET
    )
    colored_rgb = cv2.cvtColor(colored, cv2.COLOR_BGR2RGB) / 255.0
    return np.clip(0.55 * img_display + 0.45 * colored_rgb, 0, 1)


def draw_bbox_on_image(img_display, bbox, quadrant):
    img = (img_display * 255).astype(np.uint8).copy()
    if bbox:
        cv2.rectangle(img,
                      (bbox['x'], bbox['y']),
                      (bbox['x'] + bbox['w'], bbox['y'] + bbox['h']),
                      (255, 100, 0), 2)
        cv2.circle(img, (bbox['hot_x'], bbox['hot_y']), 6, (255, 100, 0), -1)
        cv2.putText(img, quadrant.get('short', ''),
                    (bbox['x'], max(bbox['y'] - 8, 12)),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.45, (255, 100, 0), 1)
    return img.astype(np.float32) / 255.0


def run_inference(image_bytes: bytes,
                  gradcam_engine: GradCAM,
                  device: str,
                  threshold: float = 0.5) -> dict:
    tensor, img_display = preprocess(image_bytes, device)
    heatmap, score      = gradcam_engine.generate(tensor)
    prediction = 'MALIGNANT' if score >= threshold else 'BENIGN'
    birads     = birads_from_score(score)
    bbox       = get_bounding_box(heatmap)
    quadrant   = get_quadrant(bbox)
    overlay    = generate_overlay(img_display, heatmap)
    img_bbox   = draw_bbox_on_image(img_display, bbox, quadrant)
    return {
        'prediction':         prediction,
        'score':              round(float(score), 4),
        'confidence_pct':     round(float(
            score * 100 if score >= threshold
            else (1 - score) * 100), 1),
        'birads_label':       birads['label'],
        'birads_description': birads['description'],
        'recommendation':     birads['recommendation'],
        'action':             birads['action'],
        'birads_color':       birads['color'],
        'quadrant':           quadrant['quadrant'],
        'quadrant_short':     quadrant['short'],
        'position_text':      quadrant['position_text'],
        'bbox':               bbox,
        'image_original':     image_to_base64(img_display),
        'image_heatmap':      image_to_base64(overlay),
        'image_bbox':         image_to_base64(img_bbox),
    }