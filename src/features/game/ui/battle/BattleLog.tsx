"use client";

import { useEffect, useRef } from "react";
import { useThemeStore } from "@/shared/config";
import { useBattleStore } from "@/application/stores";

export function BattleLog() {
  const { theme } = useThemeStore();
  const { battle } = useBattleStore();
  const logRef = useRef<HTMLDivElement>(null);

  // 로그 자동 스크롤
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [battle.battleLog]);

  const getLogColor = (
    actor: "player" | "monster" | "system",
    action: string
  ): string => {
    // 결과 관련
    if (action === "victory") return theme.colors.success;
    if (action === "defeat") return theme.colors.error;
    if (action === "flee") return theme.colors.warning;

    // 상태이상 관련
    if (action === "buff" || action === "hot" || action === "heal")
      return theme.colors.success;
    if (action === "debuff" || action === "dot") return theme.colors.error;
    if (action === "buff_expire" || action === "debuff_expire")
      return theme.colors.textMuted;
    if (action === "shield_absorb") return theme.colors.primary;

    // 시스템 메시지
    if (actor === "system") return theme.colors.textDim;

    // 공격 관련
    if (actor === "player") return theme.colors.primary;
    if (actor === "monster") return theme.colors.error;

    return theme.colors.text;
  };

  return (
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
          style={{
            color: getLogColor(log.actor, log.action),
          }}
        >
          {log.message}
        </div>
      ))}
    </div>
  );
}
