import { useCallback } from "react";
import { useBattleStore } from "@/application/stores";
import type { CharacterStats } from "@/entities/character";
import type { MagicElement } from "@/entities/proficiency";
import type { Period } from "@/entities/game-time";
import type { WeatherType } from "@/entities/weather";
import type { Spell } from "@/entities/spell";
import {
  checkSpellRequirements,
  checkHealingRestriction,
  calculateFinalMpCost,
  calculateBoostedBaseDamage,
  getSpellProficiencyRank,
  isAttackSpell,
  isHealingSpell,
  calculateHealAmount,
  getNethrosHealPenalty,
} from "@/entities/spell";
import { increaseSpellProficiency } from "@/entities/spell";
import {
  calculateMagicDamage,
  calculateMonsterDamage,
  determineHitResult,
} from "../lib/damage";
import {
  getAttackMessage,
  getMonsterAttackMessage,
  getDodgeMessage,
  getBlockMessage,
  getPlayerDodgeMessage,
  getPlayerBlockMessage,
  getMonsterMissMessage,
} from "../lib/messages";
import { canMonsterAttack } from "@/entities/monster";

interface UseSpellCastOptions {
  userId: string | undefined;
  onMonsterTurn?: () => void;
  onPietyPenalty?: (amount: number, reason: string) => void;
}

interface CastSpellParams {
  spell: Spell;
  casterStats: CharacterStats;
  elementProficiency: number;   // 해당 속성 숙련도
  spellExperience: number;      // 해당 주문 개별 숙련도
  playerDefense?: number;
  karma?: number;
  piety?: number;
  religion?: string;
  period?: Period;
  weather?: WeatherType;
}

interface CastResult {
  success: boolean;
  message: string;
  damage?: number;
  heal?: number;
  proficiencyGained?: boolean;
}

/**
 * 새로운 주문 시스템용 시전 훅
 */
