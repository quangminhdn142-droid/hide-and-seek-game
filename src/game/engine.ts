import {
  Character,
  GameMap,
  GamePhase,
  HidingSpot,
  PlayerRole,
  Position,
  SoundRipple,
  Wall,
  Footstep,
  SmokeCloud,
  ChatMessage,
  AIDifficulty,
  Language,
  PlayerProfile,
} from '../types';
import { sound } from '../utils/sound';

export const BOT_NAMES_EN = [
  'Shadow Fox',
  'Sneaky Sam',
  'Panicked Pete',
  'Clever Chloe',
  'Ghost Walker',
  'Swift Jax',
  'Quiet Quinn',
  'Frosty Lynx',
  'Spectre Kai',
  'Echo Vance',
  'Viper Nova',
  'Shadow Blade',
  'Phantom Neo',
  'Zephyr Blaze',
];

export const BOT_NAMES_VI = [
  'Ninja Nam',
  'Bóng Ma Huy',
  'Mèo Đêm',
  'Tí Hon',
  'Thợ Lặn Phong',
  'Mystic Mai',
  'Sát Thủ Bi',
  'Tùng Xảo Quyệt',
  'Hổ Vằn Quân',
  'Bảo Ẩn Thân',
  'Linh Nhanh Nhẹn',
  'Minh Tàng Hình',
  'Đức Du Kích',
  'Hà Bí Ẩn',
];

export const BOT_NAMES = BOT_NAMES_VI;

export const SEEKER_NAMES_EN = [
  'Hunter Rex',
  'Watcher Unit',
  'Eagle Eye',
  'Hound Dog',
  'Trackmaster Fox',
  'Radar Sentinel',
  'Night Stalker',
  'Apex Hunter',
];

export const SEEKER_NAMES_VI = [
  'Thợ Săn Tuấn',
  'Cảnh Vệ Sơn',
  'Mắt Đại Bàng',
  'Thợ Săn Phong',
  'Truy Vết Nam',
  'Lính Canh Radar',
  'Thợ Săn Hổ',
  'Báo Đêm Huy',
];

export const SEEKER_NAMES = SEEKER_NAMES_VI;

// Helper: Check if line intersects rectangle (Wall)
export function lineIntersectsRect(
  p1: Position,
  p2: Position,
  rect: { x: number; y: number; width: number; height: number }
): boolean {
  // Check if either point is inside the rect
  if (
    p1.x >= rect.x &&
    p1.x <= rect.x + rect.width &&
    p1.y >= rect.y &&
    p1.y <= rect.y + rect.height
  ) {
    return true;
  }
  if (
    p2.x >= rect.x &&
    p2.x <= rect.x + rect.width &&
    p2.y >= rect.y &&
    p2.y <= rect.y + rect.height
  ) {
    return true;
  }

  // Check intersection with all 4 bounding lines of rect
  const rLeft = rect.x;
  const rRight = rect.x + rect.width;
  const rTop = rect.y;
  const rBottom = rect.y + rect.height;

  function lineIntersectsLine(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    x3: number,
    y3: number,
    x4: number,
    y4: number
  ): boolean {
    const denom = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);
    if (denom === 0) return false;
    const ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denom;
    const ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denom;
    return ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1;
  }

  if (lineIntersectsLine(p1.x, p1.y, p2.x, p2.y, rLeft, rTop, rRight, rTop)) return true;
  if (lineIntersectsLine(p1.x, p1.y, p2.x, p2.y, rRight, rTop, rRight, rBottom)) return true;
  if (lineIntersectsLine(p1.x, p1.y, p2.x, p2.y, rRight, rBottom, rLeft, rBottom)) return true;
  if (lineIntersectsLine(p1.x, p1.y, p2.x, p2.y, rLeft, rBottom, rLeft, rTop)) return true;

  return false;
}

// Check clear Line Of Sight between two positions
export function hasLineOfSight(p1: Position, p2: Position, walls: Wall[]): boolean {
  for (const wall of walls) {
    if (lineIntersectsRect(p1, p2, wall)) {
      return false;
    }
  }
  return true;
}

