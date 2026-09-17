import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Skull, RotateCcw, Sliders, Timer, Target, Zap, Shield, ShieldCheck, User } from 'lucide-react';
import { GameStats, Language, PlayerProfile } from '../types';
import { TRANSLATIONS } from '../utils/i18n';
import { calculatePlayerRank } from '../utils/profile';

interface GameOverModalProps {
  stats: GameStats | null;
  language: Language;
  profile?: PlayerProfile;
  onOpenProfile?: () => void;
  onPlayAgain: () => void;
  onOpenLobby: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  stats,
  language,
  profile,
  onOpenProfile,
  onPlayAgain,
  onOpenLobby,
}) => {
  useEffect(() => {
    if (stats?.won) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }, [stats]);

  if (!stats) return null;

  const t = TRANSLATIONS[language];

  const formatSecs = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = Math.floor(s % 60);
    const mUnit = language === 'vi' ? 'ph' : 'm';
    const sUnit = language === 'vi' ? 'gi' : 's';
    return `${mins}${mUnit} ${secs < 10 ? '0' : ''}${secs}${sUnit}`;
  };

  const getSubtext = () => {
    if (stats.role === 'hider') {
      return stats.won ? t.hiderWonDesc : t.hiderLostDesc;
    }
    return stats.won ? t.seekerWonDesc : t.seekerLostDesc;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl p-6 md:p-8 flex flex-col items-center text-center text-slate-100 my-auto animate-in fade-in zoom-in duration-200">
        {/* Victory/Defeat Icon Banner */}
        <div
          className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-4 shadow-xl ${
            stats.won
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              : 'bg-red-500/20 text-red-400 border border-red-500/30'
          }`}
        >
          {stats.won ? <Trophy size={42} /> : <Skull size={42} />}
        </div>

        {/* Title */}
        <h2 className="text-3xl font-black tracking-tight text-white mb-1">
          {stats.won ? t.victoryTitle : t.defeatTitle}
        </h2>

        <p className="text-sm text-slate-400 mb-6">
          {getSubtext()}
        </p>

        {/* Match Stats Grid */}
        <div className="grid grid-cols-2 gap-3 w-full mb-6">
          <div className="flex flex-col items-center bg-slate-950/60 border border-slate-800 p-3 rounded-2xl">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold mb-1">
              <Timer size={14} className="text-blue-400" /> {t.statTimeSurvived}
            </div>
            <span className="text-lg font-mono font-bold text-white">
              {formatSecs(stats.timeSurvived)}
            </span>
          </div>

          <div className="flex flex-col items-center bg-slate-950/60 border border-slate-800 p-3 rounded-2xl">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold mb-1">
              <Target size={14} className="text-red-400" /> {t.statHidersCaught}
            </div>
            <span className="text-lg font-mono font-bold text-white">
              {stats.hidersCaught} / {stats.totalHiders}
            </span>
          </div>

          <div className="flex flex-col items-center bg-slate-950/60 border border-slate-800 p-3 rounded-2xl">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold mb-1">
              <Shield size={14} className="text-emerald-400" /> {t.statCloseCalls}
            </div>
            <span className="text-lg font-mono font-bold text-white">
              {stats.closeCalls}
            </span>
          </div>

          <div className="flex flex-col items-center bg-slate-950/60 border border-slate-800 p-3 rounded-2xl">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold mb-1">
              <Zap size={14} className="text-amber-400" /> {t.statAbilitiesUsed}
            </div>
            <span className="text-lg font-mono font-bold text-white">
              {stats.distractionsUsed}
            </span>
          </div>
        </div>

        {/* Player Profile & Verified Status Banner */}
        {profile && (
          <div className="w-full mb-5 p-3 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow"
                style={{ backgroundColor: profile.color + '25', borderColor: profile.color }}
              >
                {profile.avatar}
              </div>
              <div className="flex flex-col text-left">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-white">{profile.name}</span>
                  {profile.isHumanVerified && (
                    <span className="flex items-center gap-0.5 text-[10px] text-emerald-400 font-extrabold bg-emerald-950/80 px-1.5 py-0.5 rounded-full border border-emerald-500/40">
                      <ShieldCheck size={11} />
                      <span>{language === 'vi' ? 'CON NGƯỜI' : 'HUMAN'}</span>
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-slate-400">
                  {language === 'vi'
                    ? calculatePlayerRank(profile.stats).rankTitleVi
                    : calculatePlayerRank(profile.stats).rankTitleEn}{' '}
                  • Lv.{calculatePlayerRank(profile.stats).level}
                </span>
              </div>
            </div>

            {onOpenProfile && (
              <button
                type="button"
                id="btn-gameover-profile"
                onClick={onOpenProfile}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold border border-slate-700 flex items-center gap-1 transition-colors"
              >
                <User size={13} />
                <span>{language === 'vi' ? 'Hồ Sơ' : 'Profile'}</span>
              </button>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <button
            type="button"
            id="btn-play-again"
            onClick={onPlayAgain}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-bold py-3.5 px-5 rounded-2xl shadow-xl transition-all text-sm"
          >
            <RotateCcw size={16} />
            <span>{t.playAgain}</span>
          </button>

          <button
            type="button"
            id="btn-open-lobby"
            onClick={onOpenLobby}
            className="flex-1 flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-750 active:scale-95 border border-slate-700 text-slate-200 hover:text-white font-bold py-3.5 px-5 rounded-2xl transition-all text-sm"
          >
            <Sliders size={16} />
            <span>{t.lobbySettings}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
