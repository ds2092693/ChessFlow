import { useEffect, useRef, useState, useCallback } from 'react';
import { Chess, Square } from 'chess.js';
import { useRecoilState } from 'recoil';
import { BotIcon, UserIcon, RotateCcwIcon, SparklesIcon, CpuIcon, TrophyIcon, ShieldAlertIcon } from 'lucide-react';

import { ChessBoard, isPromoting } from '@/components/ChessBoard';
import { useSocket } from '@/hooks/useSocket';
import { movesAtom } from '@repo/store/src/atoms/chessBoard';
import { pickAIMove, evaluate, Difficulty } from '@/lib/minimax';
import MoveSound from '/move.wav';
import CaptureSound from '/capture.wav';

type Color = 'w' | 'b';
type ColorChoice = Color | 'random';
type Status = 'idle' | 'playing' | 'checkmate' | 'draw';

const moveAudio = new Audio(MoveSound);
const captureAudio = new Audio(CaptureSound);

const DIFFICULTIES: { value: Difficulty; label: string; depth: string; desc: string }[] = [
  { value: 'easy', label: 'Easy', depth: 'Depth 2', desc: 'Relaxed search for casual players' },
  { value: 'medium', label: 'Medium', depth: 'Depth 3', desc: 'Tactical play with MVV-LVA move ordering' },
  { value: 'hard', label: 'Master', depth: 'Depth 4', desc: 'Deep alpha-beta search with piece-square tables' },
];

