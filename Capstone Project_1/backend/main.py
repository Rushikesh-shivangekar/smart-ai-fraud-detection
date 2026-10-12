"""
Fraud Detection System - FastAPI Backend
=========================================
Supports: ML (sklearn) + DL (TensorFlow/Keras) combined scoring
Database: PostgreSQL (with auto-fallback to SQLite)
"""

import os
os.environ["OPENBLAS_NUM_THREADS"] = "1"
os.environ["OMP_NUM_THREADS"] = "1"
os.environ["MKL_NUM_THREADS"] = "1"
os.environ["VECLIB_MAXIMUM_THREADS"] = "1"
os.environ["NUMEXPR_NUM_THREADS"] = "1"

from fastapi import FastAPI, Depends, Request, HTTPException, UploadFile, File, Form, Header
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy.sql import func
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
import pandas as pd
import joblib
import random
import hashlib
import hmac
import base64
import json
import time
import numpy as np
from datetime import datetime, timedelta
import logging
import cv2
from PIL import Image
import io
import uuid

from database import SessionLocal
import models
from db_operations import (
    save_user, save_login, save_transaction,
    save_otp, save_behavior, save_device_log
)

# =========================
# LOGGING
# =========================
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("fraud_api")

# =========================
# PATH CONFIG
# =========================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, "..", "model")

def load_pkl(name):
    path = os.path.join(MODEL_DIR, name)
    if os.path.exists(path):
        return joblib.load(path)
    logger.warning(f"File not found: {path}")
    return None

# =========================
# LOAD MODELS
# =========================
def load_models():
    models_dict = {}

    # ML models
    models_dict["t_model"] = load_pkl("transaction_model.pkl")
    models_dict["t_enc"]   = load_pkl("transaction_encoders.pkl") or {}
    models_dict["t_cols"]  = load_pkl("transaction_columns.pkl") or []

    models_dict["c_model"] = load_pkl("credit_model.pkl")
    models_dict["c_enc"]   = load_pkl("credit_encoders.pkl") or {}
    models_dict["c_cols"]  = load_pkl("credit_columns.pkl") or []

    models_dict["b_model"]  = load_pkl("behavior_model.pkl")
    models_dict["b_scaler"] = load_pkl("behavior_scaler.pkl")

    # DL model
    try:
        import h5py, json
        from tensorflow.keras.models import model_from_json, Sequential

        h5_path = os.path.join(MODEL_DIR, "qr_model.h5")
        if os.path.exists(h5_path):
            with h5py.File(h5_path, 'r') as f:
                model_config = json.loads(f.attrs.get('model_config'))

                for layer in model_config['config']['layers']:
                    if 'config' in layer:
                        layer['config'].pop('quantization_config', None)

                model = model_from_json(
                    json.dumps(model_config),
                    custom_objects={"Sequential": Sequential}
                )

                model.load_weights(h5_path)

            models_dict["qr_model"] = model
            logger.info("✅ DL model loaded (safe .h5)")
        else:
            models_dict["qr_model"] = None
    except Exception as e:
        logger.warning(f"⚠️ DL model failed: {e}")
        models_dict["qr_model"] = None

    return models_dict

MODELS = load_models()

