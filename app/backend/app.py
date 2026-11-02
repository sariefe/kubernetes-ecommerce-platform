cat > app.py <<'EOF'
import os
import time

import psycopg
from flask import Flask, jsonify, request
from psycopg.rows import dict_row

app = Flask(__name__)

DB_HOST = os.getenv("DB_HOST", "postgres-service")
DB_PORT = int(os.getenv("DB_PORT", "5432"))
DB_NAME = os.getenv("DB_NAME", "ecommerce")
DB_USER = os.getenv("DB_USER", "ecommerce_user")
DB_PASSWORD = os.getenv("DB_PASSWORD", "local_dev_password")


def get_db_connection():
    return psycopg.connect(
        host=DB_HOST,
        port=DB_PORT,
        dbname=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD,
        row_factory=dict_row,
        connect_timeout=3,
    )


def initialize_database():
    for attempt in range(30):
        try:
            with get_db_connection() as conn:
                conn.execute("""
                    CREATE TABLE IF NOT EXISTS products (
                        id SERIAL PRIMARY KEY,
                        name VARCHAR(100) NOT NULL,
                        price DECIMAL(10, 2) NOT NULL,
                        stock INTEGER DEFAULT 0
                    );
                """)
            print("Database initialized successfully.")
            return
        except psycopg.OperationalError as error:
            print(f"Database not ready ({attempt + 1}/30): {error}")
            time.sleep(2)

    raise RuntimeError("Could not connect to PostgreSQL.")


@app.get("/health")
def health():
    return jsonify({"status": "ok"})


@app.get("/ready")
def ready():
    try:
        with get_db_connection() as conn:
            conn.execute("SELECT 1")
        return jsonify({"status": "ready", "database": "connected"})
    except psycopg.Error:
        return jsonify({"status": "not ready"}), 503


@app.get("/products")
def get_products():
    with get_db_connection() as conn:
        products = conn.execute(
            "SELECT id, name, price, stock FROM products ORDER BY id"
        ).fetchall()

    return jsonify(products)


@app.post("/products")
def create_product():
    data = request.get_json(silent=True) or {}

    name = data.get("name")
    price = data.get("price")
    stock = data.get("stock", 0)

    if not name or price is None:
        return jsonify({"error": "name and price are required"}), 400

    try:
        price = float(price)
        stock = int(stock)
        if price < 0 or stock < 0:
            raise ValueError
    except (TypeError, ValueError):
        return jsonify({"error": "price and stock must be valid non-negative numbers"}), 400

    with get_db_connection() as conn:
        product = conn.execute(
            """
            INSERT INTO products (name, price, stock)
            VALUES (%s, %s, %s)
            RETURNING id, name, price, stock
            """,
            (name, price, stock),
        ).fetchone()

    return jsonify(product), 201


if __name__ == "__main__":
    initialize_database()
    app.run(host="0.0.0.0", port=5000)
EOF
