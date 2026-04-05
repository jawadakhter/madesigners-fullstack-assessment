const { Pool } = require('pg');
require('dotenv').config();

let pool;

if (process.env.DATABASE_URL) {
    pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });
} else {
    pool = new Pool({
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        database: process.env.DB_NAME,
    });
}

// Pooled error handling (zaroori hai)
pool.on('error', (err) => {
    console.error('❌ Unexpected error on idle database client', err.message);
});

// Connection check: query use karein taake client release ho jaye
pool.query('SELECT NOW()')
    .then(() => console.log("✅ PostgreSQL Database Successfully Connected!"))
    .catch(err => console.error("❌ Database Connection Error:", err));

module.exports = pool;