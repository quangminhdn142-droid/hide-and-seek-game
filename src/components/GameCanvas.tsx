import React, { useRef, useEffect } from 'react';
import {
  Character,
  GameMap,
  GamePhase,
  HidingSpot,
  SoundRipple,
  Footstep,
  SmokeCloud,
  WorldItem,
  ActiveTrap,
  ActiveDecoy,
  Language,
} from '../types';
import { getRayWallDistance } from '../game/engine';

interface GameCanvasProps {
  map: GameMap;
  characters: Character[];
  player: Character;
  camTargetId?: string;
  phase: GamePhase;
  soundRipples: SoundRipple[];
  footsteps: Footstep[];
  smokeClouds: SmokeCloud[];
  radarPulseAngle: number | null; // angle towards nearest hider if radar active
  flashlightBoost: boolean;
  worldItems?: WorldItem[];
  activeTraps?: ActiveTrap[];
  activeDecoys?: ActiveDecoy[];
  language?: Language;
  onCanvasClick?: (worldX: number, worldY: number) => void;
  onInteractPrompt?: { text: string; action: () => void } | null;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  map,
  characters,
  player,
  camTargetId = 'player',
  phase,
  soundRipples,
  footsteps,
  smokeClouds,
  radarPulseAngle,
  flashlightBoost,
  worldItems = [],
  activeTraps = [],
  activeDecoys = [],
  language = 'vi',
  onCanvasClick,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cameraRef = useRef({ x: player.x, y: player.y });

