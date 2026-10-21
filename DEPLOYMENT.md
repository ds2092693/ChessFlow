# 🚀 ChessFlow Production Deployment Guide

ChessFlow is built as a high-performance full-stack Turborepo monorepo consisting of:
- **`apps/frontend`**: React 18 + Vite + Tailwind CSS + Recoil + chess.js
- **`apps/backend`**: Express REST API + Google/GitHub OAuth + Live Leaderboard
- **`apps/ws`**: Real-time WebSocket game engine + Room matchmaking + Minimax AI engine
- **`packages/db`**: Prisma ORM with SQLite database

---

## 🌟 Option 1: Vercel (Frontend) + Render (Backend & WebSocket) [Recommended & Free]

### Step 1: Deploy Backend & WebSocket on Render
1. Go to [Render.com](https://render.com) and sign in with GitHub.
2. Click **New +** -> **Web Service** -> Connect your GitHub repo (`ds2092693/ChessFlow`).
3. For **Backend API**:
   - **Name**: `chessflow-backend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `node apps/backend/dist/index.js`
   - **Environment Variables**:
     - `PORT`: `3000`
     - `JWT_SECRET`: `your-random-jwt-secret-here`
     - `COOKIE_SECRET`: `your-random-cookie-secret-here`
     - `DATABASE_URL`: `file:./packages/db/prisma/dev.db`
     - `GOOGLE_CLIENT_ID`: `your-google-client-id`
     - `GOOGLE_CLIENT_SECRET`: `your-google-client-secret`
     - `GITHUB_CLIENT_ID`: `your-github-client-id`
     - `GITHUB_CLIENT_SECRET`: `your-github-client-secret`
     - `ALLOWED_ORIGINS`: `https://your-frontend.vercel.app`
     - `AUTH_REDIRECT_URL`: `https://your-frontend.vercel.app`
     - `GOOGLE_CALLBACK_URL`: `https://chessflow-backend.onrender.com/auth/google/callback`
     - `GITHUB_CALLBACK_URL`: `https://chessflow-backend.onrender.com/auth/github/callback`
4. For **WebSocket Server**:
   - Click **New +** -> **Web Service** -> Connect your GitHub repo.
   - **Name**: `chessflow-ws`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `node apps/ws/dist/index.js`
   - **Environment Variables**:
     - `PORT`: `8080`
     - `JWT_SECRET`: *(Same as backend)*
     - `DATABASE_URL`: `file:./packages/db/prisma/dev.db`

### Step 2: Deploy Frontend on Vercel
1. Go to [Vercel.com](https://vercel.com) and click **Add New...** -> **Project**.
2. Import your GitHub repository (`ds2092693/ChessFlow`).
3. In **Build and Output Settings**:
   - **Framework Preset**: Vite
   - **Root Directory**: `apps/frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. In **Environment Variables**:
   - `VITE_APP_BACKEND_URL`: `https://chessflow-backend.onrender.com`
   - `VITE_APP_WS_URL`: `wss://chessflow-ws.onrender.com`
5. Click **Deploy**!

---

## 🐳 Option 2: 1-Click Docker Deployment (Any Cloud / VPS / Railway)

If deploying to a VPS (DigitalOcean, AWS, Linode, Hetzner, Railway):

```bash
# Clone the repository
git clone https://github.com/ds2092693/ChessFlow.git
cd ChessFlow

# Launch all 3 services in the background
docker compose up --build -d
```

All 3 services will be running:
- Frontend on port `5173`
- Backend API on port `3000`
- WebSocket Server on port `8080`
