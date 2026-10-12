import os
import numpy as np
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from tensorflow.keras.models import load_model

# =========================
# APP
# =========================
app = FastAPI(title="DL QR Fraud Service")

# =========================
# LOAD MODEL
# =========================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "..", "model", "qr_model.h5")

try:
    model = load_model(MODEL_PATH)
except Exception as e:
    model = None
    print("Model load error:", e)

# =========================
# INPUT SCHEMA
# =========================
class QRData(BaseModel):
    qr_amount: float
    entered_amount: float
    txn_velocity: float
    ip_risk_score: float
    device_trusted: int
    foreign_txn: int

# =========================
# PREPROCESS
# =========================
def preprocess(data: QRData):
    """
    IMPORTANT:
    Feature order MUST match training
    """

    # derived feature (NOT a rule, just feature)
    deviation = abs(data.entered_amount - data.qr_amount) / (data.qr_amount + 1e-6)

    features = np.array([[
        data.entered_amount,
        data.qr_amount,
        deviation,
        data.txn_velocity,
        data.ip_risk_score,
        data.device_trusted,
        data.foreign_txn
    ]], dtype=np.float32)

    return features

# =========================
# PREDICT
# =========================
@app.post("/predict")
def predict(data: QRData):

    if model is None:
        raise HTTPException(500, "Model not loaded")

    try:
        x = preprocess(data)

        # DL model outputs probability (0–1)
        prob = float(model.predict(x)[0][0])

        fraud_percentage = prob * 100

        return {
            "fraud_percentage": fraud_percentage,
            "confidence": prob,
            "status": "processed"
        }

    except Exception as e:
        raise HTTPException(500, str(e))

# =========================
# HEALTH
# =========================
@app.get("/health")
def health():
    return {"status": "ok" if model else "model_not_loaded"}