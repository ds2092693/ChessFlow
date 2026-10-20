import { useEffect, useState } from 'react';
import { TrophyIcon, FlameIcon, SwordsIcon } from 'lucide-react';

const BACKEND_URL =
  import.meta.env.VITE_APP_BACKEND_URL ?? 'http://localhost:3000';

interface PlayerStatsProps {
  userId: string;
}

interface Stats {
  gamesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
  currentRating: number;
  peakRating: number;
  winStreak: number;
  longestWinStreak: number;
  winRate: number;
}

const EMPTY_STATS: Stats = {
  gamesPlayed: 0,
  wins: 0,
  losses: 0,
  draws: 0,
  currentRating: 1200,
  peakRating: 1200,
  winStreak: 0,
  longestWinStreak: 0,
  winRate: 0,
};

const StatCard = ({ label, value, highlight }: { label: string; value: string | number; highlight?: boolean }) => (
  <div className={`text-center p-4 rounded-2xl border transition-all ${
    highlight 
      ? 'bg-gradient-to-br from-cyan-500/10 to-violet-500/10 border-cyan-500/30 shadow-md shadow-cyan-500/10' 
      : 'bg-slate-950/60 border-slate-800/80'
  }`}>
    <div className={`text-2xl font-black font-mono ${highlight ? 'text-cyan-400' : 'text-white'}`}>
      {value}
    </div>
    <div className="text-[11px] text-slate-400 mt-1 uppercase tracking-wider font-semibold">{label}</div>
  </div>
);

const PlayerStats = ({ userId }: PlayerStatsProps) => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/games/stats/${userId}`, {
          credentials: 'include',
        });
        if (res.status === 404) {
          if (!cancelled) setStats(EMPTY_STATS);
          return;
        }
        if (!res.ok) throw new Error(res.statusText);
        const body = await res.json();
        if (!cancelled) setStats(body.success && body.data ? body.data : EMPTY_STATS);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load stats');
          setStats(EMPTY_STATS);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  if (loading) {
    return <div className="text-center py-8 text-slate-400 text-xs">Loading statistics...</div>;
  }

  if (error) {
    return <div className="text-center py-6 text-rose-400 text-xs">{error}</div>;
  }

  const s = stats ?? EMPTY_STATS;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <StatCard label="Current Elo" value={s.currentRating} highlight />
        <StatCard label="Peak Elo" value={s.peakRating} />
        <StatCard label="Win Rate" value={`${s.winRate.toFixed(0)}%`} highlight />
        <StatCard label="Games" value={s.gamesPlayed} />
        <StatCard label="Win Streak" value={`${s.winStreak} 🔥`} />
        <StatCard label="Best Streak" value={s.longestWinStreak} />
      </div>

      <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
          <span>Wins:</span>
          <span>{s.wins}</span>
        </div>
        <div className="flex items-center gap-1.5 text-rose-400 font-bold">
          <span>Losses:</span>
          <span>{s.losses}</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-400 font-bold">
          <span>Draws:</span>
          <span>{s.draws}</span>
        </div>
      </div>
    </div>
  );
};

export default PlayerStats;
