from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import create_engine, text
from passlib.context import CryptContext
from datetime import datetime, timedelta, timezone
from jose import jwt
from fastapi import Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials


import numpy as np
from sklearn.cluster import DBSCAN
from sklearn.preprocessing import StandardScaler


app = FastAPI(title="Enterprise Banking API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MySQL connection
DATABASE_URL = "mysql+pymysql://root:Sumanjali%40123@localhost/enterprise_banking"

engine = create_engine(DATABASE_URL)

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

SECRET_KEY = "enterprise-banking-secret-key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

security = HTTPBearer()

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    token = credentials.credentials

    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        return payload

    except Exception:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token"
        )

# -------------------------
# DBSCAN Fraud Detection
# -------------------------

def analyze_transaction(connection, transaction_id: int, customer_id: int):

    

        # Get transaction history of this customer
        transactions = connection.execute(
            text("""
                SELECT
                    t.transaction_id,
                    t.amount,
                    t.transaction_date
                FROM transactions t
                LEFT JOIN accounts a1
                    ON t.from_account_id = a1.account_id
                LEFT JOIN accounts a2
                    ON t.to_account_id = a2.account_id
                WHERE
                    a1.customer_id = :customer_id
                    OR a2.customer_id = :customer_id
                ORDER BY t.transaction_date
            """),
            {
                "customer_id": customer_id
            }
        ).mappings().all()

        # Need enough transactions for meaningful clustering
        if len(transactions) < 3:

            connection.execute(
                text("""
                    INSERT INTO fraud_analysis
                    (
                        transaction_id,
                        risk_score,
                        risk_level,
                        cluster_id,
                        is_anomaly
                    )
                    VALUES
                    (
                        :transaction_id,
                        :risk_score,
                        :risk_level,
                        :cluster_id,
                        :is_anomaly
                    )
                """),
                {
                    "transaction_id": transaction_id,
                    "risk_score": 10,
                    "risk_level": "LOW",
                    "cluster_id": 0,
                    "is_anomaly": False
                }
            )

            return {
                "risk_score": 10,
                "risk_level": "LOW",
                "cluster_id": 0,
                "is_anomaly": False
            }

        # -------------------------
        # Create ML features
        # -------------------------

        features = []

        for transaction in transactions:

            amount = float(transaction["amount"])

            transaction_time = transaction["transaction_date"]

            hour = transaction_time.hour

            features.append([
                amount,
                hour
            ])

        X = np.array(features)

        # -------------------------
        # Normalize features
        # -------------------------

        scaler = StandardScaler()

        X_scaled = scaler.fit_transform(X)

        # -------------------------
        # DBSCAN
        # -------------------------

        model = DBSCAN(
            eps=1.2,
            min_samples=3
        )

        labels = model.fit_predict(X_scaled)

        # Find the current transaction
        current_index = None

        for index, transaction in enumerate(transactions):

            if transaction["transaction_id"] == transaction_id:
                current_index = index
                break

        if current_index is None:
            return None

        cluster_id = int(labels[current_index])

        # DBSCAN uses -1 for noise/anomaly
        is_anomaly = cluster_id == -1

        # -------------------------
        # Calculate risk score
        # -------------------------

        current_amount = float(
            transactions[current_index]["amount"]
        )

        all_amounts = [
            float(t["amount"])
            for t in transactions
        ]

        average_amount = np.mean(all_amounts)

        if average_amount > 0:
            amount_ratio = current_amount / average_amount
        else:
            amount_ratio = 1

        # Base risk score
        risk_score = 10

        # Large deviation from normal transaction amount
        if amount_ratio >= 5:
            risk_score += 45

        elif amount_ratio >= 3:
            risk_score += 30

        elif amount_ratio >= 2:
            risk_score += 15

        # DBSCAN anomaly
        if is_anomaly:
            risk_score += 30

        # Keep score between 0 and 100
        risk_score = min(100, risk_score)

        # Determine risk level
        if risk_score >= 70:
            risk_level = "HIGH"

        elif risk_score >= 40:
            risk_level = "REVIEW"

        else:
            risk_level = "LOW"

        # -------------------------
        # Store fraud result
        # -------------------------

        connection.execute(
            text("""
                INSERT INTO fraud_analysis
                (
                    transaction_id,
                    risk_score,
                    risk_level,
                    cluster_id,
                    is_anomaly
                )
                VALUES
                (
                    :transaction_id,
                    :risk_score,
                    :risk_level,
                    :cluster_id,
                    :is_anomaly
                )
            """),
            {
                "transaction_id": transaction_id,
                "risk_score": risk_score,
                "risk_level": risk_level,
                "cluster_id": cluster_id,
                "is_anomaly": is_anomaly
            }
        )

        return {
        "risk_score": risk_score,
        "risk_level": risk_level,
        "cluster_id": cluster_id,
        "is_anomaly": is_anomaly
    }
