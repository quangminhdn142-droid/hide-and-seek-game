import React from 'react';
import { X, Shield, Search, Footprints, Eye, Radio, Sparkles, Hand } from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../utils/i18n';

interface HowToPlayModalProps {
  isOpen: boolean;
  language: Language;
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({
  isOpen,
  language,
  onClose,
}) => {
  if (!isOpen) return null;

  const t = TRANSLATIONS[language];
  const isVi = language === 'vi';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl p-6 md:p-7 flex flex-col gap-5 text-slate-100 my-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <span>{t.htpTitle}</span>
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Tabs / Sections */}
        <div className="flex flex-col gap-4 text-xs md:text-sm text-slate-300 max-h-[70vh] overflow-y-auto pr-1">
          {/* Controls Card */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 flex flex-col gap-2.5">
            <span className="font-bold text-slate-200 text-xs uppercase tracking-wider">
              {t.htpControlsTitle}
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center justify-between bg-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-800">
                <span className="text-slate-400">{t.htpMove}</span>
                <span className="font-mono font-bold text-amber-300">W, A, S, D / Phím mũi tên</span>
              </div>
              <div className="flex items-center justify-between bg-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-800">
                <span className="text-slate-400">{t.htpAim}</span>
                <span className="font-mono font-bold text-amber-300">{isVi ? 'Con trỏ chuột' : 'Mouse Cursor'}</span>
              </div>
              <div className="flex items-center justify-between bg-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-800">
                <span className="text-slate-400">{t.htpSprint}</span>
                <span className="font-mono font-bold text-amber-300">Shift</span>
              </div>
              <div className="flex items-center justify-between bg-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-800">
                <span className="text-slate-400">{t.htpSneak}</span>
                <span className="font-mono font-bold text-amber-300">C hoặc Ctrl</span>
              </div>
              <div className="flex items-center justify-between bg-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-800">
                <span className="text-slate-400">{t.htpInteract}</span>
                <span className="font-mono font-bold text-amber-300">E hoặc Phím Cách</span>
              </div>
              <div className="flex items-center justify-between bg-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-800">
                <span className="text-slate-400">{t.htpAbilities}</span>
                <span className="font-mono font-bold text-amber-300">Phím Q & F</span>
              </div>
              <div className="flex items-center justify-between bg-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-800">
                <span className="text-slate-400">{t.htpUseItems}</span>
                <span className="font-mono font-bold text-amber-300">Phím 1, 2, 3</span>
              </div>
              <div className="flex items-center justify-between bg-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-800">
                <span className="text-slate-400">{t.htpBotCam}</span>
                <span className="font-mono font-bold text-sky-300">TAB / Nhấp Avatar</span>
              </div>
            </div>

            {/* Mobile Touch Mode Guide */}
            <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs bg-sky-950/30 px-3 py-2 rounded-xl border border-sky-900/40">
              <span className="text-sky-300 font-bold">
                {isVi ? '📱 Thiết bị di động / Cảm ứng:' : '📱 Mobile & Touch Devices:'}
              </span>
              <span className="text-slate-300">
                {isVi
                  ? 'Cần gạt ảo (Joystick) để di chuyển, nút bấm trực quan cho Trườn, Chạy, Kỹ năng & Túi đồ.'
                  : 'Virtual Analog Joystick for movement, touch buttons for Sprint, Sneak, Abilities & Items.'}
              </span>
            </div>

            <p className="text-[11px] text-slate-400 italic">
              {t.htpItemPickupNote}
            </p>
          </div>

          {/* Collectible Items & Special Abilities Card */}
          <div className="bg-slate-950/60 border border-purple-900/50 rounded-2xl p-4 flex flex-col gap-2.5">
            <div className="flex items-center gap-2 text-purple-400 font-bold">
              <Sparkles size={16} />
              <span>{t.htpItemsTitle}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-900/80 p-2 rounded-xl border border-purple-800/40 flex items-start gap-2">
                <span className="text-lg">👻</span>
                <div>
                  <span className="font-bold text-purple-300">{t.itemGhostCloak}</span>
                  <p className="text-slate-400 text-[11px]">{t.itemGhostCloakDesc}</p>
                </div>
              </div>
              <div className="bg-slate-900/80 p-2 rounded-xl border border-amber-800/40 flex items-start gap-2">
                <span className="text-lg">🪤</span>
                <div>
                  <span className="font-bold text-amber-300">{t.itemShockTrap}</span>
                  <p className="text-slate-400 text-[11px]">{t.itemShockTrapDesc}</p>
                </div>
              </div>
              <div className="bg-slate-900/80 p-2 rounded-xl border border-sky-800/40 flex items-start gap-2">
                <span className="text-lg">🤖</span>
                <div>
                  <span className="font-bold text-sky-300">{t.itemDecoyBeacon}</span>
                  <p className="text-slate-400 text-[11px]">{t.itemDecoyBeaconDesc}</p>
                </div>
              </div>
              <div className="bg-slate-900/80 p-2 rounded-xl border border-emerald-800/40 flex items-start gap-2">
                <span className="text-lg">🥽</span>
                <div>
                  <span className="font-bold text-emerald-300">{t.itemThermalVisor}</span>
                  <p className="text-slate-400 text-[11px]">{t.itemThermalVisorDesc}</p>
                </div>
              </div>
              <div className="bg-slate-900/80 p-2 rounded-xl border border-yellow-800/40 flex items-start gap-2 sm:col-span-2">
                <span className="text-lg">⚡</span>
                <div>
                  <span className="font-bold text-yellow-300">{t.itemSpeedSurge}</span>
                  <p className="text-slate-400 text-[11px]">{t.itemSpeedSurgeDesc}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Hider Rules */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-blue-400 font-bold">
              <Shield size={16} />
              <span>{t.htpHiderRulesTitle}</span>
            </div>
            {isVi ? (
              <ul className="list-disc list-inside space-y-1 text-slate-300 text-xs">
                <li>
                  <strong>15 Giây Khởi Động:</strong> Thợ săn bị che mắt trong Giai đoạn Ẩn nấp. Hãy chạy thật nhanh đến vị trí an toàn!
                </li>
                <li>
                  <strong>Bụi Cây & Thùng Gỗ:</strong> Đứng vào bụi rậm xanh để ngụy trang. Tiến gần thùng gỗ hoặc tủ sắt nhấn <strong>[E]</strong> hoặc <strong>[Phím Cách]</strong> để chui vào trốn.
                </li>
                <li>
                  <strong>Thử Thách Toán & Tiếng Việt Lớp 6:</strong> Khi mở các rương tri thức, thùng đồ hoặc tủ sắt, hãy giải đúng câu hỏi trắc nghiệm <strong>Toán hoặc Ngữ văn Lớp 6</strong> để mở chốt khóa và trốn vào an toàn!
                </li>
                <li>
                  <strong>Sóng Âm Thanh:</strong> Chạy nhanh (Shift) sẽ tạo ra sóng âm thanh và tiếng bước chân mà thợ săn có thể nghe thấy qua tường. Nhấn <strong>[C]</strong> để đi rón rén.
                </li>
                <li>
                  <strong>Biến Thành Đá [Q]:</strong> Đứng yên hóa đá vô hại để hòa mình vào cảnh vật xung quanh.
                </li>
                <li>
                  <strong>Tung Bom Khói [F]:</strong> Tạo màn khói dày đặc làm mù mắt thợ săn để trốn thoát trong gang tấc.
                </li>
              </ul>
            ) : (
              <ul className="list-disc list-inside space-y-1 text-slate-300 text-xs">
                <li>
                  <strong>15-Second Headstart:</strong> The seeker is blindfolded during the Hide Phase. Use this time to sprint away and find good cover!
                </li>
                <li>
                  <strong>Bushes & Crates:</strong> Step inside leafy green bushes to camouflage. Approach brown crates or lockers and press <strong>[E]</strong> to climb inside.
                </li>
                <li>
                  <strong>Sound Ripples:</strong> Sprinting leaves visual sound waves and loud footsteps that seekers can hear through walls. Crouch <strong>[C]</strong> to move silently.
                </li>
                <li>
                  <strong>Disguise Rock [Q]:</strong> Blend in as a solid stone object to deceive nearby hunters.
                </li>
                <li>
                  <strong>Smoke Screen [F]:</strong> Releases a dense smoke cloud that blinds seekers and breaks visual contact.
                </li>
              </ul>
            )}
          </div>

          {/* Seeker Rules */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-red-400 font-bold">
              <Search size={16} />
              <span>{t.htpSeekerRulesTitle}</span>
            </div>
            {isVi ? (
              <ul className="list-disc list-inside space-y-1 text-slate-300 text-xs">
                <li>
                  <strong>Đèn Pin Tầm Nhìn:</strong> Bạn có chùm đèn chiếu sáng hình nón. Người trốn bên ngoài chùm đèn hoặc sau tường sẽ không bị nhìn thấy.
                </li>
                <li>
                  <strong>Tìm Kiếm Thùng & Tủ:</strong> Tiến lại gần thùng hoặc tủ sắt nhấn <strong>[E]</strong> để kiểm tra xem có ai đang trốn bên trong không.
                </li>
                <li>
                  <strong>Sóng Rada Quét [Q]:</strong> Phát sóng âm định vị người trốn đang di chuyển trong bán kính xung quanh.
                </li>
                <li>
                  <strong>Đèn Pha Tăng Áp [F]:</strong> Mở rộng tầm đèn pin +40% và bứt tốc độ di chuyển để nhanh chóng tóm gọn mục tiêu.
                </li>
              </ul>
            ) : (
              <ul className="list-disc list-inside space-y-1 text-slate-300 text-xs">
                <li>
                  <strong>Flashlight Cone:</strong> You have a bright vision beam. Hiders outside your beam or behind walls remain hidden.
                </li>
                <li>
                  <strong>Searching Crates:</strong> Approach crates or lockers and press <strong>[E]</strong> to check if someone is hiding inside.
                </li>
                <li>
                  <strong>Radar Sonar [Q]:</strong> Activates an echo that reveals movement of nearby hiders.
                </li>
                <li>
                  <strong>High-Beam Dash [F]:</strong> Extends flashlight range by 40% and grants a quick sprint surge.
                </li>
              </ul>
            )}
          </div>
        </div>

        {/* Footer Close */}
        <div className="pt-2 border-t border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-2.5 rounded-xl transition-colors text-xs"
          >
            {isVi ? 'Đã hiểu, Bắt đầu chơi!' : "Got It, Let's Play!"}
          </button>
        </div>
      </div>
    </div>
  );
};
