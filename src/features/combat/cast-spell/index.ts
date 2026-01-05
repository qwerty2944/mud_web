import { useCallback } from "react";
import { useBattleStore } from "@/application/stores";
import type { CharacterStats } from "@/entities/character";
import type { Skill } from "@/entities/skill";
import type { MagicElement, ProficiencyType } from "@/entities/proficiency";
import type { StatusType } from "@/entities/status";
import {
  calculateMagicDamage,
  applyCritical,
} from "../lib/damage";

interface UseCastSpellOptions {
  onMonsterTurn?: () => void;
}

interface CastSpellParams {
  skill: Skill;
  casterStats: CharacterStats;
  proficiencyLevel: number;
}

export function useCastSpell(options: UseCastSpellOptions = {}) {
  const {
    battle,
    useMp,
    playerAttack,
    healHp,
    applyPlayerStatus,
    applyMonsterStatus,
    addLog,
    processStatusEffects,
    tickAllStatuses,
    getPlayerMagicModifier,
  } = useBattleStore();

  const { onMonsterTurn } = options;

  const castSpell = useCallback(
    (params: CastSpellParams) => {
      const { skill, casterStats, proficiencyLevel } = params;

      // MP 확인 및 소모
      if (!useMp(skill.mpCost)) {
        addLog({
          turn: battle.turn,
          actor: "system",
          action: "mp_fail",
          message: "MP가 부족합니다!",
        });
        return false;
      }

      // 스킬 타입별 처리
      switch (skill.type) {
        case "magic_attack":
          handleMagicAttack(skill, casterStats, proficiencyLevel);
          break;

        case "heal":
          handleHeal(skill);
          break;

        case "buff":
          handleBuff(skill);
          break;

        case "debuff":
          handleDebuff(skill);
          break;

        default:
          console.warn(`Unknown skill type: ${skill.type}`);
          return false;
      }

      return true;
    },
    [battle, useMp, addLog]
  );

  // 마법 공격 처리
  const handleMagicAttack = useCallback(
    (skill: Skill, casterStats: CharacterStats, proficiencyLevel: number) => {
      if (!battle.monster) return;

      const magicModifier = getPlayerMagicModifier();

      // 데미지 계산
      let damage = calculateMagicDamage({
        baseDamage: skill.baseDamage || 10,
        attackerInt: casterStats.int,
        element: skill.element as MagicElement,
        proficiencyLevel,
        targetDefense: battle.monster.stats.defense,
        targetElement: battle.monster.element,
      });

      // 마법 버프 적용
      if (magicModifier !== 0) {
        damage = Math.floor(damage * (1 + magicModifier / 100));
      }

      // 크리티컬 판정 (INT 기반)
      const { damage: finalDamage, isCritical } = applyCritical(
        damage,
        casterStats.int * 0.5 // 마법은 INT 기반 크리티컬
      );

      // 공격 메시지
      const critText = isCritical ? " 💥크리티컬!" : "";
      const message = `${skill.icon} ${skill.nameKo}! ${battle.monster.nameKo}에게 ${finalDamage} 데미지!${critText}`;

      // 공격 적용
      playerAttack(finalDamage, message, skill.proficiencyType);

      // 몬스터 턴 처리 (패시브가 아니고 살아있으면)
      if (
        battle.monster.behavior !== "passive" &&
        battle.monsterCurrentHp - finalDamage > 0
      ) {
        setTimeout(() => {
          processStatusEffects();
          tickAllStatuses();
          onMonsterTurn?.();
        }, 500);
      }
    },
    [
      battle,
      getPlayerMagicModifier,
      playerAttack,
      processStatusEffects,
      tickAllStatuses,
      onMonsterTurn,
    ]
  );

  // 회복 처리
  const handleHeal = useCallback(
    (skill: Skill) => {
      const healAmount = skill.healAmount || 0;
      const healPercent = skill.healPercent || 0;

      let totalHeal = healAmount;
      if (healPercent > 0) {
        totalHeal += Math.floor(battle.playerMaxHp * (healPercent / 100));
      }

      addLog({
        turn: battle.turn,
        actor: "player",
        action: "skill",
        message: `${skill.icon} ${skill.nameKo} 시전!`,
      });

      healHp(totalHeal);

      // 몬스터 턴
      if (battle.monster?.behavior !== "passive") {
        setTimeout(() => {
          processStatusEffects();
          tickAllStatuses();
          onMonsterTurn?.();
        }, 500);
      }
    },
    [battle, addLog, healHp, processStatusEffects, tickAllStatuses, onMonsterTurn]
  );

  // 버프 처리
  const handleBuff = useCallback(
    (skill: Skill) => {
      if (!skill.statusEffect) return;

      addLog({
        turn: battle.turn,
        actor: "player",
        action: "skill",
        message: `${skill.icon} ${skill.nameKo} 시전!`,
      });

      applyPlayerStatus(
        skill.statusEffect as StatusType,
        skill.statusValue || 0,
        skill.statusDuration
      );

      // 몬스터 턴
      if (battle.monster?.behavior !== "passive") {
        setTimeout(() => {
          processStatusEffects();
          tickAllStatuses();
          onMonsterTurn?.();
        }, 500);
      }
    },
    [
      battle,
      addLog,
      applyPlayerStatus,
      processStatusEffects,
      tickAllStatuses,
      onMonsterTurn,
    ]
  );

  // 디버프 처리
  const handleDebuff = useCallback(
    (skill: Skill) => {
      if (!skill.statusEffect) return;

      addLog({
        turn: battle.turn,
        actor: "player",
        action: "skill",
        message: `${skill.icon} ${skill.nameKo} 시전!`,
      });

      applyMonsterStatus(
        skill.statusEffect as StatusType,
        skill.statusValue || 0,
        skill.statusDuration
      );

      // 몬스터 턴
      if (battle.monster?.behavior !== "passive") {
        setTimeout(() => {
          processStatusEffects();
          tickAllStatuses();
          onMonsterTurn?.();
        }, 500);
      }
    },
    [
      battle,
      addLog,
      applyMonsterStatus,
      processStatusEffects,
      tickAllStatuses,
      onMonsterTurn,
    ]
  );

  return { castSpell };
}
