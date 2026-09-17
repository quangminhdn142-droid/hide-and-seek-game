import React, { useState } from 'react';
import { RefreshCw, ShieldCheck, AlertCircle, Check, Sparkles, X, Info } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sound } from '../utils/sound';
import { Language } from '../types';

export interface CaptchaChallenge {
  id: string;
  promptVi: string;
  promptEn: string;
  subPromptVi: string;
  subPromptEn: string;
  tiles: {
    id: string;
    icon: string;
    nameVi: string;
    nameEn: string;
    isTarget: boolean;
    bgGradient: string;
  }[];
}

const CHALLENGES: CaptchaChallenge[] = [
  {
    id: 'hiding_spots',
    promptVi: 'Chọn tất cả các ô có CHỖ TRỐN',
    promptEn: 'Select all squares with HIDING SPOTS',
    subPromptVi: 'Thùng gỗ, Bụi rậm, Tủ sắt hoặc Tủ quần áo',
    subPromptEn: 'Crates, Bushes, Lockers or Wardrobes',
    tiles: [
      { id: '1', icon: '📦', nameVi: 'Thùng Gỗ Lớn', nameEn: 'Storage Crate', isTarget: true, bgGradient: 'from-amber-900/60 to-yellow-950/40' },
      { id: '2', icon: '🤖', nameVi: 'Robot Thợ Săn', nameEn: 'Seeker Bot', isTarget: false, bgGradient: 'from-red-950/60 to-slate-900/40' },
      { id: '3', icon: '🌿', nameVi: 'Bụi Cây Rậm', nameEn: 'Dense Bush', isTarget: true, bgGradient: 'from-emerald-950/60 to-green-950/40' },
      { id: '4', icon: '🧱', nameVi: 'Tường Bê Tông', nameEn: 'Concrete Wall', isTarget: false, bgGradient: 'from-slate-800/60 to-slate-900/40' },
      { id: '5', icon: '🚪', nameVi: 'Tủ Sắt Locker', nameEn: 'Metal Locker', isTarget: true, bgGradient: 'from-blue-950/60 to-slate-900/40' },
      { id: '6', icon: '🔦', nameVi: 'Đèn Pin Soi Rọi', nameEn: 'Flashlight', isTarget: false, bgGradient: 'from-amber-950/60 to-slate-900/40' },
      { id: '7', icon: '🗄️', nameVi: 'Tủ Quần Áo Gỗ', nameEn: 'Grand Wardrobe', isTarget: true, bgGradient: 'from-amber-950/60 to-amber-900/40' },
      { id: '8', icon: '⚡', nameVi: 'Bẫy Điện Giật', nameEn: 'Shock Trap', isTarget: false, bgGradient: 'from-purple-950/60 to-slate-900/40' },
      { id: '9', icon: '🗑️', nameVi: 'Thùng Rác Tái Chế', nameEn: 'Recycle Bin', isTarget: true, bgGradient: 'from-teal-950/60 to-slate-900/40' },
    ],
  },
  {
    id: 'seeker_gear',
    promptVi: 'Chọn tất cả các ô có THIẾT BỊ THỢ SĂN',
    promptEn: 'Select all squares with SEEKER GEAR',
    subPromptVi: 'Đèn pin, Radar, Kính tầm nhiệt, Bẫy điện',
    subPromptEn: 'Flashlights, Radar, Thermal Visor, Traps',
    tiles: [
      { id: '1', icon: '🔦', nameVi: 'Đèn Pin Pha', nameEn: 'Spotlight', isTarget: true, bgGradient: 'from-amber-950/60 to-yellow-900/40' },
      { id: '2', icon: '📦', nameVi: 'Thùng Hàng Cũ', nameEn: 'Cargo Crate', isTarget: false, bgGradient: 'from-amber-950/60 to-slate-900/40' },
      { id: '3', icon: '🥽', nameVi: 'Kính Tầm Nhiệt', nameEn: 'Thermal Visor', isTarget: true, bgGradient: 'from-emerald-950/60 to-teal-950/40' },
      { id: '4', icon: '🌿', nameVi: 'Bụi Cây Công Viên', nameEn: 'Park Bush', isTarget: false, bgGradient: 'from-green-950/60 to-slate-900/40' },
      { id: '5', icon: '📡', nameVi: 'Radar Định Vị', nameEn: 'Radar Pulse', isTarget: true, bgGradient: 'from-cyan-950/60 to-blue-950/40' },
      { id: '6', icon: '👻', nameVi: 'Áo Tàng Hình', nameEn: 'Cloak of Shadows', isTarget: false, bgGradient: 'from-purple-950/60 to-slate-900/40' },
      { id: '7', icon: '⚡', nameVi: 'Bẫy Sốc Điện', nameEn: 'Electro Trap', isTarget: true, bgGradient: 'from-indigo-950/60 to-purple-950/40' },
      { id: '8', icon: '🧱', nameVi: 'Hàng Rào Lưới', nameEn: 'Wire Fence', isTarget: false, bgGradient: 'from-slate-800/60 to-slate-900/40' },
      { id: '9', icon: '🚨', nameVi: 'Còi Báo Động', nameEn: 'Alarm Siren', isTarget: true, bgGradient: 'from-red-950/60 to-rose-950/40' },
    ],
  },
  {
    id: 'human_signs',
    promptVi: 'Chọn tất cả các ô có DẤU HIỆU CON NGƯỜI',
    promptEn: 'Select all squares with HUMAN SIGNS',
    subPromptVi: 'Thám tử, Học sinh, Dấu chân người, Ba lô',
    subPromptEn: 'Detectives, Students, Footsteps, Backpacks',
    tiles: [
      { id: '1', icon: '🕵️', nameVi: 'Thám Tử Lớp 6', nameEn: 'Human Detective', isTarget: true, bgGradient: 'from-blue-950/60 to-slate-900/40' },
      { id: '2', icon: '🤖', nameVi: 'AI Bot Tuần Tra', nameEn: 'Patrol Robot', isTarget: false, bgGradient: 'from-red-950/60 to-slate-900/40' },
      { id: '3', icon: '👣', nameVi: 'Dấu Chân Người', nameEn: 'Human Footprints', isTarget: true, bgGradient: 'from-sky-950/60 to-blue-950/40' },
      { id: '4', icon: '⚙️', nameVi: 'Bánh Răng Máy tính', nameEn: 'Server Gears', isTarget: false, bgGradient: 'from-slate-800/60 to-slate-900/40' },
      { id: '5', icon: '🎒', nameVi: 'Ba Lô Học Sinh', nameEn: 'School Backpack', isTarget: true, bgGradient: 'from-amber-950/60 to-orange-950/40' },
      { id: '6', icon: '💾', nameVi: 'Vi Mạch Lập Trình', nameEn: 'Microchip Logic', isTarget: false, bgGradient: 'from-emerald-950/60 to-slate-900/40' },
      { id: '7', icon: '🥷', nameVi: 'Ninja Thật', nameEn: 'Human Ninja', isTarget: true, bgGradient: 'from-purple-950/60 to-slate-900/40' },
      { id: '8', icon: '🔌', nameVi: 'Dây Cáp Điện', nameEn: 'Power Cables', isTarget: false, bgGradient: 'from-slate-800/60 to-slate-900/40' },
      { id: '9', icon: '❤️', nameVi: 'Nhịp Tim Sống', nameEn: 'Living Heartbeat', isTarget: true, bgGradient: 'from-rose-950/60 to-pink-950/40' },
    ],
  },
];

