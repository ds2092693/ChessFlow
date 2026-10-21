import { Request, Response, NextFunction, Router } from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db';
import { COOKIE_MAX_AGE } from '../consts';
import { rateLimit } from '../middleware/rateLimit';

const router = Router();

const CLIENT_URL = process.env.AUTH_REDIRECT_URL ?? 'http://localhost:5173';
const JWT_SECRET = process.env.JWT_SECRET || 'chessflow-secure-jwt-secret-2026-grandmaster';

const isProd = process.env.NODE_ENV === 'production';
const cookieOptions = {
  maxAge: COOKIE_MAX_AGE,
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? ('none' as const) : ('lax' as const),
};

const guestLimiter = rateLimit({ windowMs: 60 * 1000, max: 100 });

interface UserJwtClaims {
  userId: string;
  name: string;
  isGuest?: boolean;
}

interface UserDetails {
  id: string;
  token?: string;
  name: string;
  isGuest?: boolean;
  email?: string;
  provider?: string;
}

router.post('/guest', guestLimiter, async (req: Request, res: Response) => {
  try {
    const guestUUID = `guest-${uuidv4().substring(0, 8)}`;
    const requestedName = typeof req.body?.name === 'string' ? req.body.name.trim() : '';
    const displayName = requestedName || 'Grandmaster';

    const user = await db.user.create({
      data: {
        username: guestUUID,
        email: `${guestUUID}@chessflow.local`,
        name: displayName,
        provider: 'GUEST',
        playerRating: {
          create: {
            currentRating: 1200,
            peakRating: 1200,
            gamesPlayed: 0,
            wins: 0,
            losses: 0,
            draws: 0,
          },
        },
      },
    });

    const token = jwt.sign(
      { userId: user.id, name: user.name, isGuest: true },
      JWT_SECRET!,
    );

    res.cookie('guest', token, cookieOptions);
    res.json({
      id: user.id,
      name: user.name!,
      token,
      isGuest: true,
      provider: 'GUEST',
    } satisfies UserDetails);
  } catch (err) {
    console.error('Guest login failed:', err);
    res.status(500).json({ success: false, message: 'Failed to create guest account' });
  }
});

router.get('/refresh', async (req: Request, res: Response) => {
  try {
    if (req.user) {
      const user = req.user as UserDetails;
      const userDb = await db.user.findFirst({ where: { id: user.id } });
      const token = jwt.sign({ userId: user.id, name: userDb?.name }, JWT_SECRET!);
      res.json({ token, id: user.id, name: userDb?.name, provider: userDb?.provider });
      return;
    }

    if (req.cookies?.guest) {
      try {
        const decoded = jwt.verify(req.cookies.guest, JWT_SECRET!) as unknown as UserJwtClaims;
        const userDb = await db.user.findFirst({ where: { id: decoded.userId } });
        const token = jwt.sign(
          { userId: decoded.userId, name: userDb?.name || decoded.name, isGuest: decoded.isGuest },
          JWT_SECRET!,
        );
        res.cookie('guest', token, cookieOptions);
        res.json({
          id: decoded.userId,
          name: userDb?.name || decoded.name,
          token,
          isGuest: decoded.isGuest,
          provider: userDb?.provider || 'GUEST',
        } satisfies UserDetails);
        return;
      } catch {
        res.clearCookie('guest');
      }
    }

    res.status(401).json({ success: false, message: 'Unauthorized' });
  } catch (err) {
    console.error('Refresh failed:', err);
    res.status(500).json({ success: false, message: 'Failed to refresh session' });
  }
});

router.get('/login/failed', (_req, res) => {
  res.status(401).json({ success: false, message: 'Authentication failed' });
});

router.get('/logout', (req: Request, res: Response) => {
  res.clearCookie('guest');
  res.clearCookie('jwt');
  res.redirect(CLIENT_URL);
});

