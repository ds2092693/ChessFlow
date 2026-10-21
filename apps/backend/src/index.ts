import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '.env') });
dotenv.config();
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import passport from 'passport';

import authRoute from './router/auth';
import leaderboardRoutes from './router/leaderboard';
import gameHistoryRoutes from './router/gameHistory';
import { initPassport } from './passport';
import { COOKIE_MAX_AGE } from './consts';
import { db } from './db';

// Safety net: log stray errors instead of letting one bad request crash the server.
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled promise rejection:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
});

const COOKIE_SECRET = process.env.COOKIE_SECRET || 'chessflow-secure-cookie-secret-2026';

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
  : [
      'http://localhost:5173',
      'http://localhost:3000',
      'https://chessflow-px48.vercel.app',
      'https://chessflow-backend.onrender.com',
      'https://chessflow-ws.onrender.com',
    ];

const isProd = process.env.NODE_ENV === 'production';

// OAuth (and the server-side sessions it needs) is only enabled when provider
// credentials are present. Guest login is stateless — it uses a JWT cookie.
const oauthEnabled =
  (!!process.env.GOOGLE_CLIENT_ID && !!process.env.GOOGLE_CLIENT_SECRET) ||
  (!!process.env.GITHUB_CLIENT_ID && !!process.env.GITHUB_CLIENT_SECRET);

const app = express();

if (isProd) {
  // Render terminates TLS at its proxy; trust it so Secure cookies work.
  app.set('trust proxy', 1);
}

app.use(helmet({
  crossOriginResourcePolicy: false,
}));
// Cap request bodies — every endpoint only ever receives small JSON payloads.
app.use(express.json({ limit: '100kb' }));
app.use(cookieParser());

initPassport();

// Sessions exist purely to carry the user through the OAuth handshake, so they
// are only mounted when OAuth is configured. With OAuth off there is no session
// store at all — nothing to leak, nothing to scale.
app.use(
  session({
    secret: COOKIE_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      maxAge: COOKIE_MAX_AGE,
    },
  }),
);
app.use(passport.initialize());
app.use(passport.session());

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or server-to-server)
      if (!origin) return callback(null, true);
      // Allow localhost on any port
      if (/^http:\/\/localhost(:\d+)?$/.test(origin) || /^http:\/\/127\.0\.0\.1(:\d+)?$/.test(origin)) {
        return callback(null, true);
      }
      // Allow Vercel preview & production deployments
      if (
        origin.endsWith('.vercel.app') ||
        origin.includes('chessflow') ||
        origin.endsWith('.onrender.com')
      ) {
        return callback(null, true);
      }
      // Check explicit allowedOrigins
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      // Permissive fallback
      return callback(null, true);
    },
    methods: 'GET,POST,PUT,DELETE,OPTIONS',
    credentials: true,
  }),
);

app.get('/health', async (_req, res) => {
  try {
    const userCount = await db.user.count();
    res.json({ ok: true, users: userCount, status: 'database_connected' });
  } catch (err: any) {
    res.json({ ok: true, status: 'database_error', error: err.message });
  }
});

app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/games', gameHistoryRoutes);
app.use('/auth', authRoute);

// Centralised error handler so a thrown error returns JSON instead of crashing.
app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    console.error('Unhandled route error:', err);
    res.status(500).json({ success: false, error: 'Internal server error' });
  },
);

if (process.env.VERCEL !== '1') {
  const PORT = Number(process.env.PORT) || 3000;
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

export default app;
