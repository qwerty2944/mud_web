/**
 * Ability API - 스펠과 스킬 데이터를 통합하여 Ability로 변환
 */

import type { Ability, AbilityLevelEffects } from "../types";

// 몬스터 어빌리티 원본 타입
interface RawMonsterAbility {
  id: string;
  nameKo: string;
  nameEn: string;
  type: string;
  attackType?: string;
  icon: string;
  description: { ko: string; en: string };
  baseDamage?: number;
  apCost: number;
  damagePerLevel?: number;
  statusEffect?: string;
  statusValue?: number;
  statusDuration?: number;
  statusChance?: number;
  selfBuff?: string;
  buffValue?: number;
  buffDuration?: number;
  critBonus?: number;
}

// 몬스터 어빌리티 캐시
let cachedMonsterAbilities: Map<string, RawMonsterAbility> | null = null;

// 스펠 원본 타입
interface RawSpell {
  id: string;
  nameKo: string;
  nameEn: string;
  type: string;
  usageContext: string;
  icon: string;
  description: { ko: string; en: string };
  maxLevel: number;
  expPerLevel: number;
  levelBonuses: Array<{ level: number; effects: Record<string, unknown> }>;
  requirements: Record<string, unknown>;
  grantsExpTo?: string[];
  cooldown?: number;
  element: string;
}

// 스킬 원본 타입
interface RawSkill {
  id: string;
  nameKo: string;
  nameEn: string;
  type: string;
  attackType?: string;
  usageContext: string;
  icon: string;
  description: { ko: string; en: string };
  maxLevel: number;
  expPerLevel: number;
  levelBonuses: Array<{ level: number; effects: Record<string, unknown> }>;
  requirements: Record<string, unknown>;
  grantsExpTo?: string[];
  cooldown?: number;
  category?: string;
  skillGroup?: string;
}

let cachedAbilities: Ability[] | null = null;

/**
 * 스펠을 Ability로 변환
 */
function convertSpellToAbility(spell: RawSpell): Ability {
  const firstBonus = spell.levelBonuses[0]?.effects || {};

  return {
    id: spell.id,
    nameKo: spell.nameKo,
    nameEn: spell.nameEn,
    description: spell.description,
    icon: spell.icon,
    source: "spell",
    type: spell.type as Ability["type"],
    attackType: spell.type === "attack" ? "magic" : undefined,
    element: spell.element as Ability["element"],
    usageContext: spell.usageContext as Ability["usageContext"],
    maxLevel: spell.maxLevel,
    expPerLevel: spell.expPerLevel,
    levelBonuses: spell.levelBonuses.map((b) => ({
      level: b.level,
      effects: b.effects as AbilityLevelEffects,
    })),
    baseCost: {
      mp: (firstBonus.mpCost as number) || 10,
    },
    cooldown: spell.cooldown,
    requirements: spell.requirements as Ability["requirements"],
    grantsExpTo: spell.grantsExpTo,
    target: spell.type === "heal" || spell.type === "buff" ? "self" : "enemy",
  };
}

/**
 * 스킬을 Ability로 변환
 */
function convertSkillToAbility(skill: RawSkill): Ability {
  const firstBonus = skill.levelBonuses[0]?.effects || {};

  return {
    id: skill.id,
    nameKo: skill.nameKo,
    nameEn: skill.nameEn,
    description: skill.description,
    icon: skill.icon,
    source: "combatskill",
    type: skill.type as Ability["type"],
    attackType: skill.attackType as Ability["attackType"],
    category: skill.category,
    skillGroup: skill.skillGroup,
    usageContext: skill.usageContext as Ability["usageContext"],
    maxLevel: skill.maxLevel,
    expPerLevel: skill.expPerLevel,
    levelBonuses: skill.levelBonuses.map((b) => ({
      level: b.level,
      effects: b.effects as AbilityLevelEffects,
    })),
    baseCost: {
      ap: (firstBonus.apCost as number) || 5,
      mp: (firstBonus.mpCost as number) || undefined,
    },
    cooldown: skill.cooldown,
    requirements: skill.requirements as Ability["requirements"],
    grantsExpTo: skill.grantsExpTo,
    target:
      skill.type === "buff" || skill.type === "defense"
        ? "self"
        : skill.type === "debuff" || skill.type === "attack"
        ? "enemy"
        : "self",
  };
}

/**
 * 모든 어빌리티 로드 (스펠 + 스킬 통합)
 */
