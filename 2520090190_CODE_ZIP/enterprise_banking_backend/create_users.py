from passlib.context import CryptContext

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)

passwords = {
    "sumanjali@example.com": "Sumanjali@123",
    "snigdha@example.com": "Snigdha@123",
    "koumudi@example.com": "Koumudi@123"
}

for email, password in passwords.items():
    password_hash = pwd_context.hash(password)

    print(email)
    print(password_hash)
    print()