import random
import faker
import datetime
import mysql.connector
from collections import defaultdict
from faker.providers import BaseProvider

fake = faker.Faker('es_MX')
random.seed(42)
faker.Faker.seed(42)

DB_CONFIG = {
    "host": "localhost",
    "user": "root",
    "password": "",
    "database": "grocerystore",
    "port":"3306"
}

# EMPLOYEES (2 admins and 3 sellers)
roles = ['admin'] * 2 + ['seller'] * 3
employees = [{
    "first_name": fake.first_name(),
    "middle_name": fake.first_name(),
    "last_name": fake.last_name(),
    "username": fake.user_name() + str(i),
    "email": fake.email(),
    "phone_number": fake.msisdn()[:10],
    "role": role,
    "password": fake.password(length=10)
} for i, role in enumerate(roles, start=1)]

# 2 CLIENTS (20)
clients = [{
    "client_name": fake.name(),
    "client_email": fake.email(),
    "debt": round(random.uniform(0, 1000), 2)
} for _ in range(20)]

# 3 SUPPLIERS (100)
suppliers = [{
    "supplier_name": fake.company(),
    "phone_number": int(fake.msisdn()[:10]),
    "address": fake.address().replace("\n", ", ")
} for _ in range(100)]

# 4PRODUCTS (150)
products = []
for i in range(150):
    supplier_id = random.randint(1, len(suppliers))
    purchase_price = round(random.uniform(10, 200), 2)
    sale_price = round(purchase_price * random.uniform(1.1, 1.5), 2)
    products.append({
        "product_name": fake.word().capitalize() + " " + fake.color_name(),
        "barcode": fake.ean13(),
        "purchase_price": purchase_price,
        "sale_price": sale_price,
        "existence": random.randint(10, 200),
        "supplier_id": supplier_id
    })

# 5 SALES (800)
sales = []
sale_start = datetime.datetime.now() - datetime.timedelta(days=3*365)
for i in range(800):
    sale_date = fake.date_time_between(start_date=sale_start, end_date="now")
    employee_id = random.randint(1, len(employees))
    client_id = random.randint(1, len(clients))
    payment_method = random.choices(['card', 'cash', 'credit'], weights=[0.4, 0.4, 0.2])[0]
    sale_status = random.choice(['complete', 'processing'])
    discount = round(random.uniform(0, 50), 2) if random.random() < 0.2 else 0.00
    sales.append({
        "employee_id": employee_id,
        "client_id": client_id,
        "sale_date": sale_date,
        "payment_method": payment_method,
        "sale_status": sale_status,
        "discount": discount,
        "sale_total": 0  # Calculated later
    })

# 6 SALE DETAILS (avg 2 per sale)
sale_details = []
product_lookup = {i+1: p for i, p in enumerate(products)}
for sale_id, sale in enumerate(sales, start=1):
    total = 0
    for _ in range(random.randint(1, 3)):
        product_id = random.randint(1, len(products))
        unit_price = product_lookup[product_id]["sale_price"]
        quantity = random.randint(1, 5)
        subtotal = round(unit_price * quantity, 2)
        total += subtotal
        sale_details.append({
            "sale_id": sale_id,
            "product_id": product_id,
            "unit_price": unit_price,
            "quantity": quantity,
            "subtotal": subtotal
        })
    sale["sale_total"] = round(total - sale["discount"], 2)

# 7 DISCOUNTS (30 random)
discounts = []
for _ in range(30):
    product_id = random.randint(1, len(products))
    discount_price = round(random.uniform(1, 20), 2)
    start_date = fake.date_between(start_date='-2y', end_date='today')
    end_date = start_date + datetime.timedelta(days=random.randint(7, 60))
    active = int(end_date > datetime.datetime.now().date())
    discounts.append({
        "discount_type": random.choice(["temporal", "liquidación", "promoción"]),
        "discount_price": discount_price,
        "start_date": start_date,
        "end_date": end_date,
        "active": active,
        "product_id": product_id
    })

