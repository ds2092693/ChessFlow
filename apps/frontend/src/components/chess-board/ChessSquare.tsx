import { Color, PieceSymbol, Square } from 'chess.js';

const ChessSquare = ({
  square,
}: {
  square: {
    square: Square;
    type: PieceSymbol;
    color: Color;
  };
}) => {
  return (
    <div className="h-full w-full justify-center items-center flex select-none">
      {square ? (
        <img
          className="w-[85%] h-[85%] object-contain select-none pointer-events-none filter drop-shadow-md transition-transform hover:scale-105 active:scale-95"
          src={`/${square?.color === 'b' ? `b${square.type}` : `w${square.type}`}.png`}
          alt={`${square.color === 'w' ? 'White' : 'Black'} ${square.type}`}
          draggable={false}
        />
      ) : null}
    </div>
  );
};

export default ChessSquare;
