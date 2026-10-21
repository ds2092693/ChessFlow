import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GithubStrategy } from 'passport-github2';
import { db } from './db';

interface GithubEmail {
  email: string;
  primary: boolean;
  verified: boolean;
  visibility: 'private' | 'public';
}

export function initPassport() {
  const {
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_CALLBACK_URL,
    GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET,
    GITHUB_CALLBACK_URL,
  } = process.env;

  if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: GOOGLE_CLIENT_ID,
          clientSecret: GOOGLE_CLIENT_SECRET,
          callbackURL: GOOGLE_CALLBACK_URL || 'https://chessflow-backend.onrender.com/auth/google/callback',
        },
        async (_accessToken, _refreshToken, profile, done) => {
          try {
            const email = profile.emails?.[0]?.value;
            if (!email) {
              return done(new Error('Google account has no email'));
            }

            const rawUsername = profile.displayName
              ? profile.displayName.toLowerCase().replace(/[^a-z0-9]/g, '')
              : `user${Date.now()}`;
            const username = rawUsername.length > 2 ? rawUsername : `user${Date.now()}`;

            let user = await db.user.findFirst({
              where: {
                OR: [{ email }, { username }],
              },
            });

            if (!user) {
              user = await db.user.create({
                data: {
                  email,
                  name: profile.displayName || 'Google Player',
                  username,
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
                data: {
                  name: profile.displayName || user.name,
                  lastLogin: new Date(),
                  provider: 'GOOGLE',
                },
              });
            }

            done(null, user);
          } catch (err) {
            console.error('Google passport strategy error:', err);
            done(err as Error);
          }
        },
      ),
    );
    console.log('✅ Real Google OAuth strategy registered successfully!');
  } else {
    console.warn('Google OAuth disabled: GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET not set');
  }

  if (GITHUB_CLIENT_ID && GITHUB_CLIENT_SECRET) {
    passport.use(
      new GithubStrategy(
        {
          clientID: GITHUB_CLIENT_ID,
          clientSecret: GITHUB_CLIENT_SECRET,
          callbackURL: GITHUB_CALLBACK_URL || 'https://chessflow-backend.onrender.com/auth/github/callback',
        },
        async (accessToken: string, _refreshToken: string, profile: any, done: any) => {
          try {
            const res = await fetch('https://api.github.com/user/emails', {
              headers: { Authorization: `token ${accessToken}` },
            });
            const emails = (await res.json()) as GithubEmail[];
            const primary = emails.find((e) => e.primary)?.email || `${profile.username}@github.com`;

            let user = await db.user.findFirst({
              where: {
                OR: [{ email: primary }, { username: profile.username }],
              },
            });

            if (!user) {
              user = await db.user.create({
                data: {
                  email: primary,
                  name: profile.displayName || profile.username,
                  username: profile.username || `gh_${Date.now()}`,
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
                data: {
                  name: profile.displayName || user.name,
                  lastLogin: new Date(),
                  provider: 'GITHUB',
                },
              });
            }

            done(null, user);
          } catch (err) {
            console.error('GitHub passport strategy error:', err);
            done(err);
          }
        },
      ),
    );
    console.log('✅ Real GitHub OAuth strategy registered successfully!');
  }

  passport.serializeUser((user: any, cb) => {
    process.nextTick(() => cb(null, { id: user.id, name: user.name }));
  });

  passport.deserializeUser((user: any, cb) => {
    process.nextTick(() => cb(null, user));
  });
}
