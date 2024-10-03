const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const path = require('path');
const apiRoutes = require('./apiRoutes'); // Import the apiRoutes module

// Create Express App
const app = express();
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files like HTML, CSS, JS

// MySQL connection configuration
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',  // 'db' will be passed via environment variable
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'scanner_db'
};

// Create a MySQL connection object
let db;

// Function to attempt connecting to the database with retry logic
function connectWithRetry(retries = 10, delay = 2000) {
    db = mysql.createConnection(dbConfig);

    db.connect(err => {
        if (err) {
            console.error(`Error connecting to MySQL: ${err.message}`);
            
            if (retries > 0) {
                console.log(`Retrying to connect in ${delay / 1000} seconds... (${retries} retries left)`);
                setTimeout(() => connectWithRetry(retries - 1, delay), delay);
            } else {
                console.error('Could not establish a connection to MySQL. Exiting.');
                process.exit(1);  // Exit the app if the connection cannot be established after retries
            }
        } else {
            console.log('Connected to the MySQL database.');
            startServer();  // Start the Express server only after successful connection
        }
    });

    db.on('error', function (err) {
        console.error('Database error', err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            console.log('Connection lost. Reconnecting...');
            connectWithRetry();
        }
    });
}

// Start the server only after the MySQL connection is established
function startServer() {
    // Mount the API routes
    app.use('/api', apiRoutes(db)); // Use the routes defined in apiRoutes.js

    // Serve the index page
    app.get('/', (req, res) => {
        res.sendFile(path.join(__dirname, 'public', 'index.html'));
    });

    // Serve the manage page
    app.get('/manage.html', (req, res) => {
        res.sendFile(path.join(__dirname, 'public', 'manage.html'));
    });

    // Start the Express server
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

// Start connecting to the database
connectWithRetry();
