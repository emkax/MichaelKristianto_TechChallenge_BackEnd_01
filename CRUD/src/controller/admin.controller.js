/*
    ============================================================
    ADMIN CONTROLLER
    ============================================================
    File ini berisi logic utama untuk mengelola data Coffee
    yang terhubung langsung ke database menggunakan Prisma.

    Alur kerja secara umum:

    1. Load konfigurasi database dari file .env
    2. Inisialisaai Prisma Client dengan adapter MariaDB
    untuk konek ke db (bisa disesuaikan dengan jenis database)
    3. Setiap function (get, add, update, delete)
    akan dipanggil oleh route
    4. Function tersebut menjalankan query ke database
    melalui prisma.coffee
    5. Jika berhasil maka kirim response sukses (JSON)
    6. Jika terjadi error maka kirim response error
    dengan status code yang sesuai

    File ini bertanggung jawab atas:
    - Validasi sederhana input
    - Interaksi database
    - Pengiriman response ke client
    ============================================================
*/


const { PrismaClient } = require("@prisma/client");
const { PrismaMariaDb } = require("@prisma/adapter-mariadb");
const path = require('path');

const adapter = new PrismaMariaDb({
    host: process.env.DATABASE_HOST,
    port: Number(process.env.DATABASE_PORT) || 3306,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    connectionLimit: 5
});

const prisma = new PrismaClient({ adapter });

// GET all coffee
exports.getCoffee = async (req, res) => {
    try {
        const coffees = await prisma.coffee.findMany();
        res.status(200).json({ success: true, data: coffees });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// POST new coffee
exports.addCoffee = async (req, res) => {
    try {
        const { name, description, price, stock, size } = req.body;

        if (!name || !price || !size)
            return res.status(400).json({ message: "name, price, size required" });

        const newCoffee = await prisma.coffee.create({
            data: {
                name,
                description: description ?? null,
                price: Number(price),
                stock: stock ?? 0,
                size
            }
        });

        res.status(201).json({ success: true, data: newCoffee });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// UPDATE coffee (by id)
exports.updateCoffee = async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (!id) return res.status(400).json({ message: "Invalid ID" });

        const { name, description, price, stock, size } = req.body;

        const updated = await prisma.coffee.update({
            where: { id },
            data: { name, description, price, stock, size }
        });

        res.json({ success: true, data: updated });
    } catch (err) {
        if (err.code === "P2025")
            return res.status(404).json({ message: "Coffee not found" });
        res.status(500).json({ success: false, message: err.message });
    }
};

// DELETE coffee
exports.deleteCoffee = async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (!id) return res.status(400).json({ message: "Invalid ID" });

        await prisma.coffee.delete({ where: { id } });

        res.json({ success: true, message: "Deleted" });
    } catch (err) {
        if (err.code === "P2025")
            return res.status(404).json({ message: "Coffee not found" });
        res.status(500).json({ success: false, message: err.message });
    }
};