interface CaptchaModalProps {
  isOpen: boolean;
  language: Language;
  onClose: () => void;
  onVerified: () => void;
}

export const CaptchaModal: React.FC<CaptchaModalProps> = ({
  isOpen,
  language,
  onClose,
  onVerified,
}) => {
  const [challengeIdx, setChallengeIdx] = useState(0);
  const [selectedTileIds, setSelectedTileIds] = useState<string[]>([]);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  if (!isOpen) return null;

  const currentChallenge = CHALLENGES[challengeIdx % CHALLENGES.length];
  const isVi = language === 'vi';

  const handleToggleTile = (tileId: string) => {
    sound.playCaptchaClick();
    setHasError(false);
    setSelectedTileIds((prev) =>
      prev.includes(tileId) ? prev.filter((id) => id !== tileId) : [...prev, tileId]
    );
  };

  const handleRefreshChallenge = () => {
    sound.playCaptchaClick();
    setSelectedTileIds([]);
    setHasError(false);
    setErrorMessage('');
    setChallengeIdx((prev) => (prev + 1) % CHALLENGES.length);
  };

  const handleVerify = () => {
    setIsVerifying(true);
    sound.playCaptchaClick();

    setTimeout(() => {
      setIsVerifying(false);
      const targetIds = currentChallenge.tiles.filter((t) => t.isTarget).map((t) => t.id);
      
      // Check if player selected all targets and no non-targets
      const hasAllTargets = targetIds.every((id) => selectedTileIds.includes(id));
      const hasNoNonTargets = selectedTileIds.every((id) => targetIds.includes(id));
      const isSuccess = hasAllTargets && hasNoNonTargets;

      if (isSuccess) {
        sound.playSuccessChime();
        confetti({
          particleCount: 60,
          spread: 60,
          origin: { y: 0.5 },
        });
        onVerified();
        onClose();
      } else {
        sound.playBuzzer();
        setHasError(true);
        setErrorMessage(
          isVi
            ? 'Chưa chính xác! Hãy quan sát kỹ gợi ý và thử lại nhé.'
            : 'Incorrect selection! Please check the prompt and try again.'
        );
      }
    }, 450);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-white text-slate-800 rounded-2xl shadow-2xl overflow-hidden border border-slate-300">
        {/* Top Header Banner styled like authentic Google reCAPTCHA */}
        <div className="bg-blue-600 text-white p-5 flex flex-col gap-1">
          <div className="flex items-center justify-between text-xs text-blue-200">
            <span className="font-semibold tracking-wider uppercase flex items-center gap-1.5">
              <ShieldCheck size={16} className="text-white" />
              {isVi ? 'Hệ thống Xác thực Người Chơi' : 'Player Authentication'}
            </span>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-md hover:bg-blue-700 text-blue-100 transition-colors"
              title={isVi ? 'Đóng' : 'Close'}
            >
              <X size={18} />
            </button>
          </div>

          <div className="text-xl md:text-2xl font-black leading-snug mt-1">
            {isVi ? currentChallenge.promptVi : currentChallenge.promptEn}
          </div>

          <p className="text-xs text-blue-100 font-medium opacity-90">
            {isVi ? currentChallenge.subPromptVi : currentChallenge.subPromptEn}
          </p>
        </div>

        {/* 3x3 Tile Grid */}
        <div className="p-4 bg-slate-50 flex flex-col gap-3">
          {hasError && (
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-semibold animate-shake">
              <AlertCircle size={15} className="shrink-0 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-3 gap-2.5 select-none">
            {currentChallenge.tiles.map((tile) => {
              const isSelected = selectedTileIds.includes(tile.id);
              return (
                <button
                  key={tile.id}
                  type="button"
                  id={`captcha-tile-${tile.id}`}
                  onClick={() => handleToggleTile(tile.id)}
                  className={`relative flex flex-col items-center justify-center p-3 rounded-xl border-2 aspect-square transition-all duration-150 ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/80 shadow-md ring-2 ring-blue-500/40 scale-[0.98]'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                  }`}
                >
                  {/* Selection Checkmark Badge */}
                  {isSelected && (
                    <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-sm animate-in zoom-in-50 duration-150">
                      <Check size={12} strokeWidth={3} />
                    </div>
                  )}

                  <span className="text-3xl filter drop-shadow-sm mb-1">{tile.icon}</span>
                  <span className="text-[11px] font-bold text-slate-700 text-center leading-tight line-clamp-1">
                    {isVi ? tile.nameVi : tile.nameEn}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-500">
            <button
              type="button"
              id="btn-captcha-refresh"
              onClick={handleRefreshChallenge}
              className="p-2 rounded-lg hover:bg-slate-100 hover:text-slate-700 transition-colors"
              title={isVi ? 'Đổi câu đố khác' : 'Change puzzle'}
            >
              <RefreshCw size={18} />
            </button>
            <div className="text-[10px] text-slate-400 font-medium">
              reCAPTCHA v3
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
            >
              {isVi ? 'Hủy bỏ' : 'Cancel'}
            </button>

            <button
              type="button"
              id="btn-captcha-verify-submit"
              disabled={isVerifying}
              onClick={handleVerify}
              className="flex items-center gap-1.5 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-extrabold rounded-xl shadow-md transition-all disabled:opacity-50"
            >
              {isVerifying ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>{isVi ? 'Đang kiểm tra...' : 'Checking...'}</span>
                </>
              ) : (
                <>
                  <Check size={16} strokeWidth={2.5} />
                  <span>{isVi ? 'XÁC MINH' : 'VERIFY'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
