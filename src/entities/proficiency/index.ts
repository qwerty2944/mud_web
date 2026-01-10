/**
 * Proficiency stub module
 * NOTE: Proficiency system is deprecated and will be replaced by passive skills.
 * This file provides stub types and functions for backward compatibility.
 */

// Types
export type WeaponType =
  | "light_sword"
  | "medium_sword"
  | "great_sword"
  | "axe"
  | "mace"
  | "dagger"
  | "spear"
  | "bow"
  | "crossbow"
  | "staff"
  | "fist"
  | "shield";

export type MagicElement = "fire" | "ice" | "lightning" | "earth" | "holy" | "dark" | "poison";

export type MedicalType = "first_aid" | "herbalism" | "surgery";

export type KnowledgeType = "anatomy" | "metallurgy" | "botany" | "gemology";

export type CraftingType = "blacksmithing" | "tailoring" | "cooking" | "alchemy" | "jewelcrafting";

export type LifeSkillType = MedicalType | KnowledgeType | CraftingType;

export type AttackType = "slash" | "pierce" | "blunt" | "crush";

export type CombatProficiencyType = WeaponType | MagicElement;

export type ProficiencyType = CombatProficiencyType | MedicalType | KnowledgeType;

export interface ProficiencyInfo {
  id: string;
  nameKo: string;
  nameEn: string;
  icon: string;
  category: "weapon" | "magic" | "medical" | "knowledge";
}

export interface Proficiencies {
  light_sword: number;
  medium_sword: number;
  great_sword: number;
  axe: number;
  mace: number;
  dagger: number;
  spear: number;
  bow: number;
  crossbow: number;
  staff: number;
  fist: number;
  shield: number;
  fire: number;
  ice: number;
  lightning: number;
  earth: number;
  holy: number;
  dark: number;
  poison: number;
}

export type WeaponBlockEffectType = "counter" | "riposte" | "disarm" | "stun" | "deflect" | "none";

// WeaponBlockSpecial is now just an alias for the effect type string
export type WeaponBlockSpecial = WeaponBlockEffectType;

export interface WeaponBlockConfig {
  blockChance: number;
  damageReduction: number;
  specialEffect?: WeaponBlockEffectType;
  specialChance?: number;
}

// WeaponBlockInfo is now an alias for WeaponBlockConfig for backward compatibility
export type WeaponBlockInfo = WeaponBlockConfig;

// Constants
export const WEAPON_PROFICIENCIES: ProficiencyInfo[] = [
  { id: "light_sword", nameKo: "세검", nameEn: "Light Sword", icon: "🗡️", category: "weapon" },
  { id: "medium_sword", nameKo: "중검", nameEn: "Medium Sword", icon: "⚔️", category: "weapon" },
  { id: "great_sword", nameKo: "대검", nameEn: "Great Sword", icon: "🗡️", category: "weapon" },
  { id: "axe", nameKo: "도끼", nameEn: "Axe", icon: "🪓", category: "weapon" },
  { id: "mace", nameKo: "둔기", nameEn: "Mace", icon: "🔨", category: "weapon" },
  { id: "dagger", nameKo: "단검", nameEn: "Dagger", icon: "🔪", category: "weapon" },
  { id: "spear", nameKo: "창", nameEn: "Spear", icon: "🔱", category: "weapon" },
  { id: "bow", nameKo: "활", nameEn: "Bow", icon: "🏹", category: "weapon" },
  { id: "crossbow", nameKo: "석궁", nameEn: "Crossbow", icon: "🎯", category: "weapon" },
  { id: "staff", nameKo: "지팡이", nameEn: "Staff", icon: "🪄", category: "weapon" },
  { id: "fist", nameKo: "맨손", nameEn: "Fist", icon: "👊", category: "weapon" },
  { id: "shield", nameKo: "방패", nameEn: "Shield", icon: "🛡️", category: "weapon" },
];

export const MAGIC_PROFICIENCIES: ProficiencyInfo[] = [
  { id: "fire", nameKo: "화염", nameEn: "Fire", icon: "🔥", category: "magic" },
  { id: "ice", nameKo: "냉기", nameEn: "Ice", icon: "❄️", category: "magic" },
  { id: "lightning", nameKo: "번개", nameEn: "Lightning", icon: "⚡", category: "magic" },
  { id: "earth", nameKo: "대지", nameEn: "Earth", icon: "🪨", category: "magic" },
  { id: "holy", nameKo: "신성", nameEn: "Holy", icon: "✨", category: "magic" },
  { id: "dark", nameKo: "암흑", nameEn: "Dark", icon: "🌑", category: "magic" },
  { id: "poison", nameKo: "독", nameEn: "Poison", icon: "☠️", category: "magic" },
];

// Crafting proficiencies (deprecated - stub only)
export const CRAFTING_PROFICIENCIES: ProficiencyInfo[] = [];

// Medical proficiencies (deprecated - stub only)
export const MEDICAL_PROFICIENCIES: ProficiencyInfo[] = [];

// Knowledge proficiencies (deprecated - stub only)
export const KNOWLEDGE_PROFICIENCIES: ProficiencyInfo[] = [];

export const ALL_PROFICIENCIES = [...WEAPON_PROFICIENCIES, ...MAGIC_PROFICIENCIES];

