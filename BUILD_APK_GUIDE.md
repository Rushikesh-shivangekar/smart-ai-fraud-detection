# SecurePay UPI - Standalone Android APK Guide

## 📱 Standalone APK (100% Complete Project On-Device)

The updated APK binary is ready and contains the **Built-in Standalone Full-Stack Engine**. Both frontend and backend logic (AI fraud detection, QR tamper scanning, authentication, transaction ledger, OTP 2FA, and admin database panel) now run **100% on your Android phone without needing any external server running**!

---

## 🚀 Ready-to-Install APK File Location

Your newly compiled APK is saved in two easy locations:
1. **Direct Project Root:**
   👉 [`c:\New_Capstone\SecurePay-Standalone.apk`](file:///c:/New_Capstone/SecurePay-Standalone.apk)
2. **Android Gradle Output Directory:**
   👉 [`c:\New_Capstone\New_frontend\android\app\build\outputs\apk\debug\app-debug.apk`](file:///c:/New_Capstone/New_frontend/android/app/build/outputs/apk/debug/app-debug.apk)

---

## 📲 How to Install on Your Android Phone

### Method 1: USB Cable Transfer (Fastest & Simplest)
1. Connect your Android phone to your laptop using a USB cable.
2. In the phone notification, choose **"File Transfer / Android Auto"**.
3. Copy [`SecurePay-Standalone.apk`](file:///c:/New_Capstone/SecurePay-Standalone.apk) into your phone's **Download** folder.
4. On your phone, open the **Files** app ➔ **Downloads** ➔ tap `SecurePay-Standalone.apk` ➔ tap **Install** (or Update).

### Method 2: Google Drive / WhatsApp / Telegram
1. Upload `SecurePay-Standalone.apk` to your Google Drive or send it to yourself on WhatsApp / Telegram.
2. Download and tap to install on your Android phone.

### Method 3: Via ADB (If Phone is Connected with USB Debugging)
In your terminal, run:
```cmd
adb install -r "c:\New_Capstone\SecurePay-Standalone.apk"
```

---

## 🔑 Login & Testing Credentials (Works 100% Offline)

| Role | Username / ID | Password / PIN | Description |
| :--- | :--- | :--- | :--- |
| **Demo User** | `demo_user` | `password123` | Pre-configured user with ₹50,000 balance & sample transactions |
| **New User** | *(Any username)* | *(Any password)* | Tap **Register New User** tab to sign up any custom name |
| **Admin Database** | *(From top menu)* | `admin1234` | Full database management panel (CRUD, stats, user tables) |

---

## 🛡️ What's Built-In to the Standalone APK

1. **User Authentication & Profile:**
   - Instant sign in & registration with persistent storage on the device.
   - Dynamic balance calculation (starts at ₹50,000.00).

2. **AI Fraud Detection & Tamper Shield:**
   - **QR Code Scanning:** Detects QR amount tampering (if QR payload != entered amount ➔ **Immediate BLOCK & Risk Score ~94%**).
   - **High-Value Transfers:** Transfers above ₹20,000 trigger step-up **2FA OTP verification**.
   - **Suspicious Keywords:** Flagged VPAs or suspicious merchant keywords are blocked.

3. **OTP 2FA Verification:**
   - Automatically generates real 4-digit verification codes. Demo codes `1234` or `0000` also work for instant presentation.

4. **Live Transaction History:**
   - Shows recent transactions with AI decision badges (`ALLOW`, `VERIFY`, `BLOCK`).
   - Generates downloadable receipts.

5. **AI Fraud Simulator:**
   - Run 6 interactive fraud attack scenarios (Tampered QR, Sudden Velocity Spike, Untrusted Merchant, Rapid Geolocation Anomaly, etc.) to showcase the AI shield in action.

6. **Admin Database Panel:**
   - Tap the top-right Admin button and enter `admin1234`.
   - Inspect users, transactions, fraud alerts, and login history.

---

## 🌐 Optional: Connecting to Laptop Backend (Live IP Mode)

If you ever want to connect the APK to your laptop's live Python FastAPI backend:
1. Ensure both your laptop and phone are connected to the **same Wi-Fi network**.
2. Find your laptop IP: `ipconfig` (e.g. `192.168.1.15`).
3. Start the backend with:
   ```cmd
   python "Capstone Project_1\backend\main.py"
   ```
4. In the APK, tap the connection pill or Settings button (⚙️) on the login screen.
5. Select **"🌐 Live Backend IP"** and enter `http://<your-laptop-ip>:8000`.
