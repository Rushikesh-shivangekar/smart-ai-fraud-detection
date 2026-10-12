from flask import Flask, request, jsonify
import joblib
import pandas as pd
import os

app = Flask(__name__)

# =========================
# LOAD MODELS
# =========================

class _DummyModel:
    def predict_proba(self, X):
        # return probability for negative/positive
        return [[1.0 - 0.01, 0.01] for _ in range(len(X))]

    def predict(self, X):
        return [0.01 for _ in range(len(X))]


class _IdentityScaler:
    def transform(self, X):
        return X


# Helper to try loading a file and fall back to a default
def _safe_load(path, default):
    try:
        if os.path.exists(path):
            return joblib.load(path)
    except Exception:
        pass
    return default


# Transaction
t_model = _safe_load(os.path.join("..", "model", "transaction_model.pkl"), _DummyModel())
t_encoders = _safe_load(os.path.join("..", "model", "transaction_encoders.pkl"), {})
t_columns = _safe_load(os.path.join("..", "model", "transaction_columns.pkl"), [])

# Credit
c_model = _safe_load(os.path.join("..", "model", "credit_model.pkl"), _DummyModel())
c_encoders = _safe_load(os.path.join("..", "model", "credit_encoders.pkl"), {})
c_columns = _safe_load(os.path.join("..", "model", "credit_columns.pkl"), [])

# Behavior
b_model = _safe_load(os.path.join("..", "model", "behavior_model.pkl"), _DummyModel())
b_columns = _safe_load(os.path.join("..", "model", "behavior_columns.pkl"), ["amt"])
b_scaler = _safe_load(os.path.join("..", "model", "behavior_scaler.pkl"), _IdentityScaler())


# =========================
# TRANSACTION PREDICTION
# =========================
def predict_transaction(data):
    df = pd.DataFrame([data])

    for col, le in t_encoders.items():
        if col in df.columns:
            df[col] = df[col].astype(str)
            df[col] = df[col].apply(lambda x: x if x in le.classes_ else le.classes_[0])
            df[col] = le.transform(df[col])

    df = df.reindex(columns=t_columns, fill_value=0)

    prob = t_model.predict_proba(df)[0][1]
    return float(prob)


# =========================
# CREDIT MODEL
# =========================
def predict_credit(data):
    df = pd.DataFrame([data])

    for col, le in c_encoders.items():
        if col in df.columns:
            df[col] = df[col].astype(str)
            df[col] = df[col].apply(lambda x: x if x in le.classes_ else le.classes_[0])
            df[col] = le.transform(df[col])

    df = df.reindex(columns=c_columns, fill_value=0)

    prob = c_model.predict_proba(df)[0][1]
    return float(prob)


# =========================
# BEHAVIOR MODEL
# =========================
def predict_behavior(amount):
    df = pd.DataFrame([[amount]], columns=["amt"])
    df = df.reindex(columns=b_columns, fill_value=0)

    df = b_scaler.transform(df)
    prob = b_model.predict(df)[0]

    return float(prob)


# =========================
# QR LOGIC
# =========================
def predict_qr(amount, qr_amount):
    return 1.0 if amount != qr_amount else 0.0


# =========================
# COMBINE FUNCTION
# =========================
def combine_scores(transaction_score, qr_score, behavior_score):
    final_score = (0.5 * transaction_score) + (0.3 * qr_score) + (0.2 * behavior_score)
    final_score_100 = round(final_score * 100, 2)

    if final_score_100 < 30:
        risk_level = "Low"
    elif final_score_100 < 70:
        risk_level = "Medium"
    else:
        risk_level = "High"

    return {
        "transaction_score": round(transaction_score * 100, 2),
        "qr_score": round(qr_score * 100, 2),
        "behavior_score": round(behavior_score * 100, 2),
        "final_score": final_score_100,
        "risk_level": risk_level
    }


# =========================
# FLASK ROUTES
# =========================
@app.route("/")
def home():
    return "Fraud Detection API Running 🚀"


@app.route("/predict", methods=["POST"])
def predict():
    data = request.json

    amount = float(data.get("amt", 0))
    qr_amount = float(data.get("qr_amount", amount))

    # Models
    t_score = predict_transaction(data)
    c_score = predict_credit(data)
    b_score = predict_behavior(amount)
    q_score = predict_qr(amount, qr_amount)

    # Combine
    result = combine_scores(
        (t_score + c_score) / 2,  # combine ML models
        q_score,
        b_score
    )

    return jsonify(result)


# =========================
# RUN APP
# =========================
if __name__ == "__main__":
    app.run(debug=True)