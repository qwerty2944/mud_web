"use client";

import { useState } from "react";
import { useThemeStore } from "@/shared/config";
import { useBattleStore, useEquipmentStore } from "@/application/stores";
import type { Ability, ProficiencyType, CombatProficiencyType, WeaponType, Proficiencies, MagicElement as AbilityMagicElement } from "@/entities/ability";
import { getProficiencyInfo, getProficiencyValue, useAbilities } from "@/entities/ability";
import type { BattleActionTab } from "./ActionTabs";
import { MagicSubTabs, MAGIC_ELEMENTS, type MagicElement } from "./MagicSubTabs";

// 방어 행동 타입
export type DefenseAction = "guard" | "dodge" | "counter";

interface ActionPanelProps {
  activeTab: BattleActionTab;
  proficiencies: Proficiencies | undefined;
  onWeaponAttack: (weaponType: CombatProficiencyType) => void;
  onDefenseAction: (action: DefenseAction) => void;
  onCastSkill: (ability: Ability) => void;
  onFlee: () => void;
  disabled?: boolean;
}

export function ActionPanel({
  activeTab,
  proficiencies,
  onWeaponAttack,
  onDefenseAction,
  onCastSkill,
  onFlee,
  disabled = false,
}: ActionPanelProps) {
  const { theme } = useThemeStore();
  const { canUseSkill, isPlayerSilenced } = useBattleStore();
  const { mainHand, learnedSkills } = useEquipmentStore();

  // 마법 속성 서브탭 상태
  const [activeMagicElement, setActiveMagicElement] = useState<MagicElement>("all");

  // 어빌리티 데이터 로드
  const { data: allAbilities = [] } = useAbilities();

  // 배운 어빌리티만 필터링
  const learnedAbilityData = allAbilities.filter((ability) =>
    learnedSkills.includes(ability.id)
  );

  // 마법 스킬 (마법 공격 + 힐)
  const magicSkills = learnedAbilityData.filter(
    (skill) => (skill.type === "attack" && skill.attackType === "magic") || skill.type === "heal"
  );

  // 현재 선택된 속성의 마법만 필터링
  const filteredMagicSkills = activeMagicElement === "all"
    ? magicSkills
    : magicSkills.filter((skill) => {
        // heal 스킬은 holy 속성으로 분류
        const skillElement = skill.element || (skill.type === "heal" ? "holy" : null);
        return skillElement === activeMagicElement;
      });

  // 배운 마법이 있는 속성 목록
  const availableElements = [
    ...new Set(
      magicSkills
        .map((skill) => skill.element || (skill.type === "heal" ? ("holy" as AbilityMagicElement) : null))
        .filter((e): e is AbilityMagicElement => e !== null)
    ),
  ];

  // 버프 스킬
  const buffSkills = learnedAbilityData.filter(
    (skill) => skill.type === "buff"
  );

  // 디버프 스킬
  const debuffSkills = learnedAbilityData.filter(
    (skill) => skill.type === "debuff"
  );

  const isSilenced = isPlayerSilenced();

  // 장착 무기 정보
  // mainHand.itemType이 유효한 WeaponType인지 확인
  const rawWeaponType = mainHand?.itemType;
  const equippedWeaponType = (rawWeaponType && typeof rawWeaponType === "string")
    ? rawWeaponType as WeaponType
    : null;
  const weaponInfo = equippedWeaponType
    ? getProficiencyInfo(equippedWeaponType)
    : null;

  return (
    <div className="p-3 space-y-3 min-h-[200px]">
      {/* 무기 탭 - 장착된 무기 또는 맨손 */}
      {activeTab === "weapon" && (
        <div className="space-y-2">
          {/* 장착된 무기가 있고 무기 타입이 유효하면 */}
          {mainHand && equippedWeaponType ? (
            <button
              onClick={() => onWeaponAttack(equippedWeaponType)}
              disabled={disabled}
              className="w-full flex items-center gap-4 py-3 px-4 transition-colors font-mono"
              style={{
                background: theme.colors.bgLight,
                border: `1px solid ${theme.colors.border}`,
                color: theme.colors.text,
                opacity: disabled ? 0.5 : 1,
                cursor: disabled ? "not-allowed" : "pointer",
              }}
            >
              <span className="text-3xl">{mainHand.icon}</span>
              <div className="flex-1 text-left">
                <div className="font-medium">{mainHand.itemName}</div>
                <div
                  className="text-xs"
                  style={{ color: theme.colors.textMuted }}
                >
                  {weaponInfo?.nameKo ?? "무기"} · Lv.{getProficiencyValue(proficiencies, equippedWeaponType)}
                </div>
              </div>
              <div
                className="text-sm px-2 py-1"
                style={{
                  background: theme.colors.primary + "20",
                  color: theme.colors.primary,
                }}
              >
                공격
              </div>
            </button>
          ) : (
            /* 맨손 공격 */
            <button
              onClick={() => onWeaponAttack("fist")}
              disabled={disabled}
              className="w-full flex items-center gap-4 py-3 px-4 transition-colors font-mono"
              style={{
                background: theme.colors.bgLight,
                border: `1px solid ${theme.colors.border}`,
                color: theme.colors.text,
                opacity: disabled ? 0.5 : 1,
                cursor: disabled ? "not-allowed" : "pointer",
              }}
            >
              <span className="text-3xl">👊</span>
              <div className="flex-1 text-left">
                <div className="font-medium">맨손</div>
                <div
                  className="text-xs"
                  style={{ color: theme.colors.textMuted }}
                >
                  무기 없음
                </div>
              </div>
              <div
                className="text-sm px-2 py-1"
                style={{
                  background: theme.colors.textMuted + "20",
                  color: theme.colors.textMuted,
                }}
              >
                공격
              </div>
            </button>
          )}

          {/* 무기 장착 안내 */}
          {!mainHand && (
            <div
              className="text-center py-2 text-xs font-mono"
              style={{ color: theme.colors.textMuted }}
            >
              인벤토리에서 무기를 장착하세요
            </div>
          )}
        </div>
      )}

      {/* 방어 탭 */}
      {activeTab === "defense" && (
        <div className="space-y-2">
          {/* 방어 자세 */}
          <button
            onClick={() => onDefenseAction("guard")}
            disabled={disabled}
            className="w-full flex items-center gap-4 py-3 px-4 transition-colors font-mono"
            style={{
              background: theme.colors.bgLight,
              border: `1px solid ${theme.colors.border}`,
              color: theme.colors.text,
              opacity: disabled ? 0.5 : 1,
              cursor: disabled ? "not-allowed" : "pointer",
            }}
          >
            <span className="text-3xl">🛡️</span>
            <div className="flex-1 text-left">
              <div className="font-medium">방어 자세</div>
              <div className="text-xs" style={{ color: theme.colors.textMuted }}>
                다음 공격 피해 50% 감소
              </div>
            </div>
            <div
              className="text-sm px-2 py-1"
              style={{
                background: theme.colors.primary + "20",
                color: theme.colors.primary,
              }}
            >
              방어
            </div>
          </button>

          {/* 회피 집중 */}
          <button
            onClick={() => onDefenseAction("dodge")}
            disabled={disabled}
            className="w-full flex items-center gap-4 py-3 px-4 transition-colors font-mono"
            style={{
              background: theme.colors.bgLight,
              border: `1px solid ${theme.colors.border}`,
              color: theme.colors.text,
              opacity: disabled ? 0.5 : 1,
              cursor: disabled ? "not-allowed" : "pointer",
            }}
          >
            <span className="text-3xl">💨</span>
            <div className="flex-1 text-left">
              <div className="font-medium">회피 집중</div>
              <div className="text-xs" style={{ color: theme.colors.textMuted }}>
                다음 공격 회피 확률 +40%
              </div>
            </div>
            <div
              className="text-sm px-2 py-1"
              style={{
                background: theme.colors.success + "20",
                color: theme.colors.success,
              }}
            >
              회피
            </div>
          </button>

          {/* 반격 대기 */}
          <button
            onClick={() => onDefenseAction("counter")}
            disabled={disabled}
            className="w-full flex items-center gap-4 py-3 px-4 transition-colors font-mono"
            style={{
              background: theme.colors.bgLight,
              border: `1px solid ${theme.colors.border}`,
              color: theme.colors.text,
              opacity: disabled ? 0.5 : 1,
              cursor: disabled ? "not-allowed" : "pointer",
            }}
          >
            <span className="text-3xl">⚡</span>
            <div className="flex-1 text-left">
              <div className="font-medium">반격 대기</div>
              <div className="text-xs" style={{ color: theme.colors.textMuted }}>
                막기 성공 시 100% 반격
              </div>
            </div>
            <div
              className="text-sm px-2 py-1"
              style={{
                background: theme.colors.warning + "20",
                color: theme.colors.warning,
              }}
            >
              반격
            </div>
          </button>
        </div>
      )}

      {/* 마법 탭 */}
      {activeTab === "magic" && (
        <div className="space-y-2">
          {/* 속성별 서브탭 */}
          {magicSkills.length > 0 && (
            <MagicSubTabs
              activeElement={activeMagicElement}
              onElementChange={setActiveMagicElement}
              availableElements={availableElements}
              disabled={disabled || isSilenced}
            />
          )}

          {/* 침묵 상태 표시 */}
          {isSilenced && (
            <div
              className="text-center py-2 font-mono text-sm"
              style={{ color: theme.colors.error }}
            >
              🤐 침묵 상태 - 마법 사용 불가
            </div>
          )}

          {/* 필터링된 마법 스킬 그리드 */}
          {filteredMagicSkills.length > 0 ? (
            <div className="grid grid-cols-3 gap-2">
              {filteredMagicSkills.map((skill) => {
                const canCast = canUseSkill(skill.baseCost?.mp ?? 0) && !isSilenced;
                // 마법 스킬의 숙련도는 element 기반
                const proficiencyType = skill.element ?? "fire";
                return (
                  <SkillButton
                    key={skill.id}
                    skill={skill}
                    proficiency={
                      getProficiencyValue(proficiencies, proficiencyType as ProficiencyType)
                    }
                    canCast={canCast}
                    disabled={disabled || !canCast}
                    onClick={() => onCastSkill(skill)}
                  />
                );
              })}
            </div>
          ) : magicSkills.length > 0 ? (
            <div
              className="text-center py-4 font-mono text-sm"
              style={{ color: theme.colors.textMuted }}
            >
              {MAGIC_ELEMENTS[activeMagicElement].nameKo} 마법이 없습니다
            </div>
          ) : (
            <div
              className="text-center py-4 font-mono text-sm"
              style={{ color: theme.colors.textMuted }}
            >
              배운 마법이 없습니다
            </div>
          )}
        </div>
      )}

      {/* 보조 탭 (버프/디버프) */}
      {activeTab === "support" && (
        <div className="space-y-3">
          {isSilenced && (
            <div
              className="text-center py-2 font-mono text-sm"
              style={{ color: theme.colors.error }}
            >
              🤐 침묵 상태 - 마법 사용 불가
            </div>
          )}

          {/* 버프 */}
          {buffSkills.length > 0 && (
            <div>
              <div
                className="text-xs font-mono mb-1"
                style={{ color: theme.colors.textMuted }}
              >
                💚 버프
              </div>
              <div className="grid grid-cols-3 gap-2">
                {buffSkills.map((skill) => {
                  const canCast = canUseSkill(skill.baseCost?.mp ?? 0) && !isSilenced;
                  return (
                    <SkillButton
                      key={skill.id}
                      skill={skill}
                      canCast={canCast}
                      disabled={disabled || !canCast}
                      onClick={() => onCastSkill(skill)}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* 디버프 */}
          {debuffSkills.length > 0 && (
            <div>
              <div
                className="text-xs font-mono mb-1"
                style={{ color: theme.colors.textMuted }}
              >
                ☠️ 디버프
              </div>
              <div className="grid grid-cols-3 gap-2">
                {debuffSkills.map((skill) => {
                  const canCast = canUseSkill(skill.baseCost?.mp ?? 0) && !isSilenced;
                  return (
                    <SkillButton
                      key={skill.id}
                      skill={skill}
                      canCast={canCast}
                      disabled={disabled || !canCast}
                      onClick={() => onCastSkill(skill)}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {buffSkills.length === 0 && debuffSkills.length === 0 && (
            <div
              className="text-center py-4 font-mono text-sm"
              style={{ color: theme.colors.textMuted }}
            >
              배운 보조 스킬이 없습니다
            </div>
          )}
        </div>
      )}

      {/* 아이템 탭 */}
      {activeTab === "item" && (
        <div
          className="text-center py-4 font-mono text-sm"
          style={{ color: theme.colors.textMuted }}
        >
          🎒 아이템 기능 준비 중...
        </div>
      )}

      {/* 도주 버튼 */}
      <button
        onClick={onFlee}
        disabled={disabled}
        className="w-full py-2 font-mono text-sm transition-colors"
        style={{
          background: theme.colors.bgDark,
          border: `1px solid ${theme.colors.border}`,
          color: theme.colors.textMuted,
          opacity: disabled ? 0.5 : 1,
          cursor: disabled ? "not-allowed" : "pointer",
        }}
      >
        🏃 도주 (50%)
      </button>
    </div>
  );
}

// 스킬 버튼 컴포넌트
interface SkillButtonProps {
  skill: Ability;
  proficiency?: number;
  canCast: boolean;
  disabled: boolean;
  onClick: () => void;
}

function SkillButton({
  skill,
  proficiency,
  canCast,
  disabled,
  onClick,
}: SkillButtonProps) {
  const { theme } = useThemeStore();

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex flex-col items-center gap-0.5 py-2 px-1 transition-colors font-mono text-sm"
      style={{
        background: canCast ? theme.colors.bgLight : theme.colors.bgDark,
        border: `1px solid ${canCast ? theme.colors.border : theme.colors.borderDim}`,
        color: canCast ? theme.colors.text : theme.colors.textMuted,
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
      }}
      title={skill.description.ko}
    >
      <span className="text-lg">{skill.icon}</span>
      <span className="text-xs truncate w-full text-center">{skill.nameKo}</span>
      <span
        className="text-[10px]"
        style={{
          color: canCast ? theme.colors.primary : theme.colors.error,
        }}
      >
        MP {skill.baseCost?.mp ?? 0}
      </span>
      {proficiency !== undefined && proficiency > 0 && (
        <span className="text-[10px]" style={{ color: theme.colors.textMuted }}>
          Lv.{proficiency}
        </span>
      )}
    </button>
  );
}
