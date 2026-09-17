import React, { useMemo } from 'react';
import {
  Video,
  Eye,
  ChevronLeft,
  ChevronRight,
  X,
  Crosshair,
  Shield,
  Zap,
  MapPin,
  Radio,
  Sparkles,
} from 'lucide-react';
import { Character, GameMap, GamePhase, Language } from '../types';

export interface BotActivityInfo {
  action: string;
  detail: string;
  icon: string;
  zone: string;
  badgeColor: string;
  distToSeeker: number | null;
  distToNearestHider: number | null;
}

export function getBotActivity(
  bot: Character,
  characters: Character[],
  map: GameMap,
  phase: GamePhase,
  language: Language = 'vi'
): BotActivityInfo {
  // Determine zone
  const foundZone = map.zones?.find(
    (z) =>
      bot.x >= z.x &&
      bot.x <= z.x + z.width &&
      bot.y >= z.y &&
      bot.y <= z.y + z.height
  );
  const zone = foundZone
    ? language === 'vi' && foundZone.nameVi
      ? foundZone.nameVi
      : foundZone.name
    : language === 'vi'
    ? 'Khu Trung Tâm'
    : 'Main Hall';

  // Distance to nearest seeker
  const seekers = characters.filter((c) => c.role === 'seeker');
  let distToSeeker: number | null = null;
  if (seekers.length > 0 && bot.role === 'hider') {
    distToSeeker = Math.min(
      ...seekers.map((s) => Math.hypot(s.x - bot.x, s.y - bot.y))
    );
  }

  // Distance to nearest hider
  const aliveHiders = characters.filter(
    (c) => c.role === 'hider' && !c.isCaught && c.id !== bot.id
  );
  let distToNearestHider: number | null = null;
  if (aliveHiders.length > 0) {
    distToNearestHider = Math.min(
      ...aliveHiders.map((h) => Math.hypot(h.x - bot.x, h.y - bot.y))
    );
  }

  if (bot.isCaught) {
    return {
      action: 'Tagged & Eliminated',
      detail: 'Character was found and caught. Spectating remaining players.',
      icon: '💀',
      zone,
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
      distToSeeker,
      distToNearestHider,
    };
  }

  // Seeker Bot Activity
  if (bot.role === 'seeker') {
    if (phase === 'hiding') {
      return {
        action: 'Blindfolded at Spawn',
        detail: 'Eyes covered during countdown while hiders scatter into positions.',
        icon: '⏳',
        zone,
        badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        distToSeeker: 0,
        distToNearestHider,
      };
    }

    if (bot.alertState === 'chasing') {
      return {
        action: '🚨 In Hot Pursuit!',
        detail: 'Target locked in flashlight beam! Full sprint to tag.',
        icon: '🚨',
        zone,
        badgeColor: 'bg-red-500/30 text-red-300 border-red-500/60 animate-pulse',
        distToSeeker: 0,
        distToNearestHider,
      };
    }

    // Nearby spot check
    const nearbySpot = map.hidingSpots.find((s) => {
      const cx = s.x + s.width / 2;
      const cy = s.y + s.height / 2;
      return Math.hypot(bot.x - cx, bot.y - cy) < 60;
    });

    if (nearbySpot) {
      return {
        action: `Searching ${nearbySpot.type.toUpperCase()}`,
        detail: `Sweeping flashlight across ${nearbySpot.type} in ${zone}.`,
        icon: '🔦',
        zone,
        badgeColor: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
        distToSeeker: 0,
        distToNearestHider,
      };
    }

    if (bot.alertState === 'suspicious') {
      return {
        action: 'Investigating Sound Ripple',
        detail: 'Heard suspicious movement or distraction rock nearby.',
        icon: '👂',
        zone,
        badgeColor: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
        distToSeeker: 0,
        distToNearestHider,
      };
    }

    return {
      action: 'Patrolling Sector',
      detail: `Sweeping corridors with flashlight in ${zone}.`,
      icon: '👀',
      zone,
      badgeColor: 'bg-red-500/20 text-red-300 border-red-500/40',
      distToSeeker: 0,
      distToNearestHider,
    };
  }

  // Hider Bot Activity
  if (phase === 'hiding') {
    if (bot.hidingSpotId) {
      return {
        action: 'Concealed in Locker / Crate',
        detail: `Found hiding spot in ${zone}. Waiting out countdown.`,
        icon: '📦',
        zone,
        badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
        distToSeeker,
        distToNearestHider,
      };
    }
    if (bot.isInBush) {
      return {
        action: 'Camouflaged in Bush',
        detail: `Taking cover inside foliage in ${zone}.`,
        icon: '🌿',
        zone,
        badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
        distToSeeker,
        distToNearestHider,
      };
    }
    return {
      action: 'Scouting Hiding Spot',
      detail: `Navigating to designated cover location in ${zone}.`,
      icon: '🏃',
      zone,
      badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
      distToSeeker,
      distToNearestHider,
    };
  }

  // Seeking Phase
  if (bot.hidingSpotId) {
    const spot = map.hidingSpots.find((s) => s.id === bot.hidingSpotId);
    return {
      action: `Hidden Inside ${spot?.type?.toUpperCase() || 'LOCKER'}`,
      detail: 'Holding breath silently • 100% visual concealment.',
      icon: '📦',
      zone,
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      distToSeeker,
      distToNearestHider,
    };
  }

  if (bot.isInBush) {
    return {
      action: 'Concealed in Bush Foliage',
      detail: 'Silent crouch • 80% visual camouflage.',
      icon: '🌿',
      zone,
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      distToSeeker,
      distToNearestHider,
    };
  }

  if (bot.alertState === 'panicking') {
    return {
      action: 'Spotted by Seeker!',
      detail: 'Frozen in place! Holding breath hoping seeker turns away.',
      icon: '🫣',
      zone,
      badgeColor: 'bg-rose-500/30 text-rose-300 border-rose-500/60 animate-pulse',
      distToSeeker,
      distToNearestHider,
    };
  }

  if (bot.alertState === 'suspicious') {
    return {
      action: 'Seeker in Proximity!',
      detail: `Seeker is ${Math.round(distToSeeker || 0)}m away! Crouching motionless.`,
      icon: '🤫',
      zone,
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      distToSeeker,
      distToNearestHider,
    };
  }

  return {
    action: 'Crouched in Shadows',
    detail: `Undetected behind cover in ${zone}.`,
    icon: '👀',
    zone,
    badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    distToSeeker,
    distToNearestHider,
  };
}

