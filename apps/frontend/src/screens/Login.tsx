import { useNavigate } from 'react-router-dom';
import { useRef } from 'react';
import { useRecoilState } from 'recoil';
import { User, userAtom } from '../../../../packages/store/src/atoms/user';
import { UserIcon, ArrowRightIcon } from 'lucide-react';
import { GitHubLogoIcon } from '@radix-ui/react-icons';

const BACKEND_URL =
  import.meta.env.VITE_APP_BACKEND_URL ?? 'http://localhost:3000';

const OAUTH_ENABLED = import.meta.env.VITE_OAUTH_ENABLED === 'true';

const Login = () => {
  const navigate = useNavigate();
  const guestName = useRef<HTMLInputElement>(null);
  const [, setUser] = useRecoilState(userAtom);

  const google = () => {
    window.open(`${BACKEND_URL}/auth/google`, '_self');
  };

  const github = () => {
    window.open(`${BACKEND_URL}/auth/github`, '_self');
  };

  const loginAsGuest = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const name = guestName.current?.value.trim() || 'Grandmaster';
    try {
      const response = await fetch(`${BACKEND_URL}/auth/guest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ name }),
      });
      if (response.ok) {
        const user = await response.json();
        setUser(user);
        navigate('/');
        return;
      }
    } catch (err) {
      console.warn('Backend not running, continuing in guest preview mode:', err);
    }

    // Graceful offline fallback so the user can test UI without needing a running backend/database:
    const fallbackUser: User = {
      id: 'guest-' + Math.floor(Math.random() * 10000),
      name: name,
      token: 'guest-preview-token',
      isGuest: true,
    };
    setUser(fallbackUser);
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-bgMain text-textMain relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[350px] bg-gradient-to-tr from-violet-600/20 via-cyan-500/10 to-transparent blur-3xl pointer-events-none -z-10" />

      <div className="w-full max-w-md p-8 rounded-3xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-2xl shadow-2xl shadow-violet-950/40">
        <div className="text-center mb-8">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-cyan-500 to-violet-600 flex items-center justify-center shadow-lg shadow-violet-500/25 mb-4">
            <span className="text-2xl">♞</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Enter ChessFlow</h1>
          <p className="text-sm text-slate-400 mt-1.5">Sign in to sync your Elo rating, matches, and stats.</p>
        </div>

        {OAUTH_ENABLED && (
          <div className="space-y-3 mb-6">
            <button
              onClick={google}
              className="w-full py-3 px-4 rounded-2xl bg-slate-800/70 hover:bg-slate-800 border border-slate-700/70 hover:border-slate-600 text-white font-semibold text-sm flex items-center justify-center gap-3 transition-all hover:scale-[1.01]"
            >
              <img src="/google.svg" alt="Google" className="w-5 h-5" />
              <span>Continue with Google</span>
            </button>
            <button
              onClick={github}
              className="w-full py-3 px-4 rounded-2xl bg-slate-800/70 hover:bg-slate-800 border border-slate-700/70 hover:border-slate-600 text-white font-semibold text-sm flex items-center justify-center gap-3 transition-all hover:scale-[1.01]"
            >
              <GitHubLogoIcon className="w-5 h-5" />
              <span>Continue with GitHub</span>
            </button>

            <div className="flex items-center my-6">
              <div className="flex-1 border-t border-slate-800"></div>
              <span className="px-3 text-xs uppercase tracking-wider text-slate-500 font-semibold">Or play as guest</span>
              <div className="flex-1 border-t border-slate-800"></div>
            </div>
          </div>
        )}

        <form onSubmit={loginAsGuest} className="space-y-4">
          <div>
            <label className="text-xs uppercase tracking-wider text-slate-400 font-semibold block mb-2">
              Guest Handle
            </label>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                ref={guestName}
                defaultValue="Grandmaster"
                placeholder="Choose nickname"
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-950/80 border border-slate-800 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 text-white placeholder-slate-500 text-sm transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white font-bold text-sm shadow-lg shadow-cyan-500/20 transition-all hover:scale-[1.01] flex items-center justify-center gap-2"
          >
            <span>Play as Guest</span>
            <ArrowRightIcon className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-slate-500">
          <button
            onClick={() => navigate('/')}
            className="hover:text-cyan-400 transition-colors"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
