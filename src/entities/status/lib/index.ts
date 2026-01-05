import type { StatusEffect, StatusType, StatusCategory } from "../types";
import { STATUS_DEFINITIONS } from "../types";

/**
 * 새 상태이상 효과 생성
 */
export function createStatusEffect(
  type: StatusType,
  value: number,
  duration?: number,
  source?: string
): StatusEffect {
  const def = STATUS_DEFINITIONS[type];
  return {
    id: `${type}_${Date.now()}`,
    type,
    category: def.category,
    nameKo: def.nameKo,
    nameEn: def.nameEn,
    icon: def.icon,
    duration: duration ?? def.defaultDuration,
    value,
    stackable: def.stackable,
    currentStacks: 1,
    maxStacks: def.maxStacks,
    source,
  };
}

/**
 * 상태이상 배열에 새 효과 추가 (중첩 처리 포함)
 */
export function addStatusEffect(
  effects: StatusEffect[],
  newEffect: StatusEffect
): StatusEffect[] {
  const existing = effects.find((e) => e.type === newEffect.type);

  if (existing) {
    if (existing.stackable && existing.currentStacks < existing.maxStacks) {
      // 중첩 가능하면 스택 증가
      return effects.map((e) =>
        e.type === newEffect.type
          ? {
              ...e,
              currentStacks: e.currentStacks + 1,
              duration: Math.max(e.duration, newEffect.duration),
            }
          : e
      );
    } else {
      // 중첩 불가면 지속시간만 갱신
      return effects.map((e) =>
        e.type === newEffect.type
          ? { ...e, duration: Math.max(e.duration, newEffect.duration) }
          : e
      );
    }
  }

  // 새 효과 추가
  return [...effects, newEffect];
}

/**
 * 상태이상 제거
 */
export function removeStatusEffect(
  effects: StatusEffect[],
  effectId: string
): StatusEffect[] {
  return effects.filter((e) => e.id !== effectId);
}

/**
 * 특정 타입의 상태이상 제거
 */
export function removeStatusByType(
  effects: StatusEffect[],
  type: StatusType
): StatusEffect[] {
  return effects.filter((e) => e.type !== type);
}

/**
 * 지속시간 감소 (턴 종료 시)
 */
export function tickStatusEffects(effects: StatusEffect[]): StatusEffect[] {
  return effects
    .map((e) => ({ ...e, duration: e.duration - 1 }))
    .filter((e) => e.duration > 0);
}

/**
 * DoT(Damage over Time) 피해 계산
 */
export function calculateDotDamage(effects: StatusEffect[]): number {
  let damage = 0;
  for (const effect of effects) {
    if (effect.type === "poison" || effect.type === "burn") {
      damage += effect.value * effect.currentStacks;
    }
  }
  return damage;
}

/**
 * 리젠(HoT) 회복량 계산
 */
export function calculateRegenHeal(effects: StatusEffect[]): number {
  let heal = 0;
  for (const effect of effects) {
    if (effect.type === "regen") {
      heal += effect.value * effect.currentStacks;
    }
  }
  return heal;
}

/**
 * 스탯 수정치 계산
 */
export function calculateStatModifier(
  effects: StatusEffect[],
  statType: "atk" | "def" | "spd" | "magic"
): number {
  let modifier = 0;

  for (const effect of effects) {
    switch (effect.type) {
      case "atk_up":
        if (statType === "atk") modifier += effect.value;
        break;
      case "def_up":
        if (statType === "def") modifier += effect.value;
        break;
      case "spd_up":
        if (statType === "spd") modifier += effect.value;
        break;
      case "magic_boost":
        if (statType === "magic") modifier += effect.value;
        break;
      case "weaken":
        if (statType === "atk") modifier -= effect.value;
        break;
      case "slow":
        if (statType === "spd") modifier -= effect.value;
        break;
    }
  }

  return modifier;
}

/**
 * 특정 상태이상 보유 여부 확인
 */
export function hasStatus(effects: StatusEffect[], type: StatusType): boolean {
  return effects.some((e) => e.type === type);
}

/**
 * 행동 불가 상태 확인 (빙결 등)
 */
export function isIncapacitated(effects: StatusEffect[]): boolean {
  return hasStatus(effects, "freeze");
}

/**
 * 마법 사용 불가 상태 확인 (침묵)
 */
export function isSilenced(effects: StatusEffect[]): boolean {
  return hasStatus(effects, "silence");
}

/**
 * 버프만 필터
 */
export function getBuffs(effects: StatusEffect[]): StatusEffect[] {
  return effects.filter((e) => e.category === "buff");
}

/**
 * 디버프만 필터
 */
export function getDebuffs(effects: StatusEffect[]): StatusEffect[] {
  return effects.filter((e) => e.category === "debuff");
}

/**
 * 보호막 남은 양 반환
 */
export function getShieldAmount(effects: StatusEffect[]): number {
  const shield = effects.find((e) => e.type === "shield");
  return shield?.value ?? 0;
}

/**
 * 보호막 피해 적용
 */
export function applyDamageToShield(
  effects: StatusEffect[],
  damage: number
): { effects: StatusEffect[]; remainingDamage: number } {
  const shieldIdx = effects.findIndex((e) => e.type === "shield");

  if (shieldIdx === -1) {
    return { effects, remainingDamage: damage };
  }

  const shield = effects[shieldIdx];
  const newShieldValue = shield.value - damage;

  if (newShieldValue <= 0) {
    // 보호막 파괴
    return {
      effects: effects.filter((_, i) => i !== shieldIdx),
      remainingDamage: Math.abs(newShieldValue),
    };
  }

  // 보호막 감소
  return {
    effects: effects.map((e, i) =>
      i === shieldIdx ? { ...e, value: newShieldValue } : e
    ),
    remainingDamage: 0,
  };
}
