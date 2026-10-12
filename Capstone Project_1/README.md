# Smart AI Fraud Detection System for Digital & QR Payments
### Final Capstone Project

A comprehensive, production-ready AI Fraud Detection system for digital transactions and UPI/QR code payments. Combines a modern **React single-page application** with a **FastAPI backend**, **PostgreSQL database (with auto-SQLite fallback)**, and a **4-tier Machine Learning + Deep Learning ensemble**.

---

## 🌟 Key Capabilities & Features

1. **Multi-Model AI Scoring Ensemble**:
   * **Transaction Random Forest (30% weight)**: Detects deviations in spend amounts, demographic patterns, location anomalies, and merchant risk.
   * **Credit Risk Classifier (25% weight)**: Screens velocity, historical spend limits, and frequency outliers.
   * **Behavioral Anomaly Net (20% weight)**: Measures session speed, rapid device swaps, and out-of-character spending patterns.
   * **Deep Learning QR CNN (25% weight)**: Analyzes bitmap structure and payload integrity against spoofing.
   * **OpenCV QR Tamper Guard**: Compares embedded QR payment metadata against customer-entered amounts in real time.

2. **3-Tier Decision Matrix**:
   * **Score < 30 (Low Risk - ALLOW)**: Instant auto-approval and secure debit.
   * **Score 30 – 70 (Medium Risk - VERIFY)**: Dynamic step-up 4-digit OTP challenge.
   * **Score $\ge$ 70 or QR Tampered (High Risk - BLOCK)**: Immediate automated block with fraud alert logging.

3. **React Single-Page Application**:
   * **Dashboard**: Live wallet balance, transaction counter, and fraud alerts.
   * **Scan & Pay QR**: Drag-and-drop / camera QR upload, live risk gauge, 4-layer ensemble breakdown, and password confirmation.
   * **Pay Anyone**: Direct UPI and phone number transfer with live ML screening.
   * **OTP Verification**: 4-digit animated code verification modal.
   * **Security Audit Log**: Complete transaction log with search, filters, and timestamps.
   * **AI Threat Sandbox**: Interactive simulator with 4 preset cyber-attack scenarios.

---

## 🏗️ Architecture Diagram

```
+-------------------------------------------------------------+
|                 React Frontend (Port 5173)                  |
|    Dashboard | Scan QR | Pay Anyone | Audit Log | Sandbox   |
+------------------------------+------------------------------+
                               | HTTP / Multipart FormData
                               v
+-------------------------------------------------------------+
|                 FastAPI Gateway (Port 8000)                 |
|             CORS Middleware & Request Interceptors          |
+---------------+-----------------------------+---------------+
                |                             |
                v                             v
+-------------------------------+  +--------------------------+
|  PostgreSQL / SQLite Database |  | 4-Tier AI Threat Engine  |
|  - Users                      |  | 1. Transaction RF (30%)  |
|  - Transactions & Audits      |  | 2. Credit Risk (25%)     |
|  - Login History              |  | 3. Behavior Net (20%)    |
|  - OTP Verification Records   |  | 4. DL QR CNN (25%)       |
|  - Device & Behavior Logs     |  | 5. OpenCV Tamper Guard   |
+-------------------------------+  +--------------------------+
```

---

## 🚀 How to Run the Project

### Option 1: One-Click Master Launcher (Recommended)
Double-click:
```cmd
C:\Capstone\start_project.bat
```
*(Automatically starts both FastAPI on port 8000 and React on port 5173 in separate terminals).*

---

### Option 2: Run Backend & Frontend Separately

#### 1. Backend (FastAPI)
Double-click:
```cmd
C:\Capstone\Capstone Project\run_backend.bat
```
Or run from terminal:
```bash
cd "C:\Capstone\Capstone Project\backend"
"..\venv\Scripts\python.exe" -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```
* **Swagger API Documentation**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

#### 2. Frontend (React + Vite)
Double-click:
```cmd
C:\Capstone\run_frontend.bat
```
Or run from terminal:
```bash
cd "C:\Capstone\New_frontend"
npm run dev
```
* **Web UI**: [http://localhost:5173](http://localhost:5173)

---

## 🧪 Testing with Sample QR Codes

Ready-made test QR images are generated in `C:\Capstone\sample_qrs\`:
1. `1_normal_coffee_qr.png` — Legitimate coffee purchase (**Low Risk / Safe**).
2. `2_tampered_qr_attack.png` — Tampered QR attack: User types ₹500, but QR requests ₹5,000 (**High Risk / Blocked**).
3. `3_high_value_watch_qr.png` — Luxury purchase for ₹28,500 (**Medium Risk / OTP Required**).
4. `4_grocery_supermarket_qr.png` — Supermarket checkout (**Low Risk / Safe**).