# =========================
# APP
# =========================
app = FastAPI(title="Smart AI Fraud Detection System", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

PENDING_PAYMENTS = {}
OTP_VALID_MINUTES = 5

# =========================
# DB DEPENDENCY
# =========================
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# =========================
# SCHEMAS
# =========================
class RegisterData(BaseModel):
    username: str
    password: str
    full_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None

class LoginData(BaseModel):
    username: str
    password: str

class PaymentData(BaseModel):
    username: str
    amt: float
    qr_amount: Optional[float] = None
    gender: Optional[str] = "M"
    category: Optional[str] = "shopping_pos"
    location: Optional[str] = "Mumbai"
    frequency: Optional[int] = 1
    merchant_name: Optional[str] = "Merchant UPI"
    device_id: Optional[str] = "web-client"

class OTPData(BaseModel):
    username: str
    otp: str

class GenerateOTPData(BaseModel):
    username: str

class ConfirmData(BaseModel):
    payment_id: str
    username: str
    password: str

# =========================
# UTILS
# =========================
def hash_password(p: str) -> str:
    return hashlib.sha256(p.encode()).hexdigest()

def verify_password(p: str, h: str) -> bool:
    return hash_password(p) == h

def encode_df(df, enc):
    if not enc:
        return df
    for col, le in enc.items():
        if col in df.columns:
            df[col] = df[col].astype(str)
            df[col] = df[col].apply(lambda x: x if x in le.classes_ else le.classes_[0])
            df[col] = le.transform(df[col])
    return df

def fill_context_features(data_dict):
    now = datetime.now()
    ctx = {
        "category": data_dict.get("category", "shopping_pos"),
        "amt": float(data_dict.get("amt", 0.0)),
        "gender": data_dict.get("gender", "M"),
        "city_pop": float(data_dict.get("city_pop", 50000.0)),
        "merch_lat": float(data_dict.get("merch_lat", 19.0760)),
        "merch_long": float(data_dict.get("merch_long", 72.8777)),
        "hour": now.hour,
        "day": now.day,
        "month": now.month,
        "dayofweek": now.weekday(),
        "age": int(data_dict.get("age", 35))
    }
    ctx.update(data_dict)
    return ctx

# =========================
# PREDICTIONS
# =========================
def predict_transaction(data):
    if not MODELS.get("t_model"):
        return 0.1
    enriched = fill_context_features(data)
    df = pd.DataFrame([enriched])
    df = encode_df(df, MODELS.get("t_enc", {}))
    expected = list(MODELS.get("t_cols", []))
    df = df.reindex(columns=expected, fill_value=0)
    try:
        return float(MODELS["t_model"].predict_proba(df)[0][1])
    except Exception as e:
        logger.error(f"predict_transaction error: {e}")
        return 0.15

def predict_credit(data):
    if not MODELS.get("c_model"):
        return 0.1
    enriched = fill_context_features(data)
    df = pd.DataFrame([enriched])
    df = encode_df(df, MODELS.get("c_enc", {}))
    expected = list(MODELS.get("c_cols", []))
    df = df.reindex(columns=expected, fill_value=0)
    try:
        return float(MODELS["c_model"].predict_proba(df)[0][1])
    except Exception as e:
        logger.error(f"predict_credit error: {e}")
        return 0.15

def predict_behavior(amount, frequency=1):
    if not MODELS.get("b_model") or not MODELS.get("b_scaler"):
        return 0.1
    df = pd.DataFrame([{
        "transaction_count": frequency,
        "avg_amount": amount,
        "login_frequency": 1,
        "device_changes": 0,
        "location_changes": 0,
        "time_spent": 5
    }])
    df = df[["transaction_count", "avg_amount", "login_frequency", "device_changes", "location_changes", "time_spent"]]
    try:
        scaled = MODELS["b_scaler"].transform(df)
        pred = MODELS["b_model"].predict(scaled)[0]
        return float(np.clip(pred, 0.0, 1.0))
    except Exception as e:
        logger.error(f"predict_behavior error: {e}")
        return 0.1

def decode_qr(image_bytes):
    try:
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if img is None:
            return None
        detector = cv2.QRCodeDetector()
        data, points, _ = detector.detectAndDecode(img)
        return data if data else None
    except Exception as e:
        logger.warning(f"QR decode exception: {e}")
        return None

def prepare_qr_image_for_model(image_bytes):
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    img = img.resize((128, 128))
    arr = np.array(img, dtype=np.float32) / 255.0
    arr = np.expand_dims(arr, axis=0)
    return arr

def predict_qr_image(image_bytes):
    if MODELS.get("qr_model") is None or not image_bytes:
        return 0.1
    try:
        import tensorflow as tf
        arr = prepare_qr_image_for_model(image_bytes)
        pred = MODELS["qr_model"].predict(tf.constant(arr, dtype=tf.float32), verbose=0)
        return float(pred[0][0])
    except Exception as e:
        logger.warning(f"QR image prediction fallback: {e}")
        return 0.15

# =========================
# COMBINE SCORES
# =========================
def combine_scores(t, c, b, qr):
    # Weighted ensemble: 30% Transaction, 25% Credit, 20% Behavior, 25% QR
    score = (0.30 * t + 0.25 * c + 0.20 * b + 0.25 * qr) * 100
    score = round(float(np.clip(score, 1.0, 99.0)), 2)
    if score < 30:
        return score, "ALLOW"
    elif score < 70:
        return score, "VERIFY"
    else:
        return score, "BLOCK"

# =========================
# ROUTES
# =========================

@app.get("/health")
def health():
    return {
        "status": "healthy",
        "service": "Smart AI Fraud Detection API",
        "models_loaded": {
            "transaction_model": MODELS.get("t_model") is not None,
            "credit_model": MODELS.get("c_model") is not None,
            "behavior_model": MODELS.get("b_model") is not None,
            "qr_dl_model": MODELS.get("qr_model") is not None,
        }
    }

@app.post("/register")
def register(data: RegisterData, request: Request, db: Session = Depends(get_db)):
    clean_username = data.username.strip()
    if not clean_username:
        raise HTTPException(400, "Username is required")
    if len(clean_username) < 3:
        raise HTTPException(400, "Username must be at least 3 characters")
    if len(data.password.strip()) < 4:
        raise HTTPException(400, "Password must be at least 4 characters")

    existing = db.query(models.User).filter(func.lower(models.User.username) == clean_username.lower()).first()
    if existing:
        raise HTTPException(400, f"Username '{clean_username}' is already registered. Please choose another username.")

    if data.email and data.email.strip():
        clean_email = data.email.strip()
        email_existing = db.query(models.User).filter(func.lower(models.User.email) == clean_email.lower()).first()
        if email_existing:
            raise HTTPException(400, f"Email '{clean_email}' is already registered. Please use another email or log in.")

    client_ip = request.client.host if request.client else "127.0.0.1"
    user = save_user(
        db=db,
        username=clean_username,
        password=hash_password(data.password),
        full_name=data.full_name,
        email=data.email,
        phone=data.phone,
        balance=50000.0
    )
    save_login(db, clean_username, client_ip, "Web Client / Registration", "REGISTERED")
    logger.info(f"Registered new user into MySQL database: {user.username} (ID: {user.id})")

    return {
        "status": "success",
        "msg": f"Account successfully created for {clean_username}!",
        "username": user.username,
        "user": {
            "id": user.id,
            "username": user.username,
            "full_name": user.full_name or user.username,
            "email": user.email,
            "phone": user.phone,
            "account_number": user.account_number,
            "upi_id": f"{user.username}@securepay",
            "balance": user.balance or 50000.0,
            "created_at": user.created_at.isoformat() if user.created_at else datetime.now().isoformat()
        }
    }

@app.post("/login")
def login(data: LoginData, request: Request, db: Session = Depends(get_db)):
    clean_username = data.username.strip()
    client_ip = request.client.host if request.client else "127.0.0.1"

    user = db.query(models.User).filter(func.lower(models.User.username) == clean_username.lower()).first()
    if not user:
        save_login(db, clean_username, client_ip, "Web Client", "FAILED")
        raise HTTPException(401, f"No registered account found with username '{clean_username}'. Please sign up first.")

    if not verify_password(data.password, user.password):
        save_login(db, clean_username, client_ip, "Web Client", "FAILED")
        raise HTTPException(401, "Invalid password. Please check your credentials.")

    save_login(db, user.username, client_ip, "Web Client", "SUCCESS")
    logger.info(f"User login successful: {user.username}")

    return {
        "status": "success",
        "msg": "Login successful",
        "username": user.username,
        "user": {
            "id": user.id,
            "username": user.username,
            "full_name": user.full_name or user.username,
            "email": user.email,
            "phone": user.phone,
            "account_number": user.account_number,
            "upi_id": f"{user.username}@securepay",
            "balance": user.balance or 50000.0,
            "created_at": user.created_at.isoformat() if user.created_at else datetime.now().isoformat()
        }
    }

@app.get("/users")
def get_all_users(db: Session = Depends(get_db)):
    users = db.query(models.User).order_by(models.User.created_at.desc()).all()
    return {
        "status": "success",
        "count": len(users),
        "users": [
            {
                "id": u.id,
                "username": u.username,
                "full_name": u.full_name or u.username,
                "email": u.email or "N/A",
                "phone": u.phone or "N/A",
                "account_number": u.account_number or "N/A",
                "balance": u.balance or 50000.0,
                "created_at": u.created_at.isoformat() if u.created_at else None
            }
            for u in users
        ]
    }

@app.get("/user-profile/{username}")
def get_user_profile(username: str, db: Session = Depends(get_db)):
    clean_username = username.strip()
    user = db.query(models.User).filter(func.lower(models.User.username) == clean_username.lower()).first()
    if not user:
        raise HTTPException(404, f"User '{clean_username}' not found")
    return {
        "status": "success",
        "user": {
            "id": user.id,
            "username": user.username,
            "full_name": user.full_name or user.username,
            "email": user.email,
            "phone": user.phone,
            "account_number": user.account_number,
            "upi_id": f"{user.username}@securepay",
            "balance": user.balance or 50000.0,
            "created_at": user.created_at.isoformat() if user.created_at else None
        }
    }

@app.get("/dashboard/{username}")
def get_dashboard(username: str, db: Session = Depends(get_db)):
    txns = db.query(models.Transaction).filter(models.Transaction.username == username).order_by(models.Transaction.timestamp.desc()).all()
    
    total_txns = len(txns)
    fraud_alerts = sum(1 for t in txns if (t.fraud_flag or t.risk >= 70 or t.result == "BLOCK"))
    
    total_spent = sum(t.amount for t in txns if t.result in ["ALLOW", "SUCCESS", "VERIFY"])
    current_balance = max(0.0, 50000.0 - total_spent)

    recent = [
        {
            "id": t.id,
            "amount": t.amount,
            "merchant_name": t.merchant_name or "Digital Merchant",
            "location": t.location or "Online",
            "result": t.result,
            "risk": t.risk,
            "fraud_flag": t.fraud_flag,
            "reason": t.reason or "AI Checked",
            "timestamp": t.timestamp.isoformat() if t.timestamp else datetime.now().isoformat()
        }
        for t in txns[:6]
    ]

    return {
        "status": "success",
        "username": username,
        "balance": round(current_balance, 2),
        "transactions": total_txns,
        "fraud_alerts": fraud_alerts,
        "recent_transactions": recent
    }

@app.get("/transactions/{username}")
def get_transactions(username: str, db: Session = Depends(get_db)):
    txns = db.query(models.Transaction).filter(models.Transaction.username == username).order_by(models.Transaction.timestamp.desc()).all()
    return [
        {
            "id": t.id,
            "username": t.username,
            "amount": t.amount,
            "merchant_name": t.merchant_name or "Digital Merchant",
            "location": t.location or "Online",
            "frequency": t.frequency or 1,
            "result": t.result,
            "risk": t.risk,
            "fraud_flag": t.fraud_flag,
            "reason": t.reason or "AI Ensemble Scoring",
            "timestamp": t.timestamp.isoformat() if t.timestamp else datetime.now().isoformat()
        }
        for t in txns
    ]

@app.post("/generate-otp")
def generate_otp(data: GenerateOTPData, db: Session = Depends(get_db)):
    otp = str(random.randint(1000, 9999))
    save_otp(db, data.username, otp)
    return {"status": "success", "otp": otp, "msg": f"OTP generated successfully: {otp}"}

@app.post("/scan-payment")
async def scan_payment(
    username: str = Form(...),
    entered_amount: float = Form(...),
    gender: str = Form("M"),
    category: str = Form("shopping_pos"),
    location: str = Form("Mumbai"),
    frequency: int = Form(1),
    merchant_name: str = Form("Merchant Store"),
    device_id: str = Form("web-client"),
    qr_image: Optional[UploadFile] = File(None),
    qr_raw_data: Optional[str] = Form(None),
    request: Request = None,
    db: Session = Depends(get_db)
):
    image_bytes = None
    decoded = qr_raw_data

    if qr_image and hasattr(qr_image, "file"):
        try:
            image_bytes = await qr_image.read()
            if not decoded:
                decoded = decode_qr(image_bytes)
        except Exception as e:
            logger.warning(f"Error reading qr_image: {e}")

    qr_amount = entered_amount
    tampered = False

    if decoded:
        # Check standard UPI or custom formats (e.g. am=5000, amount=5000, amount:5000)
        try:
            import re
            m = re.search(r'(?:am|amount)[:=]([0-9.]+)', decoded, re.IGNORECASE)
            if m:
                qr_amount = float(m.group(1))
        except Exception as e:
            logger.warning(f"Error parsing qr_amount from decoded QR: {e}")

        if abs(qr_amount - entered_amount) > 0.01:
            tampered = True

    data_dict = {
        "amt": entered_amount,
        "qr_amount": qr_amount,
        "gender": gender,
        "category": category,
        "location": location,
        "frequency": frequency,
        "merchant_name": merchant_name,
        "device_id": device_id
    }

    t = predict_transaction(data_dict)
    c = predict_credit(data_dict)
    b = predict_behavior(entered_amount, frequency)
    qr_score = predict_qr_image(image_bytes) if image_bytes else (0.8 if tampered else 0.1)

    score, decision = combine_scores(t, c, b, qr_score)

    if tampered:
        score = max(score, 88.0)
        decision = "BLOCK"

    payment_id = str(uuid.uuid4())
    PENDING_PAYMENTS[payment_id] = {
        "username": username,
        "amt": entered_amount,
        "location": location,
        "frequency": frequency,
        "merchant_name": merchant_name,
        "device_id": device_id,
        "score": score,
        "decision": decision,
        "tampered": tampered,
        "client_host": request.client.host if (request and request.client) else "127.0.0.1"
    }

    risk_level = "Low" if score < 30 else ("Medium" if score < 70 else "High")

    return {
        "status": "success",
        "payment_id": payment_id,
        "score": score,
        "risk_level": risk_level,
        "decision": decision,
        "tampered": tampered,
        "qr_amount_detected": qr_amount,
        "entered_amount": entered_amount,
        "merchant_name": merchant_name,
        "debug_scores": {
            "transaction": round(t * 100, 1),
            "credit": round(c * 100, 1),
            "behavior": round(b * 100, 1),
            "qr_image": round(qr_score * 100, 1)
        }
    }

@app.post("/confirm-payment")
def confirm_payment(data: ConfirmData, db: Session = Depends(get_db)):
    pending = PENDING_PAYMENTS.get(data.payment_id)
    if not pending:
        raise HTTPException(404, "Payment session not found or expired")

    user = db.query(models.User).filter(models.User.username == data.username).first()
    if not user or not verify_password(data.password, user.password):
        raise HTTPException(401, "Invalid password")

    if pending["decision"] == "BLOCK":
        txn = {
            "username": pending["username"],
            "amount": pending["amt"],
            "location": pending["location"],
            "frequency": pending["frequency"],
            "result": "BLOCK",
            "risk": int(pending["score"]),
            "fraud_flag": True,
            "reason": "Tampered QR or High Fraud Risk",
            "merchant_name": pending["merchant_name"]
        }
        save_transaction(db, txn)
        raise HTTPException(403, "Transaction blocked due to high fraud risk")

    if pending["decision"] == "VERIFY":
        otp = str(random.randint(1000, 9999))
        save_otp(db, pending["username"], otp)
        PENDING_PAYMENTS[data.payment_id]["awaiting_otp"] = True
        return {
            "status": "verify",
            "msg": "OTP verification required",
            "otp": otp,
            "payment_id": data.payment_id,
            "risk_level": "Medium",
            "score": pending["score"]
        }

    # ALLOW Flow
    txn = {
        "username": pending["username"],
        "amount": pending["amt"],
        "location": pending["location"],
        "frequency": pending["frequency"],
        "result": "ALLOW",
        "risk": int(pending["score"]),
        "fraud_flag": False,
        "reason": "AI Approved (Low Risk)",
        "merchant_name": pending["merchant_name"]
    }
    save_transaction(db, txn)
    save_behavior(db, pending["username"], pending["amt"], pending["frequency"], pending["location"])
    save_device_log(db, pending["username"], pending["device_id"], pending["client_host"])

    del PENDING_PAYMENTS[data.payment_id]
    return {
        "status": "success",
        "msg": "Payment completed successfully",
        "score": pending["score"],
        "risk_level": "Low"
    }

@app.post("/verify-otp")
def verify_otp(data: OTPData, db: Session = Depends(get_db)):
    record = (
        db.query(models.OTPVerification)
        .filter(
            models.OTPVerification.username == data.username,
            models.OTPVerification.status == "PENDING"
        )
        .order_by(models.OTPVerification.created_at.desc())
        .first()
    )

    if not record:
        # Accept if matches or test OTP
        if data.otp in ["1234", "0000"]:
            return {"status": "verified", "msg": "OTP verified successfully"}
        raise HTTPException(404, "No pending OTP found for this user")

    if record.otp_code != data.otp:
        raise HTTPException(401, "Incorrect OTP code")

    record.status = "VERIFIED"
    db.commit()

    # If there is an awaiting pending payment, mark it complete
    for pid, p in list(PENDING_PAYMENTS.items()):
        if p.get("username") == data.username and p.get("awaiting_otp"):
            txn = {
                "username": p["username"],
                "amount": p["amt"],
                "location": p["location"],
                "frequency": p["frequency"],
                "result": "VERIFIED_ALLOW",
                "risk": int(p["score"]),
                "fraud_flag": False,
                "reason": "OTP Verified Success",
                "merchant_name": p["merchant_name"]
            }
            save_transaction(db, txn)
            save_behavior(db, p["username"], p["amt"], p["frequency"], p["location"])
            del PENDING_PAYMENTS[pid]
            break

    return {"status": "verified", "msg": "OTP verified successfully and payment completed"}

@app.post("/pay")
def direct_pay(data: PaymentData, request: Request, db: Session = Depends(get_db)):
    qr_amount = data.qr_amount if data.qr_amount is not None else data.amt
    tampered = abs(qr_amount - data.amt) > 0.01

    t = predict_transaction(data.dict())
    c = predict_credit(data.dict())
    b = predict_behavior(data.amt, data.frequency)
    qr = 0.8 if tampered else 0.1

    score, decision = combine_scores(t, c, b, qr)
    if tampered:
        score = max(score, 85.0)
        decision = "BLOCK"

    risk_level = "Low" if score < 30 else ("Medium" if score < 70 else "High")

    txn = {
        "username": data.username,
        "amount": data.amt,
        "location": data.location,
        "frequency": data.frequency,
        "result": decision,
        "risk": int(score),
        "fraud_flag": decision == "BLOCK",
        "reason": "Tampered Amount" if tampered else "AI Direct Pay Scoring",
        "merchant_name": data.merchant_name
    }

    save_transaction(db, txn)
    save_behavior(db, data.username, data.amt, data.frequency, data.location)
    save_device_log(db, data.username, data.device_id, request.client.host if request.client else "127.0.0.1")

    if decision == "VERIFY":
        otp = str(random.randint(1000, 9999))
        save_otp(db, data.username, otp)
        return {
            "status": "verify",
            "otp": otp,
            "decision": decision,
            "risk_level": risk_level,
            "score": score,
            "msg": "OTP verification required"
        }

    return {
        "status": "success" if decision == "ALLOW" else "blocked",
        "score": score,
        "risk_level": risk_level,
        "decision": decision,
        "msg": "Payment processed successfully" if decision == "ALLOW" else "Payment blocked due to fraud risk",
        "debug_scores": {
            "transaction": round(t * 100, 1),
            "credit": round(c * 100, 1),
            "behavior": round(b * 100, 1),
            "qr": round(qr * 100, 1)
        }
    }


# ==============================================================================
# SECURE ADMIN DATABASE API (Localhost Protected + JWT Bearer Auth)
# ==============================================================================

ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "admin1234")
ADMIN_SECRET_KEY = os.getenv("ADMIN_SECRET_KEY", "securepay_admin_jwt_secret_key_2026_capstone")

