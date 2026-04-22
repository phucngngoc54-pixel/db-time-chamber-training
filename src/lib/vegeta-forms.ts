// ─────────────────────────────────────────────────────────────
//  VEGETA TRANSFORMATION SYSTEM
//  Each form maps to a currentLevel value in AppContext.
//  Level 0 = Base, Level 1 = SSJ1, Level 2 = SSJ2, ... etc.
//  KI required to advance: 240 * 2^(currentLevel)
//  => Base→SSJ1: 240 min | SSJ1→SSJ2: 480 min | SSJ2→SSJ3: 960 min ...
// ─────────────────────────────────────────────────────────────

export interface VegetaForm {
  level: number;          // currentLevel value this form corresponds to
  name: string;           // Display name
  shortName: string;      // Short label for KI bar
  modelSrc: string;       // Full-body model image path
  avaSrc: string;         // Avatar (small portrait) image path
  kiRequired: number;     // Total cumulative minutes to REACH this form (for display)
  auraColor: string;      // Tailwind gradient class for aura / glow effects
  glowColor: string;      // CSS shadow color for neon glow
}

// Local asset paths (relative to /assets) - served as static by Vite
const BASE_PATH = '/assets/characters/vegeta';

export const VEGETA_FORMS: VegetaForm[] = [
  {
    level: 0,
    name: 'BASE FORM',
    shortName: 'BASE',
    modelSrc: 'https://lh3.googleusercontent.com/u/0/d/1fY2ya3ToVI4DOkp9wsKnfsnW0gYIFGyC',
    avaSrc: 'https://i.postimg.cc/Js6PZX2M/vegeta-jpg.png',
    kiRequired: 0,
    auraColor: 'from-blue-700 to-blue-900',
    glowColor: 'rgba(59, 130, 246, 0.6)',
  },
  {
    level: 1,
    name: 'SUPER SAIYAN',
    shortName: 'SSJ',
    modelSrc: 'https://lh3.googleusercontent.com/u/0/d/1V1dhUbhPJnReLkaMf_Z9qlRmKo19oKBd', // Parsed direct drive link
    avaSrc: 'https://lh3.googleusercontent.com/u/0/d/1wKc_Mp4UVeMbFtvd8p9f8UN-dCTbDh-h',
    kiRequired: 240,       // 240 min = 4h
    auraColor: 'from-yellow-400 to-orange-500',
    glowColor: 'rgba(250, 204, 21, 0.7)',
  },
  {
    level: 2,
    name: 'SUPER SAIYAN 2',
    shortName: 'SSJ2',
    modelSrc: `${BASE_PATH}/model_veg_ssj2.png`,
    avaSrc: `${BASE_PATH}/ava_veg_ssj2.png`,
    kiRequired: 720,       // 240+480 min = 12h cumulative
    auraColor: 'from-yellow-300 to-blue-400',
    glowColor: 'rgba(147, 197, 253, 0.8)',
  },
  {
    level: 3,
    name: 'SUPER SAIYAN 3',
    shortName: 'SSJ3',
    modelSrc: `${BASE_PATH}/model_veg_ssj3.png`,
    avaSrc: `${BASE_PATH}/ava_veg_ssj3.png`,
    kiRequired: 1680,      // +960 = 28h cumulative
    auraColor: 'from-yellow-200 to-yellow-400',
    glowColor: 'rgba(253, 224, 71, 0.9)',
  },
  {
    level: 4,
    name: 'SUPER SAIYAN GOD',
    shortName: 'SSG',
    modelSrc: `${BASE_PATH}/model_veg_god.png`,
    avaSrc: `${BASE_PATH}/ava_veg_god.png`,
    kiRequired: 3600,      // +1920 = 60h cumulative
    auraColor: 'from-red-400 to-rose-600',
    glowColor: 'rgba(248, 113, 113, 0.8)',
  },
  {
    level: 5,
    name: 'SUPER SAIYAN BLUE',
    shortName: 'SSGSS',
    modelSrc: `${BASE_PATH}/model_veg_blue.png`,
    avaSrc: `${BASE_PATH}/ava_veg_blue.png`,
    kiRequired: 7440,      // +3840 = 124h cumulative
    auraColor: 'from-cyan-400 to-blue-600',
    glowColor: 'rgba(34, 211, 238, 0.9)',
  },
  {
    level: 6,
    name: 'SSB EVOLVED',
    shortName: 'SSBE',
    modelSrc: `${BASE_PATH}/model_veg_evo.png`,
    avaSrc: `${BASE_PATH}/ava_veg_evo.png`,
    kiRequired: 15120,     // +7680 = 252h cumulative
    auraColor: 'from-violet-500 to-blue-700',
    glowColor: 'rgba(139, 92, 246, 0.9)',
  },
  {
    level: 7,
    name: 'ULTRA EGO',
    shortName: 'UE',
    modelSrc: `${BASE_PATH}/model_veg_ego.png`,
    avaSrc: `${BASE_PATH}/ava_veg_ego.png`,
    kiRequired: 30480,     // +15360 = 508h cumulative — the pinnacle
    auraColor: 'from-purple-600 to-pink-600',
    glowColor: 'rgba(192, 38, 211, 1)',
  },
];

/** Returns the form data for the given currentLevel (clamps to last form). */
export function getVegetaForm(level: number): VegetaForm {
  const clamped = Math.min(level, VEGETA_FORMS.length - 1);
  return VEGETA_FORMS[clamped];
}

/** Returns the NEXT form data (undefined if already at max). */
export function getNextVegetaForm(level: number): VegetaForm | undefined {
  const next = level + 1;
  return VEGETA_FORMS[next];
}

/** Total number of defined forms. */
export const MAX_VEGETA_LEVEL = VEGETA_FORMS.length - 1;
