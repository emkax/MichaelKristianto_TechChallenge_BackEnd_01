/*
    ============================================================
    ROUTER FLOW
    ============================================================

    File ini berfungsi sebagai pengatur endpoint (routing)
    untuk fitur admin Coffee.

    alur kerja secara umum:

    1. Router menerima request dari server utama
    dengan prefix "/admin".

    2. Setiap endpoint (GET, POST, PUT, DELETE)
    diarahkan ke function yang sesuai di
    admin.controller.js.

    3. Controller yang akan menangani logika bisnis
    seperti mengambil, menambah, mengubah,
    atau menghapus data coffee.

    ============================================================
*/

const express = require("express");
const router = express.Router();

const {
    getCoffee,
    addCoffee,
    updateCoffee,
    deleteCoffee,
} = require("../controller/admin.controller");

// GET all
router.get("/listCoffee", getCoffee);

// CREATE
router.post("/addCoffee", addCoffee);

// UPDATE by id
router.put("/updateCoffee/:id", updateCoffee);

// DELETE by id
router.delete("/deleteCoffee/:id", deleteCoffee);

module.exports = router;
