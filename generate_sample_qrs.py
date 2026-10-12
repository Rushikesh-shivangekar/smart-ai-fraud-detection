import qrcode
import os

out_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "sample_qrs")
os.makedirs(out_dir, exist_ok=True)

samples = [
    {
        "filename": "1_normal_coffee_qr.png",
        "data": "upi://pay?pa=starbucks@hdfc&pn=Starbucks%20Coffee&am=250&mc=5499",
        "desc": "Legitimate Starbucks Coffee QR (Amount: 250)"
    },
    {
        "filename": "2_tampered_qr_attack.png",
        "data": "upi://pay?pa=malicious_proxy@axis&pn=Discount%20Store&amount:5000",
        "desc": "Tampered QR Code: Label says 500 but payload demands 5000"
    },
    {
        "filename": "3_high_value_watch_qr.png",
        "data": "upi://pay?pa=helios_luxury@icici&pn=Helios%20Watch%20Boutique&am=28500",
        "desc": "High Value Luxury Watch Purchase (Amount: 28,500 - Triggers OTP)"
    },
    {
        "filename": "4_grocery_supermarket_qr.png",
        "data": "upi://pay?pa=dmart@sbi&pn=DMart%20Hypermarket&am=1450",
        "desc": "Daily Grocery Supermarket QR (Amount: 1,450)"
    }
]

for s in samples:
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=10,
        border=4,
    )
    qr.add_data(s["data"])
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    path = os.path.join(out_dir, s["filename"])
    img.save(path)
    print(f"Generated QR: {path} -> {s['desc']}")

print(f"All sample QR code images generated in {out_dir}")
