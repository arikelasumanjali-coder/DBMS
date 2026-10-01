CREATE DATABASE enterprise_banking;
USE enterprise_banking;


CREATE TABLE customers (
    customer_id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(15),
    address VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
DESCRIBE customers;


CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'CUSTOMER',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (customer_id)
        REFERENCES customers(customer_id)
        ON DELETE CASCADE
);
DESCRIBE users;
USE enterprise_banking;

CREATE TABLE accounts (
    account_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    account_number VARCHAR(20) UNIQUE NOT NULL,
    account_type VARCHAR(20) NOT NULL,
    balance DECIMAL(15,2) DEFAULT 0.00,
    status VARCHAR(20) DEFAULT 'ACTIVE',

    FOREIGN KEY (customer_id)
        REFERENCES customers(customer_id)
        ON DELETE CASCADE
);
DESCRIBE accounts;
SHOW CREATE TABLE accounts;


CREATE TABLE transactions (
    transaction_id INT AUTO_INCREMENT PRIMARY KEY,
    from_account_id INT,
    to_account_id INT,
    amount DECIMAL(15,2) NOT NULL,
    transaction_type VARCHAR(20) NOT NULL,
    description VARCHAR(255),
    status VARCHAR(20) DEFAULT 'PENDING',
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (from_account_id)
        REFERENCES accounts(account_id),

    FOREIGN KEY (to_account_id)
        REFERENCES accounts(account_id)
);
USE enterprise_banking;

CREATE TABLE payments (
    payment_id INT AUTO_INCREMENT PRIMARY KEY,
    account_id INT NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    payment_method VARCHAR(30) NOT NULL,
    recipient VARCHAR(100),
    status VARCHAR(20) DEFAULT 'PENDING',
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (account_id)
        REFERENCES accounts(account_id)
);
DESCRIBE payments;
USE enterprise_banking;

CREATE TABLE fraud_analysis (
    fraud_id INT AUTO_INCREMENT PRIMARY KEY,
    transaction_id INT NOT NULL,
    risk_score DECIMAL(5,2) NOT NULL,
    risk_level VARCHAR(20) NOT NULL,
    cluster_id INT,
    is_anomaly BOOLEAN DEFAULT FALSE,
    analysis_method VARCHAR(50) DEFAULT 'DBSCAN',
    analyzed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (transaction_id)
        REFERENCES transactions(transaction_id)
        ON DELETE CASCADE
);
DESCRIBE fraud_analysis;
SHOW TABLES;
USE enterprise_banking;

INSERT INTO customers (full_name, email, phone, address)
VALUES
('Sumanjali', 'sumanjali@example.com', '9876543210', 'Hyderabad'),
('Snigdha', 'snigdha@example.com', '9876543211', 'Hyderabad'),
('Koumudi', 'koumudi@example.com', '9876543212', 'Hyderabad');
SELECT * FROM customers;
USE enterprise_banking;

INSERT INTO accounts
(customer_id, account_number, account_type, balance, status)
VALUES
(1, '5001', 'SAVINGS', 50000.00, 'ACTIVE'),
(1, '7824', 'CURRENT', 25000.00, 'ACTIVE'),
(2, '6001', 'SAVINGS', 40000.00, 'ACTIVE'),
(3, '7001', 'SAVINGS', 30000.00, 'ACTIVE');
SELECT customer_id, full_name, email
FROM customers;
USE enterprise_banking;

INSERT INTO accounts
(customer_id, account_number, account_type, balance, status)
VALUES
(1, '5001', 'SAVINGS', 50000.00, 'ACTIVE'),
(1, '7824', 'CURRENT', 25000.00, 'ACTIVE'),
(2, '6001', 'SAVINGS', 40000.00, 'ACTIVE'),
(3, '7001', 'SAVINGS', 30000.00, 'ACTIVE');

SELECT account_id, customer_id, account_number, account_type, balance
FROM accounts;
INSERT INTO transactions
(from_account_id, to_account_id, amount, transaction_type, description, status)
VALUES
(1, 3, 5000.00, 'TRANSFER', 'Money transfer to Snigdha', 'COMPLETED'),
(3, 1, 10000.00, 'TRANSFER', 'Payment received from Snigdha', 'COMPLETED'),
(1, 4, 2000.00, 'TRANSFER', 'Payment to Koumudi', 'COMPLETED'),
(2, 1, 15000.00, 'TRANSFER', 'Internal account transfer', 'COMPLETED'),
(1, 3, 45000.00, 'TRANSFER', 'Large transaction', 'COMPLETED');
SELECT * FROM transactions;
INSERT INTO fraud_analysis
(transaction_id, risk_score, risk_level, cluster_id, is_anomaly, analysis_method)
VALUES
(1, 15.00, 'LOW', 1, FALSE, 'DBSCAN'),
(2, 20.00, 'LOW', 1, FALSE, 'DBSCAN'),
(3, 18.00, 'LOW', 1, FALSE, 'DBSCAN'),
(4, 55.00, 'MEDIUM', 2, FALSE, 'DBSCAN'),
(5, 92.00, 'HIGH', -1, TRUE, 'DBSCAN');
SELECT * FROM fraud_analysis;
SELECT * FROM customers;
SELECT * FROM users;
SELECT customer_id, full_name, email
FROM customers
WHERE email = 'testcustomer2@example.com';
SELECT user_id, customer_id, email, role
FROM users
WHERE email = 'testcustomer2@example.com';
desc transactions;
SELECT account_id, customer_id, account_number, account_type, balance, status
FROM accounts
WHERE customer_id = 5;
SELECT *
FROM accounts;
select *
from accounts
where customer_id=5;
describe users;
select *from users;
DESC users;
SELECT user_id, customer_id, email
FROM users;
select *from customers;
INSERT INTO users
(customer_id, email, password_hash, role)
VALUES
(1, 'sumanjali@example.com', '$2b$12$UuEuy/6FOoVfzvtC6NPa/OxGqHFmmnHY.0hWwZFa50OPAL31mgzp.', 'CUSTOMER'),
(2,'snigdha@example.com','$2b$12$0s0Vr2RNaoD.P6rh/CTCMeL63RVXo5TDOuyHP7OeHI/YRusNnBbOu','CUSTOMER'),
(3,'koumudi@example.com','$2b$12$VEp/Evlt7uDblx3rD8zl0uIq2BdEorfv3KGpwsHGZSbiXqDZE81yS','CUSTOMER');
