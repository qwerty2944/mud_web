"use client";

import { useState, useEffect, type ReactNode } from "react";
import * as Collapsible from "@radix-ui/react-collapsible";
import { useThemeStore } from "@/shared/config";

interface CollapsibleSectionProps {
  /** 고유 ID (localStorage 키로 사용) */
  id: string;
  /** 섹션 제목 */
  title: string;
  /** 아이콘 (선택) */
  icon?: string;
  /** 기본 열림 상태 */
  defaultOpen?: boolean;
  /** 헤더 우측에 표시할 추가 정보 */
  badge?: ReactNode;
  /** 자식 요소 */
  children: ReactNode;
  /** 추가 클래스 */
  className?: string;
}

const STORAGE_KEY_PREFIX = "collapsible_";

/**
 * 접을 수 있는 섹션 컴포넌트
 * - localStorage로 열림/닫힘 상태 유지
 * - shadcn/radix 스타일
 */
export function CollapsibleSection({
  id,
  title,
  icon,
  defaultOpen = true,
  badge,
  children,
  className = "",
}: CollapsibleSectionProps) {
  const { theme } = useThemeStore();
  const storageKey = `${STORAGE_KEY_PREFIX}${id}`;

  // localStorage에서 초기 상태 로드
  const [isOpen, setIsOpen] = useState(() => {
    if (typeof window === "undefined") return defaultOpen;
    const stored = localStorage.getItem(storageKey);
    return stored !== null ? stored === "true" : defaultOpen;
  });

  // 상태 변경 시 localStorage에 저장
  useEffect(() => {
    localStorage.setItem(storageKey, String(isOpen));
  }, [isOpen, storageKey]);

  return (
    <Collapsible.Root open={isOpen} onOpenChange={setIsOpen} className={className}>
      <Collapsible.Trigger asChild>
        <button
          className="w-full flex items-center justify-between px-3 py-2 text-sm font-mono transition-colors"
          style={{
            background: theme.colors.bgLight,
            border: `1px solid ${theme.colors.border}`,
            color: theme.colors.text,
            borderRadius: isOpen ? "4px 4px 0 0" : "4px",
          }}
        >
          <div className="flex items-center gap-2">
            {icon && <span className="text-base">{icon}</span>}
            <span className="font-medium">{title}</span>
            {badge}
          </div>
          <svg
            className="transition-transform duration-200"
            style={{
              transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
              color: theme.colors.textMuted,
            }}
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M4 6L8 10L12 6"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </Collapsible.Trigger>

      <Collapsible.Content
        className="overflow-hidden data-[state=open]:animate-slideDown data-[state=closed]:animate-slideUp"
        style={{
          background: theme.colors.bgDark,
          border: `1px solid ${theme.colors.border}`,
          borderTop: "none",
          borderRadius: "0 0 4px 4px",
        }}
      >
        <div className="p-2">{children}</div>
      </Collapsible.Content>

      <style jsx global>{`
        @keyframes slideDown {
          from {
            height: 0;
            opacity: 0;
          }
          to {
            height: var(--radix-collapsible-content-height);
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            height: var(--radix-collapsible-content-height);
            opacity: 1;
          }
          to {
            height: 0;
            opacity: 0;
          }
        }

        [data-state="open"] {
          animation: slideDown 200ms ease-out;
        }

        [data-state="closed"] {
          animation: slideUp 200ms ease-out;
        }
      `}</style>
    </Collapsible.Root>
  );
}
