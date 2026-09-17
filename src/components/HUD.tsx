import React, { useState, useEffect } from 'react';
import {
  Shield,
  Search,
  Volume2,
  VolumeX,
  Footprints,
  Eye,
  Radio,
  Sparkles,
  Zap,
  HelpCircle,
  RotateCcw,
  Maximize2,
  Minimize2,
  X,
  MapPin,
  Compass,
  Video,
  Clock,
  Edit3,
  Plus,
  Minus,
  Check,
  Smartphone,
  Monitor,
  ShieldCheck,
} from 'lucide-react';
import { Character, GameMap, GamePhase, PlayerRole, Language, PlayerProfile } from '../types';
import { ITEM_DEFINITIONS } from '../game/items';
import { TRANSLATIONS } from '../utils/i18n';

interface HUDProps {
  player: Character;
  characters: Character[];
  camTargetId?: string;
  onSelectCamTarget?: (id: string) => void;
  onCycleCam?: () => void;
  phase: GamePhase;
  phaseTimeLeft: number;
  map: GameMap;
  isMuted: boolean;
  language: Language;
  profile?: PlayerProfile;
  onOpenProfile?: () => void;
  onOpenCaptcha?: () => void;
  onToggleLanguage: () => void;
  onToggleMute: () => void;
  onUseAbility1: () => void; // Q: Rock throw / Radar
  onUseAbility2: () => void; // F: Smoke / Flashlight boost
  ability1Cooldown: number;
  ability2Cooldown: number;
  onUseItem?: (slotIndex: number) => void; // 1, 2, 3: Use inventory item
  interactPrompt: { label: string; keyLabel: string; onAction: () => void } | null;
  tensionLevel: number; // 0 to 1, based on proximity to seeker
  onAdjustTimeLeft?: (newSeconds: number) => void;
  onOpenHelp: () => void;
  onOpenSettings: () => void;
  isMobileMode?: boolean;
  onToggleMobileMode?: () => void;
  isTacticalMapOpen?: boolean;
  onToggleTacticalMap?: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  player,
  characters,
  camTargetId,
  onSelectCamTarget,
  onCycleCam,
  phase,
  phaseTimeLeft,
  map,
  isMuted,
  language,
  profile,
  onOpenProfile,
  onOpenCaptcha,
  onToggleLanguage,
  onToggleMute,
  onUseAbility1,
  onUseAbility2,
  ability1Cooldown,
  ability2Cooldown,
  onUseItem,
  interactPrompt,
  tensionLevel,
  onAdjustTimeLeft,
  onOpenHelp,
  onOpenSettings,
  isMobileMode = false,
  onToggleMobileMode,
  isTacticalMapOpen,
  onToggleTacticalMap,
}) => {
  const [internalMapExpanded, setInternalMapExpanded] = useState(false);
  const isMapExpanded = isTacticalMapOpen !== undefined ? isTacticalMapOpen : internalMapExpanded;
  const toggleMap = onToggleTacticalMap || (() => setInternalMapExpanded((prev) => !prev));
  const closeMap = () => {
    if (onToggleTacticalMap && isTacticalMapOpen) {
      onToggleTacticalMap();
    } else {
      setInternalMapExpanded(false);
    }
  };
  const [isEditingTime, setIsEditingTime] = useState(false);
  const [timeInputVal, setTimeInputVal] = useState(String(Math.round(phaseTimeLeft)));
  const t = TRANSLATIONS[language];
  const isVi = language === 'vi';
  const hiders = characters.filter((c) => c.role === 'hider');
  const aliveHidersCount = hiders.filter((c) => !c.isCaught).length;
  const totalHidersCount = hiders.length;

  const handleStepTime = (delta: number) => {
    if (!onAdjustTimeLeft) return;
    const current = parseInt(timeInputVal, 10);
    const base = !isNaN(current) && current > 0 ? current : Math.round(phaseTimeLeft);
    const next = Math.max(5, Math.min(1800, base + delta));
    setTimeInputVal(String(next));
    onAdjustTimeLeft(next);
  };

  const handleSetPreset = (dur: number) => {
    if (!onAdjustTimeLeft) return;
    setTimeInputVal(String(dur));
    onAdjustTimeLeft(dur);
    setIsEditingTime(false);
  };

  const handleApplyCustomTime = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onAdjustTimeLeft) return;
    const val = parseInt(timeInputVal, 10);
    if (!isNaN(val) && val >= 5) {
      const clamped = Math.min(1800, val);
      setTimeInputVal(String(clamped));
      onAdjustTimeLeft(clamped);
      setIsEditingTime(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const targetTag = (e.target as HTMLElement)?.tagName;
      if (targetTag === 'INPUT' || targetTag === 'TEXTAREA') return;
      if (e.code === 'KeyM') {
        toggleMap();
      } else if (e.code === 'Escape') {
        if (isEditingTime) {
          setIsEditingTime(false);
        } else if (isMapExpanded) {
          closeMap();
        }
      } else if (e.code === 'Digit1') {
        onUseItem?.(0);
      } else if (e.code === 'Digit2') {
        onUseItem?.(1);
      } else if (e.code === 'Digit3') {
        onUseItem?.(2);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMapExpanded, isEditingTime, onUseItem]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-3 md:p-5 overflow-hidden z-20">
      {/* Dynamic Tension Red Vignette when seeker is very close to hider player */}
      {player.role === 'hider' && tensionLevel > 0.35 && !player.isCaught && (
        <div
          className="pointer-events-none absolute inset-0 transition-opacity duration-300"
          style={{
            background: `radial-gradient(ellipse at center, transparent 40%, rgba(239, 68, 68, ${
              tensionLevel * 0.45
            }) 100%)`,
          }}
        />
      )}

      {/* TOP BAR */}
      <div className="flex items-start justify-between gap-3">
        {/* Match Phase & Timer Box with Interactive Time Edit */}
        <div className="relative pointer-events-auto flex items-center gap-3 bg-slate-900/90 border border-slate-700/80 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-xl">
          <div className="flex flex-col">
            <div className="flex items-center justify-between gap-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                {phase === 'hiding' ? `⏳ ${t.phaseHiding}` : phase === 'seeking' ? `🔍 ${t.phaseSeeking}` : 'Match'}
              </span>
              {/* Quick Time Edit Trigger Button */}
              {onAdjustTimeLeft && (
                <button
                  type="button"
                  id="btn-trigger-time-edit"
                  onClick={() => {
                    setTimeInputVal(String(Math.round(phaseTimeLeft)));
                    setIsEditingTime((prev) => !prev);
                  }}
                  className="p-1 -mr-1 rounded-md text-slate-400 hover:text-sky-300 hover:bg-slate-800 transition-colors flex items-center gap-0.5 text-[10px] font-semibold"
                  title={isVi ? 'Chỉnh sửa thời gian trận đấu' : 'Edit match duration / timer'}
                >
                  <Edit3 size={11} />
                  <span>{isVi ? 'Sửa' : 'Edit'}</span>
                </button>
              )}
            </div>

            <div className="flex items-baseline gap-2">
              <span
                id="match-timer"
                onClick={() => {
                  if (onAdjustTimeLeft) {
                    setTimeInputVal(String(Math.round(phaseTimeLeft)));
                    setIsEditingTime((prev) => !prev);
                  }
                }}
                className={`font-mono text-2xl md:text-3xl font-extrabold tabular-nums cursor-pointer hover:opacity-90 transition-opacity ${
                  phase === 'hiding'
                    ? 'text-amber-400'
                    : phaseTimeLeft <= 15
                    ? 'text-red-400 animate-pulse'
                    : 'text-slate-100'
                }`}
                title={isVi ? 'Nhấp để chỉnh thời gian' : 'Click to edit time'}
              >
                {formatTime(phaseTimeLeft)}
              </span>
              {phase === 'hiding' && (
                <span className="text-xs text-amber-300/80 font-medium">{t.phaseScattering}</span>
              )}
            </div>
          </div>

          {/* Inline Quick Time Editor Popover */}
          {isEditingTime && onAdjustTimeLeft && (
            <>
              {/* Dismiss backdrop on click outside */}
              <div
                className="fixed inset-0 z-40 bg-black/10"
                onClick={() => setIsEditingTime(false)}
              />
              <div
                id="popover-time-edit"
                className="absolute top-full left-0 mt-2 z-50 w-72 bg-slate-900/95 border-2 border-sky-500/70 rounded-2xl p-3.5 shadow-2xl backdrop-blur-md flex flex-col gap-2.5 animate-in fade-in slide-in-from-top-2 duration-150"
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-sky-400">
                    <Clock size={14} />
                    <span>
                      {phase === 'hiding'
                        ? isVi
                          ? 'Sửa thời gian trốn (đang đếm ngược)'
                          : 'Edit Hiding Countdown'
                        : isVi
                        ? 'Sửa thời gian trận đấu'
                        : 'Edit Match Timer'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsEditingTime(false)}
                    className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>

                {/* Direct Numerical Input */}
                <form onSubmit={handleApplyCustomTime} className="flex items-center gap-1.5">
                  <div className="relative flex-1">
                    <input
                      id="input-hud-custom-time"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={timeInputVal}
                      onChange={(e) => setTimeInputVal(e.target.value.replace(/[^0-9]/g, ''))}
                      onKeyDown={(e) => {
                        e.stopPropagation();
                        if (e.key === 'Escape') {
                          setIsEditingTime(false);
                        }
                      }}
                      className="w-full bg-slate-950 border border-slate-700 focus:border-sky-400 rounded-xl px-2.5 py-1.5 text-center font-mono font-bold text-white text-sm focus:outline-none focus:ring-1 focus:ring-sky-400"
                      placeholder="Giây / Sec"
                      autoFocus
                    />
                    <span className="absolute right-2.5 top-2 text-[10px] text-slate-500 font-bold pointer-events-none">
                      s
                    </span>
                  </div>
                  <button
                    type="submit"
                    id="btn-apply-custom-time"
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-md shadow-sky-900/30 transition-all"
                  >
                    <Check size={13} />
                    <span>{isVi ? 'Lưu' : 'Set'}</span>
                  </button>
                </form>

                {/* Quick Stepper Buttons */}
                <div className="grid grid-cols-4 gap-1">
                  <button
                    type="button"
                    onClick={() => handleStepTime(-30)}
                    className="py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700/60"
                  >
                    -30s
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStepTime(-15)}
                    className="py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700/60"
                  >
                    -15s
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStepTime(15)}
                    className="py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700/60"
                  >
                    +15s
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStepTime(30)}
                    className="py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700/60"
                  >
                    +30s
                  </button>
                </div>

                {/* Presets & Full Settings Link */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-[11px]">
                  <div className="flex items-center gap-1">
                    {[30, 60, 90, 120, 180].map((dur) => (
                      <button
                        key={dur}
                        type="button"
                        onClick={() => handleSetPreset(dur)}
                        className="px-1.5 py-0.5 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 font-mono text-[10px] border border-slate-700/60"
                      >
                        {dur}s
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingTime(false);
                      onOpenSettings();
                    }}
                    className="text-sky-400 hover:text-sky-300 font-medium text-[11px] underline underline-offset-2 ml-1"
                  >
                    {isVi ? 'Cài đặt...' : 'Settings...'}
                  </button>
                </div>
              </div>
            </>
          )}

          <div className="h-8 w-[1px] bg-slate-700" />

          {/* Role Badge */}
          <div className="flex items-center gap-2">
            <div
              className={`p-2 rounded-xl flex items-center justify-center ${
                player.role === 'hider'
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  : 'bg-red-500/20 text-red-400 border border-red-500/30'
              }`}
            >
              {player.role === 'hider' ? <Shield size={18} /> : <Search size={18} />}
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-200">
                {player.role === 'hider' ? t.roleHider : t.roleSeeker}
              </span>
              <span className="text-[10px] text-slate-400">
                {player.role === 'hider'
                  ? player.hidingSpotId
                    ? t.statusInsideCrate
                    : player.isInBush
                    ? t.statusInFoliage
                    : t.statusStayHidden
                  : t.statusFindHiders}
              </span>
            </div>
          </div>
        </div>

        {/* Squad & Bot Cam Selection Row */}
        <div className="pointer-events-auto flex items-center gap-2 bg-slate-900/90 border border-slate-700/80 backdrop-blur-md px-3 py-2 rounded-2xl shadow-xl max-w-md overflow-x-auto">
          <div className="flex flex-col pr-2 border-r border-slate-700">
            <span className="text-[10px] text-slate-400 uppercase font-semibold flex items-center gap-1">
              <Video size={11} className={camTargetId && camTargetId !== player.id && camTargetId !== 'player' ? 'text-red-400 animate-pulse' : 'text-emerald-400'} />
              {t.squadTitle}
            </span>
            <span className="text-xs font-bold text-slate-200 font-mono">
              {aliveHidersCount}/{totalHidersCount}
            </span>
          </div>

          <div className="flex items-center gap-1.5 pl-0.5">
            {/* Player Avatar */}
            <button
              onClick={() => onSelectCamTarget?.('player')}
              title={`${player.name} (${t.youBadge})`}
              className={`relative flex items-center justify-center w-8 h-8 rounded-full border text-sm font-bold transition-all ${
                !camTargetId || camTargetId === 'player' || camTargetId === player.id
                  ? 'bg-blue-600 border-blue-400 text-white ring-2 ring-blue-400/80 scale-110 shadow-lg'
                  : 'bg-blue-950/70 border-blue-500/60 text-blue-200 hover:scale-105'
              }`}
              style={{ backgroundColor: player.color ? player.color + '33' : undefined, borderColor: player.color }}
            >
              <span>{player.avatar || profile?.avatar || '★'}</span>
              {(player.isHumanVerified || profile?.isHumanVerified) && (
                <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border border-slate-900 flex items-center justify-center text-[8px] text-white">
                  ✓
                </span>
              )}
            </button>

            {/* Teammate / Bot Hiders */}
            {hiders.filter((h) => h.id !== player.id).map((hider) => {
              const isSelected = camTargetId === hider.id;
              return (
                <button
                  key={hider.id}
                  onClick={() => onSelectCamTarget?.(hider.id)}
                  title={`${hider.name} (${hider.isCaught ? t.caughtStatus : t.aliveStatus})`}
                  className={`relative flex items-center justify-center w-8 h-8 rounded-full border text-xs font-bold transition-all ${
                    isSelected
                      ? 'bg-emerald-600 border-emerald-400 text-white ring-2 ring-emerald-400/80 scale-110 shadow-lg'
                      : hider.isCaught
                      ? 'bg-slate-800 border-slate-700 text-slate-500 line-through opacity-50 hover:opacity-80'
                      : hider.hidingSpotId
                      ? 'bg-amber-950/70 border-amber-500/60 text-amber-300 hover:scale-105'
                      : 'bg-slate-800 border-slate-600 text-slate-200 hover:scale-105'
                  }`}
                >
                  {hider.isCaught ? '💀' : hider.name.charAt(0)}
                  {!hider.isCaught && (
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-slate-900" />
                  )}
                </button>
              );
            })}

            {/* Seeker Bot Avatar */}
            {characters.filter((c) => c.role === 'seeker' && c.id !== player.id).map((seeker) => {
              const isSelected = camTargetId === seeker.id;
              return (
                <button
                  key={seeker.id}
                  onClick={() => onSelectCamTarget?.(seeker.id)}
                  title={`${t.roleSeeker}: ${seeker.name}`}
                  className={`relative flex items-center justify-center w-8 h-8 rounded-full border text-xs font-bold transition-all ${
                    isSelected
                      ? 'bg-red-600 border-red-400 text-white ring-2 ring-red-400/80 scale-110 shadow-lg'
                      : 'bg-red-950/70 border-red-600/60 text-red-300 hover:scale-105'
                  }`}
                >
                  🔦
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-red-400 ring-2 ring-slate-900" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Utility Controls (Sound, Language, Help, Room settings) */}
        <div className="pointer-events-auto flex items-center gap-1.5">
          {/* Mobile / Touch Mode Toggle */}
          {onToggleMobileMode && (
            <button
              id="btn-hud-mobile-toggle"
              type="button"
              onClick={onToggleMobileMode}
              title={
                isMobileMode
                  ? isVi
                    ? 'Chế độ Cảm ứng / Mobile: Đang BẬT (Nhấn để tắt)'
                    : 'Mobile / Touch Mode: ON (Click to switch to Keyboard)'
                  : isVi
                  ? 'Chế độ Cảm ứng / Mobile: Đang TẮT (Nhấn để bật cần ảo)'
                    : 'Mobile / Touch Mode: OFF (Click to activate virtual joystick)'
              }
              className={`h-10 px-2.5 rounded-xl border flex items-center gap-1 transition-all shadow-lg font-bold text-xs ${
                isMobileMode
                  ? 'bg-sky-600 border-sky-400 text-white ring-2 ring-sky-400/50 shadow-sky-900/40'
                  : 'bg-slate-900/90 border-slate-700 hover:bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              {isMobileMode ? <Smartphone size={17} className="text-white" /> : <Monitor size={17} />}
              <span className="hidden sm:inline font-mono">
                {isMobileMode ? (isVi ? 'Mobile' : 'Mobile') : (isVi ? 'PC' : 'PC')}
              </span>
            </button>
          )}

          {/* Profile & Identity Button */}
          {onOpenProfile && (
            <button
              id="btn-hud-profile-toggle"
              type="button"
              onClick={onOpenProfile}
              title={isVi ? 'Hồ sơ & Danh tính người chơi' : 'Player Profile & Identity'}
              className="h-10 px-2.5 rounded-xl bg-slate-900/90 border border-slate-700 hover:bg-slate-800 text-slate-200 hover:text-white flex items-center gap-1.5 transition-colors shadow-lg group"
            >
              <span className="text-base group-hover:scale-110 transition-transform">
                {profile?.avatar || '🕵️'}
              </span>
              {(player.isHumanVerified || profile?.isHumanVerified) && (
                <ShieldCheck size={14} className="text-emerald-400 shrink-0" />
              )}
            </button>
          )}

          {/* Language Switcher */}
          <button
            id="btn-hud-lang-toggle"
            onClick={onToggleLanguage}
            title={isVi ? 'Switch language to English' : 'Chuyển sang Tiếng Việt'}
            className="h-10 px-3 rounded-xl bg-slate-900/90 border border-slate-700 hover:bg-slate-800 text-slate-200 hover:text-white flex items-center gap-1 transition-colors shadow-lg font-bold text-xs"
          >
            <span>{isVi ? '🇻🇳 VI' : '🇬🇧 EN'}</span>
          </button>

          <button
            id="btn-sound-toggle"
            onClick={onToggleMute}
            title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
            className="w-10 h-10 rounded-xl bg-slate-900/90 border border-slate-700 hover:bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center transition-colors shadow-lg"
          >
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>

          <button
            id="btn-help-modal"
            onClick={onOpenHelp}
            title={t.howToPlay}
            className="w-10 h-10 rounded-xl bg-slate-900/90 border border-slate-700 hover:bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center transition-colors shadow-lg"
          >
            <HelpCircle size={18} />
          </button>

          <button
            id="btn-settings-modal"
            onClick={onOpenSettings}
            title={t.lobbySettings}
            className="w-10 h-10 rounded-xl bg-slate-900/90 border border-slate-700 hover:bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center transition-colors shadow-lg"
          >
            <RotateCcw size={18} />
          </button>
        </div>
      </div>

      {/* CENTER INTERACTION PROMPT */}
      {interactPrompt && (
        <div className="pointer-events-auto self-center mb-6">
          <button
            id="btn-interact-action"
            onClick={interactPrompt.onAction}
            className="flex items-center gap-3 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold px-6 py-3 rounded-2xl shadow-2xl border border-blue-400/40 animate-bounce transition-all transform active:scale-95"
          >
            <span className="bg-white/20 border border-white/30 text-xs px-2.5 py-1 rounded-lg font-mono font-bold tracking-wider">
              {interactPrompt.keyLabel}
            </span>
            <span className="text-sm md:text-base">{interactPrompt.label}</span>
          </button>
        </div>
      )}

      {/* ACTIVE BUFFS & EFFECTS STATUS BAR */}
      <div className="pointer-events-auto self-center flex flex-wrap items-center justify-center gap-2 mb-2">
        {player.activeBuffs?.invisibilityTimeLeft && player.activeBuffs.invisibilityTimeLeft > 0 ? (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-950/80 border border-purple-500/80 text-purple-200 text-xs font-bold shadow-lg animate-pulse">
            <span>👻</span>
            <span>{t.buffInvisibility}: {player.activeBuffs.invisibilityTimeLeft.toFixed(1)}s</span>
          </div>
        ) : null}
        {player.activeBuffs?.thermalTimeLeft && player.activeBuffs.thermalTimeLeft > 0 ? (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/80 text-emerald-200 text-xs font-bold shadow-lg animate-pulse">
            <span>🥽</span>
            <span>{t.buffThermal}: {player.activeBuffs.thermalTimeLeft.toFixed(1)}s</span>
          </div>
        ) : null}
        {player.activeBuffs?.speedBoostTimeLeft && player.activeBuffs.speedBoostTimeLeft > 0 ? (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/80 border border-amber-500/80 text-amber-200 text-xs font-bold shadow-lg animate-pulse">
            <span>⚡</span>
            <span>{t.buffSpeed}: {player.activeBuffs.speedBoostTimeLeft.toFixed(1)}s</span>
          </div>
        ) : null}
        {player.stunTimer && player.stunTimer > 0 ? (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-950/90 border border-red-500 text-red-200 text-xs font-bold shadow-lg animate-bounce">
            <span>💫</span>
            <span>{t.stunnedText}: {(player.stunTimer / 30).toFixed(1)}s</span>
          </div>
        ) : null}
      </div>

      {/* BOTTOM SECTION: Stamina, Abilities, Movement status */}
      <div className={`flex flex-wrap items-end justify-between gap-3 ${isMobileMode ? 'hidden md:flex' : ''}`}>
        {/* Left: Stamina & Stealth Status */}
        <div className="pointer-events-auto flex flex-col gap-2 bg-slate-900/90 border border-slate-700/80 backdrop-blur-md p-3 rounded-2xl shadow-xl w-56 md:w-64">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-semibold flex items-center gap-1.5">
              <Zap size={14} className="text-amber-400" /> {t.stamina}
            </span>
            <span className="text-slate-200 font-mono font-bold">
              {Math.round(player.stamina)}%
            </span>
          </div>

          {/* Stamina Meter */}
          <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden border border-slate-700">
            <div
              className={`h-full transition-all duration-75 ${
                player.stamina < 25 ? 'bg-red-500' : 'bg-amber-400'
              }`}
              style={{ width: `${Math.max(0, Math.min(100, player.stamina))}%` }}
            />
          </div>

          {/* Movement Stance Indicator */}
          <div className="flex items-center justify-between text-[11px] pt-1 text-slate-400 border-t border-slate-800/80">
            <span className="flex items-center gap-1">
              <Footprints size={13} />
              {player.isSprinting
                ? t.sprintingNoisy
                : player.isCrouching
                ? t.sneakingSilent
                : t.walking}
            </span>
            <span className="text-slate-500 text-[10px]">
              [SHIFT] {t.sprintKey} &bull; [C] {t.sneakKey}
            </span>
          </div>
        </div>

        {/* Center: Abilities & Item Inventory Bar */}
        <div className="pointer-events-auto flex items-center gap-3">
          {/* Abilities Box */}
          <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-700/80 backdrop-blur-md px-3 py-2 rounded-2xl shadow-xl">
            {/* Ability 1 */}
            <button
              id="btn-ability-1"
              onClick={onUseAbility1}
              disabled={ability1Cooldown > 0}
              className={`relative flex flex-col items-center justify-center w-13 h-13 rounded-xl border font-medium transition-all ${
                ability1Cooldown > 0
                  ? 'bg-slate-800/80 border-slate-700 text-slate-500 cursor-not-allowed'
                  : 'bg-slate-800 hover:bg-slate-750 active:scale-95 border-slate-600 text-slate-200 hover:text-white'
              }`}
            >
              {player.role === 'hider' ? <Sparkles size={18} /> : <Radio size={18} />}
              <span className="text-[10px] font-bold mt-0.5">
                {player.role === 'hider' ? `${t.abilityRock} [Q]` : `${t.abilitySonar} [Q]`}
              </span>
              {ability1Cooldown > 0 && (
                <div className="absolute inset-0 bg-slate-950/70 rounded-xl flex items-center justify-center font-bold text-xs text-amber-400">
                  {Math.ceil(ability1Cooldown)}s
                </div>
              )}
            </button>

            {/* Ability 2 */}
            <button
              id="btn-ability-2"
              onClick={onUseAbility2}
              disabled={ability2Cooldown > 0}
              className={`relative flex flex-col items-center justify-center w-13 h-13 rounded-xl border font-medium transition-all ${
                ability2Cooldown > 0
                  ? 'bg-slate-800/80 border-slate-700 text-slate-500 cursor-not-allowed'
                  : 'bg-slate-800 hover:bg-slate-750 active:scale-95 border-slate-600 text-slate-200 hover:text-white'
              }`}
            >
              {player.role === 'hider' ? <Eye size={18} /> : <Zap size={18} />}
              <span className="text-[10px] font-bold mt-0.5">
                {player.role === 'hider' ? `${t.abilitySmoke} [F]` : `${t.abilityFlashlight} [F]`}
              </span>
              {ability2Cooldown > 0 && (
                <div className="absolute inset-0 bg-slate-950/70 rounded-xl flex items-center justify-center font-bold text-xs text-amber-400">
                  {Math.ceil(ability2Cooldown)}s
                </div>
              )}
            </button>

            {/* Bot Cam Switcher Button */}
            <button
              id="btn-bot-cam"
              onClick={onCycleCam}
              title={isVi ? 'Chuyển góc nhìn Bot [TAB]' : 'Cycle Bot Cam / Spectate Bots [TAB]'}
              className={`relative flex flex-col items-center justify-center w-13 h-13 rounded-xl border font-medium transition-all active:scale-95 ${
                camTargetId && camTargetId !== 'player' && camTargetId !== player.id
                  ? 'bg-blue-600/30 border-blue-400 text-sky-300 ring-2 ring-blue-500/50 shadow-lg'
                  : 'bg-slate-800 hover:bg-slate-750 border-slate-600 text-slate-200 hover:text-white'
              }`}
            >
              <Video
                size={18}
                className={
                  camTargetId && camTargetId !== 'player' && camTargetId !== player.id
                    ? 'text-red-400 animate-pulse'
                    : 'text-emerald-400'
                }
              />
              <span className="text-[10px] font-bold mt-0.5">
                {camTargetId && camTargetId !== 'player' && camTargetId !== player.id ? t.botCam : `${t.botCam} [Tab]`}
              </span>
            </button>
          </div>

          {/* Item Inventory Slots [1, 2, 3] */}
          <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-700/80 backdrop-blur-md px-3 py-2 rounded-2xl shadow-xl">
            <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider mr-1 hidden sm:inline">
              {t.items}
            </span>
            {[0, 1, 2].map((slotIdx) => {
              const itemType = player.inventory?.[slotIdx];
              const def = itemType ? ITEM_DEFINITIONS[itemType] : null;
              return (
                <button
                  key={slotIdx}
                  id={`btn-inventory-slot-${slotIdx}`}
                  onClick={() => onUseItem && onUseItem(slotIdx)}
                  disabled={!def}
                  title={
                    def
                      ? `${def.name} (${def.abilityName})\n${def.description}\n[${isVi ? `Nhấn ${slotIdx + 1} hoặc click để dùng` : `Press ${slotIdx + 1} or Click to Activate`}]`
                      : isVi ? `Ô trang bị ${slotIdx + 1} (Trống - nhặt vật phẩm trên sàn)` : `Item Slot ${slotIdx + 1} (Empty - walk over floor items to collect)`
                  }
                  className={`relative flex flex-col items-center justify-center w-13 h-13 rounded-xl border transition-all ${
                    def
                      ? 'hover:scale-105 active:scale-95 cursor-pointer shadow-md'
                      : 'border-dashed border-slate-700/70 bg-slate-950/40 text-slate-600 cursor-default'
                  }`}
                  style={{
                    borderColor: def ? def.color : undefined,
                    backgroundColor: def ? 'rgba(15, 23, 42, 0.92)' : undefined,
                  }}
                >
                  {def ? (
                    <>
                      <span className="text-xl leading-none">{def.icon}</span>
                      <span className="text-[9px] font-bold text-slate-200 mt-0.5 max-w-[48px] truncate text-center leading-tight">
                        {def.name.split(' ')[0]}
                      </span>
                      <span
                        className="absolute -top-1.5 -right-1.5 text-[9px] font-bold px-1.5 py-0.2 rounded-full border shadow"
                        style={{
                          backgroundColor: def.color,
                          borderColor: '#ffffff',
                          color: '#0f172a',
                        }}
                      >
                        {slotIdx + 1}
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="text-xs text-slate-500 font-mono font-bold">[{slotIdx + 1}]</span>
                      <span className="text-[8px] text-slate-600 font-medium">{t.emptySlot}</span>
                    </>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Tactical Mini-Map */}
        <div
          onClick={toggleMap}
          className="pointer-events-auto group relative w-40 h-28 md:w-52 md:h-36 bg-slate-950/95 border border-slate-700/80 hover:border-sky-500/80 transition-all cursor-pointer backdrop-blur-md rounded-2xl overflow-hidden shadow-2xl"
          title="Click to open Full Tactical Map [M]"
        >
          <svg className="w-full h-full" viewBox={`0 0 ${map.width} ${map.height}`}>
            {/* Background Grid Accent */}
            <rect width={map.width} height={map.height} fill="#0b0f19" />

            {/* Zones */}
            {map.zones?.map((zone, idx) => (
              <rect
                key={idx}
                x={zone.x}
                y={zone.y}
                width={zone.width}
                height={zone.height}
                fill="none"
                stroke="#334155"
                strokeWidth={3}
                strokeDasharray="16,12"
                opacity={0.5}
              />
            ))}

            {/* Map Walls */}
            {map.walls.map((w) => (
              <rect
                key={w.id}
                x={w.x}
                y={w.y}
                width={w.width}
                height={w.height}
                fill={w.color || '#475569'}
                stroke="#1e293b"
                strokeWidth={2}
              />
            ))}

            {/* Hiding spots */}
            {map.hidingSpots.map((s) => (
              <rect
                key={s.id}
                x={s.x}
                y={s.y}
                width={s.width}
                height={s.height}
                rx={s.type === 'bush' ? 12 : 4}
                fill={
                  s.type === 'bush'
                    ? '#16a34a'
                    : s.type === 'crate'
                    ? '#d97706'
                    : '#0284c7'
                }
                opacity={0.8}
              />
            ))}

            {/* Characters on Radar: Teammates and Seekers */}
            {characters.map((c) => {
              if (c.id === player.id) return null;

              // 1. Seeker(s) - Always prominent on the radar with threat alert styling
              if (c.role === 'seeker') {
                return (
                  <g key={c.id} transform={`translate(${c.x}, ${c.y})`}>
                    {/* Seeker Vision Cone on Radar */}
                    <path
                      d={`M 0 0 L ${Math.cos(c.angle - 0.5) * 85} ${
                        Math.sin(c.angle - 0.5) * 85
                      } A 85 85 0 0 1 ${Math.cos(c.angle + 0.5) * 85} ${
                        Math.sin(c.angle + 0.5) * 85
                      } Z`}
                      fill="rgba(239, 68, 68, 0.45)"
                    />
                    {/* Threat Pulsing Ring */}
                    <circle
                      r={36}
                      fill="none"
                      stroke="#ef4444"
                      strokeWidth={3}
                      opacity={0.7}
                      className="animate-ping"
                    />
                    {/* Seeker Marker Core */}
                    <circle
                      r={24}
                      fill="#ef4444"
                      stroke="#ffffff"
                      strokeWidth={5}
                    />
                    {/* Inner Alert Dot */}
                    <circle
                      r={9}
                      fill="#ffffff"
                    />
                  </g>
                );
              }

              // 2. Teammate Hiders
              if (c.role === player.role && !c.isCaught) {
                return (
                  <circle
                    key={c.id}
                    cx={c.x}
                    cy={c.y}
                    r={22}
                    fill="#60a5fa"
                    stroke="#ffffff"
                    strokeWidth={4}
                    opacity={0.9}
                  />
                );
              }
              return null;
            })}

            {/* Player Indicator with Vision Direction */}
            <g transform={`translate(${player.x}, ${player.y})`}>
              {/* Vision Cone */}
              <path
                d={`M 0 0 L ${Math.cos(player.angle - 0.45) * 80} ${
                  Math.sin(player.angle - 0.45) * 80
                } A 80 80 0 0 1 ${Math.cos(player.angle + 0.45) * 80} ${
                  Math.sin(player.angle + 0.45) * 80
                } Z`}
                fill={player.role === 'seeker' ? 'rgba(239, 68, 68, 0.4)' : 'rgba(56, 189, 248, 0.4)'}
              />
              {/* Radar Ping Ring */}
              <circle
                cx={0}
                cy={0}
                r={36}
                fill="none"
                stroke={player.role === 'seeker' ? '#ef4444' : '#38bdf8'}
                strokeWidth={3}
                opacity={0.5}
                className="animate-ping"
              />
              {/* Center Dot */}
              <circle
                cx={0}
                cy={0}
                r={26}
                fill={player.role === 'seeker' ? '#ef4444' : '#0284c7'}
                stroke="#ffffff"
                strokeWidth={7}
              />
            </g>
          </svg>

          {/* Minimap Top-Left Label */}
          <div className="absolute top-1.5 left-2 flex items-center gap-1 text-[9px] font-bold tracking-wider text-slate-300 uppercase bg-slate-900/80 px-1.5 py-0.5 rounded backdrop-blur-sm border border-slate-700/50">
            <Radio className="w-2.5 h-2.5 text-sky-400 animate-pulse" />
            <span>{t.radar}</span>
            {characters.some((c) => c.role === 'seeker') && player.role === 'hider' && (
              <span className="ml-1 text-[8px] px-1 py-0.2 rounded font-mono font-bold bg-red-950/90 text-red-400 border border-red-800/80">
                {t.seekerActive}
              </span>
            )}
          </div>

          {/* Expand Hint on Hover */}
          <div className="absolute top-1.5 right-1.5 opacity-60 group-hover:opacity-100 transition-opacity bg-slate-900/80 p-1 rounded border border-slate-700/50 text-slate-300">
            <Maximize2 className="w-3 h-3" />
          </div>

          <div className="absolute bottom-1 right-2 text-[9px] font-mono text-slate-400 group-hover:text-sky-300 transition-colors">
            [M] {t.expandMap}
          </div>
        </div>
      </div>

      {/* Full Tactical Map Modal Overlay */}
      {isMapExpanded && (
        <div className="pointer-events-auto fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-3 md:p-6 animate-in fade-in duration-200">
          <div className="relative w-full max-w-5xl h-[88vh] bg-slate-900 border border-slate-700/90 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-3.5 bg-slate-950/80 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                    {t.tacticalBlueprint}: {isVi && map.nameVi ? map.nameVi : map.name}
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                      {map.width} × {map.height}m
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400">{isVi && map.descriptionVi ? map.descriptionVi : map.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="hidden sm:inline-block text-xs font-mono text-slate-400">
                  {isVi ? 'Tọa độ' : 'Pos'}: X={Math.round(player.x)} Y={Math.round(player.y)}
                </span>
                <button
                  onClick={closeMap}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Map Canvas SVG Area */}
            <div className="relative flex-1 bg-[#090d16] p-4 flex items-center justify-center overflow-hidden">
              <svg
                className="w-full h-full max-h-full object-contain rounded-xl border border-slate-800 shadow-inner"
                viewBox={`0 0 ${map.width} ${map.height}`}
              >
                {/* Floor background */}
                <rect width={map.width} height={map.height} fill="#0d1322" />

                {/* Floor Grid */}
                <defs>
                  <pattern id="tac-grid" width="100" height="100" patternUnits="userSpaceOnUse">
                    <path d="M 100 0 L 0 0 0 100" fill="none" stroke="#17223b" strokeWidth="1.5" />
                  </pattern>
                </defs>
                <rect width={map.width} height={map.height} fill="url(#tac-grid)" />

                {/* Zones with High-Tech Stencil Labels */}
                {map.zones?.map((zone, idx) => (
                  <g key={idx}>
                    <rect
                      x={zone.x}
                      y={zone.y}
                      width={zone.width}
                      height={zone.height}
                      fill="rgba(56, 189, 248, 0.03)"
                      stroke="#38bdf8"
                      strokeWidth={2}
                      strokeDasharray="14,10"
                      opacity={0.4}
                    />
                    <text
                      x={zone.x + 20}
                      y={zone.y + 35}
                      fill="#7dd3fc"
                      fontSize="26"
                      fontWeight="bold"
                      fontFamily="system-ui, sans-serif"
                      opacity={0.5}
                      letterSpacing="2"
                    >
                      {(isVi && zone.nameVi ? zone.nameVi : zone.name).toUpperCase()}
                    </text>
                  </g>
                ))}

                {/* Walls */}
                {map.walls.map((w) => (
                  <rect
                    key={w.id}
                    x={w.x}
                    y={w.y}
                    width={w.width}
                    height={w.height}
                    fill={w.color || '#334155'}
                    stroke="#1e293b"
                    strokeWidth={2}
                  />
                ))}

                {/* Hiding Spots */}
                {map.hidingSpots.map((s) => (
                  <g key={s.id}>
                    <rect
                      x={s.x}
                      y={s.y}
                      width={s.width}
                      height={s.height}
                      rx={s.type === 'bush' ? 12 : 6}
                      fill={
                        s.type === 'bush'
                          ? '#15803d'
                          : s.type === 'crate'
                          ? '#b45309'
                          : '#0369a1'
                      }
                      stroke={
                        s.type === 'bush'
                          ? '#22c55e'
                          : s.type === 'crate'
                          ? '#f59e0b'
                          : '#38bdf8'
                      }
                      strokeWidth={2}
                    />
                    <text
                      x={s.x + s.width / 2}
                      y={s.y + s.height / 2 + 5}
                      fill="#ffffff"
                      fontSize="14"
                      textAnchor="middle"
                      fontWeight="bold"
                    >
                      {s.type === 'bush' ? '🌿' : s.type === 'crate' ? '📦' : '🚪'}
                    </text>
                  </g>
                ))}

                {/* Characters on Tactical Map: Teammates and Seekers */}
                {characters.map((c) => {
                  if (c.id === player.id) return null;

                  // 1. Seeker on Tactical Map - High-threat tracking display
                  if (c.role === 'seeker') {
                    return (
                      <g
                        key={c.id}
                        transform={`translate(${c.x}, ${c.y})`}
                        className="cursor-pointer group"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectCamTarget?.(c.id);
                        }}
                      >
                        {/* Seeker Vision Cone */}
                        <path
                          d={`M 0 0 L ${Math.cos(c.angle - 0.5) * 160} ${
                            Math.sin(c.angle - 0.5) * 160
                          } A 160 160 0 0 1 ${Math.cos(c.angle + 0.5) * 160} ${
                            Math.sin(c.angle + 0.5) * 160
                          } Z`}
                          fill="rgba(239, 68, 68, 0.4)"
                        />
                        {/* Threat Alert Ring */}
                        <circle
                          r={45}
                          fill="none"
                          stroke="#ef4444"
                          strokeWidth={4}
                          opacity={0.65}
                          className="animate-ping"
                        />
                        {/* Seeker Core Dot */}
                        <circle
                          r={26}
                          fill="#ef4444"
                          stroke="#ffffff"
                          strokeWidth={6}
                        />
                        <circle
                          r={10}
                          fill="#ffffff"
                        />
                        <text
                          y={-34}
                          fill="#f87171"
                          fontSize="22"
                          textAnchor="middle"
                          fontWeight="bold"
                        >
                          ⚠️ SEEKER ({c.name}) [CLICK CAM]
                        </text>
                      </g>
                    );
                  }

                  // 2. Teammate Hiders
                  if (c.role === player.role && !c.isCaught) {
                    return (
                      <g
                        key={c.id}
                        transform={`translate(${c.x}, ${c.y})`}
                        className="cursor-pointer group"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectCamTarget?.(c.id);
                        }}
                      >
                        <circle
                          r={20}
                          fill="#60a5fa"
                          stroke="#ffffff"
                          strokeWidth={4}
                        />
                        <text
                          y={-28}
                          fill="#cbd5e1"
                          fontSize="20"
                          textAnchor="middle"
                          fontWeight="bold"
                        >
                          {c.name} [CAM]
                        </text>
                      </g>
                    );
                  }
                  return null;
                })}

                {/* Player Beacon */}
                <g transform={`translate(${player.x}, ${player.y})`}>
                  {/* Vision Cone */}
                  <path
                    d={`M 0 0 L ${Math.cos(player.angle - 0.5) * 160} ${
                      Math.sin(player.angle - 0.5) * 160
                    } A 160 160 0 0 1 ${Math.cos(player.angle + 0.5) * 160} ${
                      Math.sin(player.angle + 0.5) * 160
                    } Z`}
                    fill={player.role === 'seeker' ? 'rgba(239, 68, 68, 0.35)' : 'rgba(56, 189, 248, 0.35)'}
                  />
                  {/* Radar Ripple */}
                  <circle
                    cx={0}
                    cy={0}
                    r={45}
                    fill="none"
                    stroke={player.role === 'seeker' ? '#ef4444' : '#38bdf8'}
                    strokeWidth={4}
                    opacity={0.6}
                  />
                  {/* Player Dot */}
                  <circle
                    cx={0}
                    cy={0}
                    r={26}
                    fill={player.role === 'seeker' ? '#ef4444' : '#0284c7'}
                    stroke="#ffffff"
                    strokeWidth={7}
                  />
                  <text
                    y={-34}
                    fill="#ffffff"
                    fontSize="22"
                    textAnchor="middle"
                    fontWeight="bold"
                  >
                    YOU ({player.name})
                  </text>
                </g>
              </svg>
            </div>

            {/* Modal Footer & Legend */}
            <div className="px-5 py-3 bg-slate-950/90 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
              <div className="flex flex-wrap items-center gap-4 text-slate-300">
                <span className="font-semibold text-slate-400">{t.legendTitle}:</span>
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded-full bg-sky-500 border border-white" />
                  <span>{t.legendPlayer}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded-full bg-red-600 border border-white animate-pulse" />
                  <span className="text-red-400 font-semibold">{t.legendSeeker}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded-full bg-blue-500 border border-white" />
                  <span>{t.legendAlly}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded bg-emerald-600 border border-emerald-400" />
                  <span>{t.legendBush}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded bg-amber-600 border border-amber-400" />
                  <span>{t.legendCrate}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded bg-sky-700 border border-sky-400" />
                  <span>{t.legendLocker}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 border-2 border-dashed border-sky-400/70" />
                  <span>{t.legendZone}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-mono">{t.closeMapHint}</span>
                <button
                  onClick={closeMap}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition-colors"
                >
                  {t.closeMap}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