# -------------------------
# Request Model
# -------------------------

class RegisterRequest(BaseModel):
    full_name: str
    email: str
    phone: str
    address: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

class TransferRequest(BaseModel):
    from_account_id: int
    to_account_id: int
    amount: float
    description: str | None = None


# -------------------------
# Home
# -------------------------

@app.get("/")
def home():
    return {
        "message": "Enterprise Banking API is running"
    }


# -------------------------
# Database Test
# -------------------------

@app.get("/db-test")
def database_test():
    with engine.connect() as connection:
        result = connection.execute(text("SELECT 1"))

        return {
            "database": "Connected",
            "result": result.scalar()
        }


# -------------------------
# Registration
# -------------------------

@app.post("/register")
def register(user: RegisterRequest):

    with engine.begin() as connection:

        # -------------------------
        # 1. Check existing email
        # -------------------------

        existing_user = connection.execute(
            text("""
                SELECT user_id
                FROM users
                WHERE email = :email
            """),
            {"email": user.email}
        ).fetchone()

        if existing_user:
            raise HTTPException(
                status_code=400,
                detail="Email already registered"
            )


        # -------------------------
        # 2. Create customer
        # -------------------------

        customer_result = connection.execute(
            text("""
                INSERT INTO customers
                (full_name, email, phone, address)
                VALUES
                (:full_name, :email, :phone, :address)
            """),
            {
                "full_name": user.full_name,
                "email": user.email,
                "phone": user.phone,
                "address": user.address
            }
        )

        customer_id = customer_result.lastrowid


        # -------------------------
        # 3. Hash password
        # -------------------------

        password_hash = pwd_context.hash(user.password)


        # -------------------------
        # 4. Create login user
        # -------------------------

        user_result = connection.execute(
            text("""
                INSERT INTO users
                (customer_id, email, password_hash)
                VALUES
                (:customer_id, :email, :password_hash)
            """),
            {
                "customer_id": customer_id,
                "email": user.email,
                "password_hash": password_hash
            }
        )

        user_id = user_result.lastrowid


        # -------------------------
        # 5. Generate account number
        # -------------------------

        account_result = connection.execute(
            text("""
                SELECT MAX(account_number)
                FROM accounts
            """)
        ).scalar()

        if account_result is None:
            account_number = 8001
        else:
            account_number = int(account_result) + 1


        # -------------------------
        # 6. Create default savings account
        # -------------------------

        connection.execute(
            text("""
                INSERT INTO accounts
                (
                    customer_id,
                    account_number,
                    account_type,
                    balance,
                    status
                )
                VALUES
                (
                    :customer_id,
                    :account_number,
                    'SAVINGS',
                    0.00,
                    'ACTIVE'
                )
            """),
            {
                "customer_id": customer_id,
                "account_number": account_number
            }
        )


    # -------------------------
    # 7. Registration response
    # -------------------------

    return {
        "message": "Registration successful",
        "customer_id": customer_id,
        "user_id": user_id,
        "email": user.email,
        "account_number": account_number,
        "account_type": "SAVINGS",
        "balance": 0.00,
        "status": "ACTIVE"
    }

def create_access_token(user_id: int, customer_id: int):
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )

    payload = {
        "user_id": user_id,
        "customer_id": customer_id,
        "exp": expire
    }

    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)



@app.post("/login")
def login(user: LoginRequest):

    with engine.connect() as connection:

        result = connection.execute(
            text("""
                SELECT user_id, customer_id, email, password_hash, role
                FROM users
                WHERE email = :email
            """),
            {"email": user.email}
        ).fetchone()

        if not result:
            raise HTTPException(
                status_code=401,
                detail="Invalid email or password"
            )

        password_valid = pwd_context.verify(
            user.password,
            result.password_hash
        )

        if not password_valid:
            raise HTTPException(
                status_code=401,
                detail="Invalid email or password"
            )

        access_token = create_access_token(
            result.user_id,
            result.customer_id
        )
        return {
           "message": "Login successful",
           "access_token": access_token,
           "token_type": "bearer",
           "user_id": result.user_id,
           "customer_id": result.customer_id,
           "email": result.email,
           "role": result.role
        }

# -------------------------
# Dashboard
# -------------------------

@app.get("/dashboard/{customer_id}")
def get_dashboard(
    customer_id: int,
    current_user: dict = Depends(get_current_user)
):

    # Make sure the logged-in user can access only their own dashboard
    if int(current_user["customer_id"]) != customer_id:
        raise HTTPException(
            status_code=403,
            detail="Access denied"
        )

    with engine.connect() as connection:

        customer = connection.execute(
            text("""
                SELECT customer_id, full_name, email
                FROM customers
                WHERE customer_id = :customer_id
            """),
            {"customer_id": customer_id}
        ).fetchone()

        if not customer:
            raise HTTPException(
                status_code=404,
                detail="Customer not found"
            )

        accounts = connection.execute(
            text("""
                SELECT
                    account_id,
                    account_number,
                    account_type,
                    balance,
                    status
                FROM accounts
                WHERE customer_id = :customer_id
            """),
            {"customer_id": customer_id}
        ).mappings().all()

        total_balance = sum(
            float(account["balance"])
            for account in accounts
        )

    return {
        "customer": {
            "customer_id": customer.customer_id,
            "name": customer.full_name,
            "email": customer.email
        },
        "total_balance": total_balance,
        "accounts": accounts
    }

