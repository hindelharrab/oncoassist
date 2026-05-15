# ============================================================
# main.py — FastAPI Service IA Biopsie Cancer du Sein
# ============================================================

from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import torch
import torch.nn as nn
import torch.nn.functional as F
from torchvision import transforms, models
from PIL import Image
import numpy as np
import cv2
import io
import os
import uuid

# ── App
app = FastAPI(title="OncoAssist IA Service", version="1.0.0")

# ── CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Config
UPLOAD_DIR = r"C:\oncoassist\backend\uploads\photos"  # ← seul dossier
MODEL_DIR  = "models"
DEVICE     = torch.device("cuda" if torch.cuda.is_available() else "cpu")
TYPES      = [
    "fibroadenoma",
    "tubular_adenoma",
    "ductal_carcinoma",
    "mucinous_carcinoma"
]

os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads/photos", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# ── Architecture DenseNet121
class BreakHisDenseNet(nn.Module):
    def __init__(self, num_classes, dropout=0.5):
        super().__init__()
        densenet        = models.densenet121(weights=None)
        self.backbone   = densenet.features
        self.gap        = nn.AdaptiveAvgPool2d((1, 1))
        self.classifier = nn.Sequential(
            nn.Flatten(),
            nn.Linear(1024, 512),
            nn.BatchNorm1d(512),
            nn.ReLU(),
            nn.Dropout(dropout),
            nn.Linear(512, 128),
            nn.ReLU(),
            nn.Dropout(dropout),
            nn.Linear(128, num_classes)
        )

    def forward(self, x):
        f = self.backbone(x)
        f = self.gap(f)
        return self.classifier(f)

# ── Charger les modèles au démarrage
print(f"Chargement des modèles sur {DEVICE}...")

model_bin   = BreakHisDenseNet(num_classes=2).to(DEVICE)
model_multi = BreakHisDenseNet(num_classes=4).to(DEVICE)

try:
    model_bin.load_state_dict(
        torch.load(
            os.path.join(MODEL_DIR, "model_bin4_p2.pth"),
            map_location=DEVICE
        )
    )
    model_multi.load_state_dict(
        torch.load(
            os.path.join(MODEL_DIR, "model_multi4_p2.pth"),
            map_location=DEVICE
        )
    )
    model_bin.eval()
    model_multi.eval()
    print("Modèles chargés avec succès !")
except FileNotFoundError as e:
    print(f" Erreur chargement modèle : {e}")
    raise

# ── Preprocessing
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std =[0.229, 0.224, 0.225]
    )
])

# ── Grad-CAM
def generate_gradcam(model, img_tensor, class_idx):
    gradients   = []
    activations = []

    def save_grad(grad):
        gradients.append(grad)

    def forward_hook(module, inp, out):
        activations.append(out)
        out.register_hook(save_grad)

    handle = model.backbone.denseblock4.register_forward_hook(forward_hook)

    output = model(img_tensor)
    model.zero_grad()
    output[0, class_idx].backward()
    handle.remove()

    if not gradients or not activations:
        return np.zeros((7, 7))

    grad = gradients[0].squeeze()
    act  = activations[0].squeeze()

    weights = grad.mean(dim=[1, 2], keepdim=True)
    cam     = (weights * act).sum(dim=0)
    cam     = F.relu(cam)
    cam     = cam.detach().cpu().numpy()

    # Normaliser
    cam_min, cam_max = cam.min(), cam.max()
    if cam_max - cam_min > 1e-8:
        cam = (cam - cam_min) / (cam_max - cam_min)
    else:
        cam = np.zeros_like(cam)

    return cam

