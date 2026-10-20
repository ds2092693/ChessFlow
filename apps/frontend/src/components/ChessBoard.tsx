import { Chess, Color, PieceSymbol, Square } from 'chess.js';
import { MouseEvent, memo, useEffect, useState } from 'react';
import { MOVE } from '../screens/Game';
import LetterNotation from './chess-board/LetterNotation';
import LegalMoveIndicator from './chess-board/LegalMoveIndicator';
import ChessSquare from './chess-board/ChessSquare';
import NumberNotation from './chess-board/NumberNotation';
import { drawArrow } from '../utils/canvas';
import Confetti from 'react-confetti';
import MoveSound from '/move.wav';
import CaptureSound from '/capture.wav';

import { useRecoilState } from 'recoil';
import { useThemeContext } from '@/hooks/useThemes';

import {
  isBoardFlippedAtom,
  movesAtom,
  userSelectedMoveIndexAtom,
} from '@repo/store/src/atoms/chessBoard';

export function isPromoting(chess: Chess, from: Square, to: Square) {
  if (!from) return false;

  const piece = chess.get(from);
  if (piece?.type !== 'p') return false;
  if (piece.color !== chess.turn()) return false;
  if (!['1', '8'].some((it) => to.endsWith(it))) return false;

  return chess
    .moves({ square: from, verbose: true })
    .map((m) => m.to)
    .includes(to);
}

// ----------------------
// Theme-based square color
// ----------------------
function getBoardSquareClass(theme: string, isDark: boolean) {
  switch (theme) {
    case 'cyber':
      return isDark ? 'bg-[#585ce2]' : 'bg-[#e2e8ff]';
    case 'emerald':
    case 'default':
      return isDark ? 'bg-[#739552]' : 'bg-[#ebecd0]';
    case 'midnight':
      return isDark ? 'bg-[#2563eb]' : 'bg-[#e2e8f0]';
    case 'pink':
      return isDark ? 'bg-[#e11d48]' : 'bg-[#fff1f2]';
    case 'classic':
      return isDark ? 'bg-[#b58863]' : 'bg-[#f0d9b5]';
    default:
      return isDark ? 'bg-[#585ce2]' : 'bg-[#e2e8ff]';
  }
}

// A single cell from chess.js's board(): a piece, or null when the square is empty.
type BoardCell = { square: Square; type: PieceSymbol; color: Color } | null;

// Created once at module scope so a new Audio object isn't allocated every render.
const moveAudio = new Audio(MoveSound);
const captureAudio = new Audio(CaptureSound);

