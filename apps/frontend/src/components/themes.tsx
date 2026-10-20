import { THEMES_DATA } from "@/constants/themes";
import { useThemeContext } from "@/hooks/useThemes";
import { CheckCircle2Icon, SparklesIcon } from "lucide-react";

export function Themes() {
  const { theme: activeTheme, updateTheme } = useThemeContext();

  return (
    <div className="flex-1 space-y-6">
      <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl">
        <div className="flex items-center gap-2 mb-2">
          <SparklesIcon className="w-5 h-5 text-cyan-400" />
          <h2 className="text-xl font-bold text-white">Board & Accent Themes</h2>
        </div>
        <p className="text-slate-400 text-sm">
          Select a custom visual theme. Your preferences are saved automatically across all game modes.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {THEMES_DATA.map((t) => {
          const isSelected = activeTheme === t.name;

          return (
            <div
              key={t.id}
              onClick={() => updateTheme(t.name)}
              className={`p-5 rounded-3xl cursor-pointer transition-all duration-300 relative border overflow-hidden group ${
                isSelected
                  ? "bg-slate-900/90 border-cyan-400 shadow-xl shadow-cyan-500/10 ring-1 ring-cyan-400/50 scale-[1.02]"
                  : "bg-slate-900/50 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/70"
              }`}
            >
              {isSelected && (
                <div className="absolute top-4 right-4 text-cyan-400">
                  <CheckCircle2Icon className="w-5 h-5 fill-cyan-400/20" />
                </div>
              )}

              <div className="flex items-center gap-4 mb-4">
                {/* 2x2 Mini Board Preview */}
                <div className="grid grid-cols-2 rounded-xl overflow-hidden border border-slate-700/60 shadow-md shrink-0 w-16 h-16">
                  <div
                    className="flex items-center justify-center"
                    style={{ backgroundColor: t["board-light"] }}
                  >
                    <img src="/bk.png" className="w-6 h-6 object-contain" alt="" />
                  </div>
                  <div
                    className="flex items-center justify-center"
                    style={{ backgroundColor: t["board-dark"] }}
                  >
                    <img src="/wn.png" className="w-6 h-6 object-contain" alt="" />
                  </div>
                  <div
                    className="flex items-center justify-center"
                    style={{ backgroundColor: t["board-dark"] }}
                  >
                    <img src="/br.png" className="w-6 h-6 object-contain" alt="" />
                  </div>
                  <div
                    className="flex items-center justify-center"
                    style={{ backgroundColor: t["board-light"] }}
                  >
                    <img src="/wp.png" className="w-6 h-6 object-contain" alt="" />
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-white text-base group-hover:text-cyan-300 transition-colors">
                    {t.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                    {t.description}
                  </p>
                </div>
              </div>

              {/* Color swatches */}
              <div className="flex items-center gap-2 pt-3 border-t border-slate-800/80 text-xs text-slate-400">
                <span className="text-[11px] uppercase tracking-wider text-slate-500">Palette:</span>
                <div
                  className="w-4 h-4 rounded-full border border-slate-600 shadow-sm"
                  style={{ backgroundColor: t["board-light"] }}
                  title="Light square"
                />
                <div
                  className="w-4 h-4 rounded-full border border-slate-600 shadow-sm"
                  style={{ backgroundColor: t["board-dark"] }}
                  title="Dark square"
                />
                <div
                  className="w-4 h-4 rounded-full border border-slate-600 shadow-sm"
                  style={{ backgroundColor: t.accent }}
                  title="Accent glow"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