class AdminLoginRequest(BaseModel):
    password: str

def check_localhost_only(request: Request):
    """
    Security Rule 4: Restrict all admin endpoints to the local machine only.
    Prevents remote devices or APK running on a phone from reaching admin endpoints.
    """
    client_host = request.client.host if request.client else ""
    if client_host not in ("127.0.0.1", "localhost", "::1", "testclient"):
        logger.warning(f"🚫 Forbidden non-localhost admin attempt from IP: {client_host}")
        raise HTTPException(
            status_code=403,
            detail="Admin database panel is restricted to localhost (127.0.0.1) only. External access is forbidden."
        )

def create_admin_token() -> str:
    """Create a signed, tamper-proof bearer token with 2-hour expiration."""
    payload = {
        "sub": "securepay_admin",
        "role": "admin",
        "exp": int(time.time()) + 7200,
        "nonce": str(uuid.uuid4())
    }
    raw = base64.urlsafe_b64encode(json.dumps(payload).encode()).decode()
    sig = hmac.new(ADMIN_SECRET_KEY.encode(), raw.encode(), hashlib.sha256).hexdigest()
    return f"{raw}.{sig}"

def require_admin_auth(request: Request, authorization: Optional[str] = Header(None)):
    """Validates the Authorization Bearer token."""
    check_localhost_only(request)
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Admin Authorization Header")
    token = authorization.split(" ", 1)[1].strip()
    try:
        parts = token.split(".")
        if len(parts) != 2:
            raise HTTPException(status_code=401, detail="Malformed Admin Token")
        raw, sig = parts
        expected_sig = hmac.new(ADMIN_SECRET_KEY.encode(), raw.encode(), hashlib.sha256).hexdigest()
        if not hmac.compare_digest(sig, expected_sig):
            raise HTTPException(status_code=401, detail="Invalid token signature")
        payload = json.loads(base64.urlsafe_b64decode(raw.encode()).decode())
        if payload.get("exp", 0) < time.time():
            raise HTTPException(status_code=401, detail="Admin session expired. Please log in again.")
        return payload
    except HTTPException:
        raise
    except Exception as e:
        logger.warning(f"Token verification error: {e}")
        raise HTTPException(status_code=401, detail="Token verification failed")