# 8 CREDIT PAYMENTS (10% of credit sales)
credit_payments = []
for sale_id, sale in enumerate(sales, start=1):
    if sale["payment_method"] == "credit" and random.random() < 0.5:
        amount_paid = round(sale["sale_total"] * random.uniform(0.5, 1.0), 2)
        payment_date = sale["sale_date"] + datetime.timedelta(days=random.randint(1, 90))
        credit_payments.append({
            "sale_id": sale_id,
            "client_id": sale["client_id"],
            "payment_date": payment_date,
            "amount_paid": amount_paid,
            "payment_method": random.choice(["cash", "card"])
        })

# Summary counts
{
    "employees": len(employees),
    "clients": len(clients),
    "suppliers": len(suppliers),
    "products": len(products),
    "sales": len(sales),
    "sale_details": len(sale_details),
    "discounts": len(discounts),
    "credit_payments": len(credit_payments)
}

def insertar(tabla, datos, conn):
    if not datos:
        return
    cursor = conn.cursor()
    columnas = ", ".join(datos[0].keys())
    placeholders = ", ".join(["%s"] * len(datos[0]))
    sql = f"INSERT INTO {tabla} ({columnas}) VALUES ({placeholders})"
    valores = [tuple(d.values()) for d in datos]
    cursor.executemany(sql, valores)
    conn.commit()
    cursor.close()

# connect to database
conn = mysql.connector.connect(**DB_CONFIG)

# insert data in order
insertar("employees", employees, conn)
insertar("clients", clients, conn)
insertar("suppliers", suppliers, conn)
insertar("products", products, conn)
insertar("sales", sales, conn)
insertar("sale_details", sale_details, conn)
insertar("discounts", discounts, conn)
insertar("credit_payments", credit_payments, conn)

conn.close()
print("Succesfully create data")

def insert_many(cursor, query, data):
    cursor.executemany(query, data)

connection = mysql.connector.connect(**DB_CONFIG)
cursor = connection.cursor()

# Insert employees
insert_many(cursor, """
INSERT INTO employees (first_name, middle_name, last_name, username, email, phone_number, role, password)
VALUES (%(first_name)s, %(middle_name)s, %(last_name)s, %(username)s, %(email)s, %(phone_number)s, %(role)s, %(password)s)
""", employees)

# Insert clients
insert_many(cursor, """
INSERT INTO clients (client_name, client_email, debt)
VALUES (%(client_name)s, %(client_email)s, %(debt)s)
""", clients)

# Insert suppliers
insert_many(cursor, """
INSERT INTO suppliers (supplier_name, phone_number, address)
VALUES (%(supplier_name)s, %(phone_number)s, %(address)s)
""", suppliers)

# Insert products
insert_many(cursor, """
INSERT INTO products (product_name, barcode, purchase_price, sale_price, existence, supplier_id)
VALUES (%(product_name)s, %(barcode)s, %(purchase_price)s, %(sale_price)s, %(existence)s, %(supplier_id)s)
""", products)

# Insert sales
insert_many(cursor, """
INSERT INTO sales (employee_id, client_id, sale_date, payment_method, sale_status, discount, sale_total)
VALUES (%(employee_id)s, %(client_id)s, %(sale_date)s, %(payment_method)s, %(sale_status)s, %(discount)s, %(sale_total)s)
""", sales)

# Insert sale_details
insert_many(cursor, """
INSERT INTO sale_details (sale_id, product_id, unit_price, quantity, subtotal)
VALUES (%(sale_id)s, %(product_id)s, %(unit_price)s, %(quantity)s, %(subtotal)s)
""", sale_details)

# Insert discounts
insert_many(cursor, """
INSERT INTO discounts (discount_type, discount_price, start_date, end_date, active, product_id)
VALUES (%(discount_type)s, %(discount_price)s, %(start_date)s, %(end_date)s, %(active)s, %(product_id)s)
""", discounts)

# Insert credit_payments
insert_many(cursor, """
INSERT INTO credit_payments (sale_id, client_id, payment_date, amount_paid, payment_method)
VALUES (%(sale_id)s, %(client_id)s, %(payment_date)s, %(amount_paid)s, %(payment_method)s)
""", credit_payments)

connection.commit()
cursor.close()
connection.close()
print("GREAT! :)")