import { useEffect, useState } from 'react';
import { TrophyIcon, FlameIcon, ShieldIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

const BACKEND_URL =
  import.meta.env.VITE_APP_BACKEND_URL ?? 'http://localhost:3000';

interface LeaderboardEntry {
  id: string;
  rank: number;
  name: string;
  rating?: number;
  wins: number;
  losses: number;
  draws: number;
  totalGames: number;
  winRate: number;
}

const Leaderboard = () => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/leaderboard?limit=50`, {
          credentials: 'include',
        });
        if (!res.ok) throw new Error(res.statusText);
        const body = await res.json();
        if (!cancelled) setEntries(body.success && body.data ? body.data : []);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load leaderboard');
          setEntries([]);
        }
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
        <p className="text-sm">Fetching global rankings...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-8 rounded-3xl bg-slate-900/60 border border-slate-800 text-center space-y-4">
        <p className="text-rose-400 font-bold">Failed to load leaderboard</p>
        <p className="text-xs text-slate-400">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold mb-2">
            <TrophyIcon className="w-3.5 h-3.5 text-amber-400" />
            Global Hall of Fame
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Grandmaster Leaderboard</h1>
          <p className="text-slate-400 text-sm mt-1">Live Elo ratings computed via dynamic K-factor standard.</p>
        </div>
      </div>

      {entries.length === 0 ? (
        <div className="text-center py-16 px-6 rounded-3xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-xl space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-center text-2xl">
            🏆
          </div>
          <h2 className="text-xl font-bold text-white">No ranked players yet</h2>
          <p className="text-sm text-slate-400 max-w-sm mx-auto">
            Play online matches to earn your initial Elo rating and climb to the top!
          </p>
          <Link
            to="/game/random"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm transition-all hover:scale-105 shadow-lg shadow-cyan-500/20"
          >
            Play First Match
          </Link>
        </div>
      ) : (
        <div className="rounded-3xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-800/90 bg-slate-950/60 text-xs uppercase tracking-wider text-slate-400 font-semibold">
                  <th className="px-6 py-4">Rank</th>
                  <th className="px-6 py-4">Grandmaster</th>
                  <th className="px-6 py-4 text-center">Elo Rating</th>
                  <th className="px-6 py-4 text-center">Matches</th>
                  <th className="px-6 py-4 text-center">W / L / D</th>
                  <th className="px-6 py-4 text-center">Win Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-sm">
                {entries.map((player) => {
                  const isGold = player.rank === 1;
                  const isSilver = player.rank === 2;
                  const isBronze = player.rank === 3;

                  return (
                    <tr
                      key={player.id}
                      className="hover:bg-slate-800/40 transition-colors group"
                    >
                      <td className="px-6 py-4 font-bold">
                        {isGold ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold">
                            🥇 #1
                          </span>
                        ) : isSilver ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-300/10 border border-slate-300/30 text-slate-200 text-xs font-bold">
                            🥈 #2
                          </span>
                        ) : isBronze ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-700/10 border border-amber-700/30 text-amber-500 text-xs font-bold">
                            🥉 #3
                          </span>
                        ) : (
                          <span className="font-mono text-slate-500 pl-2">#{player.rank}</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          to={`/stats/${player.id}`}
                          className="font-bold text-white group-hover:text-cyan-300 transition-colors flex items-center gap-2"
                        >
                          <span>{player.name}</span>
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="font-mono font-black text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 rounded-xl text-xs">
                          {player.rating ?? '1200'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center font-mono text-slate-300">
                        {player.totalGames}
                      </td>
                      <td className="px-6 py-4 text-center text-xs font-mono">
                        <span className="text-emerald-400 font-semibold">{player.wins}W</span>
                        <span className="text-slate-600 mx-1.5">/</span>
                        <span className="text-rose-400 font-semibold">{player.losses}L</span>
                        <span className="text-slate-600 mx-1.5">/</span>
                        <span className="text-slate-400">{player.draws}D</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <span className="font-mono font-semibold text-xs text-slate-200 w-12 text-right">
                            {player.winRate.toFixed(0)}%
                          </span>
                          <div className="w-16 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-cyan-400 to-emerald-400 h-1.5 rounded-full"
                              style={{ width: `${Math.min(player.winRate, 100)}%` }}
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
