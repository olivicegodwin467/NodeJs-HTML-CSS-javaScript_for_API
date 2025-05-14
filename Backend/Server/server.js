const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");

const app = express();
const port = 5000;

// Middleware to parse JSON
app.use(express.json());
app.use(cors({
    origin: "http://127.0.0.1:5500" // Allow only this origin
}));

// Connect to SQLite database
const db = new sqlite3.Database("./database.db", (err) => {
    if (err) {
        console.error("Error connecting to database:", err.message);
    } else {
        console.log("Connected to SQLite database.");
    }
});

// Create `users` table if it doesn't exist
db.run(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        age INTEGER NOT NULL,
        gender TEXT NOT NULL,
        pro TEXT NOT NULL,
        isMarried BOOLEAN NOT NULL,
        email TEXT UNIQUE NOT NULL
    )
`, (err) => {
    if (err) {
        console.error("Error creating table:", err.message);
    } else {
        console.log("Table 'users' is ready.");
    }
});

// GET all data
app.get("/api/data", (req, res) => {
    db.all("SELECT * FROM users", [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.status(200).json(rows);
        }
    });
});

// GET single data by ID
app.get("/api/data/:id", (req, res) => {
    const id = parseInt(req.params.id);
    db.get("SELECT * FROM users WHERE id = ?", [id], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else if (row) {
            res.status(200).json(row);
        } else {
            res.status(404).json({ error: "Record not found" });
        }
    });
});

// POST new data
app.post("/api/data", (req, res) => {
    const { name, age, gender, pro, isMarried, email } = req.body;

    if (!name || !age || !gender || !pro || !email) {
        return res.status(400).json({ error: "Invalid input. All fields are required." });
    }

    const sql = `INSERT INTO users (name, age, gender, pro, isMarried, email)
                 VALUES (?, ?, ?, ?, ?, ?)`;
    const params = [name, age, gender, pro, isMarried, email];

    db.run(sql, params, function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.status(201).json({ message: "Record added", id: this.lastID });
        }
    });
});

// PUT (update) existing data by ID
app.put("/api/data/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const { name, age, gender, pro, isMarried, email } = req.body;

    const sql = `UPDATE users SET
                 name = COALESCE(?, name),
                 age = COALESCE(?, age),
                 gender = COALESCE(?, gender),
                 pro = COALESCE(?, pro),
                 isMarried = COALESCE(?, isMarried),
                 email = COALESCE(?, email)
                 WHERE id = ?`;
    const params = [name, age, gender, pro, isMarried, email, id];

    db.run(sql, params, function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
        } else if (this.changes === 0) {
            res.status(404).json({ error: "Record not found" });
        } else {
            res.status(200).json({ message: "Record updated" });
        }
    });
});

// DELETE data by ID
app.delete("/api/data/:id", (req, res) => {
    const id = parseInt(req.params.id);
    db.run("DELETE FROM users WHERE id = ?", [id], function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
        } else if (this.changes === 0) {
            res.status(404).json({ error: "Record not found" });
        } else {
            res.status(200).json({ message: "Record deleted" });
        }
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
