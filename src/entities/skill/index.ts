// Types
export type {
  SkillType,
  SkillTarget,
  Skill,
  SkillCategory,
} from "./types";

export { SKILL_CATEGORIES, getSkillCategory } from "./types";

// Queries
export {
  skillKeys,
  useSkills,
  useSkillsByCategory,
  useSkill,
  useMagicAttackSkills,
  useBuffSkills,
  useDebuffSkills,
} from "./queries";
