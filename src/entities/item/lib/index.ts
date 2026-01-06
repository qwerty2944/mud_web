import type { CharacterStats } from "@/entities/character";
import type { Item, ItemRarity } from "../types";
import { RARITY_CONFIG, WEIGHT_CONFIG } from "../types";

// ============ 등급 관련 ============

/**
 * 등급 색상 반환
 */
export function getRarityColor(rarity: ItemRarity): string {
  return RARITY_CONFIG[rarity].color;
}

/**
 * 등급 이름 반환
 */
export function getRarityName(rarity: ItemRarity, locale: "ko" | "en" = "ko"): string {
  const info = RARITY_CONFIG[rarity];
  return locale === "ko" ? info.nameKo : info.nameEn;
}

/**
 * 등급 비교 (정렬용)
 */
export function compareRarity(a: ItemRarity, b: ItemRarity): number {
  return RARITY_CONFIG[a].tier - RARITY_CONFIG[b].tier;
}

/**
 * 등급 tier 반환
 */
export function getRarityTier(rarity: ItemRarity): number {
  return RARITY_CONFIG[rarity].tier;
}

/**
 * 등급 배율 적용된 드랍률
 */
export function applyRarityToDropChance(baseChance: number, rarity: ItemRarity): number {
  return baseChance * RARITY_CONFIG[rarity].dropRateMultiplier;
}

// ============ 무게 시스템 ============

/**
 * 플레이어 최대 소지량 계산
 */
export function calculateMaxCarryCapacity(stats: CharacterStats): number {
  return WEIGHT_CONFIG.BASE_CARRY_CAPACITY + stats.str * WEIGHT_CONFIG.STR_BONUS_PER_POINT;
}

/**
 * 아이템 목록 총 무게 계산
 */
export function calculateTotalWeight(items: { item: Item; quantity: number }[]): number {
  return items.reduce((total, { item, quantity }) => {
    return total + item.weight * quantity;
  }, 0);
}

/**
 * 아이템 획득 가능 여부 (무게 체크)
 */
export function canCarryItem(
  currentWeight: number,
  itemToAdd: Item,
  quantity: number,
  maxCapacity: number
): boolean {
  const additionalWeight = itemToAdd.weight * quantity;
  const newTotal = currentWeight + additionalWeight;
  return newTotal <= maxCapacity * WEIGHT_CONFIG.MAX_OVERWEIGHT_RATIO;
}

/**
 * 과적 상태 확인
 */
export function getOverweightStatus(
  currentWeight: number,
  maxCapacity: number
): {
  isOverweight: boolean;
  speedPenalty: number;
  percentage: number;
  canPickup: boolean;
} {
  const percentage = (currentWeight / maxCapacity) * 100;
  const isOverweight = currentWeight > maxCapacity;
  const speedPenalty = isOverweight ? WEIGHT_CONFIG.OVERWEIGHT_SPEED_PENALTY : 0;
  const canPickup = currentWeight < maxCapacity * WEIGHT_CONFIG.MAX_OVERWEIGHT_RATIO;

  return { isOverweight, speedPenalty, percentage, canPickup };
}

// ============ 가격 관련 ============

/**
 * 등급 배율 적용된 판매가
 */
export function calculateSellPrice(item: Item): number {
  return Math.floor(item.sellPrice * RARITY_CONFIG[item.rarity].valueMultiplier);
}

/**
 * 등급 배율 적용된 구매가
 */
export function calculateBuyPrice(item: Item): number {
  return Math.floor(item.value * RARITY_CONFIG[item.rarity].valueMultiplier);
}

// ============ 아이템 유틸리티 ============

/**
 * 소비 아이템 여부
 */
export function isConsumable(item: Item): boolean {
  return item.type === "consumable" && !!item.consumableEffect;
}

/**
 * 장비 아이템 여부
 */
export function isEquippable(item: Item): boolean {
  return item.type === "equipment" && !!item.equipmentData;
}

/**
 * 장비 장착 가능 여부 (레벨 체크)
 */
export function canEquipItem(item: Item, playerLevel: number): boolean {
  if (!item.equipmentData) return false;
  const { requiredLevel } = item.equipmentData;
  if (requiredLevel && playerLevel < requiredLevel) return false;
  return true;
}

/**
 * 스택 가능한 최대 수량
 */
export function getMaxStack(item: Item): number {
  if (!item.stackable) return 1;
  return item.maxStack || 99;
}

// ============ 포맷팅 ============

/**
 * 무게 포맷팅
 */
export function formatWeight(weight: number): string {
  if (weight < 1) {
    return `${(weight * 1000).toFixed(0)}g`;
  }
  return `${weight.toFixed(1)}kg`;
}

/**
 * 아이템 요약 정보
 */
export function formatItemSummary(item: Item): string {
  const rarityName = getRarityName(item.rarity, "ko");
  return `${item.icon} [${rarityName}] ${item.nameKo}`;
}

/**
 * 장비 스탯 요약
 */
export function formatEquipmentStats(item: Item): string {
  if (!item.equipmentData) return "";

  const stats = item.equipmentData.stats;
  const parts: string[] = [];

  if (stats.attack) parts.push(`ATK +${stats.attack}`);
  if (stats.defense) parts.push(`DEF +${stats.defense}`);
  if (stats.magic) parts.push(`MAG +${stats.magic}`);
  if (stats.hp) parts.push(`HP +${stats.hp}`);
  if (stats.mp) parts.push(`MP +${stats.mp}`);
  if (stats.speed) parts.push(`SPD +${stats.speed}`);
  if (stats.critRate) parts.push(`CRT +${stats.critRate}%`);
  if (stats.critDamage) parts.push(`CDMG +${stats.critDamage}%`);

  return parts.join(", ");
}
