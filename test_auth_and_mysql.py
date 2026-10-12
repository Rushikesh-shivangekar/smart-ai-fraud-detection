"""
Automated Test for Authentication & MySQL Database Persistence
==============================================================
Tests:
1. MySQL database connection (root:tiger@localhost:3306/fraud_system)
2. Table schemas for `users` and `login_history`
3. Registration of new user via FastAPI `/register`
4. Login with registered user via FastAPI `/login`
5. Verification of record persistence inside MySQL
"""

import pymysql
import urllib.request
import json
import uuid

API_BASE = "http://127.0.0.1:8000"
MYSQL_HOST = "localhost"
MYSQL_USER = "root"
MYSQL_PASS = "tiger"
MYSQL_DB = "fraud_system"

def test_mysql_tables():
    print("\n[1/4] Checking MySQL Database & Tables...")
    conn = pymysql.connect(
        host=MYSQL_HOST,
        user=MYSQL_USER,
        password=MYSQL_PASS,
        database=MYSQL_DB,
        cursorclass=pymysql.cursors.DictCursor
    )
    with conn.cursor() as cur:
        cur.execute("SHOW TABLES;")
        tables = [list(r.values())[0] for r in cur.fetchall()]
        print(f"  [OK] Tables present in `{MYSQL_DB}`: {tables}")
        assert "users" in tables, "Table `users` not found in MySQL"
        assert "login_history" in tables, "Table `login_history` not found in MySQL"

        cur.execute("DESCRIBE users;")
        cols = [r["Field"] for r in cur.fetchall()]
        print(f"  [OK] Columns in `users` table: {cols}")
    conn.close()

def test_api_registration_and_login():
    print("\n[2/4] Testing API Registration Endpoint (/register)...")
    unique_user = f"user_{uuid.uuid4().hex[:6]}"
    user_data = {
        "username": unique_user,
        "password": "SecurePassword123!",
        "full_name": "Capstone Demo Student",
        "email": f"{unique_user}@university.edu",
        "phone": "+91 9900112233"
    }

    req = urllib.request.Request(
        f"{API_BASE}/register",
        data=json.dumps(user_data).encode("utf-8"),
        headers={"Content-Type": "application/json"}
    )
    res = json.loads(urllib.request.urlopen(req).read().decode("utf-8"))
    print(f"  [OK] Registered user '{unique_user}': {res.get('msg')}")
    assert res.get("status") == "success"

    print("\n[3/4] Testing API Login Endpoint (/login)...")
    login_req = urllib.request.Request(
        f"{API_BASE}/login",
        data=json.dumps({"username": unique_user, "password": "SecurePassword123!"}).encode("utf-8"),
        headers={"Content-Type": "application/json"}
    )
    login_res = json.loads(urllib.request.urlopen(login_req).read().decode("utf-8"))
    print(f"  [OK] Logged in as '{unique_user}': {login_res.get('msg')}")
    print(f"  [OK] User UPI ID: {login_res['user']['upi_id']}")
    assert login_res.get("status") == "success"

    print("\n[4/4] Verifying MySQL Database Record...")
    conn = pymysql.connect(
        host=MYSQL_HOST,
        user=MYSQL_USER,
        password=MYSQL_PASS,
        database=MYSQL_DB,
        cursorclass=pymysql.cursors.DictCursor
    )
    with conn.cursor() as cur:
        cur.execute("SELECT id, username, full_name, email, phone, account_number, balance FROM users WHERE username = %s;", (unique_user,))
        row = cur.fetchone()
        print(f"  [OK] Stored MySQL Record: {row}")
        assert row is not None
        assert row["username"] == unique_user

        cur.execute("SELECT id, username, status, ip_address FROM login_history WHERE username = %s;", (unique_user,))
        history = cur.fetchall()
        print(f"  [OK] Login History Events: {history}")
        assert len(history) >= 2
    conn.close()

    print("\n" + "="*60)
    print("  ALL AUTH & MYSQL DATABASE TESTS PASSED SUCCESSFULLY!")
    print("="*60)

if __name__ == "__main__":
    test_mysql_tables()
    test_api_registration_and_login()
