import { BACKEND_URL } from '../config/urls';
import { useEffect, useState } from 'react';
import GameHistory from '@/components/GameHistory';
import PlayerStats from '@/components/PlayerStats';
import { User } from '@repo/store/src/atoms/user';
import { UserIcon, ShieldIcon, HistoryIcon, BarChart3Icon, LogInIcon } from 'lucide-react';
import { Link } from 'react-router-dom';



export function Profile() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/auth/refresh`, {
          credentials: 'include',
        });
        if (!cancelled && res.ok) {
          const u = await res.json();
          setUser(u);
          if (typeof window !== "undefined" && window.localStorage) {
            localStorage.setItem("chessflow_user", JSON.stringify(u));
          }
          return;
        }
      } catch (err) {
        console.error('Failed to fetch user:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-400 space-y-3">
        <div className="w-8 h-8 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
        <p className="text-sm">Loading player profile...</p>
      </div>
    );
  }

  if (!user?.id) {
    return (
      <div className="min-h-[400px] flex items-center justify-center p-6">
        <div className="max-w-md w-full p-8 rounded-3xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl text-center space-y-5 shadow-2xl">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-800 flex items-center justify-center text-slate-400">
            <UserIcon className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            Sign in to view your profile
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            Track your Elo rating progression, tournament history, match statistics, and win streaks.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white font-bold text-sm shadow-lg shadow-cyan-500/20 transition-all hover:scale-105"
          >
            <LogInIcon className="w-4 h-4" />
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Player Header Banner */}
      <header className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-violet-600 flex items-center justify-center shadow-lg shadow-violet-500/25 text-2xl font-black text-white">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {user.name}
              </h1>
              {user.isGuest ? (
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  GUEST
                </span>
              ) : (
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  VERIFIED
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 font-mono mt-1">Player ID: {user.id}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/game/random"
            className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md transition-all hover:scale-105"
          >
            Play Online
          </Link>
        </div>
      </header>

      {/* Stats & History Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="p-6 rounded-3xl bg-slate-900/50 border border-slate-800/80 backdrop-blur-xl shadow-xl space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800/60">
            <BarChart3Icon className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-white">Rating & Performance</h2>
          </div>
          <PlayerStats userId={user.id} />
        </section>

        <section className="p-6 rounded-3xl bg-slate-900/50 border border-slate-800/80 backdrop-blur-xl shadow-xl space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800/60">
            <HistoryIcon className="w-5 h-5 text-violet-400" />
            <h2 className="text-lg font-bold text-white">Recent Match History</h2>
          </div>
          <GameHistory userId={user.id} />
        </section>
      </div>
    </div>
  );
}
