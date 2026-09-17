import React, { useState, useEffect, useRef } from 'react';
import { Send, ChevronDown, ChevronUp, Radio } from 'lucide-react';
import { ChatMessage, Character, Language } from '../types';

interface GameChatProps {
  messages: ChatMessage[];
  player: Character;
  language: Language;
  onSendMessage: (text: string) => void;
  isOpenControlled?: boolean;
  onToggleOpen?: () => void;
}

export const GameChat: React.FC<GameChatProps> = ({
  messages,
  player,
  language,
  onSendMessage,
  isOpenControlled,
  onToggleOpen,
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = isOpenControlled !== undefined ? isOpenControlled : internalIsOpen;
  const toggleChat = onToggleOpen || (() => setInternalIsOpen((prev) => !prev));
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isVi = language === 'vi';

  const quickPings = isVi
    ? [
        'Có an toàn để đi không?',
        'Mau trốn vào tủ thôi!',
        'Nên tách nhau ra không?',
        'Thợ săn mất dấu rồi!',
        'Đi theo tôi nè!',
        'Suỵt, giữ im lặng!',
        'Hắn đang ở rất gần tôi!',
        'Các bạn đang ở đâu thế?',
      ]
    : [
        'Is it safe to move?',
        "Let's hide in lockers!",
        'Should we split up?',
        'Seeker is clueless lol',
        'Follow my lead!',
        'Shhh, quiet!',
        'He is near me!',
        'Where are you guys?',
      ];

  // Auto-scroll to latest message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  const playerName = player.name || 'You';

  return (
    <div className="pointer-events-auto absolute top-20 left-3 md:left-5 z-20 w-64 md:w-84 flex flex-col font-sans">
      {/* Header Bar */}
      <div
        onClick={toggleChat}
        className="flex items-center justify-between bg-slate-900/90 border border-slate-700/80 px-3 py-1.5 rounded-t-xl cursor-pointer select-none text-slate-300 hover:text-white transition-colors shadow-lg"
      >
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider">
          <Radio size={13} className="text-emerald-400 animate-pulse" />
          <span>{isVi ? 'Kênh Đội' : 'Squad Comms'}</span>
          <span className="text-[10px] text-slate-500 font-mono">({messages.length})</span>
        </div>
        <button className="text-slate-400 hover:text-white">
          {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      {/* Expandable Chat Body */}
      {isOpen && (
        <div className="flex flex-col bg-slate-950/90 border-x border-b border-slate-700/80 rounded-b-xl backdrop-blur-md overflow-hidden shadow-2xl">
          {/* Messages list */}
          <div className="flex flex-col gap-1.5 p-2.5 max-h-48 overflow-y-auto text-xs scrollbar-thin scrollbar-thumb-slate-700">
            {messages.slice(-20).map((msg) => {
              const mentionsPlayer =
                !msg.isSystem &&
                !msg.senderName.includes(playerName) &&
                (msg.text.toLowerCase().includes(playerName.toLowerCase()) ||
                  msg.text.toLowerCase().includes('you') ||
                  msg.text.toLowerCase().includes('bạn'));

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col leading-tight rounded-md p-1 transition-colors ${
                    msg.isSystem
                      ? 'text-amber-300 italic'
                      : mentionsPlayer
                      ? 'bg-blue-950/40 border-l-2 border-blue-400 pl-1.5'
                      : 'text-slate-200'
                  }`}
                >
                  {!msg.isSystem && (
                    <div className="flex items-center gap-1">
                      <span
                        className={`text-[10px] font-bold ${
                          msg.senderRole === 'seeker'
                            ? 'text-red-400'
                            : msg.senderName.includes(playerName) || msg.senderName.includes('You')
                            ? 'text-blue-400 font-extrabold'
                            : 'text-emerald-400'
                        }`}
                      >
                        {msg.senderName}:
                      </span>
                      {msg.stance === 'agree' && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded font-mono font-bold bg-emerald-500/25 text-emerald-300 border border-emerald-500/40">
                          {isVi ? 'ĐỒNG Ý 👍' : 'AGREES 👍'}
                        </span>
                      )}
                      {msg.stance === 'disagree' && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded font-mono font-bold bg-rose-500/25 text-rose-300 border border-rose-500/40">
                          {isVi ? 'KHÔNG ĐỒNG Ý 👎' : 'DISAGREES 👎'}
                        </span>
                      )}
                      {mentionsPlayer && !msg.stance && (
                        <span className="text-[9px] px-1 py-0.2 rounded bg-blue-500/20 text-blue-300 font-semibold">
                          {isVi ? 'cho bạn' : 'to you'}
                        </span>
                      )}
                      <span className="text-[9px] text-slate-500 ml-auto">{msg.time}</span>
                    </div>
                  )}
                  <span className="text-slate-300 text-[11px] pl-0.5 break-words">
                    {msg.text}
                  </span>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Ping Chips */}
          <div className="flex gap-1 p-1.5 border-t border-slate-800/80 overflow-x-auto bg-slate-900/60 scrollbar-none">
            {quickPings.map((ping, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onSendMessage(ping)}
                className="whitespace-nowrap px-2 py-0.5 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[10px] text-slate-300 hover:text-white transition-colors"
              >
                {ping}
              </button>
            ))}
          </div>

          {/* Custom message input */}
          <form onSubmit={handleSubmit} className="flex items-center p-1.5 border-t border-slate-800">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={isVi ? 'Hỏi đội / thảo luận kế hoạch...' : 'Ask squad / propose plan...'}
              className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              className="ml-1.5 p-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors"
            >
              <Send size={12} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
