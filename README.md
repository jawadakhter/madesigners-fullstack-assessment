# 🚀 AdAgency — Full Stack Campaign Management Platform

A full-stack advertising campaign management platform built as a skills assessment. Features include a real-time dashboard, AI-powered creative brief generation, campaign CRUD API with JWT auth, WebSocket notifications, and Docker support.

![React](https://img.shields.io/badge/Frontend-React_18-61DAFB?logo=react)
![Node.js](https://img.shields.io/badge/Backend-Node.js_Express-339933?logo=node.js)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-4169E1?logo=postgresql)
![Socket.io](https://img.shields.io/badge/Realtime-Socket.io-010101?logo=socket.io)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker)
![TailwindCSS](https://img.shields.io/badge/Styling-TailwindCSS-06B6D4?logo=tailwindcss)

---

## 📂 Project Structure


├── BackEnd/
│ ├── middleware/
│ │ └── auth.js # JWT authentication middleware
│ ├── routes/
│ │ └── aiRoutes.js # AI microservice endpoints
│ ├── db.js # PostgreSQL connection
│ ├── server.js # Main Express server + Socket.io
│ ├── schema.sql # Database tables & seed data
│ ├── openapi.yaml # OpenAPI 3.0 specification
│ ├── Dockerfile # Docker container config
│ ├── docker-compose.yml # Multi-container setup
│ ├── package.json
│ └── .env # Environment variables (not in repo)
│
├── FrontEnd/
│ ├── src/
│ │ ├── components/
│ │ │ ├── Dashboard.jsx # Main dashboard with KPIs, chart, table
│ │ │ ├── CampaignTable.jsx # Sortable, filterable campaign table
│ │ │ ├── AIBriefBuilder.jsx # Multi-step AI brief generator
│ │ │ ├── NotificationCenter.jsx # Real-time bell icon + alerts
│ │ │ └── LoginPage.jsx # JWT login page
│ │ ├── hooks/
│ │ │ └── useDarkMode.js # Dark mode custom hook
│ │ ├── data.json # Mock data for charts & KPIs
│ │ ├── App.jsx # Root component with routing
│ │ └── main.jsx
│ ├── package.json
│ └── index.html
│
└── README.md # You are here



---

## ✅ Assessment Coverage

### Section 1 — Frontend Development (35 pts)

| Task | Requirement | Status | File |
|------|------------|--------|------|
| 1.1 | Sidebar: clients, campaigns, settings | ✅ | `Dashboard.jsx` |
| 1.1 | KPI Cards (6 metrics) | ✅ | `Dashboard.jsx` |
| 1.1 | Line Chart — 30 day trend (Recharts) | ✅ | `Dashboard.jsx` |
| 1.1 | Campaign Table — sortable, filterable, status badges | ✅ | `CampaignTable.jsx` |
| 1.1 | Date Range Picker (7d, 30d, 90d, Custom) | ✅ | `Dashboard.jsx` |
| 1.1 | React 18+ hooks only | ✅ | All components |
| 1.1 | Responsive (1440, 1024, 768) | ✅ | Tailwind responsive classes |
| 1.1 | Dark Mode + localStorage persist | ✅ | `useDarkMode.js` |
| 1.1 | Mock data from JSON file | ✅ | `data.json` |
| 1.2 | Multi-step form (4 steps) | ✅ | `AIBriefBuilder.jsx` |
| 1.2 | AI integration (OpenAI via backend) | ✅ | `AIBriefBuilder.jsx` → `/api/ai/generate` |
| 1.2 | AI output: title, headlines, tone, channels, visual | ✅ | `AIBriefBuilder.jsx` (Step 5) |
| 1.2 | PDF Export (html2canvas + jsPDF) | ✅ | `AIBriefBuilder.jsx` |

### Section 2 — Backend Development (35 pts)

| Task | Requirement | Status | File |
|------|------------|--------|------|
| 2.1 | GET /campaigns (sort, filter, pagination) | ✅ | `server.js` |
| 2.1 | POST /campaigns (with validation) | ✅ | `server.js` |
| 2.1 | GET /campaigns/:id | ✅ | `server.js` |
| 2.1 | PUT /campaigns/:id (with validation) | ✅ | `server.js` |
| 2.1 | DELETE /campaigns/:id (soft delete) | ✅ | `server.js` |
| 2.1 | POST /auth/login (JWT) | ✅ | `server.js` |
| 2.1 | JWT protection on all campaign routes | ✅ | `middleware/auth.js` |
| 2.1 | Rate limiting (100 req/min) | ✅ | `server.js` (express-rate-limit) |
| 2.1 | PostgreSQL schema | ✅ | `schema.sql` |
| 2.1 | OpenAPI spec | ✅ | `openapi.yaml` |
| 2.2 | POST /generate/copy | ✅ | `aiRoutes.js` |
| 2.2 | POST /generate/social | ✅ | `aiRoutes.js` |
| 2.2 | POST /generate/hashtags | ✅ | `aiRoutes.js` |
| 2.2 | GET /health | ✅ | `aiRoutes.js` |
| 2.2 | Dockerfile + docker-compose.yml | ✅ | `BackEnd/` |
| 2.2 | Environment variables (no hardcoding) | ✅ | `.env` |
| 2.2 | Request/Response logging + unique IDs | ✅ | `server.js` (uuid middleware) |
| 2.2 | SSE Streaming | ✅ | `aiRoutes.js` (`/generate/stream`) |
| 2.3 | WebSocket server (Socket.io) | ✅ | `server.js` |
| 2.3 | Alert rule engine (budget >90%, CTR <1%) | ✅ | `server.js` (PUT endpoint) |
| 2.3 | React notification center (bell, dropdown, badge) | ✅ | `NotificationCenter.jsx` |
| 2.3 | Persist alerts in PostgreSQL | ✅ | `notifications` table |

---

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- npm or yarn

### 1. Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/madesigners-fullstack-assessment.git
cd madesigners-fullstack-assessment