import { PlayerProfile, GameStats } from '../types';

const PROFILE_STORAGE_KEY = 'hide_and_seek_player_profile';

export const DEFAULT_AVATARS = [
  { id: 'detective', icon: '🕵️', label: 'Thám tử', labelEn: 'Detective' },
  { id: 'ninja', icon: '🥷', label: 'Ninja bóng đêm', labelEn: 'Shadow Ninja' },
  { id: 'ghost', icon: '👻', label: 'Bóng ma', labelEn: 'Spectre' },
  { id: 'robot_imposter', icon: '🤖', label: 'Người máy ngụy trang', labelEn: 'Disguised Bot' },
  { id: 'cat', icon: '🐱', label: 'Mèo đêm', labelEn: 'Night Cat' },
  { id: 'fox', icon: '🦊', label: 'Cáo tinh ranh', labelEn: 'Sneaky Fox' },
  { id: 'student', icon: '🎒', label: 'Học sinh lớp 6', labelEn: 'Grade 6 Student' },
  { id: 'speedster', icon: '⚡', label: 'Tia chớp', labelEn: 'Speedster' },
  { id: 'secret_agent', icon: '🕶️', label: 'Điệp viên', labelEn: 'Secret Agent' },
  { id: 'gamer', icon: '🎮', label: 'Game thủ', labelEn: 'Pro Gamer' },
  { id: 'wizard', icon: '🧙', label: 'Phù thủy ẩn thân', labelEn: 'Stealth Mage' },
  { id: 'alien', icon: '👾', label: 'Sinh vật lạ', labelEn: 'Cyber Entity' },
];

export const PLAYER_COLORS = [
  { id: 'blue', color: '#3b82f6', name: 'Lam Điện', nameEn: 'Electric Blue' },
  { id: 'emerald', color: '#10b981', name: 'Lục Bảo', nameEn: 'Emerald Green' },
  { id: 'violet', color: '#8b5cf6', name: 'Tím Huyền Bí', nameEn: 'Mystic Violet' },
  { id: 'amber', color: '#f59e0b', name: 'Hổ Phách', nameEn: 'Amber Gold' },
  { id: 'rose', color: '#f43f5e', name: 'Đỏ Ruby', nameEn: 'Ruby Rose' },
  { id: 'cyan', color: '#06b6d4', name: 'Xanh Neon', nameEn: 'Neon Cyan' },
];

export const PLAYER_TITLES = [
  { id: 'novice', titleVi: 'Tập sự trốn tìm', titleEn: 'Novice Hider' },
  { id: 'human', titleVi: 'Con người đích thực 100%', titleEn: '100% Certified Human' },
  { id: 'grade6', titleVi: 'Thám tử tri thức lớp 6', titleEn: 'Grade 6 Intellect' },
  { id: 'phantom', titleVi: 'Bóng ma vô hình', titleEn: 'Invisible Phantom' },
  { id: 'hunter_bane', titleVi: 'Khắc tinh thợ săn', titleEn: 'Hunter\'s Nightmare' },
  { id: 'shadow_master', titleVi: 'Bậc thầy ẩn nấp', titleEn: 'Master of Shadows' },
  { id: 'eagle_eye', titleVi: 'Mắt đại bàng tầm nhiệt', titleEn: 'Eagle Eye Tracker' },
  { id: 'speed_demon', titleVi: 'Vua tốc độ tẩu thoát', titleEn: 'Speed Demon' },
];

export const INITIAL_PROFILE: PlayerProfile = {
  name: 'Player 1',
  title: 'Con người đích thực 100%',
  avatar: '🕵️',
  color: '#3b82f6',
  isHumanVerified: false,
  stats: {
    matchesPlayed: 0,
    wins: 0,
    losses: 0,
    hiderWins: 0,
    seekerWins: 0,
    hidersCaught: 0,
    timesSurvived: 0,
    closeCalls: 0,
    questionsSolved: 0,
    highestTimeSurvived: 0,
  },
};

export function loadPlayerProfile(): PlayerProfile {
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...INITIAL_PROFILE,
        ...parsed,
        stats: {
          ...INITIAL_PROFILE.stats,
          ...(parsed.stats || {}),
        },
      };
    }
  } catch (err) {
    console.warn('Failed to load profile:', err);
  }
  return INITIAL_PROFILE;
}

export function savePlayerProfile(profile: PlayerProfile): void {
  try {
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
  } catch (err) {
    console.warn('Failed to save profile:', err);
  }
}

export function recordMatchResult(stats: GameStats, questionsSolvedCount: number = 0): PlayerProfile {
  const current = loadPlayerProfile();
  const isWon = stats.won;

  const nextStats = {
    matchesPlayed: current.stats.matchesPlayed + 1,
    wins: current.stats.wins + (isWon ? 1 : 0),
    losses: current.stats.losses + (isWon ? 0 : 1),
    hiderWins: current.stats.hiderWins + (stats.role === 'hider' && isWon ? 1 : 0),
    seekerWins: current.stats.seekerWins + (stats.role === 'seeker' && isWon ? 1 : 0),
    hidersCaught: current.stats.hidersCaught + stats.hidersCaught,
    timesSurvived: current.stats.timesSurvived + (stats.role === 'hider' && isWon ? 1 : 0),
    closeCalls: current.stats.closeCalls + stats.closeCalls,
    questionsSolved: current.stats.questionsSolved + questionsSolvedCount,
    highestTimeSurvived: Math.max(current.stats.highestTimeSurvived, stats.timeSurvived),
  };

  const updated: PlayerProfile = {
    ...current,
    stats: nextStats,
  };

  savePlayerProfile(updated);
  return updated;
}

export function calculatePlayerRank(stats: PlayerProfile['stats']) {
  const score =
    stats.wins * 150 +
    stats.hidersCaught * 60 +
    stats.timesSurvived * 90 +
    stats.questionsSolved * 40 +
    stats.closeCalls * 25;

  const level = Math.max(1, Math.floor(score / 200) + 1);
  const currentExp = score % 200;
  const nextExp = 200;
  const progress = Math.min(100, Math.round((currentExp / nextExp) * 100));

  let rankTitleVi = 'Tân Binh Trốn Tìm';
  let rankTitleEn = 'Rookie Scout';

  if (level >= 15) {
    rankTitleVi = 'Huyền Thoại Bóng Ma';
    rankTitleEn = 'Phantom Legend';
  } else if (level >= 10) {
    rankTitleVi = 'Thống Lĩnh Chiến Trường';
    rankTitleEn = 'Arena Overlord';
  } else if (level >= 6) {
    rankTitleVi = 'Chuyên Gia Tàng Hình';
    rankTitleEn = 'Stealth Specialist';
  } else if (level >= 3) {
    rankTitleVi = 'Thám Tử Lớp 6 Kỳ Cựu';
    rankTitleEn = 'Veteran Detective';
  }

  return {
    level,
    score,
    currentExp,
    nextExp,
    progress,
    rankTitleVi,
    rankTitleEn,
  };
}
