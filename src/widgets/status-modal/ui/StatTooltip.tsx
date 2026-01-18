"use client";

import { useState, useRef, useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useThemeStore } from "@/application/stores";

interface StatTooltipProps {
  children: ReactNode;
  content: ReactNode;
  position?: "top" | "bottom" | "left" | "right";
}

export function StatTooltip({
  children,
  content,
  position = "top",
}: StatTooltipProps) {
  const [show, setShow] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const { theme } = useThemeStore();

  useEffect(() => {
    if (show && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const tooltipWidth = 200;
      const tooltipHeight = 100;

      let top = 0;
      let left = 0;

      switch (position) {
        case "top":
          top = rect.top - tooltipHeight - 8;
          left = rect.left + rect.width / 2 - tooltipWidth / 2;
          break;
        case "bottom":
          top = rect.bottom + 8;
          left = rect.left + rect.width / 2 - tooltipWidth / 2;
          break;
        case "left":
          top = rect.top + rect.height / 2 - tooltipHeight / 2;
          left = rect.left - tooltipWidth - 8;
          break;
        case "right":
          top = rect.top + rect.height / 2 - tooltipHeight / 2;
          left = rect.right + 8;
          break;
      }

      // 뷰포트 경계 체크 - 상단 넘어가면 아래로
      if (top < 8) {
        top = rect.bottom + 8;
      }
      // 좌측 경계
      if (left < 8) {
        left = 8;
      }
      // 우측 경계
      if (left + tooltipWidth > window.innerWidth - 8) {
        left = window.innerWidth - tooltipWidth - 8;
      }
      // 하단 경계
      if (top + tooltipHeight > window.innerHeight - 8) {
        top = rect.top - tooltipHeight - 8;
      }

      setCoords({ top, left });
    }
  }, [show, position]);

  return (
    <div
      ref={triggerRef}
      className="relative inline-block"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      <div className="cursor-help">{children}</div>
      {show &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="fixed z-[100] p-2 min-w-[160px] max-w-[240px] pointer-events-none"
            style={{
              top: coords.top,
              left: coords.left,
              background: theme.colors.bgLight,
              border: `1px solid ${theme.colors.border}`,
              boxShadow: `0 4px 12px rgba(0,0,0,0.5), 0 0 0 1px ${theme.colors.primary}20`,
            }}
          >
            <div
              className="text-xs font-mono"
              style={{ color: theme.colors.text }}
            >
              {content}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
