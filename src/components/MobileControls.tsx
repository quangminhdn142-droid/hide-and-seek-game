import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  Footprints,
  Zap,
  Hand,
  Sparkles,
  Radio,
  Eye,
  Video,
  Map as MapIcon,
  MessageSquare,
} from 'lucide-react';
import { Character, Language } from '../types';
import { ITEM_DEFINITIONS } from '../game/items';

interface MobileControlsProps {
  player: Character;
  onMoveDirection: (dx: number, dy: number) => void;
  onAimDirection?: (dx: number, dy: number) => void;
  onSprintToggle: () => void;
  onSneakToggle: () => void;
  onInteract: () => void;
  onAbility1: () => void;
  onAbility2: () => void;
  ability1Cooldown: number;
  ability2Cooldown: number;
  onUseItem?: (slotIndex: number) => void;
  onCycleCam?: () => void;
  onToggleMiniMap?: () => void;
  onToggleChat?: () => void;
  interactPrompt: { label: string; keyLabel?: string; onAction: () => void } | null;
  language: Language;
}

export const MobileControls: React.FC<MobileControlsProps> = ({
  player,
  onMoveDirection,
  onAimDirection,
  onSprintToggle,
  onSneakToggle,
  onInteract,
  onAbility1,
  onAbility2,
  ability1Cooldown,
  ability2Cooldown,
  onUseItem,
  onCycleCam,
  onToggleMiniMap,
  onToggleChat,
  interactPrompt,
  language,
}) => {
  const isVi = language === 'vi';
  const joystickBaseRef = useRef<HTMLDivElement>(null);
  const [joystickActive, setJoystickActive] = useState(false);
  const [knobPos, setKnobPos] = useState({ x: 0, y: 0 });
  const touchIdRef = useRef<number | null>(null);
  const baseCenterRef = useRef({ x: 0, y: 0 });

  const JOYSTICK_RADIUS = 50;

  const updateJoystick = useCallback((clientX: number, clientY: number) => {
    const dx = clientX - baseCenterRef.current.x;
    const dy = clientY - baseCenterRef.current.y;
    const distance = Math.hypot(dx, dy);

    if (distance === 0) {
      setKnobPos({ x: 0, y: 0 });
      onMoveDirection(0, 0);
      return;
    }

    const clampedDist = Math.min(distance, JOYSTICK_RADIUS);
    const angle = Math.atan2(dy, dx);
    const knobX = Math.cos(angle) * clampedDist;
    const knobY = Math.sin(angle) * clampedDist;

    setKnobPos({ x: knobX, y: knobY });

    // Normalized directional force (-1 to 1)
    const normalizedIntensity = clampedDist / JOYSTICK_RADIUS;
    const moveX = Math.cos(angle) * normalizedIntensity;
    const moveY = Math.sin(angle) * normalizedIntensity;

    onMoveDirection(moveX, moveY);
    if (onAimDirection) {
      onAimDirection(moveX, moveY);
    }
  }, [onMoveDirection, onAimDirection]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    touchIdRef.current = e.pointerId;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    if (joystickBaseRef.current) {
      const rect = joystickBaseRef.current.getBoundingClientRect();
      baseCenterRef.current = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      };
    }

    setJoystickActive(true);
    updateJoystick(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerId === touchIdRef.current) {
      e.preventDefault();
      e.stopPropagation();
      updateJoystick(e.clientX, e.clientY);
    }
  };

  const resetJoystick = useCallback(() => {
    touchIdRef.current = null;
    setJoystickActive(false);
    setKnobPos({ x: 0, y: 0 });
    onMoveDirection(0, 0);
  }, [onMoveDirection]);

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerId === touchIdRef.current) {
      e.preventDefault();
      resetJoystick();
    }
  };

  useEffect(() => {
    const handleGlobalTouchCancel = () => {
      resetJoystick();
    };
    window.addEventListener('pointerup', handleGlobalTouchCancel);
    window.addEventListener('pointercancel', handleGlobalTouchCancel);
    return () => {
      window.removeEventListener('pointerup', handleGlobalTouchCancel);
      window.removeEventListener('pointercancel', handleGlobalTouchCancel);
    };
  }, [resetJoystick]);

  // Visual stamina percentage
  const staminaPercent = Math.max(0, Math.min(100, (player.stamina / (player.maxStamina || 100)) * 100));

  return (
    <div
      id="mobile-hud-layer"
      className="pointer-events-none absolute inset-0 z-30 flex flex-col justify-between select-none touch-none overflow-hidden"
    >
      {/* Top Mobile Quick Utilities bar (Only on small screens or mobile mode) */}
      <div className="pointer-events-auto flex items-center justify-between px-3 pt-2">
        <div className="flex items-center gap-2">
          {onToggleChat && (
            <button
              type="button"
              id="btn-mobile-chat-toggle"
              onClick={onToggleChat}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-slate-200 text-xs font-bold shadow-lg active:scale-95 backdrop-blur-md"
            >
              <MessageSquare size={14} className="text-sky-400" />
              <span>{isVi ? 'Bộ đàm' : 'Radio'}</span>
            </button>
          )}
          {onCycleCam && (
            <button
              type="button"
              id="btn-mobile-botcam-toggle"
              onClick={onCycleCam}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-slate-200 text-xs font-bold shadow-lg active:scale-95 backdrop-blur-md"
            >
              <Video size={14} className="text-emerald-400" />
              <span>{isVi ? 'Góc nhìn' : 'Cam'}</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {onToggleMiniMap && (
            <button
              type="button"
              id="btn-mobile-map-toggle"
              onClick={onToggleMiniMap}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-slate-200 text-xs font-bold shadow-lg active:scale-95 backdrop-blur-md"
            >
              <MapIcon size={14} className="text-amber-400" />
              <span>{isVi ? 'Bản đồ' : 'Map'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Bottom Controls: Virtual Analog Joystick (Left) + Action Cluster (Right) */}
      <div className="flex items-end justify-between w-full px-3 pb-3 sm:pb-5">
        {/* Left: Responsive Touch Joystick */}
        <div className="pointer-events-auto flex flex-col items-center gap-1.5">
          <div
            id="mobile-virtual-joystick"
            ref={joystickBaseRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            className={`relative w-28 h-28 sm:w-32 sm:h-32 rounded-full border-2 transition-colors flex items-center justify-center backdrop-blur-md shadow-2xl ${
              joystickActive
                ? 'bg-slate-900/90 border-sky-400 shadow-sky-900/50 ring-4 ring-sky-500/20'
                : 'bg-slate-950/75 border-slate-700/80'
            }`}
            style={{ touchAction: 'none', userSelect: 'none' }}
          >
            {/* Guide crosshairs */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-25">
              <div className="w-full h-[1px] bg-slate-400" />
              <div className="h-full w-[1px] bg-slate-400 absolute" />
            </div>

            {/* Inner movable analog knob */}
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-transform duration-75 shadow-xl pointer-events-none ${
                joystickActive
                  ? 'bg-gradient-to-br from-sky-500 to-blue-600 border-white text-white scale-105'
                  : 'bg-slate-800/90 border-slate-500 text-slate-400'
              }`}
              style={{
                transform: `translate(${knobPos.x}px, ${knobPos.y}px)`,
              }}
            >
              <div className="w-3.5 h-3.5 rounded-full bg-white/70 shadow-sm" />
            </div>
          </div>
          <span className="text-[10px] font-bold text-slate-400 tracking-wider">
            {isVi ? 'DI CHUYỂN' : 'JOYSTICK'}
          </span>
        </div>

        {/* Center: Inventory Quick Access (Slots 1, 2, 3) + Mini Stamina indicator */}
        <div className="pointer-events-auto flex flex-col items-center gap-1.5 mb-1">
          {/* Stamina bar for mobile */}
          <div className="w-28 sm:w-36 bg-slate-900/90 border border-slate-700/80 rounded-full h-3 p-0.5 overflow-hidden shadow-md backdrop-blur-md flex items-center">
            <div
              className={`h-full rounded-full transition-all duration-150 ${
                staminaPercent > 40 ? 'bg-gradient-to-r from-emerald-500 to-green-400' : 'bg-gradient-to-r from-amber-500 to-red-500'
              }`}
              style={{ width: `${staminaPercent}%` }}
            />
          </div>

          {onUseItem && (
            <div className="flex items-center gap-1.5 bg-slate-950/80 border border-slate-700/80 backdrop-blur-md p-1.5 rounded-2xl shadow-xl">
              {[0, 1, 2].map((idx) => {
                const itemType = player.inventory?.[idx];
                const def = itemType ? ITEM_DEFINITIONS[itemType] : null;
                return (
                  <button
                    key={idx}
                    type="button"
                    id={`btn-mobile-item-${idx}`}
                    onClick={() => onUseItem(idx)}
                    disabled={!def}
                    className={`w-11 h-11 rounded-xl border flex flex-col items-center justify-center relative active:scale-95 transition-all ${
                      def
                        ? 'bg-slate-900/95 border-sky-400 shadow-md text-white'
                        : 'border-dashed border-slate-800 bg-slate-950/40 text-slate-600'
                    }`}
                    style={{
                      borderColor: def ? def.color : undefined,
                    }}
                  >
                    {def ? (
                      <>
                        <span className="text-base leading-none">{def.icon}</span>
                        <span className="text-[8px] font-bold tracking-tighter truncate max-w-[36px] mt-0.5">
                          {def.name.split(' ')[0]}
                        </span>
                      </>
                    ) : (
                      <span className="text-[10px] font-mono text-slate-600 font-bold">{idx + 1}</span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Actions Cluster (Stance, Abilities, Interact) */}
        <div className="pointer-events-auto flex flex-col items-end gap-2.5">
          {/* Prominent Contextual Interaction Button */}
          {interactPrompt && (
            <button
              type="button"
              id="btn-mobile-interact"
              onClick={onInteract}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-95 border border-emerald-400 text-white font-extrabold text-xs shadow-xl shadow-emerald-950/60 flex items-center gap-2 animate-bounce"
            >
              <Hand size={18} />
              <span>{interactPrompt.label}</span>
            </button>
          )}

          {/* Core Ability Buttons */}
          <div className="flex items-center gap-2">
            {/* Ability 1 (Rock / Sonar) */}
            <button
              type="button"
              id="btn-mobile-ability-1"
              onClick={onAbility1}
              disabled={ability1Cooldown > 0}
              className={`relative w-13 h-13 sm:w-14 sm:h-14 rounded-2xl border flex flex-col items-center justify-center transition-all shadow-xl active:scale-95 ${
                ability1Cooldown > 0
                  ? 'bg-slate-900/80 border-slate-700 text-slate-500'
                  : player.role === 'hider'
                  ? 'bg-amber-600/95 border-amber-300 text-white shadow-amber-900/40'
                  : 'bg-indigo-600/95 border-indigo-300 text-white shadow-indigo-900/40'
              }`}
            >
              {player.role === 'hider' ? <Sparkles size={19} /> : <Radio size={19} />}
              <span className="text-[9px] font-black uppercase mt-0.5">
                {player.role === 'hider' ? (isVi ? 'Ném đá' : 'Rock') : isVi ? 'Radar' : 'Sonar'}
              </span>
              {ability1Cooldown > 0 && (
                <div className="absolute inset-0 bg-slate-950/85 rounded-2xl flex items-center justify-center text-xs font-bold text-amber-400">
                  {Math.ceil(ability1Cooldown)}s
                </div>
              )}
            </button>

            {/* Ability 2 (Smoke / Flashlight) */}
            <button
              type="button"
              id="btn-mobile-ability-2"
              onClick={onAbility2}
              disabled={ability2Cooldown > 0}
              className={`relative w-13 h-13 sm:w-14 sm:h-14 rounded-2xl border flex flex-col items-center justify-center transition-all shadow-xl active:scale-95 ${
                ability2Cooldown > 0
                  ? 'bg-slate-900/80 border-slate-700 text-slate-500'
                  : player.role === 'hider'
                  ? 'bg-purple-600/95 border-purple-300 text-white shadow-purple-900/40'
                  : 'bg-yellow-600/95 border-yellow-300 text-white shadow-yellow-900/40'
              }`}
            >
              {player.role === 'hider' ? <Eye size={19} /> : <Zap size={19} />}
              <span className="text-[9px] font-black uppercase mt-0.5">
                {player.role === 'hider' ? (isVi ? 'Khói' : 'Smoke') : isVi ? 'Đèn' : 'Flash'}
              </span>
              {ability2Cooldown > 0 && (
                <div className="absolute inset-0 bg-slate-950/85 rounded-2xl flex items-center justify-center text-xs font-bold text-amber-400">
                  {Math.ceil(ability2Cooldown)}s
                </div>
              )}
            </button>
          </div>

          {/* Movement Stance Controls (Sprint & Sneak Toggles) */}
          <div className="flex items-center gap-2">
            {/* Sneak / Crouch Toggle */}
            <button
              type="button"
              id="btn-mobile-crouch-toggle"
              onClick={onSneakToggle}
              className={`w-12 h-12 sm:w-13 sm:h-13 rounded-xl border flex flex-col items-center justify-center shadow-lg transition-all active:scale-95 ${
                player.isCrouching
                  ? 'bg-sky-600 border-sky-300 text-white shadow-sky-900/50'
                  : 'bg-slate-900/85 border-slate-700 text-slate-300'
              }`}
            >
              <Footprints size={18} />
              <span className="text-[8px] font-bold uppercase mt-0.5">
                {isVi ? 'Trườn' : 'Sneak'}
              </span>
            </button>

            {/* Sprint Toggle */}
            <button
              type="button"
              id="btn-mobile-sprint-toggle"
              onClick={onSprintToggle}
              className={`w-12 h-12 sm:w-13 sm:h-13 rounded-xl border flex flex-col items-center justify-center shadow-lg transition-all active:scale-95 ${
                player.isSprinting
                  ? 'bg-amber-600 border-amber-300 text-white shadow-amber-900/50 ring-2 ring-amber-400/40'
                  : 'bg-slate-900/85 border-slate-700 text-slate-300'
              }`}
            >
              <Zap size={18} />
              <span className="text-[8px] font-bold uppercase mt-0.5">
                {isVi ? 'Chạy' : 'Sprint'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
