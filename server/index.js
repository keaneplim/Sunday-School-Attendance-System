const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
const port = 4000;

const TEACHER_PASSWORD = "teacher123";
const ADMIN_PASSWORD = "rpcckidsmedan";
const ADMIN_SECRET_HEADER = "rpcc-admin-secret";
const CLEAR_DATA_PASSWORD = "IamSUREthatIwantTOclearTHEdata";

app.use(cors());
app.use(express.json());

const db = new sqlite3.Database('./sundayschool.db', (err) => {
    if (err) {
        console.error(err.message);
    } else {
        console.log('Connected to the sundayschool database.');
    }
});

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS students (id TEXT PRIMARY KEY, nickname TEXT NOT NULL, firstName TEXT NOT NULL, lastName TEXT NOT NULL, dateOfBirth TEXT NOT NULL, parentName TEXT NOT NULL, parentPhone TEXT NOT NULL, medicalNotes TEXT, createdAt TEXT NOT NULL)`);
    db.run(`CREATE TABLE IF NOT EXISTS attendance_records (id TEXT PRIMARY KEY, studentId TEXT NOT NULL, sessionTime TEXT NOT NULL, checkinTimestamp TEXT NOT NULL, FOREIGN KEY (studentId) REFERENCES students (id))`);
});

const checkAuth = (req, res, next) => {
    if (req.headers['auth-secret'] === ADMIN_SECRET_HEADER) {
        next();
    } else {
        res.status(403).json({ "error": "Forbidden: Login required" });
    }
};

const checkAdmin = (req, res, next) => {
    if (req.headers['admin-secret'] === ADMIN_SECRET_HEADER && req.headers.role === 'admin') {
        next();
    } else {
        res.status(403).json({ "error": "Forbidden: Admin access required" });
    }
};

// --- API ENDPOINTS ---

// STEP 1: Initial Login (Teachers and Admins use this)
// This endpoint now ONLY accepts the teacher password.
app.post('/api/login', (req, res) => {
    const { password } = req.body;
    if (password === TEACHER_PASSWORD) {
        // Always returns isAdmin: false on initial login
        return res.json({ success: true, isAdmin: false, secret: ADMIN_SECRET_HEADER });
    }
    // Any other password (including the admin password) will fail here.
    res.status(401).json({ success: false, error: "Invalid password" });
});

// STEP 2: Admin-only privilege escalation
// This new endpoint is used by the Admin Login modal.
app.post('/api/admin-login', checkAuth, (req, res) => {
    const { password } = req.body;
    if (password === ADMIN_PASSWORD) {
        // If the password is correct, grant admin privileges.
        return res.json({ success: true, isAdmin: true, secret: ADMIN_SECRET_HEADER });
    }
    res.status(401).json({ success: false, error: "Invalid admin password" });
});


app.post('/api/verify-clear-data-password', checkAdmin, (req, res) => {
    const { password } = req.body;
    if (password === CLEAR_DATA_PASSWORD) {
        res.json({ success: true });
    } else {
        res.status(401).json({ success: false, error: "Incorrect clear data password" });
    }
});

app.get('/api/students', (req, res) => {
    const sql = "SELECT * FROM students";
    db.all(sql, [], (err, rows) => {
        if (err) res.status(400).json({ "error": err.message });
        else res.json({ "message": "success", "data": rows });
    });
});

app.post('/api/students', checkAuth, (req, res) => {
    const { id, nickname, firstName, lastName, dateOfBirth, parentName, parentPhone, medicalNotes, createdAt } = req.body;
    const sql = `INSERT INTO students (id, nickname, firstName, lastName, dateOfBirth, parentName, parentPhone, medicalNotes, createdAt) VALUES (?,?,?,?,?,?,?,?,?)`;
    db.run(sql, [id, nickname, firstName, lastName, dateOfBirth, parentName, parentPhone, medicalNotes, createdAt], function(err) {
        if (err) res.status(400).json({ "error": err.message });
        else res.json({ "message": "success", "data": req.body, "id": this.lastID });
    });
});

app.put('/api/students/:id', checkAdmin, (req, res) => {
    const { nickname, firstName, lastName, dateOfBirth, parentName, parentPhone, medicalNotes } = req.body;
    const sql = `UPDATE students SET nickname = ?, firstName = ?, lastName = ?, dateOfBirth = ?, parentName = ?, parentPhone = ?, medicalNotes = ? WHERE id = ?`;
    db.run(sql, [nickname, firstName, lastName, dateOfBirth, parentName, parentPhone, medicalNotes, req.params.id], function(err) {
        if (err) res.status(400).json({ "error": err.message });
        else res.json({ message: "success" });
    });
});

app.delete('/api/students/:id', checkAdmin, (req, res) => {
    const studentId = req.params.id;
    db.serialize(() => {
        db.run('BEGIN TRANSACTION');
        db.run(`DELETE FROM attendance_records WHERE studentId = ?`, studentId, function(err) { if (err) { db.run('ROLLBACK'); res.status(400).json({ "error": err.message }); return; } });
        db.run(`DELETE FROM students WHERE id = ?`, studentId, function(err) { if (err) { db.run('ROLLBACK'); res.status(400).json({ "error": err.message }); return; } });
        db.run('COMMIT', (err) => {
            if (err) res.status(400).json({ "error": "Commit failed", "details": err.message });
            else res.json({ "message": "deleted" });
        });
    });
});

app.delete('/api/clear-all-data', checkAdmin, (req, res) => {
    db.serialize(() => {
        db.run('BEGIN TRANSACTION');
        db.run('DELETE FROM attendance_records', function(err) {
            if (err) { db.run('ROLLBACK'); res.status(400).json({ "error": err.message }); return; }
        });
        db.run('DELETE FROM students', function(err) {
            if (err) { db.run('ROLLBACK'); res.status(400).json({ "error": err.message }); return; }
        });
        db.run('COMMIT', (err) => {
            if (err) { res.status(400).json({ "error": "Commit failed", "details": err.message }); return; }
            res.json({ message: "All data cleared successfully" });
        });
    });
});

app.get('/api/attendance', (req, res) => {
    const sql = "SELECT * FROM attendance_records";
    db.all(sql, [], (err, rows) => {
        if (err) { res.status(400).json({ "error": err.message }); return; }
        res.json({ "message": "success", "data": rows });
    });
});

app.post('/api/attendance', (req, res) => {
    const { id, studentId, sessionTime, checkinTimestamp } = req.body;
    const sql = `INSERT INTO attendance_records (id, studentId, sessionTime, checkinTimestamp) VALUES (?,?,?,?)`;
    db.run(sql, [id, studentId, sessionTime, checkinTimestamp], function(err) {
        if (err) { res.status(400).json({ "error": err.message }); return; }
        res.json({ "message": "success", "data": req.body });
    });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});