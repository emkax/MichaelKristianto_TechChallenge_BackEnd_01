/*
    ============================================================
    AUTHENTICATION MIDDLEWARE (JWT)
    ============================================================
    File ini berfungsi untuk melindungi route yang membutuhkan
    autentikasi dengan JWT dan memastikan user valid.

    Alur kerja secara umum:

    1. Load konfigurasi environment dari file .env (database + JWT secret)
    2. Inisialisasi Prisma Client dengan adapter MariaDB untuk koneksi ke DB
    3. Middleware `protect` dipasang pada route yang membutuhkan autentikasi
    4. Ketika request masuk, middleware:
       - Mengecek header Authorization untuk token JWT
       - Jika tidak ada token -> kirim response 401 Not authorized
       - Jika ada token -> decode token menggunakan jwt.verify
       - Cari user di database sesuai decoded.id
       - Jika user ditemukan -> simpan info user di req.user dan panggil next()
       - Jika user tidak ditemukan atau token invalid -> kirim 401 error
    5. Dengan middleware ini, route berikutnya dapat mengakses
       req.user untuk mengenali user yang terautentikasi

    File ini bertanggung jawab atas:
    - Validasi keberadaan dan keabsahan token JWT
    - Mengecek user di database
    - Mengamankan route dari akses oleh user yang tidak autentikasi
    ============================================================
*/


const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const { PrismaMariaDb } = require("@prisma/adapter-mariadb");
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

exports.protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
    }

    if (!token) return res.status(401).json({ message: "Not authorized, no token" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await prisma.user.findUnique({ where: { id: decoded.id } });

        if (!user) return res.status(401).json({ message: "User not found" });

        req.user = { id: user.id };
        next();
    } catch (err) {
        res.status(401).json({ message: "Token invalid or expired" });
    }
};