@app.post("/admin/login")
def admin_login(data: AdminLoginRequest, request: Request):
    """
    Security Rule 2: Verifies admin password on the BACKEND only against .env.
    Issues a signed JWT token on success.
    """
    check_localhost_only(request)
    if not data.password:
        raise HTTPException(status_code=400, detail="Password is required")
    
    # Check against backend .env
    if data.password.strip() != ADMIN_PASSWORD.strip():
        logger.warning(f"Failed admin login attempt from {request.client.host if request.client else 'unknown'}")
        raise HTTPException(status_code=401, detail="Incorrect Admin Password")
    
    token = create_admin_token()
    logger.info("✅ Admin successfully authenticated via localhost")
    return {
        "success": True,
        "token": token,
        "expires_in": 7200,
        "message": "Admin authenticated successfully"
    }

@app.get("/admin/stats")
def get_admin_stats(
    request: Request,
    token_payload: dict = Depends(require_admin_auth),
    db: Session = Depends(get_db)
):
    """Returns database summary statistics for admin overview."""
    total_users = db.query(models.User).count()
    total_txns = db.query(models.Transaction).count()
    fraud_count = db.query(models.Transaction).filter(models.Transaction.fraud_flag == True).count()
    total_logins = db.query(models.LoginHistory).count()
    total_otps = db.query(models.OTPVerification).count()

    return {
        "total_users": total_users,
        "total_transactions": total_txns,
        "fraud_alerts_blocked": fraud_count,
        "total_login_logs": total_logins,
        "total_otp_logs": total_otps
    }

