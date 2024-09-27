const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const path = require('path');

// Create Express App
const app = express();
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files like HTML, CSS, JS

// MySQL connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'scanner_db'
});

db.connect(err => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the MySQL database.');
});

// Serve the index page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Serve the manage page
app.get('/manage.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'manage.html'));
});

// API to fetch all users
app.get('/api/users', (req, res) => {
    const sql = 'SELECT id, username FROM users';
    db.query(sql, (err, result) => {
        if (err) {
            console.error('Error fetching users:', err);
            return res.status(500).send({ message: 'Error fetching users' });
        }
        res.send(result);
    });
});

// API to fetch all products
app.get('/api/products', (req, res) => {
    const sql = 'SELECT id, name, barcode, water_ml FROM products';
    db.query(sql, (err, result) => {
        if (err) {
            console.error('Error fetching products:', err);
            return res.status(500).send({ message: 'Error fetching products' });
        }
        res.send(result);
    });
});

// API to handle barcode scanning and update user's water consumption
app.post('/api/barcode-scan', (req, res) => {
    const { userId, barcode } = req.body;

    // Check if userId and barcode are provided
    if (!userId || !barcode) {
        return res.status(400).send({ message: 'User ID and barcode are required' });
    }

    // Query to find the product by its barcode
    const productQuery = 'SELECT water_ml FROM products WHERE barcode = ?';
    db.query(productQuery, [barcode], (err, productResult) => {
        if (err) {
            console.error('Error fetching product by barcode:', err);
            return res.status(500).send({ message: 'Error fetching product data' });
        }

        // If the product is not found
        if (productResult.length === 0) {
            return res.status(404).send({ message: 'Product not found' });
        }

        // Get the water_ml associated with the product
        const waterMl = productResult[0].water_ml;

        // Query to update the user's total water consumption
        const updateUserQuery = 'UPDATE users SET total_ml_water = total_ml_water + ? WHERE id = ?';
        db.query(updateUserQuery, [waterMl, userId], (err, updateResult) => {
            if (err) {
                console.error('Error updating user water intake:', err);
                return res.status(500).send({ message: 'Error updating user water intake' });
            }

            // Success: Respond with the updated water intake
            res.send({ message: `Successfully added ${waterMl} ml to user ${userId}` });
        });
    });
});


// API to get the total water consumption of a user by their ID
app.get('/api/user-water/:userId', (req, res) => {
    const userId = req.params.userId;

    // Check if userId is provided
    if (!userId) {
        return res.status(400).send({ message: 'User ID is required' });
    }

    // Query to fetch the total water consumption for the user
    const sql = 'SELECT total_ml_water FROM users WHERE id = ?';
    db.query(sql, [userId], (err, result) => {
        if (err) {
            console.error('Error fetching user data:', err);
            return res.status(500).send({ message: 'Error fetching user data' });
        }

        // If user is not found
        if (result.length === 0) {
            return res.status(404).send({ message: 'User not found' });
        }

        // Return the total water consumption for the user
        const totalWater = result[0].total_ml_water;
        res.send({ total_ml_water: totalWater });
    });
});


// API to add a user
app.post('/api/add-user', (req, res) => {
    const { username } = req.body;
    if (!username) {
        return res.status(400).send({ message: 'Username is required' });
    }

    const sql = 'INSERT INTO users (username) VALUES (?)';
    db.query(sql, [username], (err, result) => {
        if (err) {
            console.error('Error adding user:', err);
            return res.status(500).send({ message: 'Error adding user' });
        }
        res.send({ message: 'User added successfully' });
    });
});

// API to delete a user
app.delete('/api/delete-user', (req, res) => {
    const { userId } = req.body;
    if (!userId) {
        return res.status(400).send({ message: 'User ID is required' });
    }

    const sql = 'DELETE FROM users WHERE id = ?';
    db.query(sql, [userId], (err, result) => {
        if (err) {
            console.error('Error deleting user:', err);
            return res.status(500).send({ message: 'Error deleting user' });
        }
        res.send({ message: 'User deleted successfully' });
    });
});

// API to add a product
app.post('/api/add-product', (req, res) => {
    const { name, barcode, waterMl } = req.body;
    if (!name || !barcode || !waterMl) {
        return res.status(400).send({ message: 'Name, barcode, and water ml are required' });
    }

    const sql = 'INSERT INTO products (name, barcode, water_ml) VALUES (?, ?, ?)';
    db.query(sql, [name, barcode, waterMl], (err, result) => {
        if (err) {
            console.error('Error adding product:', err);
            return res.status(500).send({ message: 'Error adding product' });
        }
        res.send({ message: 'Product added successfully' });
    });
});

// API to delete a product
app.delete('/api/delete-product', (req, res) => {
    const { barcode } = req.body;
    if (!barcode) {
        return res.status(400).send({ message: 'Barcode is required' });
    }

    const sql = 'DELETE FROM products WHERE barcode = ?';
    db.query(sql, [barcode], (err, result) => {
        if (err) {
            console.error('Error deleting product:', err);
            return res.status(500).send({ message: 'Error deleting product' });
        }
        res.send({ message: 'Product deleted successfully' });
    });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
