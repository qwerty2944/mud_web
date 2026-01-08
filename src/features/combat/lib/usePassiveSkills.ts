"use client";

import { useCallback, useMemo } from "react";
import { useBattleStore, useEquipmentStore } from "@/application/stores";
import {
  DEFAULT_PASSIVE_SKILLS,
  processOnHitPassives,
  processLowHpPassives,
  type PassiveSkillResult,
  type Skill,
} from "@/entities/skill";
import type { CharacterStats } from "@/entities/character";

interface UsePassiveSkillsOptions {
  characterStats: CharacterStats;
}

/**
 * 패시브 스킬 처리 훅
 */
export function usePassiveSkills(options: UsePassiveSkillsOptions) {
  const { characterStats } = options;
  const { battle, addLog, healHp, playerAttack } = useBattleStore();
  const { learnedSkills } = useEquipmentStore();

  // 배운 패시브 스킬 목록 (기본 패시브 스킬에서 필터링)
  const learnedPassiveSkills = useMemo(() => {
    return DEFAULT_PASSIVE_SKILLS.filter((skill) =>
      learnedSkills.includes(skill.id)
    );
  }, [learnedSkills]);

  /**
   * 피격 시 패시브 스킬 처리
   */
  const processOnHit = useCallback(
    (damageTaken: number): {
      reflectedDamage: number;
      healAmount: number;
      counterDamage: number;
    } => {
      if (learnedPassiveSkills.length === 0) {
        return { reflectedDamage: 0, healAmount: 0, counterDamage: 0 };
      }

      const results = processOnHitPassives(learnedPassiveSkills, {
        damageTaken,
        currentHp: battle.playerCurrentHp,
        maxHp: battle.playerMaxHp,
        attackerStats: characterStats,
      });

      let totalReflected = 0;
      let totalHeal = 0;
      let totalCounter = 0;

      for (const result of results) {
        // 로그 추가
        addLog({
          turn: battle.turn,
          actor: "player",
          action: "passive",
          message: result.message,
        });

        // 효과 적용
        if (result.damageReflected) {
          totalReflected += result.damageReflected;
        }
        if (result.healAmount) {
          totalHeal += result.healAmount;
          healHp(result.healAmount);
        }
        if (result.counterDamage) {
          totalCounter += result.counterDamage;
        }
      }

      // 반사/반격 데미지를 몬스터에게 적용
      if ((totalReflected > 0 || totalCounter > 0) && battle.monster) {
        const totalDamage = totalReflected + totalCounter;
        setTimeout(() => {
          const currentBattle = useBattleStore.getState().battle;
          if (currentBattle.monster && currentBattle.result === "ongoing") {
            useBattleStore.getState().playerAttack(
              totalDamage,
              totalReflected > 0 && totalCounter > 0
                ? `🌵⚡ 반사/반격으로 ${totalDamage} 피해!`
                : totalReflected > 0
                ? `🌵 반사 피해 ${totalDamage}!`
                : `⚡ 반격 피해 ${totalDamage}!`
            );
          }
        }, 200);
      }

      return {
        reflectedDamage: totalReflected,
        healAmount: totalHeal,
        counterDamage: totalCounter,
      };
    },
    [learnedPassiveSkills, battle, characterStats, addLog, healHp]
  );

  /**
   * HP 낮을 때 패시브 스킬 처리
   */
  const processLowHp = useCallback(() => {
    if (learnedPassiveSkills.length === 0) return;

    const results = processLowHpPassives(learnedPassiveSkills, {
      currentHp: battle.playerCurrentHp,
      maxHp: battle.playerMaxHp,
      attackerStats: characterStats,
    });

    for (const result of results) {
      addLog({
        turn: battle.turn,
        actor: "player",
        action: "passive",
        message: result.message,
      });

      if (result.healAmount) {
        healHp(result.healAmount);
      }
    }
  }, [learnedPassiveSkills, battle, characterStats, addLog, healHp]);

  return {
    learnedPassiveSkills,
    processOnHit,
    processLowHp,
    hasPassiveSkills: learnedPassiveSkills.length > 0,
  };
}