export async function fetchAbilities(): Promise<Ability[]> {
  if (cachedAbilities) return cachedAbilities;

  const [spellsRes, skillsRes] = await Promise.all([
    fetch("/data/abilities/spells.json"),
    fetch("/data/abilities/combatskills.json"),
  ]);

  const spellsData = await spellsRes.json();
  const skillsData = await skillsRes.json();

  const spellAbilities = (spellsData.spells as RawSpell[])
    .filter((s) => s.type !== "passive") // 패시브 제외 (전투용 아님)
    .map(convertSpellToAbility);

  const skillAbilities = (skillsData.skills as RawSkill[])
    .filter((s) => s.type !== "passive" && s.usageContext === "combat_only")
    .map(convertSkillToAbility);

  cachedAbilities = [...spellAbilities, ...skillAbilities];
  return cachedAbilities;
}

/**
 * ID로 어빌리티 조회
 */
export async function fetchAbilityById(id: string): Promise<Ability | null> {
  const abilities = await fetchAbilities();
  return abilities.find((a) => a.id === id) || null;
}

/**
 * 소스별 어빌리티 조회
 */
export async function fetchAbilitiesBySource(
  source: "spell" | "combatskill"
): Promise<Ability[]> {
  const abilities = await fetchAbilities();
  return abilities.filter((a) => a.source === source);
}

/**
 * 타입별 어빌리티 조회
 */
export async function fetchAbilitiesByType(
  type: Ability["type"]
): Promise<Ability[]> {
  const abilities = await fetchAbilities();
  return abilities.filter((a) => a.type === type);
}

/**
 * 레벨에 해당하는 효과 가져오기
 */
export function getEffectsAtLevel(
  ability: Ability,
  level: number
): AbilityLevelEffects {
  // 해당 레벨 이하의 가장 높은 레벨 보너스 찾기
  const applicableBonuses = ability.levelBonuses.filter(
    (b) => b.level <= level
  );
  if (applicableBonuses.length === 0) {
    return ability.levelBonuses[0]?.effects || {};
  }
  return applicableBonuses[applicableBonuses.length - 1].effects;
}

/**
 * AP 비용 계산 (레벨 보너스 적용)
 */
export function getApCost(ability: Ability, level: number): number {
  const effects = getEffectsAtLevel(ability, level);
  return effects.apCost ?? ability.baseCost.ap ?? 5;
}

/**
 * MP 비용 계산 (레벨 보너스 적용)
 */
export function getMpCost(ability: Ability, level: number): number {
  const effects = getEffectsAtLevel(ability, level);
  return effects.mpCost ?? ability.baseCost.mp ?? 0;
}

/**
 * 캐시 클리어 (테스트용)
 */
export function clearAbilityCache(): void {
  cachedAbilities = null;
  cachedMonsterAbilities = null;
}

/**
 * 몬스터 어빌리티 로드
 */
export async function fetchMonsterAbilities(): Promise<
  Map<string, RawMonsterAbility>
> {
  if (cachedMonsterAbilities) return cachedMonsterAbilities;

  const res = await fetch("/data/abilities/monster-abilities.json");
  const data = await res.json();

  cachedMonsterAbilities = new Map();
  for (const ability of data.abilities as RawMonsterAbility[]) {
    cachedMonsterAbilities.set(ability.id, ability);
  }

  return cachedMonsterAbilities;
}

/**
 * 몬스터 어빌리티 ID로 조회
 */
export async function fetchMonsterAbilityById(
  id: string
): Promise<RawMonsterAbility | null> {
  const abilities = await fetchMonsterAbilities();
  return abilities.get(id) || null;
}

/**
 * 몬스터 어빌리티의 레벨별 데미지 계산
 */
export function calculateMonsterAbilityDamage(
  ability: RawMonsterAbility,
  level: number,
  monsterAttack: number
): number {
  const baseDamage = ability.baseDamage || 0;
  const perLevel = ability.damagePerLevel || 0;
  // 기본 데미지 + (레벨 × 레벨당 증가) + 몬스터 공격력 보정
  return Math.floor(baseDamage + perLevel * level + monsterAttack * 0.5);
}

// RawMonsterAbility를 export해서 다른 곳에서도 사용 가능하게
export type { RawMonsterAbility };

// User Abilities API (DB 연동)
export {
  fetchUserAbilities,
  increaseAbilityExp,
  updateAbilitiesProgress,
  getAbilityLevel,
  checkAbilityRequirement,
  getLearnedAbilities,
} from "./userAbilities";
export type {
  AbilityProgress,
  UserAbilities,
  AbilityCategory,
} from "./userAbilities";
