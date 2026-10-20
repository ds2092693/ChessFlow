import { PlayCard } from '@/components/Card';
import { Footer } from '@/components/Footer';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@repo/store/src/hooks/useUser';
import { LogInIcon, UserIcon } from 'lucide-react';
import { 
  ZapIcon, 
  CpuIcon, 
  ShieldCheckIcon, 
  SparklesIcon, 
  GitForkIcon, 
  StarIcon,
  ActivityIcon,
  CrownIcon
} from 'lucide-react';
import { GitHubLogoIcon, LinkedInLogoIcon } from '@radix-ui/react-icons';

export const Landing = () => {
  const navigate = useNavigate();
  const user = useUser();

  return (
    <div className="flex flex-col space-y-16">
      {/* Top Welcome / Sign-in Banner at start */}
      {!user ? (
        <div className="p-4 rounded-3xl bg-gradient-to-r from-cyan-950/60 via-slate-900/80 to-violet-950/60 border border-cyan-500/30 backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400 shrink-0">
              <CrownIcon className="w-6 h-6" />
            </div>
            <div>
              <div className="font-bold text-white text-sm">Join the ChessFlow Grandmaster Arena</div>
              <div className="text-xs text-slate-400">Sign in with Google, GitHub or Guest to track your Elo rating and rank globally.</div>
            </div>
          </div>
          <button
            onClick={() => navigate("/login")}
            className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/25 transition-all hover:scale-105 shrink-0 flex items-center gap-2"
          >
            <LogInIcon className="w-3.5 h-3.5" />
            <span>Sign In / Register</span>
          </button>
        </div>
      ) : (
        <div className="p-4 rounded-3xl bg-slate-900/80 border border-slate-800/90 backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-500 to-violet-600 text-white font-black text-base flex items-center justify-center shadow-md">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="font-bold text-white text-sm flex items-center gap-2">
                <span>Welcome back, {user.name}</span>
                {user.provider && (
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    {user.provider}
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-400 font-mono mt-0.5">Player ID: {user.id} • Grandmaster Tier</div>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => navigate("/profile")}
              className="px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span>Profile</span>
            </button>
            <button
              onClick={() => navigate("/game/computer")}
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-all shadow-md hover:scale-105 flex items-center gap-1.5"
            >
              <CpuIcon className="w-3.5 h-3.5" />
              <span>Play AI</span>
            </button>
          </div>
        </div>
      )}
      {/* Hero Section */}
      <section className="relative pt-4 md:pt-8">
        {/* Subtle background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-violet-600/15 via-cyan-500/10 to-transparent blur-3xl pointer-events-none -z-10" />

        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-16">
          {/* Hero Left: Headlines & CTA */}
          <div className="flex-1 text-center lg:text-left space-y-6">
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-slate-900/80 border border-violet-500/30 text-violet-300 text-xs font-semibold shadow-inner">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
              </span>
              Next-Gen WebSocket Chess Platform
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1]">
              Master Every Move. <br />
              <span className="bg-gradient-to-r from-cyan-400 via-indigo-300 to-violet-400 bg-clip-text text-transparent">
                Challenge The World.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Engineered with server-authoritative WebSockets, FIDE-grade Elo matchmaking, 
              and an in-house Minimax AI with Alpha-Beta pruning. Play seamless, zero-latency 
              grandmaster chess right in your browser.
            </p>

            {/* Quick action buttons */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
              <button
                onClick={() => navigate('/game/random')}
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white font-bold text-sm shadow-xl shadow-cyan-500/20 hover:shadow-cyan-500/35 transition-all hover:scale-105 flex items-center gap-2"
              >
                <ZapIcon className="w-4 h-4 fill-white" />
                Quick Match Online
              </button>
              <button
                onClick={() => navigate('/game/computer')}
                className="px-6 py-3.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-slate-200 hover:text-white font-semibold text-sm transition-all hover:scale-105 flex items-center gap-2"
              >
                <CpuIcon className="w-4 h-4 text-violet-400" />
                Play Minimax AI
              </button>
            </div>

            {/* Live stats preview ticker */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-800/60 max-w-lg mx-auto lg:mx-0 text-left">
              <div>
                <p className="text-2xl font-black text-white font-mono">&lt; 30ms</p>
                <p className="text-xs text-slate-400">WS Latency</p>
              </div>
              <div>
                <p className="text-2xl font-black text-cyan-400 font-mono">Depth 4</p>
                <p className="text-xs text-slate-400">Minimax Engine</p>
              </div>
              <div>
                <p className="text-2xl font-black text-violet-400 font-mono">100%</p>
                <p className="text-xs text-slate-400">Server-Validated</p>
              </div>
            </div>
          </div>

          {/* Hero Right: Game Mode Selector Card */}
          <div className="flex-1 flex justify-center w-full">
            <PlayCard />
          </div>
        </div>
      </section>

      {/* Visual Showcase: Interactive Board Preview */}
      <section className="relative rounded-3xl p-8 md:p-12 bg-slate-900/50 border border-slate-800/80 backdrop-blur-xl overflow-hidden shadow-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-5 space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-semibold">
              <SparklesIcon className="w-3.5 h-3.5 text-violet-400" />
              Tournament-Grade Aesthetics
            </div>
            <h2 className="text-3xl font-extrabold text-white tracking-tight">
              Flawless Visual Feedback & Real-Time Telemetry
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Every square, piece transition, and capture is rendered with custom animations, 
              live PGN notation history, legal move projection dots, and instant check alerts.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <div className="w-6 h-6 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">✓</div>
                <span>Server-authoritative move verification via <code className="text-xs text-cyan-300 bg-slate-800 px-1.5 py-0.5 rounded">chess.js</code></span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <div className="w-6 h-6 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">✓</div>
                <span>Dynamic Elo bands with progressive wait-time widening</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <div className="w-6 h-6 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">✓</div>
                <span>5 custom board themes: Cyberpunk, Emerald, Sapphire & Sakura</span>
              </div>
            </div>

            <div className="pt-4">
              <button
                onClick={() => navigate('/settings/themes')}
                className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 uppercase tracking-wider group"
              >
                Customize Board Themes <span className="group-hover:translate-x-1 transition-transform">→</span>
              </button>
            </div>
          </div>

          {/* Interactive Graphic Representation */}
          <div className="lg:col-span-7 flex justify-center">
            <div className="relative p-4 rounded-2xl bg-slate-950/90 border border-slate-800 shadow-2xl">
              {/* Board Header Bar */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800/80 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-semibold text-slate-300">Live Match Simulation</span>
                </div>
                <div className="flex items-center gap-2 font-mono text-slate-400">
                  <span>10:00</span>
                  <span>vs</span>
                  <span className="text-cyan-400 font-bold">Minimax AI (Depth 3)</span>
                </div>
              </div>

              {/* Mini Board Graphic */}
              <div className="grid grid-cols-8 gap-0 border-2 border-slate-800 rounded-lg overflow-hidden w-[280px] h-[280px] sm:w-[360px] sm:h-[360px] bg-slate-950 shadow-inner">
                {Array.from({ length: 64 }).map((_, idx) => {
                  const row = Math.floor(idx / 8);
                  const col = idx % 8;
                  const isDark = (row + col) % 2 === 1;
                  const isHighlighted = idx === 28 || idx === 36; // e4 / e5 highlights
                  const isCheck = idx === 4; // king square
                  return (
                    <div
                      key={idx}
                      className={`relative flex items-center justify-center select-none transition-colors ${
                        isHighlighted
                          ? 'bg-amber-400/30'
                          : isCheck
                          ? 'bg-rose-500/40 ring-1 ring-rose-400 animate-pulse'
                          : isDark
                          ? 'bg-indigo-600/80'
                          : 'bg-indigo-100/90'
                      }`}
                    >
                      {/* Sample preview pieces */}
                      {idx === 4 && <span className="text-xl sm:text-2xl filter drop-shadow">♚</span>}
                      {idx === 60 && <span className="text-xl sm:text-2xl filter drop-shadow">♔</span>}
                      {idx === 28 && <span className="text-xl sm:text-2xl text-slate-900 filter drop-shadow">♙</span>}
                      {idx === 36 && <span className="text-xl sm:text-2xl text-slate-900 filter drop-shadow">♟</span>}
                      {idx === 42 && <span className="text-xl sm:text-2xl text-slate-900 filter drop-shadow">♘</span>}
                      {idx === 21 && <span className="text-xl sm:text-2xl text-slate-900 filter drop-shadow">♞</span>}
                      {/* Projected legal dot */}
                      {(idx === 20 || idx === 18) && (
                        <div className="w-3 h-3 rounded-full bg-cyan-400/80 shadow-md shadow-cyan-400/50" />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Board Footer Bar */}
              <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-800/80 text-xs text-slate-400 font-mono">
                <span>Move 14 • 1. e4 e5 2. Nf3 Nc6</span>
                <span className="text-emerald-400 font-semibold">+0.6 Eval</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Architecture Highlights Grid */}
      <section className="space-y-10">
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            Engineered For Precision & Performance
          </h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            A battle-tested full-stack monorepo featuring high-concurrency WebSocket state management and PostgreSQL persistence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-violet-500/40 transition-all hover:-translate-y-1">
            <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-4">
              <ZapIcon className="w-6 h-6 text-violet-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">WebSocket Room Gateway</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Bi-directional, event-driven WebSocket communication handles real-time clock synchronization, moves, resignation, and draw requests with microsecond latency.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 transition-all hover:-translate-y-1">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-4">
              <CpuIcon className="w-6 h-6 text-cyan-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Minimax & Alpha-Beta Search</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              In-house computer engine utilizing alpha-beta pruning, MVV-LVA (Most Valuable Victim - Least Valuable Attacker) move ordering, and positional piece-square tables.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/40 transition-all hover:-translate-y-1">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4">
              <CrownIcon className="w-6 h-6 text-emerald-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Adaptive Elo Matchmaking</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Real-time rating engine dynamically scales K-factor (K=32 default, 40 provisional, 10 for 2100+) and widens matchmaking bands as wait times increase.
            </p>
          </div>
        </div>
      </section>

      {/* Engineering Showcase & Author Spotlight */}
      <section className="p-8 md:p-12 rounded-3xl bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-slate-950 border border-slate-800/90 backdrop-blur-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-4 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-semibold">
              <ActivityIcon className="w-3.5 h-3.5 text-cyan-400" />
              Engineered by Divyanshu Sharma
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Crafted with Modern Full-Stack Excellence
            </h2>
            <p className="text-slate-400 text-sm max-w-xl">
              ChessFlow represents a complete production-grade real-time system with clean Turborepo monorepo architecture, Prisma ORM, Recoil state management, and Tailwind CSS.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href="https://github.com/ds2092693"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-cyan-500/50 text-white font-bold text-sm flex items-center gap-3 transition-all hover:scale-105 shadow-lg"
            >
              <GitHubLogoIcon className="w-5 h-5 text-cyan-400" />
              <span>GitHub Profile</span>
            </a>
            <a
              href="https://www.linkedin.com/in/divyanshu-sharma-899267297/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-4 rounded-2xl bg-violet-600/20 hover:bg-violet-600/30 border border-violet-500/40 hover:border-violet-400 text-violet-200 font-bold text-sm flex items-center gap-3 transition-all hover:scale-105 shadow-lg shadow-violet-950/40"
            >
              <LinkedInLogoIcon className="w-5 h-5 text-violet-400" />
              <span>Connect on LinkedIn</span>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};