@app.get("/admin/table/{table_name}")
def get_admin_table_records(
    table_name: str,
    q: Optional[str] = None,
    limit: int = 100,
    request: Request = None,
    token_payload: dict = Depends(require_admin_auth),
    db: Session = Depends(get_db)
):
    """
    Rule 3: Fetch and search tables from MySQL database (users, transactions, fraud_alerts, login_history).
    """
    table_name = table_name.lower().strip()
    search = (q or "").lower().strip()

    if table_name == "users":
        query = db.query(models.User)
        if search:
            query = query.filter(
                (models.User.username.ilike(f"%{search}%")) |
                (models.User.full_name.ilike(f"%{search}%")) |
                (models.User.email.ilike(f"%{search}%")) |
                (models.User.phone.ilike(f"%{search}%"))
            )
        records = query.order_by(models.User.id.desc()).limit(limit).all()
        data = [
            {
                "id": u.id,
                "username": u.username,
                "full_name": u.full_name,
                "email": u.email,
                "phone": u.phone,
                "account_number": u.account_number,
                "balance": u.balance,
                "created_at": str(u.created_at) if u.created_at else None
            }
            for u in records
        ]

    elif table_name in ("transactions", "fraud_alerts"):
        query = db.query(models.Transaction)
        if table_name == "fraud_alerts":
            query = query.filter(models.Transaction.fraud_flag == True)
        if search:
            query = query.filter(
                (models.Transaction.username.ilike(f"%{search}%")) |
                (models.Transaction.result.ilike(f"%{search}%")) |
                (models.Transaction.merchant_name.ilike(f"%{search}%")) |
                (models.Transaction.reason.ilike(f"%{search}%"))
            )
        records = query.order_by(models.Transaction.id.desc()).limit(limit).all()
        data = [
            {
                "id": t.id,
                "username": t.username,
                "amount": t.amount,
                "location": t.location,
                "frequency": t.frequency,
                "result": t.result,
                "risk": t.risk,
                "fraud_flag": t.fraud_flag,
                "reason": t.reason,
                "merchant_name": t.merchant_name,
                "timestamp": str(t.timestamp) if t.timestamp else None
            }
            for t in records
        ]

    elif table_name in ("login_history", "logins"):
        query = db.query(models.LoginHistory)
        if search:
            query = query.filter(
                (models.LoginHistory.username.ilike(f"%{search}%")) |
                (models.LoginHistory.status.ilike(f"%{search}%")) |
                (models.LoginHistory.ip_address.ilike(f"%{search}%"))
            )
        records = query.order_by(models.LoginHistory.id.desc()).limit(limit).all()
        data = [
            {
                "id": l.id,
                "username": l.username,
                "status": l.status,
                "ip_address": l.ip_address,
                "device_info": l.device_info,
                "login_time": str(l.login_time) if l.login_time else None
            }
            for l in records
        ]

    elif table_name in ("otp_verification", "otp"):
        query = db.query(models.OTPVerification)
        if search:
            query = query.filter(
                (models.OTPVerification.username.ilike(f"%{search}%")) |
                (models.OTPVerification.status.ilike(f"%{search}%"))
            )
        records = query.order_by(models.OTPVerification.id.desc()).limit(limit).all()
        data = [
            {
                "id": o.id,
                "username": o.username,
                "otp_code": o.otp_code,
                "status": o.status,
                "created_at": str(o.created_at) if o.created_at else None
            }
            for o in records
        ]

    else:
        raise HTTPException(status_code=400, detail=f"Unsupported table: {table_name}")

    return {
        "table": table_name,
        "count": len(data),
        "records": data
    }

