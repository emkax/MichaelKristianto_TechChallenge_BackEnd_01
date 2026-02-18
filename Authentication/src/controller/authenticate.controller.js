/*
    ============================================================
    AUTH CONTROLLER
    ============================================================
    File ini berisi logic utama untuk mengelola autentikasi user
    menggunakan JWT dan Prisma

    Alur kerja secara umum:

    1. Load konfigurasi database dan JWT secret dari file .env
    2. Inisialisasi Prisma Client dengan adapter MariaDB untuk koneksi DB
    3. Fungsi generateToken() membuat JWT untuk user dengan masa berlaku 7 hari
    4. Fungsi register():
       - Validasi input (name, email, password)
       - Cek apakah email sudah terdaftar
       - Hash password dengan bcrypt
       - Simpan user baru ke database
       - Buat token JWT dan kembalikan bersama data user
    5. Fungsi login():
       - Validasi input (email, password)
       - Cari user di database berdasarkan email
       - Cek kecocokan password dengan bcrypt
       - Jika valid, buat token JWT dan kembalikan bersama data user
    6. Fungsi me():
       - Mengambil info user saat ini berdasarkan req.user.id
       - Digunakan pada route protected untuk menampilkan data user yang login

    File ini bertanggung jawab atas:
    - Validasi input untuk register/login
    - Hashing password dan pengecekan kredensial
    - Pembuatan token JWT
    - Interaksi dengan database untuk menyimpan dan mengambil user
    - Mengirimkan response JSON ke client
    ============================================================
*/

const { PrismaClient } = require("@prisma/client");
const { PrismaMariaDb } = require("@prisma/adapter-mariadb");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "../../config/.env") });

const adapter = new PrismaMariaDb({
    host: process.env.DATABASE_HOST,
    port: Number(process.env.DATABASE_PORT) || 3306,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    connectionLimit: 5
});

const prisma = new PrismaClient({ adapter });

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// Register
exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password)
            return res.status(400).json({ message: "All fields required" });

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser)
            return res.status(400).json({ message: "Email already registered" });

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: { name, email, password: hashedPassword },
        });

        const token = generateToken(user.id);

        res.status(201).json({ success: true, token, user: { id: user.id, name: user.name, email: user.email } });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password)
            return res.status(400).json({ message: "Email and password required" });

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return res.status(400).json({ message: "Invalid credentials" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        const token = generateToken(user.id);

        res.json({ success: true, token, user: { id: user.id, name: user.name, email: user.email } });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Get current logged-in user
exports.me = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({ where: { id: req.user.id } });
        res.json({ success: true, user: { id: user.id, name: user.name, email: user.email } });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};