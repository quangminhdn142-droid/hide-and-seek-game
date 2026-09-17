import { Language } from '../types';

export interface Translations {
  // Common
  langName: string;
  gameTitle: string;
  matchmakingSubtitle: string;
  playersCount: string;
  language: string;
  
  // Lobby
  playerNickname: string;
  enterHandle: string;
  chooseRole: string;
  playAsHider: string;
  playAsSeeker: string;
  selectArenaMap: string;
  botCount: string;
  botIntelligence: string;
  easy: string;
  normal: string;
  hard: string;
  matchTime: string;
  launchMatch: string;
  mapOfficeTitle: string;
  mapOfficeDesc: string;
  mapWarehouseTitle: string;
  mapWarehouseDesc: string;
  mapMansionTitle: string;
  mapMansionDesc: string;
  mapManorTitle: string;
  mapManorDesc: string;
  mapCyberTitle: string;
  mapCyberDesc: string;

  // HUD
  roleHider: string;
  roleSeeker: string;
  hidersAlive: string;
  timeRemaining: string;
  hidingPhase: string;
  seekingPhase: string;
  stamina: string;
  heartRateTension: string;
  spectating: string;
  cycleCamHint: string;
  resetCamHint: string;
  stunnedText: string;
  soundOn: string;
  soundOff: string;
  howToPlay: string;
  lobbyBtn: string;
  
  // Abilities
  abilityRock: string;
  abilityRockDesc: string;
  abilitySonar: string;
  abilitySonarDesc: string;
  abilitySmoke: string;
  abilitySmokeDesc: string;
  abilityFlashlight: string;
  abilityFlashlightDesc: string;
  ready: string;
  cooldownSec: string;

  // Items
  inventoryTitle: string;
  slotEmpty: string;
  itemGhostCloak: string;
  itemGhostCloakDesc: string;
  itemShockTrap: string;
  itemShockTrapDesc: string;
  itemDecoyBeacon: string;
  itemDecoyBeaconDesc: string;
  itemThermalVisor: string;
  itemThermalVisorDesc: string;
  itemSpeedSurge: string;
  itemSpeedSurgeDesc: string;
  pressKeyToUse: string;

  // Buff Tray
  buffInvisibility: string;
  buffThermal: string;
  buffSpeed: string;

  // Interact Prompts
  promptHideCrate: string;
  promptExitCrate: string;
  promptHideLocker: string;
  promptExitLocker: string;
  promptSearchLocker: string;
  promptTagHider: string;
  promptInBush: string;

  // Game Over
  victoryTitle: string;
  defeatTitle: string;
  hiderWonDesc: string;
  hiderLostDesc: string;
  seekerWonDesc: string;
  seekerLostDesc: string;
  statTimeSurvived: string;
  statHidersCaught: string;
  statCloseCalls: string;
  statAbilitiesUsed: string;
  playAgain: string;
  lobbySettings: string;

  // How To Play
  htpTitle: string;
  htpControlsTitle: string;
  htpMove: string;
  htpAim: string;
  htpSprint: string;
  htpSneak: string;
  htpInteract: string;
  htpAbilities: string;
  htpUseItems: string;
  htpBotCam: string;
  htpItemPickupNote: string;
  htpHiderRulesTitle: string;
  htpHiderRulesBody: string;
  htpSeekerRulesTitle: string;
  htpSeekerRulesBody: string;
  htpItemsTitle: string;

  // Chat
  chatTitle: string;
  chatPlaceholder: string;
  sendBtn: string;
  presetSafe: string;
  presetHelp: string;
  presetSplit: string;
  presetTaunt: string;

  // System Messages
  sysMatchStarted: string;
  sysHidePhaseTime: string;
  sysSeekPhaseStart: string;
  sysCaught: string;
  sysItemPicked: string;
  sysGhostCloak: string;
  sysDecoyDeployed: string;
  sysTrapArmed: string;
  sysTrapTriggered: string;
  sysThermalEngaged: string;
  sysSpeedInjected: string;
  sysAllHidersFound: string;
  sysTimeUpHidersWin: string;
}

