import {
  isBoardFlippedAtom,
  movesAtom,
  userSelectedMoveIndexAtom,
} from '@repo/store/src/atoms/chessBoard';
import { Move } from 'chess.js';
import { useEffect, useRef } from 'react';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import {
  HandshakeIcon,
  FlagIcon,
  ChevronFirst,
  ChevronLast,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';

const MovesTable = ({ 
  onDrawRequest, 
  onResign 
}: { 
  onDrawRequest?: () => void;
  onResign?: () => void;
}) => {
  const [userSelectedMoveIndex, setUserSelectedMoveIndex] = useRecoilState(
    userSelectedMoveIndexAtom,
  );
  const setIsFlipped = useSetRecoilState(isBoardFlippedAtom);
  const moves = useRecoilValue(movesAtom);
  const movesTableRef = useRef<HTMLDivElement>(null);
  
  const movesArray = moves.reduce((result, _, index: number, array: Move[]) => {
    if (index % 2 === 0) {
      result.push(array.slice(index, index + 2));
    }
    return result;
  }, [] as Move[][]);

  useEffect(() => {
    if (movesTableRef && movesTableRef.current) {
      movesTableRef.current.scrollTo({
        top: movesTableRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [moves]);

  return (
    <div className="flex flex-col h-full justify-between text-slate-300 w-full select-none">
      {/* Scrollable Notation List */}
      <div
        className="text-xs h-48 overflow-y-auto pr-1 space-y-0.5 font-mono"
        ref={movesTableRef}
      >
        {movesArray.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-500 italic">
            Waiting for opening moves...
          </div>
        ) : (
          movesArray.map((movePairs, index) => {
            return (
              <div
                key={index}
                className={`flex items-center px-2 py-1 rounded-lg ${
                  index % 2 !== 0 ? 'bg-slate-800/40' : 'bg-transparent'
                }`}
              >
                <span className="w-8 text-slate-500 font-semibold">{`${index + 1}.`}</span>

                <div className="flex-1 grid grid-cols-2 gap-2">
                  {movePairs.map((move, movePairIndex) => {
                    const isLastIndex =
                      movePairIndex === movePairs.length - 1 &&
                      movesArray.length - 1 === index;
                    const isHighlighted =
                      userSelectedMoveIndex !== null
                        ? userSelectedMoveIndex === index * 2 + movePairIndex
                        : isLastIndex;
                    const { san } = move;

                    return (
                      <div
                        key={movePairIndex}
                        className={`cursor-pointer px-2 py-0.5 rounded transition-all flex items-center ${
                          isHighlighted
                            ? 'bg-cyan-500/25 text-cyan-300 font-bold border-b-2 border-cyan-400'
                            : 'hover:bg-slate-700/50 text-slate-300'
                        }`}
                        onClick={() => {
                          setUserSelectedMoveIndex(index * 2 + movePairIndex);
                        }}
                      >
                        <span>{san}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Control Buttons */}
      {moves.length > 0 && (
        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5">
            <button
              onClick={onDrawRequest}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800/70 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white transition-colors text-[11px] font-semibold"
            >
              <HandshakeIcon className="w-3.5 h-3.5 text-amber-400" />
              <span>Offer Draw</span>
            </button>
            <button
              onClick={onResign}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 hover:text-rose-200 transition-colors text-[11px] font-semibold"
            >
              <FlagIcon className="w-3.5 h-3.5 text-rose-400" />
              <span>Resign</span>
            </button>
          </div>

          <div className="flex items-center gap-1 text-slate-400">
            <button
              onClick={() => setUserSelectedMoveIndex(0)}
              disabled={userSelectedMoveIndex === 0}
              className="p-1 hover:text-white disabled:opacity-30"
              title="First move"
            >
              <ChevronFirst className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                setUserSelectedMoveIndex((prev) => {
                  if (prev === null) return moves.length > 1 ? moves.length - 2 : 0;
                  return Math.max(0, prev - 1);
                });
              }}
              disabled={userSelectedMoveIndex === 0 || moves.length === 0}
              className="p-1 hover:text-white disabled:opacity-30"
              title="Previous move"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setUserSelectedMoveIndex((prev) =>
                  prev !== null
                    ? prev + 1 >= moves.length - 1
                      ? moves.length - 1
                      : prev + 1
                    : null,
                );
              }}
              disabled={userSelectedMoveIndex === null}
              className="p-1 hover:text-white disabled:opacity-30"
              title="Next move"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setUserSelectedMoveIndex(moves.length - 1)}
              disabled={userSelectedMoveIndex === null}
              className="p-1 hover:text-white disabled:opacity-30"
              title="Last move"
            >
              <ChevronLast className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsFlipped((prev) => !prev)}
              className="p-1 hover:text-cyan-400 transition-colors"
              title="Flip board orientation"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MovesTable;
