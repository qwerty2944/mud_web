/**
 * Spell stub module
 * NOTE: Spell proficiency system is deprecated and will be replaced by passive skills.
 * This file provides stub types and functions for backward compatibility.
 */

import type { MagicElement } from "@/entities/proficiency";

export type SpellType = "attack" | "heal" | "buff" | "debuff" | "dot" | "special";

export interface Spell {
  id: string;
  nameKo: string;
  nameEn: string;
  element: MagicElement;
  type: SpellType;
  baseDamage?: number;
  baseHeal?: number;
  mpCost: number;
  cooldown?: number;
  description: string;
  requirements?: {
    proficiency?: number;
    karma?: number;
    piety?: number;
    religion?: string;
  };
}

export interface SpellProficiency {
  spellId: string;
  experience: number;
  castCount: number;
}

// Stub functions
export function useSpells() {
  return {
    data: [] as Spell[],
    isLoading: false,
    error: null,
  };
}

export function useSpellsByElement(_element: MagicElement) {
  return {
    data: [] as Spell[],
    isLoading: false,
    error: null,
  };
}

export function useSpellProficiency(_userId: string | undefined, _spellId: string) {
  return {
    data: null as SpellProficiency | null,
    isLoading: false,
    error: null,
  };
}

export function checkSpellRequirements(
  _spell: Spell,
  _params: {
    karma?: number;
    piety?: number;
    religion?: string;
    proficiencies?: Record<string, number>;
  }
) {
  return { canUse: true, reasons: [] as string[] };
}

export function checkHealingRestriction(_params: {
  religion?: string;
  piety?: number;
}): { allowed: boolean; reason?: string } {
  return { allowed: true };
}

export function calculateFinalMpCost(_spell: Spell, _experience: number): number {
  return 0;
}

export function calculateBoostedBaseDamage(
  _baseDamage: number,
  _experience: number
): number {
  return _baseDamage;
}

export function getSpellProficiencyRank(_experience: number) {
  return {
    id: "novice",
    nameKo: "미숙",
    damageBonus: 0,
    mpReduction: 0,
    cooldownReduction: 0,
  };
}

export function isAttackSpell(spell: Spell): boolean {
  return spell.type === "attack" || spell.type === "dot";
}

export function isHealingSpell(spell: Spell): boolean {
  return spell.type === "heal";
}

export function calculateHealAmount(_params: {
  baseHeal: number;
  casterWis: number;
  spellExperience: number;
  religion?: string;
  piety?: number;
}): number {
  return _params.baseHeal;
}

export function getNethrosHealPenalty(_piety: number): number {
  return 0;
}

export async function increaseSpellProficiency(
  _userId: string,
  _spellId: string,
  _amount: number
): Promise<void> {
  // Stub - no operation
}
