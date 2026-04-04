# 🚀 AdAgency — Full Stack Campaign Management Platform

> A full-stack advertising campaign management platform built as a skills assessment.
> Features a real-time dashboard, AI-powered creative brief generation, campaign CRUD API with JWT auth, WebSocket notifications, and Docker support.

<div align="center">

![React](https://img.shields.io/badge/Frontend-React_18-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![Node.js](https://img.shields.io/badge/Backend-Node.js_Express-339933?style=for-the-badge&logo=node.js&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL_15-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Socket.io](https://img.shields.io/badge/Realtime-Socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Styling-TailwindCSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)

</div>

---

## 📋 Table of Contents

- [Features Overview](#-features-overview)
- [Project Structure](#-project-structure)
- [Assessment Coverage](#-assessment-coverage)
- [Tech Stack](#-tech-stack)
- [Setup & Installation](#️-setup--installation)
- [Demo Credentials](#-demo-credentials)
- [API Endpoints](#-api-endpoints)
- [Testing the Notification System](#-testing-the-notification-system)
- [Docker Setup](#-docker-setup)
- [Key Files](#-key-files-quick-reference)

---

## ✨ Features Overview

### 🔑 Authentication
- JWT-based login with demo credentials pre-filled
- Protected routes — all campaign endpoints require a valid token
- Clean error handling for invalid credentials

### 📊 Campaign Dashboard
- **6 KPI Cards** — Impressions, Clicks, CTR, Conversions, Spend, ROAS
- **30-day Line Chart** powered by Recharts
- **Campaign Table** — sortable, searchable, with status badges
- **Date Range Picker** — 7d / 30d / 90d / Custom presets
- **Sidebar** — clients list, campaigns, settings
- **Dark / Light Mode** toggle with `localStorage` persistence
- Fully responsive at 1440px, 1024px, and 768px

### 🤖 AI Brief Builder
- 4-step guided form with progress indicator and step validation
- AI-generated creative brief including:
  - Campaign title suggestion
  - 3 headline options
  - Tone of voice guide
  - Channel recommendations with budget % allocation
  - Visual direction description
- One-click **PDF export** via `html2canvas + jsPDF`

### 🔔 Real-Time Notifications
- WebSocket connection via **Socket.io**
- Automatic alerts triggered when:
  - Budget spend exceeds **90%**
  - CTR drops below **1%**
- Bell icon with unread count badge
- Dropdown showing full alert history with timestamps
- All alerts persisted in PostgreSQL

---

## 📂 Project Structure

```
AdAgency/
│
├── BackEnd/
│   ├── middleware/
│   │   └── auth.js                 # JWT authentication middleware
│   ├── routes/
│   │   └── aiRoutes.js             # AI microservice endpoints
│   ├── db.js                       # PostgreSQL connection pool
│   ├── server.js                   # Express server + Socket.io + alert engine
│   ├── schema.sql                  # Database schema & seed data
│   ├── openapi.yaml                # OpenAPI 3.0 specification
│   ├── Dockerfile                  # Docker container config
│   ├── docker-compose.yml          # Multi-container setup (API + PostgreSQL)
│   ├── package.json
│   └── .env                        # Environment variables (not committed)
│
├── FrontEnd/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.jsx        # Main dashboard — KPIs, chart, filters
│   │   │   ├── CampaignTable.jsx    # Sortable & filterable campaign table
│   │   │   ├── AIBriefBuilder.jsx   # Multi-step AI brief generator + PDF export
│   │   │   ├── NotificationCenter.jsx  # Real-time bell icon + alert dropdown
│   │   │   └── LoginPage.jsx        # JWT login page
│   │   ├── hooks/
│   │   │   └── useDarkMode.js       # Dark mode custom hook
│   │   ├── data.json                # Mock data for charts & KPIs
│   │   ├── App.jsx                  # Root component with routing
│   │   └── main.jsx
│   ├── package.json
│   └── index.html
├── Section3/ # Speed & Practical Tasks (30 pts)
│   ├── Q1_bugfix.js # Debug Express API — 4 bugs fixed
│   ├── Q2_useDebounce.js # React custom hook — 300ms debounce
│   ├── Q3_sql_query.sql # Top 5 campaigns by ROAS per client
│   ├── Q4_optimized_component.jsx # React performance optimization
│   └── Q5_crud_route.js # AI-scaffolded full CRUD route
│
└── README.md
```

---

## ✅ Assessment Coverage

### Section 1 — Frontend Development (35 pts)

| # | Requirement | Status | File |
|---|-------------|:------:|------|
| 1.1 | Sidebar: clients, campaigns, settings | ✅ | `Dashboard.jsx` |
| 1.1 | KPI Cards (6 metrics) | ✅ | `Dashboard.jsx` |
| 1.1 | Line Chart — 30-day trend (Recharts) | ✅ | `Dashboard.jsx` |
| 1.1 | Campaign Table — sortable, filterable, status badges | ✅ | `CampaignTable.jsx` |
| 1.1 | Date Range Picker (7d, 30d, 90d, Custom) | ✅ | `Dashboard.jsx` |
| 1.1 | React 18+ hooks only — no class components | ✅ | All components |
| 1.1 | Responsive at 1440, 1024, 768px | ✅ | Tailwind responsive classes |
| 1.1 | Dark Mode + `localStorage` persistence | ✅ | `useDarkMode.js` |
| 1.1 | Mock data from local JSON file | ✅ | `data.json` |
| 1.2 | Multi-step form (4 steps) | ✅ | `AIBriefBuilder.jsx` |
| 1.2 | AI integration (OpenAI via backend) | ✅ | `AIBriefBuilder.jsx` → `/api/ai/generate` |
| 1.2 | AI output: title, headlines, tone, channels, visual | ✅ | `AIBriefBuilder.jsx` (Step 5) |
| 1.2 | PDF Export (html2canvas + jsPDF) | ✅ | `AIBriefBuilder.jsx` |

### Section 2 — Backend Development (35 pts)

| # | Requirement | Status | File |
|---|-------------|:------:|------|
| 2.1 | `GET /campaigns` — sort, filter, paginate | ✅ | `server.js` |
| 2.1 | `POST /campaigns` — with field validation | ✅ | `server.js` |
| 2.1 | `GET /campaigns/:id` — single campaign | ✅ | `server.js` |
| 2.1 | `PUT /campaigns/:id` — update with validation | ✅ | `server.js` |
| 2.1 | `DELETE /campaigns/:id` — soft delete (`deleted_at`) | ✅ | `server.js` |
| 2.1 | `POST /auth/login` — returns JWT | ✅ | `server.js` |
| 2.1 | JWT protection on all campaign routes | ✅ | `middleware/auth.js` |
| 2.1 | Rate limiting — 100 req/min per IP | ✅ | `server.js` (express-rate-limit) |
| 2.1 | PostgreSQL schema | ✅ | `schema.sql` |
| 2.1 | OpenAPI 3.0 spec | ✅ | `openapi.yaml` |
| 2.2 | `POST /generate/copy` | ✅ | `aiRoutes.js` |
| 2.2 | `POST /generate/social` | ✅ | `aiRoutes.js` |
| 2.2 | `POST /generate/hashtags` | ✅ | `aiRoutes.js` |
| 2.2 | `GET /health` | ✅ | `aiRoutes.js` |
| 2.2 | Dockerfile + docker-compose.yml | ✅ | `BackEnd/` |
| 2.2 | Environment variables — no hardcoding | ✅ | `.env` |
| 2.2 | Request/response logging + unique request IDs | ✅ | `server.js` (uuid middleware) |
| 2.2 | SSE Streaming (`/generate/stream`) | ✅ | `aiRoutes.js` |
| 2.3 | WebSocket server (Socket.io) | ✅ | `server.js` |
| 2.3 | Alert rule engine — budget >90%, CTR <1% | ✅ | `server.js` (PUT endpoint) |
| 2.3 | React notification center — bell, dropdown, badge | ✅ | `NotificationCenter.jsx` |
| 2.3 | Persist alerts in PostgreSQL | ✅ | `notifications` table |

---

## 🔧 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Vite, Tailwind CSS |
| **Charts** | Recharts |
| **Icons** | Lucide React |
| **PDF Export** | html2canvas + jsPDF |
| **Backend** | Node.js, Express.js |
| **Database** | PostgreSQL 15 |
| **Authentication** | JWT (`jsonwebtoken` + `bcryptjs`) |
| **Real-time** | Socket.io (WebSocket) |
| **AI Integration** | OpenAI API (via OpenRouter) |
| **Rate Limiting** | express-rate-limit |
| **Containerization** | Docker + Docker Compose |
| **API Docs** | OpenAPI 3.0 (YAML) |
| **Logging** | Custom middleware with UUID |

---

## 🛠️ Setup & Installation

### Prerequisites

- Node.js 18+
- PostgreSQL 15+
- npm or yarn

---

### Step 1 — Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/madesigners-fullstack-assessment.git
cd madesigners-fullstack-assessment
```

---

### Step 2 — Setup PostgreSQL Database

Open your PostgreSQL terminal and run:

```sql
-- Create the database
CREATE DATABASE "madesigners-fullstack-assessment_db";
```

Then import the schema:

```bash
psql -U postgres -d madesigners-fullstack-assessment_db -f BackEnd/schema.sql
```

This creates the following tables:

| Table | Description |
|-------|-------------|
| `users` | Seeded with a demo admin user |
| `campaigns` | Campaign data with metrics |
| `notifications` | Alert history log |
| `alert_rules` | Configurable alert thresholds |

---

### Step 3 — Setup Backend

```bash
cd BackEnd
npm install
```

Create a `.env` file inside `BackEnd/`:

```env
PORT=5000
DB_USER=postgres
DB_PASSWORD=your_postgres_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=madesigners-fullstack-assessment_db
JWT_SECRET=supersecretkey_mj123
OPENAI_API_KEY=your_openai_api_key_here
```

> ⚠️ **Note:** `OPENAI_API_KEY` is required for the AI Brief Builder. Without it, the app falls back to mock data.

Start the backend:

```bash
npm run dev
```

✅ You should see:

```
✅ PostgreSQL Database Successfully Connected!
Server running on port 5000 with WebSockets
```

---

### Step 4 — Setup Frontend

```bash
cd FrontEnd
npm install
npm run dev
```

✅ Frontend runs at: **http://localhost:5173**

---

## 🔐 Demo Credentials

| Field | Value |
|-------|-------|
| **Email** | `admin@agency.com` |
| **Password** | `password123` |

---

## 📡 API Endpoints

### Authentication

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|:----:|
| `POST` | `/auth/login` | Login → returns JWT token | ❌ |

### Campaigns *(JWT Required)*

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|:----:|
| `GET` | `/campaigns` | List all — sort, filter, paginate | ✅ |
| `GET` | `/campaigns/:id` | Get single campaign | ✅ |
| `POST` | `/campaigns` | Create new campaign | ✅ |
| `PUT` | `/campaigns/:id` | Update campaign (triggers alerts) | ✅ |
| `DELETE` | `/campaigns/:id` | Soft delete (`deleted_at`) | ✅ |

### AI Microservice

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|:----:|
| `GET` | `/api/ai/health` | Service status & model info | ❌ |
| `POST` | `/api/ai/generate/copy` | Generate ad copy (headline, body, CTA) | ❌ |
| `POST` | `/api/ai/generate/social` | Generate 5 social captions | ❌ |
| `POST` | `/api/ai/generate/hashtags` | Generate 10 hashtags | ❌ |
| `POST` | `/api/ai/generate` | Generate full creative brief | ❌ |
| `POST` | `/api/ai/generate/stream` | Stream copy via SSE | ❌ |

### Notifications

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|:----:|
| `GET` | `/notifications` | Get full alert history | ❌ |

> 📄 Full API documentation: `BackEnd/openapi.yaml`

---

## 🧪 Testing the Notification System

The real-time notification system triggers alerts when campaign metrics cross defined thresholds.

### Test 1 — Budget Alert *(spend > 90% of budget)*

Open **DevTools Console** on the dashboard and paste:

```javascript
const token = localStorage.getItem('token');
fetch('http://localhost:5000/campaigns/1', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({ spend: 47000, budget: 50000 })
})
.then(res => res.json())
.then(data => console.log('Updated:', data));
```

**Expected result:** 🔔 Bell shows red badge → dropdown shows:
> ⚠️ *Budget Alert: Campaign "..." has used 94.0% of its budget!*

---

### Test 2 — CTR Alert *(CTR < 1%)*

```javascript
const token = localStorage.getItem('token');
fetch('http://localhost:5000/campaigns/1', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({ impressions: 10000, clicks: 50 })
})
.then(res => res.json())
.then(data => console.log('Updated:', data));
```

**Expected result:** 🔔 Bell shows:
> 🔴 *CTR Alert: Campaign "..." CTR dropped to 0.50% (below 1% threshold)!*

---

### Verify via API

```bash
GET http://localhost:5000/notifications
```

Returns full alert history from PostgreSQL.

---

## 🐳 Docker Setup

To run the full backend stack with Docker:

```bash
cd BackEnd
docker-compose up --build
```

This starts:

| Service | Port |
|---------|------|
| Express API server | `5000` |
| PostgreSQL 15 | `5432` |

> ⚠️ Make sure your `.env` file exists before running Docker.

---

## 📄 Key Files Quick Reference

| File | Description |
|------|-------------|
| `BackEnd/server.js` | Express server, CRUD routes, Socket.io, alert engine |
| `BackEnd/middleware/auth.js` | JWT token verification middleware |
| `BackEnd/routes/aiRoutes.js` | AI copy/social/hashtag/brief/stream endpoints |
| `BackEnd/schema.sql` | All DB tables + seeded demo user + alert rules |
| `BackEnd/openapi.yaml` | Complete OpenAPI 3.0 spec for all endpoints |
| `BackEnd/Dockerfile` | Docker image configuration |
| `BackEnd/docker-compose.yml` | API + PostgreSQL container orchestration |
| `FrontEnd/src/components/Dashboard.jsx` | Sidebar, KPI cards, chart, filters |
| `FrontEnd/src/components/CampaignTable.jsx` | Sortable & searchable campaign table |
| `FrontEnd/src/components/AIBriefBuilder.jsx` | 4-step form → AI brief → PDF export |
| `FrontEnd/src/components/NotificationCenter.jsx` | Real-time bell icon + alert dropdown |
| `FrontEnd/src/components/LoginPage.jsx` | Login UI with JWT auth |
| `FrontEnd/src/hooks/useDarkMode.js` | Dark mode hook with localStorage persistence |
| `FrontEnd/src/data.json` | Mock chart data & fallback campaign data |

---

<div align="center">

Built with ❤️ for **MADesigners Full Stack Developer Assessment**

</div>