export const DEFAULT_PROFICIENCIES: Proficiencies = {
  light_sword: 0,
  medium_sword: 0,
  great_sword: 0,
  axe: 0,
  mace: 0,
  dagger: 0,
  spear: 0,
  bow: 0,
  crossbow: 0,
  staff: 0,
  fist: 0,
  shield: 0,
  fire: 0,
  ice: 0,
  lightning: 0,
  earth: 0,
  holy: 0,
  dark: 0,
  poison: 0,
};

export const WEAPON_ATTACK_TYPE: Record<WeaponType, AttackType> = {
  light_sword: "pierce",
  medium_sword: "slash",
  great_sword: "slash",
  axe: "slash",
  mace: "blunt",
  dagger: "pierce",
  spear: "pierce",
  bow: "pierce",
  crossbow: "pierce",
  staff: "blunt",
  fist: "blunt",
  shield: "blunt",
};

// Stub functions
export function useProficiencies(_userId: string | undefined) {
  return {
    data: DEFAULT_PROFICIENCIES,
    isLoading: false,
    error: null,
  };
}

export function getProficiencyValue(
  _proficiencies: Proficiencies | null | undefined,
  _type: ProficiencyType
): number {
  return 0;
}

export function getProficiencyInfo(type: ProficiencyType): ProficiencyInfo | undefined {
  return ALL_PROFICIENCIES.find((p) => p.id === type);
}

export function getRankInfo(_level: number) {
  return {
    id: "novice",
    nameKo: "초보",
    nameEn: "Novice",
    minLevel: 0,
    damageBonus: 0,
    speedBonus: 0,
  };
}

export function getDamageBonus(_level: number): number {
  return 0;
}

export function isWeaponProficiency(type: ProficiencyType): type is WeaponType {
  return WEAPON_PROFICIENCIES.some((p) => p.id === type);
}

export function isMagicProficiency(type: ProficiencyType): type is MagicElement {
  return MAGIC_PROFICIENCIES.some((p) => p.id === type);
}

export function getMagicEffectiveness(
  _attackElement: MagicElement,
  _targetElement: MagicElement | undefined
): number {
  return 1.0;
}

export function calculateProficiencyGain(_params: {
  proficiencyType: ProficiencyType;
  currentProficiency: number;
  playerLevel: number;
  monsterLevel: number;
  attackSuccess: boolean;
}) {
  return { gained: false, amount: 0, levelDiff: 0, reason: "disabled" };
}

export function canGainProficiency(
  _currentProficiency: number,
  _playerLevel: number,
  _monsterLevel: number
): boolean {
  return false;
}

// Additional stub constants and functions
export const WEAPON_BLOCK_CONFIG: Record<WeaponType, WeaponBlockConfig> = {
  light_sword: { blockChance: 0, damageReduction: 0, specialEffect: "riposte", specialChance: 0 },
  medium_sword: { blockChance: 0, damageReduction: 0, specialEffect: "counter", specialChance: 0 },
  great_sword: { blockChance: 0, damageReduction: 0, specialEffect: "stun", specialChance: 0 },
  axe: { blockChance: 0, damageReduction: 0, specialEffect: "disarm", specialChance: 0 },
  mace: { blockChance: 0, damageReduction: 0, specialEffect: "stun", specialChance: 0 },
  dagger: { blockChance: 0, damageReduction: 0, specialEffect: "riposte", specialChance: 0 },
  spear: { blockChance: 0, damageReduction: 0, specialEffect: "counter", specialChance: 0 },
  bow: { blockChance: 0, damageReduction: 0, specialEffect: "none", specialChance: 0 },
  crossbow: { blockChance: 0, damageReduction: 0, specialEffect: "none", specialChance: 0 },
  staff: { blockChance: 0, damageReduction: 0, specialEffect: "counter", specialChance: 0 },
  fist: { blockChance: 0, damageReduction: 0, specialEffect: "counter", specialChance: 0 },
  shield: { blockChance: 0, damageReduction: 0, specialEffect: "stun", specialChance: 0 },
};

export function getDamageMultiplier(_level: number): number {
  return 1.0;
}

export function getDayBoostMultiplier(_element: MagicElement): number {
  return 1.0;
}

// Knowledge system stubs
export interface KnowledgeBonus {
  damageBonus: number;
  critBonus: number;
  slashBonus: number;
  pierceBonus: number;
  crushBonus: number;
  magicBonus: number;
  poisonBonus: number;
  healingBonus: number;
  defenseBonus: number;
}

export const ATTACK_TYPE_TO_KNOWLEDGE: Record<AttackType, KnowledgeType> = {
  slash: "anatomy",
  pierce: "anatomy",
  blunt: "metallurgy",
  crush: "metallurgy",
};

export function calculateKnowledgeBonus(
  _knowledgeProficiencies: Partial<Record<KnowledgeType, number>>
): KnowledgeBonus {
  return {
    damageBonus: 0,
    critBonus: 0,
    slashBonus: 0,
    pierceBonus: 0,
    crushBonus: 0,
    magicBonus: 0,
    poisonBonus: 0,
    healingBonus: 0,
    defenseBonus: 0,
  };
}
