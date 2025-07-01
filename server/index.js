const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
const port = 4000;

// --- SECURITY SETUP ---
// This is the password you will use to log in.
const ADMIN_PASSWORD = "rpcckidsmedan";
// This is a "secret key" the app uses after you log in.
const ADMIN_SECRET_HEADER = "rpcc-admin-secret"; 

app.use(cors());
app.use(express.json());

// --- DATABASE CONNECTION (No changes here) ---
const db = new sqlite3.Database('./sundayschool.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the sundayschool database.');
});

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS students (
        id TEXT PRIMARY KEY,
        nickname TEXT NOT NULL,
        firstName TEXT NOT NULL,
        lastName TEXT NOT NULL,
        dateOfBirth TEXT NOT NULL,
        parentName TEXT NOT NULL,
        parentPhone TEXT NOT NULL,
        medicalNotes TEXT,
        createdAt TEXT NOT NULL
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS attendance_records (
        id TEXT PRIMARY KEY,
        studentId TEXT NOT NULL,
        sessionTime TEXT NOT NULL,
        checkinTimestamp TEXT NOT NULL,
        FOREIGN KEY (studentId) REFERENCES students (id)
    )`);
});

// --- SECURITY MIDDLEWARE ---
// This function acts as a "guard" for protected routes.
const checkAdmin = (req, res, next) => {
    if (req.headers['admin-secret'] === ADMIN_SECRET_HEADER) {
        next(); // If the secret is correct, proceed.
    } else {
        res.status(403).json({ "error": "Forbidden: Admin access required" });
    }
};

// --- API ENDPOINTS ---

// NEW: Login endpoint for the admin
app.post('/api/login', (req, res) => {
    const { password } = req.body;
    if (password === ADMIN_PASSWORD) {
        res.json({
            message: "Login successful",
            secret: ADMIN_SECRET_HEADER
        });
    } else {
        res.status(401).json({ error: "Invalid password" });
    }
});

// Get all students (Public)
app.get('/api/students', (req, res) => {
    const sql = "SELECT * FROM students";
    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({ "message": "success", "data": rows });
    });
});

// Add a new student (Public - NO 'checkAdmin' guard)
app.post('/api/students', (req, res) => {
    const { id, nickname, firstName, lastName, dateOfBirth, parentName, parentPhone, medicalNotes, createdAt } = req.body;
    const sql = `INSERT INTO students (id, nickname, firstName, lastName, dateOfBirth, parentName, parentPhone, medicalNotes, createdAt) VALUES (?,?,?,?,?,?,?,?,?)`;
    db.run(sql, [id, nickname, firstName, lastName, dateOfBirth, parentName, parentPhone, medicalNotes, createdAt], function(err) {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({ "message": "success", "data": req.body, "id": this.lastID });
    });
});

// Update a student (Protected - REQUIRES 'checkAdmin' guard)
app.put('/api/students/:id', checkAdmin, (req, res) => {
    const { nickname, firstName, lastName, dateOfBirth, parentName, parentPhone, medicalNotes } = req.body;
    const sql = `UPDATE students SET nickname = ?, firstName = ?, lastName = ?, dateOfBirth = ?, parentName = ?, parentPhone = ?, medicalNotes = ? WHERE id = ?`;
    db.run(sql, [nickname, firstName, lastName, dateOfBirth, parentName, parentPhone, medicalNotes, req.params.id], function(err) {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({ message: "success" });
    });
});

// Delete a student (Protected - REQUIRES 'checkAdmin' guard)
app.delete('/api/students/:id', checkAdmin, (req, res) => {
    const studentId = req.params.id;
    db.serialize(() => {
        db.run('BEGIN TRANSACTION');
        const deleteAttendanceSql = `DELETE FROM attendance_records WHERE studentId = ?`;
        db.run(deleteAttendanceSql, studentId, function(err) {
            if (err) {
                db.run('ROLLBACK');
                res.status(400).json({ "error": err.message });
                return;
            }
        });
        const deleteStudentSql = `DELETE FROM students WHERE id = ?`;
        db.run(deleteStudentSql, studentId, function(err) {
            if (err) {
                db.run('ROLLBACK');
                res.status(400).json({ "error": err.message });
                return;
            }
        });
        db.run('COMMIT', (err) => {
            if (err) {
                res.status(400).json({ "error": "Commit failed", "details": err.message });
                return;
            }
            res.json({ "message": "deleted", "changes": this.changes });
        });
    });
});

// Clear all data (Protected - REQUIRES 'checkAdmin' guard)
app.delete('/api/clear-all-data', checkAdmin, (req, res) => {
    db.serialize(() => {
        db.run('BEGIN TRANSACTION');
        db.run('DELETE FROM attendance_records', function(err) {
            if (err) {
                db.run('ROLLBACK');
                res.status(400).json({ "error": err.message });
                return;
            }
        });
        db.run('DELETE FROM students', function(err) {
            if (err) {
                db.run('ROLLBACK');
                res.status(400).json({ "error": err.message });
                return;
            }
        });
        db.run('COMMIT', (err) => {
            if (err) {
                res.status(400).json({ "error": "Commit failed", "details": err.message });
                return;
            }
            res.json({ message: "All data cleared successfully" });
        });
    });
});

// Get/Add attendance records (Public)
app.get('/api/attendance', (req, res) => {
    const sql = "SELECT * FROM attendance_records";
    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({ "message": "success", "data": rows });
    });
});
app.post('/api/attendance', (req, res) => {
    const { id, studentId, sessionTime, checkinTimestamp } = req.body;
    const sql = `INSERT INTO attendance_records (id, studentId, sessionTime, checkinTimestamp) VALUES (?,?,?,?)`;
    db.run(sql, [id, studentId, sessionTime, checkinTimestamp], function(err) {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({ "message": "success", "data": req.body });
    });
});


app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});