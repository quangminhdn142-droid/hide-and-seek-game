import React, { useState } from 'react';
import { Check, ShieldCheck, RefreshCw } from 'lucide-react';
import { Language } from '../types';
import { sound } from '../utils/sound';

interface RecaptchaBoxProps {
  isVerified: boolean;
  language: Language;
  onStartVerification: () => void;
  onResetVerification?: () => void;
  compact?: boolean;
}

export const RecaptchaBox: React.FC<RecaptchaBoxProps> = ({
  isVerified,
  language,
  onStartVerification,
  onResetVerification,
  compact = false,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const isVi = language === 'vi';

  const handleClickCheckbox = () => {
    if (isVerified) return;
    sound.playCaptchaClick();
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      onStartVerification();
    }, 350);
  };

  return (
    <div
      id="recaptcha-anchor-container"
      className={`relative flex items-center justify-between bg-slate-900 border ${
        isVerified ? 'border-emerald-500/60 bg-emerald-950/20' : 'border-slate-700 bg-slate-950/70'
      } rounded-2xl ${compact ? 'p-2.5 gap-2' : 'p-3.5 gap-3'} shadow-lg select-none transition-all duration-200`}
    >
      {/* Left Checkbox & Text */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          id="btn-recaptcha-checkbox"
          disabled={isLoading}
          onClick={handleClickCheckbox}
          className={`relative flex items-center justify-center rounded-lg transition-all ${
            compact ? 'w-6 h-6' : 'w-7 h-7'
          } ${
            isVerified
              ? 'bg-emerald-500 text-white shadow-md shadow-emerald-900/50 scale-105 ring-2 ring-emerald-400/40'
              : isLoading
              ? 'border-2 border-blue-400/60 bg-blue-950/40'
              : 'border-2 border-slate-500 hover:border-blue-400 bg-slate-800 hover:bg-slate-750 cursor-pointer active:scale-95'
          }`}
          title={
            isVerified
              ? isVi
                ? 'Đã xác minh là Con Người!'
                : 'Verified as Human!'
              : isVi
              ? 'Nhấp để xác minh Tôi không phải là người máy'
              : "Click to verify I'm not a robot"
          }
        >
          {isVerified ? (
            <Check size={compact ? 16 : 18} strokeWidth={3} className="animate-in zoom-in duration-200" />
          ) : isLoading ? (
            <div
              className={`${
                compact ? 'w-3.5 h-3.5' : 'w-4 h-4'
              } border-2 border-blue-400 border-t-transparent rounded-full animate-spin`}
            />
          ) : null}
        </button>

        <div className="flex flex-col">
          <label
            onClick={!isVerified ? handleClickCheckbox : undefined}
            className={`font-bold tracking-tight ${
              compact ? 'text-xs' : 'text-sm'
            } ${
              isVerified
                ? 'text-emerald-300 font-extrabold cursor-default'
                : 'text-slate-100 hover:text-white cursor-pointer'
            }`}
          >
            {isVi ? 'Tôi không phải là người máy' : "I'm not a robot"}
          </label>
          <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
            {isVerified ? (
              <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                <ShieldCheck size={12} />
                {isVi ? 'Đã xác thực con người 100%' : '100% Certified Human'}
              </span>
            ) : (
              <span>{isVi ? 'Bảo vệ phòng chờ AI Bot' : 'Bot Arena Human Verification'}</span>
            )}
          </div>
        </div>
      </div>

      {/* Right reCAPTCHA branding badge */}
      <div className="flex flex-col items-center justify-center pl-2 border-l border-slate-800/80 shrink-0">
        <div className="flex items-center gap-1">
          {/* Logo 3-arrows representation */}
          <div className="w-5 h-5 rounded-full border-2 border-blue-500 border-dashed animate-spin-slow flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-blue-400" />
          </div>
        </div>
        <span className="text-[9px] font-mono font-extrabold tracking-wider text-slate-400 mt-0.5">
          reCAPTCHA
        </span>
        <div className="flex items-center gap-1 text-[8px] text-slate-500">
          <span>{isVi ? 'Quyền riêng tư' : 'Privacy'}</span>
          <span>•</span>
          <span>{isVi ? 'Điều khoản' : 'Terms'}</span>
        </div>
      </div>
    </div>
  );
};
