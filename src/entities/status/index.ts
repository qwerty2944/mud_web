// Types
export type {
  StatusCategory,
  BuffType,
  DebuffType,
  StatusType,
  StatusEffect,
  StatusDefinition,
} from "./types";

export { STATUS_DEFINITIONS } from "./types";

// Utilities
export {
  createStatusEffect,
  addStatusEffect,
  removeStatusEffect,
  removeStatusByType,
  tickStatusEffects,
  calculateDotDamage,
  calculateRegenHeal,
  calculateStatModifier,
  hasStatus,
  isIncapacitated,
  isSilenced,
  getBuffs,
  getDebuffs,
  getShieldAmount,
  applyDamageToShield,
} from "./lib";
