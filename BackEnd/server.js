const express = require('express');
const http = require('http'); // HTTP module added for Socket.io
const { Server } = require('socket.io'); // Socket.io import
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const db = require('./db');
const { v4: uuidv4 } = require('uuid');
const authenticateJWT = require('./middleware/auth');
const aiRoutes = require('./routes/aiRoutes'); // AI routes import

const app = express();
const server = http.createServer(app); // Wrapped Express app in HTTP server

// Socket.io Setup
const io = new Server(server, {
    cors: {
        origin: [
            "http://localhost:5173",
            process.env.FRONTEND_URL || "http://localhost:5173"
        ],
        methods: ["GET", "POST", "PUT", "DELETE"]
    }
});

// Socket connection listener
io.on('connection', (socket) => {
  console.log(`User connected via WebSocket: ${socket.id}`);
});

// Middlewares
app.use(cors({
    origin: [
        "http://localhost:5173",
        "http://localhost:5174",
        process.env.FRONTEND_URL || "http://localhost:5173"
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));

// --- REQUEST/RESPONSE LOGGING MIDDLEWARE ---
app.use((req, res, next) => {
  req.id = uuidv4(); // Unique Request ID
  const start = Date.now();
  console.log(`[Req: ${req.id}] INCOMING: ${req.method} ${req.originalUrl}`);

  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[Req: ${req.id}] OUTGOING: ${req.method} ${req.originalUrl} | Status: ${res.statusCode} | Time: ${duration}ms`);
  });
  next();
});

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
// GET /campaigns - List all (UPDATED with filter)
app.get('/campaigns', authenticateJWT, async (req, res) => {
  try {
    const allowedSortFields = ['id', 'name', 'client', 'status', 'budget', 'spend', 'created_at'];
    const allowedOrder = ['asc', 'desc'];
    const allowedStatuses = ['Active', 'Paused', 'Completed'];

    let { sort = 'id', order = 'asc', limit = 10, page = 1, status, client } = req.query;

    if (!allowedSortFields.includes(sort)) sort = 'id';
    if (!allowedOrder.includes(order.toLowerCase())) order = 'asc';

    limit = Math.min(Math.max(parseInt(limit) || 10, 1), 100);
    page = Math.max(parseInt(page) || 1, 1);
    const offset = (page - 1) * limit;

    // Dynamic WHERE clause for filtering
    let conditions = ['deleted_at IS NULL'];
    let params = [];
    let paramIndex = 1;

    if (status && allowedStatuses.includes(status)) {
      conditions.push(`status = $${paramIndex++}`);
      params.push(status);
    }
    if (client) {
      conditions.push(`client ILIKE $${paramIndex++}`);
      params.push(`%${client}%`);
    }

    const whereClause = conditions.join(' AND ');
    params.push(limit, offset);

    const result = await db.query(
      `SELECT * FROM campaigns WHERE ${whereClause} ORDER BY ${sort} ${order} LIMIT $${paramIndex++} OFFSET $${paramIndex}`,
      params
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

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return res.status(400).json({ error: "Campaign name is required and must be a valid string" });
  }
  if (!client || typeof client !== 'string') {
    return res.status(400).json({ error: "Client name is required" });
  }
  if (!budget || isNaN(budget) || budget <= 0) {
    return res.status(400).json({ error: "Budget must be a positive number" });
  }

  const allowedStatuses = ['Active', 'Paused', 'Completed'];
  const campaignStatus = status && allowedStatuses.includes(status) ? status : 'Active';

  try {
    const result = await db.query(
      'INSERT INTO campaigns (name, client, status, budget) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, client, campaignStatus, budget]
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

  // --- VALIDATION ---
  if (name !== undefined && (typeof name !== 'string' || name.trim().length === 0)) {
    return res.status(400).json({ error: "Name must be a valid non-empty string" });
  }
  if (budget !== undefined && (isNaN(budget) || budget <= 0)) {
    return res.status(400).json({ error: "Budget must be a positive number" });
  }
  if (spend !== undefined && (isNaN(spend) || spend < 0)) {
    return res.status(400).json({ error: "Spend must be a non-negative number" });
  }
  if (status !== undefined) {
    const allowedStatuses = ['Active', 'Paused', 'Completed'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ error: "Status must be Active, Paused, or Completed" });
    }
  }
  // --- VALIDATION END ---

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

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Campaign not found" });
    }

    const updatedCampaign = result.rows[0];

    // ========== ALERT ENGINE — Budget 90% Check ==========
    if (updatedCampaign.spend && updatedCampaign.budget) {
      const spendPercentage = (updatedCampaign.spend / updatedCampaign.budget) * 100;
      if (spendPercentage > 90) {
        const alertMsg = `⚠️ Budget Alert: Campaign "${updatedCampaign.name}" has used ${spendPercentage.toFixed(1)}% of its budget!`;
        const notifResult = await db.query(
          'INSERT INTO notifications (message, campaign_id) VALUES ($1, $2) RETURNING *',
          [alertMsg, updatedCampaign.id]
        );
        io.emit('campaign_alert', notifResult.rows[0]);
      }
    }

    // ========== ALERT ENGINE — CTR Below 1% Check ==========
    if (updatedCampaign.clicks != null && updatedCampaign.impressions && updatedCampaign.impressions > 0) {
      const ctr = (updatedCampaign.clicks / updatedCampaign.impressions) * 100;
      if (ctr < 1) {
        const alertMsg = `🔴 CTR Alert: Campaign "${updatedCampaign.name}" CTR dropped to ${ctr.toFixed(2)}% (below 1% threshold)!`;
        const notifResult = await db.query(
          'INSERT INTO notifications (message, campaign_id) VALUES ($1, $2) RETURNING *',
          [alertMsg, updatedCampaign.id]
        );
        io.emit('campaign_alert', notifResult.rows[0]);
      }
    }

    res.json(updatedCampaign);

  } catch (err) {
    console.error("PUT /campaigns/:id Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// YEH NAYA ROUTE YAHAN BAHAR AAYEGA
// ==========================================
app.get('/notifications', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM notifications ORDER BY created_at DESC LIMIT 20');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /campaigns/:id - Soft Delete
app.delete('/campaigns/:id', authenticateJWT, async (req, res) => {
  // ... baqi code same rahega
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