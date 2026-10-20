/* eslint-disable no-case-declarations */
import { useEffect, useRef, useState } from 'react';
import { Chess, Move } from 'chess.js';
import { useNavigate, useParams } from 'react-router-dom';
import { useRecoilValue, useSetRecoilState } from 'recoil';

import MoveSound from '/move.wav';
import { ChessBoard, isPromoting } from '../components/ChessBoard';
import { useSocket } from '../hooks/useSocket';
import MovesTable from '../components/MovesTable';
import { useUser } from '@repo/store/src/hooks/useUser';
import { UserAvatar } from '../components/UserAvatar';
import ErrorBoundary from '../components/ErrorBoundary';
import DrawRequestModal from '../components/DrawRequestModal';
import { movesAtom, userSelectedMoveIndexAtom } from '@repo/store/src/atoms/chessBoard';
import GameEndModal from '@/components/GameEndModal';
import { Waitopponent } from '@/components/ui/waitopponent';
import { ShareGame } from '../components/ShareGame';
import { ZapIcon, SendIcon, MessageSquareIcon, ClockIcon } from 'lucide-react';

export const INIT_GAME = 'init_game';
export const MOVE = 'move';
export const JOIN_ROOM = 'join_room';
export const GAME_JOINED = 'game_joined';
export const GAME_ADDED = 'game_added';
export const GAME_ENDED = 'game_ended';

export const RESIGN_GAME = 'resign_game';
export const DRAW_REQUEST = 'draw_request';
export const DRAW_RESPONSE = 'draw_response';
export const DRAW_REQUEST_RECEIVED = 'draw_request_received';

export const CHAT_MESSAGE = 'chat:message';
export const CHAT_SEND = 'chat:send';

export enum Result {
  WHITE_WINS = 'WHITE_WINS',
  BLACK_WINS = 'BLACK_WINS',
  DRAW = 'DRAW',
}

export interface GameResult {
  result: Result;
  by: string;
}

export interface Player {
  id: string;
  name: string;
  isGuest: boolean;
}

export interface Metadata {
  blackPlayer: Player;
  whitePlayer: Player;
}

const GAME_TIME_MS = 10 * 60 * 1000;
const moveAudio = new Audio(MoveSound);

type ChatMsg = { fromUserId: string; text: string; ts: number; gameId?: string };

