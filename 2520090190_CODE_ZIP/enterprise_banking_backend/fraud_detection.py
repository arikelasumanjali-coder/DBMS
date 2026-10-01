import numpy as np
from sklearn.cluster import DBSCAN
from sqlalchemy import text


def analyze_transaction(connection, transaction_id):
    """
    Analyze a transaction using DBSCAN and store the fraud result.
    """

    # -------------------------------------------------
    # 1. Get transaction history
    # -------------------------------------------------

    transactions = connection.execute(
        text("""
            SELECT
                transaction_id,
                from_account_id,
                to_account_id,
                amount,
                transaction_date
            FROM transactions
            WHERE status = 'COMPLETED'
            ORDER BY transaction_date
        """)
    ).mappings().all()

    # Need enough transactions for meaningful clustering
    if len(transactions) < 3:
        return {
            "risk_score": 10.0,
            "risk_level": "LOW",
            "cluster_id": 0,
            "is_anomaly": False
        }

    # -------------------------------------------------
    # 2. Create feature matrix
    # -------------------------------------------------

    amounts = np.array(
        [[float(transaction["amount"])] for transaction in transactions]
    )

    # -------------------------------------------------
    # 3. Run DBSCAN
    # -------------------------------------------------

    model = DBSCAN(
        eps=5000,
        min_samples=2
    )

    labels = model.fit_predict(amounts)

    # -------------------------------------------------
    # 4. Find current transaction
    # -------------------------------------------------

    current_index = None

    for index, transaction in enumerate(transactions):

        if transaction["transaction_id"] == transaction_id:
            current_index = index
            break

    if current_index is None:
        return {
            "risk_score": 0.0,
            "risk_level": "LOW",
            "cluster_id": 0,
            "is_anomaly": False
        }

    cluster_id = int(labels[current_index])

    # DBSCAN uses -1 for anomalies
    is_anomaly = cluster_id == -1

    # -------------------------------------------------
    # 5. Calculate risk score
    # -------------------------------------------------

    current_amount = float(
        transactions[current_index]["amount"]
    )

    risk_score = 10.0

    # Large transaction
    if current_amount >= 50000:
        risk_score += 35
    elif current_amount >= 25000:
        risk_score += 20
    elif current_amount >= 10000:
        risk_score += 10

    # DBSCAN anomaly
    if is_anomaly:
        risk_score += 40

    # Keep score between 0 and 100
    risk_score = min(risk_score, 100.0)

    # -------------------------------------------------
    # 6. Determine risk level
    # -------------------------------------------------

    if risk_score >= 70:
        risk_level = "HIGH"

    elif risk_score >= 40:
        risk_level = "MEDIUM"

    else:
        risk_level = "LOW"

    # -------------------------------------------------
    # 7. Store result in fraud_analysis
    # -------------------------------------------------

    connection.execute(
        text("""
            INSERT INTO fraud_analysis
            (
                transaction_id,
                risk_score,
                risk_level,
                cluster_id,
                is_anomaly,
                analysis_method
            )
            VALUES
            (
                :transaction_id,
                :risk_score,
                :risk_level,
                :cluster_id,
                :is_anomaly,
                'DBSCAN'
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