# -------------------------
# Transfer Money
# -------------------------

@app.post("/transfer")
def transfer_money(
    transfer: TransferRequest,
    current_user: dict = Depends(get_current_user)
):

    if transfer.amount <= 0:
        raise HTTPException(
            status_code=400,
            detail="Transfer amount must be greater than zero"
        )

    with engine.begin() as connection:

        # Check sender account belongs to logged-in customer
        sender = connection.execute(
            text("""
                SELECT account_id, balance
                FROM accounts
                WHERE account_id = :account_id
                  AND customer_id = :customer_id
                FOR UPDATE
            """),
            {
                "account_id": transfer.from_account_id,
                "customer_id": current_user["customer_id"]
            }
        ).mappings().fetchone()

        if not sender:
            raise HTTPException(
                status_code=404,
                detail="Sender account not found"
            )

        # Check receiver account
        receiver = connection.execute(
            text("""
                SELECT account_id
                FROM accounts
                WHERE account_id = :account_id
                FOR UPDATE
            """),
            {
                "account_id": transfer.to_account_id
            }
        ).mappings().fetchone()

        if not receiver:
            raise HTTPException(
                status_code=404,
                detail="Receiver account not found"
            )

        # Prevent transferring to the same account
        if transfer.from_account_id == transfer.to_account_id:
            raise HTTPException(
                status_code=400,
                detail="Sender and receiver accounts cannot be the same"
            )

        # Check balance
        if float(sender["balance"]) < transfer.amount:
            raise HTTPException(
                status_code=400,
                detail="Insufficient balance"
            )

        # Deduct from sender
        connection.execute(
            text("""
                UPDATE accounts
                SET balance = balance - :amount
                WHERE account_id = :account_id
            """),
            {
                "amount": transfer.amount,
                "account_id": transfer.from_account_id
            }
        )

        # Add to receiver
        connection.execute(
            text("""
                UPDATE accounts
                SET balance = balance + :amount
                WHERE account_id = :account_id
            """),
            {
                "amount": transfer.amount,
                "account_id": transfer.to_account_id
            }
        )

        # Record transaction
        transaction_result = connection.execute(
            text("""
                INSERT INTO transactions
                (
                    from_account_id,
                    to_account_id,
                    amount,
                    transaction_type,
                    description,
                    status
                )
                VALUES
                (
                    :from_account_id,
                    :to_account_id,
                    :amount,
                    :transaction_type,
                    :description,
                    :status
                )
            """),
            {
                "from_account_id": transfer.from_account_id,
                "to_account_id": transfer.to_account_id,
                "amount": transfer.amount,
                "transaction_type": "TRANSFER",
                "description": transfer.description,
                "status": "COMPLETED"
            }
        )

        transaction_id = transaction_result.lastrowid

          # -----------------------------------------
        # Run DBSCAN fraud detection
        # -----------------------------------------

        fraud_result = analyze_transaction(
    connection,
    transaction_id,
    int(current_user["customer_id"])
)

        return {
        "message": "Transfer successful",
        "transaction_id": transaction_id,
        "from_account_id": transfer.from_account_id,
        "to_account_id": transfer.to_account_id,
        "amount": transfer.amount,
        "status": "COMPLETED",

        # Fraud detection result
        "fraud_analysis": fraud_result
    }
# -------------------------
# Fraud Analysis
# -------------------------

@app.get("/fraud-analysis/{customer_id}")
def fraud_analysis(
    customer_id: int,
    current_user: dict = Depends(get_current_user)
):

    if int(current_user["customer_id"]) != customer_id:
        raise HTTPException(
            status_code=403,
            detail="Access denied"
        )

    with engine.connect() as connection:

        results = connection.execute(
            text("""
                SELECT
                    fa.fraud_id,
                    fa.transaction_id,
                    fa.risk_score,
                    fa.risk_level,
                    fa.cluster_id,
                    fa.is_anomaly,
                    fa.analyzed_at,
                    t.amount,
                    t.transaction_date
                FROM fraud_analysis fa
                JOIN transactions t
                    ON fa.transaction_id = t.transaction_id
                JOIN accounts a
                    ON t.from_account_id = a.account_id
                WHERE a.customer_id = :customer_id
                ORDER BY fa.analyzed_at DESC
            """),
            {
                "customer_id": customer_id
            }
        ).mappings().all()

    return {
        "customer_id": customer_id,
        "fraud_analysis": results
    }