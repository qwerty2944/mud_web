"use client";

import { useThemeStore } from "@/shared/config";
import type { SkillCategory } from "@/entities/skill";
import { SKILL_CATEGORIES } from "@/entities/skill";

interface ActionTabsProps {
  activeTab: SkillCategory;
  onTabChange: (tab: SkillCategory) => void;
  disabled?: boolean;
}

const TAB_ORDER: SkillCategory[] = ["weapon", "magic", "support", "item"];

export function ActionTabs({
  activeTab,
  onTabChange,
  disabled = false,
}: ActionTabsProps) {
  const { theme } = useThemeStore();

  return (
    <div
      className="flex border-b"
      style={{ borderColor: theme.colors.border }}
    >
      {TAB_ORDER.map((tab) => {
        const isActive = activeTab === tab;
        const { nameKo, icon } = SKILL_CATEGORIES[tab];

        return (
          <button
            key={tab}
            onClick={() => !disabled && onTabChange(tab)}
            disabled={disabled}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 font-mono text-sm transition-colors ${
              disabled ? "opacity-50 cursor-not-allowed" : ""
            }`}
            style={{
              background: isActive ? theme.colors.bg : theme.colors.bgDark,
              color: isActive ? theme.colors.primary : theme.colors.textMuted,
              borderBottom: isActive
                ? `2px solid ${theme.colors.primary}`
                : "2px solid transparent",
            }}
          >
            <span>{icon}</span>
            <span className="hidden sm:inline">{nameKo}</span>
          </button>
        );
      })}
    </div>
  );
}
