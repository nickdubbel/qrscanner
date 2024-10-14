-- Create the `employee` table
CREATE TABLE IF NOT EXISTS Employee (
    employee_id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    date_of_birth DATE NOT NULL
);

-- Create the `log` table
CREATE TABLE IF NOT EXISTS Logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    input_user_id INT NOT NULL,
    patient_id INT NOT NULL,
    time TIME NOT NULL,
    date DATE NOT NULL,
    nutrition_id INT NOT NULL,
    category VARCHAR(255) NOT NULL,
    corrected_amount DOUBLE NOT NULL
);

-- Create the `log_out` table
CREATE TABLE IF NOT EXISTS LogsOut (
    id INT AUTO_INCREMENT PRIMARY KEY,
    input_user_id INT NOT NULL,
    patient_id INT NOT NULL,
    time TIME NOT NULL,
    date DATE NOT NULL,
    category VARCHAR(255) NOT NULL,
    amount DOUBLE NOT NULL
);

-- Create the `NutritionValues` table without barcode column
CREATE TABLE IF NOT EXISTS NutritionValues (
    id INT AUTO_INCREMENT PRIMARY KEY,
    dish VARCHAR(255) NOT NULL,
    calories INT NOT NULL,
    protein DECIMAL(5,2) NOT NULL,
    carbs DECIMAL(5,2) NOT NULL,
    fats DECIMAL(5,2) NOT NULL,
    salt DECIMAL(5,2) NOT NULL,
    water INT NOT NULL,
    protected BOOLEAN NOT NULL
);

-- Create the `Barcodes` table
CREATE TABLE IF NOT EXISTS Barcodes (
    nutrition_id INT PRIMARY KEY,
    barcode VARCHAR(255),
    FOREIGN KEY (nutrition_id) REFERENCES NutritionValues(id)
);

-- Create the `Patients` table
CREATE TABLE IF NOT EXISTS Patients (
    roomnumber INT NOT NULL,
    patient_id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    date_of_birth DATE NOT NULL,
    max_fluid_intake INT NOT NULL,
    state VARCHAR(255) NOT NULL
);

-- Insert sample employee
INSERT INTO Employee (first_name, last_name, date_of_birth) VALUES
('System', 'Admin', '2000-01-01');

-- Insert sample log entries
INSERT INTO Logs (input_user_id, patient_id, time, date, nutrition_id, category, corrected_amount) VALUES
(1, 126942, '09:08:00', '2024-10-07', 13, 'lunch', 1),
(1, 126942, '09:08:00', '2024-10-07', 17, 'lunch', 1),
(1, 126942, '18:18:00', '2024-10-07', 14, 'dinner', 1),
(1, 126942, '18:18:00', '2024-10-07', 9, 'dinner', 1),
(1, 126942, '16:16:00', '2024-10-07', 15, 'snacks', 1),
(1, 126942, '16:16:00', '2024-10-07', 16, 'snacks', 1),
(1, 126942, '10:58:00', '2024-10-07', 19, 'drinks', 1),
(1, 126942, '13:47:00', '2024-10-07', 18, 'drinks', 1),
(1, 126944, '13:47:00', '2024-10-07', 18, 'drinks', 1);

-- Insert sample nutrition values
INSERT INTO NutritionValues (dish, calories, protein, carbs, fats, salt, water, protected) VALUES
('asparagus', 20, 2.2, 3.7, 0.2, 1, 200, 1),
('broccoli', 55, 3.7, 11.2, 0.6, 2, 100, 1),
('burrito', 400, 18, 50, 16, 1, 200, 1),
('chicken', 335, 25, 0, 25, 1, 200, 1),
('egg', 155, 13, 1.1, 11, 1, 200, 1),
('mie', 180, 7, 35, 2, 1, 200, 1),
('noodles', 200, 8, 40, 2, 1, 200, 1),
('potato', 130, 2.2, 30, 0.2, 1, 200, 1),
('salad', 100, 2, 10, 5, 1, 200, 1),
('salmon', 206, 22, 0, 13, 1, 200, 1),
('sweetpotato', 86, 1.6, 20, 0.1, 1, 200, 1),
('vegetables', 50, 2, 10, 0.5, 0, 500, 1),
('sandwich', 300, 12, 35, 12, 2, 100, 1),
('pasta', 350, 10, 60, 8, 3, 200, 1),
('apple', 95, 0.5, 25, 0.3, 0, 150, 1),
('yogurt', 120, 5, 15, 4, 0.8, 180, 1),
('water', 0, 0, 0, 0, 0, 250, 0),
('soda', 150, 0, 40, 0, 0.2, 300, 1),
('orange juice', 112, 2, 26, 0.5, 0.3, 280, 1),
('IV', 0, 0, 0, 0, 0, 1000, 1);

-- Insert sample barcodes
INSERT INTO Barcodes (nutrition_id, barcode) VALUES
(1, '123456789012'),
(2, '123456789013'),
(3, '123456789014'),
(5, '123456789015'),
(7, '123456789016'),
(9, '123456789017'),
(10, '123456789018'),
(13, '123456789019'),
(14, '123456789020'),
(16, '123456789021'),
(17, '123456789022'),
(19, '123456789023'),
(20, '123456789024');

-- Insert sample patients
INSERT INTO Patients (roomnumber, patient_id, first_name, last_name, date_of_birth, max_fluid_intake, state) VALUES
(112, 126944, 'John', 'Doe', '1972-12-01', 1000, 'out'),
(112, 126942, 'Mike', 'Segers', '2003-09-02', 2000, 'active'),
(113, 126943, 'Sarah', 'Brown', '1985-03-22', 1500, 'active');
