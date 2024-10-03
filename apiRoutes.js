const express = require('express');
const router = express.Router(); // Create a router object to define routes

module.exports = function (db) {
    // API to fetch all users
    router.get('/users', (req, res) => {
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
    router.get('/products', (req, res) => {
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
    router.post('/barcode-scan', (req, res) => {
        const { userId, barcode } = req.body;

        if (!userId || !barcode) {
            return res.status(400).send({ message: 'User ID and barcode are required' });
        }

        const productQuery = 'SELECT water_ml FROM products WHERE barcode = ?';
        db.query(productQuery, [barcode], (err, productResult) => {
            if (err) {
                console.error('Error fetching product by barcode:', err);
                return res.status(500).send({ message: 'Error fetching product data' });
            }

            if (productResult.length === 0) {
                return res.status(404).send({ message: 'Product not found' });
            }

            const waterMl = productResult[0].water_ml;

            const updateUserQuery = 'UPDATE users SET total_ml_water = total_ml_water + ? WHERE id = ?';
            db.query(updateUserQuery, [waterMl, userId], (err, updateResult) => {
                if (err) {
                    console.error('Error updating user water intake:', err);
                    return res.status(500).send({ message: 'Error updating user water intake' });
                }

                res.send({ message: `Successfully added ${waterMl} ml to user ${userId}` });
            });
        });
    });

    // API to handle QR code scanning and update user's water consumption
    router.post('/qr-scan', (req, res) => {
        const { userId, name, water_ml } = req.body;

        if (!userId || !name || !water_ml) {
            return res.status(400).send({ message: 'User ID, product name, and water amount are required' });
        }

        const waterMl = parseFloat(water_ml);
        if (isNaN(waterMl) || waterMl <= 0) {
            return res.status(400).send({ message: 'Invalid water amount' });
        }

        const updateUserQuery = 'UPDATE users SET total_ml_water = total_ml_water + ? WHERE id = ?';
        db.query(updateUserQuery, [waterMl, userId], (err, result) => {
            if (err) {
                console.error('Error updating user water intake:', err);
                return res.status(500).send({ message: 'Error updating user water intake' });
            }

            if (result.affectedRows === 0) {
                return res.status(404).send({ message: 'User not found' });
            }

            res.send({ message: `Successfully added ${waterMl} ml to user ${userId}` });
        });
    });

    // API to handle QR code scanning and update user's water consumption
    router.post('/smart-toilet', (req, res) => {
        const { userId, water_ml } = req.body;
        const name = 'Smart Toilet';

        if (!userId || !water_ml) {
            return res.status(400).send({ message: 'User ID and water amount are required' });
        }

        const waterMl = parseFloat(water_ml);
        if (isNaN(waterMl) || waterMl <= 0) {
            return res.status(400).send({ message: 'Invalid water amount, should be positive' });
        }

        const updateUserQuery = 'UPDATE users SET total_ml_water = total_ml_water - ? WHERE id = ?';
        db.query(updateUserQuery, [waterMl, userId], (err, result) => {
            if (err) {
                console.error('Error updating user water intake:', err);
                return res.status(500).send({ message: 'Error updating user water intake' });
            }

            if (result.affectedRows === 0) {
                return res.status(404).send({ message: 'User not found' });
            }

            res.send({ message: `Successfully added ${waterMl} ml to user ${userId}` });
        });
    });

    // API to get total water consumption of a user by their ID
    router.get('/user-water/:userId', (req, res) => {
        const userId = req.params.userId;

        if (!userId) {
            return res.status(400).send({ message: 'User ID is required' });
        }

        const sql = 'SELECT total_ml_water FROM users WHERE id = ?';
        db.query(sql, [userId], (err, result) => {
            if (err) {
                console.error('Error fetching user data:', err);
                return res.status(500).send({ message: 'Error fetching user data' });
            }

            if (result.length === 0) {
                return res.status(404).send({ message: 'User not found' });
            }

            const totalWater = result[0].total_ml_water;
            res.send({ total_ml_water: totalWater });
        });
    });

    // API to add a user
    router.post('/add-user', (req, res) => {
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
    router.delete('/delete-user', (req, res) => {
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
    router.post('/add-product', (req, res) => {
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
    router.delete('/delete-product', (req, res) => {
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

    return router; // Return the router object with all defined routes
};