export const Game = () => {
  const socket = useSocket();
  const { gameId } = useParams();
  const user = useUser();

  const navigate = useNavigate();
  const [chess] = useState(() => new Chess());
  const [board, setBoard] = useState(chess.board());
  const [added, setAdded] = useState(false);
  const [started, setStarted] = useState(false);
  const [gameMetadata, setGameMetadata] = useState<Metadata | null>(null);
  const [result, setResult] = useState<GameResult | null>(null);
  const [player1TimeConsumed, setPlayer1TimeConsumed] = useState(0);
  const [player2TimeConsumed, setPlayer2TimeConsumed] = useState(0);
  const [gameID, setGameID] = useState('');
  const setMoves = useSetRecoilState(movesAtom);
  const userSelectedMoveIndex = useRecoilValue(userSelectedMoveIndexAtom);
  const userSelectedMoveIndexRef = useRef(userSelectedMoveIndex);

  const [showDrawRequest, setShowDrawRequest] = useState(false);
  const [drawRequester, setDrawRequester] = useState<string | null>(null);

  const [chatMessages, setChatMessages] = useState<ChatMsg[]>([]);
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const joinedRef = useRef<string | null>(null);

  useEffect(() => {
    userSelectedMoveIndexRef.current = userSelectedMoveIndex;
  }, [userSelectedMoveIndex]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  useEffect(() => {
    if (!socket) return;

    socket.onmessage = function (event) {
      const message = JSON.parse(event.data);
      switch (message.type) {
        case GAME_ADDED:
          setAdded(true);
          setGameID(message.gameId);
          break;

        case INIT_GAME:
          setBoard(chess.board());
          setStarted(true);
          navigate(`/game/${message.payload.gameId}`);
          setGameMetadata({
            blackPlayer: message.payload.blackPlayer,
            whitePlayer: message.payload.whitePlayer,
          });
          break;

        case MOVE:
          const { move, player1TimeConsumed, player2TimeConsumed } = message.payload;
          setPlayer1TimeConsumed(player1TimeConsumed);
          setPlayer2TimeConsumed(player2TimeConsumed);
          if (userSelectedMoveIndexRef.current !== null) {
            setMoves((moves) => [...moves, move]);
            return;
          }
          try {
            if (isPromoting(chess, move.from, move.to)) {
              chess.move({
                from: move.from,
                to: move.to,
                promotion: 'q',
              });
            } else {
              chess.move({ from: move.from, to: move.to });
            }
            setMoves((moves) => [...moves, move]);
            moveAudio.play().catch(() => {});
          } catch (error) {
            console.log('Error', error);
          }
          break;

        case GAME_ENDED:
          setResult({
            result: message.payload.result,
            by: message.payload.reason ?? 'Game Over',
          });
          chess.reset();
          setStarted(false);
          setAdded(false);
          break;

        case GAME_JOINED:
          setGameMetadata({
            blackPlayer: message.payload.blackPlayer,
            whitePlayer: message.payload.whitePlayer,
          });
          setPlayer1TimeConsumed(message.payload.player1TimeConsumed);
          setPlayer2TimeConsumed(message.payload.player2TimeConsumed);
          setStarted(true);
          message.payload.moves.map((x: Move) => {
            if (isPromoting(chess, x.from, x.to)) {
              chess.move({ ...x, promotion: 'q' });
            } else {
              chess.move(x);
            }
          });
          setMoves(message.payload.moves);
          break;

        case CHAT_MESSAGE:
          if (!message.payload || !gameId || message.payload.gameId !== gameId) break;

          const newMessage: ChatMsg = {
            fromUserId: message.payload.fromUserId,
            text: String(message.payload.text || ''),
            ts: Number(message.payload.ts || Date.now()),
            gameId: message.payload.gameId,
          };

          setChatMessages((prev) => {
            const isDuplicate = prev.some(
              (m) =>
                m.ts === newMessage.ts &&
                m.text === newMessage.text &&
                m.fromUserId === newMessage.fromUserId,
            );
            return isDuplicate ? prev : [...prev, newMessage];
          });
          break;

        case DRAW_REQUEST_RECEIVED:
          setShowDrawRequest(true);
          setDrawRequester(message.payload.fromUserId);
          break;

        case DRAW_RESPONSE:
          if (message.payload.accepted) {
            setResult({ result: Result.DRAW, by: 'Mutual Agreement' });
          } else {
            alert('Draw request rejected');
          }
          break;

        default:
          if (message?.payload?.message) {
            alert(message.payload.message);
          }
          break;
      }
    };

    if (gameId !== 'random' && joinedRef.current !== gameId) {
      socket.send(
        JSON.stringify({
          type: JOIN_ROOM,
          payload: { gameId },
        }),
      );
      joinedRef.current = gameId || null;
    }

    return () => {
      if (socket) socket.onmessage = null;
    };
  }, [socket, gameId, navigate, setMoves, chess]);

  useEffect(() => {
    if (started) {
      const interval = setInterval(() => {
        if (chess.turn() === 'w') {
          setPlayer1TimeConsumed((p) => p + 100);
        } else {
          setPlayer2TimeConsumed((p) => p + 100);
        }
      }, 100);
      return () => clearInterval(interval);
    }
  }, [started, gameMetadata, user, chess]);

  const getTimer = (timeConsumed: number) => {
    const timeLeftMs = Math.max(0, GAME_TIME_MS - timeConsumed);
    const minutes = Math.floor(timeLeftMs / (1000 * 60));
    const remainingSeconds = Math.floor((timeLeftMs % (1000 * 60)) / 1000);
    const isCritical = timeLeftMs < 60000;

    return (
      <div className={`font-mono text-sm sm:text-base font-bold px-3 py-1.5 rounded-xl border flex items-center gap-1.5 ${
        isCritical
          ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
          : 'bg-slate-900/90 text-slate-200 border-slate-800'
      }`}>
        <ClockIcon className="w-3.5 h-3.5 text-slate-400" />
        <span>
          {minutes < 10 ? '0' : ''}{minutes}:{remainingSeconds < 10 ? '0' : ''}{remainingSeconds}
        </span>
      </div>
    );
  };

  const handleResign = () => {
    socket?.send(
      JSON.stringify({
        type: RESIGN_GAME,
        payload: { gameId },
      }),
    );
    setMoves([]);
    navigate('/');
  };

  const handleDrawRequest = () => {
    socket?.send(
      JSON.stringify({
        type: DRAW_REQUEST,
        payload: { gameId },
      }),
    );
  };

  const handleDrawAccept = () => {
    socket?.send(
      JSON.stringify({
        type: DRAW_RESPONSE,
        payload: { gameId, accepted: true },
      }),
    );
    setShowDrawRequest(false);
  };

  const handleDrawReject = () => {
    socket?.send(
      JSON.stringify({
        type: DRAW_RESPONSE,
        payload: { gameId, accepted: false },
      }),
    );
    setShowDrawRequest(false);
  };

  function sendChat() {
    const text = chatInput.trim();
    if (!text || !socket || !gameId) return;
    socket.send(
      JSON.stringify({
        type: CHAT_SEND,
        payload: { gameId, text },
      }),
    );
    setChatInput('');
  }

  function onChatKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') sendChat();
  }

  const [connTimeout, setConnTimeout] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!socket) setConnTimeout(true);
    }, 2500);
    return () => clearTimeout(timer);
  }, [socket]);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[420px] text-center p-6 space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-3xl">
          ♔
        </div>
        <h2 className="text-2xl font-black text-white">Sign In Required</h2>
        <p className="text-sm text-slate-400 max-w-sm">
          Please sign in to join online multiplayer matchmaking and track your Elo rating.
        </p>
        <button
          onClick={() => navigate("/login")}
          className="px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white font-bold text-sm shadow-lg shadow-cyan-500/20 transition-all hover:scale-105"
        >
          Go to Sign In
        </button>
      </div>
    );
  }

  if (!socket) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[420px] text-center p-6 space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center">
          {connTimeout ? (
            <span className="text-3xl text-amber-400">⚡</span>
          ) : (
            <div className="w-8 h-8 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
          )}
        </div>
        <div>
          <h2 className="text-2xl font-black text-white">
            {connTimeout ? "Multiplayer Gateway Standby" : "Connecting to Multiplayer Gateway"}
          </h2>
          <p className="text-sm text-slate-400 max-w-md mt-1.5 mx-auto">
            {connTimeout
              ? "The WebSocket server (ws://localhost:8080) is not active. You can play right now against the built-in Minimax AI engine with zero latency!"
              : "Establishing encrypted WebSocket handshake with matchmaking pool..."}
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => navigate("/game/computer")}
            className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white font-bold text-sm shadow-xl shadow-cyan-500/25 transition-all hover:scale-105"
          >
            Play Against Minimax AI
          </button>
          <button
            onClick={() => window.location.reload()}
            className="px-5 py-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-300 font-semibold text-sm transition-all"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  const isUserTurn = (user.id === gameMetadata?.blackPlayer?.id ? 'b' : 'w') === chess.turn();

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {result && (
        <GameEndModal
          blackPlayer={gameMetadata?.blackPlayer}
          whitePlayer={gameMetadata?.whitePlayer}
          gameResult={result}
        />
      )}

      {/* Turn alert badge */}
      {started && (
        <div className="flex items-center justify-center">
          <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold shadow-md ${
            isUserTurn
              ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
              : 'bg-slate-900 border border-slate-800 text-slate-400'
          }`}>
            <span className={`w-2 h-2 rounded-full ${isUserTurn ? 'bg-emerald-400 animate-ping' : 'bg-slate-600'}`} />
            {isUserTurn ? 'Your Turn to Move' : "Opponent's Turn"}
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row items-center lg:items-start justify-center gap-8">
        {/* Board & Player Area */}
        <div className="flex flex-col items-center gap-3 w-full max-w-[620px]">
          {/* Opponent Card */}
          {started && (
            <div className="w-full flex items-center justify-between px-4 py-2.5 rounded-2xl bg-slate-900/80 border border-slate-800/90 shadow-md">
              <UserAvatar gameMetadata={gameMetadata} />
              {getTimer(
                user.id === gameMetadata?.whitePlayer?.id
                  ? player2TimeConsumed
                  : player1TimeConsumed,
              )}
            </div>
          )}

          {/* Chessboard */}
          <div className="relative">
            <ChessBoard
              started={started}
              gameId={gameId ?? ''}
              myColor={user.id === gameMetadata?.blackPlayer?.id ? 'b' : 'w'}
              chess={chess}
              setBoard={setBoard}
              socket={socket}
              board={board}
            />
          </div>

          {/* User Self Card */}
          {started && (
            <div className="w-full flex items-center justify-between px-4 py-2.5 rounded-2xl bg-slate-900/80 border border-slate-800/90 shadow-md">
              <UserAvatar gameMetadata={gameMetadata} self />
              {getTimer(
                user.id === gameMetadata?.blackPlayer?.id
                  ? player2TimeConsumed
                  : player1TimeConsumed,
              )}
            </div>
          )}
        </div>

        {/* Control / Matchmaking / Moves Panel */}
        <div className="w-full lg:w-96 flex flex-col space-y-4">
          {!started ? (
            <div className="p-8 rounded-3xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl text-center space-y-6 shadow-2xl">
              {added ? (
                <div className="space-y-6 py-4">
                  <Waitopponent />
                  <ShareGame gameId={gameID} />
                </div>
              ) : (
                gameId === 'random' && (
                  <div className="space-y-6 py-4">
                    <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-tr from-cyan-500 to-violet-600 flex items-center justify-center shadow-xl shadow-cyan-500/20 text-3xl">
                      ⚡
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-white tracking-tight">Ready to Play?</h2>
                      <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                        Join the matchmaking pool to pair with an active player within your rating band.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        socket.send(JSON.stringify({ type: INIT_GAME }));
                      }}
                      className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white font-extrabold text-base shadow-xl shadow-cyan-500/25 transition-all hover:scale-105 flex items-center justify-center gap-2"
                    >
                      <ZapIcon className="w-5 h-5 fill-white" />
                      Find Match Now
                    </button>
                  </div>
                )
              )}
            </div>
          ) : (
            <div className="flex flex-col space-y-4">
              {/* Moves Notation Panel */}
              <div className="p-4 rounded-3xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl h-72 flex flex-col shadow-xl">
                <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-800/80">
                  <span className="text-xs uppercase tracking-wider text-slate-400 font-bold">Move History</span>
                  <span className="text-xs font-mono text-cyan-400">{chess.history().length} moves</span>
                </div>
                <div className="flex-1 overflow-y-auto pr-1">
                  <ErrorBoundary>
                    <MovesTable 
                      onDrawRequest={handleDrawRequest}
                      onResign={handleResign}
                    />
                  </ErrorBoundary>
                </div>
              </div>

              {/* In-Game Live Chat */}
              <div className="p-4 rounded-3xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl h-72 flex flex-col shadow-xl">
                <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-800/80 text-xs uppercase tracking-wider text-slate-400 font-bold">
                  <MessageSquareIcon className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Room Chat</span>
                </div>

                <div className="flex-1 overflow-y-auto space-y-2 pr-1 text-xs">
                  {chatMessages.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-slate-500 text-xs">
                      No messages yet. Say hello!
                    </div>
                  ) : (
                    chatMessages.map((m, idx) => {
                      const mine = m.fromUserId === user.id;
                      return (
                        <div key={`${m.ts}-${m.fromUserId}-${idx}`} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                          <div
                            className={`max-w-[85%] px-3 py-2 rounded-2xl shadow-sm ${
                              mine 
                                ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white rounded-br-none' 
                                : 'bg-slate-800/80 text-slate-200 border border-slate-700/60 rounded-bl-none'
                            }`}
                          >
                            <div className="text-[10px] opacity-75 font-semibold mb-0.5">
                              {mine ? 'You' : 'Opponent'}
                            </div>
                            <div className="whitespace-pre-wrap break-words">{m.text}</div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={chatEndRef} />
                </div>

                <div className="flex gap-2 mt-3 pt-2 border-t border-slate-800/60">
                  <input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={onChatKeyDown}
                    placeholder="Send a message..."
                    className="flex-1 px-3.5 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-white placeholder-slate-500 text-xs focus:border-cyan-400 focus:outline-none"
                  />
                  <button
                    onClick={sendChat}
                    className="p-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors"
                  >
                    <SendIcon className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <DrawRequestModal
        isOpen={showDrawRequest}
        onAccept={handleDrawAccept}
        onReject={handleDrawReject}
        opponentName={
          drawRequester === gameMetadata?.whitePlayer?.id
            ? gameMetadata?.whitePlayer?.name
            : gameMetadata?.blackPlayer?.name
        }
      />
    </div>
  );
};
