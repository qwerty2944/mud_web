// Types
export type {
  InjuryType,
  CharacterInjury,
  InjuryConfig,
  InjuryOccurrenceConfig,
  HealInjuryResult,
} from "./types";

// Constants
export {
  INJURY_CONFIG,
  INJURY_OCCURRENCE_CONFIG,
  INJURY_TYPES,
  getInjuryLevelMultiplier,
  getInjuryConfig,
  calculateTotalRecoveryReduction,
  calculateTotalHpReduction, // alias for backwards compatibility
  calculateNaturalHealTime,
} from "./types/constants";

// Lib (Utilities)
export {
  checkInjuryOccurrence,
  attemptHealInjury,
  filterNaturallyHealedInjuries,
  getInjuryOccurredMessage,
  getInjurySummaryMessage,
} from "./lib";

// UI Components
export { InjuryDisplay } from "./ui";
