const LegalMoveIndicator = ({
  isPiece,
}: {
  isPiece: boolean;
  isMainBoxColor: boolean;
}) => {
  return (
    <div className="absolute inset-0 z-[30] flex items-center justify-center pointer-events-none">
      {isPiece ? (
        <div className="w-[78%] h-[78%] border-[3.5px] border-cyan-400/80 rounded-full animate-pulse shadow-lg shadow-cyan-400/40" />
      ) : (
        <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 bg-cyan-400/85 rounded-full ring-4 ring-cyan-400/25 shadow-md shadow-cyan-400/60" />
      )}
    </div>
  );
};

export default LegalMoveIndicator;
