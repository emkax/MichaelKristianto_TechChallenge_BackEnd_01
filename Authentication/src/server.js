/*
    ============================================================
    MAIN SERVER FLOW
    ============================================================

    File ini adalah entry point utama backend (server)

    Alur kerja secara umum:

    1. Load konfigurasi environment dari file .env
    (mislnya PORT, database URL,dll).

    2. Inisialisasi Express untuk membuat server API.

    3. Mengaktifkan middleware:
    - express.json() agar server bisa membaca request body JSON
    - cors() agar request dari browser (frontend) diizinkan

    4. Import dan daftarakan route dari folder routes
    Semua endpoint dengan prefix "/authenticate" akan
    diarahkan ke file authenticate.route.js

    5. Jalankan server pada PORT yang ditentukan
    (default 3000 jika tidak ada di .env)

    ============================================================
*/

const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const cors = require("cors");


// Load .env
dotenv.config({ path: path.join(__dirname, "config/.env") });

const app = express();
app.use(express.json());

// Allow browser request
app.use(cors());

// Import routes
const authenticateRoutes = require(path.join(__dirname,"routes/authenticate.route.js"));
app.use("/authenticate", authenticateRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
