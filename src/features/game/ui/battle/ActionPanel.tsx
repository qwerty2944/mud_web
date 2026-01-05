"use client";

import { useThemeStore } from "@/shared/config";
import { useBattleStore } from "@/application/stores";
import type { SkillCategory, Skill } from "@/entities/skill";
import type { ProficiencyType } from "@/entities/proficiency";
import { useMagicAttackSkills, useBuffSkills, useDebuffSkills } from "@/entities/skill";

interface ActionPanelProps {
  activeTab: SkillCategory;
  proficiencies: Record<ProficiencyType, number>;
  onWeaponAttack: (weaponType: ProficiencyType) => void;
  onCastSkill: (skill: Skill) => void;
  onFlee: () => void;
  disabled?: boolean;
}

// 무기 버튼 정의
const WEAPON_BUTTONS: { type: ProficiencyType; icon: string; label: string }[] = [
  { type: "sword", icon: "⚔️", label: "검" },
  { type: "axe", icon: "🪓", label: "도끼" },
  { type: "mace", icon: "🔨", label: "둔기" },
  { type: "dagger", icon: "🗡️", label: "단검" },
  { type: "spear", icon: "🔱", label: "창" },
  { type: "bow", icon: "🏹", label: "활" },
  { type: "crossbow", icon: "🎯", label: "석궁" },
  { type: "staff", icon: "🪄", label: "지팡이" },
];

export function ActionPanel({
  activeTab,
  proficiencies,
  onWeaponAttack,
  onCastSkill,
  onFlee,
  disabled = false,
}: ActionPanelProps) {
  const { theme } = useThemeStore();
  const { canUseSkill, isPlayerSilenced } = useBattleStore();

  // 스킬 데이터 로드
  const { data: magicSkills = [] } = useMagicAttackSkills();
  const { data: buffSkills = [] } = useBuffSkills();
  const { data: debuffSkills = [] } = useDebuffSkills();

  const isSilenced = isPlayerSilenced();

  return (
    <div className="p-3 space-y-3">
      {/* 무기 탭 */}
      {activeTab === "weapon" && (
        <div className="grid grid-cols-4 gap-2">
          {WEAPON_BUTTONS.map(({ type, icon, label }) => (
            <button
              key={type}
              onClick={() => onWeaponAttack(type)}
              disabled={disabled}
              className="flex flex-col items-center gap-1 py-2 px-1 transition-colors font-mono text-sm"
              style={{
                background: theme.colors.bgLight,
                border: `1px solid ${theme.colors.border}`,
                color: theme.colors.text,
                opacity: disabled ? 0.5 : 1,
                cursor: disabled ? "not-allowed" : "pointer",
              }}
            >
              <span className="text-lg">{icon}</span>
              <span className="text-xs">{label}</span>
              <span className="text-xs" style={{ color: theme.colors.textMuted }}>
                Lv.{proficiencies[type] || 0}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* 마법 탭 */}
      {activeTab === "magic" && (
        <div className="space-y-2">
          {isSilenced && (
            <div
              className="text-center py-2 font-mono text-sm"
              style={{ color: theme.colors.error }}
            >
              🤐 침묵 상태 - 마법 사용 불가
            </div>
          )}
          <div className="grid grid-cols-3 gap-2">
            {magicSkills.map((skill) => {
              const canCast = canUseSkill(skill.mpCost) && !isSilenced;
              return (
                <SkillButton
                  key={skill.id}
                  skill={skill}
                  proficiency={proficiencies[skill.proficiencyType as ProficiencyType] || 0}
                  canCast={canCast}
                  disabled={disabled || !canCast}
                  onClick={() => onCastSkill(skill)}
                />
              );
            })}
          </div>
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
          <div>
            <div
              className="text-xs font-mono mb-1"
              style={{ color: theme.colors.textMuted }}
            >
              💚 버프
            </div>
            <div className="grid grid-cols-3 gap-2">
              {buffSkills.map((skill) => {
                const canCast = canUseSkill(skill.mpCost) && !isSilenced;
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
          {/* 디버프 */}
          <div>
            <div
              className="text-xs font-mono mb-1"
              style={{ color: theme.colors.textMuted }}
            >
              ☠️ 디버프
            </div>
            <div className="grid grid-cols-3 gap-2">
              {debuffSkills.map((skill) => {
                const canCast = canUseSkill(skill.mpCost) && !isSilenced;
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
  skill: Skill;
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
      title={skill.description}
    >
      <span className="text-lg">{skill.icon}</span>
      <span className="text-xs truncate w-full text-center">{skill.nameKo}</span>
      <span
        className="text-[10px]"
        style={{
          color: canCast ? theme.colors.primary : theme.colors.error,
        }}
      >
        MP {skill.mpCost}
      </span>
      {proficiency !== undefined && (
        <span className="text-[10px]" style={{ color: theme.colors.textMuted }}>
          Lv.{proficiency}
        </span>
      )}
    </button>
  );
}
