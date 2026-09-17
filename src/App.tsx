import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Character,
  ChatMessage,
  Footstep,
  GameMap,
  GamePhase,
  GameStats,
  PlayerRole,
  SmokeCloud,
  SoundRipple,
  AIDifficulty,
  WorldItem,
  ActiveTrap,
  ActiveDecoy,
  ItemType,
  Language,
  HidingSpot,
  PlayerProfile,
} from './types';
import { MAPS } from './data/maps';
import {
  createRoster,
  resolveWallCollision,
  updateBotAI,
  isTargetInSeekerSight,
} from './game/engine';
import {
  getBotReplyFromAIOrLocal,
  getSecondaryBotReply,
  checkInGameProximityDialogue,
} from './game/botDialogue';
import {
  spawnRandomItems,
  spawnSingleItem,
  ITEM_DEFINITIONS,
} from './game/items';
import { sound } from './utils/sound';
import { loadPlayerProfile, savePlayerProfile, recordMatchResult } from './utils/profile';
import { GameCanvas } from './components/GameCanvas';
import { HUD } from './components/HUD';
import { GameChat } from './components/GameChat';
import { LobbyModal } from './components/LobbyModal';
import { GameOverModal } from './components/GameOverModal';
import { HowToPlayModal } from './components/HowToPlayModal';
import { TouchControls } from './components/TouchControls';
import { MobileControls } from './components/MobileControls';
import { BotCamOverlay } from './components/BotCamOverlay';
import { QuestionHideModal } from './components/QuestionHideModal';
import { ProfileModal } from './components/ProfileModal';
import { CaptchaModal } from './components/CaptchaModal';

