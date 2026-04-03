const express = require('express');
const http = require('http'); // HTTP module added for Socket.io
const { Server } = require('socket.io'); // Socket.io import
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const db = require('./db');
const authenticateJWT = require('./middleware/auth');
const aiRoutes = require('./routes/aiRoutes'); // AI routes import

const app = express();
const server = http.createServer(app); // Wrapped Express app in HTTP server

// Socket.io Setup
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST", "PUT", "DELETE"] }
});

// Socket connection listener
io.on('connection', (socket) => {
  console.log(`User connected via WebSocket: ${socket.id}`);
});

// Middlewares
app.use(cors());
app.use(express.json());

// Rate Limiting: max 100 requests per minute per IP
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, 
  max: 100,
  message: "Too many requests from this IP, please try again after a minute"
});
app.use(limiter);

// AI Routes
app.use('/api/ai', aiRoutes);

// ==========================================
// 1. AUTHENTICATION (POST /auth/login)
// ==========================================
app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) return res.status(401).json({ error: "User not found" });

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// ==========================================
// CAMPAIGN ENDPOINTS (Protected by JWT) 
// ==========================================

// GET /campaigns - List all
app.get('/campaigns', async (req, res) => {
  try {
    const { sort = 'id', order = 'asc', limit = 10, page = 1 } = req.query;
    const offset = (page - 1) * limit;

    const result = await db.query(
      `SELECT * FROM campaigns WHERE deleted_at IS NULL ORDER BY ${sort} ${order} LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /campaigns/:id - Single campaign
app.get('/campaigns/:id', authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM campaigns WHERE id = $1 AND deleted_at IS NULL', [id]);
    
    if (result.rows.length === 0) return res.status(404).json({ error: "Campaign not found" });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /campaigns - Create new
app.post('/campaigns', authenticateJWT, async (req, res) => {
  const { name, client, status, budget } = req.body;
  
  if (!name || !client || !budget) {
    return res.status(400).json({ error: "Name, client, and budget are required fields." });
  }

  try {
    const result = await db.query(
      'INSERT INTO campaigns (name, client, status, budget) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, client, status || 'Active', budget]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /campaigns/:id - Update & Emit Socket Alert
app.put('/campaigns/:id', authenticateJWT, async (req, res) => {
  const { id } = req.params;
  const { name, client, status, budget, spend, impressions, clicks, conversions } = req.body;

  try {
    const result = await db.query(
      `UPDATE campaigns 
       SET name = COALESCE($1, name), 
           client = COALESCE($2, client), 
           status = COALESCE($3, status), 
           budget = COALESCE($4, budget),
           spend = COALESCE($5, spend),
           impressions = COALESCE($6, impressions),
           clicks = COALESCE($7, clicks),
           conversions = COALESCE($8, conversions)
       WHERE id = $9 AND deleted_at IS NULL RETURNING *`,
      [name, client, status, budget, spend, impressions, clicks, conversions, id]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: "Campaign not found" });

    const updatedCampaign = result.rows[0];

    // Alert Engine Logic: Check if spend > 90% of budget
    if (updatedCampaign.spend && updatedCampaign.budget) {
        const spendPercentage = (updatedCampaign.spend / updatedCampaign.budget) * 100;
        if (spendPercentage > 90) {
            io.emit('campaign_alert', {
                message: `Alert: Campaign "${updatedCampaign.name}" has used ${spendPercentage.toFixed(1)}% of its budget!`,
                campaignId: updatedCampaign.id,
                time: new Date()
            });
        }
    }

    res.json(updatedCampaign);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /campaigns/:id - Soft Delete
app.delete('/campaigns/:id', authenticateJWT, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query(
      'UPDATE campaigns SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1 AND deleted_at IS NULL RETURNING *',
      [id]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: "Campaign not found or already deleted" });
    res.json({ message: "Campaign deleted successfully (Soft Delete)" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT} with WebSockets`);
});