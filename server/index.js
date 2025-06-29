const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
const port = 4000; // The port our backend will run on

// Middleware to allow our frontend to talk to this backend
app.use(cors());
app.use(express.json());

// Connect to the SQLite database. 
// This will create the file 'sundayschool.db' if it doesn't exist.
const db = new sqlite3.Database('./sundayschool.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the sundayschool database.');
});

// Create tables if they don't exist
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS students (
        id TEXT PRIMARY KEY,
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

// --- API Endpoints ---

// Get all students
app.get('/api/students', (req, res) => {
    const sql = "SELECT * FROM students";
    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({
            "message": "success",
            "data": rows
        });
    });
});

// Add a new student
app.post('/api/students', (req, res) => {
    const { id, firstName, lastName, dateOfBirth, parentName, parentPhone, medicalNotes, createdAt } = req.body;
    const sql = `INSERT INTO students (id, firstName, lastName, dateOfBirth, parentName, parentPhone, medicalNotes, createdAt) VALUES (?,?,?,?,?,?,?,?)`;
    db.run(sql, [id, firstName, lastName, dateOfBirth, parentName, parentPhone, medicalNotes, createdAt], function(err) {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({
            "message": "success",
            "data": req.body,
            "id": this.lastID
        });
    });
});

// Update a student
app.put('/api/students/:id', (req, res) => {
    const { firstName, lastName, dateOfBirth, parentName, parentPhone, medicalNotes } = req.body;
    const sql = `UPDATE students SET 
        firstName = ?, 
        lastName = ?, 
        dateOfBirth = ?, 
        parentName = ?, 
        parentPhone = ?, 
        medicalNotes = ? 
        WHERE id = ?`;
    db.run(sql, [firstName, lastName, dateOfBirth, parentName, parentPhone, medicalNotes, req.params.id], function(err) {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({ message: "success" });
    });
});

// Get all attendance records
app.get('/api/attendance', (req, res) => {
    const sql = "SELECT * FROM attendance_records";
    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({
            "message": "success",
            "data": rows
        });
    });
});

// Add a new attendance record
app.post('/api/attendance', (req, res) => {
    const { id, studentId, sessionTime, checkinTimestamp } = req.body;
    const sql = `INSERT INTO attendance_records (id, studentId, sessionTime, checkinTimestamp) VALUES (?,?,?,?)`;
    db.run(sql, [id, studentId, sessionTime, checkinTimestamp], function(err) {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({
            "message": "success",
            "data": req.body
        });
    });
});


app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

// Delete a student
app.delete('/api/students/:id', (req, res) => {
    const studentId = req.params.id;
    
    // Use a transaction to ensure both deletions happen or neither do
    db.serialize(() => {
        db.run('BEGIN TRANSACTION');
        
        // First, delete attendance records for the student
        const deleteAttendanceSql = `DELETE FROM attendance_records WHERE studentId = ?`;
        db.run(deleteAttendanceSql, studentId, function(err) {
            if (err) {
                db.run('ROLLBACK');
                res.status(400).json({ "error": err.message });
                return;
            }
        });
        
        // Then, delete the student
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

// NEW: Endpoint to clear all data
app.delete('/api/clear-all-data', (req, res) => {
    console.log("Attempting to clear all data...");

    db.serialize(() => {
        // Use a transaction to ensure all operations succeed or none do.
        db.run('BEGIN TRANSACTION');

        // It's important to delete from the attendance_records first
        // because of the relationship with the students table.
        db.run('DELETE FROM attendance_records', function(err) {
            if (err) {
                db.run('ROLLBACK');
                res.status(400).json({ "error": err.message });
                return;
            }
        });

        // Next, delete all students
        db.run('DELETE FROM students', function(err) {
            if (err) {
                db.run('ROLLBACK');
                res.status(400).json({ "error": err.message });
                return;
            }
        });

        // If both deletions were successful, commit the transaction
        db.run('COMMIT', (err) => {
            if (err) {
                res.status(400).json({ "error": "Commit failed", "details": err.message });
                return;
            }
            console.log("All data cleared successfully.");
            res.json({ message: "All data cleared successfully" });
        });
    });
});


app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});