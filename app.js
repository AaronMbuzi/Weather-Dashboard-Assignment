const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const app = express();
const PORT = process.env.PORT || 3000;

const db = new sqlite3.Database('./weather.db');

// Create weather_data table if it doesn't exist
db.run(`CREATE TABLE IF NOT EXISTS weather_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    city TEXT NOT NULL,
    temperature REAL NOT NULL,
    condition TEXT NOT NULL,
    wind_speed REAL NOT NULL,
    pressure REAL NOT NULL,
    humidity INTEGER NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
)`);

// Create user table if it doesn't exist
db.run(`CREATE TABLE IF NOT EXISTS user (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
)`);

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.post('/register', (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);

    db.run(`INSERT INTO user (username, password) VALUES (?, ?)`, [username, hashedPassword], function(err) {
        if (err) {
            if (err.code === 'SQLITE_CONSTRAINT') {
                return res.status(400).json({ error: 'Username already exists' });
            }
            return res.status(500).json({ error: 'Database error' });
        }
        res.status(201).json({ success: 'User registered successfully' });
    });
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;

    db.get(`SELECT * FROM user WHERE username = ?`, [username], (err, row) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        if (!row || !bcrypt.compareSync(password, row.password)) {
            return res.status(400).json({ error: 'Invalid username or password' });
        }
        res.status(200).json({ success: 'Login successful!' });
    });
});

app.post('/storeWeatherData', (req, res) => {
    const { city, temperature, condition, wind_speed, pressure, humidity } = req.body;
    const sql = `INSERT INTO weather_data (city, temperature, condition, wind_speed, pressure, humidity) 
                 VALUES (?, ?, ?, ?, ?, ?)`;
    db.run(sql, [city, temperature, condition, wind_speed, pressure, humidity], function(err) {
        if (err) {
            console.error('Error storing weather data:', err.message);
            return res.status(500).json({ error: 'Failed to store weather data' });
        }
        res.status(200).json({ success: 'Weather data stored successfully' });
    });
});

app.get('/getWeatherHistory', (req, res) => {
    const sql = `SELECT city, temperature, condition, wind_speed, pressure, humidity, timestamp FROM weather_data`;
    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error('Error fetching weather history:', err.message);
            return res.status(500).json({ error: 'Failed to fetch weather history' });
        }
        res.json(rows);
    });
});


app.use((req, res, next) => {
    res.status(404).json({ error: 'Not Found' });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
