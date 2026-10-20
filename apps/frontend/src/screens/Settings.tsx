import { Link, Outlet, useLocation } from "react-router-dom";
import { PaletteIcon, ShieldIcon } from "lucide-react";

export const Settings = () => {
  const location = useLocation();

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Preferences & Settings</h1>
        <p className="text-slate-400 text-sm mt-1">Configure your board aesthetics, sounds, and account setup.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-56 shrink-0 space-y-2">
          <Link
            to="/settings/themes"
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
              location.pathname.includes("themes") || location.pathname === "/settings"
                ? "bg-violet-600/20 text-cyan-300 border border-violet-500/30 shadow-md"
                : "text-slate-400 hover:text-white hover:bg-slate-900/60"
            }`}
          >
            <PaletteIcon className="w-4 h-4 text-cyan-400" />
            <span>Themes & Board</span>
          </Link>
          <div className="px-4 py-3 rounded-2xl text-sm font-medium text-slate-500 flex items-center gap-3 cursor-not-allowed">
            <ShieldIcon className="w-4 h-4 text-slate-600" />
            <span>Audio & Gameplay</span>
          </div>
        </aside>

        <div className="flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
