// ============================================
// Q5 — AI Tool se Scaffolded Express CRUD Route
// Generated with GitHub Copilot / Cursor AI
// Full CRUD for "clients" resource
// ============================================

const express = require('express');
const router = express.Router();
const db = require('../BackEnd/db');
const authenticateJWT = require('../BackEnd/middleware/auth');

// NOTE: Yeh route GitHub Copilot ki madad se
// 10 minute mein scaffold kiya gaya.
// AI ne boilerplate generate kiya,
// maine validation aur logic add ki.

// ==========================================
// GET /clients — List all clients
// ==========================================
router.get('/', authenticateJWT, async (req, res) => {
  try {
    const { sort = 'id', order = 'asc', limit = 10, page = 1 } = req.query;

    const allowedSort = ['id', 'name', 'industry', 'created_at'];
    const allowedOrder = ['asc', 'desc'];

    const safeSort = allowedSort.includes(sort) ? sort : 'id';
    const safeOrder = allowedOrder.includes(order) ? order : 'asc';
    const safeLimit = Math.min(parseInt(limit) || 10, 100);
    const offset = (Math.max(parseInt(page) || 1, 1) - 1) * safeLimit;

    const result = await db.query(
      `SELECT * FROM clients 
       WHERE deleted_at IS NULL 
       ORDER BY ${safeSort} ${safeOrder} 
       LIMIT $1 OFFSET $2`,
      [safeLimit, offset]
    );

    res.json({
      data: result.rows,
      page: parseInt(page) || 1,
      limit: safeLimit,
      total: result.rows.length
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// GET /clients/:id — Single client
// ==========================================
router.get('/:id', authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({ error: "Valid numeric ID required" });
    }

    const result = await db.query(
      'SELECT * FROM clients WHERE id = $1 AND deleted_at IS NULL',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Client not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// POST /clients — Create new client
// ==========================================
router.post('/', authenticateJWT, async (req, res) => {
  const { name, industry, website, contact_email } = req.body;

  // Validation
  if (!name || typeof name !== 'string' || name.trim() === '') {
    return res.status(400).json({ error: "Client name is required" });
  }
  if (!industry || typeof industry !== 'string') {
    return res.status(400).json({ error: "Industry is required" });
  }
  if (contact_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact_email)) {
    return res.status(400).json({ error: "Valid email is required" });
  }

  try {
    const result = await db.query(
      `INSERT INTO clients (name, industry, website, contact_email)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [name.trim(), industry.trim(), website || null, contact_email || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') { // Unique constraint
      return res.status(409).json({ error: "Client already exists" });
    }
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// PUT /clients/:id — Update client
// ==========================================
router.put('/:id', authenticateJWT, async (req, res) => {
  const { id } = req.params;
  const { name, industry, website, contact_email } = req.body;

  if (!id || isNaN(id)) {
    return res.status(400).json({ error: "Valid numeric ID required" });
  }
  if (name !== undefined && (typeof name !== 'string' || name.trim() === '')) {
    return res.status(400).json({ error: "Name cannot be empty" });
  }

  try {
    const result = await db.query(
      `UPDATE clients
       SET name = COALESCE($1, name),
           industry = COALESCE($2, industry),
           website = COALESCE($3, website),
           contact_email = COALESCE($4, contact_email)
       WHERE id = $5 AND deleted_at IS NULL
       RETURNING *`,
      [name || null, industry || null, website || null, contact_email || null, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Client not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// DELETE /clients/:id — Soft Delete
// ==========================================
router.delete('/:id', authenticateJWT, async (req, res) => {
  const { id } = req.params;

  if (!id || isNaN(id)) {
    return res.status(400).json({ error: "Valid numeric ID required" });
  }

  try {
    const result = await db.query(
      `UPDATE clients
       SET deleted_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND deleted_at IS NULL
       RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Client not found or already deleted" });
    }

    res.json({ message: "Client deleted successfully (soft delete)", id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

/*
=== AI TOOL USAGE NOTE ===

Tool Used: GitHub Copilot (VS Code extension)

Prompt given to AI:
"Create a full Express.js CRUD router for a 'clients' resource
with PostgreSQL, JWT auth middleware, input validation,
soft delete, pagination and error handling"

AI Generated: Basic route structure + CRUD boilerplate
I Added: 
- Input validation logic
- Parameterized queries (SQL injection prevention)
- Proper HTTP status codes
- Soft delete pattern
- Pagination with whitelist validation
- Error code handling (23505 duplicate)

Time taken: ~8 minutes with AI assistance
*/