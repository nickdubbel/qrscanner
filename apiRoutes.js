const express = require('express');
const router = express.Router(); // Create a router object to define routes

module.exports = function (db) {
 
    // API to handle barcode scanning and log nutrition values
    router.post('/barcode-scan', (req, res) => {
        const { userId, inputUserId, barcode } = req.body;
        if (!userId || !barcode || !inputUserId) return res.status(400).send({ message: 'User ID and barcode are required' });

        db.query('SELECT NV.id, NV.dish FROM NutritionValues NV INNER JOIN Barcodes B ON NV.id = B.nutrition_id WHERE B.barcode = ?', [barcode], (err, productResult) => {
            if (err) return res.status(500).send({ message: 'Error fetching product data' });
            if (productResult.length === 0) return res.status(404).send({ message: 'Product not found' });

            const { id: nutritionId, dish } = productResult[0];
            const currentTime = new Date();
            const logData = [inputUserId, userId, currentTime.toTimeString().split(' ')[0], currentTime.toISOString().split('T')[0], nutritionId, 'barcode-scan', 1];

            db.query('INSERT INTO Logs (input_user_id, patient_id, time, date, nutrition_id, category, corrected_amount) VALUES (?, ?, ?, ?, ?, ?, ?)', logData, (err) => {
                if (err) return res.status(500).send({ message: 'Error logging nutrition values' });
                res.send({ message: `Successfully logged nutrition values for product ${dish} for user ${userId}` });
            });
        });
    });

    // API to handle QR code scanning and update user's water consumption
    router.post('/qr-scan', (req, res) => {
        const { userId, inputUserId, name, water_ml, isIn } = req.body;

        // Validate required fields
        if (!userId || !name || inputUserId === undefined || isIn === undefined) {
            return res.status(400).send({ message: 'User ID, product name, input user ID, and fluid direction are required' });
        }

        let waterMl = isIn ? (water_ml ? parseFloat(water_ml) : 1) : parseFloat(water_ml);

        if (!isIn && (isNaN(waterMl) || waterMl <= 0)) {
            return res.status(400).send({ message: 'Water amount is required for outgoing fluids and must be a valid number' });
        }

        const currentTime = new Date();
        const time = currentTime.toTimeString().split(' ')[0];
        const date = currentTime.toISOString().split('T')[0];

        if (isIn) {
            // Handle fluid intake
            db.query('SELECT id FROM NutritionValues WHERE dish = ?', [name], (err, productResult) => {
                if (err) return res.status(500).send({ message: 'Error fetching product data' });
                if (productResult.length === 0) return res.status(404).send({ message: 'Product not found' });

                const nutritionId = productResult[0].id;
                const logData = [inputUserId, userId, time, date, nutritionId, 'qr-scan', waterMl];

                db.query('INSERT INTO Logs (input_user_id, patient_id, time, date, nutrition_id, category, corrected_amount) VALUES (?, ?, ?, ?, ?, ?, ?)', logData, (err) => {
                    if (err) return res.status(500).send({ message: 'Error logging nutrition values' });
                    res.send({ message: `Successfully logged nutrition values for product ${name} for user ${userId}` });
                });
            });
        } else {
            // Handle fluid output
            const logOutData = [inputUserId, userId, time, date, name, waterMl];
            db.query('INSERT INTO LogsOut (input_user_id, patient_id, time, date, category, amount) VALUES (?, ?, ?, ?, ?, ?)', logOutData, (err) => {
                if (err) return res.status(500).send({ message: 'Error logging output values' });
                res.send({ message: `Successfully logged ${waterMl} ml output for user ${userId}` });
            });
        }
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


    router.get('/logs', async (req, res) => {
        const { patient_id } = req.query;

        if (!patient_id) {
            return res.status(400).send({ message: 'User ID is required' });
        }
        
        const sql = 'SELECT * FROM Logs WHERE patient_id = ?';
        db.query(sql, [patient_id], (err, result) => {
            if (err) {
                console.error('Error fetching logs:', err);
                return res.status(500).send({ message: 'Error fetching logs' });
            }
            res.send(result);
        });
        
    });

    router.get('/logsOut', async (req, res) => {
        const { patient_id } = req.query;

        if (!patient_id) {
            return res.status(400).send({ message: 'User ID is required' });
        }
        
        const sql = 'SELECT * FROM LogsOut WHERE patient_id = ?';
        db.query(sql, [patient_id], (err, result) => {
            if (err) {
                console.error('Error fetching logs:', err);
                return res.status(500).send({ message: 'Error fetching logs' });
            }
            res.send(result);
        });
        
    });
    
    router.get('/nutrition', async (req, res) => {

        const sql = 'SELECT * FROM NutritionValues';
        db.query(sql, (err, result) => {
            if (err) {
                console.error('Error fetching nutrition:', err);
                return res.status(500).send({ message: 'Error fetching nutrition' });
            }
            res.send(result);
        });

    });

    // Fetch a specific patient's data
    router.get('/patients', async (req, res) => {
        const { patient_id } = req.query;

        if (!patient_id) {
            return res.status(400).send({ message: 'Patient ID is required' });
        }

        const sql = 'SELECT * FROM Patients WHERE patient_id = ?';
        db.query(sql, [patient_id], (err, result) => {
            if (err) {
                console.error('Error fetching patient data:', err);
                return res.status(500).send({ message: 'Error fetching patient data' });
            }
            res.send(result);
        });
    });

    // Fetch patients by room number and state (e.g., active)
    router.get('/roomnumber', async (req, res) => {
        const { roomnumber, state } = req.query;

        if (!roomnumber || !state) {
            return res.status(400).send({ message: 'Room number and state are required' });
        }

        const sql = 'SELECT * FROM Patients WHERE roomnumber = ? AND state = ?';
        db.query(sql, [roomnumber, state], (err, result) => {
            if (err) {
                console.error('Error fetching patient data:', err);
                return res.status(500).send({ message: 'Error fetching patient data' });
            }
            res.send(result);
        });
    });

    // API to add to log
    router.post('/add-log', (req, res) => {
        const { input_user_id, patient_id, time, date, nutrition_id, category, corrected_amount } = req.body;
        if (!input_user_id || !patient_id || !time || !date || !nutrition_id || !category || !corrected_amount) {
            return res.status(400).send({ message: 'Not all fields were added correctly' });
        }

        const sql = 'INSERT INTO Logs (input_user_id, patient_id, time, date, nutrition_id, category, corrected_amount) VALUES (?, ?, ?, ?, ?, ?, ?)';
        db.query(sql, [input_user_id, patient_id, time, date, nutrition_id, category, corrected_amount], (err, result) => {
            if (err) {
                console.error('Error adding log:', err);
                return res.status(500).send({ message: 'Error adding log' });
            }
            res.send({ message: 'Log added successfully' });
        });
    });


    // API to add to log
    router.post('/add-logOut', (req, res) => {
        const { input_user_id, patient_id, time, date, category, amount } = req.body;
        if (!input_user_id || !patient_id || !time || !date|| !category || !amount) {
            return res.status(400).send({ message: 'Not all fields were added correctly' });
        }

        const sql = 'INSERT INTO LogsOut (input_user_id, patient_id, time, date, category, amount) VALUES (?, ?, ?, ?, ?, ?)';
        db.query(sql, [input_user_id, patient_id, time, date, category, amount], (err, result) => {
            if (err) {
                console.error('Error adding logOut:', err);
                return res.status(500).send({ message: 'Error adding logOut' });
            }
            res.send({ message: 'LogOut added successfully' });
        });
    });

    // get the barcodes
    app.get('/get-products', (req, res) => {
        const query = `
          SELECT B.barcode, NV.dish AS name, NV.water 
          FROM Barcodes B 
          INNER JOIN NutritionValues NV ON B.nutrition_id = NV.id`;
      
        db.query(query, (err, results) => {
          if (err) {
            console.error('Error fetching products:', err);
            return res.status(500).json({ error: 'Error fetching product data' });
          }
      
          res.status(200).json(results);
        });
      });

    return router; // Return the router object with all defined routes
};
