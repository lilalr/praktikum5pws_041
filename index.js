const express = require("express");
const crypto = require("crypto");
const mysql = require("mysql2"); 

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static("public"));

// --- SAMBUNGAN DATABASE ---
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Mysql2lila', // Pastikan password ini benar
    database: 'apikeya',
    port: 3308 // Pastikan port ini benar
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to database: ' + err.stack);
        return;
    }
    console.log('Berhasil terhubung ke database MySQL.');
});
// ----------------------------


// --- ENDPOINT GENERATE (/generate-api-key) ---
app.post("/generate-api-key", (req, res) => {
    console.log("Request diterima di /generate-api-key");
    const key = "sk_live_" + crypto.randomBytes(32).toString("hex");

    // Query untuk menyimpan key baru, menggunakan kolom apikey_a
    const sql = "INSERT INTO apikeya_lila (apikey_a) VALUES (?)"; 
    
    db.query(sql, [key], (err, result) => {
        if (err) {
            // Log ini akan muncul di terminal jika ada error SQL
            console.error('SQL FAILED:', err.code, err.sqlMessage); 
            
            return res.status(500).json({
                status: "error",
                message: "Kesalahan server saat menyimpan data." 
            });
        }

        console.log("Key baru berhasil disimpan ke DB.");
        res.status(201).json({
            status: "sukses",
            apiKey: key // Respon API Key tetap menggunakan 'apiKey'
        });
    });
});

// --- ENDPOINT CHECK (/check) ---
app.post("/check", (req, res) => {
    // Minta properti 'apikey_a' dari body
    const { apikey_a } = req.body; 
    
    console.log("Request diterima di /check. API Key:", apikey_a);

    if (!apikey_a) {
        return res.status(400).json({
            status: "error",
            message: "API key tidak boleh kosong"
        });
    }

    // Query untuk mengecek key, menggunakan kolom apikey_a
    const sql = "SELECT * FROM apikeya_lila WHERE apikey_a = ?"; 

    db.query(sql, [apikey_a], (err, results) => {
        if (err) {
            console.error('SQL FAILED:', err.code, err.sqlMessage);
            return res.status(500).json({
                status: "error",
                message: "Kesalahan server saat validasi"
            });
        }

        if (results.length > 0) {
            res.json({
                status: "sukses",
                message: "API key valid"
            });
        } else {
            res.status(400).json({
                status: "error",
                message: "API key tidak valid"
            });
        }
    });
});

app.listen(port, () => {
    console.log(`Server berjalan di http://localhost:${port}`);
});