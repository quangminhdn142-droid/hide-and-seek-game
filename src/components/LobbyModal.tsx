import React, { useState, useEffect } from 'react';
import { Shield, Search, Users, Cpu, Play, CheckCircle2, MapPin, Clock, Globe, X, RotateCcw, Check, ShieldCheck, User } from 'lucide-react';
import { AIDifficulty, GameMap, PlayerRole, Language, PlayerProfile } from '../types';
import { MAPS } from '../data/maps';
import { TRANSLATIONS } from '../utils/i18n';
import { RecaptchaBox } from './RecaptchaBox';

interface LobbyModalProps {
  isOpen: boolean;
  playerName: string;
  selectedRole: PlayerRole;
  selectedMap: GameMap;
  botCount: number;
  seekerCount: number;
  difficulty: AIDifficulty;
  matchDuration: number;
  language: Language;
  isGameActive?: boolean;
  profile?: PlayerProfile;
  onOpenProfile?: () => void;
  onOpenCaptcha?: () => void;
  onClose?: () => void;
  onUpdateName: (name: string) => void;
  onSelectRole: (role: PlayerRole) => void;
  onSelectMap: (map: GameMap) => void;
  onSelectBotCount: (count: number) => void;
  onSelectSeekerCount: (count: number) => void;
  onSelectDifficulty: (diff: AIDifficulty) => void;
  onSelectDuration: (duration: number) => void;
  onSelectLanguage: (lang: Language) => void;
  onStartMatch: () => void;
}

