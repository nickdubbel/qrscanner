import mysql.connector
import barcode
from barcode.writer import ImageWriter


foldername = "barcodes"

# Connect to the MySQL database
db_connection = mysql.connector.connect(
    host="localhost",     # Your database host
    user="root",          # Your MySQL username
    password="password",  # Your MySQL password
    database="scanner_db" # Your database name
)

cursor = db_connection.cursor()

# Fetch products with their barcodes, names, and water_ml from the database
cursor.execute("SELECT barcode, name, water_ml FROM products")
products = cursor.fetchall()

# Generate and save barcodes as images
for product in products:
    barcode_value, product_name, water_ml = product

    # Ensure barcode_value is a string
    barcode_value = str(barcode_value)
    product_name = str(product_name)

    # If the barcode has 12 digits, convert it to a valid EAN-13 by adding a leading zero
    if len(barcode_value) == 12:
        barcode_value = '0' + barcode_value

    try:
        # Generate the barcode using EAN-13
        EAN_class = barcode.get_barcode_class('ean13')
        ean = EAN_class(barcode_value, writer=ImageWriter())

        if ean is None:
            print(f"Error: Barcode format 'ean13' is not recognized for {barcode_value}")
            continue

        # Save the barcode as a PNG file
        filename = f"{product_name.replace(' ', '_')}_{barcode_value}"
        ean.save("./"+foldername+"/"+filename)

        print(f"Barcode for '{product_name}' ({barcode_value}, {water_ml}ml) saved as {filename}")

    except Exception as e:
        print(f"Error generating barcode for {barcode_value}: {e}")

# Close the database connection
cursor.close()
db_connection.close()
