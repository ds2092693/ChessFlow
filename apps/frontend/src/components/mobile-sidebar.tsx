import { useState, useEffect } from 'react';
import { MenuIcon, XIcon } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { UpperNavItems, LowerNavItems } from '@/components/constants/side-nav';

export const MobileSidebar = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [open]);

  return (
    <div className="md:hidden sticky top-0 z-50 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800/80 px-4 py-3 flex items-center justify-between">
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-2.5 font-bold text-white text-base"
      >
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-violet-600 flex items-center justify-center shadow-md shadow-violet-500/20">
          <span className="text-sm">♞</span>
        </div>
        <span>ChessFlow</span>
      </button>

      <button
        onClick={() => setOpen(!open)}
        className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
        aria-label="Toggle navigation menu"
      >
        {open ? <XIcon className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
      </button>

      {open && (
        <div className="fixed inset-0 top-[57px] bg-slate-950/95 backdrop-blur-2xl z-50 flex flex-col justify-between p-6 animate-in fade-in duration-200">
          <div className="flex flex-col space-y-3">
            <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-1">Navigation</p>
            {UpperNavItems.map((item) => (
              <Link
                key={item.title}
                to={item.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3.5 p-3 rounded-xl bg-slate-900/60 border border-slate-800/60 text-slate-200 hover:text-cyan-400 font-medium text-base"
              >
                <item.icon className="w-5 h-5 text-cyan-400" />
                <span>{item.title}</span>
              </Link>
            ))}
          </div>

          <div className="flex flex-col space-y-3 pt-6 border-t border-slate-800">
            {LowerNavItems.map((item) => {
              const isExternal = item.href.startsWith('http');
              return isExternal ? (
                <a
                  key={item.title}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3.5 p-3 rounded-xl bg-slate-900/40 text-slate-400 hover:text-white font-medium text-base"
                >
                  <item.icon className="w-5 h-5 text-slate-400" />
                  <span>{item.title}</span>
                </a>
              ) : (
                <Link
                  key={item.title}
                  to={item.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3.5 p-3 rounded-xl bg-slate-900/40 text-slate-400 hover:text-white font-medium text-base"
                >
                  <item.icon className="w-5 h-5 text-slate-400" />
                  <span>{item.title}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