export const LobbyModal: React.FC<LobbyModalProps> = ({
  isOpen,
  playerName,
  selectedRole,
  selectedMap,
  botCount,
  seekerCount,
  difficulty,
  matchDuration,
  language,
  isGameActive = false,
  profile,
  onOpenProfile,
  onOpenCaptcha,
  onClose,
  onUpdateName,
  onSelectRole,
  onSelectMap,
  onSelectBotCount,
  onSelectSeekerCount,
  onSelectDifficulty,
  onSelectDuration,
  onSelectLanguage,
  onStartMatch,
}) => {
  const [durationInput, setDurationInput] = useState<string>(String(matchDuration));

  useEffect(() => {
    setDurationInput(String(matchDuration));
  }, [matchDuration]);

  if (!isOpen) return null;

  const t = TRANSLATIONS[language];

  // Helper description for team distribution (strictly 1 to 2 seekers)
  const getTeamComposition = () => {
    const seekers = Math.max(1, Math.min(2, seekerCount));
    const hiders = botCount + 1 - seekers;

    if (language === 'vi') {
      return `${seekers} Thợ Săn vs ${hiders} Người Trốn`;
    }
    return `${seekers} Seekers vs ${hiders} Hiders`;
  };

  const getMapTitle = (m: GameMap) => {
    if (language === 'vi') {
      if (m.nameVi) return m.nameVi;
      if (m.id === 'warehouse') return t.mapWarehouseTitle;
      if (m.id === 'manor') return t.mapManorTitle;
      if (m.id === 'cyber_facility') return t.mapCyberTitle;
    }
    if (m.id === 'warehouse') return t.mapWarehouseTitle;
    if (m.id === 'manor') return t.mapManorTitle;
    if (m.id === 'cyber_facility') return t.mapCyberTitle;
    return m.name;
  };

  const getMapDesc = (m: GameMap) => {
    if (language === 'vi') {
      if (m.descriptionVi) return m.descriptionVi;
      if (m.id === 'warehouse') return t.mapWarehouseDesc;
      if (m.id === 'manor') return t.mapManorDesc;
      if (m.id === 'cyber_facility') return t.mapCyberDesc;
    }
    if (m.id === 'warehouse') return t.mapWarehouseDesc;
    if (m.id === 'manor') return t.mapManorDesc;
    if (m.id === 'cyber_facility') return t.mapCyberDesc;
    return m.description;
  };

  const getMapBadge = (mapId: string) => {
    if (mapId === 'warehouse') {
      return { icon: '🏭', badge: language === 'vi' ? 'Kho Bãi & Thùng Gỗ' : 'Cargo & Crates', color: 'text-amber-400 border-amber-500/40 bg-amber-950/40' };
    }
    if (mapId === 'manor') {
      return { icon: '🏰', badge: language === 'vi' ? 'Dinh Thự & Tủ Áo' : 'Manor & Wardrobes', color: 'text-purple-400 border-purple-500/40 bg-purple-950/40' };
    }
    return { icon: '🔬', badge: language === 'vi' ? 'Lõi Công Nghệ Cao' : 'Cybernetic Facility', color: 'text-cyan-400 border-cyan-500/40 bg-cyan-950/40' };
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl p-6 md:p-8 flex flex-col gap-6 text-slate-100 my-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-4 gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                {t.matchmakingSubtitle}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white mt-1">
              {t.gameTitle}
            </h1>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {/* Language Selector */}
            <div className="flex items-center gap-1 bg-slate-950/80 border border-slate-700 p-1 rounded-2xl shadow-inner">
              <button
                type="button"
                id="btn-lang-en"
                onClick={() => onSelectLanguage('en')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  language === 'en'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-900/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>🇬🇧</span>
                <span>English</span>
              </button>
              <button
                type="button"
                id="btn-lang-vi"
                onClick={() => onSelectLanguage('vi')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  language === 'vi'
                    ? 'bg-red-600 text-white shadow-md shadow-red-900/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>🇻🇳</span>
                <span>Tiếng Việt</span>
              </button>
            </div>

            {/* Profile Button */}
            {onOpenProfile && profile && (
              <button
                type="button"
                id="btn-lobby-open-profile"
                onClick={onOpenProfile}
                className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-xs font-bold transition-all text-slate-200 hover:text-white group"
                title={language === 'vi' ? 'Xem hồ sơ & tùy chỉnh danh tính' : 'View profile & customize'}
              >
                <span className="text-base group-hover:scale-110 transition-transform">{profile.avatar}</span>
                <div className="flex flex-col text-left">
                  <div className="flex items-center gap-1">
                    <span className="truncate max-w-[85px] text-white font-bold">{playerName || profile.name}</span>
                    {profile.isHumanVerified && (
                      <ShieldCheck size={13} className="text-emerald-400 shrink-0" />
                    )}
                  </div>
                  <span className="text-[9px] text-slate-400 font-normal">
                    {language === 'vi' ? 'Hồ sơ' : 'Profile'}
                  </span>
                </div>
              </button>
            )}

            {/* Total Players Badge */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-300">
              <Users size={14} className="text-blue-400" />
              <span>{t.playersCount.replace('{count}', String(botCount + 1))}</span>
            </div>

            {/* Close Button if game is active or onClose provided */}
            {onClose && (
              <button
                type="button"
                id="btn-close-lobby"
                onClick={onClose}
                className="p-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
                title={language === 'vi' ? 'Đóng / Tiếp tục chơi' : 'Close / Resume'}
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Player Profile & Role */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Name input */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {t.playerNickname}
              </label>
              {onOpenProfile && (
                <button
                  type="button"
                  id="btn-edit-profile-link"
                  onClick={onOpenProfile}
                  className="text-xs text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1"
                >
                  <User size={13} />
                  <span>{language === 'vi' ? 'Hồ sơ nhân vật' : 'Player profile'}</span>
                </button>
              )}
            </div>
            <div className="relative flex items-center">
              {profile && (
                <span className="absolute left-3 text-lg select-none pointer-events-none">
                  {profile.avatar}
                </span>
              )}
              <input
                id="input-player-name"
                type="text"
                value={playerName}
                onChange={(e) => onUpdateName(e.target.value)}
                maxLength={16}
                placeholder={t.enterHandle}
                className={`w-full bg-slate-950 border border-slate-700 rounded-xl ${
                  profile ? 'pl-10 pr-3.5' : 'px-3.5'
                } py-2.5 text-sm font-semibold text-white focus:outline-none focus:border-blue-500 transition-colors`}
              />
            </div>
          </div>

          {/* Role selector */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {t.chooseRole}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                id="btn-role-hider"
                onClick={() => onSelectRole('hider')}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                  selectedRole === 'hider'
                    ? 'bg-blue-600 text-white border-blue-400 shadow-lg shadow-blue-900/40'
                    : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-750'
                }`}
              >
                <Shield size={16} />
                <span>{t.playAsHider}</span>
              </button>

              <button
                type="button"
                id="btn-role-seeker"
                onClick={() => onSelectRole('seeker')}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                  selectedRole === 'seeker'
                    ? 'bg-red-600 text-white border-red-400 shadow-lg shadow-red-900/40'
                    : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-750'
                }`}
              >
                <Search size={16} />
                <span>{t.playAsSeeker}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Human Verification (I'm not a robot) Box */}
        {onOpenCaptcha && (
          <div className="flex flex-col gap-1.5 p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-bold uppercase tracking-wider flex items-center gap-1.5 text-slate-300">
                <ShieldCheck size={14} className="text-blue-400" />
                {language === 'vi'
                  ? 'Xác minh Con Người (Tôi không phải là người máy)'
                  : 'Human Verification (I\'m not a robot)'}
              </span>
              {profile?.isHumanVerified && (
                <span className="text-emerald-400 font-bold text-[11px] flex items-center gap-1">
                  <Check size={13} />
                  {language === 'vi' ? 'Đã xác minh' : 'Verified'}
                </span>
              )}
            </div>
            <RecaptchaBox
              isVerified={profile?.isHumanVerified ?? false}
              language={language}
              onStartVerification={onOpenCaptcha}
            />
          </div>
        )}

        {/* Dedicated Language Section */}
        <div className="flex flex-col gap-2 p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Globe size={14} className="text-emerald-400" />
              {language === 'vi' ? 'Ngôn Ngữ & Giọng Bot AI' : 'Language & Bot AI Voice'}
            </label>
            <span className="text-[11px] font-bold text-slate-400">
              {language === 'vi' ? '🇻🇳 Đang chọn: Tiếng Việt' : '🇬🇧 Current: English'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              type="button"
              id="lobby-lang-vi"
              onClick={() => onSelectLanguage('vi')}
              className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${
                language === 'vi'
                  ? 'bg-red-950/40 border-red-500 ring-2 ring-red-500/30 shadow-lg shadow-red-950/50'
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="text-2xl">🇻🇳</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-bold ${language === 'vi' ? 'text-white' : 'text-slate-300'}`}>
                    Tiếng Việt (Vietnamese)
                  </span>
                  {language === 'vi' && <CheckCircle2 size={16} className="text-red-400 flex-shrink-0" />}
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                  Hội thoại bot AI, thử thách Toán & Ngữ văn lớp 6, radio chiến thuật và toàn bộ giao diện tiếng Việt
                </p>
              </div>
            </button>

            <button
              type="button"
              id="lobby-lang-en"
              onClick={() => onSelectLanguage('en')}
              className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${
                language === 'en'
                  ? 'bg-blue-950/40 border-blue-500 ring-2 ring-blue-500/30 shadow-lg shadow-blue-950/50'
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="text-2xl">🇬🇧</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-bold ${language === 'en' ? 'text-white' : 'text-slate-300'}`}>
                    English (Tiếng Anh)
                  </span>
                  {language === 'en' && <CheckCircle2 size={16} className="text-blue-400 flex-shrink-0" />}
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                  All bot banter, Grade 6 math & literature quiz spots, radio whispers, and UI in English
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Map Selection */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <MapPin size={13} /> {t.selectArenaMap}
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {MAPS.map((m) => {
              const isSelected = m.id === selectedMap.id;
              const badgeInfo = getMapBadge(m.id);
              return (
                <button
                  key={m.id}
                  type="button"
                  id={`map-select-${m.id}`}
                  onClick={() => onSelectMap(m)}
                  className={`flex flex-col text-left p-3.5 rounded-2xl border transition-all ${
                    isSelected
                      ? 'bg-slate-800 border-blue-500 ring-2 ring-blue-500/40 shadow-lg shadow-blue-950/40'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${badgeInfo.color}`}>
                      <span>{badgeInfo.icon}</span>
                      <span>{badgeInfo.badge}</span>
                    </span>
                    {isSelected && <CheckCircle2 size={16} className="text-blue-400 flex-shrink-0" />}
                  </div>
                  <span className="font-bold text-sm text-white">{getMapTitle(m)}</span>
                  <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                    {getMapDesc(m)}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Match Settings: Bot Count, Difficulty, Duration */}
        <div className="flex flex-col gap-4 pt-1">
          {/* Bot Count & Player Scale (Up to 24 Players!) */}
          <div className="flex flex-col gap-2 p-3 rounded-2xl bg-slate-950/40 border border-slate-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
                <Users size={14} className="text-blue-400" /> {t.botCount} ({botCount + 1} {language === 'vi' ? 'người chơi' : 'players total'})
              </label>
              <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/70 border border-emerald-800/60 px-2.5 py-0.5 rounded-md">
                {getTeamComposition()}
              </span>
            </div>

            {/* Quick buttons */}
            <div className="grid grid-cols-3 sm:grid-cols-9 gap-1.5">
              {[3, 5, 7, 9, 11, 14, 17, 20, 23].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => onSelectBotCount(num)}
                  className={`py-2 rounded-xl border text-xs font-bold transition-all flex flex-col items-center justify-center gap-0.5 ${
                    botCount === num
                      ? 'bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-900/30'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <span className="text-sm font-black text-white">{num + 1}</span>
                  <span className="text-[10px] opacity-75">
                    {language === 'vi' ? `${num} Bot` : `${num} Bots`}
                  </span>
                </button>
              ))}
            </div>

            {/* Slider for fine adjustment */}
            <div className="flex items-center gap-3 pt-1">
              <span className="text-[11px] font-semibold text-slate-500">4</span>
              <input
                id="slider-bot-count"
                type="range"
                min={3}
                max={23}
                step={1}
                value={botCount}
                onChange={(e) => onSelectBotCount(Number(e.target.value))}
                className="w-full accent-blue-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
              <span className="text-[11px] font-semibold text-slate-500">24</span>
            </div>
          </div>

          {/* Row 1: Seeker Count & Bot Intelligence side-by-side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Seeker Count Control (strictly 1 or 2 seekers) */}
            <div className="flex flex-col gap-1.5 p-3 bg-slate-950/60 rounded-2xl border border-slate-800">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
                <Search size={14} className="text-red-400" />
                {language === 'vi' ? 'Số Thợ Săn (1 - 2)' : 'Seekers (1 - 2)'}
              </label>
              <div className="flex gap-1.5 pt-1">
                {[1, 2].map((cnt) => (
                  <button
                    key={cnt}
                    type="button"
                    onClick={() => onSelectSeekerCount(cnt)}
                    className={`flex-1 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                      seekerCount === cnt
                        ? 'bg-red-600 text-white border-red-400 shadow-md shadow-red-900/40'
                        : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {cnt === 1
                      ? language === 'vi'
                        ? '1 Thợ Săn'
                        : '1 Seeker'
                      : language === 'vi'
                      ? '2 Thợ Săn'
                      : '2 Seekers'}
                  </button>
                ))}
              </div>
            </div>

            {/* AI Difficulty */}
            <div className="flex flex-col gap-1.5 p-3 bg-slate-950/60 rounded-2xl border border-slate-800">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
                <Cpu size={14} className="text-amber-400" /> {t.botIntelligence}
              </label>
              <div className="flex gap-1.5 pt-1">
                {(['easy', 'normal', 'hard'] as AIDifficulty[]).map((diff) => (
                  <button
                    key={diff}
                    type="button"
                    onClick={() => onSelectDifficulty(diff)}
                    className={`flex-1 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                      difficulty === diff
                        ? 'bg-slate-700 text-white border-amber-400 shadow-sm'
                        : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {diff === 'easy' ? t.easy : diff === 'normal' ? t.normal : t.hard}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Row 2: Match Duration Edit Section placed right underneath Seeker & Bot Intelligence */}
          <div className="flex flex-col gap-2.5 p-3.5 bg-slate-950/70 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
                <Clock size={14} className="text-sky-400" /> {t.matchTime}
              </label>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-extrabold text-sky-400 bg-sky-950/70 border border-sky-800/80 px-2.5 py-0.5 rounded-lg">
                  {Math.floor(matchDuration / 60)}m {matchDuration % 60 ? `${matchDuration % 60}s` : '00s'}
                </span>
                <span className="text-[11px] font-mono font-bold text-slate-400">
                  ({matchDuration}s)
                </span>
              </div>
            </div>

            {/* Direct Numerical Time Edit with Quick Stepper Buttons */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                id="btn-dur-minus-30"
                onClick={() => {
                  const next = Math.max(15, matchDuration - 30);
                  onSelectDuration(next);
                  setDurationInput(String(next));
                }}
                className="px-2.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all border border-slate-700"
                title="-30s"
              >
                -30s
              </button>
              <button
                type="button"
                id="btn-dur-minus-15"
                onClick={() => {
                  const next = Math.max(15, matchDuration - 15);
                  onSelectDuration(next);
                  setDurationInput(String(next));
                }}
                className="px-2.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all border border-slate-700"
                title="-15s"
              >
                -15s
              </button>

              {/* Direct Number Input */}
              <div className="flex-1 relative flex items-center">
                <input
                  id="input-match-duration"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={durationInput}
                  onChange={(e) => {
                    const text = e.target.value.replace(/[^0-9]/g, '');
                    setDurationInput(text);
                    const parsed = parseInt(text, 10);
                    if (!isNaN(parsed) && parsed >= 15 && parsed <= 1800) {
                      onSelectDuration(parsed);
                    }
                  }}
                  onBlur={() => {
                    const parsed = parseInt(durationInput, 10);
                    if (isNaN(parsed) || parsed < 15) {
                      onSelectDuration(15);
                      setDurationInput('15');
                    } else if (parsed > 1800) {
                      onSelectDuration(1800);
                      setDurationInput('1800');
                    } else {
                      onSelectDuration(parsed);
                      setDurationInput(String(parsed));
                    }
                  }}
                  onKeyDown={(e) => {
                    e.stopPropagation();
                    if (e.key === 'Enter') {
                      (e.target as HTMLInputElement).blur();
                    }
                  }}
                  className="w-full bg-slate-900 border border-slate-700 focus:border-sky-400 rounded-xl px-3 py-2 text-center font-mono font-bold text-white text-sm focus:outline-none focus:ring-1 focus:ring-sky-400"
                  placeholder="Giây / Seconds"
                />
                <span className="absolute right-3 text-[11px] font-bold text-slate-400 pointer-events-none">
                  giây / s
                </span>
              </div>

              <button
                type="button"
                id="btn-dur-plus-15"
                onClick={() => {
                  const next = Math.min(1800, matchDuration + 15);
                  onSelectDuration(next);
                  setDurationInput(String(next));
                }}
                className="px-2.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all border border-slate-700"
                title="+15s"
              >
                +15s
              </button>
              <button
                type="button"
                id="btn-dur-plus-30"
                onClick={() => {
                  const next = Math.min(1800, matchDuration + 30);
                  onSelectDuration(next);
                  setDurationInput(String(next));
                }}
                className="px-2.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all border border-slate-700"
                title="+30s"
              >
                +30s
              </button>
            </div>

            {/* Wide Range Slider (15s to 900s / 15 mins) */}
            <input
              id="slider-match-duration"
              type="range"
              min={15}
              max={900}
              step={15}
              value={matchDuration}
              onChange={(e) => {
                const val = Number(e.target.value);
                onSelectDuration(val);
                setDurationInput(String(val));
              }}
              className="w-full accent-sky-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
            />

            {/* Quick Presets */}
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-1 pt-1">
              {[30, 60, 90, 120, 180, 240, 300, 600].map((dur) => {
                const mins = dur / 60;
                return (
                  <button
                    key={dur}
                    type="button"
                    onClick={() => {
                      onSelectDuration(dur);
                      setDurationInput(String(dur));
                    }}
                    className={`py-1.5 rounded-xl border text-[11px] font-bold transition-all flex flex-col items-center justify-center ${
                      matchDuration === dur
                        ? 'bg-sky-600 text-white border-sky-400 shadow-sm'
                        : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span>{dur}s</span>
                    <span className="text-[8px] opacity-75">{mins >= 1 ? `${mins}m` : `${dur}s`}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Action Buttons (Resume Match or Launch New Match) */}
        <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-400 font-medium">
            {isGameActive
              ? language === 'vi'
                ? '⚡ Trận đấu đang diễn ra. Thay đổi thời gian sẽ cập nhật trực tiếp!'
                : '⚡ Match in progress. Time changes update in real-time!'
              : language === 'vi'
              ? 'Tùy chỉnh thời gian, vai trò và bắt đầu trận đấu trốn tìm.'
              : 'Configure match time, roles, and launch hide and seek.'}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {isGameActive && onClose ? (
              <>
                <button
                  type="button"
                  id="btn-restart-match"
                  onClick={onStartMatch}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-4 py-2.5 rounded-xl border border-slate-700 transition-all text-sm"
                >
                  <RotateCcw size={16} />
                  <span>{language === 'vi' ? 'Trận mới' : 'New Match'}</span>
                </button>
                <button
                  type="button"
                  id="btn-resume-match"
                  onClick={onClose}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold px-6 py-2.5 rounded-xl shadow-lg shadow-emerald-900/30 transition-all text-sm"
                >
                  <Check size={16} />
                  <span>{language === 'vi' ? 'Tiếp tục chơi' : 'Resume Match'}</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                id="btn-start-match"
                onClick={onStartMatch}
                className="w-full sm:w-auto flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-95 text-white font-extrabold px-8 py-3 rounded-2xl shadow-xl shadow-blue-900/30 transition-all text-base tracking-wide"
              >
                <Play size={18} fill="currentColor" />
                <span>{t.launchMatch}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