// Calculate distance to closest wall along a ray from origin at given angle
export function getRayWallDistance(
  origin: Position,
  angle: number,
  maxDist: number,
  walls: Wall[]
): number {
  const p2x = origin.x + Math.cos(angle) * maxDist;
  const p2y = origin.y + Math.sin(angle) * maxDist;

  let closestDist = maxDist;

  for (const wall of walls) {
    // Fast bounding box reject
    const minRx = Math.min(origin.x, p2x);
    const maxRx = Math.max(origin.x, p2x);
    const minRy = Math.min(origin.y, p2y);
    const maxRy = Math.max(origin.y, p2y);

    if (
      maxRx < wall.x ||
      minRx > wall.x + wall.width ||
      maxRy < wall.y ||
      minRy > wall.y + wall.height
    ) {
      continue;
    }

    const segments = [
      [wall.x, wall.y, wall.x + wall.width, wall.y],
      [wall.x + wall.width, wall.y, wall.x + wall.width, wall.y + wall.height],
      [wall.x, wall.y + wall.height, wall.x + wall.width, wall.y + wall.height],
      [wall.x, wall.y, wall.x, wall.y + wall.height],
    ];

    for (let i = 0; i < 4; i++) {
      const [x3, y3, x4, y4] = segments[i];
      const denom = (y4 - y3) * (p2x - origin.x) - (x4 - x3) * (p2y - origin.y);
      if (denom === 0) continue;
      const ua = ((x4 - x3) * (origin.y - y3) - (y4 - y3) * (origin.x - x3)) / denom;
      const ub = ((p2x - origin.x) * (origin.y - y3) - (p2y - origin.y) * (origin.x - x3)) / denom;
      if (ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1) {
        const hitDist = ua * maxDist;
        if (hitDist < closestDist) {
          closestDist = hitDist;
        }
      }
    }
  }

  return closestDist;
}

// Circle vs Wall resolution (with multi-pass corner stability)
export function resolveWallCollision(
  pos: Position,
  radius: number,
  walls: Wall[],
  mapWidth: number = 2000,
  mapHeight: number = 1500
): Position {
  let newX = pos.x;
  let newY = pos.y;

  // 2 passes ensure smooth corner resolution without sticking
  for (let pass = 0; pass < 2; pass++) {
    for (const wall of walls) {
      // Find closest point on rectangle to circle center
      const closestX = Math.max(wall.x, Math.min(newX, wall.x + wall.width));
      const closestY = Math.max(wall.y, Math.min(newY, wall.y + wall.height));

      const dx = newX - closestX;
      const dy = newY - closestY;
      const distSq = dx * dx + dy * dy;

      if (distSq < radius * radius) {
        const dist = Math.sqrt(distSq);
        if (dist === 0) {
          newX += radius;
        } else {
          const overlap = radius - dist;
          newX += (dx / dist) * overlap;
          newY += (dy / dist) * overlap;
        }
      }
    }
  }

  // Clamping within map outer boundary walls
  newX = Math.max(radius + 32, Math.min(mapWidth - radius - 32, newX));
  newY = Math.max(radius + 32, Math.min(mapHeight - radius - 32, newY));

  return { x: newX, y: newY };
}

// Check if character can see target inside seeker vision cone
export function isTargetInSeekerSight(
  seeker: Character,
  target: Character,
  walls: Wall[],
  flashlightBoost: boolean = false
): boolean {
  if (target.isCaught || target.hidingSpotId) return false;

  // Invisibility Cloak buff active on target: completely invisible to seeker!
  if (target.activeBuffs?.invisibilityTimeLeft && target.activeBuffs.invisibilityTimeLeft > 0) {
    return false;
  }

  const dx = target.x - seeker.x;
  const dy = target.y - seeker.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  // Thermal Scanner buff active on seeker: can see through walls and bushes!
  if (seeker.activeBuffs?.thermalTimeLeft && seeker.activeBuffs.thermalTimeLeft > 0) {
    if (dist < 480) return true;
  }

  // Proximity sense (short 360 degree awareness around the seeker)
  if (dist < 55) {
    if (hasLineOfSight(seeker, target, walls)) {
      if (target.isInBush && dist > 35) return false;
      return true;
    }
  }

  const maxRange = flashlightBoost ? 420 : 300;
  if (dist > maxRange) return false;

  // Bush cover: cannot see inside bush from outside unless very close
  if (target.isInBush && dist > 55) {
    return false;
  }

  // Vision cone angle (around ~110 degrees)
  const angleToTarget = Math.atan2(dy, dx);
  let angleDiff = angleToTarget - seeker.angle;
  while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
  while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

  const halfFov = (flashlightBoost ? 65 : 55) * (Math.PI / 180);
  if (Math.abs(angleDiff) <= halfFov) {
    return hasLineOfSight(seeker, target, walls);
  }

  return false;
}

