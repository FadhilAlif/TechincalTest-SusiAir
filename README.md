# Susi Air Pilot App — Technical Test

A modern, responsive, mobile-first flight operations web application built for Susi Air pilots to monitor duty limits, inspect rolling flight hour trends, track regulatory document expiry, and navigate monthly duty schedules.

Built with **NestJS** (Backend REST API) and **Nuxt 3 / 4** (Frontend Presentation Layer).

---

## 🛫 Table of Contents
- [Architecture & Tech Stack](#-architecture--tech-stack)
- [Project Directory Structure](#-project-directory-structure)
- [Quick Start & Local Setup](#-quick-start--local-setup)
- [Environment Variables](#-environment-variables)
- [API Endpoints & Contracts](#-api-endpoints--contracts)
- [Core Business Rules & Design Choices](#-core-business-rules--design-choices)
- [Testing & Quality Assurance](#-testing--quality-assurance)
- [What We Would Change With More Time](#-what-we-would-change-with-more-time)
- [Acceptance Criteria Checklist](#-acceptance-criteria-checklist)

---

## 📐 Architecture & Tech Stack

The system strictly follows an **API-driven, thin-client architecture** where all mathematical computations, regulatory limit evaluations, document urgency thresholds, and rolling sums are executed exclusively on the server.

### Backend (`/backend`)
* **Framework**: NestJS (Node.js, TypeScript)
* **Architecture**: Modular layered pattern (`Module`, `Controller`, `Service`, `DTO`)
* **Data Layer**: In-Memory Data Store (seeded from JSON files at bootstrap; no relational database overhead)
* **Security**: JWT Authentication Guard with `@Public()` decorator bypass for login
* **Error Handling**: Global Exception Filter enforcing uniform `{ statusCode, message, error, timestamp }` responses
* **Testing**: Jest unit testing suite covering services, authorization, and rolling calculations

### Frontend (`/frontend`)
* **Framework**: Nuxt 3 / 4 with Composition API (`<script setup>`)
* **State Management**: Pinia (Auth token and pilot profile state)
* **Styling**: Pure SCSS with design tokens matching Susi Air brand palette (Navy `#0E2138`, Red `#E63757`, Plus Jakarta Sans typography)
* **Theme System**: Dynamic Dark/Light mode (default: Light) powered by browser native **View Transitions API** circular ripple animation
* **Icons & Visualization**: `lucide-vue-next` and responsive custom SVG charts

---

## 📁 Project Directory Structure

```text
e:/TechincalTest-SusiAir/
├── backend/                          ← Backend Service (NestJS)
│   ├── src/
│   │   ├── auth/                     ← Authentication module (Login, JWT Guard)
│   │   ├── pilot/                    ← Pilot profile service & controller
│   │   ├── flight-hours/             ← Flight hours & rolling sum calculation
│   │   ├── documents/                ← Pilot regulatory documents & urgency
│   │   ├── schedules/                ← Monthly duty roster calendar service
│   │   ├── common/                   ← Constants, Exception filters, Guards
│   │   ├── data/                     ← In-memory JSON loader & mock datasets
│   │   └── main.ts                   ← Application entry point (Port 3001)
│   ├── test/
│   ├── .env.example
│   └── package.json
├── frontend/                         ← Frontend Web App (Nuxt 3)
│   ├── app/
│   │   ├── assets/scss/              ← Brand design tokens, variables & base
│   │   ├── components/               ← Navbar, ThemeToggle, SVG Chart
│   │   ├── composables/              ← useApi.ts, useTheme.ts
│   │   ├── middleware/               ← auth.global.ts (Route guard)
│   │   ├── pages/                    ← Login, Dashboard, Schedule, Profile
│   │   └── stores/                   ← Pinia auth store
│   ├── public/                       ← Susi Air logo & static assets
│   ├── .env.example
│   └── package.json
├── docs/                             ← PRD, Architecture Specifications
├── attachments/                      ← Original candidate brief & JSON data
└── README.md
```

---

## 🚀 Quick Start & Local Setup

### Prerequisites
* **Node.js**: v18.x or v20.x+
* **npm**: v9.x or v10.x+

### 1. Clone & Navigate to Repository
```bash
git clone https://github.com/fadhilfauzan/TechnicalTest-SusiAir.git
cd TechnicalTest-SusiAir
```

### 2. Run Backend (Port 3001)
```bash
cd backend
npm install
npm run dev
```
* Backend will be running at `http://localhost:3001`.

### 3. Run Frontend (Port 3000)
In a separate terminal:
```bash
cd frontend
npm install
npm run dev
```
* Frontend will be accessible at `http://localhost:3000`.

### 4. Pilot Credentials
Use the official hardcoded test credentials:
* **Username**: `johndoe`
* **Password**: `susiairtest`

---

## 🔐 Environment Variables

### Backend (`backend/.env`)
Copy from `backend/.env.example`:
```env
PORT=3001
JWT_SECRET=susi-air-pilot-app-secret-key-2026
BASE_TODAY=2026-05-15
```

### Frontend (`frontend/.env`)
Copy from `frontend/.env.example`:
```env
NUXT_PUBLIC_API_BASE=http://localhost:3001
```

---

## 🔌 API Endpoints & Contracts

All endpoints except `/auth/login` require a valid Bearer token (`Authorization: Bearer <token>`).

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/auth/login` | Authenticates `johndoe` / `susiairtest`, returns JWT token | Public |
| `GET` | `/pilot/me` | Returns `{ name, totalFlightHours, avatarUrl }` | Bearer Token |
| `GET` | `/flight-hours` | Returns daily flight logs within query `from` & `to` (YYYY-MM-DD) | Bearer Token |
| `GET` | `/flight-hours/summary` | Returns 4 limit cards and 15-day rolling sum series (`range=1w\|1m\|3m\|6m\|1y`) | Bearer Token |
| `GET` | `/documents` | Returns pilot documents with computed urgency (`safe`, `soon`, `expired`) and badge colors | Bearer Token |
| `GET` | `/schedules` | Returns monthly duty roster with `base_color`, `isCompleted`, and `remainingDuties` | Bearer Token |

---

## 🧠 Core Business Rules & Design Choices

### 1. In-Memory Data Store Architecture
* **Choice**: Seeded from `mock-flight-hours.json`, `mock-documents.json`, and `mock-schedules.json` at bootstrap inside NestJS `DataService`.
* **Rationale**: Complies with the technical test specification prohibiting unnecessary database overhead while maintaining sub-millisecond query performance.

### 2. Hardcoded System Date Reference (15 May 2026)
* **Choice**: Defined as a global constant `BASE_TODAY = '2026-05-15'`. Constructing `new Date()` directly for today's date is strictly prohibited.
* **Rationale**: The mock flight hours and duty rosters are anchored around May 2026. Hardcoding ensures deterministic rolling windows and expiration evaluations whenever reviewers evaluate the project.

### 3. Server-Side Rolling Sum Calculation
* **Method**: Exact implementation of `rollingWindowBluffing()` in `FlightHoursService`.
* **Comment**: `// this is a rolling sum calculation :)` placed directly above the method.
* **Zero-Value Continuity**: Dates without logged flights return `0` hours to ensure continuous chart curves without omitting missing dates.

### 4. Thin-Client Presentation Layer
* **Choice**: Nuxt 3 never manipulates raw flight hours or computes document urgency.
* **Rationale**: The frontend receives ready-to-render computed payloads (`badgeColor`, `urgency`, `isCompleted`, `remainingDuties`, and pre-aggregated chart points), guaranteeing consistency and reducing mobile device battery drain.

### 5. Cockpit Theme System with View Transitions API
* **Choice**: Dual-mode theme system (Default: Light mode for daytime readability, Dark mode for night cockpit operations) using the browser's native `document.startViewTransition` with a circular `clip-path` ripple originating from the user's click coordinates.

---

## 🧪 Testing & Quality Assurance

### Run Backend Unit Tests
```bash
cd backend
npm test
```
* **Coverage**: 4 test suites, 16 unit tests passing 100%:
  - `auth.service.spec.ts`: Validates credential verification, token signing, and rejection of invalid credentials.
  - `flight-hours.service.spec.ts`: Validates `rollingWindowBluffing()`, rolling sums for 1w/1m/3m/6m/1y, and limit cards.
  - `documents.service.spec.ts`: Validates document urgency thresholds (`safe`, `soon`, `expired`).
  - `schedules.service.spec.ts`: Validates monthly roster queries, duty completion checks, and remaining duties.

### Production Build Verification
```bash
# Backend Build
cd backend
npm run build

# Frontend Build
cd frontend
npm run build
```
Both applications compile cleanly with 0 TypeScript/SCSS errors.

---

## 🔮 What We Would Change With More Time

1. **Persistent Database Migration**:
   * Migrate the in-memory loader to PostgreSQL using Prisma ORM with automated migrations and seeders, while preserving the existing service API contracts.
2. **Live Flight Leg Dispatch Manifest**:
   * Expand the calendar day detail modal into a full flight dispatch manifest where pilots can log individual flight sectors (departure, destination, off-block/on-block times, fuel, and payload).
3. **End-to-End (E2E) Testing**:
   * Introduce Playwright test suites covering full user journeys: login, theme switching, rolling sum chart inspection, month pagination, and duty detail inspection.
4. **Offline PWA Capabilities**:
   * Implement Service Worker caching for offline roster and duty limit viewing in remote Indonesian airfields with limited internet connectivity.

---

## ✅ Acceptance Criteria Checklist

| Requirement | Description | Status |
|-------------|-------------|--------|
| **Git Repository** | Clean, modular codebase with structured commit history | ✅ Passed |
| **Mobile-First Responsive UI** | Pitch-perfect layout across Mobile (375px-480px), Tablet (768px), and Laptop/Desktop | ✅ Passed |
| **Authentication** | `POST /auth/login` validates `johndoe`/`susiairtest`, rejects bad credentials, protects routes with JWT Guard | ✅ Passed |
| **Hours to Limit Section** | 4 summary limit cards (Daily 8h, Weekly 40h, Monthly 100h, Annual 1050h) with progress indicators | ✅ Passed |
| **Trend Chart** | SVG rolling sum chart centered on 15 May 2026, dynamic range toggles (1w-1y), horizontal red limit line | ✅ Passed |
| **My Documents** | Expiry badges computed server-side (`safe` = green, `soon` = amber, `expired` = red) | ✅ Passed |
| **Duty Roster Calendar** | Monthly calendar with April-June 2026 duties, `base_color` tints, completion tick & remaining duty count | ✅ Passed |
| **Duty Detail Modal** | Rich operational modal displaying airport base, checklist completion, and CASR compliance notes | ✅ Passed |
| **Theme System** | Default Light mode with interactive Dark mode toggle and circular View Transitions animation | ✅ Passed |
| **Uniform Error Responses** | Global exception filter standardizing API error JSON structures | ✅ Passed |
| **Strict Method & Comment** | `rollingWindowBluffing()` with exact `// this is a rolling sum calculation :)` comment | ✅ Passed |
| **Date Isolation** | Reference date hardcoded to `2026-05-15` without unconstrained `new Date()` constructor calls | ✅ Passed |

---

© 2026 PT ASI Pudjiastuti Aviation (Susi Air). All rights reserved.
