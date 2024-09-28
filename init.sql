-- Create the `users` table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    total_ml_water INT DEFAULT 0,
    last_scan_time TIMESTAMP NULL DEFAULT NULL
);

-- Create the `products` table
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    barcode VARCHAR(255) UNIQUE NOT NULL,
    water_ml INT NOT NULL
);

-- Insert sample products (optional)
INSERT INTO products (name, barcode, water_ml) VALUES
('Coca-Cola 500ml', '123456789012', 500),
('Pepsi 330ml', '234567890123', 330),
('Dasani Water 1L', '345678901234', 1000);

-- Insert sample users
INSERT INTO users (username) VALUES
('Nick'),
('Wim'),
('Alex'),
('Anne'),
('Mike');
