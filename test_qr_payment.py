import urllib.request
import json
import uuid

base_url = "http://127.0.0.1:8000"

def test_qr_payment_flow():
    print("=== Testing QR Payment Flow ===")
    
    # 1. Safe QR Scan for 800 INR
    boundary = "----WebKitFormBoundary" + uuid.uuid4().hex
    parts = [
        f"--{boundary}",
        'Content-Disposition: form-data; name="username"',
        '',
        'demo_user',
        f"--{boundary}",
        'Content-Disposition: form-data; name="entered_amount"',
        '',
        '800.0',
        f"--{boundary}",
        'Content-Disposition: form-data; name="gender"',
        '',
        'M',
        f"--{boundary}",
        'Content-Disposition: form-data; name="category"',
        '',
        'dining_pos',
        f"--{boundary}",
        'Content-Disposition: form-data; name="location"',
        '',
        'Mumbai',
        f"--{boundary}",
        'Content-Disposition: form-data; name="frequency"',
        '',
        '1',
        f"--{boundary}",
        'Content-Disposition: form-data; name="merchant_name"',
        '',
        'Metro Coffee',
        f"--{boundary}",
        'Content-Disposition: form-data; name="device_id"',
        '',
        'chrome-phonepe-client',
        f"--{boundary}",
        'Content-Disposition: form-data; name="qr_raw_data"',
        '',
        'upi://pay?pa=metro.coffee@ybl&pn=Metro%20Coffee&am=800',
        f"--{boundary}--\r\n"
    ]
    body = "\r\n".join(parts).encode('utf-8')
    req = urllib.request.Request(
        f"{base_url}/scan-payment",
        data=body,
        headers={"Content-Type": f"multipart/form-data; boundary={boundary}"}
    )
    scan_res = json.loads(urllib.request.urlopen(req).read().decode())
    print("[1] Scan result:", scan_res)
    assert scan_res["status"] == "success"
    assert scan_res["decision"] in ["ALLOW", "VERIFY"]

    # 2. Confirm Payment with Password / UPI PIN
    confirm_body = json.dumps({
        "payment_id": scan_res["payment_id"],
        "username": "demo_user",
        "password": "password123"
    }).encode('utf-8')
    req_confirm = urllib.request.Request(
        f"{base_url}/confirm-payment",
        data=confirm_body,
        headers={"Content-Type": "application/json"}
    )
    confirm_res = json.loads(urllib.request.urlopen(req_confirm).read().decode())
    print("[2] Confirm result:", confirm_res)

    # 3. If OTP required, verify OTP
    if confirm_res.get("status") == "verify":
        otp = confirm_res["otp"]
        verify_body = json.dumps({
            "username": "demo_user",
            "otp": otp
        }).encode('utf-8')
        req_verify = urllib.request.Request(
            f"{base_url}/verify-otp",
            data=verify_body,
            headers={"Content-Type": "application/json"}
        )
        verify_res = json.loads(urllib.request.urlopen(req_verify).read().decode())
        print("[3] OTP Verify result:", verify_res)

    # 4. Check updated Dashboard
    dash_res = json.loads(urllib.request.urlopen(f"{base_url}/dashboard/demo_user").read().decode())
    print("[4] Dashboard after QR payment:")
    print("  Balance:", dash_res["balance"])
    print("  Transactions Count:", dash_res["transactions"])
    print("  Recent:", dash_res["recent_transactions"][:2])

    print("\n[SUCCESS] QR PAYMENT TEST COMPLETED SUCCESSFULLY!")

if __name__ == "__main__":
    test_qr_payment_flow()
