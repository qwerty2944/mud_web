/**
 * 몬스터 AI - 어빌리티 선택 및 큐 생성
 */

import type { Monster, MonsterAbility } from "@/entities/monster";
import type { RawMonsterAbility } from "@/entities/ability";
import type { QueuedAction } from "@/application/stores/battleStore";

interface MonsterAiContext {
  monster: Monster;
  monsterHpPercent: number;
  currentTurn: number;
  monsterMaxAp: number;
  monsterCurrentAp: number;
}

/**
 * 몬스터가 사용 가능한 어빌리티 필터링 (조건 체크)
 */
export function getAvailableAbilities(
  abilities: MonsterAbility[],
  context: { hpPercent: number; currentTurn: number }
): MonsterAbility[] {
  return abilities.filter((ability) => {
    if (!ability.condition) return true;

    const { hpBelow, hpAbove, turnAfter } = ability.condition;

    // HP 조건 체크
    if (hpBelow !== undefined && context.hpPercent >= hpBelow) {
      return false;
    }
    if (hpAbove !== undefined && context.hpPercent <= hpAbove) {
      return false;
    }

    // 턴 조건 체크
    if (turnAfter !== undefined && context.currentTurn < turnAfter) {
      return false;
    }

    return true;
  });
}

/**
 * 가중치 기반 랜덤 선택
 */
export function selectAbilityByWeight(abilities: MonsterAbility[]): MonsterAbility | null {
  if (abilities.length === 0) return null;

  const totalWeight = abilities.reduce((sum, a) => sum + a.weight, 0);
  let roll = Math.random() * totalWeight;

  for (const ability of abilities) {
    roll -= ability.weight;
    if (roll <= 0) {
      return ability;
    }
  }

  return abilities[abilities.length - 1];
}

/**
 * 몬스터 어빌리티를 QueuedAction으로 변환
 */
export function createMonsterQueuedAction(
  ability: MonsterAbility,
  monsterAbilityData: RawMonsterAbility
): QueuedAction {
  // RawMonsterAbility를 Ability 형식으로 변환
  const abilityForQueue = {
    id: monsterAbilityData.id,
    nameKo: monsterAbilityData.nameKo,
    nameEn: monsterAbilityData.nameEn,
    description: monsterAbilityData.description,
    icon: monsterAbilityData.icon,
    source: "monster" as const,
    type: monsterAbilityData.type as "attack" | "buff" | "debuff",
    attackType: monsterAbilityData.attackType as "melee_physical" | "ranged_physical" | "magic" | undefined,
    baseCost: {
      ap: monsterAbilityData.apCost,
    },
    levelBonuses: [],
    usageContext: "combat_only" as const,
    maxLevel: 1,
    expPerLevel: 0,
    requirements: {},
    target: monsterAbilityData.type === "buff" ? "self" as const : "enemy" as const,
  };

  return {
    ability: abilityForQueue,
    level: ability.level,
    apCost: monsterAbilityData.apCost,
    mpCost: 0,
  };
}

/**
 * 몬스터 기본 공격 생성 (어빌리티가 없을 때 사용)
 */
function createDefaultAttackAction(monster: Monster): QueuedAction {
  const defaultAbility = {
    id: "monster_basic_attack",
    nameKo: "공격",
    nameEn: "Attack",
    description: { ko: "기본 공격", en: "Basic attack" },
    icon: monster.icon || "👊",
    source: "monster" as const,
    type: "attack" as const,
    attackType: "melee_physical" as const,
    baseCost: { ap: 3 },
    levelBonuses: [],
    usageContext: "combat_only" as const,
    maxLevel: 1,
    expPerLevel: 0,
    requirements: {},
    target: "enemy" as const,
  };

  return {
    ability: defaultAbility,
    level: 1,
    apCost: 3,
    mpCost: 0,
  };
}

/**
 * 몬스터 턴 큐 생성
 * AP 제한 내에서 여러 어빌리티 선택
 */
