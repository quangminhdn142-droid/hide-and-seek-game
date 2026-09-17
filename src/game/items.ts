import { GameMap, ItemType, WorldItem } from '../types';

export interface ItemDef {
  type: ItemType;
  name: string;
  abilityName: string;
  description: string;
  icon: string;
  color: string;
  glowColor: string;
  duration?: number; // duration in seconds if active buff
}

export const ITEM_DEFINITIONS: Record<ItemType, ItemDef> = {
  invisibility: {
    type: 'invisibility',
    name: 'Ghost Cloak',
    abilityName: 'Phantom Camo',
    description: 'Turns you translucent and 100% invisible to seeker bot vision cones for 6 seconds. Silences all footsteps!',
    icon: '👻',
    color: '#c084fc',
    glowColor: 'rgba(192, 132, 252, 0.4)',
    duration: 6,
  },
  decoy: {
    type: 'decoy',
    name: 'Holo-Decoy Beacon',
    abilityName: 'Hologram Runner',
    description: 'Drops an animated hologram projector that pulses sound ripples, deceiving seeker bots to investigate it.',
    icon: '🤖',
    color: '#38bdf8',
    glowColor: 'rgba(56, 189, 248, 0.4)',
    duration: 8,
  },
  stun_trap: {
    type: 'stun_trap',
    name: 'Shock Frost Trap',
    abilityName: 'Deploy Snare',
    description: 'Places a hidden floor trap. When an opponent steps on it, they get immobilized and stunned for 4 seconds!',
    icon: '🪤',
    color: '#fbbf24',
    glowColor: 'rgba(251, 191, 36, 0.4)',
  },
  thermal_scanner: {
    type: 'thermal_scanner',
    name: 'Thermal X-Ray Visor',
    abilityName: 'Wallhack Pulse',
    description: 'Wallhack visor revealing all players and bots through walls, lockers, crates, and bushes for 6 seconds.',
    icon: '🥽',
    color: '#34d399',
    glowColor: 'rgba(52, 211, 153, 0.4)',
    duration: 6,
  },
  speed_boost: {
    type: 'speed_boost',
    name: 'Adrenaline Syringe',
    abilityName: 'Super Sprint',
    description: '+70% movement speed, infinite stamina, and swift dash trails for 6 seconds!',
    icon: '⚡',
    color: '#facc15',
    glowColor: 'rgba(250, 204, 21, 0.4)',
    duration: 6,
  },
};

export const ALL_ITEM_TYPES: ItemType[] = [
  'invisibility',
  'decoy',
  'stun_trap',
  'thermal_scanner',
  'speed_boost',
];

// Check if a point is inside any wall or too close to wall edges
function isPointCollidingWithWalls(x: number, y: number, map: GameMap, pad = 35): boolean {
  if (x < pad || x > map.width - pad || y < pad || y > map.height - pad) return true;
  for (const wall of map.walls) {
    if (
      x >= wall.x - pad &&
      x <= wall.x + wall.width + pad &&
      y >= wall.y - pad &&
      y <= wall.y + wall.height + pad
    ) {
      return true;
    }
  }
  return false;
}

// Check if point is inside a hiding spot
function isPointInsideHidingSpot(x: number, y: number, map: GameMap, pad = 20): boolean {
  for (const spot of map.hidingSpots) {
    if (
      x >= spot.x - pad &&
      x <= spot.x + spot.width + pad &&
      y >= spot.y - pad &&
      y <= spot.y + spot.height + pad
    ) {
      return true;
    }
  }
  return false;
}

/**
 * Generate tactical spawn points for items on a map
 */
function getPotentialSpawnLocations(map: GameMap): { x: number; y: number }[] {
  const points: { x: number; y: number }[] = [];

  // 1. If zones exist, sample from the center of zones
  if (map.zones && map.zones.length > 0) {
    for (const zone of map.zones) {
      const cx = zone.x + zone.width / 2;
      const cy = zone.y + zone.height / 2;
      // Also add room offset points
      const offsets = [
        { dx: 0, dy: 0 },
        { dx: -zone.width * 0.25, dy: zone.height * 0.25 },
        { dx: zone.width * 0.25, dy: -zone.height * 0.25 },
      ];
      for (const off of offsets) {
        const px = cx + off.dx;
        const py = cy + off.dy;
        if (!isPointCollidingWithWalls(px, py, map) && !isPointInsideHidingSpot(px, py, map)) {
          points.push({ x: px, y: py });
        }
      }
    }
  }

  // 2. Sample open grid corridors
  for (let x = 150; x < map.width - 150; x += 180) {
    for (let y = 150; y < map.height - 150; y += 180) {
      if (!isPointCollidingWithWalls(x, y, map) && !isPointInsideHidingSpot(x, y, map)) {
        points.push({ x, y });
      }
    }
  }

  return points;
}

/**
 * Spawn initial batch of items for a round
 */
export function spawnRandomItems(map: GameMap, count: number = 6): WorldItem[] {
  const spawnPoints = getPotentialSpawnLocations(map);
  const shuffledPoints = [...spawnPoints].sort(() => Math.random() - 0.5);

  const items: WorldItem[] = [];
  const itemTypesPool = [...ALL_ITEM_TYPES, ...ALL_ITEM_TYPES]; // ensures variety
  itemTypesPool.sort(() => Math.random() - 0.5);

  let pointIdx = 0;
  for (let i = 0; i < count && pointIdx < shuffledPoints.length; i++) {
    const pt = shuffledPoints[pointIdx++];
    // Ensure not too close to another spawned item
    if (items.some((it) => Math.hypot(it.x - pt.x, it.y - pt.y) < 180)) {
      continue;
    }

    const type = itemTypesPool[i % itemTypesPool.length];
    const def = ITEM_DEFINITIONS[type];

    items.push({
      id: `item_${Date.now()}_${i}_${Math.random().toString(36).substring(2, 6)}`,
      type,
      x: pt.x,
      y: pt.y,
      name: def.name,
      description: def.description,
      icon: def.icon,
      color: def.color,
      spawnTime: Date.now(),
    });
  }

  return items;
}

/**
 * Spawn a single new item in a valid unoccupied location
 */
export function spawnSingleItem(map: GameMap, existingItems: WorldItem[]): WorldItem | null {
  const spawnPoints = getPotentialSpawnLocations(map);
  const shuffled = [...spawnPoints].sort(() => Math.random() - 0.5);

  for (const pt of shuffled) {
    if (existingItems.some((it) => Math.hypot(it.x - pt.x, it.y - pt.y) < 160)) {
      continue;
    }

    const type = ALL_ITEM_TYPES[Math.floor(Math.random() * ALL_ITEM_TYPES.length)];
    const def = ITEM_DEFINITIONS[type];

    return {
      id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      type,
      x: pt.x,
      y: pt.y,
      name: def.name,
      description: def.description,
      icon: def.icon,
      color: def.color,
      spawnTime: Date.now(),
    };
  }

  return null;
}