def superpose_gradcam(pil_image, cam):
    # Redimensionner cam à 224×224
    cam_resized = cv2.resize(cam, (224, 224))
    cam_uint8   = (cam_resized * 255).astype(np.uint8)

    # Colormap JET (bleu→vert→jaune→rouge)
    heatmap_bgr = cv2.applyColorMap(cam_uint8, cv2.COLORMAP_JET)
    heatmap_rgb = cv2.cvtColor(heatmap_bgr, cv2.COLOR_BGR2RGB)

    # Superposer sur image originale
    img_arr   = np.array(pil_image.resize((224, 224))).astype(np.float32)
    heatmap_f = heatmap_rgb.astype(np.float32)
    superposed = np.clip(0.6 * img_arr + 0.4 * heatmap_f, 0, 255).astype(np.uint8)

    return Image.fromarray(superposed)

# ── Endpoint principal
@app.post("/predict")
async def predict(
    images       : List[UploadFile] = File(...),
    grossissement: str              = Form(...)
):
    if not images:
        raise HTTPException(status_code=400, detail="Aucune image fournie")

    all_probs_bin   = []
    all_probs_multi = []
    gradcam_paths   = []

    for image_file in images:
        # ── Lire et valider l'image
        try:
            contents = await image_file.read()
            pil_img  = Image.open(io.BytesIO(contents)).convert("RGB")
        except Exception:
            raise HTTPException(
                status_code=400,
                detail=f"Image invalide : {image_file.filename}"
            )

        # ── Prétraitement
        tensor = transform(pil_img).unsqueeze(0).to(DEVICE)

        # ── Prédiction binaire
        with torch.no_grad():
            out_bin     = model_bin(tensor)
            probs_bin   = torch.softmax(out_bin, dim=1)[0]

        # ── Prédiction multi-classe
        with torch.no_grad():
            out_multi   = model_multi(tensor)
            probs_multi = torch.softmax(out_multi, dim=1)[0]

        all_probs_bin.append(probs_bin.cpu().numpy())
        all_probs_multi.append(probs_multi.cpu().numpy())

        # ── Grad-CAM sur modèle binaire
        try:
            pred_bin_idx = int(probs_bin.argmax())
            tensor_grad  = transform(pil_img).unsqueeze(0).to(DEVICE)
            tensor_grad.requires_grad_(True)

            cam         = generate_gradcam(model_bin, tensor_grad, pred_bin_idx)
            gradcam_img = superpose_gradcam(pil_img, cam)

            # Sauvegarder le Grad-CAM
            gradcam_name = f"gradcam_{uuid.uuid4().hex}.png"
            gradcam_path = os.path.join(UPLOAD_DIR, gradcam_name)  # ← UPLOAD_DIR pas UPLOAD_DIR_GRADCAM
            gradcam_img.save(gradcam_path)
            gradcam_paths.append(gradcam_name)

        except Exception as e:
            print(f" Grad-CAM échoué pour {image_file.filename}: {e}")
            gradcam_paths.append(None)

    # ── Moyenne sur toutes les images (résultat global)
    mean_bin   = np.mean(all_probs_bin,   axis=0)
    mean_multi = np.mean(all_probs_multi, axis=0)

    pred_bin_idx   = int(np.argmax(mean_bin))
    pred_multi_idx = int(np.argmax(mean_multi))

    classe_binaire  = "BENIN" if pred_bin_idx == 0 else "MALIN"
    type_tumeur     = TYPES[pred_multi_idx]
    score_bin       = round(float(mean_bin[pred_bin_idx]),   4)
    score_multi     = round(float(mean_multi[pred_multi_idx]), 4)

    return {
        "classe_binaire"       : classe_binaire,
        "score_benign_malin"   : score_bin,
        "type_tumeur"          : type_tumeur,
        "score_type_confiance" : score_multi,
        "gradcam_paths"        : gradcam_paths
    }

# ── Health check
@app.get("/health")
def health():
    return {
        "status" : "ok",
        "device" : str(DEVICE),
        "modeles": ["model_bin4_p2", "model_multi4_p2"]
    }

# ── Info modèles
@app.get("/info")
def info():
    return {
        "classes_binaires"    : ["BENIN", "MALIN"],
        "classes_multiclasses": TYPES,
        "image_size"          : "224x224",
        "grossissements"      : ["40X", "100X", "200X", "400X"]
    }