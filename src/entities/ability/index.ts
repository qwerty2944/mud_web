/**
 * Ability Entity - Public API
 * 스펠과 스킬을 통합한 어빌리티 시스템
 */

// Types
export type {
  Ability,
  AbilitySource,
  AbilityType,
  AttackType,
  TargetType,
  AbilityLevelEffects,
  AbilityLevelBonus,
  AbilityRequirements,
  QueuedAbility,
  ActionQueue,
  MonsterAbility,
} from "./types";

// API
export {
  fetchAbilities,
  fetchAbilityById,
  fetchAbilitiesBySource,
  fetchAbilitiesByType,
  getEffectsAtLevel,
  getApCost,
  getMpCost,
  clearAbilityCache,
  // 몬스터 어빌리티
  fetchMonsterAbilities,
  fetchMonsterAbilityById,
  calculateMonsterAbilityDamage,
  // User Abilities (DB 연동)
  fetchUserAbilities,
  increaseAbilityExp,
  updateAbilitiesProgress,
  getAbilityLevel,
  checkAbilityRequirement,
  getLearnedAbilities,
} from "./api";
export type {
  RawMonsterAbility,
  AbilityProgress,
  UserAbilities,
  AbilityCategory,
} from "./api";

// Queries
export {
  abilityKeys,
  useAbilities,
  useAbility,
  useAbilitiesBySource,
  useAbilitiesByType,
  useAttackAbilities,
  useSpellAbilities,
  useCombatSkillAbilities,
  // User Abilities (DB)
  useUserAbilities,
  useIncreaseAbilityExp,
  useUpdateAbilitiesProgress,
} from "./queries";