// Helper for bot speech & chat sync
function botSay(bot: Character, text: string, sendChat: (sender: Character, text: string) => void) {
  bot.speech = { text, timer: 190, maxTimer: 190 };
  sendChat(bot, text);
}

// Create initial roster of players & bots
export function createRoster(
  playerRole: PlayerRole,
  playerName: string,
  map: GameMap,
  botCount: number = 5,
  seekerCountOverride?: number,
  language: Language = 'vi',
  playerProfile?: PlayerProfile
): Character[] {
  const characters: Character[] = [];
  const isVi = language === 'vi';
  const seekerNamesList = isVi ? SEEKER_NAMES_VI : SEEKER_NAMES_EN;
  const botNamesList = isVi ? BOT_NAMES_VI : BOT_NAMES_EN;

  // Determine seeker count: strictly capped at 1 or 2 seekers!
  const targetSeekerCount =
    seekerCountOverride !== undefined
      ? Math.max(1, Math.min(2, seekerCountOverride))
      : botCount >= 8
      ? 2
      : 1;

  // If player is Hider
  if (playerRole === 'hider') {
    const seekerCount = targetSeekerCount;
    const botHiderCount = botCount - seekerCount;

    characters.push({
      id: 'player',
      name: playerName || (isVi ? 'Bạn' : 'You'),
      isBot: false,
      role: 'hider',
      color: playerProfile?.color || '#3b82f6', // Player customized color or bright blue
      avatar: playerProfile?.avatar || '🕵️',
      isHumanVerified: playerProfile?.isHumanVerified ?? false,
      x: map.hiderSpawn.x,
      y: map.hiderSpawn.y,
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
      alertState: 'idle',
    });

    // Add Bot Hiders
    for (let i = 0; i < botHiderCount; i++) {
      const name = botNamesList[i % botNamesList.length];
      const personalities: ('stealthy' | 'runner' | 'erratic')[] = ['stealthy', 'runner', 'erratic'];
      characters.push({
        id: `bot_hider_${i + 1}`,
        name: `${name} [BOT]`,
        isBot: true,
        role: 'hider',
        color: ['#10b981', '#06b6d4', '#8b5cf6', '#ec4899', '#f59e0b', '#14b8a6'][i % 6],
        x: map.hiderSpawn.x + (Math.random() - 0.5) * 110,
        y: map.hiderSpawn.y + (Math.random() - 0.5) * 110,
        vx: 0,
        vy: 0,
        angle: Math.random() * Math.PI * 2,
        speed: 3.2,
        radius: 16,
        stamina: 100,
        maxStamina: 100,
        isSprinting: false,
        isCrouching: false,
        isCaught: false,
        isInBush: false,
        tagCooldown: 0,
        abilityCooldown: 0,
        personality: personalities[i % personalities.length],
        alertState: 'idle',
      });
    }

    // Add Bot Seekers (strictly 1 or 2)
    for (let i = 0; i < seekerCount; i++) {
      const seekerName = seekerNamesList[i % seekerNamesList.length];
      characters.push({
        id: `bot_seeker_${i + 1}`,
        name: `${seekerName} [BOT]`,
        isBot: true,
        role: 'seeker',
        color: ['#ef4444', '#dc2626', '#b91c1c'][i % 3], // Distinct reds
        x: map.seekerSpawn.x + (i - (seekerCount - 1) / 2) * 50,
        y: map.seekerSpawn.y + (Math.random() - 0.5) * 30,
        vx: 0,
        vy: 0,
        angle: Math.PI / 4,
        speed: 3.5,
        radius: 18,
        stamina: 100,
        maxStamina: 100,
        isSprinting: false,
        isCrouching: false,
        isCaught: false,
        isInBush: false,
        tagCooldown: 0,
        abilityCooldown: 0,
        personality: 'hunter',
        alertState: 'idle',
      });
    }
  } else {
    // Player is Seeker! Total seekers strictly 1 or 2
    const botSeekerAllies = Math.max(0, Math.min(1, targetSeekerCount - 1));
    const hidersTotal = botCount - botSeekerAllies;

    characters.push({
      id: 'player',
      name: playerName || (isVi ? 'Bạn (Thợ Săn)' : 'You (Seeker)'),
      isBot: false,
      role: 'seeker',
      color: playerProfile?.color || '#ef4444',
      avatar: playerProfile?.avatar || '🔦',
      isHumanVerified: playerProfile?.isHumanVerified ?? false,
      x: map.seekerSpawn.x,
      y: map.seekerSpawn.y,
      vx: 0,
      vy: 0,
      angle: Math.PI / 4,
      speed: 3.6,
      radius: 18,
      stamina: 100,
      maxStamina: 100,
      isSprinting: false,
      isCrouching: false,
      isCaught: false,
      isInBush: false,
      tagCooldown: 0,
      abilityCooldown: 0,
      alertState: 'idle',
    });

    // Add Bot Seeker Allies if high player count
    for (let i = 0; i < botSeekerAllies; i++) {
      const seekerName = seekerNamesList[i % seekerNamesList.length];
      characters.push({
        id: `bot_seeker_${i + 1}`,
        name: `${seekerName} [BOT]`,
        isBot: true,
        role: 'seeker',
        color: '#dc2626',
        x: map.seekerSpawn.x + (i + 1) * 45,
        y: map.seekerSpawn.y,
        vx: 0,
        vy: 0,
        angle: Math.PI / 4,
        speed: 3.5,
        radius: 18,
        stamina: 100,
        maxStamina: 100,
        isSprinting: false,
        isCrouching: false,
        isCaught: false,
        isInBush: false,
        tagCooldown: 0,
        abilityCooldown: 0,
        personality: 'hunter',
        alertState: 'idle',
      });
    }

    // Add Bot Hiders
    for (let i = 0; i < hidersTotal; i++) {
      const name = botNamesList[i % botNamesList.length];
      const personalities: ('stealthy' | 'runner' | 'erratic')[] = ['stealthy', 'runner', 'erratic'];
      characters.push({
        id: `bot_hider_${i + 1}`,
        name: `${name} [BOT]`,
        isBot: true,
        role: 'hider',
        color: ['#10b981', '#06b6d4', '#8b5cf6', '#ec4899', '#f59e0b', '#3b82f6'][i % 6],
        x: map.hiderSpawn.x + (Math.random() - 0.5) * 140,
        y: map.hiderSpawn.y + (Math.random() - 0.5) * 140,
        vx: 0,
        vy: 0,
        angle: Math.random() * Math.PI * 2,
        speed: 3.3,
        radius: 16,
        stamina: 100,
        maxStamina: 100,
        isSprinting: false,
        isCrouching: false,
        isCaught: false,
        isInBush: false,
        tagCooldown: 0,
        abilityCooldown: 0,
        personality: personalities[i % personalities.length],
        alertState: 'idle',
      });
    }
  }

  return characters;
}

