"""
Admin CLI Tool: View Registered Users in MySQL
==============================================
Run: python view_users.py or double-click view_users.bat
"""

import os
import sys

# Try importing pymysql, with helpful instructions if missing
try:
    import pymysql
except ImportError:
    print("\n[ERROR] 'pymysql' package is missing.")
    print("Please install it by running: pip install pymysql")
    input("\nPress Enter to exit...")
    sys.exit(1)

def show_users():
    try:
        conn = pymysql.connect(
            host="localhost",
            user="root",
            password="tiger",
            database="fraud_system",
            cursorclass=pymysql.cursors.DictCursor
        )
        with conn.cursor() as cur:
            cur.execute("SELECT id, username, password, full_name, email, phone, account_number, balance, created_at FROM users ORDER BY id ASC;")
            users = cur.fetchall()

            print("=" * 110)
            print(f"  ADMIN DATABASE VIEW: MySQL Table `fraud_system.users`  (Total: {len(users)} registered users)")
            print("=" * 110)
            print(f"{'ID':<5} | {'Username':<15} | {'Full Name':<18} | {'Email':<25} | {'Phone':<15} | {'Balance (INR)':<12}")
            print("-" * 110)

            for u in users:
                bal_str = f"Rs. {u['balance']:,.2f}" if u['balance'] else "Rs. 0.00"
                print(f"{u['id']:<5} | {u['username']:<15} | {str(u['full_name'] or ''):<18} | {str(u['email'] or 'N/A'):<25} | {str(u['phone'] or 'N/A'):<15} | {bal_str:<12}")

            print("=" * 110)
            print("\n* Passwords in MySQL are stored as SHA-256 cryptographic hashes for cybersecurity compliance.")
            print("  Example hash for 'password123': ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f\n")

            cur.execute("SELECT id, username, status, ip_address, login_time FROM login_history ORDER BY id DESC LIMIT 6;")
            history = cur.fetchall()
            print("=" * 110)
            print("  RECENT LOGIN & REGISTRATION ACTIVITY AUDIT LOG (Table `login_history`):")
            print("=" * 110)
            print(f"{'Log ID':<8} | {'Username':<15} | {'Status':<14} | {'IP Address':<15} | {'Timestamp'}")
            print("-" * 110)
            for h in history:
                print(f"{h['id']:<8} | {h['username']:<15} | {h['status']:<14} | {h['ip_address']:<15} | {h['login_time']}")
            print("=" * 110)

        conn.close()
    except Exception as e:
        print(f"\n[Error connecting to MySQL]: {e}")
        print("Please check that your MySQL service is running and password is 'tiger'.")

if __name__ == "__main__":
    show_users()
    print("\n------------------------------------------------------------")
    input("Press Enter to close this window...")
