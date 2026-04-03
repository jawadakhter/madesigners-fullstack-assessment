const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
});

// --- YEH LINES ADD KAREIN CONNECTION CHECK KARNE KE LIYE ---
// db.js mein yeh line change karein:
pool.connect()
  .then(() => console.log("✅ PostgreSQL Database Successfully Connected!"))
  .catch(err => console.error("❌ Database Connection Error:", err)); // <--- Yahan se .message hata dein
// -----------------------------------------------------------

module.exports = pool;