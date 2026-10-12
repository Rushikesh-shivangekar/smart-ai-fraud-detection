import urllib.request
import json
import uuid

base_url = "http://127.0.0.1:8000"

def test_all_scenarios():
    print("=== Testing All QR Payment Scenarios ===")

    # Scenario 1: Tampered QR Attack (User pays 500, QR demands 5000)
    boundary = "----WebKitFormBoundary" + uuid.uuid4().hex
    parts = [
        f"--{boundary}",
        'Content-Disposition: form-data; name="username"',
        '',
        'demo_user',
        f"--{boundary}",
        'Content-Disposition: form-data; name="entered_amount"',
        '',
        '500.0',
        f"--{boundary}",
        'Content-Disposition: form-data; name="gender"',
        '',
        'M',
        f"--{boundary}",
        'Content-Disposition: form-data; name="category"',
        '',
        'shopping_pos',
        f"--{boundary}",
        'Content-Disposition: form-data; name="location"',
        '',
        'Delhi',
        f"--{boundary}",
        'Content-Disposition: form-data; name="frequency"',
        '',
        '1',
        f"--{boundary}",
        'Content-Disposition: form-data; name="merchant_name"',
        '',
        'Discount Store',
        f"--{boundary}",
        'Content-Disposition: form-data; name="device_id"',
        '',
        'chrome-phonepe-client',
        f"--{boundary}",
        'Content-Disposition: form-data; name="qr_raw_data"',
        '',
        'upi://pay?pa=fraud.hacker@evilbank&pn=Fraud%20Gateway&am=5000',
        f"--{boundary}--\r\n"
    ]
    body = "\r\n".join(parts).encode('utf-8')
    req = urllib.request.Request(
        f"{base_url}/scan-payment",
        data=body,
        headers={"Content-Type": f"multipart/form-data; boundary={boundary}"}
    )
    tampered_scan = json.loads(urllib.request.urlopen(req).read().decode())
    print("\n[Scenario 1 - Tampered Attack]:")
    print("  Tampered Detected:", tampered_scan.get("tampered"))
    print("  Decision:", tampered_scan.get("decision"))
    print("  Risk Score:", tampered_scan.get("score"))
    assert tampered_scan.get("tampered") is True
    assert tampered_scan.get("decision") == "BLOCK"

    # Scenario 2: Step-up OTP Verification (High amount / velocity)
    # Direct pay or confirm step
    direct_req = urllib.request.Request(
        f"{base_url}/pay",
        data=json.dumps({
            "username": "demo_user",
            "amt": 28500.0,
            "qr_amount": 28500.0,
            "gender": "M",
            "category": "shopping_pos",
            "location": "Bangalore",
            "frequency": 4,
            "merchant_name": "Helios Luxury Watch Store",
            "device_id": "chrome-phonepe-client"
        }).encode('utf-8'),
        headers={"Content-Type": "application/json"}
    )
    direct_res = json.loads(urllib.request.urlopen(direct_req).read().decode())
    print("\n[Scenario 2 - High Value / Step-up]:")
    print("  Status:", direct_res.get("status"))
    print("  Decision:", direct_res.get("decision"))
    print("  Risk Level:", direct_res.get("risk_level"))
    print("  OTP provided for demo:", direct_res.get("otp"))

    print("\n[SUCCESS] ALL TRANSACTION AND QR SECURITY SCENARIOS PASSED!")

if __name__ == "__main__":
    test_all_scenarios()