// Bot AI update logic
export function updateBotAI(
  bot: Character,
  allCharacters: Character[],
  map: GameMap,
  phase: GamePhase,
  phaseTimeLeft: number,
  difficulty: AIDifficulty,
  addSoundRipple: (x: number, y: number, radius: number, role: PlayerRole, isDistraction?: boolean) => void,
  sendChat: (sender: Character, text: string) => void,
  language: Language = 'en'
) {
  if (bot.isCaught) return;
  const isVi = language === 'vi';

  // Stun trap effect: immobilized
  if (bot.stunTimer && bot.stunTimer > 0) {
    bot.stunTimer--;
    bot.vx = 0;
    bot.vy = 0;
    bot.isSprinting = false;
    if (!bot.emote || bot.emote.timer <= 0) {
      bot.emote = { text: '💫', timer: 20 };
    }
    return;
  }

  // HIDER BOT AI
  if (bot.role === 'hider') {
    // Phase 1: Hiding Phase (Find hiding spot and stay there)
    if (phase === 'hiding') {
      if (!bot.targetPos && !bot.hidingSpotId && !bot.isInBush) {
        // Choose hiding strategy based on personality
        const openSpots = map.hidingSpots.filter(
          (s) => !allCharacters.some((c) => c.hidingSpotId === s.id && c.id !== bot.id)
        );

        if (bot.personality === 'stealthy' && openSpots.length > 0 && Math.random() < 0.8) {
          // Pick a crate or locker
          const targetSpot = openSpots[Math.floor(Math.random() * openSpots.length)];
          bot.targetPos = { x: targetSpot.x + targetSpot.width / 2, y: targetSpot.y + targetSpot.height / 2 };
        } else if (openSpots.filter((s) => s.type === 'bush').length > 0 && Math.random() < 0.7) {
          // Pick a bush
          const bushes = openSpots.filter((s) => s.type === 'bush');
          const bush = bushes[Math.floor(Math.random() * bushes.length)];
          bot.targetPos = { x: bush.x + bush.width / 2, y: bush.y + bush.height / 2 };
        } else {
          // Hide in a remote corner of map
          const corners = [
            { x: 100, y: 1350 },
            { x: 1850, y: 1350 },
            { x: 1850, y: 200 },
            { x: 1400, y: 900 },
            { x: 600, y: 1300 },
          ];
          const corner = corners[Math.floor(Math.random() * corners.length)];
          bot.targetPos = {
            x: corner.x + (Math.random() - 0.5) * 100,
            y: corner.y + (Math.random() - 0.5) * 100,
          };
        }

        if (Math.random() < 0.25) {
          const chats = isVi
            ? [
                'Tìm được chỗ trốn ngon rồi!',
                'Nhanh lên, trốn lẹ kẻo hết giờ!',
                'Tôi biết một góc cực kín!',
                'Suỵt, vào vị trí mau!',
              ]
            : [
                'Found a great spot!',
                'Quick, hide before time is up!',
                'I know a sneaky corner!',
                'Shhh, get into position!',
              ];
          botSay(bot, chats[Math.floor(Math.random() * chats.length)], sendChat);
        }
      }

      // Move toward target position
      if (bot.targetPos && !bot.hidingSpotId) {
        const dx = bot.targetPos.x - bot.x;
        const dy = bot.targetPos.y - bot.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 15) {
          bot.angle = Math.atan2(dy, dx);
          bot.vx = Math.cos(bot.angle) * bot.speed * 1.3;
          bot.vy = Math.sin(bot.angle) * bot.speed * 1.3;
          bot.isSprinting = true;
        } else {
          bot.vx = 0;
          bot.vy = 0;
          bot.isSprinting = false;

          // Check if at a hiding spot
          const nearbySpot = map.hidingSpots.find((s) => {
            const cx = s.x + s.width / 2;
            const cy = s.y + s.height / 2;
            return Math.hypot(bot.x - cx, bot.y - cy) < 40;
          });

          if (
            nearbySpot &&
            (nearbySpot.type === 'crate' ||
              nearbySpot.type === 'locker' ||
              nearbySpot.type === 'wardrobe' ||
              nearbySpot.type === 'recycle_bin' ||
              (nearbySpot.type === 'question_box' && (!nearbySpot.question || nearbySpot.isQuestionSolved)))
          ) {
            bot.hidingSpotId = nearbySpot.id;
            nearbySpot.occupantId = bot.id;
            bot.targetPos = undefined;
          }
        }
      }
      return;
    }

    // Phase 2: Seeking Phase (Stay hidden, hold breath, remain quiet; DO NOT run away from seekers!)
    if (phase === 'seeking') {
      const seekers = allCharacters.filter((c) => c.role === 'seeker');
      let nearestSeeker: Character | null = null;
      let minSeekerDist = 99999;

      for (const seeker of seekers) {
        const dist = Math.hypot(seeker.x - bot.x, seeker.y - bot.y);
        if (dist < minSeekerDist) {
          minSeekerDist = dist;
          nearestSeeker = seeker;
        }
      }

      // DO NOT RUN AWAY: Hiders remain stationary in their chosen hiding spot or cover
      bot.vx = 0;
      bot.vy = 0;
      bot.isSprinting = false;
      bot.isCrouching = true;

      // Check if seeker is looking towards bot or nearby
      const isSpotted = nearestSeeker && isTargetInSeekerSight(nearestSeeker, bot, map.walls);
      const isNearSeeker = minSeekerDist < (difficulty === 'hard' ? 160 : 120);

      if (bot.hidingSpotId) {
        // Inside locker or crate: remain completely still, DO NOT jump out or flee!
        bot.alertState = 'idle';

        if (nearestSeeker && isNearSeeker && Math.random() < 0.006) {
          bot.emote = { text: '🤫', timer: 60 };
        }
      } else {
        // Outside in a bush, corner, or behind a wall:
        // Hold ground and freeze. Never sprint or run away from seekers!
        if (isSpotted) {
          bot.alertState = 'panicking';
          if (nearestSeeker) {
            // Keep eyes locked on the seeker while staying frozen in place
            bot.angle = Math.atan2(nearestSeeker.y - bot.y, nearestSeeker.x - bot.x);
          }
          if (Math.random() < 0.008) {
            const frozenThoughts = isVi
              ? [
                  '(đang nín thở...)',
                  'suỵt...',
                  '(ngồi im re không nhúc nhích...)',
                  '(làm ơn đừng nhìn qua bên này...)',
                ]
              : [
                  '(holding breath...)',
                  'shhh...',
                  '(staying completely still...)',
                  '(please don\'t look over here...)',
                ];
            botSay(bot, frozenThoughts[Math.floor(Math.random() * frozenThoughts.length)], sendChat);
            bot.emote = { text: '🫣', timer: 70 };
          }
        } else if (isNearSeeker) {
          bot.alertState = 'suspicious';
          if (nearestSeeker) {
            bot.angle = Math.atan2(nearestSeeker.y - bot.y, nearestSeeker.x - bot.x);
          }
          if (Math.random() < 0.005) {
            bot.emote = { text: '🤐', timer: 60 };
          }
        } else {
          bot.alertState = 'idle';
          if (Math.random() < 0.002) {
            bot.emote = { text: '👀', timer: 60 };
          }
        }
      }
      return;
    }
  }

  // SEEKER BOT AI
  if (bot.role === 'seeker') {
    // In hiding phase, stay locked at spawn with blindfold
    if (phase === 'hiding') {
      bot.vx = 0;
      bot.vy = 0;
      bot.angle = (Date.now() / 800) % (Math.PI * 2);
      return;
    }

    // In seeking phase
    if (phase === 'seeking') {
      const hiders = allCharacters.filter((c) => c.role === 'hider' && !c.isCaught);
      if (hiders.length === 0) return;

      // 1. Look for visible hiders in vision cone
      let visibleHider: Character | null = null;
      let closestDist = 99999;

      for (const hider of hiders) {
        if (isTargetInSeekerSight(bot, hider, map.walls)) {
          const dist = Math.hypot(hider.x - bot.x, hider.y - bot.y);
          if (dist < closestDist) {
            closestDist = dist;
            visibleHider = hider;
          }
        }
      }

      if (visibleHider) {
        // CHASE MODE!
        bot.alertState = 'chasing';
        bot.targetPos = { x: visibleHider.x, y: visibleHider.y };

        const dx = visibleHider.x - bot.x;
        const dy = visibleHider.y - bot.y;
        bot.angle = Math.atan2(dy, dx);

        const spd = bot.stamina > 20 ? bot.speed * 1.35 : bot.speed;
        bot.vx = Math.cos(bot.angle) * spd;
        bot.vy = Math.sin(bot.angle) * spd;
        bot.isSprinting = bot.stamina > 20;

        if (!bot.alertTimer || bot.alertTimer <= 0) {
          bot.emote = { text: '!', timer: 60 };
          sound.playAlert();
          bot.alertTimer = 120;
          if (Math.random() < 0.6) {
            const tauntsVi = [
              `Thấy ${visibleHider.name} rồi nhé! Đứng lại mau!`,
              `Phát hiện chỗ trốn của ${visibleHider.name} rồi! Chạy đâu cho thoát!`,
              `Đã vào tầm ngắm của tôi, ${visibleHider.name} không chạy được đâu!`,
              `Tìm thấy thêm một người nữa: ${visibleHider.name}!`,
              `Tôi thấy bạn rồi nhé ${visibleHider.name}, đầu hàng đi!`,
              `Đừng hòng trốn thoát khỏi tay tôi, ${visibleHider.name}!`,
              `Đèn pin soi trúng bạn rồi, ${visibleHider.name}!`,
              `Dừng lại đi ${visibleHider.name}, bạn chạy không kịp đâu!`,
              `A ha! Bắt gặp ${visibleHider.name} đang lén lút này!`,
            ];
            const tauntsEn = [
              `Found you, ${visibleHider.name}!`,
              'I see your hiding spot!',
              'Gotcha in my sights!',
              'Found another hider!',
              'Nowhere to run!',
            ];
            const taunt = isVi
              ? tauntsVi[Math.floor(Math.random() * tauntsVi.length)]
              : tauntsEn[Math.floor(Math.random() * tauntsEn.length)];
            botSay(bot, taunt, sendChat);
          }
        } else {
          bot.alertTimer--;
        }

        // Tag attempt if within touch distance
        if (closestDist < 38 && bot.tagCooldown <= 0) {
          visibleHider.isCaught = true;
          visibleHider.caughtTime = Date.now();
          bot.tagCooldown = 40;
          sound.playCatch();
          bot.emote = { text: isVi ? '🎯 Tóm được!' : '🎯 Tag!', timer: 80 };
          visibleHider.emote = { text: '💀', timer: 100 };
          const catchTauntsVi = [
            `Đã tóm được ${visibleHider.name}! Hết đường chạy nhé!`,
            `Bắt được cậu rồi ${visibleHider.name}! Trốn cũng ghê đấy nhưng không thoát được!`,
            `Thấy cậu rồi nhé ${visibleHider.name}! Vào danh sách bị loại!`,
            `Một người nữa đã bị tóm gọn: ${visibleHider.name}!`,
            `Không thoát được đâu ${visibleHider.name}! Về khu chờ thôi!`,
            `Tóm sống ${visibleHider.name}! Trận này thợ săn thắng chắc!`,
          ];
          const catchTauntsEn = [
            `Caught ${visibleHider.name}! Nowhere left to run!`,
            `Gotcha, ${visibleHider.name}!`,
            `Found you, ${visibleHider.name}!`,
            `Another one tagged: ${visibleHider.name}!`,
          ];
          const catchMsg = isVi
            ? catchTauntsVi[Math.floor(Math.random() * catchTauntsVi.length)]
            : catchTauntsEn[Math.floor(Math.random() * catchTauntsEn.length)];
          botSay(bot, catchMsg, sendChat);
        }
        return;
      }

      // 2. Search nearby Crates / Lockers / Bushes / Question Boxes
      const nearbySpots = map.hidingSpots.filter((s) => {
        const cx = s.x + s.width / 2;
        const cy = s.y + s.height / 2;
        return Math.hypot(bot.x - cx, bot.y - cy) < 55;
      });

      if (nearbySpots.length > 0 && Math.random() < 0.05) {
        const spot = nearbySpots[0];
        // Check if an occupant is inside!
        if (spot.occupantId) {
          const occupant = allCharacters.find((c) => c.id === spot.occupantId);
          if (occupant && !occupant.isCaught) {
            occupant.isCaught = true;
            occupant.hidingSpotId = undefined;
            spot.occupantId = undefined;
            sound.playCatch();
            sound.playLockerInteract(false);
            bot.emote = { text: isVi ? '🔍 Bắt được rồi!' : '🔍 Gotcha!', timer: 90 };
            const spotNameVi =
              spot.type === 'wardrobe'
                ? 'tủ quần áo'
                : spot.type === 'recycle_bin'
                ? 'thùng rác'
                : spot.type === 'question_box'
                ? 'rương tri thức lớp 6'
                : spot.type === 'locker'
                ? 'tủ sắt'
                : spot.type === 'bush'
                ? 'bụi cây ngụy trang'
                : 'thùng gỗ';
            const searchTauntsVi = [
              `Lục soát ${spotNameVi} và tóm gọn ${occupant.name}!`,
              `Mở ${spotNameVi} ra và bắt quả tang ${occupant.name}! Hết đường chối!`,
              `Hóa ra bạn nấp trong ${spotNameVi} hả ${occupant.name}! Bắt được rồi!`,
            ];
            const searchTauntsEn = [
              `Searched the ${spot.type} and caught ${occupant.name}!`,
              `Opened the ${spot.type} and found ${occupant.name}!`,
            ];
            const searchMsg = isVi
              ? searchTauntsVi[Math.floor(Math.random() * searchTauntsVi.length)]
              : searchTauntsEn[Math.floor(Math.random() * searchTauntsEn.length)];
            botSay(bot, searchMsg, sendChat);
            return;
          }
        }
      }

      // 3. Patrol / Wander across the map
      bot.alertState = 'idle';
      if (bot.alertTimer && bot.alertTimer > 0) bot.alertTimer--;

      if (!bot.targetPos || Math.hypot(bot.targetPos.x - bot.x, bot.targetPos.y - bot.y) < 60) {
        // Pick a patrol room/point
        const patrolPoints = [
          { x: 500, y: 300 },
          { x: 1000, y: 300 },
          { x: 1500, y: 300 },
          { x: 600, y: 700 },
          { x: 1000, y: 750 },
          { x: 1400, y: 750 },
          { x: 500, y: 1200 },
          { x: 1000, y: 1200 },
          { x: 1500, y: 1200 },
        ];
        const nextPt = patrolPoints[Math.floor(Math.random() * patrolPoints.length)];
        bot.targetPos = {
          x: nextPt.x + (Math.random() - 0.5) * 150,
          y: nextPt.y + (Math.random() - 0.5) * 150,
        };
      }

      const dx = bot.targetPos.x - bot.x;
      const dy = bot.targetPos.y - bot.y;
      const targetAngle = Math.atan2(dy, dx);

      // Smoothly steer towards target angle
      let diff = targetAngle - bot.angle;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      bot.angle += diff * 0.08;

      bot.vx = Math.cos(bot.angle) * bot.speed * 0.85;
      bot.vy = Math.sin(bot.angle) * bot.speed * 0.85;
      bot.isSprinting = false;

      // Occasional seeker chatter during patrol
      if (Math.random() < 0.005) {
        const wanderLinesVi = [
          'Đang kiểm tra các hành lang...',
          'Tôi biết có người đang nấp quanh đây...',
          'Không ai thoát khỏi ánh đèn pin của tôi đâu!',
          'Vừa nghe thấy tiếng động lạ quanh khu này...',
          'Ra đây đi, trốn cũng vô ích thôi!',
          'Cẩn thận đấy, tôi đang tới rất gần rồi...',
          'Khu vực này có dấu hiệu khả nghi...',
          'Có tiếng bước chân ở gần đây!',
          'Để xem ai nấp trong mấy góc kẹt này nào...',
          'Đừng tưởng nấp kỹ là tôi không nhìn ra nhé!',
          'Tôi sắp đi qua chỗ của bạn rồi đấy...',
          'Bật đèn pin lên quét sạch mọi góc tối nào!',
          'Trốn cho kỹ vào, tôi đang đi lùng sục đây!',
          'Tôi ngửi thấy mùi sợ hãi quanh đây rồi đấy!',
          'Đừng cử động, tôi đang lắng nghe từng hơi thở!',
          'Chạy không thoát khỏi mắt tôi đâu!',
        ];
        const wanderLinesEn = [
          'Checking the corridors...',
          'I know someone is hiding nearby...',
          'No one escapes the flashlight!',
          'Footsteps heard...',
          'Come out, hiding is futile!',
          'Watch out, I am closing in...',
          'Suspicious sounds detected around here...',
        ];
        const line = isVi
          ? wanderLinesVi[Math.floor(Math.random() * wanderLinesVi.length)]
          : wanderLinesEn[Math.floor(Math.random() * wanderLinesEn.length)];
        botSay(bot, line, sendChat);
      }
    }
  }
}
