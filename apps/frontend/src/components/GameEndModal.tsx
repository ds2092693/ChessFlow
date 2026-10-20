import React, { useState } from 'react';
import { GameResult, Result } from '@/screens/Game';
import { TrophyIcon, XIcon } from 'lucide-react';

const WhiteKing = '/wk.png';
const BlackKing = '/bk.png';

interface ModalProps {
  blackPlayer?: { id: string; name: string };
  whitePlayer?: { id: string; name: string };
  gameResult: GameResult;
}

const GameEndModal: React.FC<ModalProps> = ({
  blackPlayer,
  whitePlayer,
  gameResult,
}) => {
  const [isOpen, setIsOpen] = useState(true);

  if (!isOpen) return null;

  const closeModal = () => {
    setIsOpen(false);
  };

  const isWhiteWinner = gameResult.result === Result.WHITE_WINS;
  const isBlackWinner = gameResult.result === Result.BLACK_WINS;
  const isDraw = gameResult.result === Result.DRAW;

  const PlayerDisplay = ({
    player,
    isWhite,
    isWinner,
  }: {
    player?: { id: string; name: string };
    isWhite: boolean;
    isWinner: boolean;
  }) => {
    const imageSrc = isWhite ? WhiteKing : BlackKing;

    return (
      <div className="flex flex-col items-center space-y-2">
        <div
          className={`w-16 h-16 rounded-2xl p-2 flex items-center justify-center transition-all ${
            isWinner
              ? 'bg-gradient-to-tr from-amber-400/20 to-emerald-400/20 border-2 border-emerald-400 shadow-lg shadow-emerald-500/20 scale-105'
              : 'bg-slate-900 border border-slate-800 opacity-60'
          }`}
        >
          <img
            src={imageSrc}
            alt={`${isWhite ? 'White' : 'Black'} King`}
            className="w-10 h-10 object-contain filter drop-shadow"
          />
        </div>
        <div className="text-center">
          <p className="text-white text-xs font-bold truncate w-24">
            {player?.name ?? 'Player'}
          </p>
          <p className="text-[10px] text-slate-400">
            {isWhite ? 'White (♔)' : 'Black (♚)'}
          </p>
        </div>
      </div>
    );
  };

  const getWinnerMessage = (result: Result) => {
    switch (result) {
      case Result.BLACK_WINS:
        return 'Black Claimed Victory!';
      case Result.WHITE_WINS:
        return 'White Claimed Victory!';
      default:
        return "Match Drawn";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
        onClick={closeModal}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl shadow-indigo-950/50 text-center space-y-6 animate-in zoom-in-95 duration-200">
        <button
          onClick={closeModal}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800"
        >
          <XIcon className="w-4 h-4" />
        </button>

        <div className="space-y-2">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <TrophyIcon className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            {getWinnerMessage(gameResult.result)}
          </h2>
          <p className="text-xs text-slate-400 font-mono">
            Outcome decided by {gameResult.by}
          </p>
        </div>

        {/* Players Showcase */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-around">
          <PlayerDisplay
            isWhite={true}
            player={whitePlayer}
            isWinner={isWhiteWinner}
          />
          <div className="font-mono text-slate-600 font-bold text-lg">VS</div>
          <PlayerDisplay
            isWhite={false}
            player={blackPlayer}
            isWinner={isBlackWinner}
          />
        </div>

        <div>
          <button
            onClick={closeModal}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white font-bold text-sm shadow-lg shadow-cyan-500/20 transition-all hover:scale-[1.01]"
          >
            Review Board Position
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameEndModal;
