import { useUser } from '@repo/store/src/hooks/useUser';
import { Metadata, Player } from '../screens/Game';

interface UserAvatarProps {
  gameMetadata: Metadata | null;
  self?: boolean;
}

export const UserAvatar = ({ gameMetadata, self }: UserAvatarProps) => {
  const user = useUser();
  if (!gameMetadata) return null;

  const isUserBlack = gameMetadata.blackPlayer.id === user?.id;
  const player: Player | undefined = isUserBlack
    ? self ? gameMetadata.blackPlayer : gameMetadata.whitePlayer
    : self ? gameMetadata.whitePlayer : gameMetadata.blackPlayer;

  const isWhitePiece = player?.id === gameMetadata.whitePlayer.id;

  return (
    <div className="flex items-center gap-2.5">
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm shadow-sm ${
        isWhitePiece 
          ? 'bg-slate-100 text-slate-900 border border-slate-300' 
          : 'bg-slate-800 text-slate-100 border border-slate-700'
      }`}>
        {isWhitePiece ? '♔' : '♚'}
      </div>
      <div>
        <div className="flex items-center gap-2">
          <span className="font-bold text-white text-xs sm:text-sm tracking-tight">
            {player?.name ?? 'Player'}
          </span>
          {player?.isGuest ? (
            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
              GUEST
            </span>
          ) : (
            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300">
              PRO
            </span>
          )}
        </div>
        <p className="text-[10px] text-slate-400">
          Playing as {isWhitePiece ? 'White' : 'Black'}
        </p>
      </div>
    </div>
  );
};