@app.delete("/admin/table/{table_name}/{record_id}")
def delete_admin_table_record(
    table_name: str,
    record_id: int,
    request: Request,
    token_payload: dict = Depends(require_admin_auth),
    db: Session = Depends(get_db)
):
    """
    Rule 3: Delete specific records from MySQL database.
    """
    table_name = table_name.lower().strip()

    try:
        if table_name == "users":
            target = db.query(models.User).filter(models.User.id == record_id).first()
            if not target:
                raise HTTPException(status_code=404, detail="User record not found")
            db.delete(target)

        elif table_name in ("transactions", "fraud_alerts"):
            target = db.query(models.Transaction).filter(models.Transaction.id == record_id).first()
            if not target:
                raise HTTPException(status_code=404, detail="Transaction record not found")
            db.delete(target)

        elif table_name in ("login_history", "logins"):
            target = db.query(models.LoginHistory).filter(models.LoginHistory.id == record_id).first()
            if not target:
                raise HTTPException(status_code=404, detail="Login history record not found")
            db.delete(target)

        elif table_name in ("otp_verification", "otp"):
            target = db.query(models.OTPVerification).filter(models.OTPVerification.id == record_id).first()
            if not target:
                raise HTTPException(status_code=404, detail="OTP record not found")
            db.delete(target)

        else:
            raise HTTPException(status_code=400, detail=f"Unsupported table: {table_name}")

        db.commit()
        logger.info(f"🗑️ Admin deleted record #{record_id} from table `{table_name}`")
        return {"success": True, "message": f"Successfully deleted record #{record_id} from {table_name}"}

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error deleting record #{record_id} from {table_name}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to delete record: {str(e)}")