import qrcode
import json
import os
from PIL import Image, ImageDraw, ImageFont

# Create the output directory if it doesn't exist
output_dir = 'qrcodes'
os.makedirs(output_dir, exist_ok=True)

# Function to generate QR code with product name text
def generate_qr_code_with_text():
    # Get product details from the terminal
    product_name = input("Enter product name: ")
    water_ml = input("Enter amount of water (ml): ")

    # Create a data payload (name and water_ml) in JSON format
    data = {
        "name": product_name,
        "water_ml": water_ml
    }

    # Convert data to JSON string
    json_data = json.dumps(data)

    # Generate the QR code
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4
    )
    qr.add_data(json_data)
    qr.make(fit=True)

    # Create an image from the QR code
    qr_img = qr.make_image(fill='black', back_color='white')

    # Load a font
    try:
        font = ImageFont.truetype("arial.ttf", 50)  # Adjust font size as needed
    except IOError:
        font = ImageFont.load_default()  # Fallback to default font if arial is not found

    # Add extra space for the text below the QR code
    qr_img_with_text = Image.new('RGB', (qr_img.size[0], qr_img.size[1] + 50), 'white')
    qr_img_with_text.paste(qr_img, (0, 0))

    # Prepare for drawing text
    draw = ImageDraw.Draw(qr_img_with_text)

    # Center the text under the QR code
    text = f"{product_name} - {water_ml} ml"
    # Get the bounding box of the text to calculate width and height
    text_bbox = draw.textbbox((0, 0), text, font=font)
    text_width = text_bbox[2] - text_bbox[0]  # width of the text
    text_height = text_bbox[3] - text_bbox[1]  # height of the text
    text_position = ((qr_img_with_text.size[0] - text_width) // 2, qr_img.size[1] + 10)

    # Add the product name text
    draw.text(text_position, text, font=font, fill='black')

    # Save the image in the "qr_codes" directory
    img_filename = os.path.join(output_dir, f"{product_name.replace(' ', '_')}_qr.png")
    qr_img_with_text.save(img_filename)

    print(f"QR code for {product_name} ({water_ml}ml) saved as {img_filename}")

if __name__ == "__main__":
    generate_qr_code_with_text()
