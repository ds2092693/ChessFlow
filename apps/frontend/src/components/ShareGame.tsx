import { useState } from "react";
import { LinkIcon, CheckIcon, CopyIcon } from "lucide-react";

export const ShareGame = ({ className, gameId }: { className?: string, gameId: string }) => {
  const url = window.origin + "/game/" + gameId;
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    window.navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`flex flex-col items-center gap-4 ${className}`}>
      <div className="text-center">
        <h3 className="text-xl font-bold text-white tracking-tight">
          Invite a Friend to Room
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          Share this direct URL with your opponent to play together
        </p>
      </div>

      <div
        onClick={handleCopy}
        className="w-full max-w-sm flex items-center justify-between gap-3 p-3 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-cyan-500/50 cursor-pointer transition-all group"
      >
        <div className="flex items-center gap-2.5 overflow-hidden">
          <LinkIcon className="w-4 h-4 text-cyan-400 shrink-0" />
          <span className="font-mono text-xs text-slate-300 truncate">{url}</span>
        </div>
        <button
          type="button"
          className="p-1.5 rounded-lg bg-slate-800 text-slate-300 group-hover:text-white shrink-0"
        >
          {copied ? <CheckIcon className="w-4 h-4 text-emerald-400" /> : <CopyIcon className="w-4 h-4" />}
        </button>
      </div>

      <button
        onClick={handleCopy}
        className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 ${
          copied
            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
            : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md shadow-cyan-500/20 hover:scale-105'
        }`}
      >
        {copied ? (
          <>
            <CheckIcon className="w-3.5 h-3.5" />
            <span>Link Copied!</span>
          </>
        ) : (
          <>
            <CopyIcon className="w-3.5 h-3.5" />
            <span>Copy Direct Invite Link</span>
          </>
        )}
      </button>
    </div>
  );
};
