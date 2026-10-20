import { useEffect, useMemo, useRef, useState } from 'react';
import { Chess, Square } from 'chess.js';
import { useRecoilState } from 'recoil';
import { BotIcon, UserIcon, RotateCcwIcon, SparklesIcon, CpuIcon } from 'lucide-react';

import { ChessBoard, isPromoting } from '@/components/ChessBoard';
import { useSocket } from '@/hooks/useSocket';
import { movesAtom } from '@repo/store/src/atoms/chessBoard';

type Color = 'w' | 'b';
type ColorChoice = Color | 'random';
type Difficulty = 'easy' | 'medium' | 'hard';
type Status = 'idle' | 'playing' | 'checkmate' | 'draw';

const INIT_COMPUTER_GAME = 'init_computer_game';
const COMPUTER_GAME_STARTED = 'computer_game_started';
const COMPUTER_MOVE = 'computer_move';
const COMPUTER_GAME_ENDED = 'computer_game_ended';

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
  const [status, setStatus] = useState<Status>('idle');
  const [thinking, setThinking] = useState(false);
  const [gameId, setGameId] = useState<string | null>(null);

  const gameIdRef = useRef<string | null>(null);
  useEffect(() => {
    gameIdRef.current = gameId;
  }, [gameId]);

  const requestNewGame = (colorChoice: ColorChoice, level: Difficulty) => {
    if (!socket || socket.readyState !== WebSocket.OPEN) return;
    socket.send(
      JSON.stringify({
        type: INIT_COMPUTER_GAME,
        payload: { color: colorChoice, difficulty: level },
      }),
    );
  };

  useEffect(() => {
    if (!socket) return;

    const onMessage = (event: MessageEvent) => {
      let msg: { type?: string; payload?: any };
      try {
        msg = JSON.parse(event.data);
      } catch {
        return;
      }

      if (msg.type === COMPUTER_GAME_STARTED) {
        const { gameId: newGameId, playerColor } = msg.payload ?? {};
        chess.reset();
        setBoard(chess.board());
        setMoves([]);
        setGameId(newGameId);
        setMyColor(playerColor === 'b' ? 'b' : 'w');
        setStatus('playing');
        setThinking(playerColor === 'b');
        return;
      }

      if (msg.type === COMPUTER_MOVE) {
        const move = msg.payload?.move;
        if (!move?.from || !move?.to) return;
        try {
          if (isPromoting(chess, move.from as Square, move.to as Square)) {
            chess.move({ from: move.from, to: move.to, promotion: move.promotion ?? 'q' });
          } else {
            chess.move({ from: move.from, to: move.to });
          }
          setBoard(chess.board());
          setMoves((prev) => [...prev, chess.history({ verbose: true }).slice(-1)[0]]);
        } catch (err) {
          console.error('Failed to apply computer move:', err);
        }
        setThinking(false);

        if (chess.isGameOver()) {
          setStatus(chess.isCheckmate() ? 'checkmate' : 'draw');
        }
        return;
      }

      if (msg.type === COMPUTER_GAME_ENDED) {
        setThinking(false);
        const result = msg.payload?.result;
        setStatus(result === 'DRAW' ? 'draw' : 'checkmate');
        return;
      }
    };

    socket.addEventListener('message', onMessage);
    return () => socket.removeEventListener('message', onMessage);
  }, [socket, chess, setMoves]);

  useEffect(() => {
    if (!socket || socket.readyState !== WebSocket.OPEN) return;
    if (status !== 'idle') return;
    requestNewGame(selectedColor, difficulty);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket?.readyState]);

  const handleNewGame = () => {
    setStatus('idle');
    requestNewGame(selectedColor, difficulty);
  };

  const wrappedSocket = useMemo(() => {
    if (!socket) return null;
    return new Proxy(socket, {
      get(target, prop) {
        if (prop === 'send') {
          return (data: string) => {
            try {
              const parsed = JSON.parse(data);
              if (parsed?.type === 'move' && gameIdRef.current) {
                setThinking(true);
              }
            } catch {
              /* not JSON */
            }
            target.send(data);
          };
        }
        const value = Reflect.get(target, prop);
        return typeof value === 'function' ? value.bind(target) : value;
      },
    });
  }, [socket]);

  const ready = !!socket && socket.readyState === WebSocket.OPEN && wrappedSocket;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-semibold mb-2">
            <CpuIcon className="w-3.5 h-3.5 text-violet-400" />
            Minimax AI Engine
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Play Against Computer</h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleNewGame}
            disabled={thinking || !ready}
            className={`px-5 py-2.5 rounded-2xl bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white font-bold text-sm shadow-lg shadow-violet-950/40 transition-all flex items-center gap-2 ${
              thinking || !ready ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
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
                  <span className="font-bold text-white text-sm">Minimax Engine</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
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
              gameId={gameId ?? 'computer-pending'}
              started={status === 'playing'}
              chess={chess}
              board={board}
              setBoard={setBoard}
              socket={(wrappedSocket ?? socket) as WebSocket}
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
          <div className="p-5 rounded-3xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Match Status</span>
              {!ready && <span className="text-xs text-amber-400 animate-pulse">Connecting...</span>}
            </div>

            {status === 'playing' && (
              <div className="flex items-center gap-2.5 text-emerald-400 font-semibold text-sm">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                Match in Progress
              </div>
            )}
            {status === 'checkmate' && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 font-bold text-sm">
                Game Over: Checkmate!
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
                <span className="text-slate-500">In Check: </span>
                <span className={`font-mono font-bold ${chess.inCheck() ? 'text-rose-400' : 'text-slate-400'}`}>
                  {chess.inCheck() ? 'YES' : 'NO'}
                </span>
              </div>
            </div>
          </div>

          {/* Difficulty Selector */}
          <div className="p-5 rounded-3xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl space-y-3">
            <label className="text-xs uppercase tracking-wider text-slate-400 font-semibold block">
              Engine Difficulty
            </label>
            <div className="grid grid-cols-3 gap-2">
              {DIFFICULTIES.map((d) => (
                <button
                  key={d.value}
                  onClick={() => {
                    setDifficulty(d.value);
                    requestNewGame(selectedColor, d.value);
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
          <div className="p-5 rounded-3xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl space-y-3">
            <label className="text-xs uppercase tracking-wider text-slate-400 font-semibold block">
              Choose Side
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => {
                  setSelectedColor('w');
                  requestNewGame('w', difficulty);
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
                  requestNewGame('b', difficulty);
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
                  requestNewGame('random', difficulty);
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
