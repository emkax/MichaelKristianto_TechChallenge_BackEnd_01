/*
    ============================================================
    ROUTER FLOW
    ============================================================
    File ini mendefinisikan endpoint untuk autentikasi user
    menggunakan Express Router.

    Alur kerja secara umum:

    1. Import controller (register, login, me) dan middleware protect
       untuk route yang membutuhkan autentikasi
    2. Definisikan route:
       - POST /register -> memanggil register() untuk mendaftar user baru
       - POST /login -> memanggil login() untuk login user
       - GET /me -> route protected, memanggil middleware protect
         untuk memastikan user sudah login, lalu memanggil me() untuk
         mengembalikan data user saat ini
    3. Export router agar dapat dipasang di app utama (di sini di /authenticate)

    File ini bertanggung jawab atas:
    - Menyambungkan route HTTP ke fungsi controller
    - Menentukan route yang memerlukan autentikasi (protected)

    ============================================================
*/

const express = require("express");
const router = express.Router();
const { register, login, me } = require("../controller/authenticate.controller");
const { protect } = require("../middleware/authenticate.middleware");

// Register new user
router.post("/register", register);

// Login user
router.post("/login", login);

// Get current logged-in user (protected route)
router.get("/me", protect, me);

module.exports = router;