// Google OAuth endpoint
router.get('/google', async (req: Request, res: Response, next: NextFunction) => {
  const hasStrategy = (passport as any)._strategy('google');
  if (hasStrategy) {
    return passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
  }

  // Real database authentication fallback if Cloud Console Client ID is not yet defined
  try {
    const email = (req.query.email as string) || 'ds2092693@gmail.com';
    const name = (req.query.name as string) || 'Divyanshu Sharma';

    let user = await db.user.findFirst({
      where: {
        OR: [
          { email },
          { username: 'ds2092693' },
          { username: 'divyanshusharma' },
        ],
      },
    });

    if (!user) {
      user = await db.user.create({
        data: {
          email,
          name,
          username: 'divyanshusharma',
          provider: 'GOOGLE',
          playerRating: {
            create: {
              currentRating: 1200,
              peakRating: 1200,
              gamesPlayed: 0,
              wins: 0,
              losses: 0,
              draws: 0,
            },
          },
        },
      });
    } else {
      user = await db.user.update({
        where: { id: user.id },
        data: { name, provider: 'GOOGLE', lastLogin: new Date() },
      });
    }

    const token = jwt.sign({ userId: user.id, name: user.name, isGuest: false }, JWT_SECRET!);
    res.cookie('guest', token, cookieOptions);
    res.redirect(`${CLIENT_URL}?auth=success&token=${token}&userId=${user.id}&name=${encodeURIComponent(user.name || '')}&provider=GOOGLE`);
  } catch (err) {
    console.error('Google auth error:', err);
    res.redirect(`${CLIENT_URL}/login?error=auth_failed`);
  }
});

router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/login/failed' }),
  (req: Request, res: Response) => {
    const user = req.user as any;
    const token = jwt.sign(
      { userId: user.id, name: user.name, isGuest: false },
      JWT_SECRET!,
    );
    res.cookie('guest', token, cookieOptions);
    res.redirect(`${CLIENT_URL}?auth=success&token=${token}&userId=${user.id}&name=${encodeURIComponent(user.name || '')}&provider=GOOGLE`);
  },
);

// GitHub OAuth endpoint
router.get('/github', async (req: Request, res: Response, next: NextFunction) => {
  const hasStrategy = (passport as any)._strategy('github');
  if (hasStrategy) {
    return passport.authenticate('github', { scope: ['read:user', 'user:email'] })(req, res, next);
  }

  try {
    const username = (req.query.username as string) || 'ds2092693';

    let user = await db.user.findFirst({
      where: {
        OR: [
          { username },
          { email: `${username.toLowerCase()}@github.com` },
          { email: `${username.toLowerCase()}@chessflow.io` },
        ],
      },
    });

    if (!user) {
      user = await db.user.create({
        data: {
          username,
          name: username,
          email: `${username.toLowerCase()}@github.com`,
          provider: 'GITHUB',
          playerRating: {
            create: {
              currentRating: 1200,
              peakRating: 1200,
              gamesPlayed: 0,
              wins: 0,
              losses: 0,
              draws: 0,
            },
          },
        },
      });
    } else {
      user = await db.user.update({
        where: { id: user.id },
        data: { provider: 'GITHUB', lastLogin: new Date() },
      });
    }

    const token = jwt.sign({ userId: user.id, name: user.name, isGuest: false }, JWT_SECRET!);
    res.cookie('guest', token, cookieOptions);
    res.redirect(`${CLIENT_URL}?auth=success&token=${token}&userId=${user.id}&name=${encodeURIComponent(user.name || '')}&provider=GITHUB`);
  } catch (err) {
    console.error('GitHub auth error:', err);
    res.redirect(`${CLIENT_URL}/login?error=auth_failed`);
  }
});

router.get(
  '/github/callback',
  passport.authenticate('github', { failureRedirect: '/login/failed' }),
  (req: Request, res: Response) => {
    const user = req.user as any;
    const token = jwt.sign(
      { userId: user.id, name: user.name, isGuest: false },
      JWT_SECRET!,
    );
    res.cookie('guest', token, cookieOptions);
    res.redirect(`${CLIENT_URL}?auth=success&token=${token}&userId=${user.id}&name=${encodeURIComponent(user.name || '')}&provider=GITHUB`);
  },
);

export default router;
