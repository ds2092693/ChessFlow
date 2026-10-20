import { useNavigate } from 'react-router-dom';
import { BotIcon, ZapIcon, UsersIcon, TrophyIcon } from 'lucide-react';

export function PlayCard() {
  const navigate = useNavigate();

  const gameModes = [
    {
      icon: <ZapIcon className="w-6 h-6 text-cyan-400" />,
      badge: "Ranked",
      title: 'Play Online',
      description: 'Instant matchmaking vs players of similar Elo rating',
      onClick: () => navigate('/game/random'),
      highlight: true,
    },
    {
      icon: <BotIcon className="w-6 h-6 text-violet-400" />,
      badge: "Single Player",
      title: 'Play vs Computer',
      description: 'Battle minimax AI with alpha-beta search (Easy to Hard)',
      onClick: () => navigate('/game/computer'),
      highlight: false,
    },
    {
      icon: <TrophyIcon className="w-6 h-6 text-amber-400" />,
      badge: "Rankings",
      title: 'Global Leaderboard',
      description: 'Check top ranked grandmasters and win streaks',
      onClick: () => navigate('/leaderboard'),
      highlight: false,
    },
    {
      icon: <UsersIcon className="w-6 h-6 text-emerald-400" />,
      badge: "Coming Soon",
      title: 'Play a Friend',
      description: 'Create private custom rooms with custom time controls',
      disabled: true,
      highlight: false,
    },
  ];

  return (
    <div className="w-full max-w-md flex flex-col justify-center">
      <div className="p-6 md:p-8 rounded-3xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl shadow-2xl shadow-violet-950/30">
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold mb-3">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            Live WebSocket Matchmaking
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Choose Your Match
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Pick a game mode to jump straight into the action.
          </p>
        </div>

        <div className="space-y-3">
          {gameModes.map((mode, index) => {
            return (
              <button
                key={index}
                disabled={mode.disabled}
                onClick={mode.onClick}
                className={`w-full text-left p-4 rounded-2xl transition-all duration-300 flex items-center justify-between group ${
                  mode.disabled
                    ? 'opacity-40 cursor-not-allowed bg-slate-900/40 border border-slate-800/50'
                    : mode.highlight
                    ? 'bg-gradient-to-r from-violet-600/30 to-cyan-600/20 hover:from-violet-600/40 hover:to-cyan-600/30 border border-cyan-500/40 hover:border-cyan-400 hover:shadow-lg hover:shadow-cyan-500/10 hover:scale-[1.01]'
                    : 'bg-slate-900/60 hover:bg-slate-800/70 border border-slate-800 hover:border-slate-700 hover:scale-[1.01]'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 group-hover:scale-110 transition-transform">
                    {mode.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-white text-base group-hover:text-cyan-300 transition-colors">
                        {mode.title}
                      </h3>
                      {mode.badge && (
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          mode.highlight 
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' 
                            : 'bg-slate-800 text-slate-400'
                        }`}>
                          {mode.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5 max-w-[240px]">
                      {mode.description}
                    </p>
                  </div>
                </div>

                {!mode.disabled && (
                  <span className="text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all text-xl font-bold pr-1">
                    →
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
