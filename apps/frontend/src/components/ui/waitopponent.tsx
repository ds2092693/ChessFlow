export function Waitopponent() {
  return (
    <div className="relative p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl text-center space-y-4">
      <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-20"></span>
        <span className="animate-pulse absolute inline-flex h-12 w-12 rounded-full bg-violet-500/30"></span>
        <div className="relative w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-400 to-violet-500 flex items-center justify-center shadow-lg shadow-cyan-500/30 text-white font-bold">
          ♟
        </div>
      </div>
      <div>
        <h5 className="text-base font-bold text-white tracking-tight">
          Searching for Opponent...
        </h5>
        <p className="text-xs text-slate-400 mt-1">
          Pairing within your Elo rating band. Widening range automatically.
        </p>
      </div>
    </div>
  );
}
