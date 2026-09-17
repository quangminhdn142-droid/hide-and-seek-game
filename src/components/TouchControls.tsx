import React from 'react';
import { Footprints, Zap, Hand } from 'lucide-react';
import { Character } from '../types';

interface TouchControlsProps {
  player: Character;
  onMoveDirection?: (dx: number, dy: number) => void;
  onSprintToggle: () => void;
  onSneakToggle: () => void;
  onInteract: () => void;
  onAbility1: () => void;
  onAbility2: () => void;
  isInteractAvailable: boolean;
}

export const TouchControls: React.FC<TouchControlsProps> = ({
  player,
  onSprintToggle,
  onSneakToggle,
  onInteract,
  isInteractAvailable,
}) => {
  return (
    <div className="md:hidden pointer-events-none absolute inset-0 z-30 flex items-end justify-end p-4 pb-20">
      {/* Action Buttons */}
      <div className="pointer-events-auto flex flex-col gap-2.5 items-end">
        {/* Interact button */}
        {isInteractAvailable && (
          <button
            onClick={onInteract}
            className="w-14 h-14 rounded-full bg-emerald-600 active:bg-emerald-500 text-white flex items-center justify-center shadow-lg border border-emerald-400 font-bold"
          >
            <Hand size={22} />
          </button>
        )}

        <div className="flex gap-2.5">
          {/* Sprint toggle */}
          <button
            onClick={onSprintToggle}
            className={`w-13 h-13 rounded-full flex items-center justify-center shadow-lg border text-white transition-colors ${
              player.isSprinting
                ? 'bg-amber-600 border-amber-300'
                : 'bg-slate-800/80 border-slate-600 text-slate-300'
            }`}
          >
            <Zap size={20} />
          </button>

          {/* Sneak toggle */}
          <button
            onClick={onSneakToggle}
            className={`w-13 h-13 rounded-full flex items-center justify-center shadow-lg border text-white transition-colors ${
              player.isCrouching
                ? 'bg-blue-600 border-blue-300'
                : 'bg-slate-800/80 border-slate-600 text-slate-300'
            }`}
          >
            <Footprints size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};