export function useSpellCast(options: UseSpellCastOptions) {
  const { userId, onMonsterTurn, onPietyPenalty } = options;

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
    monsterAttack,
  } = useBattleStore();

  /**
   * 주문 시전
   */
  const castSpell = useCallback(
    async (params: CastSpellParams): Promise<CastResult> => {
      const {
        spell,
        casterStats,
        elementProficiency,
        spellExperience,
        playerDefense = 0,
        karma,
        piety,
        religion,
        period,
        weather,
      } = params;

      // 1. 요구 조건 체크
      const requirementCheck = checkSpellRequirements(spell, {
        karma,
        piety,
        religion,
      });

      if (!requirementCheck.canUse) {
        const reason = requirementCheck.reasons[0];
        addLog({
          turn: battle.turn,
          actor: "system",
          action: "spell_fail",
          message: `❌ ${reason}`,
        });
        return { success: false, message: reason };
      }

      // 2. 네스로스 치유 금기 체크
      const healRestriction = checkHealingRestriction({ religion, piety });
      if (!healRestriction.allowed && healRestriction.reason) {
        onPietyPenalty?.(15, healRestriction.reason);
      }

      // 3. MP 비용 계산 및 소모
      const mpCost = calculateFinalMpCost(spell, spellExperience);
      if (mpCost > 0 && !useMp(mpCost)) {
        addLog({
          turn: battle.turn,
          actor: "system",
          action: "mp_fail",
          message: "MP가 부족합니다!",
        });
        return { success: false, message: "MP가 부족합니다!" };
      }

      // 4. 주문 타입별 처리
      let result: CastResult;

      switch (spell.type) {
        case "attack":
        case "dot":
          result = await handleAttackSpell(
            spell,
            casterStats,
            elementProficiency,
            spellExperience,
            playerDefense,
            karma,
            period,
            weather
          );
          break;

        case "heal":
          result = handleHealSpell(spell, spellExperience, religion, piety);
          break;

        case "buff":
          result = handleBuffSpell(spell);
          break;

        case "debuff":
          result = handleDebuffSpell(spell);
          break;

        case "special":
          result = handleSpecialSpell(spell, casterStats);
          break;

        default:
          result = { success: false, message: "알 수 없는 주문 타입" };
      }

      // 5. 주문 숙련도 증가
      if (result.success && userId) {
        try {
          await increaseSpellProficiency(userId, spell.id, 1);
          result.proficiencyGained = true;
        } catch (error) {
          console.error("Failed to increase spell proficiency:", error);
        }
      }

      return result;
    },
    [battle, useMp, addLog, userId, onPietyPenalty]
  );

  /**
   * 공격 주문 처리
   */
  const handleAttackSpell = useCallback(
    async (
      spell: Spell,
      casterStats: CharacterStats,
      elementProficiency: number,
      spellExperience: number,
      playerDefense: number,
      karma?: number,
      period?: Period,
      weather?: WeatherType
    ): Promise<CastResult> => {
      if (!battle.monster) {
        return { success: false, message: "대상이 없습니다" };
      }

      const magicModifier = getPlayerMagicModifier();

      // 마법 공격 판정 (빗맞음 없음)
      const hitResult = determineHitResult(
        { lck: casterStats.lck ?? 10, dex: casterStats.dex, int: casterStats.int },
        { dex: battle.monster.stats.speed ?? 5, con: Math.floor(battle.monster.stats.defense / 2) },
        false
      );

      let finalDamage = 0;
      let message = "";
      const isCritical = hitResult.result === "critical";

      if (hitResult.result === "dodged") {
        message = getDodgeMessage(battle.monster.nameKo);
        addLog({
          turn: battle.turn,
          actor: "player",
          action: "spell",
          message: `✨ ${spell.nameKo} 시전!`,
        });
        addLog({
          turn: battle.turn,
          actor: "monster",
          action: "dodge",
          message,
        });
      } else {
        // 숙련도 보너스가 적용된 기본 데미지
        const boostedBaseDamage = calculateBoostedBaseDamage(spell.baseDamage ?? 0, spellExperience);

        // 데미지 계산 (카르마, 시간대, 날씨 포함)
        let damage = calculateMagicDamage({
          baseDamage: boostedBaseDamage,
          attackerInt: casterStats.int,
          element: spell.element as MagicElement,
          proficiencyLevel: elementProficiency,
          targetDefense: battle.monster.stats.defense,
          targetElement: battle.monster.element,
          period,
          weather,
          karma,
        });

        // 마법 버프 적용
        if (magicModifier !== 0) {
          damage = Math.floor(damage * (1 + magicModifier / 100));
        }

        // 배율 적용
        finalDamage = Math.floor(damage * hitResult.damageMultiplier);
        finalDamage = Math.max(1, finalDamage);

        // 메시지 생성
        if (hitResult.result === "blocked") {
          message = getBlockMessage(battle.monster.nameKo, finalDamage);
        } else {
          message = isCritical
            ? `💥 ${spell.nameKo}! 치명타! ${battle.monster.nameKo}에게 ${finalDamage} 데미지!`
            : `✨ ${spell.nameKo}! ${battle.monster.nameKo}에게 ${finalDamage} 데미지!`;
        }
      }

      // 공격 적용
      playerAttack(finalDamage, message, spell.element);

      // DoT 효과 적용 (deprecated - spell.effect 필드 제거됨)

      // 몬스터 반격
      const newMonsterHp = battle.monsterCurrentHp - finalDamage;
      if (newMonsterHp > 0 && canMonsterAttack(battle.monster)) {
        await handleMonsterCounterAttack(casterStats, playerDefense);
      }

      return { success: true, message, damage: finalDamage };
    },
    [battle, getPlayerMagicModifier, playerAttack, applyMonsterStatus]
  );

  /**
   * 치유 주문 처리
   */
  const handleHealSpell = useCallback(
    (
      spell: Spell,
      spellExperience: number,
      religion?: string,
      piety?: number
    ): CastResult => {
      // 네스로스 신도 치유 페널티 체크 (deprecated - stub 함수 사용)

      // 종교 보너스 + 숙련도 보너스가 적용된 치유량 계산
      const totalHeal = calculateHealAmount({
        baseHeal: spell.baseHeal ?? 0,
        casterWis: 10,
        spellExperience,
        religion,
        piety,
      });

      addLog({
        turn: battle.turn,
        actor: "player",
        action: "spell",
        message: `💚 ${spell.nameKo} 시전!`,
      });

      healHp(totalHeal);

      // HoT 효과 적용 (deprecated - spell.effect 필드 제거됨)

      // 몬스터 턴
      if (battle.monster?.behavior !== "passive") {
        setTimeout(() => {
          processStatusEffects();
          tickAllStatuses();
          onMonsterTurn?.();
        }, 500);
      }

      return {
        success: true,
        message: `HP ${totalHeal} 회복!`,
        heal: totalHeal,
      };
    },
    [battle, addLog, healHp, applyPlayerStatus, processStatusEffects, tickAllStatuses, onMonsterTurn, onPietyPenalty]
  );

  /**
   * 버프 주문 처리
   */
  const handleBuffSpell = useCallback(
    (spell: Spell): CastResult => {
      addLog({
        turn: battle.turn,
        actor: "player",
        action: "spell",
        message: `🛡️ ${spell.nameKo} 시전!`,
      });

      // 버프 효과 적용 (deprecated - spell.effect 필드 제거됨)

      // 몬스터 턴
      if (battle.monster?.behavior !== "passive") {
        setTimeout(() => {
          processStatusEffects();
          tickAllStatuses();
          onMonsterTurn?.();
        }, 500);
      }

      return {
        success: true,
        message: `${spell.nameKo} 효과 적용!`,
      };
    },
    [battle, addLog, applyPlayerStatus, processStatusEffects, tickAllStatuses, onMonsterTurn]
  );

  /**
   * 디버프 주문 처리
   */
  const handleDebuffSpell = useCallback(
    (spell: Spell): CastResult => {
      if (!battle.monster) {
        return { success: false, message: "대상이 없습니다" };
      }

      addLog({
        turn: battle.turn,
        actor: "player",
        action: "spell",
        message: `💀 ${spell.nameKo} 시전!`,
      });

      // 디버프 효과 적용 (deprecated - spell.effect 필드 제거됨)

      // 몬스터 턴
      if (battle.monster.behavior !== "passive") {
        setTimeout(() => {
          processStatusEffects();
          tickAllStatuses();
          onMonsterTurn?.();
        }, 500);
      }

      return {
        success: true,
        message: `${battle.monster.nameKo}에게 ${spell.nameKo} 적용!`,
      };
    },
    [battle, addLog, applyMonsterStatus, processStatusEffects, tickAllStatuses, onMonsterTurn]
  );

  /**
   * 특수 주문 처리 (즉사, 석화 등)
   */
  const handleSpecialSpell = useCallback(
    (spell: Spell, casterStats: CharacterStats): CastResult => {
      if (!battle.monster) {
        return { success: false, message: "대상이 없습니다" };
      }

      addLog({
        turn: battle.turn,
        actor: "player",
        action: "spell",
        message: `⚡ ${spell.nameKo} 시전!`,
      });

      // 즉사/석화 효과 (deprecated - spell.effect 필드 제거됨)

      return { success: true, message: spell.nameKo };
    },
    [battle, addLog, playerAttack, applyMonsterStatus, processStatusEffects, tickAllStatuses, onMonsterTurn]
  );

  /**
   * 몬스터 반격 처리
   */
  const handleMonsterCounterAttack = useCallback(
    async (casterStats: CharacterStats, playerDefense: number) => {
      if (!battle.monster) return;

      const monsterHitResult = determineHitResult(
        { lck: 5 },
        { dex: casterStats.dex ?? 10, con: casterStats.con ?? 10 },
        true
      );

      let monsterDmg = 0;
      let monsterMsg = "";

      if (monsterHitResult.result === "missed") {
        monsterMsg = getMonsterMissMessage();
      } else if (monsterHitResult.result === "dodged") {
        monsterMsg = getPlayerDodgeMessage();
      } else {
        monsterDmg = calculateMonsterDamage(battle.monster.stats.attack, playerDefense);
        monsterDmg = Math.floor(monsterDmg * monsterHitResult.damageMultiplier);
        monsterDmg = Math.max(0, monsterDmg);

        if (monsterHitResult.result === "blocked") {
          const reducedAmount = Math.floor(monsterDmg / 2);
          monsterMsg = getPlayerBlockMessage(reducedAmount);
        } else {
          monsterMsg = getMonsterAttackMessage(battle.monster.nameKo, monsterDmg);
        }
      }

      setTimeout(() => {
        monsterAttack(monsterDmg, monsterMsg);
      }, 500);
    },
    [battle, monsterAttack]
  );

  return { castSpell };
}
