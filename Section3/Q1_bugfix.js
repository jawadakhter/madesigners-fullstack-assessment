// ============================================
// Q1 — Express API Bug Fix
// 4 Bugs fixed:
// Bug 1: SQL Injection vulnerability
// Bug 2: Missing error handling
// Bug 3: Wrong HTTP status codes
// Bug 4: Missing input validation
// ============================================

const express = require('express');
const router = express.Router();
const db = require('../BackEnd/db');

// ❌ BUGGY VERSION (DO NOT USE):
// router.get('/campaigns', (req, res) => {
//   const id = req.query.id;
//   db.query(`SELECT * FROM campaigns WHERE id = ${id}`)  // BUG 1: SQL Injection
//     .then(result => res.json(result))                    // BUG 2: No .rows
//     .catch(err => res.send(err))                         // BUG 3: Wrong method
// });

// ✅ FIXED VERSION:

// BUG 1 FIX: SQL Injection — Parameterized queries use karo
// BUG 2 FIX: Missing input validation
// BUG 3 FIX: Wrong status codes
// BUG 4 FIX: No error handling

router.get('/campaigns/:id', async (req, res) => {
  const { id } = req.params;

  // BUG 2 FIX: Input validation
  if (!id || isNaN(id)) {
    return res.status(400).json({ error: "Valid numeric ID is required" });
  }

  try {
    // BUG 1 FIX: Parameterized query — SQL injection prevent
    const result = await db.query(
      'SELECT * FROM campaigns WHERE id = $1 AND deleted_at IS NULL',
      [id]  // ← Yeh parameterized hai, string concatenation nahi
    );

    // BUG 3 FIX: 404 return karo agar nahi mila
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Campaign not found" });
    }

    // BUG 4 FIX: .rows use karo, direct result nahi
    res.status(200).json(result.rows[0]);

  } catch (err) {
    // BUG 4 FIX: Proper error handling
    console.error("Database error:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST route bug fix example
router.post('/campaigns', async (req, res) => {
  const { name, client, budget } = req.body;

  // BUG 2 FIX: Validation
  if (!name || typeof name !== 'string' || name.trim() === '') {
    return res.status(400).json({ error: "Campaign name is required" });
  }
  if (!client || typeof client !== 'string') {
    return res.status(400).json({ error: "Client name is required" });
  }
  if (!budget || isNaN(budget) || budget <= 0) {
    return res.status(400).json({ error: "Budget must be a positive number" });
  }

  try {
    // BUG 1 FIX: Parameterized query
    const result = await db.query(
      'INSERT INTO campaigns (name, client, budget) VALUES ($1, $2, $3) RETURNING *',
      [name.trim(), client.trim(), budget]
    );

    // BUG 3 FIX: 201 Created status
    res.status(201).json(result.rows[0]);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

/*
=== BUGS SUMMARY ===

BUG 1 — SQL INJECTION:
  ❌ `SELECT * FROM campaigns WHERE id = ${req.query.id}`
  ✅ `SELECT * FROM campaigns WHERE id = $1`, [id]
  WHY: Direct string interpolation allows malicious SQL injection
  e.g., id = "1; DROP TABLE campaigns;" would delete entire table

BUG 2 — MISSING INPUT VALIDATION:
  ❌ No checks on incoming data
  ✅ Validate type, presence, and format of all inputs
  WHY: Invalid data causes unexpected crashes

BUG 3 — WRONG HTTP STATUS CODES:
  ❌ res.send(200) for everything including errors
  ✅ 400 (bad request), 404 (not found), 201 (created), 500 (server error)
  WHY: Correct status codes are REST standard

BUG 4 — MISSING ERROR HANDLING:
  ❌ .catch(err => res.send(err))
  ✅ try/catch with proper async/await
  WHY: Unhandled errors crash the server
*/