export function buildMonsterQueue(
  context: MonsterAiContext,
  monsterAbilitiesData: Map<string, RawMonsterAbility>
): QueuedAction[] {
  const queue: QueuedAction[] = [];
  let remainingAp = context.monsterMaxAp;

  const monsterAbilities = context.monster.abilities || [];

  // 어빌리티가 없으면 기본 공격 사용
  if (monsterAbilities.length === 0) {
    // AP가 남아있는 한 기본 공격 추가
    const maxActions = 3;
    let actionCount = 0;
    const defaultApCost = 3;

    while (remainingAp >= defaultApCost && actionCount < maxActions) {
      queue.push(createDefaultAttackAction(context.monster));
      remainingAp -= defaultApCost;
      actionCount++;
    }
    return queue;
  }

  // 사용 가능한 어빌리티 필터링
  const available = getAvailableAbilities(monsterAbilities, {
    hpPercent: context.monsterHpPercent,
    currentTurn: context.currentTurn,
  });

  // 사용 가능한 어빌리티가 없으면 기본 공격
  if (available.length === 0) {
    const maxActions = 3;
    let actionCount = 0;
    const defaultApCost = 3;

    while (remainingAp >= defaultApCost && actionCount < maxActions) {
      queue.push(createDefaultAttackAction(context.monster));
      remainingAp -= defaultApCost;
      actionCount++;
    }
    return queue;
  }

  // AP가 남아있는 동안 어빌리티 선택
  const maxActions = 3; // 턴당 최대 행동 수
  let actionCount = 0;

  while (remainingAp > 0 && actionCount < maxActions) {
    // 사용 가능하고 AP를 감당할 수 있는 어빌리티만 필터
    const affordableAbilities = available.filter((a) => {
      const data = monsterAbilitiesData.get(a.abilityId);
      return data && data.apCost <= remainingAp;
    });

    // 감당 가능한 어빌리티가 없으면 기본 공격 시도
    if (affordableAbilities.length === 0) {
      if (remainingAp >= 3) {
        queue.push(createDefaultAttackAction(context.monster));
        remainingAp -= 3;
        actionCount++;
        continue;
      }
      break;
    }

    // 가중치 기반 선택
    const selected = selectAbilityByWeight(affordableAbilities);
    if (!selected) break;

    const abilityData = monsterAbilitiesData.get(selected.abilityId);
    if (!abilityData) break;

    // 큐에 추가
    const queuedAction = createMonsterQueuedAction(selected, abilityData);
    queue.push(queuedAction);

    remainingAp -= abilityData.apCost;
    actionCount++;
  }

  return queue;
}

/**
 * 몬스터 어빌리티 데미지 계산 (레벨 반영)
 */
export function calculateMonsterAbilityDamage(
  abilityData: RawMonsterAbility,
  level: number,
  monsterAttack: number
): number {
  const baseDamage = abilityData.baseDamage || 0;
  const perLevel = abilityData.damagePerLevel || 0;

  // 기본 데미지 + (레벨 × 레벨당 증가) + 몬스터 공격력 보정
  return Math.floor(baseDamage + perLevel * level + monsterAttack * 0.5);
}

/**
 * 몬스터 어빌리티 상태이상 적용 확률 체크
 */
export function checkMonsterStatusEffect(abilityData: RawMonsterAbility): {
  applies: boolean;
  effect?: string;
  value?: number;
  duration?: number;
} {
  if (!abilityData.statusEffect || !abilityData.statusChance) {
    return { applies: false };
  }

  const roll = Math.random() * 100;
  if (roll < abilityData.statusChance) {
    return {
      applies: true,
      effect: abilityData.statusEffect,
      value: abilityData.statusValue,
      duration: abilityData.statusDuration,
    };
  }

  return { applies: false };
}

/**
 * 몬스터 버프 어빌리티 처리
 */
export function getMonsterBuffEffect(abilityData: RawMonsterAbility): {
  buff?: string;
  value?: number;
  duration?: number;
} {
  if (!abilityData.selfBuff) {
    return {};
  }

  return {
    buff: abilityData.selfBuff,
    value: abilityData.buffValue,
    duration: abilityData.buffDuration,
  };
}
