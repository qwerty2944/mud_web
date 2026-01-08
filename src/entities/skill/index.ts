// ============ Public API ============

// Types
export type {
  SkillType,
  SkillCategory,
  SkillTarget,
  SkillStatRequirements,
  SkillRequirements,
  PassiveTrigger,
  PassiveEffectType,
  PassiveEffect,
  BonusVsType,
  Skill,
  LifeSkillType,
  LifeSkill,
  SkillUITab,
  SkillUITabInfo,
  SkillsData,
} from "./types";

export {
  SKILL_UI_TABS,
  WEAPON_CATEGORIES,
  MARTIAL_CATEGORIES,
  getSkillUITab,
  isAttackSkill,
  isDefensiveSkill,
  checkSkillRequirements,
} from "./types";

// Queries
export {
  skillKeys,
  useSkills,
  useSkillsData,
  useSkillsByCategory,
  useSkillsByUITab,
  useSkill,
  useWeaponSkills,
  useMartialSkills,
  useDefensiveSkills,
  useBuffSkills,
  useDebuffSkills,
  useAttackSkills,
  useWeaponCategorySkills,
  useDefenseBonusSkills,
} from "./queries";

// Passive Skills
export type { PassiveSkillResult } from "./lib/passive";
export {
  checkPassiveSkill,
  filterPassiveSkills,
  processOnHitPassives,
  processLowHpPassives,
  DEFAULT_PASSIVE_SKILLS,
} from "./lib/passive";
