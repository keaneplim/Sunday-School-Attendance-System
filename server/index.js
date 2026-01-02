require('dotenv').config();
const express = require('express');
const { Pool } = require('pg'); // <-- This line is crucial
const cors = require('cors');

const app = express();
const port = process.env.PORT || 4000;

// --- Passwords and Secrets from Environment Variables ---
const TEACHER_PASSWORD = process.env.TEACHER_PASSWORD;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const ADMIN_SECRET_HEADER = process.env.ADMIN_SECRET_HEADER;
const CLEAR_DATA_PASSWORD = process.env.CLEAR_DATA_PASSWORD;

app.use(cors());
app.use(express.json());

// --- Connect to Supabase (PostgreSQL) ---
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// --- Security Middleware (No changes) ---
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

// --- API ENDPOINTS (Updated for PostgreSQL) ---

app.post('/api/login', (req, res) => {
    const { password } = req.body;
    if (password === TEACHER_PASSWORD) {
        return res.json({ success: true, isAdmin: false, secret: ADMIN_SECRET_HEADER });
    }
    res.status(401).json({ success: false, error: "Invalid password" });
});

app.post('/api/admin-login', checkAuth, (req, res) => {
    const { password } = req.body;
    if (password === ADMIN_PASSWORD) {
        return res.json({ success: true, isAdmin: true, secret: ADMIN_SECRET_HEADER });
    }
    res.status(401).json({ success: false, error: "Invalid admin password" });
});

app.post('/api/verify-clear-data-password', checkAdmin, async (req, res) => {
    const { password } = req.body;
    if (password === CLEAR_DATA_PASSWORD) {
        res.json({ success: true });
    } else {
        res.status(401).json({ success: false, error: "Incorrect clear data password" });
    }
});

app.get('/api/students', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM students');
        res.json({ "message": "success", "data": result.rows });
    } catch (err) {
        res.status(400).json({ "error": err.message });
    }
});

app.post('/api/students', checkAuth, async (req, res) => {
    const { id, nickname, firstName, lastName, dateOfBirth, grade, parentName, parentPhone, medicalNotes, createdAt } = req.body;
    const sql = `INSERT INTO students (id, nickname, "firstName", "lastName", "dateOfBirth", grade, "parentName", "parentPhone", "medicalNotes", "createdAt") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`;
    try {
        await pool.query(sql, [id, nickname, firstName, lastName, dateOfBirth, grade, parentName, parentPhone, medicalNotes, createdAt]);
        res.json({ "message": "success", "data": req.body });
    } catch (err) {
        res.status(400).json({ "error": err.message });
    }
});

app.put('/api/students/:id', checkAdmin, async (req, res) => {
    const { nickname, firstName, lastName, dateOfBirth, grade, parentName, parentPhone, medicalNotes } = req.body;
    const sql = `UPDATE students SET nickname = $1, "firstName" = $2, "lastName" = $3, "dateOfBirth" = $4, grade = $5, "parentName" = $6, "parentPhone" = $7, "medicalNotes" = $8 WHERE id = $9`;
    try {
        await pool.query(sql, [nickname, firstName, lastName, dateOfBirth, grade, parentName, parentPhone, medicalNotes, req.params.id]);
        res.json({ message: "success" });
    } catch (err) {
        res.status(400).json({ "error": err.message });
    }
});

app.delete('/api/students/:id', checkAdmin, async (req, res) => {
    try {
        await pool.query(`DELETE FROM students WHERE id = $1`, [req.params.id]);
        res.json({ "message": "deleted" });
    } catch (err) {
        res.status(400).json({ "error": err.message });
    }
});

app.delete('/api/clear-all-data', checkAdmin, async (req, res) => {
    try {
        await pool.query('TRUNCATE TABLE students, attendance_records RESTART IDENTITY CASCADE');
        res.json({ message: "All data cleared successfully" });
    } catch (err) {
        res.status(400).json({ "error": err.message });
    }
});

app.get('/api/attendance', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM attendance_records');
        res.json({ "message": "success", "data": result.rows });
    } catch (err) {
        res.status(400).json({ "error": err.message });
    }
});

app.get('/api/healthcheck', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'Server is awake' });
});

app.post('/api/attendance', async (req, res) => {
    const { id, studentId, sessionTime, checkinTimestamp } = req.body;
    const sql = `INSERT INTO attendance_records (id, "studentId", "sessionTime", "checkinTimestamp") VALUES ($1, $2, $3, $4)`;
    try {
        await pool.query(sql, [id, studentId, sessionTime, checkinTimestamp]);
        res.json({ "message": "success", "data": req.body });
    } catch (err) {
        res.status(400).json({ "error": err.message });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
