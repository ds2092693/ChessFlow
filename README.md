<div align="center">

# ♞ ChessFlow
### Real-Time Distributed WebSocket Chess & In-House Minimax AI Platform

[![Author](https://img.shields.io/badge/Author-Divyanshu%20Sharma-blue?style=for-the-badge&logo=github)](https://github.com/ds2092693)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Divyanshu%20Sharma-0A66C2?style=for-the-badge&logo=linkedin)](https://www.linkedin.com/in/divyanshu-sharma-899267297/)
[![Built with Turborepo](https://img.shields.io/badge/Built%20with-Turborepo-EF4444?style=for-the-badge&logo=turborepo)](https://turbo.build/)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald?style=for-the-badge)](LICENSE)

<br/>

**ChessFlow** is an ultra-low latency, full-stack chess platform engineered for competitive multiplayer and single-player AI simulation. Built on a server-authoritative WebSocket engine, it features dynamic Elo-band matchmaking, an in-house Minimax + Alpha-Beta pruning engine with MVV-LVA move ordering, glassmorphic 2026 aesthetics, and PostgreSQL persistence across a Turborepo monorepo architecture.

</div>

---

## 🏛️ System Architecture

```mermaid
flowchart TB
    subgraph Client["Client Tier (apps/frontend)"]
        FE["⬡ React 18 · Vite · TypeScript\nRecoil · Tailwind CSS · chess.js"]
    end

    subgraph ServerApps["Service Layer (Turborepo)"]
        BE["Express REST API\nPassport OAuth (Google/GitHub) · JWT Auth"]
        WS["WebSocket Game Gateway\nws · GameManager · Minimax AI Engine"]
        RD["Redis Pub/Sub\nBroadcast Relay & Multi-Node Fan-out"]
    end

    subgraph CorePackages["Shared Monorepo Packages"]
        DB["@repo/db\nPrisma Client & PostgreSQL Schemas"]
        ST["@repo/store\nRecoil Atoms & Shared State Hooks"]
    end

    subgraph Storage["Persistence & CI/CD"]
        PG[("PostgreSQL\nUsers · Games · Moves · Elo Ratings")]
        CI["GitHub Actions CI\nPrisma Validate · Lint · Build · Test"]
        LT["k6 Concurrency Harness\nproof/ load-test suite"]
    end

    FE -- "REST /auth /api/leaderboard" --> BE
    FE <== "WSS (Moves · Clocks · Chat)" ==> WS
    WS -. "Pub/Sub Broadcasts" .-> RD

    BE --> DB
    WS --> DB
    WS --> ST
    FE --> ST

    DB --> PG
    BE -.-> CI
    WS -.-> CI
    WS -.-> LT
```

---

## ⚡ Key Highlights

### 1. Real-Time Server-Authoritative WebSocket Engine
- Bidirectional event-driven communication via `ws` with sub-30ms tick rate.
- Move validation runs simultaneously on the client and server through `chess.js`, strictly preventing invalid states, timing exploits, or desyncs.
- Real-time digital clock countdowns with low-time warning pulses and mutual draw/resign protocols.

### 2. In-House Minimax AI Engine (Depth 2 to 4)
- Custom game-tree search using **Alpha-Beta Pruning** to drastically prune non-optimal branch evaluations.
- **MVV-LVA (Most Valuable Victim - Least Valuable Attacker)** move ordering to maximize alpha-beta cutoffs early.
- **Piece-Square Tables (PST)** heuristic evaluation for positional piece activity, king safety, and center control.
- 3 selectable difficulty tiers (Easy = Depth 2, Medium = Depth 3, Master = Depth 4).

### 3. FIDE-Style Dynamic Elo Matchmaking
- Rating calculations update automatically upon match completion using standard logistic Elo distributions.
- Adaptive K-factor scaling:
  - $K = 40$ for provisional accounts ($< 30$ matches)
  - $K = 32$ for standard competitive rating bands
  - $K = 10$ for grandmaster players ($\ge 2100$ Elo)
- Matchmaking pairs opponents within $\pm 100$ Elo, widening dynamically if queue times extend.

### 4. 2026 Glassmorphic UI & 5 Grandmaster Themes
- Modern gaming aesthetic featuring dark space backdrops, glowing square highlights, and move projection markers.
- 5 curated themes: **Cyberpunk Violet**, **Tournament Emerald**, **Midnight Sapphire**, **Neon Sakura**, and **Grandmaster Walnut**.
- 100% mobile, tablet, and desktop responsive layout with fluid canvas arrow drawing and notation playback.

---

## 📂 Repository Layout

```
ChessFlow/
├── apps/
│   ├── frontend/         # React 18, Vite, Recoil, Tailwind CSS, Sound Effects
│   ├── backend/          # Express REST API, Passport OAuth, JWT, Leaderboard endpoints
│   └── ws/               # High-performance WebSocket game engine & Minimax AI
├── packages/
│   ├── db/               # Prisma schema & PostgreSQL client definitions
│   └── store/            # Shared Recoil atoms, hooks & state selectors
├── proof/                # k6 concurrency harness & load-testing reports
└── turbo.json            # Monorepo build pipeline orchestration
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, TypeScript, Tailwind CSS, Recoil, chess.js, Lucide Icons |
| **Backend API** | Node.js, Express, Passport.js (Google & GitHub OAuth), JWT, Helmet |
| **Real-time Server** | WebSockets (`ws`), Minimax AI Engine, Redis Pub/Sub |
| **Database & ORM** | PostgreSQL, Prisma ORM |
| **Monorepo & Tooling** | Turborepo, ESLint, TypeScript 5, k6 |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher (Node 20 recommended)
- **npm**: v9.0.0 or higher
- **PostgreSQL**: Local or hosted instance (e.g., Supabase / Neon / Docker)

### 1. Clone & Install
```bash
git clone https://github.com/ds2092693/ChessFlow.git
cd ChessFlow
npm install
```

### 2. Environment Configuration

#### `apps/backend/.env`
```env
DATABASE_URL="postgresql://user:password@localhost:5432/chessflow"
JWT_SECRET="your-super-secret-jwt-key"
COOKIE_SECRET="your-cookie-secret"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
AUTH_REDIRECT_URL="http://localhost:5173"
ALLOWED_ORIGINS="http://localhost:5173"
PORT=3000
```

#### `apps/ws/.env`
```env
DATABASE_URL="postgresql://user:password@localhost:5432/chessflow"
JWT_SECRET="your-super-secret-jwt-key"
WS_PORT=8080
# Optional Redis relay:
# REDIS_URL="redis://localhost:6379"
```

#### `apps/frontend/.env`
```env
VITE_APP_BACKEND_URL="http://localhost:3000"
VITE_APP_WS_URL="ws://localhost:8080"
```

#### `packages/db/.env`
```env
DATABASE_URL="postgresql://user:password@localhost:5432/chessflow"
```

### 3. Database Initialization
```bash
cd packages/db
npx prisma generate
npx prisma db push
```

### 4. Run Development Servers
```bash
# From root directory:
npm run dev
```

- **Frontend**: `http://localhost:5173`
- **Backend API**: `http://localhost:3000`
- **WebSocket Gateway**: `ws://localhost:8080`

---

## 🧪 Testing & Verification
```bash
# Run Minimax AI engine unit tests & rating calculations
npm --prefix apps/ws test

# Run production build validation
npm run build
```

---

## 👨‍💻 Author & Engineering Credits

**Divyanshu Sharma**
- **GitHub**: [@ds2092693](https://github.com/ds2092693)
- **LinkedIn**: [divyanshu-sharma-899267297](https://www.linkedin.com/in/divyanshu-sharma-899267297/)

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for complete details.