export default function App() {
  // Player Profile & Human Verification
  const [playerProfile, setPlayerProfile] = useState<PlayerProfile>(() => loadPlayerProfile());
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isCaptchaOpen, setIsCaptchaOpen] = useState(false);
  const solvedQuestionsInMatch = useRef(0);

  // Lobby / Match Settings
  const [playerName, setPlayerName] = useState(() => {
    const p = loadPlayerProfile();
    return p.name || 'Player 1';
  });
  const [selectedRole, setSelectedRole] = useState<PlayerRole>('hider');
  const [selectedMap, setSelectedMap] = useState<GameMap>(MAPS[0]);
  const [botCount, setBotCount] = useState<number>(5);
  const [seekerCount, setSeekerCount] = useState<number>(1);
  const [difficulty, setDifficulty] = useState<AIDifficulty>('normal');
  const [matchDuration, setMatchDuration] = useState<number>(90);
  const matchDurationRef = useRef<number>(matchDuration);
  matchDurationRef.current = matchDuration;
  const [language, setLanguage] = useState<Language>('vi');
  const languageRef = useRef(language);
  languageRef.current = language;

  const handleToggleLanguage = () => {
    setLanguage((prev) => (prev === 'en' ? 'vi' : 'en'));
  };

  const handleUpdatePlayerName = (name: string) => {
    setPlayerName(name);
    setPlayerProfile((prev) => {
      const updated = { ...prev, name };
      savePlayerProfile(updated);
      return updated;
    });
  };

  const handleUpdateProfile = (newProfile: PlayerProfile) => {
    setPlayerProfile(newProfile);
    savePlayerProfile(newProfile);
    setPlayerName(newProfile.name);
    setCharacters((prev) =>
      prev.map((c) =>
        c.id === 'player'
          ? {
              ...c,
              name: newProfile.name,
              avatar: newProfile.avatar,
              color: newProfile.color,
              isHumanVerified: newProfile.isHumanVerified,
            }
          : c
      )
    );
  };

  const handleVerifiedCaptcha = () => {
    setPlayerProfile((prev) => {
      const updated = { ...prev, isHumanVerified: true };
      savePlayerProfile(updated);
      return updated;
    });
    setCharacters((prev) =>
      prev.map((c) => (c.id === 'player' ? { ...c, isHumanVerified: true } : c))
    );
    const isVi = languageRef.current === 'vi';
    sendChatMessage(
      'SYSTEM',
      isVi
        ? '🛡️ XÁC THỰC THÀNH CÔNG: Người chơi đã chứng minh "Tôi không phải người máy" (100% Con Người)!'
        : '🛡️ VERIFIED: Player passed "I\'m not a robot" challenge (100% Certified Human)!',
      'hider',
      'agree'
    );
  };

  // Modals
  const [isLobbyOpen, setIsLobbyOpen] = useState(true);
  const [isGameOverOpen, setIsGameOverOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [activeQuestionSpot, setActiveQuestionSpot] = useState<HidingSpot | null>(null);
  const [isMuted, setIsMuted] = useState(sound.getIsMuted());
  const [isMobileMode, setIsMobileMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return (
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        window.innerWidth <= 840
      );
    }
    return false;
  });
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);
  const [isTacticalMapOpen, setIsTacticalMapOpen] = useState(false);

  // Game Engine State
  const [phase, setPhase] = useState<GamePhase>('waiting');
  const [phaseTimeLeft, setPhaseTimeLeft] = useState<number>(15);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [camTargetId, setCamTargetId] = useState<string>('player');
  const [soundRipples, setSoundRipples] = useState<SoundRipple[]>([]);
  const [footsteps, setFootsteps] = useState<Footstep[]>([]);
  const [smokeClouds, setSmokeClouds] = useState<SmokeCloud[]>([]);
  const [worldItems, setWorldItems] = useState<WorldItem[]>([]);
  const [activeTraps, setActiveTraps] = useState<ActiveTrap[]>([]);
  const [activeDecoys, setActiveDecoys] = useState<ActiveDecoy[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [gameStats, setGameStats] = useState<GameStats | null>(null);

  // Abilities
  const [ability1Cooldown, setAbility1Cooldown] = useState(0);
  const [ability2Cooldown, setAbility2Cooldown] = useState(0);
  const [flashlightBoost, setFlashlightBoost] = useState(false);
  const [radarPulseAngle, setRadarPulseAngle] = useState<number | null>(null);
  const [tensionLevel, setTensionLevel] = useState(0);

  // Input states
  const keysPressed = useRef<{ [key: string]: boolean }>({});
  const touchDirection = useRef<{ dx: number; dy: number }>({ dx: 0, dy: 0 });
  const mouseWorldPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const closeCallsCount = useRef(0);
  const distractionsCount = useRef(0);
  const matchStartTime = useRef(Date.now());

  // Send radio chat message
  const sendChatMessage = useCallback(
    (sender: Character | string, text: string, role?: PlayerRole, stance?: 'agree' | 'disagree' | 'neutral') => {
      const isChar = typeof sender !== 'string';
      const senderName = isChar ? sender.name : sender;
      const senderRole = isChar ? sender.role : role || 'hider';

      const newMsg: ChatMessage = {
        id: `msg_${Date.now()}_${Math.random()}`,
        senderName,
        senderRole,
        text,
        stance,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      };

      setChatMessages((prev) => [...prev.slice(-25), newMsg]);
    },
    []
  );

  // Player sends a radio message -> trigger conversational bot response (with agree/disagree stances)
  const handlePlayerSendMessage = useCallback(
    (text: string) => {
      const player = characters.find((c) => c.id === 'player');
      if (!player) return;

      sendChatMessage(player, text);
      player.speech = { text, timer: 140, maxTimer: 140 };

      // Reaction delay before bot radio response (450ms - 850ms)
      const delay = 450 + Math.random() * 400;
      setTimeout(async () => {
        const reply = await getBotReplyFromAIOrLocal(
          text,
          player.name,
          player.role,
          phase,
          characters,
          player,
          language
        );

        if (reply && reply.bot && reply.text) {
          sound.playRadioChat(reply.bot.role === 'seeker');
          sendChatMessage(reply.bot, reply.text, undefined, reply.stance);

          // Visual overhead emote: 👍 for agree, 👎 for disagree, 💬 for neutral
          const emoteIcon = reply.stance === 'agree' ? '👍' : reply.stance === 'disagree' ? '👎' : '💬';

          setCharacters((prev) =>
            prev.map((c) =>
              c.id === reply.bot.id
                ? {
                    ...c,
                    speech: { text: reply.text, timer: 210, maxTimer: 210 },
                    emote: { text: emoteIcon, timer: 160 },
                  }
                : c
            )
          );

          // 45% chance for a second squadmate to chime in with a counter or supporting stance!
          if (Math.random() < 0.45) {
            const secondDelay = 850 + Math.random() * 550;
            setTimeout(() => {
              const secondReply = getSecondaryBotReply(
                text,
                player.name,
                player.role,
                phase,
                characters,
                player,
                reply.bot.id,
                language
              );
              if (secondReply && secondReply.bot && secondReply.text) {
                sound.playRadioChat(secondReply.bot.role === 'seeker');
                sendChatMessage(secondReply.bot, secondReply.text, undefined, secondReply.stance);

                const secondEmote =
                  secondReply.stance === 'agree' ? '👍' : secondReply.stance === 'disagree' ? '👎' : '💬';

                setCharacters((prev) =>
                  prev.map((c) =>
                    c.id === secondReply.bot.id
                      ? {
                          ...c,
                          speech: { text: secondReply.text, timer: 200, maxTimer: 200 },
                          emote: { text: secondEmote, timer: 150 },
                        }
                      : c
                  )
                );
              }
            }, secondDelay);
          }
        }
      }, delay);
    },
    [characters, phase, sendChatMessage, language]
  );

  // Add sound ripple to world
  const addSoundRipple = useCallback(
    (x: number, y: number, radius: number, role: PlayerRole, isDistraction: boolean = false) => {
      const newRipple: SoundRipple = {
        id: `rip_${Date.now()}_${Math.random()}`,
        x,
        y,
        radius: 10,
        maxRadius: radius,
        opacity: 0.9,
        sourceRole: role,
        isDistraction,
      };
      setSoundRipples((prev) => [...prev.slice(-15), newRipple]);
    },
    []
  );

  // Start a new match
  const startMatch = useCallback(() => {
    // Reset all hiding spots on the selected map so questions and occupancy are fresh
    selectedMap.hidingSpots.forEach((spot) => {
      spot.occupantId = undefined;
      spot.isQuestionSolved = false;
      spot.searchedBySeekerTime = undefined;
    });

    solvedQuestionsInMatch.current = 0;
    const roster = createRoster(selectedRole, playerName, selectedMap, botCount, seekerCount, language, playerProfile);
    setCharacters(roster);
    setCamTargetId('player');
    setPhase('hiding');
    setPhaseTimeLeft(15);
    setSoundRipples([]);
    setFootsteps([]);
    setSmokeClouds([]);
    setWorldItems(spawnRandomItems(selectedMap, 6));
    setActiveTraps([]);
    setActiveDecoys([]);
    setAbility1Cooldown(0);
    setAbility2Cooldown(0);
    setFlashlightBoost(false);
    setRadarPulseAngle(null);
    setTensionLevel(0);
    setIsLobbyOpen(false);
    setIsGameOverOpen(false);
    closeCallsCount.current = 0;
    distractionsCount.current = 0;
    matchStartTime.current = Date.now();

    sound.stopHeartbeat();
    sound.playCountdownTick(true);

    // Initial system broadcasts
    const isVi = language === 'vi';
    setChatMessages([
      {
        id: 'sys_1',
        senderName: 'SYSTEM',
        senderRole: 'hider',
        text: isVi
          ? `Trận đấu bắt đầu tại ${selectedMap.name}! 15 giây đếm ngược để tìm chỗ trốn.`
          : `Match started in ${selectedMap.name}! 15-second hide phase initiated.`,
        time: '00:00',
        isSystem: true,
      },
    ]);
  }, [selectedRole, playerName, selectedMap, botCount, seekerCount, language, playerProfile]);

  // Audio mute toggle
  const handleToggleMute = () => {
    const next = sound.toggleMute();
    setIsMuted(next);
  };

  // Cycle camera target across characters to see what bots are doing
  const cycleCam = useCallback(() => {
    if (characters.length === 0) return;
    const allTargets = ['player', ...characters.filter((c) => c.id !== 'player').map((c) => c.id)];
    const currentIdx = allTargets.indexOf(camTargetId);
    const nextIdx = (currentIdx + 1) % allTargets.length;
    setCamTargetId(allTargets[nextIdx]);
  }, [characters, camTargetId]);

  // Track mouse coordinates over canvas for character aim
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const playerChar = characters.find((c) => c.id === 'player');
      if (!playerChar) return;

      const camTarget = characters.find((c) => c.id === camTargetId) || playerChar;
      const screenX = e.clientX - rect.left;
      const screenY = e.clientY - rect.top;
      const worldX = screenX - canvas.width / 2 + camTarget.x;
      const worldY = screenY - canvas.height / 2 + camTarget.y;

      mouseWorldPos.current = { x: worldX, y: worldY };
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [characters, camTargetId]);

  // Ability 1: Rock throw (Hider) or Radar pulse (Seeker)
  const useAbility1 = () => {
    if (ability1Cooldown > 0 || phase === 'waiting' || phase === 'ended') return;
    const player = characters.find((c) => c.id === 'player');
    if (!player || player.isCaught) return;

    if (player.role === 'hider') {
      // Throw Distraction Rock
      const targetX = mouseWorldPos.current.x || player.x + Math.cos(player.angle) * 220;
      const targetY = mouseWorldPos.current.y || player.y + Math.sin(player.angle) * 220;

      sound.playRockThrow();
      addSoundRipple(targetX, targetY, 180, 'hider', true);
      distractionsCount.current++;
      setAbility1Cooldown(12);
      player.emote = { text: '🪨', timer: 45 };

      // Alert bots about the noise!
      characters.forEach((char) => {
        if (char.role === 'seeker') {
          char.targetPos = { x: targetX, y: targetY };
          char.alertState = 'suspicious';
          char.emote = { text: '❓', timer: 60 };
        }
      });
    } else {
      // Seeker Radar Ping
      sound.playRadarPing();
      const hiders = characters.filter((c) => c.role === 'hider' && !c.isCaught);
      if (hiders.length > 0) {
        // Find closest
        let closest = hiders[0];
        let minDist = 99999;
        for (const h of hiders) {
          const d = Math.hypot(h.x - player.x, h.y - player.y);
          if (d < minDist) {
            minDist = d;
            closest = h;
          }
        }
        const angle = Math.atan2(closest.y - player.y, closest.x - player.x);
        setRadarPulseAngle(angle);
        setTimeout(() => setRadarPulseAngle(null), 3000);
      }
      setAbility1Cooldown(25);
      distractionsCount.current++;
      player.emote = { text: '📡', timer: 60 };
    }
  };

  // Ability 2: Smoke screen (Hider) or Flashlight high-beam dash (Seeker)
  const useAbility2 = () => {
    if (ability2Cooldown > 0 || phase === 'waiting' || phase === 'ended') return;
    const player = characters.find((c) => c.id === 'player');
    if (!player || player.isCaught) return;

    if (player.role === 'hider') {
      // Drop Smoke Screen
      sound.playSmoke();
      const newSmoke: SmokeCloud = {
        x: player.x,
        y: player.y,
        radius: 120,
        opacity: 0.85,
        createdAt: Date.now(),
        duration: 4500,
      };
      setSmokeClouds((prev) => [...prev, newSmoke]);
      setAbility2Cooldown(20);
      distractionsCount.current++;
      player.emote = { text: '💨', timer: 50 };
    } else {
      // Seeker Flashlight High-Beam & Speed Burst
      sound.playAlert();
      setFlashlightBoost(true);
      setAbility2Cooldown(22);
      distractionsCount.current++;
      player.emote = { text: '⚡', timer: 60 };
      setTimeout(() => setFlashlightBoost(false), 4500);
    }
  };

  // Use Item from Inventory [Slot 1, 2, 3]
  const handleUseItem = useCallback(
    (slotIndex: number) => {
      if (phase === 'waiting' || phase === 'ended') return;
      const player = characters.find((c) => c.id === 'player');
      if (!player || player.isCaught || !player.inventory) return;

      const itemType = player.inventory[slotIndex];
      if (!itemType) return;

      // Consume item from inventory
      const updatedInv = [...player.inventory];
      updatedInv.splice(slotIndex, 1);
      player.inventory = updatedInv;

      const isVi = language === 'vi';

      switch (itemType) {
        case 'invisibility':
          player.activeBuffs = {
            ...(player.activeBuffs || {}),
            invisibilityTimeLeft: 6,
          };
          sound.playInvisibility();
          player.emote = { text: '👻', timer: 70 };
          distractionsCount.current++;
          sendChatMessage(
            'SYSTEM',
            isVi
              ? `👻 ${player.name} kích hoạt Áo Tàng Hình! Vô hình và không tiếng động trong 6s!`
              : `👻 ${player.name} activated Ghost Cloak! Invisible to sight & sound for 6s!`
          );
          break;

        case 'decoy':
          setActiveDecoys((prev) => [
            ...prev,
            {
              id: `decoy_${Date.now()}_${Math.random()}`,
              x: player.x,
              y: player.y,
              createdAt: Date.now(),
              duration: 8000,
              lastPulseTime: Date.now(),
            },
          ]);
          sound.playDecoyBeacon();
          player.emote = { text: '🤖', timer: 70 };
          distractionsCount.current++;
          addSoundRipple(player.x, player.y, 160, player.role, true);
          sendChatMessage(
            'SYSTEM',
            isVi
              ? `🤖 ${player.name} triển khai Thiết Bị Nghi Binh! Phát sóng âm thanh giả!`
              : `🤖 ${player.name} deployed a Holo-Decoy Beacon! Emits fake audio pulses!`
          );
          break;

        case 'stun_trap':
          setActiveTraps((prev) => [
            ...prev,
            {
              id: `trap_${Date.now()}_${Math.random()}`,
              x: player.x,
              y: player.y,
              placedByCharId: player.id,
              placedByRole: player.role,
              createdAt: Date.now(),
            },
          ]);
          sound.playTrapDeploy();
          player.emote = { text: '🪤', timer: 70 };
          distractionsCount.current++;
          sendChatMessage(
            'SYSTEM',
            isVi ? `🪤 ${player.name} đã cài đặt Bẫy Đóng Băng!` : `🪤 ${player.name} armed a Shock Frost Trap!`
          );
          break;

        case 'thermal_scanner':
          player.activeBuffs = {
            ...(player.activeBuffs || {}),
            thermalTimeLeft: 6,
          };
          sound.playThermalScan();
          player.emote = { text: '🥽', timer: 70 };
          distractionsCount.current++;
          sendChatMessage(
            'SYSTEM',
            isVi
              ? `🥽 ${player.name} bật Kính X-Ray Nhìn Xuyên Tường! Hiện rõ mọi vị trí!`
              : `🥽 ${player.name} engaged Thermal X-Ray Visor! Revealing all locations!`
          );
          break;

        case 'speed_boost':
          player.activeBuffs = {
            ...(player.activeBuffs || {}),
            speedBoostTimeLeft: 6,
          };
          player.stamina = player.maxStamina;
          sound.playSpeedBoost();
          player.emote = { text: '⚡', timer: 70 };
          distractionsCount.current++;
          sendChatMessage(
            'SYSTEM',
            isVi
              ? `⚡ ${player.name} tiêm Ống Adrenaline (+70% Tốc Độ Phóng)!`
              : `⚡ ${player.name} injected Adrenaline Syringe (+70% Speed Surge)!`
          );
          break;
      }

      setCharacters([...characters]);
    },
    [characters, phase, addSoundRipple, sendChatMessage, language]
  );

  // Handle solved question spot
  const handleQuestionSolved = (spot: HidingSpot) => {
    spot.isQuestionSolved = true;
    setActiveQuestionSpot(null);
    solvedQuestionsInMatch.current += 1;
    const player = characters.find((c) => c.id === 'player');
    if (!player || player.isCaught) return;

    const isVi = language === 'vi';
    player.hidingSpotId = spot.id;
    spot.occupantId = player.id;
    player.stamina = player.maxStamina;
    player.activeBuffs = {
      ...(player.activeBuffs || {}),
      speedBoostTimeLeft: 3,
    };
    sound.playLockerInteract(true);
    player.emote = { text: '🧠 Hidden!', timer: 60 };
    const spotName = isVi
      ? spot.type === 'wardrobe'
        ? 'tủ quần áo'
        : spot.type === 'recycle_bin'
        ? 'thùng rác tái chế'
        : spot.type === 'crate'
        ? 'thùng gỗ'
        : spot.type === 'locker'
        ? 'tủ sắt'
        : spot.type === 'bush'
        ? 'bụi cây ngụy trang'
        : 'rương tri thức lớp 6'
      : spot.type;
    sendChatMessage(
      'SYSTEM',
      isVi
        ? `✨ ${player.name} đã giải đúng câu hỏi lớp 6 và trốn vào ${spotName}!`
        : `✨ ${player.name} solved the Grade 6 quiz and slipped inside the ${spotName}!`
    );
  };

  // Handle live duration edits from Lobby or HUD
  const handleDurationChange = (newDuration: number) => {
    const validDuration = Math.max(15, Math.min(1800, Math.round(newDuration)));
    const prevDuration = matchDurationRef.current;
    matchDurationRef.current = validDuration;
    setMatchDuration(validDuration);

    if (phase === 'seeking') {
      const delta = validDuration - prevDuration;
      setPhaseTimeLeft((prev) => Math.max(5, Math.round(prev + delta)));
    }
  };

  // Direct live adjustment of current phase timer
  const handleAdjustTimeLeft = (newSeconds: number) => {
    const validSecs = Math.max(5, Math.min(1800, Math.round(newSeconds)));
    setPhaseTimeLeft(validSecs);
    if (phase === 'seeking') {
      if (validSecs > matchDurationRef.current) {
        matchDurationRef.current = validSecs;
        setMatchDuration(validSecs);
      }
    }
  };

  // Interaction logic (Enter/Exit Crate, Wardrobe, Recycle Bin, Question Box, Search, Tag Hider)
  const handleInteract = () => {
    const player = characters.find((c) => c.id === 'player');
    if (!player || player.isCaught) return;

    if (player.role === 'hider') {
      // If already inside a hiding spot -> exit it!
      if (player.hidingSpotId) {
        const spot = selectedMap.hidingSpots.find((s) => s.id === player.hidingSpotId);
        if (spot) spot.occupantId = undefined;
        player.hidingSpotId = undefined;
        sound.playLockerInteract(false);
        player.emote = { text: '🚶', timer: 30 };
        return;
      }

      // Check nearby unoccupied spot (crate, locker, wardrobe, recycle_bin, question_box)
      const nearbySpot = selectedMap.hidingSpots.find((s) => {
        if (
          s.type !== 'crate' &&
          s.type !== 'locker' &&
          s.type !== 'wardrobe' &&
          s.type !== 'recycle_bin' &&
          s.type !== 'question_box'
        )
          return false;
        if (s.occupantId && s.occupantId !== player.id) return false;
        const cx = s.x + s.width / 2;
        const cy = s.y + s.height / 2;
        return Math.hypot(player.x - cx, player.y - cy) < 60;
      });

      if (nearbySpot) {
        // If this spot requires solving a riddle / question and hasn't been solved yet
        if (nearbySpot.question && !nearbySpot.isQuestionSolved) {
          setActiveQuestionSpot(nearbySpot);
          return;
        }

        player.hidingSpotId = nearbySpot.id;
        nearbySpot.occupantId = player.id;
        sound.playLockerInteract(true);
        const emoteIcon =
          nearbySpot.type === 'wardrobe'
            ? '🚪'
            : nearbySpot.type === 'recycle_bin'
            ? '♻️'
            : nearbySpot.type === 'question_box'
            ? '❓'
            : '📦';
        player.emote = { text: emoteIcon, timer: 45 };
      }
    } else {
      // Seeker interaction: Tag nearby hider or Search nearby spot
      // 1. Tag attempt on nearby alive hider
      const nearbyHider = characters.find(
        (c) =>
          c.role === 'hider' &&
          !c.isCaught &&
          !c.hidingSpotId &&
          Math.hypot(c.x - player.x, c.y - player.y) < 50
      );

      const isVi = language === 'vi';

      if (nearbyHider) {
        nearbyHider.isCaught = true;
        sound.playCatch();
        player.emote = { text: '🎯', timer: 80 };
        sendChatMessage(
          player,
          isVi ? `Đã tóm gọn và bắt giữ ${nearbyHider.name}!` : `Tagged and captured ${nearbyHider.name}!`
        );

        const botCatchLines = isVi
          ? [
              `Ui da, bị ${player.name} tóm mất rồi! Mắt tinh thật đấy!`,
              `Làm sao mà ${player.name} nhìn ra tôi được vậy trời?! Hay quá!`,
              `Không thể nào, tôi tưởng mình trốn kỹ lắm rồi chứ!`,
            ]
          : [
              `Aww, you got me ${player.name}! Nice eye!`,
              `How did you spot me, ${player.name}?! Gg!`,
              `No way, ${player.name}! I thought I was hidden!`,
            ];
        const reaction = botCatchLines[Math.floor(Math.random() * botCatchLines.length)];
        nearbyHider.speech = { text: reaction, timer: 180, maxTimer: 180 };
        sendChatMessage(nearbyHider, reaction);
        sound.playRadioChat(false);
        return;
      }

      // 2. Search nearby spot (crate, locker, wardrobe, recycle_bin, question_box)
      const nearbySpot = selectedMap.hidingSpots.find((s) => {
        if (
          s.type !== 'crate' &&
          s.type !== 'locker' &&
          s.type !== 'wardrobe' &&
          s.type !== 'recycle_bin' &&
          s.type !== 'question_box'
        )
          return false;
        const cx = s.x + s.width / 2;
        const cy = s.y + s.height / 2;
        return Math.hypot(player.x - cx, player.y - cy) < 65;
      });

      if (nearbySpot) {
        sound.playLockerInteract(false);
        if (nearbySpot.occupantId) {
          const occupant = characters.find((c) => c.id === nearbySpot.occupantId);
          if (occupant && !occupant.isCaught) {
            occupant.isCaught = true;
            occupant.hidingSpotId = undefined;
            nearbySpot.occupantId = undefined;
            sound.playCatch();
            player.emote = { text: isVi ? '🔍 Bắt được!' : '🔍 Caught!', timer: 80 };
            const spotName = isVi
              ? nearbySpot.type === 'wardrobe'
                ? 'tủ quần áo'
                : nearbySpot.type === 'recycle_bin'
                ? 'thùng rác'
                : nearbySpot.type === 'question_box'
                ? 'rương tri thức lớp 6'
                : nearbySpot.type === 'crate'
                ? 'thùng gỗ'
                : 'tủ sắt'
              : nearbySpot.type;
            sendChatMessage(
              player,
              isVi
                ? `Lục soát ${spotName} và tóm gọn ${occupant.name}!`
                : `Searched ${nearbySpot.type} and caught ${occupant.name}!`
            );

            const lockerCatchLines = isVi
              ? [
                  `Trời ơi, sao ${player.name} lại mở trúng tủ của tôi chứ!`,
                  `Nãy giờ nín thở muốn xỉu luôn mà vẫn bị ${player.name} bắt! Gg!`,
                  `Bị lộ rồi! ${player.name} lục soát kỹ quá!`,
                ]
              : [
                  `Nooo, you found me in the ${nearbySpot.type}, ${player.name}!`,
                  `I was holding my breath so hard, ${player.name}! Gg!`,
                  `Aww, busted! Good search, ${player.name}!`,
                ];
            const reaction = lockerCatchLines[Math.floor(Math.random() * lockerCatchLines.length)];
            occupant.speech = { text: reaction, timer: 180, maxTimer: 180 };
            sendChatMessage(occupant, reaction);
            sound.playRadioChat(false);
            return;
          }
        } else {
          player.emote = { text: isVi ? '❌ Trống' : '❌ Empty', timer: 40 };
        }
      }
    }
  };

  // Keyboard Event Listeners (WASD/Arrows for move, Q/F for abilities, 1/2/3 for items, E/Space for interact)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't capture keys if typing in any input or textarea
      const targetEl = e.target as HTMLElement | null;
      if (targetEl && (targetEl.tagName === 'INPUT' || targetEl.tagName === 'TEXTAREA')) return;

      // Cycle camera with TAB
      if (e.code === 'Tab') {
        e.preventDefault();
        cycleCam();
        return;
      }

      // Escape resets camera back to player
      if (e.code === 'Escape') {
        if (camTargetId !== 'player') {
          e.preventDefault();
          setCamTargetId('player');
          return;
        }
      }

      keysPressed.current[e.code] = true;

      // Special one-press keys
      if (e.code === 'KeyQ') {
        useAbility1();
      } else if (e.code === 'KeyF') {
        useAbility2();
      } else if (e.code === 'KeyE' || e.code === 'Space') {
        handleInteract();
      } else if (e.code === 'Digit1') {
        handleUseItem(0);
      } else if (e.code === 'Digit2') {
        handleUseItem(1);
      } else if (e.code === 'Digit3') {
        handleUseItem(2);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [characters, phase, ability1Cooldown, ability2Cooldown, cycleCam, camTargetId, handleUseItem]);

  // Determine current interactive prompt for HUD
  const getInteractPrompt = () => {
    const player = characters.find((c) => c.id === 'player');
    if (!player || player.isCaught) return null;

    const isVi = language === 'vi';

    if (player.role === 'hider') {
      if (player.hidingSpotId) {
        return {
          label: isVi ? 'Rời khỏi chỗ trốn' : 'Exit Hiding Spot',
          keyLabel: 'E / SPACE',
          onAction: handleInteract,
        };
      }
      const nearbySpot = selectedMap.hidingSpots.find((s) => {
        if (
          s.type !== 'crate' &&
          s.type !== 'locker' &&
          s.type !== 'wardrobe' &&
          s.type !== 'recycle_bin' &&
          s.type !== 'question_box'
        )
          return false;
        if (s.occupantId && s.occupantId !== player.id) return false;
        const cx = s.x + s.width / 2;
        const cy = s.y + s.height / 2;
        return Math.hypot(player.x - cx, player.y - cy) < 60;
      });
      if (nearbySpot) {
        const getSpotName = (type: string) => {
          if (isVi) {
            if (type === 'wardrobe') return 'Tủ quần áo';
            if (type === 'recycle_bin') return 'Thùng rác';
            if (type === 'question_box') return 'Rương tri thức lớp 6';
            if (type === 'crate') return 'Thùng gỗ';
            return 'Tủ sắt';
          }
          if (type === 'wardrobe') return 'Wardrobe';
          if (type === 'recycle_bin') return 'Recycle Bin';
          if (type === 'question_box') return 'Grade 6 Quiz Box';
          if (type === 'crate') return 'Crate';
          return 'Locker';
        };

        if (nearbySpot.question && !nearbySpot.isQuestionSolved) {
          return {
            label: isVi ? `Thử thách: ${getSpotName(nearbySpot.type)}` : `Quiz: ${getSpotName(nearbySpot.type)}`,
            keyLabel: 'E / SPACE',
            onAction: handleInteract,
          };
        }

        return {
          label: isVi ? `Trốn vào ${getSpotName(nearbySpot.type)}` : `Hide in ${getSpotName(nearbySpot.type)}`,
          keyLabel: 'E / SPACE',
          onAction: handleInteract,
        };
      }
    } else {
      // Seeker
      const nearbyHider = characters.find(
        (c) =>
          c.role === 'hider' &&
          !c.isCaught &&
          !c.hidingSpotId &&
          Math.hypot(c.x - player.x, c.y - player.y) < 50
      );
      if (nearbyHider) {
        return {
          label: isVi ? `Bắt ${nearbyHider.name}!` : `Tag ${nearbyHider.name}!`,
          keyLabel: 'SPACE',
          onAction: handleInteract,
        };
      }

      const nearbySpot = selectedMap.hidingSpots.find((s) => {
        if (
          s.type !== 'crate' &&
          s.type !== 'locker' &&
          s.type !== 'wardrobe' &&
          s.type !== 'recycle_bin' &&
          s.type !== 'question_box'
        )
          return false;
        const cx = s.x + s.width / 2;
        const cy = s.y + s.height / 2;
        return Math.hypot(player.x - cx, player.y - cy) < 65;
      });
      if (nearbySpot) {
        const spotName = isVi
          ? nearbySpot.type === 'wardrobe'
            ? 'Tủ quần áo'
            : nearbySpot.type === 'recycle_bin'
            ? 'Thùng rác'
            : nearbySpot.type === 'question_box'
            ? 'Rương tri thức lớp 6'
            : nearbySpot.type === 'crate'
            ? 'Thùng gỗ'
            : 'Tủ sắt'
          : nearbySpot.type === 'wardrobe'
          ? 'Wardrobe'
          : nearbySpot.type === 'recycle_bin'
          ? 'Recycle Bin'
          : nearbySpot.type === 'question_box'
          ? 'Grade 6 Quiz Box'
          : nearbySpot.type === 'crate'
          ? 'Crate'
          : 'Locker';
        return {
          label: isVi ? `Lục soát ${spotName}` : `Search ${spotName}`,
          keyLabel: 'E / SPACE',
          onAction: handleInteract,
        };
      }
    }

    return null;
  };

  // MAIN GAME LOOP (Tick 60 FPS)
  useEffect(() => {
    if (phase === 'waiting' || phase === 'ended' || characters.length === 0) return;

    const interval = setInterval(() => {
      setCharacters((prevChars) => {
        const nextChars = [...prevChars];
        const player = nextChars.find((c) => c.id === 'player');
        if (!player) return prevChars;

        // 1. Process Player Movement (Keyboard or Touch)
        let moveX = 0;
        let moveY = 0;

        if (keysPressed.current['KeyW'] || keysPressed.current['ArrowUp']) moveY -= 1;
        if (keysPressed.current['KeyS'] || keysPressed.current['ArrowDown']) moveY += 1;
        if (keysPressed.current['KeyA'] || keysPressed.current['ArrowLeft']) moveX -= 1;
        if (keysPressed.current['KeyD'] || keysPressed.current['ArrowRight']) moveX += 1;

        if (touchDirection.current.dx !== 0 || touchDirection.current.dy !== 0) {
          moveX = touchDirection.current.dx;
          moveY = touchDirection.current.dy;
        }

        // Stun check on player
        if (player.stunTimer && player.stunTimer > 0) {
          player.stunTimer--;
          moveX = 0;
          moveY = 0;
        }

        // Decrement player active buffs
        if (player.activeBuffs) {
          if (player.activeBuffs.invisibilityTimeLeft && player.activeBuffs.invisibilityTimeLeft > 0) {
            player.activeBuffs.invisibilityTimeLeft = Math.max(0, player.activeBuffs.invisibilityTimeLeft - 1 / 60);
          }
          if (player.activeBuffs.thermalTimeLeft && player.activeBuffs.thermalTimeLeft > 0) {
            player.activeBuffs.thermalTimeLeft = Math.max(0, player.activeBuffs.thermalTimeLeft - 1 / 60);
          }
          if (player.activeBuffs.speedBoostTimeLeft && player.activeBuffs.speedBoostTimeLeft > 0) {
            player.activeBuffs.speedBoostTimeLeft = Math.max(0, player.activeBuffs.speedBoostTimeLeft - 1 / 60);
          }
        }

        const hasSpeedBuff = (player.activeBuffs?.speedBoostTimeLeft || 0) > 0;
        const hasInvisibility = (player.activeBuffs?.invisibilityTimeLeft || 0) > 0;

        // Normalise diagonal speed
        const moveLen = Math.hypot(moveX, moveY);
        if (moveLen > 0) {
          moveX /= moveLen;
          moveY /= moveLen;
        }

        const isSprinting =
          (keysPressed.current['ShiftLeft'] || keysPressed.current['ShiftRight'] || player.isSprinting) &&
          player.stamina > 5 &&
          moveLen > 0;
        const isCrouching =
          (keysPressed.current['KeyC'] || keysPressed.current['ControlLeft'] || player.isCrouching) &&
          !isSprinting;

        player.isSprinting = isSprinting;
        player.isCrouching = isCrouching;

        // Stamina management
        if (hasSpeedBuff) {
          player.stamina = player.maxStamina;
        } else if (isSprinting) {
          player.stamina = Math.max(0, player.stamina - 0.5);
        } else {
          player.stamina = Math.min(player.maxStamina, player.stamina + 0.25);
        }

        // Aim angle towards mouse cursor (or move direction if using touch)
        if (mouseWorldPos.current.x !== 0 || mouseWorldPos.current.y !== 0) {
          player.angle = Math.atan2(
            mouseWorldPos.current.y - player.y,
            mouseWorldPos.current.x - player.x
          );
        } else if (moveLen > 0) {
          player.angle = Math.atan2(moveY, moveX);
        }

        // Apply movement speed if not inside a crate/locker
        if (!player.hidingSpotId && !player.isCaught) {
          let currentSpeed = player.speed;
          if (isSprinting) currentSpeed *= 1.65;
          if (isCrouching) currentSpeed *= 0.55;
          if (flashlightBoost && player.role === 'seeker') currentSpeed *= 1.35;
          if (hasSpeedBuff) currentSpeed *= 1.7;

          // Axis-separated collision for smooth wall sliding
          const posX = resolveWallCollision(
            { x: player.x + moveX * currentSpeed, y: player.y },
            player.radius,
            selectedMap.walls,
            selectedMap.width,
            selectedMap.height
          );
          const posY = resolveWallCollision(
            { x: posX.x, y: posX.y + moveY * currentSpeed },
            player.radius,
            selectedMap.walls,
            selectedMap.width,
            selectedMap.height
          );
          player.x = posY.x;
          player.y = posY.y;

          // Check if player stepped inside a bush
          player.isInBush = selectedMap.hidingSpots.some((s) => {
            if (s.type !== 'bush') return false;
            const cx = s.x + s.width / 2;
            const cy = s.y + s.height / 2;
            return Math.hypot(player.x - cx, player.y - cy) < s.width / 2;
          });

          // Sound ripples & footsteps when moving
          if (moveLen > 0 && Math.random() < (isSprinting ? 0.25 : 0.12)) {
            if (!isCrouching && !hasInvisibility) {
              sound.playFootstep(isSprinting);
              addSoundRipple(player.x, player.y, isSprinting ? 150 : 65, player.role);
            }
            // Footstep visual decal
            setFootsteps((prevSteps) => [
              ...prevSteps.slice(-30),
              {
                x: player.x,
                y: player.y,
                angle: player.angle,
                opacity: isCrouching ? 0.2 : hasInvisibility ? 0.1 : 0.6,
                color: player.role === 'seeker' ? '#fca5a5' : '#93c5fd',
                createdAt: Date.now(),
              },
            ]);
          }
        }

        // 2. Update all Bot Characters
        for (const bot of nextChars) {
          if (!bot.isBot) continue;

          // Check bot stun
          if (bot.stunTimer && bot.stunTimer > 0) {
            bot.stunTimer--;
            bot.vx = 0;
            bot.vy = 0;
          }

          // Decrement bot active buffs
          if (bot.activeBuffs) {
            if (bot.activeBuffs.invisibilityTimeLeft && bot.activeBuffs.invisibilityTimeLeft > 0) {
              bot.activeBuffs.invisibilityTimeLeft = Math.max(0, bot.activeBuffs.invisibilityTimeLeft - 1 / 60);
            }
            if (bot.activeBuffs.thermalTimeLeft && bot.activeBuffs.thermalTimeLeft > 0) {
              bot.activeBuffs.thermalTimeLeft = Math.max(0, bot.activeBuffs.thermalTimeLeft - 1 / 60);
            }
            if (bot.activeBuffs.speedBoostTimeLeft && bot.activeBuffs.speedBoostTimeLeft > 0) {
              bot.activeBuffs.speedBoostTimeLeft = Math.max(0, bot.activeBuffs.speedBoostTimeLeft - 1 / 60);
            }
          }

          // Bot smart item usage
          if (bot.inventory && bot.inventory.length > 0 && !bot.isCaught && !bot.hidingSpotId && phase === 'seeking') {
            if (bot.role === 'hider' && (bot.alertState === 'chasing' || bot.alertState === 'panicking')) {
              const invIdx = bot.inventory.findIndex(
                (t) => t === 'invisibility' || t === 'speed_boost' || t === 'decoy' || t === 'stun_trap'
              );
              if (invIdx !== -1 && Math.random() < 0.05) {
                const it = bot.inventory[invIdx];
                bot.inventory.splice(invIdx, 1);
                if (it === 'invisibility') {
                  bot.activeBuffs = { ...(bot.activeBuffs || {}), invisibilityTimeLeft: 6 };
                  bot.emote = { text: '👻', timer: 60 };
                  sound.playInvisibility();
                } else if (it === 'speed_boost') {
                  bot.activeBuffs = { ...(bot.activeBuffs || {}), speedBoostTimeLeft: 6 };
                  bot.emote = { text: '⚡', timer: 60 };
                  sound.playSpeedBoost();
                } else if (it === 'decoy') {
                  setActiveDecoys((prev) => [
                    ...prev,
                    {
                      id: `decoy_${Date.now()}_${Math.random()}`,
                      x: bot.x,
                      y: bot.y,
                      createdAt: Date.now(),
                      duration: 8000,
                      lastPulseTime: Date.now(),
                    },
                  ]);
                  sound.playDecoyBeacon();
                  bot.emote = { text: '🤖', timer: 60 };
                } else if (it === 'stun_trap') {
                  setActiveTraps((prev) => [
                    ...prev,
                    {
                      id: `trap_${Date.now()}_${Math.random()}`,
                      x: bot.x,
                      y: bot.y,
                      placedByCharId: bot.id,
                      placedByRole: bot.role,
                      createdAt: Date.now(),
                    },
                  ]);
                  sound.playTrapDeploy();
                  bot.emote = { text: '🪤', timer: 60 };
                }
              }
            } else if (bot.role === 'seeker') {
              const invIdx = bot.inventory.findIndex(
                (t) => t === 'thermal_scanner' || t === 'speed_boost' || t === 'stun_trap'
              );
              if (invIdx !== -1 && Math.random() < 0.04) {
                const it = bot.inventory[invIdx];
                bot.inventory.splice(invIdx, 1);
                if (it === 'thermal_scanner') {
                  bot.activeBuffs = { ...(bot.activeBuffs || {}), thermalTimeLeft: 6 };
                  bot.emote = { text: '🥽', timer: 60 };
                  sound.playThermalScan();
                } else if (it === 'speed_boost') {
                  bot.activeBuffs = { ...(bot.activeBuffs || {}), speedBoostTimeLeft: 6 };
                  bot.emote = { text: '⚡', timer: 60 };
                  sound.playSpeedBoost();
                } else if (it === 'stun_trap') {
                  setActiveTraps((prev) => [
                    ...prev,
                    {
                      id: `trap_${Date.now()}_${Math.random()}`,
                      x: bot.x,
                      y: bot.y,
                      placedByCharId: bot.id,
                      placedByRole: bot.role,
                      createdAt: Date.now(),
                    },
                  ]);
                  sound.playTrapDeploy();
                  bot.emote = { text: '🪤', timer: 60 };
                }
              }
            }
          }

          // Check bush status for bot
          bot.isInBush = selectedMap.hidingSpots.some((s) => {
            if (s.type !== 'bush') return false;
            const cx = s.x + s.width / 2;
            const cy = s.y + s.height / 2;
            return Math.hypot(bot.x - cx, bot.y - cy) < s.width / 2;
          });

          updateBotAI(
            bot,
            nextChars,
            selectedMap,
            phase,
            phaseTimeLeft,
            difficulty,
            addSoundRipple,
            sendChatMessage,
            languageRef.current
          );

          // Apply bot movement with wall sliding and anti-stuck corner recovery
          if (!bot.hidingSpotId && !bot.isCaught) {
            const botX = resolveWallCollision(
              { x: bot.x + bot.vx, y: bot.y },
              bot.radius,
              selectedMap.walls,
              selectedMap.width,
              selectedMap.height
            );
            const botY = resolveWallCollision(
              { x: botX.x, y: botX.y + bot.vy },
              bot.radius,
              selectedMap.walls,
              selectedMap.width,
              selectedMap.height
            );

            const movedDist = Math.hypot(botY.x - bot.x, botY.y - bot.y);
            const intendedDist = Math.hypot(bot.vx, bot.vy);
            if (intendedDist > 0.5 && movedDist < 0.2) {
              bot.stuckCounter = (bot.stuckCounter || 0) + 1;
              if (bot.stuckCounter > 15) {
                bot.angle += (Math.random() > 0.5 ? 1 : -1) * (Math.PI * 0.65);
                bot.vx = Math.cos(bot.angle) * bot.speed * 0.8;
                bot.vy = Math.sin(bot.angle) * bot.speed * 0.8;
                bot.targetPos = undefined;
                bot.stuckCounter = 0;
              }
            } else {
              bot.stuckCounter = 0;
            }

            bot.x = botY.x;
            bot.y = botY.y;
          }

          // Decrease emote & speech timers
          if (bot.emote && bot.emote.timer > 0) {
            bot.emote.timer--;
          }
          if (bot.speech && bot.speech.timer > 0) {
            bot.speech.timer--;
          }
        }

        if (player.emote && player.emote.timer > 0) {
          player.emote.timer--;
        }
        if (player.speech && player.speech.timer > 0) {
          player.speech.timer--;
        }

        // Proximity & event whispers from bots to player
        checkInGameProximityDialogue(
          player,
          nextChars,
          phase,
          phaseTimeLeft,
          (bot, text) => {
            bot.speech = { text, timer: 190, maxTimer: 190 };
            sendChatMessage(bot, text);
            sound.playRadioChat(bot.role === 'seeker');
          },
          languageRef.current
        );

        // 3. Heartbeat & Seeker Proximity Tension
        if (player.role === 'hider' && !player.isCaught) {
          const seekers = nextChars.filter((c) => c.role === 'seeker');
          let minDist = 99999;
          for (const s of seekers) {
            const d = Math.hypot(s.x - player.x, s.y - player.y);
            if (d < minDist) minDist = d;
          }

          const ratio = Math.min(1, minDist / 450);
          setTensionLevel(1 - ratio);
          sound.updateHeartbeat(ratio);

          // Close call metric: seeker within 120px without catching
          if (minDist < 120 && Math.random() < 0.02) {
            closeCallsCount.current++;
          }
        }

        // 4. Seeker Catch Check on Player
        if (player.role === 'hider' && !player.isCaught && phase === 'seeking') {
          for (const s of nextChars.filter((c) => c.role === 'seeker')) {
            const dist = Math.hypot(s.x - player.x, s.y - player.y);
            if (dist < 40) {
              player.isCaught = true;
              sound.playCatch();
              sound.playRadioChat(true);

              const isVi = languageRef.current === 'vi';
              const catchTaunts = isVi
                ? [
                    `Đã tóm được ${player.name}! Hết đường chạy nhé!`,
                    `Bắt được cậu rồi ${player.name}! Nhưng trốn cũng đỉnh đấy!`,
                    `Thấy cậu rồi nhé ${player.name}!`,
                  ]
                : [
                    `Caught ${player.name}! Nowhere left to run!`,
                    `Gotcha, ${player.name}! Nice hiding spot though!`,
                    `Found you, ${player.name}!`,
                  ];
              const taunt = catchTaunts[Math.floor(Math.random() * catchTaunts.length)];
              s.speech = { text: taunt, timer: 180, maxTimer: 180 };
              sendChatMessage(s, taunt);
              player.emote = { text: '💀', timer: 120 };
            }
          }
        }

        // 5. Item Pickup Check (Player & Bots)
        setWorldItems((prevItems) => {
          if (prevItems.length === 0) return prevItems;
          let changed = false;
          const remaining: WorldItem[] = [];

          for (const item of prevItems) {
            let picked = false;
            // Check player
            if (!player.isCaught && !player.hidingSpotId) {
              const dist = Math.hypot(player.x - item.x, player.y - item.y);
              if (dist < 34) {
                const inv = player.inventory || [];
                if (inv.length < 3) {
                  player.inventory = [...inv, item.type];
                  sound.playItemPickup();
                  player.emote = { text: item.icon, timer: 60 };
                  const isVi = languageRef.current === 'vi';
                  sendChatMessage(
                    'SYSTEM',
                    isVi
                      ? `📦 ${player.name} đã nhặt được ${item.name}! [Ô đồ ${player.inventory.length}]`
                      : `📦 ${player.name} picked up ${item.name}! [Slot ${player.inventory.length}]`
                  );
                  picked = true;
                  changed = true;
                }
              }
            }

            // Check bots
            if (!picked) {
              for (const bot of nextChars) {
                if (bot.isBot && !bot.isCaught && !bot.hidingSpotId) {
                  const dist = Math.hypot(bot.x - item.x, bot.y - item.y);
                  if (dist < 30) {
                    const inv = bot.inventory || [];
                    if (inv.length < 2) {
                      bot.inventory = [...inv, item.type];
                      bot.emote = { text: item.icon, timer: 45 };
                      picked = true;
                      changed = true;
                      break;
                    }
                  }
                }
              }
            }

            if (!picked) {
              remaining.push(item);
            }
          }
          return changed ? remaining : prevItems;
        });

        // 6. Active Traps Trigger Detection
        setActiveTraps((prevTraps) => {
          if (prevTraps.length === 0) return prevTraps;
          const now = Date.now();
          let changed = false;
          const updated = prevTraps.filter((trap) => {
            if (trap.triggered) {
              return now - trap.createdAt < 2500;
            }
            for (const char of nextChars) {
              if (char.isCaught || char.hidingSpotId) continue;
              if (char.role === trap.placedByRole) continue;
              const d = Math.hypot(char.x - trap.x, char.y - trap.y);
              if (d < 30) {
                trap.triggered = true;
                trap.createdAt = now;
                char.stunTimer = 180; // 3 seconds freeze at 60 FPS
                sound.playTrapTrigger();
                char.emote = { text: '💫', timer: 90 };
                const isVi = languageRef.current === 'vi';
                char.speech = {
                  text: isVi ? 'Á! Dính phải bẫy choáng rồi!' : 'Ack! Snared by a shock trap!',
                  timer: 120,
                  maxTimer: 120,
                };
                sendChatMessage(
                  'SYSTEM',
                  isVi
                    ? `⚡ ${char.name} đạp trúng Bẫy Đóng Băng! Bị bất động 3 giây!`
                    : `⚡ ${char.name} stepped into a Shock Frost Trap! Stunned for 3 seconds!`
                );
                changed = true;
                break;
              }
            }
            return true;
          });
          return changed ? [...updated] : prevTraps;
        });

        return nextChars;
      });

      // Expand sound ripples
      setSoundRipples((prev) =>
        prev
          .map((r) => ({
            ...r,
            radius: r.radius + (r.maxRadius - r.radius) * 0.15,
            opacity: r.opacity - 0.04,
          }))
          .filter((r) => r.opacity > 0.02)
      );

      // Decoy pulses
      setActiveDecoys((prevDecoys) => {
        if (prevDecoys.length === 0) return prevDecoys;
        const now = Date.now();
        return prevDecoys.filter((decoy) => {
          if (now - decoy.createdAt > decoy.duration) return false;
          if (now - decoy.lastPulseTime > 1400) {
            decoy.lastPulseTime = now;
            addSoundRipple(decoy.x, decoy.y, 150, 'hider', true);
            sound.playDecoyBeacon();
          }
          return true;
        });
      });

      // Ability cooldown timers
      setAbility1Cooldown((prev) => Math.max(0, prev - 1 / 60));
      setAbility2Cooldown((prev) => Math.max(0, prev - 1 / 60));
    }, 1000 / 60);

    return () => clearInterval(interval);
  }, [phase, selectedMap, difficulty, addSoundRipple, sendChatMessage, phaseTimeLeft, flashlightBoost]);

  // MATCH TIMER COUNTDOWN & WIN CONDITION MONITOR
  useEffect(() => {
    if (phase === 'waiting' || phase === 'ended') return;

    const timer = setInterval(() => {
      setPhaseTimeLeft((prev) => {
        if (prev <= 1) {
          // Phase transition
          if (phase === 'hiding') {
            // Transition to Seeking Phase!
            sound.playAlert();
            const isVi = languageRef.current === 'vi';
            sendChatMessage(
              'SYSTEM',
              isVi ? 'HẾT GIỜ TRỐN! THỢ SĂN ĐANG XUẤT PHÁT! 🚨' : 'READY OR NOT, HERE COME THE SEEKERS! 🚨',
              'seeker'
            );
            setPhase('seeking');
            return matchDurationRef.current;
          } else if (phase === 'seeking') {
            // Time expired: Hiders Win!
            endMatch('timeout');
            return 0;
          }
        }

        if (prev <= 4 && phase === 'hiding') {
          sound.playCountdownTick(prev === 1);
        }

        // Periodic item respawn during seeking phase
        if (phase === 'seeking' && Math.random() < 0.25) {
          setWorldItems((prev) => {
            if (prev.length >= 6) return prev;
            const newItem = spawnSingleItem(selectedMap, prev);
            return newItem ? [...prev, newItem] : prev;
          });
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [phase, selectedMap]);

  // Check if all hiders are caught
  useEffect(() => {
    if (phase !== 'seeking') return;

    const hiders = characters.filter((c) => c.role === 'hider');
    if (hiders.length === 0) return;

    const aliveHiders = hiders.filter((c) => !c.isCaught);
    if (aliveHiders.length === 0) {
      // All hiders caught -> Seekers win!
      endMatch('all_caught');
    }
  }, [characters, phase]);

  // End match logic
  const endMatch = (reason: 'timeout' | 'all_caught') => {
    setPhase('ended');
    sound.stopHeartbeat();

    const playerChar = characters.find((c) => c.id === 'player');
    const playerRole = playerChar?.role || selectedRole;
    const hiders = characters.filter((c) => c.role === 'hider');
    const caughtCount = hiders.filter((c) => c.isCaught).length;

    let won = false;
    if (playerRole === 'hider') {
      won = reason === 'timeout' && (!playerChar || !playerChar.isCaught);
    } else {
      won = reason === 'all_caught';
    }

    if (won) {
      sound.playVictory();
    } else {
      sound.playDefeat();
    }

    const elapsedSeconds = Math.round((Date.now() - matchStartTime.current) / 1000);

    const stats: GameStats = {
      timeSurvived: elapsedSeconds,
      hidersCaught: caughtCount,
      totalHiders: hiders.length,
      closeCalls: closeCallsCount.current,
      distractionsUsed: distractionsCount.current,
      won,
      role: playerRole,
    };

    setGameStats(stats);
    const updatedProfile = recordMatchResult(stats, solvedQuestionsInMatch.current);
    setPlayerProfile(updatedProfile);
    setIsGameOverOpen(true);
  };

  const currentPlayer = characters.find((c) => c.id === 'player') || {
    id: 'player',
    name: playerName,
    isBot: false,
    role: selectedRole,
    color: playerProfile.color || '#3b82f6',
    avatar: playerProfile.avatar || '🕵️',
    isHumanVerified: playerProfile.isHumanVerified,
    x: selectedMap.hiderSpawn.x,
    y: selectedMap.hiderSpawn.y,
    vx: 0,
    vy: 0,
    angle: 0,
    speed: 3.4,
    radius: 16,
    stamina: 100,
    maxStamina: 100,
    isSprinting: false,
    isCrouching: false,
    isCaught: false,
    isInBush: false,
    tagCooldown: 0,
    abilityCooldown: 0,
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans text-slate-100 select-none">
      {/* 2D Canvas Engine */}
      <GameCanvas
        map={selectedMap}
        characters={characters}
        player={currentPlayer}
        camTargetId={camTargetId}
        phase={phase}
        soundRipples={soundRipples}
        footsteps={footsteps}
        smokeClouds={smokeClouds}
        radarPulseAngle={radarPulseAngle}
        flashlightBoost={flashlightBoost}
        worldItems={worldItems}
        activeTraps={activeTraps}
        activeDecoys={activeDecoys}
        language={language}
        onCanvasClick={() => {
          // If in-game, trigger ability 1 or interact
          if (phase === 'seeking' || phase === 'hiding') {
            useAbility1();
          }
        }}
      />

      {/* Bot Camera Spectator Overlay & Activity Monitor */}
      {phase !== 'waiting' && phase !== 'ended' && (
        <BotCamOverlay
          characters={characters}
          player={currentPlayer}
          camTargetId={camTargetId}
          map={selectedMap}
          phase={phase}
          language={language}
          onSelectTarget={(targetId) => setCamTargetId(targetId)}
        />
      )}

      {/* Main Game Heads-Up Display (HUD) */}
      {phase !== 'waiting' && (
        <>
          <HUD
            player={currentPlayer}
            characters={characters}
            camTargetId={camTargetId}
            onSelectCamTarget={(targetId) => setCamTargetId(targetId)}
            onCycleCam={cycleCam}
            phase={phase}
            phaseTimeLeft={phaseTimeLeft}
            map={selectedMap}
            isMuted={isMuted}
            language={language}
            profile={playerProfile}
            onOpenProfile={() => setIsProfileOpen(true)}
            onOpenCaptcha={() => setIsCaptchaOpen(true)}
            onToggleLanguage={handleToggleLanguage}
            onToggleMute={handleToggleMute}
            onUseAbility1={useAbility1}
            onUseAbility2={useAbility2}
            ability1Cooldown={ability1Cooldown}
            ability2Cooldown={ability2Cooldown}
            onUseItem={handleUseItem}
            interactPrompt={getInteractPrompt()}
            tensionLevel={tensionLevel}
            onAdjustTimeLeft={handleAdjustTimeLeft}
            onOpenHelp={() => setIsHelpOpen(true)}
            onOpenSettings={() => setIsLobbyOpen(true)}
            isMobileMode={isMobileMode}
            onToggleMobileMode={() => {
              setIsMobileMode((prev) => {
                const next = !prev;
                if (!next) {
                  touchDirection.current = { dx: 0, dy: 0 };
                }
                return next;
              });
            }}
            isTacticalMapOpen={isTacticalMapOpen}
            onToggleTacticalMap={() => setIsTacticalMapOpen((prev) => !prev)}
          />

          {/* In-Game Radio Chat Feed */}
          <GameChat
            messages={chatMessages}
            player={currentPlayer}
            language={language}
            onSendMessage={handlePlayerSendMessage}
            isOpenControlled={isMobileMode ? isMobileChatOpen : undefined}
            onToggleOpen={() => setIsMobileChatOpen((prev) => !prev)}
          />

          {/* Touch / Mobile Controls */}
          {isMobileMode ? (
            <MobileControls
              player={currentPlayer}
              onMoveDirection={(dx, dy) => {
                touchDirection.current = { dx, dy };
              }}
              onSprintToggle={() => {
                currentPlayer.isSprinting = !currentPlayer.isSprinting;
              }}
              onSneakToggle={() => {
                currentPlayer.isCrouching = !currentPlayer.isCrouching;
              }}
              onInteract={handleInteract}
              onAbility1={useAbility1}
              onAbility2={useAbility2}
              ability1Cooldown={ability1Cooldown}
              ability2Cooldown={ability2Cooldown}
              onUseItem={handleUseItem}
              onCycleCam={cycleCam}
              onToggleMiniMap={() => setIsTacticalMapOpen((prev) => !prev)}
              onToggleChat={() => setIsMobileChatOpen((prev) => !prev)}
              interactPrompt={getInteractPrompt()}
              language={language}
            />
          ) : (
            <TouchControls
              player={currentPlayer}
              onSprintToggle={() => {
                currentPlayer.isSprinting = !currentPlayer.isSprinting;
              }}
              onSneakToggle={() => {
                currentPlayer.isCrouching = !currentPlayer.isCrouching;
              }}
              onInteract={handleInteract}
              onAbility1={useAbility1}
              onAbility2={useAbility2}
              isInteractAvailable={getInteractPrompt() !== null}
            />
          )}
        </>
      )}

      {/* Lobby / Matchmaking Setup Modal */}
      <LobbyModal
        isOpen={isLobbyOpen}
        isGameActive={phase === 'seeking' || phase === 'hiding'}
        onClose={() => setIsLobbyOpen(false)}
        playerName={playerName}
        selectedRole={selectedRole}
        selectedMap={selectedMap}
        botCount={botCount}
        seekerCount={seekerCount}
        difficulty={difficulty}
        matchDuration={matchDuration}
        language={language}
        profile={playerProfile}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenCaptcha={() => setIsCaptchaOpen(true)}
        onUpdateName={handleUpdatePlayerName}
        onSelectRole={setSelectedRole}
        onSelectMap={setSelectedMap}
        onSelectBotCount={setBotCount}
        onSelectSeekerCount={setSeekerCount}
        onSelectDifficulty={setDifficulty}
        onSelectDuration={handleDurationChange}
        onSelectLanguage={setLanguage}
        onStartMatch={startMatch}
      />

      {/* Riddle Question Hiding Spot Modal */}
      {activeQuestionSpot && (
        <QuestionHideModal
          spot={activeQuestionSpot}
          language={language}
          onClose={() => setActiveQuestionSpot(null)}
          onSuccess={handleQuestionSolved}
        />
      )}

      {/* Game Over / Victory Modal */}
      {isGameOverOpen && (
        <GameOverModal
          stats={gameStats}
          language={language}
          profile={playerProfile}
          onOpenProfile={() => setIsProfileOpen(true)}
          onPlayAgain={startMatch}
          onOpenLobby={() => {
            setIsGameOverOpen(false);
            setIsLobbyOpen(true);
          }}
        />
      )}

      {/* Player Profile & Customization Modal */}
      <ProfileModal
        isOpen={isProfileOpen}
        profile={playerProfile}
        language={language}
        onClose={() => setIsProfileOpen(false)}
        onSaveProfile={handleUpdateProfile}
        onOpenCaptcha={() => {
          setIsProfileOpen(false);
          setIsCaptchaOpen(true);
        }}
      />

      {/* Human Verification "I'm not a robot" Captcha Modal */}
      <CaptchaModal
        isOpen={isCaptchaOpen}
        language={language}
        onClose={() => setIsCaptchaOpen(false)}
        onVerified={handleVerifiedCaptcha}
      />

      {/* How to Play / Guide Modal */}
      <HowToPlayModal
        isOpen={isHelpOpen}
        language={language}
        onClose={() => setIsHelpOpen(false)}
      />
    </div>
  );
}
