// Actions
export { useStartBattle } from "./start-battle";
export { useEndBattle } from "./end-battle";

// 통합 어빌리티 시스템 (기존 attack, cast-spell, spell-cast 대체)
export { useAbility } from "./use-ability";
export { useExecuteQueue } from "./execute-queue";

// Passive Skills
export { usePassiveSkills } from "./lib/usePassiveSkills";

// Monster AI
export {
  getAvailableAbilities,
  selectAbilityByWeight,
  buildMonsterQueue,
  calculateMonsterAbilityDamage,
  checkMonsterStatusEffect,
  getMonsterBuffEffect,
} from "./lib/monsterAi";

// Lib (Damage Calculation)
export {
  calculatePhysicalDamage,
  calculateMagicDamage,
  calculateDamage,
  calculateMonsterDamage,
  getCriticalChance,
  getCriticalMultiplier,
  applyCritical,
  getAttackTypeFromWeapon,
  // 공격 판정
  determineHitResult,
  getDodgeChance,
  getBlockChance,
  getMissChance,
  // 암습 시스템
  calculateAmbushDamage,
  getAmbushChance,
  getDaggerAmbushBonus,
  // 패리 시스템
  canParry,
  getParryChance,
  attemptParry,
  PARRY_WEAPONS,
  // Types
  type PhysicalAttackParams,
  type MagicAttackParams,
  type AttackParams,
  type HitResult,
  type AmbushResult,
  type ParryResult,
} from "./lib/damage";
