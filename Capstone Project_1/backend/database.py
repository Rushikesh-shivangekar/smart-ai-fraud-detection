import os
import logging
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base

logger = logging.getLogger("fraud_api.database")

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SQLITE_PATH = os.path.join(BASE_DIR, "fraud_system.db").replace("\\", "/")

# Load .env if present
env_file = os.path.join(BASE_DIR, ".env")
if os.path.exists(env_file):
    try:
        with open(env_file, "r") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    key, val = line.split("=", 1)
                    os.environ.setdefault(key.strip(), val.strip())
    except Exception as e:
        logger.warning(f"Error reading .env: {e}")

DB_URL = os.getenv(
    "DATABASE_URL",
    "mysql+pymysql://root:tiger@localhost:3306/fraud_system"
)

Base = declarative_base()

def get_engine():
    global DB_URL
    # If MySQL, check if database exists, create if needed
    if "mysql" in DB_URL:
        try:
            # Try connecting to MySQL server root to ensure database exists
            import pymysql
            # Parse user, password, host, port
            # format: mysql+pymysql://user:password@host:port/dbname
            import re
            m = re.search(r'mysql(?:\+pymysql)?://([^:]+):([^@]+)@([^:/]+)(?::(\d+))?/(.+)', DB_URL)
            if m:
                db_user, db_pass, db_host, db_port, db_name = m.groups()
                db_port = int(db_port) if db_port else 3306
                conn = pymysql.connect(
                    host=db_host,
                    user=db_user,
                    password=db_pass,
                    port=db_port
                )
                with conn.cursor() as cur:
                    cur.execute(f"CREATE DATABASE IF NOT EXISTS `{db_name}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;")
                conn.commit()
                conn.close()
                logger.info(f"Verified MySQL database `{db_name}` on {db_host}:{db_port}")
        except Exception as e:
            logger.warning(f"Pre-check for MySQL database creation warning: {e}")

    try:
        if "mysql" in DB_URL:
            eng = create_engine(
                DB_URL,
                pool_pre_ping=True,
                pool_recycle=3600,
                connect_args={"connect_timeout": 5}
            )
        elif DB_URL.startswith("postgresql"):
            eng = create_engine(
                DB_URL,
                pool_pre_ping=True,
                connect_args={"connect_timeout": 5}
            )
        else:
            eng = create_engine(DB_URL, connect_args={"check_same_thread": False})
        
        with eng.connect() as conn:
            logger.info(f"Connected to database successfully: {DB_URL.split('@')[-1] if '@' in DB_URL else DB_URL}")
        return eng
    except Exception as e:
        logger.warning(f"Could not connect to configured DB ({e}). Falling back to SQLite database at {SQLITE_PATH}.")
        DB_URL = f"sqlite:///{SQLITE_PATH}"
        return create_engine(DB_URL, connect_args={"check_same_thread": False})

engine = get_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def seed_default_users(db):
    import hashlib
    import models
    try:
        demo_exists = db.query(models.User).filter(models.User.username == "demo_user").first()
        if not demo_exists:
            pw_hash = hashlib.sha256("password123".encode()).hexdigest()
            demo_user = models.User(
                username="demo_user",
                password=pw_hash,
                full_name="Demo User",
                email="demo@securepay.ai",
                phone="+91 9876543210",
                account_number="AC88392019",
                balance=50000.0
            )
            db.add(demo_user)

        aditi_exists = db.query(models.User).filter(models.User.username == "aditi").first()
        if not aditi_exists:
            pw_hash = hashlib.sha256("aditi1234".encode()).hexdigest()
            aditi_user = models.User(
                username="aditi",
                password=pw_hash,
                full_name="Aditi Sharma",
                email="aditi@securepay.ai",
                phone="+91 9123456780",
                account_number="AC99482710",
                balance=50000.0
            )
            db.add(aditi_user)

        rushi_exists = db.query(models.User).filter(models.User.username == "rushi_user").first()
        if not rushi_exists:
            pw_hash = hashlib.sha256("rushi123".encode()).hexdigest()
            rushi_user = models.User(
                username="rushi_user",
                password=pw_hash,
                full_name="Rushi Patel",
                email="rushi@securepay.ai",
                phone="+91 9988776655",
                account_number="AC77281903",
                balance=50000.0
            )
            db.add(rushi_user)

        db.commit()
        logger.info("Default seed users verified in database.")
    except Exception as e:
        db.rollback()
        logger.warning(f"Seed users notice: {e}")

def init_db():
    import models
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables created / verified.")
    db = SessionLocal()
    try:
        seed_default_users(db)
    finally:
        db.close()

init_db()
