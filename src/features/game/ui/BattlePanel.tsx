"use client";

import { useEffect, useRef } from "react";
import { useBattleStore } from "@/application/stores";
import { useThemeStore } from "@/shared/config";
import type { CharacterStats } from "@/entities/character";
import type { ProficiencyType } from "@/entities/proficiency";

interface BattlePanelProps {
  characterStats: CharacterStats;
  proficiencies: Record<ProficiencyType, number>;
  onAttack: (weaponType: ProficiencyType) => void;
  onFlee: () => void;
  onVictory: () => void;
  onDefeat: () => void;
}

export function BattlePanel({
  characterStats,
  proficiencies,
  onAttack,
  onFlee,
  onVictory,
  onDefeat,
}: BattlePanelProps) {
  const { theme } = useThemeStore();
  const { battle, getMonsterHpPercent, getPlayerHpPercent, playerFlee, resetBattle } =
    useBattleStore();
  const logRef = useRef<HTMLDivElement>(null);

  // 로그 자동 스크롤
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [battle.battleLog]);

  // 전투 결과 처리
  useEffect(() => {
    if (battle.result === "victory") {
      const timer = setTimeout(onVictory, 1500);
      return () => clearTimeout(timer);
    } else if (battle.result === "defeat") {
      const timer = setTimeout(onDefeat, 1500);
      return () => clearTimeout(timer);
    } else if (battle.result === "fled") {
      const timer = setTimeout(() => resetBattle(), 1500);
      return () => clearTimeout(timer);
    }
  }, [battle.result, onVictory, onDefeat, resetBattle]);

  if (!battle.isInBattle || !battle.monster) return null;

  const monsterHpPercent = getMonsterHpPercent();
  const playerHpPercent = getPlayerHpPercent();
  const isOngoing = battle.result === "ongoing";

  // 사용 가능한 무기 (숙련도 기반)
  const weaponButtons: { type: ProficiencyType; icon: string; label: string }[] = [
    { type: "sword", icon: "⚔️", label: "검" },
    { type: "axe", icon: "🪓", label: "도끼" },
    { type: "bow", icon: "🏹", label: "활" },
    { type: "staff", icon: "🪄", label: "지팡이" },
  ];

  const handleFlee = () => {
    const success = playerFlee();
    if (success) {
      onFlee();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.8)" }}
    >
      <div
        className="w-full max-w-lg overflow-hidden"
        style={{
          background: theme.colors.bg,
          border: `2px solid ${theme.colors.border}`,
        }}
      >
        {/* 헤더 */}
        <div
          className="px-4 py-3 border-b"
          style={{
            background: theme.colors.bgDark,
            borderColor: theme.colors.border,
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{battle.monster.icon}</span>
              <div>
                <h2 className="font-mono font-bold" style={{ color: theme.colors.text }}>
                  {battle.monster.nameKo}
                </h2>
                <span
                  className="text-xs font-mono"
                  style={{ color: theme.colors.textMuted }}
                >
                  Lv.{battle.monster.level}
                  {battle.monster.element && ` · ${getElementIcon(battle.monster.element)}`}
                </span>
              </div>
            </div>
            <div
              className="text-sm font-mono px-2 py-1"
              style={{
                background: theme.colors.bgLight,
                color: theme.colors.textMuted,
              }}
            >
              턴 {battle.turn}
            </div>
          </div>
        </div>

        {/* HP 바 영역 */}
        <div className="p-4 space-y-3">
          {/* 몬스터 HP */}
          <div>
            <div className="flex justify-between text-xs font-mono mb-1">
              <span style={{ color: theme.colors.error }}>
                {battle.monster.nameKo}
              </span>
              <span style={{ color: theme.colors.textMuted }}>
                {battle.monsterCurrentHp} / {battle.monster.stats.hp}
              </span>
            </div>
            <div
              className="h-4 overflow-hidden"
              style={{ background: theme.colors.bgDark }}
            >
              <div
                className="h-full transition-all duration-300"
                style={{
                  width: `${monsterHpPercent}%`,
                  background: theme.colors.error,
                }}
              />
            </div>
          </div>

          {/* 플레이어 HP */}
          <div>
            <div className="flex justify-between text-xs font-mono mb-1">
              <span style={{ color: theme.colors.success }}>나</span>
              <span style={{ color: theme.colors.textMuted }}>
                {battle.playerCurrentHp} / {battle.playerMaxHp}
              </span>
            </div>
            <div
              className="h-4 overflow-hidden"
              style={{ background: theme.colors.bgDark }}
            >
              <div
                className="h-full transition-all duration-300"
                style={{
                  width: `${playerHpPercent}%`,
                  background:
                    playerHpPercent > 50
                      ? theme.colors.success
                      : playerHpPercent > 20
                      ? theme.colors.warning
                      : theme.colors.error,
                }}
              />
            </div>
          </div>
        </div>

        {/* 전투 로그 */}
        <div
          ref={logRef}
          className="h-32 overflow-y-auto px-4 py-2 space-y-1 font-mono text-sm"
          style={{
            background: theme.colors.bgDark,
            borderTop: `1px solid ${theme.colors.border}`,
            borderBottom: `1px solid ${theme.colors.border}`,
          }}
        >
          {battle.battleLog.map((log, idx) => (
            <div
              key={idx}
              className={log.actor === "player" ? "" : ""}
              style={{
                color:
                  log.action === "victory"
                    ? theme.colors.success
                    : log.action === "defeat"
                    ? theme.colors.error
                    : log.actor === "player"
                    ? theme.colors.primary
                    : theme.colors.error,
              }}
            >
              {log.message}
            </div>
          ))}
        </div>

        {/* 액션 버튼 */}
        <div className="p-4">
          {isOngoing ? (
            <div className="space-y-3">
              {/* 공격 버튼들 */}
              <div className="grid grid-cols-4 gap-2">
                {weaponButtons.map(({ type, icon, label }) => (
                  <button
                    key={type}
                    onClick={() => onAttack(type)}
                    className="flex flex-col items-center gap-1 py-2 px-1 transition-colors font-mono text-sm"
                    style={{
                      background: theme.colors.bgLight,
                      border: `1px solid ${theme.colors.border}`,
                      color: theme.colors.text,
                    }}
                  >
                    <span className="text-lg">{icon}</span>
                    <span className="text-xs">{label}</span>
                    <span
                      className="text-xs"
                      style={{ color: theme.colors.textMuted }}
                    >
                      Lv.{proficiencies[type] || 0}
                    </span>
                  </button>
                ))}
              </div>

              {/* 도주 버튼 */}
              <button
                onClick={handleFlee}
                className="w-full py-2 font-mono text-sm transition-colors"
                style={{
                  background: theme.colors.bgDark,
                  border: `1px solid ${theme.colors.border}`,
                  color: theme.colors.textMuted,
                }}
              >
                🏃 도주 (50%)
              </button>
            </div>
          ) : (
            <div
              className="text-center py-4 font-mono"
              style={{
                color:
                  battle.result === "victory"
                    ? theme.colors.success
                    : battle.result === "defeat"
                    ? theme.colors.error
                    : theme.colors.textMuted,
              }}
            >
              {battle.result === "victory" && (
                <div>
                  <div className="text-2xl mb-2">🎉</div>
                  <div className="text-lg font-bold">승리!</div>
                  <div className="text-sm mt-1" style={{ color: theme.colors.textMuted }}>
                    +{battle.monster.rewards.exp} EXP
                    {battle.monster.rewards.gold > 0 &&
                      ` · +${battle.monster.rewards.gold} Gold`}
                  </div>
                </div>
              )}
              {battle.result === "defeat" && (
                <div>
                  <div className="text-2xl mb-2">💀</div>
                  <div className="text-lg font-bold">패배...</div>
                </div>
              )}
              {battle.result === "fled" && (
                <div>
                  <div className="text-2xl mb-2">🏃</div>
                  <div className="text-lg font-bold">도주 성공!</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function getElementIcon(element: string): string {
  const icons: Record<string, string> = {
    fire: "🔥",
    ice: "❄️",
    lightning: "⚡",
    earth: "🪨",
    holy: "✨",
    dark: "🌑",
  };
  return icons[element] || "";
}
