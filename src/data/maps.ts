import { GameMap } from '../types';
import { HIDING_QUESTIONS, ensureMapQuestions } from './questions';

export const MAPS: GameMap[] = [
  {
    id: 'warehouse',
    name: 'Industrial Warehouse',
    nameVi: 'Kho Hàng Công Nghiệp',
    description: 'High-density cargo zone with shipping crates, office corridors, and outdoor storage yards.',
    descriptionVi: 'Khu kho vận hàng hóa mật độ cao với các dãy container, phòng điều hành và bãi bốc dỡ.',
    width: 2000,
    height: 1500,
    hiderSpawn: { x: 1000, y: 740 },
    seekerSpawn: { x: 220, y: 200 },
    zones: [
      { name: 'Security Office', nameVi: 'Phòng An Ninh', x: 30, y: 30, width: 440, height: 380 },
      { name: 'Executive Offices', nameVi: 'Khu Văn Phòng Điều Hành', x: 570, y: 30, width: 620, height: 380 },
      { name: 'East Vaults', nameVi: 'Hầm Chứa Phía Đông', x: 1480, y: 30, width: 490, height: 600 },
      { name: 'Central Cargo Bay', nameVi: 'Khu Chứa Hàng Trung Tâm', x: 350, y: 470, width: 1100, height: 520 },
      { name: 'Machinery Depot', nameVi: 'Xưởng Thiết Bị & Máy Móc', x: 30, y: 920, width: 550, height: 550 },
      { name: 'Loading Dock Yard', nameVi: 'Bãi Bốc Dỡ Hàng Hóa', x: 1420, y: 880, width: 550, height: 590 },
    ],
    theme: {
      background: '#181b22',
      floorTile: '#212631',
      wallColor: '#343e52',
      ambientLight: 0.15,
    },
    walls: [
      // Outer boundaries
      { id: 'w_top', x: 0, y: 0, width: 2000, height: 30, color: '#2a3242' },
      { id: 'w_bottom', x: 0, y: 1470, width: 2000, height: 30, color: '#2a3242' },
      { id: 'w_left', x: 0, y: 0, width: 30, height: 1500, color: '#2a3242' },
      { id: 'w_right', x: 1970, y: 0, width: 30, height: 1500, color: '#2a3242' },

      // Security Office (Top-Left) with wide 200px open exit to the South-East
      { id: 'sec_wall_s', x: 30, y: 380, width: 220, height: 25, color: '#44516d' },
      // Doorway: x: 250..450 (200px wide open entrance)
      { id: 'sec_wall_e', x: 450, y: 30, width: 25, height: 375, color: '#44516d' },

      // Office Section (Top Center) with wide 180px front entrance
      { id: 'off_w_left', x: 570, y: 30, width: 25, height: 355, color: '#44516d' },
      // Office Doors & dividers
      { id: 'off_w_front1', x: 570, y: 385, width: 220, height: 25, color: '#44516d' },
      // Doorway: x: 790..970 (180px wide main door)
      { id: 'off_w_front2', x: 970, y: 385, width: 220, height: 25, color: '#44516d' },
      { id: 'off_w_right', x: 1190, y: 30, width: 25, height: 380, color: '#44516d' },
      // Office Desks (placed safely against walls)
      { id: 'off_desk1', x: 640, y: 110, width: 130, height: 50, color: '#564234' },
      { id: 'off_desk2', x: 1010, y: 110, width: 130, height: 50, color: '#564234' },

      // Central Cargo Rows (Containers spaced with generous 240px wide aisles)
      { id: 'cont_1', x: 400, y: 520, width: 250, height: 85, color: '#a34836' },
      { id: 'cont_2', x: 750, y: 520, width: 220, height: 85, color: '#2b5f8c' },
      { id: 'cont_3', x: 1070, y: 520, width: 250, height: 85, color: '#3d784a' },

      // Wide 235px central corridor between y: 605 and y: 840
      { id: 'cont_4', x: 400, y: 840, width: 250, height: 85, color: '#826935' },
      { id: 'cont_5', x: 750, y: 840, width: 220, height: 85, color: '#543b78' },
      { id: 'cont_6', x: 1070, y: 840, width: 250, height: 85, color: '#a34836' },

      // Bottom Machinery & Racks (arranged with open walkways)
      { id: 'rack_1', x: 180, y: 1040, width: 320, height: 40, color: '#505d75' },
      { id: 'rack_2', x: 180, y: 1220, width: 320, height: 40, color: '#505d75' },

      { id: 'rack_3', x: 720, y: 1080, width: 40, height: 280, color: '#505d75' },
      { id: 'rack_4', x: 960, y: 1080, width: 40, height: 280, color: '#505d75' },

      // East Section (Storage vaults with open double entrances)
      { id: 'vault_w1', x: 1480, y: 180, width: 25, height: 380, color: '#44516d' },
      // Vault Doorway 1: y: 560..720 (160px wide opening)
      { id: 'vault_w2', x: 1480, y: 720, width: 260, height: 25, color: '#44516d' },
      { id: 'vault_w3', x: 1480, y: 920, width: 260, height: 25, color: '#44516d' },
      // Vault Doorway 2: y: 945..1100 (155px wide opening)
      { id: 'vault_w4', x: 1480, y: 1100, width: 25, height: 300, color: '#44516d' },

      // Heavy Storage Pallets
      { id: 'pallet_e1', x: 1680, y: 320, width: 120, height: 80, color: '#685444' },
      { id: 'pallet_e2', x: 1680, y: 480, width: 120, height: 80, color: '#685444' },
      { id: 'pallet_e3', x: 1680, y: 1220, width: 180, height: 100, color: '#685444' },
    ],
    hidingSpots: [
      // Crates (interactive, can hide inside)
      { id: 'hs_crate_1', type: 'crate', x: 580, y: 1320, width: 64, height: 64 },
      { id: 'hs_crate_2', type: 'crate', x: 1120, y: 1320, width: 64, height: 64 },
      { id: 'hs_crate_3', type: 'crate', x: 300, y: 680, width: 60, height: 60 },
      { id: 'hs_crate_4', type: 'crate', x: 1380, y: 680, width: 64, height: 64 },
      { id: 'hs_crate_5', type: 'crate', x: 1840, y: 380, width: 64, height: 64 },

      // Lockers in offices
      { id: 'hs_lock_1', type: 'locker', x: 620, y: 45, width: 44, height: 75 },
      { id: 'hs_lock_2', type: 'locker', x: 1120, y: 45, width: 44, height: 75 },
      { id: 'hs_lock_3', type: 'locker', x: 1880, y: 920, width: 44, height: 75 },

      // Wardrobes (Staff changing & storage wardrobes)
      { id: 'hs_wardrobe_w1', type: 'wardrobe', x: 80, y: 180, width: 55, height: 80 },
      { id: 'hs_wardrobe_w2', type: 'wardrobe', x: 800, y: 45, width: 55, height: 80 },
      { id: 'hs_wardrobe_w3', type: 'wardrobe', x: 1540, y: 220, width: 55, height: 80 },

      // Recycle Bins (Eco-containers with flip lids)
      { id: 'hs_recycle_w1', type: 'recycle_bin', x: 380, y: 320, width: 48, height: 48 },
      { id: 'hs_recycle_w2', type: 'recycle_bin', x: 680, y: 700, width: 48, height: 48 },
      { id: 'hs_recycle_w3', type: 'recycle_bin', x: 1380, y: 1040, width: 48, height: 48 },
      { id: 'hs_recycle_w4', type: 'recycle_bin', x: 1820, y: 1160, width: 48, height: 48 },

      // Question Hiding Spots (Answer a quiz / riddle to enter!)
      {
        id: 'hs_question_w1',
        type: 'question_box',
        x: 340,
        y: 120,
        width: 52,
        height: 52,
        question: HIDING_QUESTIONS[0],
      },
      {
        id: 'hs_question_w2',
        type: 'wardrobe',
        x: 1720,
        y: 60,
        width: 55,
        height: 80,
        question: HIDING_QUESTIONS[1],
      },
      {
        id: 'hs_question_w3',
        type: 'recycle_bin',
        x: 100,
        y: 1080,
        width: 48,
        height: 48,
        question: HIDING_QUESTIONS[4],
      },

      // Perimeter Bushes / Yard Foliage
      { id: 'hs_bush_1', type: 'bush', x: 80, y: 480, width: 95, height: 85 },
      { id: 'hs_bush_2', type: 'bush', x: 80, y: 760, width: 110, height: 95 },
      { id: 'hs_bush_3', type: 'bush', x: 1360, y: 160, width: 85, height: 85 },
      { id: 'hs_bush_4', type: 'bush', x: 1340, y: 1280, width: 120, height: 110 },
      { id: 'hs_bush_5', type: 'bush', x: 1780, y: 1320, width: 110, height: 100 },
      { id: 'hs_bush_6', type: 'bush', x: 60, y: 1320, width: 90, height: 90 },
    ],
  },
  {
    id: 'manor',
    name: 'Spooky Manor',
    nameVi: 'Dinh Thự U Ám',
    description: 'An eerie estate with long carpeted galleries, grand dining rooms, secluded wardrobes, and hedge mazes.',
    descriptionVi: 'Khu biệt thự cổ kính với hành lang trải thảm, phòng ăn lớn, tủ áo bí mật và mê cung cây cảnh.',
    width: 2000,
    height: 1500,
    hiderSpawn: { x: 1000, y: 820 },
    seekerSpawn: { x: 1000, y: 180 },
    zones: [
      { name: 'Grand Foyer', nameVi: 'Sảnh Chính Dinh Thự', x: 650, y: 30, width: 700, height: 380 },
      { name: 'Ancient Library', nameVi: 'Thư Viện Cổ Kính', x: 30, y: 380, width: 570, height: 600 },
      { name: 'Grand Dining Hall', nameVi: 'Đại Sảnh Yến Tiệc', x: 680, y: 450, width: 640, height: 460 },
      { name: 'Conservatory Garden', nameVi: 'Nhà Kính Vườn Cây', x: 1400, y: 380, width: 570, height: 600 },
      { name: 'Master Bedrooms', nameVi: 'Phòng Ngủ Gia Chủ', x: 30, y: 1020, width: 640, height: 450 },
      { name: 'Wine Cellar & Crypt', nameVi: 'Hầm Rượu & Mộ Cổ', x: 1330, y: 1020, width: 640, height: 450 },
    ],
    theme: {
      background: '#13111c',
      floorTile: '#1d192c',
      wallColor: '#453556',
      ambientLight: 0.12,
    },
    walls: [
      // Outer
      { id: 'm_top', x: 0, y: 0, width: 2000, height: 30, color: '#31243f' },
      { id: 'm_bottom', x: 0, y: 1470, width: 2000, height: 30, color: '#31243f' },
      { id: 'm_left', x: 0, y: 0, width: 30, height: 1500, color: '#31243f' },
      { id: 'm_right', x: 1970, y: 0, width: 30, height: 1500, color: '#31243f' },

      // Grand Foyer dividers (leaving huge 600px central hallway)
      { id: 'mf_1', x: 680, y: 30, width: 25, height: 320, color: '#56426d' },
      { id: 'mf_2', x: 1295, y: 30, width: 25, height: 320, color: '#56426d' },

      // Library wing (Left) with wide archway opening to Central Hall
      { id: 'lib_w1', x: 30, y: 400, width: 440, height: 25, color: '#56426d' },
      { id: 'lib_w2_top', x: 570, y: 400, width: 25, height: 160, color: '#56426d' },
      // Archway Doorway: y: 560..740 (180px wide entrance)
      { id: 'lib_w2_bot', x: 570, y: 740, width: 25, height: 240, color: '#56426d' },
      // Bookcases placed against left walls
      { id: 'lib_shelf1', x: 90, y: 520, width: 220, height: 35, color: '#4a2b1f' },
      { id: 'lib_shelf2', x: 90, y: 660, width: 220, height: 35, color: '#4a2b1f' },
      { id: 'lib_shelf3', x: 90, y: 800, width: 220, height: 35, color: '#4a2b1f' },

      // Dining Hall (Center) - Dining table placed high so hiderSpawn (y: 820) has 180px clearance!
      { id: 'dine_table', x: 860, y: 550, width: 280, height: 80, color: '#522f1c' },
      { id: 'dine_p1', x: 720, y: 520, width: 35, height: 35, color: '#6d538a' },
      { id: 'dine_p2', x: 1245, y: 520, width: 35, height: 35, color: '#6d538a' },
      { id: 'dine_p3', x: 720, y: 820, width: 35, height: 35, color: '#6d538a' },
      { id: 'dine_p4', x: 1245, y: 820, width: 35, height: 35, color: '#6d538a' },

      // Conservatory Garden (Right) with wide archway opening to Central Hall
      { id: 'cons_w1', x: 1530, y: 400, width: 440, height: 25, color: '#56426d' },
      { id: 'cons_w2_top', x: 1430, y: 400, width: 25, height: 160, color: '#56426d' },
      // Archway Doorway: y: 560..740 (180px wide entrance)
      { id: 'cons_w2_bot', x: 1430, y: 740, width: 25, height: 240, color: '#56426d' },

      // South Bedrooms (Left) with wide corridor entrance
      { id: 'bed_w1', x: 30, y: 1040, width: 420, height: 25, color: '#56426d' },
      // Doorway: x: 450..630 (180px wide opening)
      { id: 'bed_w2', x: 630, y: 1040, width: 25, height: 430, color: '#56426d' },
      { id: 'bed_bed1', x: 80, y: 1220, width: 140, height: 110, color: '#7a2238' },

      // South Cellar & Dungeons (Right) with wide corridor entrance
      { id: 'bed_w3', x: 1370, y: 1040, width: 25, height: 430, color: '#56426d' },
      // Doorway: x: 1395..1575 (180px wide opening)
      { id: 'bed_w4', x: 1575, y: 1040, width: 395, height: 25, color: '#56426d' },
      { id: 'bed_bed2', x: 1780, y: 1220, width: 140, height: 110, color: '#7a2238' },
    ],
    hidingSpots: [
      // Antique Grand Wardrobes
      { id: 'hs_wardrobe_1', type: 'wardrobe', x: 50, y: 920, width: 55, height: 80 },
      { id: 'hs_wardrobe_2', type: 'wardrobe', x: 250, y: 1080, width: 55, height: 80 },
      { id: 'hs_wardrobe_3', type: 'wardrobe', x: 1720, y: 1080, width: 55, height: 80 },
      { id: 'hs_wardrobe_4', type: 'wardrobe', x: 975, y: 60, width: 55, height: 80 },
      { id: 'hs_wardrobe_5', type: 'wardrobe', x: 180, y: 450, width: 55, height: 80 },

      // Crates in Wine Cellar & Corridors
      { id: 'hs_c1', type: 'crate', x: 860, y: 1250, width: 60, height: 60 },
      { id: 'hs_c2', type: 'crate', x: 1080, y: 1250, width: 60, height: 60 },
      { id: 'hs_c3', type: 'crate', x: 420, y: 780, width: 60, height: 60 },

      // Recycle Bins (Estate courtyard & kitchen refuse bins)
      { id: 'hs_recycle_m1', type: 'recycle_bin', x: 620, y: 340, width: 48, height: 48 },
      { id: 'hs_recycle_m2', type: 'recycle_bin', x: 1340, y: 340, width: 48, height: 48 },
      { id: 'hs_recycle_m3', type: 'recycle_bin', x: 1460, y: 1100, width: 48, height: 48 },

      // Secret Question Spots (Solve riddle to enter!)
      {
        id: 'hs_question_m1',
        type: 'question_box',
        x: 480,
        y: 440,
        width: 52,
        height: 52,
        question: HIDING_QUESTIONS[5],
      },
      {
        id: 'hs_question_m2',
        type: 'wardrobe',
        x: 1000,
        y: 920,
        width: 55,
        height: 80,
        question: HIDING_QUESTIONS[7],
      },
      {
        id: 'hs_question_m3',
        type: 'recycle_bin',
        x: 1880,
        y: 900,
        width: 48,
        height: 48,
        question: HIDING_QUESTIONS[8],
      },

      // Hedge Bushes in Conservatory and Courtyards
      { id: 'hs_bush_m1', type: 'bush', x: 1520, y: 520, width: 120, height: 90 },
      { id: 'hs_bush_m2', type: 'bush', x: 1720, y: 520, width: 120, height: 90 },
      { id: 'hs_bush_m3', type: 'bush', x: 1520, y: 740, width: 120, height: 90 },
      { id: 'hs_bush_m4', type: 'bush', x: 1720, y: 740, width: 120, height: 90 },
      { id: 'hs_bush_m5', type: 'bush', x: 950, y: 980, width: 100, height: 90 },
      { id: 'hs_bush_m6', type: 'bush', x: 70, y: 280, width: 110, height: 85 },
      { id: 'hs_bush_m7', type: 'bush', x: 1810, y: 280, width: 110, height: 85 },
    ],
  },
  {
    id: 'cyber_facility',
    name: 'Cyber Core Facility',
    nameVi: 'Tổ Hợp Lõi Công Nghệ',
    description: 'A subterranean scientific laboratory with server banks, bio-domes, maintenance ducts, and blast doors.',
    descriptionVi: 'Phòng thí nghiệm khoa học ngầm với giàn máy chủ, vòm sinh học và cửa chống nổ.',
    width: 2000,
    height: 1500,
    hiderSpawn: { x: 1000, y: 800 },
    seekerSpawn: { x: 1720, y: 1240 },
    zones: [
      { name: 'Server Banks Alpha', nameVi: 'Giàn Máy Chủ Alpha', x: 200, y: 30, width: 600, height: 480 },
      { name: 'Bio-Dome Hydroponics', nameVi: 'Vòm Sinh Học Thủy Canh', x: 1100, y: 30, width: 870, height: 480 },
      { name: 'Quantum Reactor Core', nameVi: 'Lõi Lượng Tử Trung Tâm', x: 720, y: 560, width: 560, height: 480 },
      { name: 'Research Laboratories', nameVi: 'Phòng Nghiên Cứu', x: 30, y: 580, width: 560, height: 890 },
      { name: 'Cryo-Stasis Chamber', nameVi: 'Khoang Đóng Băng Sinh Học', x: 680, y: 1080, width: 640, height: 390 },
      { name: 'High-Sec Airlock', nameVi: 'Cửa Khoang Cách Ly An Ninh', x: 1420, y: 680, width: 550, height: 790 },
    ],
    theme: {
      background: '#0a101d',
      floorTile: '#101a2d',
      wallColor: '#1d3557',
      ambientLight: 0.18,
    },
    walls: [
      // Outer
      { id: 'c_top', x: 0, y: 0, width: 2000, height: 30, color: '#142540' },
      { id: 'c_bottom', x: 0, y: 1470, width: 2000, height: 30, color: '#142540' },
      { id: 'c_left', x: 0, y: 0, width: 30, height: 1500, color: '#142540' },
      { id: 'c_right', x: 1970, y: 0, width: 30, height: 1500, color: '#142540' },

      // Central Reactor Shield - 4 Corner L-Barriers & Center Pillar (OPEN in all 4 directions!)
      // Top-Left Barrier
      { id: 'cr_tl_h', x: 760, y: 620, width: 130, height: 25, color: '#2a5a8c' },
      { id: 'cr_tl_v', x: 760, y: 620, width: 25, height: 110, color: '#2a5a8c' },
      // North Opening: x: 890..1110 (220px wide open entrance)
      // Top-Right Barrier
      { id: 'cr_tr_h', x: 1110, y: 620, width: 130, height: 25, color: '#2a5a8c' },
      { id: 'cr_tr_v', x: 1215, y: 620, width: 25, height: 110, color: '#2a5a8c' },

      // West Opening: y: 730..870 (140px wide open corridor)
      // East Opening: y: 730..870 (140px wide open corridor)

      // Bottom-Left Barrier
      { id: 'cr_bl_v', x: 760, y: 870, width: 25, height: 110, color: '#2a5a8c' },
      { id: 'cr_bl_h', x: 760, y: 980, width: 130, height: 25, color: '#2a5a8c' },
      // South Opening: x: 890..1110 (220px wide open entrance)
      // Bottom-Right Barrier
      { id: 'cr_br_v', x: 1215, y: 870, width: 25, height: 110, color: '#2a5a8c' },
      { id: 'cr_br_h', x: 1110, y: 980, width: 130, height: 25, color: '#2a5a8c' },

      // Center Reactor Console Hub
      { id: 'cr_console', x: 960, y: 680, width: 80, height: 60, color: '#38bdf8' },

      // Server Hall (North) - 3 pairs of server racks with 150px corridors
      { id: 'srv_1', x: 260, y: 130, width: 35, height: 260, color: '#204066' },
      { id: 'srv_2', x: 410, y: 130, width: 35, height: 260, color: '#204066' },
      { id: 'srv_3', x: 560, y: 130, width: 35, height: 260, color: '#204066' },

      { id: 'srv_4', x: 1380, y: 130, width: 35, height: 260, color: '#204066' },
      { id: 'srv_5', x: 1530, y: 130, width: 35, height: 260, color: '#204066' },
      { id: 'srv_6', x: 1680, y: 130, width: 35, height: 260, color: '#204066' },

      // Lab partition walls with clear 180px doorways
      { id: 'lab_w1', x: 30, y: 580, width: 360, height: 25, color: '#1d3557' },
      // Doorway: x: 390..560 (170px wide entrance)
      { id: 'lab_w2', x: 560, y: 580, width: 25, height: 420, color: '#1d3557' },
      { id: 'lab_w3', x: 30, y: 1000, width: 360, height: 25, color: '#1d3557' },

      // South Cryo Room
      { id: 'cryo_w1_l', x: 680, y: 1140, width: 180, height: 25, color: '#1d3557' },
      // Doorway: x: 860..1060 (200px wide cryo entrance)
      { id: 'cryo_w1_r', x: 1060, y: 1140, width: 180, height: 25, color: '#1d3557' },
      { id: 'cryo_pod1', x: 740, y: 1240, width: 70, height: 85, color: '#386fa4' },
      { id: 'cryo_pod2', x: 965, y: 1240, width: 70, height: 85, color: '#386fa4' },
      { id: 'cryo_pod3', x: 1190, y: 1240, width: 70, height: 85, color: '#386fa4' },

      // East Airlock & Generator with 2 wide exits
      { id: 'air_w1', x: 1420, y: 660, width: 25, height: 400, color: '#1d3557' },
      // Main Blast Gate: y: 1060..1240 (180px wide exit)
      { id: 'air_w2', x: 1420, y: 1240, width: 25, height: 230, color: '#1d3557' },
      { id: 'air_w3', x: 1420, y: 660, width: 350, height: 25, color: '#1d3557' },
      // North Bio-Exit: x: 1770..1970 (200px wide passage)
    ],
    hidingSpots: [
      // Cryo-lockers
      { id: 'hs_cryo_1', type: 'locker', x: 80, y: 120, width: 45, height: 75 },
      { id: 'hs_cryo_2', type: 'locker', x: 160, y: 120, width: 45, height: 75 },
      { id: 'hs_cryo_3', type: 'locker', x: 80, y: 680, width: 45, height: 75 },
      { id: 'hs_cryo_4', type: 'locker', x: 1540, y: 1220, width: 45, height: 75 },

      // High-Tech Wardrobes (Hazmat & EVA suits)
      { id: 'hs_wardrobe_c1', type: 'wardrobe', x: 480, y: 620, width: 55, height: 80 },
      { id: 'hs_wardrobe_c2', type: 'wardrobe', x: 80, y: 1100, width: 55, height: 80 },
      { id: 'hs_wardrobe_c3', type: 'wardrobe', x: 1480, y: 720, width: 55, height: 80 },

      // Cyber Recycle Bins (Electronic & Bio recycling pods)
      { id: 'hs_recycle_c1', type: 'recycle_bin', x: 640, y: 220, width: 48, height: 48 },
      { id: 'hs_recycle_c2', type: 'recycle_bin', x: 1260, y: 220, width: 48, height: 48 },
      { id: 'hs_recycle_c3', type: 'recycle_bin', x: 450, y: 1280, width: 48, height: 48 },
      { id: 'hs_recycle_c4', type: 'recycle_bin', x: 1780, y: 740, width: 48, height: 48 },

      // Quantum Question Spot (Solve question to hide inside!)
      {
        id: 'hs_question_c1',
        type: 'question_box',
        x: 640,
        y: 920,
        width: 52,
        height: 52,
        question: HIDING_QUESTIONS[2],
      },
      {
        id: 'hs_question_c2',
        type: 'recycle_bin',
        x: 1820,
        y: 1100,
        width: 48,
        height: 48,
        question: HIDING_QUESTIONS[3],
      },
      {
        id: 'hs_question_c3',
        type: 'wardrobe',
        x: 880,
        y: 100,
        width: 55,
        height: 80,
        question: HIDING_QUESTIONS[9],
      },

      // Storage Tech Crates
      { id: 'hs_tc_1', type: 'crate', x: 640, y: 780, width: 65, height: 65 },
      { id: 'hs_tc_2', type: 'crate', x: 1300, y: 780, width: 65, height: 65 },
      { id: 'hs_tc_3', type: 'crate', x: 380, y: 1200, width: 65, height: 65 },
      { id: 'hs_tc_4', type: 'crate', x: 1640, y: 880, width: 65, height: 65 },

      // Bio-dome hydroponic foliage (bushes)
      { id: 'hs_bio_1', type: 'bush', x: 860, y: 160, width: 110, height: 100 },
      { id: 'hs_bio_2', type: 'bush', x: 1040, y: 160, width: 110, height: 100 },
      { id: 'hs_bio_3', type: 'bush', x: 140, y: 780, width: 120, height: 90 },
      { id: 'hs_bio_4', type: 'bush', x: 1640, y: 460, width: 130, height: 95 },
      { id: 'hs_bio_5', type: 'bush', x: 1280, y: 1320, width: 110, height: 85 },
    ],
  },
];

// Ensure 100% of all hiding spots across all maps have questions attached
MAPS.forEach(ensureMapQuestions);

