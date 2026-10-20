import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SideNav } from '@/components/side-nav';
import { UpperNavItems, LowerNavItems } from '@/components/constants/side-nav';
import { cn } from '@/lib/utils';
import { useSidebar } from '@/hooks/useSidebar';

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className }: SidebarProps) {
  const { isOpen, toggle } = useSidebar();
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      const screenWidth = window.innerWidth;
      const isBetweenMDAndLG = screenWidth >= 768 && screenWidth < 1024;
      if (isBetweenMDAndLG) {
        if (isOpen) toggle();
      } else {
        if (!isOpen) toggle();
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen, toggle]);

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col justify-between h-screen sticky top-0 bg-slate-950/80 backdrop-blur-xl border-r border-slate-800/80 text-white w-16 lg:w-56 py-6 transition-all duration-300 z-40 select-none",
        className
      )}
    >
      <div className="flex flex-col">
        {/* Brand Logo */}
        <button
          onClick={() => navigate('/')}
          className="px-4 mb-8 flex items-center gap-3.5 group text-left cursor-pointer transition-transform hover:scale-102"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/25 shrink-0 group-hover:rotate-6 transition-transform">
            <span className="text-xl">♞</span>
          </div>
          <div className="hidden lg:flex flex-col">
            <span className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
              ChessFlow
            </span>
            <span className="text-[10px] font-semibold text-cyan-400 uppercase tracking-widest">
              Grandmaster
            </span>
          </div>
        </button>

        {/* Primary Navigation */}
        <SideNav items={UpperNavItems} />
      </div>

      {/* Lower / Utility Navigation */}
      <div className="flex flex-col border-t border-slate-800/60 pt-4">
        <SideNav items={LowerNavItems} />
        
        {/* Author badge on expanded sidebar */}
        <div className="hidden lg:block px-4 mt-4 pt-3 border-t border-slate-800/40 text-[11px] text-slate-500">
          <p className="truncate">By Divyanshu Sharma</p>
          <p className="text-[10px] text-cyan-500/80 font-mono">ds2092693</p>
        </div>
      </div>
    </aside>
  );
}
