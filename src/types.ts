export type PlayerRole = 'hider' | 'seeker';

export type GamePhase = 'waiting' | 'hiding' | 'seeking' | 'ended';

export type AIDifficulty = 'easy' | 'normal' | 'hard';

export type Language = 'en' | 'vi';

export interface Position {
  x: number;
  y: number;
}

export interface Velocity {
  vx: number;
  vy: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Wall {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color?: string;
  label?: string;
}

export type HidingSpotType =
  | 'bush'
  | 'crate'
  | 'locker'
  | 'closet'
  | 'wardrobe'
  | 'recycle_bin'
  | 'question_box';

export interface HidingSpotQuestion {
  question: string;
  questionVi: string;
  options: string[];
  optionsVi: string[];
  correctIndex: number;
  hint?: string;
  hintVi?: string;
}

export interface HidingSpot {
  id: string;
  type: HidingSpotType;
  x: number;
  y: number;
  width: number;
  height: number;
  occupantId?: string; // id of character currently hiding inside
  searchedBySeekerTime?: number;
  question?: HidingSpotQuestion;
  isQuestionSolved?: boolean;
}

export interface Character {
  id: string;
  name: string;
  isBot: boolean;
  role: PlayerRole;
  color: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number; // looking angle in radians
  speed: number;
  radius: number;
  stamina: number;
  maxStamina: number;
  isSprinting: boolean;
  isCrouching: boolean;
  isCaught: boolean;
  caughtTime?: number;
  hidingSpotId?: string; // inside a crate/locker
  isInBush: boolean;
  alertState?: 'idle' | 'suspicious' | 'chasing' | 'panicking';
  alertTimer?: number;
  targetPos?: Position;
  tagCooldown: number;
  abilityCooldown: number;
  personality?: 'stealthy' | 'runner' | 'erratic' | 'hunter' | 'detective';
  emote?: { text: string; timer: number };
  speech?: { text: string; timer: number; maxTimer: number };
  stuckCounter?: number;
  inventory?: ItemType[];
  activeBuffs?: ActiveBuffs;
  stunTimer?: number;
  avatar?: string;
  isHumanVerified?: boolean;
}

export interface PlayerProfile {
  name: string;
  title: string;
  avatar: string;
  color: string;
  isHumanVerified: boolean;
  verifiedAt?: number;
  stats: {
    matchesPlayed: number;
    wins: number;
    losses: number;
    hiderWins: number;
    seekerWins: number;
    hidersCaught: number;
    timesSurvived: number;
    closeCalls: number;
    questionsSolved: number;
    highestTimeSurvived: number;
  };
}

export interface SoundRipple {
  id: string;
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  opacity: number;
  sourceRole: PlayerRole;
  isDistraction?: boolean;
}

export interface Footstep {
  x: number;
  y: number;
  angle: number;
  opacity: number;
  color: string;
  createdAt: number;
}

export interface SmokeCloud {
  x: number;
  y: number;
  radius: number;
  opacity: number;
  createdAt: number;
  duration: number;
}

export interface ChatMessage {
  id: string;
  senderName: string;
  senderRole: PlayerRole;
  text: string;
  time: string;
  isSystem?: boolean;
  stance?: 'agree' | 'disagree' | 'neutral';
}

export interface MapZone {
  name: string;
  nameVi?: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface GameMap {
  id: string;
  name: string;
  nameVi?: string;
  description: string;
  descriptionVi?: string;
  width: number;
  height: number;
  hiderSpawn: Position;
  seekerSpawn: Position;
  walls: Wall[];
  hidingSpots: HidingSpot[];
  zones?: MapZone[];
  theme: {
    background: string;
    floorTile: string;
    wallColor: string;
    ambientLight: number; // 0 to 1
  };
}

export interface GameStats {
  timeSurvived: number;
  hidersCaught: number;
  totalHiders: number;
  closeCalls: number;
  distractionsUsed: number;
  won: boolean;
  role: PlayerRole;
}

export type ItemType =
  | 'invisibility'
  | 'decoy'
  | 'stun_trap'
  | 'thermal_scanner'
  | 'speed_boost';

export interface WorldItem {
  id: string;
  type: ItemType;
  x: number;
  y: number;
  name: string;
  description: string;
  icon: string;
  color: string;
  spawnTime: number;
}

export interface ActiveTrap {
  id: string;
  x: number;
  y: number;
  placedByCharId: string;
  placedByRole: PlayerRole;
  createdAt: number;
  triggered?: boolean;
}

export interface ActiveDecoy {
  id: string;
  x: number;
  y: number;
  createdAt: number;
  duration: number;
  lastPulseTime: number;
}

export interface ActiveBuffs {
  invisibilityTimeLeft?: number;
  thermalTimeLeft?: number;
  speedBoostTimeLeft?: number;
}

