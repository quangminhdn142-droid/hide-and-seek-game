import React, { useState, useEffect } from 'react';
import { HelpCircle, CheckCircle2, XCircle, Sparkles, X, Shield } from 'lucide-react';
import { HidingSpot, Language } from '../types';
import { sound } from '../utils/sound';

interface QuestionHideModalProps {
  spot: HidingSpot | null;
  language: Language;
  onClose: () => void;
  onSuccess: (spot: HidingSpot) => void;
}

export const QuestionHideModal: React.FC<QuestionHideModalProps> = ({
  spot,
  language,
  onClose,
  onSuccess,
}) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showHint, setShowHint] = useState(false);

  const isVi = language === 'vi';
  const q = spot?.question;

  useEffect(() => {
    setSelectedOption(null);
    setIsAnswered(false);
    setIsCorrect(null);
    setShowHint(false);
  }, [spot]);

  // Keyboard navigation [1, 2, 3, 4, ESC]
  useEffect(() => {
    if (!spot || !q) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      if (isAnswered) return;

      if (['1', '2', '3', '4'].includes(e.key)) {
        const idx = parseInt(e.key, 10) - 1;
        if (idx >= 0 && idx < q.options.length) {
          handleSelectOption(idx);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [spot, q, isAnswered, onClose]);

  if (!spot || !q) return null;

  const handleSelectOption = (idx: number) => {
    if (isAnswered) return;
    setSelectedOption(idx);
    setIsAnswered(true);

    const correct = idx === q.correctIndex;
    setIsCorrect(correct);

    if (correct) {
      sound.playPowerup();
      setTimeout(() => {
        onSuccess(spot);
      }, 700);
    } else {
      sound.playCatch(); // alert buzz
      setTimeout(() => {
        // allow retry after 900ms
        setIsAnswered(false);
        setIsCorrect(null);
        setSelectedOption(null);
      }, 1000);
    }
  };

  const questionText = isVi ? q.questionVi : q.question;
  const options = isVi ? q.optionsVi : q.options;
  const hintText = isVi ? q.hintVi : q.hint;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border-2 border-indigo-500/70 rounded-3xl p-6 shadow-2xl text-slate-100 overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute -top-24 -right-24 w-56 h-56 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-56 h-56 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title={isVi ? 'Đóng (ESC)' : 'Close (ESC)'}
        >
          <X size={18} />
        </button>

        {/* Header Badge */}
        <div className="flex items-center gap-2 mb-3">
          <div className="px-3 py-1 rounded-full bg-indigo-950/80 border border-indigo-500/60 text-indigo-300 text-xs font-bold flex items-center gap-1.5 shadow-sm">
            <Sparkles size={14} className="text-amber-400 animate-spin" />
            <span>{isVi ? 'THỬ THÁCH TOÁN & NGỮ VĂN LỚP 6' : 'GRADE 6 MATH & LITERATURE QUIZ'}</span>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {spot.type === 'recycle_bin'
              ? isVi ? 'Thùng rác tái chế' : 'Smart Recycle Bin'
              : spot.type === 'wardrobe'
              ? isVi ? 'Tủ quần áo gỗ' : 'Mystery Wardrobe'
              : spot.type === 'crate'
              ? isVi ? 'Thùng gỗ hàng hóa' : 'Cargo Crate'
              : spot.type === 'locker'
              ? isVi ? 'Tủ sắt an toàn' : 'Metal Locker'
              : spot.type === 'bush'
              ? isVi ? 'Bụi cây ngụy trang' : 'Camouflage Bush'
              : isVi ? 'Rương tri thức lớp 6' : 'Grade 6 Quiz Vault'}
          </span>
        </div>

        {/* Question Prompt */}
        <h3 className="text-lg sm:text-xl font-bold text-slate-100 leading-snug mb-3">
          {questionText}
        </h3>

        <p className="text-xs text-slate-400 mb-5">
          {isVi
            ? 'Trả lời chính xác câu hỏi Toán hoặc Ngữ văn lớp 6 dưới đây để mở khóa và ẩn nấp an toàn!'
            : 'Solve this Grade 6 Math or Literature question to unlock and slip inside safely!'}
        </p>

        {/* Options List */}
        <div className="flex flex-col gap-2.5 mb-5">
          {options.map((opt, idx) => {
            const isChosen = selectedOption === idx;
            let btnStyle =
              'bg-slate-800/80 hover:bg-slate-700/80 border-slate-700 text-slate-200 hover:border-indigo-500/50';

            if (isAnswered) {
              if (idx === q.correctIndex) {
                btnStyle =
                  'bg-emerald-950/90 border-emerald-500 text-emerald-100 ring-2 ring-emerald-500/60 shadow-lg';
              } else if (isChosen && !isCorrect) {
                btnStyle =
                  'bg-rose-950/90 border-rose-500 text-rose-200 ring-2 ring-rose-500/60 shadow-lg animate-shake';
              } else {
                btnStyle = 'bg-slate-800/40 border-slate-800 text-slate-500 opacity-60';
              }
            }

            return (
              <button
                key={idx}
                disabled={isAnswered}
                onClick={() => handleSelectOption(idx)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl border text-left font-medium text-sm transition-all active:scale-[0.98] ${btnStyle}`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center text-xs font-mono font-bold text-indigo-300">
                    {idx + 1}
                  </span>
                  <span>{opt}</span>
                </div>

                {isAnswered && idx === q.correctIndex && (
                  <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
                )}
                {isAnswered && isChosen && !isCorrect && (
                  <XCircle size={18} className="text-rose-400 shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Feedback Alert */}
        {isAnswered && (
          <div
            className={`p-3 rounded-2xl text-xs font-semibold flex items-center gap-2 mb-4 animate-in fade-in duration-150 ${
              isCorrect
                ? 'bg-emerald-950/70 border border-emerald-500/60 text-emerald-300'
                : 'bg-rose-950/70 border border-rose-500/60 text-rose-300'
            }`}
          >
            {isCorrect ? (
              <>
                <Shield size={16} className="text-emerald-400" />
                <span>
                  {isVi
                    ? 'Chính xác! Cửa đã mở, bạn đang lướt vào chỗ trốn an toàn...'
                    : 'Correct! Lock released! Entering concealment...'}
                </span>
              </>
            ) : (
              <>
                <XCircle size={16} className="text-rose-400" />
                <span>
                  {isVi
                    ? 'Chưa chính xác! Ổ khóa vẫn bị chốt. Đang chuẩn bị lại...'
                    : 'Incorrect! The latch stayed locked. Resetting...'}
                </span>
              </>
            )}
          </div>
        )}

        {/* Footer & Hint */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
          <div className="flex items-center gap-2">
            {hintText && (
              <button
                type="button"
                onClick={() => setShowHint((prev) => !prev)}
                className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 underline font-medium cursor-pointer"
              >
                <HelpCircle size={13} />
                <span>{showHint ? (isVi ? 'Ẩn gợi ý' : 'Hide Hint') : (isVi ? 'Xem gợi ý' : 'Show Hint')}</span>
              </button>
            )}
          </div>

          <span className="font-mono text-[11px] text-slate-500">
            {isVi ? 'Phím [1-4] để chọn • [ESC] Hủy' : 'Keys [1-4] to pick • [ESC] Cancel'}
          </span>
        </div>

        {showHint && hintText && (
          <div className="mt-3 p-2.5 rounded-xl bg-indigo-950/50 border border-indigo-500/40 text-xs text-indigo-200">
            💡 <span className="font-semibold">{isVi ? 'Gợi ý:' : 'Hint:'}</span> {hintText}
          </div>
        )}
      </div>
    </div>
  );
};
