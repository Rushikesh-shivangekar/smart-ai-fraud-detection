import random
import models

def save_user(db, username, password, full_name=None, email=None, phone=None, account_number=None, balance=50000.0):
    user = models.User(
        username=username.strip(),
        password=password,
        full_name=full_name.strip() if full_name else None,
        email=email.strip() if email else None,
        phone=phone.strip() if phone else None,
        account_number=account_number or f"AC{random.randint(10000000, 99999999)}",
        balance=balance
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def save_login(db, username, ip, device, status):
    log = models.LoginHistory(
        username=username,
        ip_address=ip,
        device_info=device,
        status=status
    )
    db.add(log)
    db.commit()
    return log

def save_transaction(db, data):
    txn = models.Transaction(**data)
    db.add(txn)
    db.commit()
    db.refresh(txn)
    return txn

def save_otp(db, username, otp):
    record = models.OTPVerification(
        username=username,
        otp_code=otp,
        status="PENDING"
    )
    db.add(record)
    db.commit()
    return record

def save_behavior(db, username, amount, frequency, location):
    record = models.BehaviorLog(
        username=username,
        amount=amount,
        frequency=frequency,
        location=location
    )
    db.add(record)
    db.commit()
    return record

def save_device_log(db, username, device_id, ip):
    record = models.DeviceLog(
        username=username,
        device_id=device_id,
        ip_address=ip
    )
    db.add(record)
    db.commit()
    return record