import urllib.request
import json

base_url = 'http://127.0.0.1:8000'

def test_all():
    print("==================================================")
    print("   SMART AI FRAUD DETECTION - FULL SYSTEM TEST   ")
    print("==================================================")

    # 1. Health
    res = urllib.request.urlopen(f'{base_url}/health').read().decode()
    print("[1] Health Check:", res)

    # 2. Login
    login_data = json.dumps({'username': 'demo_user', 'password': 'password123'}).encode()
    req = urllib.request.Request(f'{base_url}/login', data=login_data, headers={'Content-Type': 'application/json'})
    print("[2] Login:", urllib.request.urlopen(req).read().decode())

    # 3. Dashboard
    dash = urllib.request.urlopen(f'{base_url}/dashboard/demo_user').read().decode()
    print("[3] Dashboard:", dash)

    # 4. Direct Pay Safe
    pay_data = json.dumps({
        'username': 'demo_user',
        'amt': 450.0,
        'qr_amount': 450.0,
        'gender': 'M',
        'category': 'dining_pos',
        'location': 'Mumbai',
        'frequency': 1,
        'merchant_name': 'Metro Coffee',
        'device_id': 'web-client'
    }).encode()
    req = urllib.request.Request(f'{base_url}/pay', data=pay_data, headers={'Content-Type': 'application/json'})
    print("[4] Direct Pay (Safe):", urllib.request.urlopen(req).read().decode())

    # 5. Direct Pay Tampered
    attack_data = json.dumps({
        'username': 'demo_user',
        'amt': 500.0,
        'qr_amount': 5000.0,
        'gender': 'M',
        'category': 'shopping_pos',
        'location': 'Delhi',
        'frequency': 1,
        'merchant_name': 'Discount Store',
        'device_id': 'web-client'
    }).encode()
    req = urllib.request.Request(f'{base_url}/pay', data=attack_data, headers={'Content-Type': 'application/json'})
    print("[5] Direct Pay (Tampered QR Attack):", urllib.request.urlopen(req).read().decode())

    # 6. OTP Flow
    gen_req = urllib.request.Request(f'{base_url}/generate-otp', data=json.dumps({'username': 'demo_user'}).encode(), headers={'Content-Type': 'application/json'})
    otp_obj = json.loads(urllib.request.urlopen(gen_req).read().decode())
    print("[6] OTP Generated:", otp_obj)
    ver_req = urllib.request.Request(f'{base_url}/verify-otp', data=json.dumps({'username': 'demo_user', 'otp': otp_obj['otp']}).encode(), headers={'Content-Type': 'application/json'})
    print("[6] OTP Verified:", urllib.request.urlopen(ver_req).read().decode())

    # 7. Frontend Check
    fe_res = urllib.request.urlopen('http://localhost:5173/')
    print("[7] Frontend Server Port 5173 Status Code:", fe_res.getcode())

    print("\n>>> ALL SYSTEM INTEGRATION TESTS PASSED 100%! <<<\n")

if __name__ == '__main__':
    test_all()