export const TRANSLATIONS: Record<Language, Translations> = {
  en: {
    langName: 'English',
    gameTitle: 'Hide and Seek Arena',
    matchmakingSubtitle: 'Online Bot Matchmaking',
    playersCount: '{count} Players',
    language: 'Language',

    playerNickname: 'Player Nickname',
    enterHandle: 'Enter your handle...',
    chooseRole: 'Choose Your Role',
    playAsHider: 'Play as Hider',
    playAsSeeker: 'Play as Seeker',
    selectArenaMap: 'Select Arena Map',
    botCount: 'Total Players & Bots',
    botIntelligence: 'Bot Intelligence',
    easy: 'Easy',
    normal: 'Normal',
    hard: 'Hard',
    matchTime: 'Match Time',
    launchMatch: 'Launch Match',
    mapOfficeTitle: 'Abandoned Office',
    mapOfficeDesc: 'Cubicle maze with lockers, supply closets, and high-frequency sound corridors.',
    mapWarehouseTitle: 'Industrial Warehouse',
    mapWarehouseDesc: 'High-density cargo zone with shipping crates, office corridors, and outdoor storage yards.',
    mapMansionTitle: 'Midnight Mansion',
    mapMansionDesc: 'Luxurious estate with hedge gardens, winding corridors, and dark corners.',
    mapManorTitle: 'Spooky Manor',
    mapManorDesc: 'An eerie estate with long carpeted galleries, grand dining rooms, secluded wardrobes, and hedge mazes.',
    mapCyberTitle: 'Cyber Core Facility',
    mapCyberDesc: 'A subterranean scientific laboratory with server banks, bio-domes, maintenance ducts, and blast doors.',

    roleHider: 'HIDER',
    roleSeeker: 'SEEKER',
    hidersAlive: 'Hiders Alive',
    timeRemaining: 'Remaining',
    hidingPhase: 'HIDING PHASE',
    seekingPhase: 'SEEKING PHASE',
    stamina: 'STAMINA',
    heartRateTension: 'TENSION / HEART RATE',
    spectating: 'Spectating',
    cycleCamHint: 'TAB: Cycle Bot',
    resetCamHint: 'Esc: Back to You',
    stunnedText: '⚡ STUNNED!',
    soundOn: 'Mute',
    soundOff: 'Unmute',
    howToPlay: 'How to Play',
    lobbyBtn: 'Lobby',

    abilityRock: 'Disguise Rock',
    abilityRockDesc: 'Freeze into a harmless stone to blend with surroundings',
    abilitySonar: 'Sonar Scan',
    abilitySonarDesc: 'Ping sound ripple across 400px to detect moving hiders',
    abilitySmoke: 'Smoke Cloud',
    abilitySmokeDesc: 'Deploy dense obscuring smoke screen for quick escapes',
    abilityFlashlight: 'High-Beam Torch',
    abilityFlashlightDesc: 'Extend flashlight range by +40% with +35% movement speed surge',
    ready: 'READY',
    cooldownSec: '{sec}s',

    inventoryTitle: 'Items [1-3]',
    slotEmpty: 'Empty',
    itemGhostCloak: 'Ghost Cloak',
    itemGhostCloakDesc: 'Invisible to seeker vision & silent footsteps for 6s',
    itemShockTrap: 'Shock Trap',
    itemShockTrapDesc: 'Floor snare that immobilizes and stuns victims for 3s',
    itemDecoyBeacon: 'Holo-Decoy',
    itemDecoyBeaconDesc: 'Emits fake audio waves to bait and confuse seekers',
    itemThermalVisor: 'Thermal Visor',
    itemThermalVisorDesc: 'X-Ray scanner revealing all players through walls for 6s',
    itemSpeedSurge: 'Adrenaline',
    itemSpeedSurgeDesc: 'Full stamina replenish and +70% speed surge for 6s',
    pressKeyToUse: 'Press {key} to use',

    buffInvisibility: '👻 Ghost Stealth',
    buffThermal: '🥽 Thermal X-Ray',
    buffSpeed: '⚡ Adrenaline Surge',

    promptHideCrate: '[E / Space] Hide in Crate',
    promptExitCrate: '[E / Space] Exit Crate',
    promptHideLocker: '[E / Space] Hide in Locker',
    promptExitLocker: '[E / Space] Exit Locker',
    promptSearchLocker: '[E / Space] Search Locker',
    promptTagHider: '[E / Space] Tag & Capture Hider!',
    promptInBush: '🌿 Camouflaged in Bush',

    victoryTitle: 'VICTORY!',
    defeatTitle: 'DEFEAT',
    hiderWonDesc: 'You successfully hid until the clock expired!',
    hiderLostDesc: 'The seeker hunted you down before time ran out.',
    seekerWonDesc: 'You tracked down and captured all hiders!',
    seekerLostDesc: 'Time expired before you could find every hider.',
    statTimeSurvived: 'Time Survived',
    statHidersCaught: 'Hiders Caught',
    statCloseCalls: 'Close Calls',
    statAbilitiesUsed: 'Abilities Used',
    playAgain: 'Play Again',
    lobbySettings: 'Lobby Settings',

    htpTitle: '🎮 How to Play Hide & Seek Arena',
    htpControlsTitle: 'Keyboard & Mouse Controls',
    htpMove: 'Move',
    htpAim: 'Aim / Turn',
    htpSprint: 'Sprint',
    htpSneak: 'Sneak (Silent)',
    htpInteract: 'Interact / Hide',
    htpAbilities: 'Abilities',
    htpUseItems: 'Use Items',
    htpBotCam: 'Bot Cam (Spectate)',
    htpItemPickupNote: 'Walk over floating item capsules to pick them up into your 3 inventory slots!',
    htpHiderRulesTitle: 'Hider Objectives',
    htpHiderRulesBody: 'Survive until time expires! Crouch to walk silently without creating footstep sound ripples. Hide in lockers, crates, and bushes. Use Rock Disguise [Q] or Smoke Bombs [F] when chased.',
    htpSeekerRulesTitle: 'Seeker Objectives',
    htpSeekerRulesBody: 'Hunt and tag all hiders before the match timer ends! Listen for footstep ripples and watch for suspect shadows. Use Pulse Sonar [Q] to sweep areas and Flashlight Surge [F] to close the gap.',
    htpItemsTitle: 'Collectible Power-Up Items',

    chatTitle: 'Arena Comms & Radio',
    chatPlaceholder: 'Type a callout or plan...',
    sendBtn: 'Send',
    presetSafe: 'Is it safe?',
    presetHelp: 'Seeker is near me!',
    presetSplit: 'Split up now!',
    presetTaunt: "Can't catch me!",

    sysMatchStarted: 'Match started in {map}! 15-second hide phase initiated.',
    sysHidePhaseTime: '15-second hide phase initiated.',
    sysSeekPhaseStart: 'Hiding phase over! The seekers are unleashed!',
    sysCaught: '{name} was tagged and captured!',
    sysItemPicked: '{name} picked up {item}!',
    sysGhostCloak: '{name} activated Ghost Cloak! Invisible to sight & sound for 6s!',
    sysDecoyDeployed: '{name} deployed a Holo-Decoy Beacon! Emits fake audio pulses!',
    sysTrapArmed: '{name} armed a Shock Frost Trap!',
    sysTrapTriggered: '{name} stepped into a Shock Frost Trap! Stunned for 3 seconds!',
    sysThermalEngaged: '{name} engaged Thermal X-Ray Visor! Revealing all locations for 6s!',
    sysSpeedInjected: '{name} injected Adrenaline Syringe (+70% Speed Surge)!',
    sysAllHidersFound: 'All hiders have been found! Seekers win!',
    sysTimeUpHidersWin: 'Time has expired! The surviving hiders win!',
  },

  vi: {
    langName: 'Tiếng Việt',
    gameTitle: 'Đấu Trường Trốn Tìm',
    matchmakingSubtitle: 'Hệ Thống Ghép Đội Bot Tự Động',
    playersCount: '{count} Người chơi',
    language: 'Ngôn Ngữ',

    playerNickname: 'Tên Người Chơi',
    enterHandle: 'Nhập biệt danh của bạn...',
    chooseRole: 'Chọn Vai Trò Của Bạn',
    playAsHider: 'Phe Trốn Tìm',
    playAsSeeker: 'Phe Đi Săn',
    selectArenaMap: 'Chọn Bản Đồ Thi Đấu',
    botCount: 'Tổng Số Người & Bot',
    botIntelligence: 'Độ Thông Minh Bot',
    easy: 'Dễ',
    normal: 'Vừa',
    hard: 'Khó',
    matchTime: 'Thời Gian Trận',
    launchMatch: 'Bắt Đầu Trận Đấu',
    mapOfficeTitle: 'Văn Phòng Bỏ Hoang',
    mapOfficeDesc: 'Mê cung bàn làm việc với tủ đồ, phòng kho và hành lang phản xạ âm thanh.',
    mapWarehouseTitle: 'Kho Hàng Công Nghiệp',
    mapWarehouseDesc: 'Khu kho vận hàng hóa mật độ cao với các dãy container, phòng điều hành và bãi bốc dỡ.',
    mapMansionTitle: 'Biệt Thự Đêm Khuya',
    mapMansionDesc: 'Dinh thự sang trọng với vườn cây xén tỉa, ngóc ngách tối và nhiều lối thoát.',
    mapManorTitle: 'Dinh Thự U Ám',
    mapManorDesc: 'Khu biệt thự cổ kính với hành lang trải thảm, phòng ăn lớn, tủ áo bí mật và mê cung cây cảnh.',
    mapCyberTitle: 'Tổ Hợp Lõi Công Nghệ',
    mapCyberDesc: 'Phòng thí nghiệm khoa học ngầm với giàn máy chủ, vòm sinh học và cửa chống nổ.',

    roleHider: 'NGƯỜI TRỐN',
    roleSeeker: 'NGƯỜI TÌM',
    hidersAlive: 'Người Trốn Còn Sống',
    timeRemaining: 'Thời Gian Còn Lại',
    hidingPhase: 'GIAI ĐOẠN ẨN NẤP',
    seekingPhase: 'GIAI ĐOẠN TRUY LÙNG',
    stamina: 'THỂ LỰC',
    heartRateTension: 'CĂNG THẲNG / NHỊP TIM',
    spectating: 'Đang theo dõi',
    cycleCamHint: 'TAB: Đổi góc nhìn',
    resetCamHint: 'Esc: Về nhân vật',
    stunnedText: '⚡ BỊ CHOÁNG!',
    soundOn: 'Tắt âm',
    soundOff: 'Bật âm',
    howToPlay: 'Hướng Dẫn',
    lobbyBtn: 'Sảnh Chờ',

    abilityRock: 'Biến Thành Đá',
    abilityRockDesc: 'Đứng yên hóa đá vô hại để hòa mình vào cảnh vật xung quanh',
    abilitySonar: 'Sóng Rada Quét',
    abilitySonarDesc: 'Phát sóng âm bán kính 400px phát hiện người trốn đang di chuyển',
    abilitySmoke: 'Tung Bom Khói',
    abilitySmokeDesc: 'Tạo màn khói dày đặc che khuất tầm nhìn để tẩu thoát trong gang tấc',
    abilityFlashlight: 'Đèn Pha Tăng Áp',
    abilityFlashlightDesc: 'Tăng tầm chiếu đèn thêm +40% và tốc độ di chuyển +35%',
    ready: 'SẴN SÀNG',
    cooldownSec: '{sec}s',

    inventoryTitle: 'Túi Đồ [Phím 1-3]',
    slotEmpty: 'Trống',
    itemGhostCloak: 'Áo Tàng Hình',
    itemGhostCloakDesc: 'Tàng hình hoàn toàn và bước đi không phát ra âm thanh trong 6 giây',
    itemShockTrap: 'Bẫy Sốc Điện',
    itemShockTrapDesc: 'Đặt bẫy sàn đóng băng và làm choáng đối thủ giẫm phải trong 3 giây',
    itemDecoyBeacon: 'Mồi Nhử Âm',
    itemDecoyBeaconDesc: 'Phát ra sóng âm thanh giả đánh lạc hướng và dụ người đi săn',
    itemThermalVisor: 'Kính Xuyên Tường',
    itemThermalVisorDesc: 'Quét nhiệt hiển thị vị trí tất cả đối thủ xuyên qua tường trong 6 giây',
    itemSpeedSurge: 'Tiêm Adrenaline',
    itemSpeedSurgeDesc: 'Hồi phục ngay lập tức thể lực và tăng +70% tốc độ chạy trong 6 giây',
    pressKeyToUse: 'Nhấn {key} để dùng',

    buffInvisibility: '👻 Đang Tàng Hình',
    buffThermal: '🥽 Nhìn Xuyên Tường',
    buffSpeed: '⚡ Tăng Tốc Độ',

    promptHideCrate: '[E / Cách] Trốn vào Thùng Gỗ',
    promptExitCrate: '[E / Cách] Rời khỏi Thùng',
    promptHideLocker: '[E / Cách] Trốn vào Tủ Sắt',
    promptExitLocker: '[E / Cách] Rời khỏi Tủ',
    promptSearchLocker: '[E / Cách] Mở Tủ Tìm Kiếm',
    promptTagHider: '[E / Cách] Bắt Người Trốn!',
    promptInBush: '🌿 Đang Nấp Trong Bụi Cây',

    victoryTitle: 'CHIẾN THẮNG!',
    defeatTitle: 'THẤT BẠI',
    hiderWonDesc: 'Bạn đã ẩn nấp thành công cho đến khi hết thời gian trận đấu!',
    hiderLostDesc: 'Người đi tìm đã tóm được bạn trước khi đồng hồ điểm 0.',
    seekerWonDesc: 'Bạn đã truy tìm và bắt giữ thành công toàn bộ người trốn!',
    seekerLostDesc: 'Hết giờ thi đấu trước khi bạn tìm thấy tất cả người trốn.',
    statTimeSurvived: 'Thời Gian Sống Sót',
    statHidersCaught: 'Số Người Đã Bắt',
    statCloseCalls: 'Thoát Tim Gang Tấc',
    statAbilitiesUsed: 'Kỹ Năng Đã Dùng',
    playAgain: 'Chơi Lại',
    lobbySettings: 'Cài Đặt Sảnh',

    htpTitle: '🎮 Hướng Dẫn Chơi Đấu Trường Trốn Tìm',
    htpControlsTitle: 'Phím Điều Khiển (Bàn phím & Chuột)',
    htpMove: 'Di chuyển',
    htpAim: 'Ngắm / Xoay',
    htpSprint: 'Chạy nhanh',
    htpSneak: 'Đi rón rén (không ồn)',
    htpInteract: 'Tương tác / Trốn',
    htpAbilities: 'Kỹ năng đặc biệt',
    htpUseItems: 'Dùng vật phẩm',
    htpBotCam: 'Góc nhìn Bot (Quan sát)',
    htpItemPickupNote: 'Chạy qua các viên nang vật phẩm lơ lửng trên sàn để nhặt vào túi (tối đa 3 món)!',
    htpHiderRulesTitle: 'Nhiệm Vụ Người Trốn (Hider)',
    htpHiderRulesBody: 'Sống sót đến khi hết giờ! Đi rón rén (Ctrl/C) để không tạo sóng âm thanh bước chân. Ẩn mình trong tủ đồ, thùng gỗ hoặc bụi rậm. Tận dụng Hóa Đá [Q] hoặc Bom Khói [F] khi bị đuổi.',
    htpSeekerRulesTitle: 'Nhiệm Vụ Người Tìm (Seeker)',
    htpSeekerRulesBody: 'Truy lùng và bắt trọn tất cả người trốn trước khi hết giờ! Để ý các vòng sóng âm bước chân và kiểm tra các góc tối. Dùng Rada [Q] để dò tìm và Đèn Pha Tăng Áp [F] để bứt tốc bắt người.',
    htpItemsTitle: 'Trang Bị & Vật Phẩm Độc Đáo',

    chatTitle: 'Bộ Đàm & Trò Chuyện Trận Đấu',
    chatPlaceholder: 'Nhập thông điệp hoặc chiến thuật...',
    sendBtn: 'Gửi',
    presetSafe: 'Khu này an toàn không?',
    presetHelp: 'Người tìm đang ở gần tôi!',
    presetSplit: 'Mọi người tản ra mau!',
    presetTaunt: 'Đố bắt được tôi đấy!',

    sysMatchStarted: 'Trận đấu bắt đầu tại {map}! 15 giây ẩn nấp bắt đầu.',
    sysHidePhaseTime: '15 giây ẩn nấp bắt đầu.',
    sysSeekPhaseStart: 'Hết giờ ẩn nấp! Thợ săn bắt đầu xuất kích!',
    sysCaught: '{name} đã bị tóm gọn!',
    sysItemPicked: '{name} đã nhặt được {item}!',
    sysGhostCloak: '{name} kích hoạt Áo Choàng Tàng Hình! Vô hình và không tiếng động 6s!',
    sysDecoyDeployed: '{name} đặt Thiết Bị Mồi Nhử! Phát âm thanh giả đánh lạc hướng!',
    sysTrapArmed: '{name} đã gài một chiếc Bẫy Sốc Băng Giá!',
    sysTrapTriggered: '{name} đã giẫm phải Bẫy Sốc Điện! Bị choáng trong 3 giây!',
    sysThermalEngaged: '{name} kích hoạt Kính Nhìn Xuyên Tường! Phát hiện vị trí tất cả đối thủ 6s!',
    sysSpeedInjected: '{name} tiêm Adrenaline (+70% Tốc độ chạy)!',
    sysAllHidersFound: 'Tất cả người trốn đã bị bắt! Phe Đi Tìm chiến thắng!',
    sysTimeUpHidersWin: 'Hết thời gian trận đấu! Những người trốn còn sống chiến thắng!',
  },
};