  // Handle canvas click to trigger in-world actions (e.g. throw rock at target)
  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !onCanvasClick) return;
    const rect = canvas.getBoundingClientRect();
    const clickScreenX = e.clientX - rect.left;
    const clickScreenY = e.clientY - rect.top;

    const camera = cameraRef.current;
    const worldX = clickScreenX - canvas.width / 2 + camera.x;
    const worldY = clickScreenY - canvas.height / 2 + camera.y;

    onCanvasClick(worldX, worldY);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const resize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
      }
    };

    resize();
    window.addEventListener('resize', resize);

    const render = () => {
      // 1. Smooth Camera follow player or spectated bot
      const camera = cameraRef.current;
      const camTarget = characters.find((c) => c.id === camTargetId) || player;
      const targetCamX = camTarget.x;
      const targetCamY = camTarget.y;
      camera.x += (targetCamX - camera.x) * 0.12;
      camera.y += (targetCamY - camera.y) * 0.12;

      // Bound camera within map edges
      const halfW = canvas.width / 2;
      const halfH = canvas.height / 2;
      const camMinX = Math.min(halfW, map.width / 2);
      const camMaxX = Math.max(halfW, map.width - halfW);
      const camMinY = Math.min(halfH, map.height / 2);
      const camMaxY = Math.max(halfH, map.height - halfH);

      const clampedCamX = Math.max(camMinX, Math.min(camera.x, camMaxX));
      const clampedCamY = Math.max(camMinY, Math.min(camera.y, camMaxY));

      ctx.save();
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Translate view to centered camera
      ctx.translate(canvas.width / 2 - clampedCamX, canvas.height / 2 - clampedCamY);

      // 2. Draw Floor Background & Grid Tiles
      ctx.fillStyle = map.theme.background;
      ctx.fillRect(0, 0, map.width, map.height);

      // Draw subtle floor grid
      ctx.strokeStyle = map.theme.floorTile;
      ctx.lineWidth = 1.5;
      const tileSize = 80;
      ctx.beginPath();
      for (let x = 0; x <= map.width; x += tileSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, map.height);
      }
      for (let y = 0; y <= map.height; y += tileSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(map.width, y);
      }
      ctx.stroke();

      // Draw Named Zones on the floor
      if (map.zones) {
        for (const zone of map.zones) {
          ctx.save();
          // Subtle room perimeter tint
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
          ctx.lineWidth = 1;
          ctx.strokeRect(zone.x, zone.y, zone.width, zone.height);

          // Stenciled room identifier
          ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
          ctx.font = '700 13px system-ui, -apple-system, sans-serif';
          ctx.textAlign = 'left';
          ctx.textBaseline = 'top';
          const zoneDisplayName = language === 'vi' && zone.nameVi ? zone.nameVi : zone.name;
          ctx.fillText(`⌖ ${zoneDisplayName.toUpperCase()}`, zone.x + 16, zone.y + 16);
          ctx.restore();
        }
      }

      // 3. Draw Footsteps
      const now = Date.now();
      for (const step of footsteps) {
        const age = now - step.createdAt;
        if (age > 4000) continue;
        const fade = Math.max(0, 1 - age / 4000) * step.opacity;

        ctx.save();
        ctx.translate(step.x, step.y);
        ctx.rotate(step.angle);
        ctx.fillStyle = step.color;
        ctx.globalAlpha = fade * 0.45;
        // Simple oval shoe print
        ctx.beginPath();
        ctx.ellipse(0, 0, 4, 7, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // 4. Draw Hiding Spots (Lockers, Crates, Bushes)
      for (const spot of map.hidingSpots) {
        if (spot.type === 'crate') {
          // Wooden Storage Crate
          ctx.fillStyle = '#8b5a2b';
          ctx.fillRect(spot.x, spot.y, spot.width, spot.height);
          ctx.strokeStyle = '#5c3a1e';
          ctx.lineWidth = 3;
          ctx.strokeRect(spot.x, spot.y, spot.width, spot.height);

          // Crate Cross braces
          ctx.strokeStyle = '#6f4520';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(spot.x, spot.y);
          ctx.lineTo(spot.x + spot.width, spot.y + spot.height);
          ctx.moveTo(spot.x + spot.width, spot.y);
          ctx.lineTo(spot.x, spot.y + spot.height);
          ctx.stroke();

          // If someone is inside and it's the player, show highlight
          if (spot.occupantId === player.id) {
            ctx.strokeStyle = '#60a5fa';
            ctx.lineWidth = 2.5;
            ctx.strokeRect(spot.x - 3, spot.y - 3, spot.width + 6, spot.height + 6);
          }
        } else if (spot.type === 'locker') {
          // Metal Locker / Wardrobe
          ctx.fillStyle = '#475569';
          ctx.fillRect(spot.x, spot.y, spot.width, spot.height);
          ctx.strokeStyle = '#334155';
          ctx.lineWidth = 2.5;
          ctx.strokeRect(spot.x, spot.y, spot.width, spot.height);

          // Vent slots
          ctx.fillStyle = '#1e293b';
          for (let i = 12; i < spot.height - 15; i += 12) {
            ctx.fillRect(spot.x + 8, spot.y + i, spot.width - 16, 3);
          }

          if (spot.occupantId === player.id) {
            ctx.strokeStyle = '#60a5fa';
            ctx.lineWidth = 2.5;
            ctx.strokeRect(spot.x - 3, spot.y - 3, spot.width + 6, spot.height + 6);
          }
        } else if (spot.type === 'wardrobe') {
          // Wooden Grand Wardrobe with dual doors
          ctx.save();
          ctx.fillStyle = 'rgba(0,0,0,0.35)';
          ctx.fillRect(spot.x + 3, spot.y + 4, spot.width, spot.height);

          // Wardrobe body
          ctx.fillStyle = '#5c381e';
          ctx.fillRect(spot.x, spot.y, spot.width, spot.height);
          ctx.strokeStyle = '#3d2311';
          ctx.lineWidth = 2.5;
          ctx.strokeRect(spot.x, spot.y, spot.width, spot.height);

          // Top cornice trim
          ctx.fillStyle = '#422410';
          ctx.fillRect(spot.x - 2, spot.y, spot.width + 4, 8);

          // Center door divide line
          ctx.strokeStyle = '#2b1609';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(spot.x + spot.width / 2, spot.y + 8);
          ctx.lineTo(spot.x + spot.width / 2, spot.y + spot.height - 4);
          ctx.stroke();

          // Door recessed panels
          const panelW = (spot.width - 12) / 2;
          ctx.strokeStyle = '#784a29';
          ctx.lineWidth = 1.5;
          // Left panels
          ctx.strokeRect(spot.x + 4, spot.y + 12, panelW, (spot.height - 24) * 0.45);
          ctx.strokeRect(spot.x + 4, spot.y + 16 + (spot.height - 24) * 0.45, panelW, (spot.height - 24) * 0.45);
          // Right panels
          ctx.strokeRect(spot.x + spot.width / 2 + 2, spot.y + 12, panelW, (spot.height - 24) * 0.45);
          ctx.strokeRect(spot.x + spot.width / 2 + 2, spot.y + 16 + (spot.height - 24) * 0.45, panelW, (spot.height - 24) * 0.45);

          // Brass door handles
          ctx.fillStyle = '#d97706';
          ctx.beginPath();
          ctx.arc(spot.x + spot.width / 2 - 4, spot.y + spot.height * 0.5, 2.5, 0, Math.PI * 2);
          ctx.arc(spot.x + spot.width / 2 + 4, spot.y + spot.height * 0.5, 2.5, 0, Math.PI * 2);
          ctx.fill();

          if (spot.occupantId === player.id) {
            ctx.strokeStyle = '#60a5fa';
            ctx.lineWidth = 2.5;
            ctx.strokeRect(spot.x - 3, spot.y - 3, spot.width + 6, spot.height + 6);
          }
          ctx.restore();
        } else if (spot.type === 'recycle_bin') {
          // Industrial / Eco Recycle Bin
          ctx.save();
          ctx.fillStyle = 'rgba(0,0,0,0.3)';
          ctx.fillRect(spot.x + 2, spot.y + 3, spot.width, spot.height);

          // Bin Main Body (Eco Sky Blue)
          ctx.fillStyle = '#0284c7';
          ctx.fillRect(spot.x, spot.y, spot.width, spot.height);
          ctx.strokeStyle = '#0369a1';
          ctx.lineWidth = 2.5;
          ctx.strokeRect(spot.x, spot.y, spot.width, spot.height);

          // Flip Lid
          ctx.fillStyle = '#075985';
          ctx.fillRect(spot.x - 2, spot.y, spot.width + 4, 11);
          // Lid handle
          ctx.fillStyle = '#e0f2fe';
          ctx.fillRect(spot.x + spot.width / 2 - 7, spot.y + 2.5, 14, 3);

          // Wheels at bottom
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(spot.x - 2, spot.y + spot.height - 7, 3.5, 6);
          ctx.fillRect(spot.x + spot.width - 1.5, spot.y + spot.height - 7, 3.5, 6);

          // Recycling ♻️ Loop Icon in Center
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 17px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('♻', spot.x + spot.width / 2, spot.y + spot.height / 2 + 4);

          if (spot.occupantId === player.id) {
            ctx.strokeStyle = '#60a5fa';
            ctx.lineWidth = 2.5;
            ctx.strokeRect(spot.x - 3, spot.y - 3, spot.width + 6, spot.height + 6);
          }
          ctx.restore();
        } else if (spot.type === 'question_box') {
          // Secret Riddle Box / Question Vault
          ctx.save();
          ctx.fillStyle = '#312e81';
          ctx.fillRect(spot.x, spot.y, spot.width, spot.height);
          ctx.strokeStyle = '#818cf8';
          ctx.lineWidth = 2.5;
          ctx.strokeRect(spot.x, spot.y, spot.width, spot.height);

          // Keypad screen in center
          ctx.fillStyle = '#1e1b4b';
          ctx.fillRect(spot.x + 8, spot.y + 8, spot.width - 16, spot.height - 16);
          ctx.strokeStyle = '#a5b4fc';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(spot.x + 8, spot.y + 8, spot.width - 16, spot.height - 16);

          // Golden Corner brackets
          ctx.fillStyle = '#f59e0b';
          const bracket = 7;
          ctx.fillRect(spot.x, spot.y, bracket, 2);
          ctx.fillRect(spot.x, spot.y, 2, bracket);
          ctx.fillRect(spot.x + spot.width - bracket, spot.y, bracket, 2);
          ctx.fillRect(spot.x + spot.width - 2, spot.y, 2, bracket);
          ctx.fillRect(spot.x, spot.y + spot.height - 2, bracket, 2);
          ctx.fillRect(spot.x, spot.y + spot.height - bracket, 2, bracket);
          ctx.fillRect(spot.x + spot.width - bracket, spot.y + spot.height - 2, bracket, 2);
          ctx.fillRect(spot.x + spot.width - 2, spot.y + spot.height - bracket, 2, bracket);

          // Question mark glyph inside screen
          ctx.fillStyle = '#fbbf24';
          ctx.font = 'bold 16px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('?', spot.x + spot.width / 2, spot.y + spot.height / 2);

          if (spot.occupantId === player.id) {
            ctx.strokeStyle = '#60a5fa';
            ctx.lineWidth = 2.5;
            ctx.strokeRect(spot.x - 3, spot.y - 3, spot.width + 6, spot.height + 6);
          }
          ctx.restore();
        } else if (spot.type === 'bush') {
          // Leafy Bush (natural organic clusters)
          ctx.save();
          const cx = spot.x + spot.width / 2;
          const cy = spot.y + spot.height / 2;
          const rx = spot.width / 2;
          const ry = spot.height / 2;

          ctx.fillStyle = '#15803d'; // Forest green
          ctx.beginPath();
          ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
          ctx.fill();

          // Leaf overlays
          ctx.fillStyle = '#16a34a';
          ctx.beginPath();
          ctx.ellipse(cx - rx * 0.3, cy - ry * 0.2, rx * 0.6, ry * 0.6, 0, 0, Math.PI * 2);
          ctx.ellipse(cx + rx * 0.3, cy + ry * 0.1, rx * 0.5, ry * 0.5, 0, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = '#14532d';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
          ctx.stroke();

          ctx.restore();
        }

        // Draw animated question badge over any spot that requires answering a question
        if (spot.question || spot.type === 'question_box') {
          ctx.save();
          const bounce = Math.sin(Date.now() / 250) * 3;
          const qx = spot.x + spot.width / 2;
          const qy = spot.y - 12 + bounce;

          // Glowing aura
          ctx.fillStyle = 'rgba(99, 102, 241, 0.35)';
          ctx.beginPath();
          ctx.arc(qx, qy, 11, 0, Math.PI * 2);
          ctx.fill();

          // Badge circle
          ctx.fillStyle = '#4f46e5';
          ctx.beginPath();
          ctx.arc(qx, qy, 8.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#c7d2fe';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Question mark
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 11px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('?', qx, qy);
          ctx.restore();
        }
      }

      // 4b. Draw Active Floor Traps
      if (activeTraps && activeTraps.length > 0) {
        for (const trap of activeTraps) {
          ctx.save();
          ctx.translate(trap.x, trap.y);
          const isFriendly = trap.placedByRole === player.role;

          // Trap base plate
          ctx.fillStyle = trap.triggered ? '#450a0a' : isFriendly ? '#451a03' : '#1e293b';
          ctx.fillRect(-12, -12, 24, 24);

          ctx.strokeStyle = trap.triggered ? '#ef4444' : isFriendly ? '#fbbf24' : 'rgba(251, 191, 36, 0.4)';
          ctx.lineWidth = 1.8;
          ctx.strokeRect(-12, -12, 24, 24);

          // Center pressure mechanism
          ctx.fillStyle = trap.triggered ? '#ef4444' : isFriendly ? '#f59e0b' : '#94a3b8';
          ctx.beginPath();
          ctx.arc(0, 0, 4.5, 0, Math.PI * 2);
          ctx.fill();

          // Spikes/Jaws
          ctx.strokeStyle = trap.triggered ? '#f87171' : isFriendly ? '#fde68a' : '#64748b';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(-10, -10);
          ctx.lineTo(-6, -6);
          ctx.moveTo(10, -10);
          ctx.lineTo(6, -6);
          ctx.moveTo(-10, 10);
          ctx.lineTo(-6, 6);
          ctx.moveTo(10, 10);
          ctx.lineTo(6, 6);
          ctx.stroke();

          // Emoji label
          ctx.font = '12px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(trap.triggered ? '💥' : '🪤', 0, 0);

          ctx.restore();
        }
      }

      // 4c. Draw Active Decoy Beacons
      if (activeDecoys && activeDecoys.length > 0) {
        for (const decoy of activeDecoys) {
          ctx.save();
          ctx.translate(decoy.x, decoy.y);
          const age = now - decoy.createdAt;
          const rot = (age / 350) % (Math.PI * 2);

          // Projector disc base
          ctx.fillStyle = '#0f172a';
          ctx.beginPath();
          ctx.arc(0, 0, 14, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = '#06b6d4';
          ctx.lineWidth = 2;
          ctx.stroke();

          // Rotating holographic rings
          ctx.save();
          ctx.rotate(rot);
          ctx.strokeStyle = 'rgba(6, 182, 212, 0.7)';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([6, 4]);
          ctx.beginPath();
          ctx.arc(0, 0, 20, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();

          // Hologram Avatar
          ctx.save();
          ctx.globalAlpha = 0.65 + Math.sin(age / 120) * 0.25;
          ctx.font = '16px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('🤖', 0, -4);
          ctx.restore();

          // Label
          ctx.font = 'bold 9px system-ui, sans-serif';
          ctx.fillStyle = '#67e8f9';
          ctx.textAlign = 'center';
          ctx.fillText('DECOY', 0, 18);

          ctx.restore();
        }
      }

      // 4d. Draw Collectible World Items
      if (worldItems && worldItems.length > 0) {
        for (const item of worldItems) {
          const elapsed = (now - item.spawnTime) / 1000;
          const floatY = Math.sin(elapsed * 3.2) * 5;
          const pulseScale = 1 + Math.sin(elapsed * 4) * 0.12;

          ctx.save();
          ctx.translate(item.x, item.y + floatY);

          // Ground glow halo
          const glowGrad = ctx.createRadialGradient(0, 0, 4, 0, 0, 30 * pulseScale);
          glowGrad.addColorStop(0, item.color + '77');
          glowGrad.addColorStop(0.6, item.color + '22');
          glowGrad.addColorStop(1, 'transparent');
          ctx.fillStyle = glowGrad;
          ctx.beginPath();
          ctx.arc(0, 0, 30 * pulseScale, 0, Math.PI * 2);
          ctx.fill();

          // Floor shadow
          ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
          ctx.beginPath();
          ctx.ellipse(0, 16 - floatY * 0.4, 14, 6, 0, 0, Math.PI * 2);
          ctx.fill();

          // Item Badge Disc
          ctx.fillStyle = '#0f172a';
          ctx.beginPath();
          ctx.arc(0, 0, 15, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = item.color;
          ctx.lineWidth = 2.2;
          ctx.stroke();

          // Item Icon
          ctx.font = '16px system-ui, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(item.icon, 0, 1);

          // Floating Item Pill Tag
          ctx.font = 'bold 10px system-ui, -apple-system, sans-serif';
          const textW = ctx.measureText(item.name).width;
          ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
          ctx.beginPath();
          ctx.roundRect(-textW / 2 - 5, -28, textW + 10, 14, 4);
          ctx.fill();
          ctx.strokeStyle = item.color;
          ctx.lineWidth = 1;
          ctx.stroke();

          ctx.fillStyle = '#ffffff';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(item.name, 0, -21);

          ctx.restore();
        }
      }

      // 5. Draw Walls with 2.5D Depth Top Faces
      for (const wall of map.walls) {
        // Wall drop shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
        ctx.fillRect(wall.x + 6, wall.y + 6, wall.width, wall.height);

        // Wall base
        ctx.fillStyle = wall.color || map.theme.wallColor;
        ctx.fillRect(wall.x, wall.y, wall.width, wall.height);

        // Wall 3D top bevel
        ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.fillRect(wall.x, wall.y, wall.width, 4);
        ctx.fillRect(wall.x, wall.y, 4, wall.height);

        // Wall outline
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(wall.x, wall.y, wall.width, wall.height);
      }

      // 6. Draw Smoke Clouds
      for (const smoke of smokeClouds) {
        const age = now - smoke.createdAt;
        if (age > smoke.duration) continue;
        const fade = 1 - age / smoke.duration;

        ctx.save();
        const grad = ctx.createRadialGradient(
          smoke.x,
          smoke.y,
          5,
          smoke.x,
          smoke.y,
          smoke.radius
        );
        grad.addColorStop(0, `rgba(200, 210, 225, ${fade * 0.75})`);
        grad.addColorStop(0.7, `rgba(160, 175, 195, ${fade * 0.4})`);
        grad.addColorStop(1, 'rgba(160, 175, 195, 0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(smoke.x, smoke.y, smoke.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // 7. Draw Sound Ripples
      for (const ripple of soundRipples) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
        ctx.strokeStyle = ripple.isDistraction
          ? `rgba(245, 158, 11, ${ripple.opacity})` // Amber
          : ripple.sourceRole === 'seeker'
          ? `rgba(239, 68, 68, ${ripple.opacity})`
          : `rgba(96, 165, 250, ${ripple.opacity})`;
        ctx.lineWidth = 2.5;
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.restore();
      }

      // 8. Draw Flashlight Cones for Seekers (Occluded by walls!)
      const seekers = characters.filter((c) => c.role === 'seeker');
      for (const seeker of seekers) {
        if (phase === 'hiding') continue; // Flashlight off during hiding blindfold

        const beamDist = flashlightBoost && seeker.id === player.id ? 420 : 310;
        const beamAngle = seeker.angle;
        const halfFov = (flashlightBoost && seeker.id === player.id ? 65 : 55) * (Math.PI / 180);
        const raySteps = 36;

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(seeker.x, seeker.y);

        for (let i = 0; i <= raySteps; i++) {
          const rayAngle = beamAngle - halfFov + (i / raySteps) * (halfFov * 2);
          const hitDist = getRayWallDistance(
            { x: seeker.x, y: seeker.y },
            rayAngle,
            beamDist,
            map.walls
          );
          const hitX = seeker.x + Math.cos(rayAngle) * hitDist;
          const hitY = seeker.y + Math.sin(rayAngle) * hitDist;
          ctx.lineTo(hitX, hitY);
        }

        ctx.closePath();

        const grad = ctx.createRadialGradient(
          seeker.x,
          seeker.y,
          10,
          seeker.x,
          seeker.y,
          beamDist
        );
        grad.addColorStop(0, 'rgba(255, 255, 180, 0.45)');
        grad.addColorStop(0.6, 'rgba(255, 245, 150, 0.22)');
        grad.addColorStop(1, 'rgba(255, 245, 150, 0)');

        ctx.fillStyle = grad;
        ctx.fill();

        // High beam edge lines
        ctx.strokeStyle = 'rgba(255, 255, 200, 0.3)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.restore();
      }

      // 9. Draw Characters (Players & Bots)
      for (const char of characters) {
        // If character has active invisibility
        const isInvisible = Boolean(char.activeBuffs?.invisibilityTimeLeft && char.activeBuffs.invisibilityTimeLeft > 0);
        if (isInvisible) {
          // If player is seeker, completely hide invisible bots!
          if (player.role === 'seeker' && char.id !== player.id && char.id !== camTargetId) {
            continue;
          }
        }

        // If character is hiding inside a crate/locker and is NOT the player and NOT the spectated bot, hide completely!
        if (char.hidingSpotId && char.id !== player.id && char.id !== camTargetId) {
          continue;
        }

        // Speed boost afterimages
        if (char.activeBuffs?.speedBoostTimeLeft && char.activeBuffs.speedBoostTimeLeft > 0) {
          ctx.save();
          ctx.translate(char.x - char.vx * 3, char.y - char.vy * 3);
          ctx.globalAlpha = 0.25;
          ctx.fillStyle = '#facc15';
          ctx.beginPath();
          ctx.arc(0, 0, char.radius * 0.9, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }

        ctx.save();
        ctx.translate(char.x, char.y);

        // Alpha adjustment if in bush or inside locker or invisible
        if (isInvisible) {
          ctx.globalAlpha = (char.id === player.id || char.id === camTargetId) ? 0.45 : 0.2;
        } else if (char.hidingSpotId) {
          ctx.globalAlpha = 0.65; // Player or spectated bot is inside crate/locker
        } else if (char.isInBush) {
          ctx.globalAlpha = (char.id === player.id || char.id === camTargetId) ? 0.7 : 0.25;
        } else if (char.isCaught) {
          ctx.globalAlpha = 0.45;
        }

        // Shadow under character
        ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
        ctx.beginPath();
        ctx.ellipse(0, 5, char.radius * 0.9, char.radius * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Rotate towards facing angle
        ctx.rotate(char.angle);

        // Character Main Body
        ctx.fillStyle = char.isCaught ? '#64748b' : isInvisible ? '#c084fc' : char.color;
        ctx.beginPath();
        ctx.arc(0, 0, char.radius, 0, Math.PI * 2);
        ctx.fill();

        // Outline
        ctx.strokeStyle = isInvisible ? '#c084fc' : char.id === player.id ? '#ffffff' : '#0f172a';
        ctx.lineWidth = char.id === player.id ? 2.5 : 1.5;
        if (isInvisible) {
          ctx.shadowColor = '#c084fc';
          ctx.shadowBlur = 8;
        }
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Direction indicator / Visor
        ctx.fillStyle = char.role === 'seeker' ? '#fef08a' : '#e0f2fe';
        ctx.beginPath();
        ctx.arc(char.radius * 0.55, 0, char.radius * 0.35, -Math.PI / 2, Math.PI / 2);
        ctx.fill();

        // Small backpack / gear
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(-char.radius * 0.9, -char.radius * 0.4, char.radius * 0.4, char.radius * 0.8);

        ctx.restore();

        // Overhead UI (Name Tag, Health/Stamina bar if player, Emotes)
        ctx.save();
        ctx.translate(char.x, char.y);

        // Stunned spinning stars effect
        if (char.stunTimer && char.stunTimer > 0) {
          const spin = (now / 180) % (Math.PI * 2);
          ctx.save();
          ctx.font = '13px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          for (let s = 0; s < 3; s++) {
            const starAngle = spin + (s * Math.PI * 2) / 3;
            const sx = Math.cos(starAngle) * (char.radius + 6);
            const sy = Math.sin(starAngle) * 5 - char.radius - 20;
            ctx.fillText('💫', sx, sy);
          }
          ctx.restore();
        }

        // Speech bubble
        if (char.speech && char.speech.timer > 0) {
          ctx.save();
          const fade = Math.min(1, char.speech.timer / 20);
          ctx.globalAlpha = fade;

          ctx.font = '600 11px system-ui, -apple-system, sans-serif';
          const maxLineWidth = 150;
          const words = char.speech.text.split(' ');
          const lines: string[] = [];
          let currentLine = '';

          for (let i = 0; i < words.length; i++) {
            const testLine = currentLine ? `${currentLine} ${words[i]}` : words[i];
            const metrics = ctx.measureText(testLine);
            if (metrics.width > maxLineWidth && currentLine) {
              lines.push(currentLine);
              currentLine = words[i];
            } else {
              currentLine = testLine;
            }
          }
          if (currentLine) lines.push(currentLine);

          let measuredMaxW = 0;
          for (const line of lines) {
            measuredMaxW = Math.max(measuredMaxW, ctx.measureText(line).width);
          }

          const padX = 8;
          const padY = 5;
          const lineH = 14;
          const bubbleW = Math.max(40, measuredMaxW + padX * 2);
          const bubbleH = lines.length * lineH + padY * 2;
          const bubbleY = -char.radius - 30 - bubbleH;

          // Bubble shadow & background
          ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
          ctx.shadowBlur = 6;
          ctx.shadowOffsetY = 2;

          ctx.fillStyle = 'rgba(15, 23, 42, 0.94)';
          ctx.beginPath();
          ctx.roundRect(-bubbleW / 2, bubbleY, bubbleW, bubbleH, 7);
          ctx.fill();

          // Border tinted by role
          ctx.shadowColor = 'transparent';
          ctx.lineWidth = 1.5;
          ctx.strokeStyle =
            char.role === 'seeker'
              ? 'rgba(239, 68, 68, 0.8)'
              : char.id === player.id
              ? 'rgba(96, 165, 250, 0.8)'
              : 'rgba(52, 211, 153, 0.8)';
          ctx.stroke();

          // Little triangle speech pointer
          ctx.fillStyle = 'rgba(15, 23, 42, 0.94)';
          ctx.beginPath();
          ctx.moveTo(-4, bubbleY + bubbleH - 0.5);
          ctx.lineTo(0, bubbleY + bubbleH + 5);
          ctx.lineTo(4, bubbleY + bubbleH - 0.5);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = ctx.strokeStyle;
          ctx.stroke();

          // Text lines
          ctx.textAlign = 'center';
          ctx.textBaseline = 'top';
          ctx.fillStyle = '#f8fafc';
          lines.forEach((line, idx) => {
            ctx.fillText(line, 0, bubbleY + padY + idx * lineH);
          });

          ctx.restore();
        }

        // Emote bubble (shown prominently above speech bubble or character head)
        if (char.emote && char.emote.timer > 0) {
          ctx.save();
          const hasSpeech = Boolean(char.speech && char.speech.timer > 0);
          let emoteCenterY = -char.radius - 36;
          if (hasSpeech) {
            const rawLines = (char.speech?.text || '').split('\n');
            const estH = Math.min(rawLines.length * 14 + 10, 56);
            const estBubbleY = -char.radius - 30 - estH;
            emoteCenterY = estBubbleY - 14;
          }

          const isAgree = char.emote.text === '👍';
          const isDisagree = char.emote.text === '👎';

          // Pulsing or colored background circle
          ctx.fillStyle = isAgree
            ? '#059669'
            : isDisagree
            ? '#e11d48'
            : '#0f172a';

          ctx.beginPath();
          ctx.arc(0, emoteCenterY, 14, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2.5;
          ctx.stroke();

          ctx.font = 'bold 15px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(char.emote.text, 0, emoteCenterY + 1);
          ctx.restore();
        }

        // Name tag
        ctx.font = '11px system-ui, -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';

        const isHumanPlayer = char.id === player.id;
        const tagText = isHumanPlayer
          ? `${char.avatar || '🕵️'} ${char.name}${char.isHumanVerified ? ' ✓' : ''}`
          : char.name;
        const textWidth = ctx.measureText(tagText).width;

        ctx.fillStyle = isHumanPlayer && char.isHumanVerified
          ? 'rgba(6, 78, 59, 0.85)'
          : 'rgba(15, 23, 42, 0.75)';
        ctx.fillRect(-textWidth / 2 - 4, -char.radius - 18, textWidth + 8, 14);

        if (isHumanPlayer && char.isHumanVerified) {
          ctx.strokeStyle = '#10b981';
          ctx.lineWidth = 1;
          ctx.strokeRect(-textWidth / 2 - 4, -char.radius - 18, textWidth + 8, 14);
        }

        ctx.fillStyle = char.isCaught
          ? '#94a3b8'
          : isHumanPlayer
          ? (char.isHumanVerified ? '#6ee7b7' : '#60a5fa')
          : char.role === 'seeker'
          ? '#f87171'
          : '#e2e8f0';
        ctx.fillText(tagText, 0, -char.radius - 6);

        // Caught badge
        if (char.isCaught) {
          ctx.fillStyle = '#ef4444';
          ctx.font = 'bold 10px sans-serif';
          ctx.fillText('CAUGHT', 0, char.radius + 14);
        }

        // 9b. Camera Target Reticle (If spectating this bot)
        if (camTargetId && char.id === camTargetId && camTargetId !== player.id) {
          ctx.save();
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 1.8;
          ctx.setLineDash([3, 3]);
          ctx.beginPath();
          ctx.arc(0, 0, char.radius + 8, 0, Math.PI * 2);
          ctx.stroke();

          // Reticle corner brackets
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 2.2;
          ctx.setLineDash([]);
          const brk = char.radius + 12;
          const len = 5;
          // Top-left
          ctx.beginPath();
          ctx.moveTo(-brk, -brk + len);
          ctx.lineTo(-brk, -brk);
          ctx.lineTo(-brk + len, -brk);
          // Top-right
          ctx.moveTo(brk - len, -brk);
          ctx.lineTo(brk, -brk);
          ctx.lineTo(brk, -brk + len);
          // Bottom-left
          ctx.moveTo(-brk, brk - len);
          ctx.lineTo(-brk, brk);
          ctx.lineTo(-brk + len, brk);
          // Bottom-right
          ctx.moveTo(brk - len, brk);
          ctx.lineTo(brk, brk);
          ctx.lineTo(brk, -brk + len);
          ctx.stroke();
          ctx.restore();
        }

        ctx.restore();
      }

      // 10. Draw Radar Guidance Arrow (if Seeker used radar)
      if (radarPulseAngle !== null && player.role === 'seeker') {
        ctx.save();
        ctx.translate(player.x, player.y);
        ctx.rotate(radarPulseAngle);

        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.moveTo(player.radius + 20, 0);
        ctx.lineTo(player.radius + 10, -8);
        ctx.lineTo(player.radius + 10, 8);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = '#0284c7';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.restore();
      }

      // 10b. Draw Thermal Vision Highlights (revealing everyone through walls)
      if (player.activeBuffs?.thermalTimeLeft && player.activeBuffs.thermalTimeLeft > 0) {
        // Sonar pulse rings around player
        const sonarTime = (Date.now() / 400) % 3;
        for (let r = 1; r <= 3; r++) {
          const radius = ((sonarTime + r) % 3) * 160 + 20;
          const alpha = Math.max(0, 1 - radius / 500) * 0.35;
          ctx.save();
          ctx.strokeStyle = `rgba(52, 211, 153, ${alpha})`;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(player.x, player.y, radius, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }

        // Highlight characters with thermal aura
        for (const char of characters) {
          if (char.id === player.id || char.isCaught) continue;
          ctx.save();
          ctx.translate(char.x, char.y);

          const isEnemy = char.role !== player.role;
          const thermalColor = isEnemy ? '#f97316' : '#22c55e'; // Orange for enemy, green for ally

          ctx.strokeStyle = thermalColor;
          ctx.lineWidth = 2.5;
          ctx.shadowColor = thermalColor;
          ctx.shadowBlur = 14;
          ctx.beginPath();
          ctx.arc(0, 0, char.radius + 5, 0, Math.PI * 2);
          ctx.stroke();

          // Distance and reticle tag
          const dist = Math.round(Math.hypot(char.x - player.x, char.y - player.y) / 18);
          ctx.shadowBlur = 0;
          ctx.font = 'bold 10px monospace';
          ctx.fillStyle = thermalColor;
          ctx.textAlign = 'center';
          ctx.fillText(`⌖ ${dist}m`, 0, -char.radius - 22);

          ctx.restore();
        }
      }

      ctx.restore(); // End world transform

      // 11. Screen-space Overlays (Vignette, Seeker Blindfold, Tension Heartbeat, Buff Status)
      if (
        phase === 'hiding' &&
        player.role === 'seeker' &&
        (!camTargetId || camTargetId === player.id || camTargetId === 'player')
      ) {
        // Blindfold effect for seeker during countdown (only when camera is on player)
        ctx.fillStyle = 'rgba(10, 10, 15, 0.94)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#f87171';
        ctx.font = 'bold 24px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('BLINDFOLD ACTIVE: HIDERS ARE SCATTERING...', canvas.width / 2, canvas.height / 2 - 20);

        ctx.fillStyle = '#94a3b8';
        ctx.font = '16px system-ui, sans-serif';
        ctx.fillText('Wait for countdown to end before opening your eyes!', canvas.width / 2, canvas.height / 2 + 15);
      }

      // 11b. Screen-space Buff Status Vignettes
      if (player.activeBuffs?.invisibilityTimeLeft && player.activeBuffs.invisibilityTimeLeft > 0) {
        const invTime = player.activeBuffs.invisibilityTimeLeft;
        const fade = Math.min(1, invTime);
        const grad = ctx.createRadialGradient(
          canvas.width / 2, canvas.height / 2, canvas.width * 0.3,
          canvas.width / 2, canvas.height / 2, canvas.width * 0.7
        );
        grad.addColorStop(0, 'transparent');
        grad.addColorStop(1, `rgba(168, 85, 247, ${0.28 * fade})`);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      if (player.activeBuffs?.thermalTimeLeft && player.activeBuffs.thermalTimeLeft > 0) {
        const grad = ctx.createRadialGradient(
          canvas.width / 2, canvas.height / 2, canvas.width * 0.35,
          canvas.width / 2, canvas.height / 2, canvas.width * 0.7
        );
        grad.addColorStop(0, 'transparent');
        grad.addColorStop(1, 'rgba(16, 185, 129, 0.2)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      if (player.activeBuffs?.speedBoostTimeLeft && player.activeBuffs.speedBoostTimeLeft > 0) {
        const grad = ctx.createRadialGradient(
          canvas.width / 2, canvas.height / 2, canvas.width * 0.35,
          canvas.width / 2, canvas.height / 2, canvas.width * 0.7
        );
        grad.addColorStop(0, 'transparent');
        grad.addColorStop(1, 'rgba(234, 179, 8, 0.18)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [
    map,
    characters,
    player,
    camTargetId,
    phase,
    soundRipples,
    footsteps,
    smokeClouds,
    radarPulseAngle,
    flashlightBoost,
    worldItems,
    activeTraps,
    activeDecoys,
  ]);

  return (
    <div className="relative w-full h-full select-none overflow-hidden bg-slate-950">
      <canvas
        id="game-canvas"
        ref={canvasRef}
        onClick={handleClick}
        className="w-full h-full block cursor-crosshair"
      />
    </div>
  );
};
