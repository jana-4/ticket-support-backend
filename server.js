const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors()); // Enable CORS

// SQLite3 Database setup
const db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
        console.error('Database connection error:', err.message);
        process.exit(1); // Exit the process if the database connection fails
    } else {
        console.log('Connected to the SQLite database.');
        db.run(`CREATE TABLE IF NOT EXISTS tickets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            category TEXT,
            title TEXT,
            description TEXT,
            status TEXT DEFAULT 'Open',
            priority TEXT
        )`, (err) => {
            if (err) {
                console.error('Error creating table:', err.message);
                process.exit(1); // Exit the process if table creation fails
            } else {
                console.log('Tickets table created or already exists.');
            }
        });
    }
});

// POST /tickets - Create a new ticket
app.post('/tickets', (req, res) => {
    const { category, title, description, status, priority } = req.body;
    const sql = `INSERT INTO tickets (category, title, description, status, priority) VALUES (?, ?, ?, ?, ?)`;
    const params = [category, title, description, status, priority];

    db.run(sql, params, function(err) {
        if (err) {
            console.error('Error creating ticket:', err.message);
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({
            message: 'Ticket created successfully',
            ticketId: this.lastID
        });
    });
});

// GET /tickets - Get all tickets
app.get('/tickets', (req, res) => {
    const { category } = req.query;
    let sql = `SELECT * FROM tickets`;
    const params = [];

    if (category) {
        sql += ` WHERE category = ?`;
        params.push(category);
    }

    db.all(sql, params, (err, rows) => {
        if (err) {
            console.error('Error fetching tickets:', err.message);
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Start server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
