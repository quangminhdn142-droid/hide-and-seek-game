import React, { useState } from 'react';
import {
  X,
  User,
  ShieldCheck,
  Trophy,
  Award,
  Sparkles,
  Check,
  Target,
  Timer,
  BookOpen,
  Footprints,
  Flame,
  Shield,
  Zap,
} from 'lucide-react';
import { PlayerProfile, Language } from '../types';
import {
  DEFAULT_AVATARS,
  PLAYER_COLORS,
  PLAYER_TITLES,
  calculatePlayerRank,
  savePlayerProfile,
} from '../utils/profile';
import { RecaptchaBox } from './RecaptchaBox';
import { sound } from '../utils/sound';

interface ProfileModalProps {
  isOpen: boolean;
  profile: PlayerProfile;
  language: Language;
  onClose: () => void;
  onUpdateProfile?: (updated: PlayerProfile) => void;
  onSaveProfile?: (updated: PlayerProfile) => void;
  onOpenCaptcha: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  profile,
  language,
  onClose,
  onUpdateProfile,
  onSaveProfile,
  onOpenCaptcha,
}) => {
  const [name, setName] = useState(profile.name);
  const [selectedAvatar, setSelectedAvatar] = useState(profile.avatar);
  const [selectedColor, setSelectedColor] = useState(profile.color);
  const [selectedTitle, setSelectedTitle] = useState(profile.title);
  const [activeTab, setActiveTab] = useState<'profile' | 'stats'>('profile');

  if (!isOpen) return null;

  const isVi = language === 'vi';
  const rank = calculatePlayerRank(profile.stats);
  const winRate =
    profile.stats.matchesPlayed > 0
      ? Math.round((profile.stats.wins / profile.stats.matchesPlayed) * 100)
      : 0;

  const handleSave = () => {
    sound.playSuccessChime();
    const updated: PlayerProfile = {
      ...profile,
      name: name.trim() || 'Player 1',
      avatar: selectedAvatar,
      color: selectedColor,
      title: selectedTitle,
    };
    savePlayerProfile(updated);
    if (onUpdateProfile) onUpdateProfile(updated);
    if (onSaveProfile) onSaveProfile(updated);
    onClose();
  };

  const formatSecs = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = Math.floor(s % 60);
    const mUnit = isVi ? 'phút' : 'm';
    const sUnit = isVi ? 'giây' : 's';
    return `${mins} ${mUnit} ${secs < 10 ? '0' : ''}${secs} ${sUnit}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl p-6 md:p-8 flex flex-col gap-5 text-slate-100 my-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-lg border"
              style={{ backgroundColor: selectedColor + '25', borderColor: selectedColor }}
            >
              {selectedAvatar}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">
                  {isVi ? 'Hồ Sơ & Danh Tính' : 'Player Profile'}
                </h2>
                {profile.isHumanVerified && (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/60 text-emerald-300 text-[10px] font-extrabold shadow-sm">
                    <ShieldCheck size={12} />
                    {isVi ? 'ĐÃ XÁC MINH' : 'VERIFIED'}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                {isVi ? rank.rankTitleVi : rank.rankTitleEn} • Cấp {rank.level}
              </p>
            </div>
          </div>

          <button
            type="button"
            id="btn-close-profile-modal"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Level Progress Bar */}
        <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-300 flex items-center gap-1.5">
              <Sparkles size={14} className="text-amber-400" />
              {isVi ? `Tiến trình Cấp độ: Lv.${rank.level}` : `Level Progress: Lv.${rank.level}`}
            </span>
            <span className="font-mono text-slate-400 text-[11px]">
              {rank.currentExp} / {rank.nextExp} EXP ({rank.progress}%)
            </span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-300"
              style={{ width: `${rank.progress}%` }}
            />
          </div>
        </div>

        {/* Tab switcher: Edit Profile vs Career Stats */}
        <div className="flex items-center gap-2 p-1 bg-slate-950/60 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'profile'
                ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {isVi ? 'Tùy Chỉnh Nhân Vật' : 'Customization'}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('stats')}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'stats'
                ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {isVi ? 'Thành Tích Sự Nghiệp' : 'Career Statistics'}
          </button>
        </div>

        {activeTab === 'profile' ? (
          <div className="flex flex-col gap-4">
            {/* Nickname & Title */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {isVi ? 'Tên Nhân Vật' : 'Nickname'}
                </label>
                <input
                  type="text"
                  id="profile-name-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={16}
                  className="bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {isVi ? 'Danh Hiệu' : 'Title'}
                </label>
                <select
                  id="profile-title-select"
                  value={selectedTitle}
                  onChange={(e) => setSelectedTitle(e.target.value)}
                  className="bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-white focus:outline-none focus:border-blue-500"
                >
                  {PLAYER_TITLES.map((t) => (
                    <option key={t.id} value={isVi ? t.titleVi : t.titleEn}>
                      {isVi ? t.titleVi : t.titleEn}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Avatar Selector */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {isVi ? 'Biểu Tượng Đại Diện' : 'Avatar Icon'}
              </label>
              <div className="grid grid-cols-6 gap-2">
                {DEFAULT_AVATARS.map((av) => (
                  <button
                    key={av.id}
                    type="button"
                    onClick={() => {
                      sound.playCaptchaClick();
                      setSelectedAvatar(av.icon);
                    }}
                    title={isVi ? av.label : av.labelEn}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl border text-xl transition-all ${
                      selectedAvatar === av.icon
                        ? 'bg-blue-600/20 border-blue-400 ring-2 ring-blue-400/50 scale-105 shadow-md'
                        : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-800'
                    }`}
                  >
                    <span>{av.icon}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Theme Color Selector */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {isVi ? 'Màu Sắc Đại Diện' : 'Player Color Theme'}
              </label>
              <div className="grid grid-cols-6 gap-2">
                {PLAYER_COLORS.map((col) => (
                  <button
                    key={col.id}
                    type="button"
                    onClick={() => {
                      sound.playCaptchaClick();
                      setSelectedColor(col.color);
                    }}
                    title={isVi ? col.name : col.nameEn}
                    className={`flex items-center justify-center h-10 rounded-xl border transition-all ${
                      selectedColor === col.color
                        ? 'ring-2 ring-white scale-105 shadow-lg'
                        : 'border-transparent hover:scale-100'
                    }`}
                    style={{ backgroundColor: col.color }}
                  >
                    {selectedColor === col.color && <Check size={18} className="text-white drop-shadow" />}
                  </button>
                ))}
              </div>
            </div>

            {/* "I'm not a robot" Verification Box */}
            <div className="flex flex-col gap-2 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-blue-400" />
                  {isVi ? 'Xác thực Con Người (reCAPTCHA)' : 'Human Verification (reCAPTCHA)'}
                </label>
                {profile.isHumanVerified && (
                  <button
                    type="button"
                    onClick={onOpenCaptcha}
                    className="text-[11px] text-blue-400 hover:text-blue-300 underline font-semibold"
                  >
                    {isVi ? 'Kiểm tra lại' : 'Verify again'}
                  </button>
                )}
              </div>

              <RecaptchaBox
                isVerified={profile.isHumanVerified}
                language={language}
                onStartVerification={onOpenCaptcha}
              />
            </div>
          </div>
        ) : (
          /* Career Statistics Tab */
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col items-center text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">
                  {isVi ? 'Trận đã chơi' : 'Matches'}
                </span>
                <span className="text-xl font-bold font-mono text-white">
                  {profile.stats.matchesPlayed}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col items-center text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">
                  {isVi ? 'Tỉ lệ thắng' : 'Win Rate'}
                </span>
                <span className="text-xl font-bold font-mono text-emerald-400">
                  {winRate}%
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col items-center text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">
                  {isVi ? 'Thắng Người Trốn' : 'Hider Wins'}
                </span>
                <span className="text-xl font-bold font-mono text-blue-400">
                  {profile.stats.hiderWins}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col items-center text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">
                  {isVi ? 'Thắng Thợ Săn' : 'Seeker Wins'}
                </span>
                <span className="text-xl font-bold font-mono text-red-400">
                  {profile.stats.seekerWins}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-red-950/60 border border-red-500/30 text-red-400">
                    <Target size={16} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-200">
                      {isVi ? 'Tổng người trốn đã bắt' : 'Total Hiders Caught'}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {isVi ? 'Khi đóng vai Thợ Săn' : 'While playing as Seeker'}
                    </span>
                  </div>
                </div>
                <span className="text-lg font-mono font-extrabold text-red-400">
                  {profile.stats.hidersCaught}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-blue-950/60 border border-blue-500/30 text-blue-400">
                    <Footprints size={16} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-200">
                      {isVi ? 'Số lần tẩu thoát' : 'Successful Escapes'}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {isVi ? 'Sống sót hết giờ trốn' : 'Survived until time up'}
                    </span>
                  </div>
                </div>
                <span className="text-lg font-mono font-extrabold text-blue-400">
                  {profile.stats.timesSurvived}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-amber-950/60 border border-amber-500/30 text-amber-400">
                    <BookOpen size={16} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-200">
                      {isVi ? 'Câu đố lớp 6 đã giải' : 'Grade 6 Riddles Solved'}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {isVi ? 'Toán & Văn học mở rương' : 'Literature & Math boxes'}
                    </span>
                  </div>
                </div>
                <span className="text-lg font-mono font-extrabold text-amber-400">
                  {profile.stats.questionsSolved}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-400">
                    <Timer size={16} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-200">
                      {isVi ? 'Thời gian sống sót kỷ lục' : 'Longest Survival Time'}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {isVi ? 'Kỷ lục trong 1 trận' : 'Single match record'}
                    </span>
                  </div>
                </div>
                <span className="text-sm font-mono font-extrabold text-emerald-400">
                  {formatSecs(profile.stats.highestTimeSurvived)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2.5">
          <button
            type="button"
            id="btn-cancel-profile"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs transition-colors"
          >
            {isVi ? 'Đóng' : 'Close'}
          </button>
          <button
            type="button"
            id="btn-save-profile"
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-extrabold text-xs shadow-lg shadow-blue-900/30 transition-all flex items-center gap-1.5"
          >
            <Check size={16} strokeWidth={2.5} />
            <span>{isVi ? 'Lưu Thay Đổi' : 'Save Changes'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
