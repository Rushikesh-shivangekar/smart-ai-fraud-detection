from sqlalchemy import Column, Integer, String, Float, Boolean, Text, TIMESTAMP
from sqlalchemy.sql import func

try:
    from .database import Base
except ImportError:
    from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String(100), unique=True, nullable=False, index=True)
    password = Column(String(255), nullable=False)
    full_name = Column(String(150), nullable=True)
    email = Column(String(150), nullable=True)
    phone = Column(String(20), nullable=True)
    account_number = Column(String(50), nullable=True)
    balance = Column(Float, default=50000.0)
    created_at = Column(TIMESTAMP, default=func.now())

class LoginHistory(Base):
    __tablename__ = "login_history"

    id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String(100), index=True)
    login_time = Column(TIMESTAMP, default=func.now())
    ip_address = Column(String(100), nullable=True)
    device_info = Column(String(255), nullable=True)
    status = Column(String(50))  # SUCCESS / FAILED / REGISTERED

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String(100), index=True)
    amount = Column(Float)
    location = Column(String(150), nullable=True)
    frequency = Column(Integer, default=1)
    result = Column(String(50))
    risk = Column(Integer)
    fraud_flag = Column(Boolean, default=False)
    reason = Column(Text, nullable=True)
    merchant_name = Column(String(200), nullable=True)
    timestamp = Column(TIMESTAMP, default=func.now())

class OTPVerification(Base):
    __tablename__ = "otp_verification"

    id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String(100), index=True)
    otp_code = Column(String(10))
    created_at = Column(TIMESTAMP, default=func.now())
    status = Column(String(50), default="PENDING")

class BehaviorLog(Base):
    __tablename__ = "behavior_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String(100), index=True)
    amount = Column(Float)
    frequency = Column(Integer, default=1)
    location = Column(String(150), nullable=True)
    timestamp = Column(TIMESTAMP, default=func.now())

class DeviceLog(Base):
    __tablename__ = "device_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String(100), index=True)
    device_id = Column(String(150), nullable=True)
    ip_address = Column(String(100), nullable=True)
    timestamp = Column(TIMESTAMP, default=func.now())