export const ChessBoard = memo(
  ({
    gameId,
    started,
    myColor,
    chess,
    board,
    socket,
    setBoard,
    onMove,
  }: {
    myColor: Color;
    gameId: string;
    started: boolean;
    chess: Chess;
    setBoard: React.Dispatch<
      React.SetStateAction<
        (
          | {
              square: Square;
              type: PieceSymbol;
              color: Color;
            }
          | null
        )[][]
      >
    >;
    board: (
      | {
          square: Square;
          type: PieceSymbol;
          color: Color;
        }
      | null
    )[][];
    socket?: WebSocket | null;
    onMove?: (moveResult: any) => void;
  }) => {
    const { theme } = useThemeContext();

    const [isFlipped, setIsFlipped] = useRecoilState(isBoardFlippedAtom);
    const [userSelectedMoveIndex, setUserSelectedMoveIndex] =
      useRecoilState(userSelectedMoveIndexAtom);
    const [moves, setMoves] = useRecoilState(movesAtom);
    const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);
    const [rightClickedSquares, setRightClickedSquares] = useState<string[]>([]);
    const [arrowStart, setArrowStart] = useState<string | null>(null);

    const [from, setFrom] = useState<null | Square>(null);
    const isMyTurn = myColor === chess.turn();
    const [legalMoves, setLegalMoves] = useState<string[]>([]);

    const labels = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
    const [boxSize, setBoxSize] = useState(() => {
      if (typeof window !== 'undefined') {
        if (window.innerWidth < 450) return 40;
        if (window.innerWidth < 640) return 50;
        if (window.innerWidth < 1024) return 66;
      }
      return 76;
    });

    useEffect(() => {
      const handleResize = () => {
        if (window.innerWidth < 450) setBoxSize(40);
        else if (window.innerWidth < 640) setBoxSize(50);
        else if (window.innerWidth < 1024) setBoxSize(66);
        else setBoxSize(76);
      };
      handleResize();
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, []);

    const [gameOver, setGameOver] = useState(false);

    const handleMouseDown = (e: MouseEvent<HTMLDivElement>, squareRep: string) => {
      e.preventDefault();
      if (e.button === 2) {
        setArrowStart(squareRep);
      }
    };

    useEffect(() => {
      setIsFlipped(myColor === 'b');
    }, [myColor, setIsFlipped]);

    const clearCanvas = () => {
      setRightClickedSquares([]);
      if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx?.clearRect(0, 0, canvas.width, canvas.height);
      }
    };

    const handleRightClick = (squareRep: string) => {
      if (rightClickedSquares.includes(squareRep)) {
        setRightClickedSquares((prev) => prev.filter((sq) => sq !== squareRep));
      } else {
        setRightClickedSquares((prev) => [...prev, squareRep]);
      }
    };

    const handleDrawArrow = (squareRep: string) => {
      if (arrowStart) {
        const stoppedAtSquare = squareRep;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            drawArrow({
              ctx,
              start: arrowStart,
              end: stoppedAtSquare,
              isFlipped,
              squareSize: boxSize,
            });
          }
        }
        setArrowStart(null);
      }
    };

    const handleMouseUp = (e: MouseEvent<HTMLDivElement>, squareRep: string) => {
      e.preventDefault();
      if (!started) return;

      if (e.button === 2) {
        if (arrowStart === squareRep) {
          handleRightClick(squareRep);
        } else {
          handleDrawArrow(squareRep);
        }
      } else {
        clearCanvas();
      }
    };

    useEffect(() => {
      clearCanvas();
      const lMove = moves.at(-1);
      if (lMove) {
        setLastMove({
          from: lMove.from,
          to: lMove.to,
        });
      } else {
        setLastMove(null);
      }
    }, [moves]);

    useEffect(() => {
      if (userSelectedMoveIndex !== null) {
        const move = moves[userSelectedMoveIndex];
        if (move) {
          setLastMove({
            from: move.from,
            to: move.to,
          });
          chess.load(move.after);
          setBoard(chess.board());
        }
        return;
      }
    }, [userSelectedMoveIndex]);

    useEffect(() => {
      if (userSelectedMoveIndex !== null) {
        chess.reset();
        moves.forEach((move) => {
          chess.move({ from: move.from, to: move.to });
        });
        setBoard(chess.board());
        setUserSelectedMoveIndex(null);
      } else {
        setBoard(chess.board());
      }
    }, [moves]);

    // Handles a click on a board square
    const handleSquareClick = (squareRep: Square, piece: BoardCell) => {
      if (!started) return;

      if (userSelectedMoveIndex !== null) {
        chess.reset();
        moves.forEach((m) => chess.move({ from: m.from, to: m.to }));
        setBoard(chess.board());
        setUserSelectedMoveIndex(null);
        return;
      }

      if (!isMyTurn) return;

      if (!from) {
        if (piece && piece.color === chess.turn()) {
          setFrom(squareRep);
          setLegalMoves(
            chess.moves({ verbose: true, square: squareRep }).map((m) => m.to),
          );
        }
        return;
      }

      if (from === squareRep) {
        setFrom(null);
        setLegalMoves([]);
        return;
      }

      if (piece && piece.color === chess.turn()) {
        setFrom(squareRep);
        setLegalMoves(
          chess.moves({ verbose: true, square: squareRep }).map((m) => m.to),
        );
        return;
      }

      try {
        const moveResult = isPromoting(chess, from, squareRep)
          ? chess.move({ from, to: squareRep, promotion: 'q' })
          : chess.move({ from, to: squareRep });

        if (moveResult) {
          moveAudio.play().catch(() => {});
          if (moveResult.captured) captureAudio.play().catch(() => {});
          setMoves((prev) => [...prev, moveResult]);
          setFrom(null);
          setLegalMoves([]);
          if (moveResult.san.includes('#')) setGameOver(true);
          if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(
              JSON.stringify({
                type: MOVE,
                payload: { gameId, move: moveResult },
              }),
            );
          }
          if (onMove) {
            onMove(moveResult);
          }
        }
      } catch (e) {
        console.log('Invalid move', e);
      }
    };

    return (
      <>
        {gameOver && <Confetti />}
        <div className="flex relative justify-center items-center p-2 sm:p-3 rounded-2xl bg-slate-950/80 border border-slate-800 shadow-2xl shadow-indigo-950/40 backdrop-blur-md">
          <div className="text-white-200 rounded-xl overflow-hidden border border-slate-700/60 shadow-inner select-none">
            {(isFlipped ? board.slice().reverse() : board).map((row, i) => {
              i = isFlipped ? i + 1 : 8 - i;
              return (
                <div key={i} className="flex relative">
                  <NumberNotation
                    isMainBoxColor={isFlipped ? i % 2 !== 0 : i % 2 === 0}
                    label={i.toString()}
                  />
                  {(isFlipped ? row.slice().reverse() : row).map((square, j) => {
                    j = isFlipped ? 7 - (j % 8) : j % 8;

                    const isMainBoxColor = (i + j) % 2 !== 0;
                    const squareRepresentation = (String.fromCharCode(97 + j) +
                      '' +
                      i) as Square;
                    const isHighlightedSquare =
                      from === squareRepresentation ||
                      squareRepresentation === lastMove?.from ||
                      squareRepresentation === lastMove?.to;
                    const isRightClickedSquare =
                      rightClickedSquares.includes(squareRepresentation);

                    const piece = square && square.type;
                    const isKingInCheckSquare =
                      piece === 'k' &&
                      square?.color === chess.turn() &&
                      chess.inCheck();

                    return (
                      <div
                        onClick={() => handleSquareClick(squareRepresentation, square)}
                        style={{
                          width: boxSize,
                          height: boxSize,
                        }}
                        key={j}
                        className={`relative cursor-pointer transition-colors ${
                          isRightClickedSquare
                            ? 'bg-rose-500/80'
                            : isKingInCheckSquare
                            ? 'bg-rose-600/95 shadow-[inset_0_0_14px_rgba(239,68,68,0.9)] animate-pulse'
                            : isHighlightedSquare
                            ? isMainBoxColor
                              ? 'bg-amber-400/75 shadow-[inset_0_0_8px_rgba(245,158,11,0.5)]'
                              : 'bg-amber-200/85 shadow-[inset_0_0_8px_rgba(245,158,11,0.5)]'
                            : getBoardSquareClass(theme, isMainBoxColor)
                        }`}
                        onContextMenu={(e) => {
                          e.preventDefault();
                        }}
                        onMouseDown={(e) => {
                          handleMouseDown(e, squareRepresentation);
                        }}
                        onMouseUp={(e) => {
                          handleMouseUp(e, squareRepresentation);
                        }}
                      >
                        <div className="w-full justify-center flex h-full relative">
                          {square && <ChessSquare square={square} />}
                          {isFlipped
                            ? i === 8 && (
                                <LetterNotation
                                  label={labels[j]}
                                  isMainBoxColor={j % 2 === 0}
                                />
                              )
                            : i === 1 && (
                                <LetterNotation
                                  label={labels[j]}
                                  isMainBoxColor={j % 2 !== 0}
                                />
                              )}
                          {!!from && legalMoves.includes(squareRepresentation) && (
                            <LegalMoveIndicator
                              isMainBoxColor={isMainBoxColor}
                              isPiece={!!square?.type}
                            />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>

          <canvas
            ref={(ref) => setCanvas(ref)}
            width={boxSize * 8}
            height={boxSize * 8}
            style={{
              position: 'absolute',
              top: '8px',
              left: '8px',
              pointerEvents: 'none',
            }}
            onContextMenu={(e) => e.preventDefault()}
            onMouseDown={(e) => {
              e.preventDefault();
            }}
            onMouseUp={(e) => e.preventDefault()}
          />
        </div>
      </>
    );
  },
);
