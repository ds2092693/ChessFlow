import {
  GitHubLogoIcon,
  LinkedInLogoIcon
} from '@radix-ui/react-icons';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="mt-32 py-12 border-t border-slate-800/80 bg-slate-950/60 backdrop-blur-xl text-slate-400">
      <div className="w-[94%] max-w-screen-xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-violet-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
            <span className="text-white font-black text-lg">♟</span>
          </div>
          <div>
            <span className="font-bold text-white text-lg tracking-tight">ChessFlow</span>
            <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20">v2.0</span>
            <p className="text-xs text-slate-500">Real-Time WebSocket Chess & Minimax AI Engine</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 text-sm font-medium">
          <Link to="/" className="hover:text-cyan-400 transition-colors">Home</Link>
          <Link to="/game/random" className="hover:text-cyan-400 transition-colors">Play Online</Link>
          <Link to="/game/computer" className="hover:text-cyan-400 transition-colors">Vs AI Bot</Link>
          <Link to="/leaderboard" className="hover:text-cyan-400 transition-colors">Leaderboard</Link>
          <Link to="/settings/themes" className="hover:text-cyan-400 transition-colors">Themes</Link>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-xs text-slate-400">Engineered by <span className="font-semibold text-slate-200">Divyanshu Sharma</span></span>
          <div className="flex gap-2">
            <a
              href="https://github.com/ds2092693"
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub Profile"
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/50 hover:text-cyan-400 transition-all hover:scale-105"
            >
              <GitHubLogoIcon className="w-4 h-4" />
            </a>
            <a
              href="https://www.linkedin.com/in/divyanshu-sharma-899267297/"
              target="_blank"
              rel="noreferrer"
              aria-label="LinkedIn Profile"
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-violet-500/50 hover:text-violet-400 transition-all hover:scale-105"
            >
              <LinkedInLogoIcon className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
      <div className="mt-8 text-center text-xs text-slate-600 border-t border-slate-900/60 pt-6">
        © 2026 ChessFlow by Divyanshu Sharma. All rights reserved.
      </div>
    </footer>
  );
};
