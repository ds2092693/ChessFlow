import { BACKEND_URL } from '../config/urls';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';



interface GameHistoryProps {
  userId: string;
}

interface Game {
  id: string;
  whitePlayer: { username: string };
  blackPlayer: { username: string };
  result: string;
  outcome: 'win' | 'loss' | 'draw' | null;
  ratingChange: number | null;
  playerRatingAfter: number;
  startAt: string;
  timeControl: string;
  opening: string;
  playerColor: 'white' | 'black';
}

const formatDate = (iso: string) => {
  const d = new Date(iso);
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })}`;
};

const GameHistory = ({ userId }: GameHistoryProps) => {
  const [games, setGames] = useState<Game[]>([]);
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
        const res = await fetch(
          `${BACKEND_URL}/api/games/history/${userId}?limit=10`,
          { credentials: 'include' },
        );
        if (res.status === 404) {
          if (!cancelled) setGames([]);
          return;
        }
        if (!res.ok) throw new Error(res.statusText);
        const body = await res.json();
        if (!cancelled) setGames(body.success && body.data ? body.data.games ?? [] : []);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load game history');
          setGames([]);
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
    return <div className="text-center py-8 text-slate-400 text-xs">Loading game history...</div>;
  }

  if (error) {
    return <div className="text-center py-6 text-rose-400 text-xs">{error}</div>;
  }

  if (games.length === 0) {
    return (
      <div className="text-center py-10 text-slate-400 text-xs space-y-2">
        <p>No matches recorded yet</p>
        <Link to="/game/random" className="text-cyan-400 font-semibold hover:underline">
          Play your first game →
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center text-xs text-slate-400 pb-1">
        <span>Recent Matches ({games.length})</span>
        {games.length >= 10 && (
          <Link to={`/history/${userId}`} className="text-cyan-400 font-semibold hover:underline">
            View All →
          </Link>
        )}
      </div>

      <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
        {games.map((game) => {
          const isWin = game.outcome === 'win';
          const isLoss = game.outcome === 'loss';

          return (
            <div
              key={game.id}
              className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-colors"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 text-xs font-semibold text-white">
                  <span className="truncate">
                    {game.whitePlayer.username} vs {game.blackPlayer.username}
                  </span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    ({game.playerColor === 'white' ? '♔ White' : '♚ Black'})
                  </span>
                </div>

                <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-1">
                  <span className={`uppercase font-bold px-1.5 py-0.2 rounded text-[10px] ${
                    isWin 
                      ? 'bg-emerald-500/20 text-emerald-300' 
                      : isLoss 
                      ? 'bg-rose-500/20 text-rose-300' 
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    {game.outcome ?? 'Finished'}
                  </span>

                  {game.ratingChange !== null && (
                    <span className={`font-mono font-bold ${game.ratingChange >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {game.ratingChange >= 0 ? `+${game.ratingChange}` : game.ratingChange} Elo
                    </span>
                  )}

                  {game.opening && (
                    <>
                      <span>•</span>
                      <span className="truncate max-w-[150px]">{game.opening}</span>
                    </>
                  )}
                </div>
              </div>

              <div className="text-[10px] font-mono text-slate-500 text-right shrink-0 ml-3">
                {formatDate(game.startAt)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GameHistory;
