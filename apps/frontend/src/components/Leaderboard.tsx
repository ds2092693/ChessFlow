import { useEffect, useState } from 'react';
import { TrophyIcon, UserCheckIcon, ShieldCheckIcon, SparklesIcon, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useUser } from '@repo/store/src/hooks/useUser';

const BACKEND_URL =
  import.meta.env.VITE_APP_BACKEND_URL ?? 'http://localhost:3000';

export interface LeaderboardEntry {
  id: string;
  name: string;
  username?: string;
  rating: number;
  totalGames: number;
  gamesPlayed?: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
  rank: number;
  isCurrentUser?: boolean;
}

export const Leaderboard = () => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const user = useUser();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const res = await fetch(`${BACKEND_URL}/api/leaderboard?limit=50`, {
          credentials: 'include',
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          const body = await res.json();
          if (!cancelled && body.success && Array.isArray(body.data)) {
            setEntries(body.data);
            return;
          }
        }
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Mark current user if matched
  const displayList = entries.map((entry) => {
    if (user && (entry.id === user.id || entry.name?.toLowerCase() === user.name?.toLowerCase())) {
      return { ...entry, isCurrentUser: true };
    }
    return entry;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-semibold mb-2">
            <TrophyIcon className="w-3.5 h-3.5 text-cyan-400" />
            Live Rankings
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Global Player Leaderboard</h1>
          <p className="text-slate-400 text-sm mt-1">Live Elo ratings computed from authentic platform matches.</p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/game/computer"
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white font-bold text-xs shadow-lg shadow-violet-950/40 transition-all hover:scale-105"
          >
            Play vs Computer
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] text-slate-400 space-y-3">
          <div className="w-8 h-8 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
          <p className="text-sm">Fetching live registered players...</p>
        </div>
      ) : displayList.length === 0 ? (
        <div className="rounded-3xl bg-slate-900/60 border border-slate-800/80 p-12 text-center backdrop-blur-xl">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-800/60 flex items-center justify-center text-slate-400">
            <Users className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">No Registered Players Yet</h2>
          <p className="text-slate-400 text-sm max-w-md mx-auto mb-6">
            Sign in with Google or GitHub to create your account and be the first to rank on the live leaderboard.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm transition-all"
          >
            Sign In Now
          </Link>
        </div>
      ) : (
        <div className="rounded-3xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-800/90 bg-slate-950/70 text-xs uppercase tracking-wider text-slate-400 font-semibold">
                  <th className="px-6 py-4">Rank</th>
                  <th className="px-6 py-4">Player</th>
                  <th className="px-6 py-4 text-center">Elo Rating</th>
                  <th className="px-6 py-4 text-center">Matches</th>
                  <th className="px-6 py-4 text-center">W / L / D</th>
                  <th className="px-6 py-4 text-center">Win Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-sm">
                {displayList.map((player) => {
                  const isGold = player.rank === 1;
                  const isSilver = player.rank === 2;
                  const isBronze = player.rank === 3;
                  const isUser = player.isCurrentUser;
                  const totalGames = player.totalGames ?? player.gamesPlayed ?? 0;
                  const winRate = totalGames > 0 ? player.winRate : 0;

                  return (
                    <tr
                      key={player.id}
                      className={`transition-colors group ${
                        isUser
                          ? 'bg-violet-600/15 border-l-4 border-l-cyan-400'
                          : 'hover:bg-slate-800/40'
                      }`}
                    >
                      <td className="px-6 py-4 font-bold">
                        {isGold ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold">
                            🥇 #1
                          </span>
                        ) : isSilver ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-300/15 border border-slate-300/30 text-slate-200 text-xs font-bold">
                            🥈 #2
                          </span>
                        ) : isBronze ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-700/15 border border-amber-700/30 text-amber-500 text-xs font-bold">
                            🥉 #3
                          </span>
                        ) : (
                          <span className="font-mono text-slate-500 pl-2">#{player.rank}</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white group-hover:text-cyan-300 transition-colors">
                            {player.name || player.username || 'Anonymous'}
                          </span>
                          {isUser && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                              YOU
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="font-mono font-black text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 rounded-xl text-xs shadow-sm">
                          {player.rating ?? 1200}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center font-mono text-slate-300">
                        {totalGames}
                      </td>
                      <td className="px-6 py-4 text-center text-xs font-mono">
                        <span className="text-emerald-400 font-semibold">{player.wins || 0}W</span>
                        <span className="text-slate-600 mx-1.5">/</span>
                        <span className="text-rose-400 font-semibold">{player.losses || 0}L</span>
                        <span className="text-slate-600 mx-1.5">/</span>
                        <span className="text-slate-400">{player.draws || 0}D</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <span className="font-mono font-semibold text-xs text-slate-200 w-12 text-right">
                            {winRate.toFixed(0)}%
                          </span>
                          <div className="w-16 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-cyan-400 to-emerald-400 h-1.5 rounded-full"
                              style={{ width: `${Math.min(winRate, 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