export const ComputerGame = () => {
  const socket = useSocket();
  const [chess] = useState(() => new Chess());
  const [board, setBoard] = useState(chess.board());
  const [, setMoves] = useRecoilState(movesAtom);

  const [selectedColor, setSelectedColor] = useState<ColorChoice>('w');
  const [myColor, setMyColor] = useState<Color>('w');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [status, setStatus] = useState<Status>('playing');
  const [thinking, setThinking] = useState(false);
  const [evalScore, setEvalScore] = useState<number>(0);
  const [gameResultReason, setGameResultReason] = useState<string>('');

  const botThinkingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Trigger bot countermove using client-side Minimax engine
  const triggerAIMove = useCallback(
    (currentChess: Chess, currentDifficulty: Difficulty) => {
      if (currentChess.isGameOver()) {
        if (currentChess.isCheckmate()) {
          setStatus('checkmate');
          setGameResultReason(currentChess.turn() === 'w' ? 'Black won by checkmate!' : 'White won by checkmate!');
        } else {
          setStatus('draw');
          setGameResultReason('Game drawn by stalemate or repetition.');
        }
        return;
      }

      setThinking(true);

      if (botThinkingTimeoutRef.current) {
        clearTimeout(botThinkingTimeoutRef.current);
      }

      botThinkingTimeoutRef.current = setTimeout(() => {
        try {
          const botMove = pickAIMove(currentChess.fen(), currentDifficulty);
          if (botMove) {
            const executed = currentChess.move(botMove.san);
            if (executed) {
              if (executed.captured) {
                captureAudio.play().catch(() => {});
              } else {
                moveAudio.play().catch(() => {});
              }
              setBoard(currentChess.board());
              setMoves((prev) => [...prev, executed]);
              setEvalScore(evaluate(currentChess));
            }
          }
        } catch (err) {
          console.error('Error during AI move computation:', err);
        } finally {
          setThinking(false);
          if (currentChess.isGameOver()) {
            if (currentChess.isCheckmate()) {
              setStatus('checkmate');
              setGameResultReason(currentChess.turn() === 'w' ? 'Black won by checkmate!' : 'White won by checkmate!');
            } else {
              setStatus('draw');
              setGameResultReason('Game drawn.');
            }
          }
        }
      }, 400); // 400ms natural delay
    },
    [setMoves],
  );

  // Initialize or restart a match
  const startNewMatch = useCallback(
    (chosenColor: ColorChoice, chosenDifficulty: Difficulty) => {
      if (botThinkingTimeoutRef.current) {
        clearTimeout(botThinkingTimeoutRef.current);
      }

      const assignedColor: Color =
        chosenColor === 'random' ? (Math.random() < 0.5 ? 'w' : 'b') : chosenColor;

      chess.reset();
      setBoard(chess.board());
      setMoves([]);
      setMyColor(assignedColor);
      setStatus('playing');
      setEvalScore(0);
      setGameResultReason('');

      // If user plays as Black, Computer (White) makes the opening move!
      if (assignedColor === 'b') {
        triggerAIMove(chess, chosenDifficulty);
      } else {
        setThinking(false);
      }
    },
    [chess, setMoves, triggerAIMove],
  );

  // Start on initial load
  useEffect(() => {
    startNewMatch(selectedColor, difficulty);
    return () => {
      if (botThinkingTimeoutRef.current) {
        clearTimeout(botThinkingTimeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Called whenever user makes a move on ChessBoard
  const handleUserMove = useCallback(
    (moveResult: any) => {
      setBoard(chess.board());
      setEvalScore(evaluate(chess));

      if (chess.isGameOver()) {
        if (chess.isCheckmate()) {
          setStatus('checkmate');
          setGameResultReason(chess.turn() === 'w' ? 'Black won by checkmate!' : 'White won by checkmate!');
        } else {
          setStatus('draw');
          setGameResultReason('Game drawn.');
        }
        return;
      }

      // Computer's turn
      if (chess.turn() !== myColor) {
        triggerAIMove(chess, difficulty);
      }
    },
    [chess, myColor, difficulty, triggerAIMove],
  );

  const formattedEval = (evalScore / 100).toFixed(1);
  const evalColorClass =
    evalScore > 50
      ? 'text-emerald-400'
      : evalScore < -50
      ? 'text-rose-400'
      : 'text-slate-400';

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-semibold mb-2">
            <CpuIcon className="w-3.5 h-3.5 text-violet-400" />
            Minimax Alpha-Beta Engine
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Play Against Computer</h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => startNewMatch(selectedColor, difficulty)}
            disabled={thinking}
            className={`px-5 py-2.5 rounded-2xl bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white font-bold text-sm shadow-lg shadow-violet-950/40 transition-all flex items-center gap-2 ${
              thinking ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'
            }`}
          >
            <RotateCcwIcon className="w-4 h-4" />
            Restart Match
          </button>
        </div>
      </div>

      {/* Main Game Arena */}
      <div className="flex flex-col lg:flex-row items-center lg:items-start justify-center gap-8">
        {/* Left: The Board with Player Cards */}
        <div className="flex flex-col items-center gap-3 w-full max-w-[620px]">
          {/* Opponent: Bot Card */}
          <div className="w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-slate-900/80 border border-slate-800/90 shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-500/40 flex items-center justify-center text-violet-400">
                <BotIcon className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-sm">ChessFlow AI</span>
                  <span className="text-[10px] uppercase font-extrabold px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-300 border border-violet-500/30">
                    {difficulty.toUpperCase()}
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Playing as {myColor === 'w' ? 'Black (♚)' : 'White (♔)'}
                </p>
              </div>
            </div>

            {thinking ? (
              <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-violet-500/10 border border-violet-500/30 text-violet-300 text-xs font-semibold animate-pulse">
                <span className="w-2 h-2 rounded-full bg-violet-400 animate-ping" />
                Thinking...
              </div>
            ) : (
              <span className="text-xs text-slate-500 font-mono">Idle</span>
            )}
          </div>

          {/* Chessboard */}
          <div className="relative">
            <ChessBoard
              myColor={myColor}
              gameId="computer-local"
              started={status === 'playing'}
              chess={chess}
              board={board}
              setBoard={setBoard}
              onMove={handleUserMove}
              socket={socket}
            />
          </div>

          {/* User Card */}
          <div className="w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-slate-900/80 border border-slate-800/90 shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-600/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                <UserIcon className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-white text-sm">You</span>
                <p className="text-xs text-slate-400">
                  Playing as {myColor === 'w' ? 'White (♔)' : 'Black (♚)'}
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-400">Turn: </span>
              <span className={`text-xs font-bold ${chess.turn() === myColor ? 'text-emerald-400' : 'text-slate-500'}`}>
                {chess.turn() === myColor ? 'Your Turn' : 'Computer Turn'}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Controls & Engine Stats Panel */}
        <div className="w-full lg:w-80 flex flex-col space-y-5">
          {/* Status banner */}
          <div className="p-5 rounded-3xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Match Status</span>
              <span className="flex items-center gap-1.5 text-xs text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Active
              </span>
            </div>

            {status === 'playing' && (
              <div className="flex items-center gap-2.5 text-emerald-400 font-semibold text-sm">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                Match in Progress
              </div>
            )}
            {status === 'checkmate' && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 font-bold text-sm flex items-center gap-2">
                <TrophyIcon className="w-4 h-4 text-rose-400" />
                <div>
                  <div>Checkmate!</div>
                  <div className="text-xs font-normal opacity-80">{gameResultReason}</div>
                </div>
              </div>
            )}
            {status === 'draw' && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold text-sm">
                Game Over: Draw!
              </div>
            )}

            <div className="mt-4 pt-3 border-t border-slate-800/60 grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-slate-500">Moves: </span>
                <span className="font-mono text-white font-bold">{chess.history().length}</span>
              </div>
              <div>
                <span className="text-slate-500">Eval: </span>
                <span className={`font-mono font-bold ${evalColorClass}`}>
                  {evalScore > 0 ? `+${formattedEval}` : formattedEval}
                </span>
              </div>
              <div>
                <span className="text-slate-500">In Check: </span>
                <span className={`font-mono font-bold ${chess.inCheck() ? 'text-rose-400' : 'text-slate-400'}`}>
                  {chess.inCheck() ? 'YES' : 'NO'}
                </span>
              </div>
              <div>
                <span className="text-slate-500">Engine: </span>
                <span className="font-mono text-cyan-400 font-bold">Local AI</span>
              </div>
            </div>
          </div>

          {/* Difficulty Selector */}
          <div className="p-5 rounded-3xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl space-y-3 shadow-xl">
            <label className="text-xs uppercase tracking-wider text-slate-400 font-semibold block">
              Engine Difficulty
            </label>
            <div className="grid grid-cols-3 gap-2">
              {DIFFICULTIES.map((d) => (
                <button
                  key={d.value}
                  onClick={() => {
                    setDifficulty(d.value);
                    startNewMatch(selectedColor, d.value);
                  }}
                  disabled={thinking}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all text-center ${
                    difficulty === d.value
                      ? 'bg-violet-600 text-white shadow-md shadow-violet-950/50 border border-violet-400/50'
                      : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700/80 border border-slate-700/50'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-400">
              {DIFFICULTIES.find((d) => d.value === difficulty)?.desc}
            </p>
          </div>

          {/* Color Selector */}
          <div className="p-5 rounded-3xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl space-y-3 shadow-xl">
            <label className="text-xs uppercase tracking-wider text-slate-400 font-semibold block">
              Choose Side
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => {
                  setSelectedColor('w');
                  startNewMatch('w', difficulty);
                }}
                disabled={thinking}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  selectedColor === 'w'
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-950/50 font-black'
                    : 'bg-slate-800/80 text-slate-400 hover:text-white border border-slate-700/50'
                }`}
              >
                ♔ White
              </button>
              <button
                onClick={() => {
                  setSelectedColor('b');
                  startNewMatch('b', difficulty);
                }}
                disabled={thinking}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  selectedColor === 'b'
                    ? 'bg-violet-600 text-white shadow-md shadow-violet-950/50 font-black'
                    : 'bg-slate-800/80 text-slate-400 hover:text-white border border-slate-700/50'
                }`}
              >
                ♚ Black
              </button>
              <button
                onClick={() => {
                  setSelectedColor('random');
                  startNewMatch('random', difficulty);
                }}
                disabled={thinking}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  selectedColor === 'random'
                    ? 'bg-indigo-600 text-white shadow-md font-black'
                    : 'bg-slate-800/80 text-slate-400 hover:text-white border border-slate-700/50'
                }`}
              >
                🎲 Random
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
