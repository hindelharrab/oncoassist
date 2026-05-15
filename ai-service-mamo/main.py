from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from architecture import load_model
from inference    import GradCAM, run_inference

app_state = {}

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Chargement du modèle OncoAssist...")
    model, device = load_model(
        'model/oncoassist_model1_weights.pth'
    )
    app_state['model']   = model
    app_state['gradcam'] = GradCAM(model)
    app_state['device']  = device
    print("✓ Serveur prêt")
    yield
    app_state.clear()


app = FastAPI(
    title="OncoAssist AI Service",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    if file.content_type not in ['image/jpeg', 'image/png']:
        raise HTTPException(
            status_code=400,
            detail="Format non supporté. JPEG ou PNG uniquement."
        )
    image_bytes = await file.read()
    try:
        result = run_inference(
            image_bytes    = image_bytes,
            gradcam_engine = app_state['gradcam'],
            device         = app_state['device'],
            threshold      = 0.5
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "model":  "EfficientNet-B3",
        "device": app_state.get('device', 'unknown')
    }