interface BotCamOverlayProps {
  characters: Character[];
  player: Character;
  camTargetId: string;
  map: GameMap;
  phase: GamePhase;
  language?: Language;
  onSelectTarget: (id: string) => void;
}

export const BotCamOverlay: React.FC<BotCamOverlayProps> = ({
  characters,
  player,
  camTargetId,
  map,
  phase,
  language = 'vi',
  onSelectTarget,
}) => {
  const isSpectatingBot = camTargetId !== 'player' && camTargetId !== player.id;
  const currentBot = characters.find((c) => c.id === camTargetId) || player;

  // List of all characters including player
  const spectateList = useMemo(() => {
    return characters.map((c) => ({
      id: c.id,
      name: c.id === player.id ? `${player.name} (${language === 'vi' ? 'BẠN' : 'YOU'})` : c.name,
      role: c.role,
      isPlayer: c.id === player.id,
      isCaught: c.isCaught,
      color: c.color,
      hidingSpotId: c.hidingSpotId,
      isInBush: c.isInBush,
      alertState: c.alertState,
    }));
  }, [characters, player, language]);

  // Current bot activity details
  const activity = useMemo(() => {
    return getBotActivity(currentBot, characters, map, phase, language as Language);
  }, [currentBot, characters, map, phase, language]);

  // Cycle navigation
  const currentIndex = spectateList.findIndex((c) => c.id === camTargetId);

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    const prevIdx = (currentIndex - 1 + spectateList.length) % spectateList.length;
    onSelectTarget(spectateList[prevIdx].id);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextIdx = (currentIndex + 1) % spectateList.length;
    onSelectTarget(spectateList[nextIdx].id);
  };

  return (
    <>
      {/* 1. Quick Bot Cam Switcher Ribbon (Always accessible at top-center) */}
      <div className="pointer-events-auto absolute top-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 bg-slate-950/85 border border-slate-700/80 backdrop-blur-md px-2.5 py-1.5 rounded-2xl shadow-2xl">
        <div className="flex items-center gap-1.5 pr-2 border-r border-slate-700 text-[11px] font-bold text-slate-300">
          <Video
            size={14}
            className={isSpectatingBot ? 'text-red-400 animate-pulse' : 'text-emerald-400'}
          />
          <span className="hidden sm:inline">Cam:</span>
        </div>

        {/* Character Quick Chips */}
        <div className="flex items-center gap-1 max-w-[280px] sm:max-w-md overflow-x-auto scrollbar-none py-0.5">
          {spectateList.map((c) => {
            const isSelected = c.id === camTargetId;
            const shortName = c.isPlayer ? 'YOU' : c.name.replace(/\[BOT\]/i, '').trim();

            let statusIcon = '●';
            if (c.isCaught) statusIcon = '💀';
            else if (c.role === 'seeker') statusIcon = '🔦';
            else if (c.hidingSpotId) statusIcon = '📦';
            else if (c.isInBush) statusIcon = '🌿';

            return (
              <button
                key={c.id}
                onClick={() => onSelectTarget(c.id)}
                title={`Follow ${c.name}`}
                className={`flex items-center gap-1 px-2 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-lg ring-1 ring-blue-400 scale-105'
                    : c.isCaught
                    ? 'bg-slate-900/60 text-slate-500 line-through hover:bg-slate-800'
                    : c.role === 'seeker'
                    ? 'bg-red-950/40 border border-red-800/40 text-red-300 hover:bg-red-900/40'
                    : 'bg-slate-900 border border-slate-700/70 text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span className="text-[10px]">{statusIcon}</span>
                <span>{shortName}</span>
                {isSelected && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                )}
              </button>
            );
          })}
        </div>

        {/* Return to player button if spectating a bot */}
        {isSpectatingBot && (
          <button
            onClick={() => onSelectTarget('player')}
            title="Return Camera to Player (Esc / Space)"
            className="flex items-center gap-1 ml-1 px-2.5 py-1 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all shadow-md active:scale-95"
          >
            <X size={12} />
            <span className="hidden md:inline">Return to You</span>
          </button>
        )}
      </div>

      {/* 2. Full Bot Spectator HUD & Viewfinder (When locked on a bot) */}
      {isSpectatingBot && (
        <div className="pointer-events-none absolute inset-0 z-20 flex flex-col justify-between p-4 md:p-8">
          {/* Subtle Viewfinder Frame Lines */}
          <div className="absolute inset-4 md:inset-8 border border-white/10 rounded-3xl pointer-events-none">
            {/* 4 Viewfinder Corners */}
            <div className="absolute -top-1 -left-1 w-6 h-6 border-t-2 border-l-2 border-emerald-400" />
            <div className="absolute -top-1 -right-1 w-6 h-6 border-t-2 border-r-2 border-emerald-400" />
            <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-2 border-l-2 border-emerald-400" />
            <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-2 border-r-2 border-emerald-400" />
          </div>

          {/* Top Info Banner */}
          <div className="pointer-events-auto self-center mt-12 bg-slate-950/90 border border-slate-700/80 backdrop-blur-md px-4 py-2 rounded-2xl shadow-2xl flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
              </span>
              <span className="text-xs font-mono font-bold tracking-widest text-red-400 uppercase">
                BOT CAM FEED
              </span>
            </div>

            <div className="h-4 w-px bg-slate-700" />

            <div className="flex items-center gap-2">
              <span
                className={`text-xs px-2 py-0.5 rounded-lg font-bold uppercase tracking-wider ${
                  currentBot.role === 'seeker'
                    ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                    : 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                }`}
              >
                {currentBot.role}
              </span>
              <span className="text-sm font-bold text-white">{currentBot.name}</span>
            </div>

            <div className="h-4 w-px bg-slate-700 hidden sm:block" />

            {/* Zone location */}
            <div className="hidden sm:flex items-center gap-1 text-xs text-slate-400">
              <MapPin size={12} className="text-sky-400" />
              <span>{activity.zone}</span>
            </div>

            {/* Quick Prev / Next Buttons */}
            <div className="flex items-center gap-1 pl-2 border-l border-slate-700">
              <button
                onClick={handlePrev}
                title="Previous character (Tab / Shift-Tab)"
                className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={handleNext}
                title="Next character (Tab)"
                className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Bottom Center: Real-Time Action Readout Card */}
          <div className="pointer-events-auto self-center mb-16 md:mb-12 max-w-lg w-full bg-slate-950/92 border border-slate-700/80 backdrop-blur-md p-3.5 rounded-2xl shadow-2xl flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">{activity.icon}</span>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                    CURRENT BOT BEHAVIOR
                  </span>
                  <span className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    {activity.action}
                  </span>
                </div>
              </div>

              {/* Stance / Activity Badge */}
              <span
                className={`text-[11px] font-mono px-2 py-0.5 rounded-md border font-semibold ${activity.badgeColor}`}
              >
                {currentBot.alertState?.toUpperCase() || 'ACTIVE'}
              </span>
            </div>

            {/* Behavior Explanation */}
            <p className="text-xs text-slate-300 leading-snug bg-slate-900/70 p-2 rounded-xl border border-slate-800">
              {activity.detail}
            </p>

            {/* Live Telemetry / Distances */}
            <div className="grid grid-cols-3 gap-2 pt-1 text-center text-xs">
              <div className="bg-slate-900/60 p-1.5 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Stamina</div>
                <div className="font-bold font-mono text-amber-300">
                  {Math.round(currentBot.stamina)}%
                </div>
              </div>

              <div className="bg-slate-900/60 p-1.5 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">
                  {currentBot.role === 'seeker' ? 'Target Dist' : 'Seeker Dist'}
                </div>
                <div className="font-bold font-mono text-rose-300">
                  {activity.distToSeeker !== null ? `${Math.round(activity.distToSeeker)}m` : 'N/A'}
                </div>
              </div>

              <div className="bg-slate-900/60 p-1.5 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Location</div>
                <div className="font-bold text-sky-300 truncate">{activity.zone}</div>
              </div>
            </div>

            {/* Keyboard Hint Footer */}
            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800">
              <span>
                Tip: Press <kbd className="px-1 py-0.5 rounded bg-slate-800 text-slate-200">TAB</kbd> to cycle bots
              </span>
              <span>
                Press <kbd className="px-1 py-0.5 rounded bg-slate-800 text-slate-200">ESC</kbd> or <kbd className="px-1 py-0.5 rounded bg-slate-800 text-slate-200">SPACE</kbd> to return to Player
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
