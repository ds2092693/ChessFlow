import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import { HandshakeIcon } from 'lucide-react';

interface DrawRequestModalProps {
  isOpen: boolean;
  onAccept: () => void;
  onReject: () => void;
  opponentName?: string;
}

const DrawRequestModal: React.FC<DrawRequestModalProps> = ({
  isOpen,
  onAccept,
  onReject,
  opponentName = 'Your opponent'
}) => {
  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent className='bg-slate-900/95 border-slate-800 rounded-3xl backdrop-blur-2xl shadow-2xl p-6 sm:p-8 max-w-md'>
        <AlertDialogHeader className="space-y-3 text-center sm:text-left">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto sm:mx-0">
            <HandshakeIcon className="w-6 h-6" />
          </div>
          <AlertDialogTitle className='text-2xl font-black text-white tracking-tight'>
            Mutual Draw Offer
          </AlertDialogTitle>
          <AlertDialogDescription className='text-slate-400 text-sm leading-relaxed'>
            <strong className="text-white">{opponentName}</strong> has proposed a mutual draw. If accepted, the game will conclude peacefully with shared rating adjustments.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-6 flex flex-col-reverse sm:flex-row gap-3">
          <AlertDialogCancel 
            onClick={onReject}
            className='rounded-2xl border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold text-sm py-2.5 px-4'
          >
            Decline Offer
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onAccept}
            className='rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold text-sm py-2.5 px-5 shadow-lg shadow-emerald-500/20'
          >
            Accept Draw
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DrawRequestModal;
