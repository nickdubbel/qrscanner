const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const mysql = require('mysql2');

// Create Express App
const app = express();
app.use(bodyParser.json());

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// MySQL connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',       // Your MySQL username
    password: 'password', // Your MySQL password
    database: 'scanner_db'  // Database name
});

db.connect(err => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the MySQL database.');
});

// Helper function to update user water intake
function updateUserWater(userId, waterMl, res) {
    const updateSql = `UPDATE users SET total_ml_water = total_ml_water + ? WHERE id = ?`;
    db.query(updateSql, [waterMl, userId], (err, result) => {
        if (err) {
            console.error('Error updating user water intake:', err);
            return res.status(500).send({ message: 'Error updating user water intake' });
        }

        const scanSql = `INSERT INTO scans (user_id, water_ml) VALUES (?, ?)`;
        db.query(scanSql, [userId, waterMl], (err, result) => {
            if (err) {
                console.error('Error logging the scan:', err);
                return res.status(500).send({ message: 'Error logging the scan' });
            }
            res.status(200).send({ message: `Successfully added ${waterMl} ml to user ${userId}` });
        });
    });
}

// API for handling QR code scan (direct ml value)
app.post('/api/qr-scan', (req, res) => {
    const { userId, waterMl } = req.body;

    if (!userId || !waterMl) {
        return res.status(400).send({ message: 'Missing userId or waterMl' });
    }

    updateUserWater(userId, waterMl, res);
});

// API for handling barcode scan (look up product in database)
app.post('/api/barcode-scan', (req, res) => {
    const { userId, barcode } = req.body;

    if (!userId || !barcode) {
        return res.status(400).send({ message: 'Missing userId or barcode' });
    }

    const sql = `SELECT water_ml FROM products WHERE barcode = ?`;
    db.query(sql, [barcode], (err, result) => {
        if (err) {
            console.error('Error fetching product by barcode:', err);
            return res.status(500).send({ message: 'Error fetching product data' });
        }

        if (result.length === 0) {
            return res.status(404).send({ message: 'Product not found' });
        }

        const waterMl = result[0].water_ml;
        updateUserWater(userId, waterMl, res);
    });
});

// API to get the total water consumption of a user
app.get('/api/user-water/:userId', (req, res) => {
    const userId = req.params.userId;

    const sql = `SELECT total_ml_water FROM users WHERE id = ?`;
    db.query(sql, [userId], (err, result) => {
        if (err) {
            console.error('Error fetching user data:', err);
            return res.status(500).send({ message: 'Error fetching user data' });
        }

        if (result.length === 0) {
            return res.status(404).send({ message: 'User not found' });
        }

        const totalWater = result[0].total_ml_water;
        res.status(200).send({ total_ml_water: totalWater });
    });
});

// Route to serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
