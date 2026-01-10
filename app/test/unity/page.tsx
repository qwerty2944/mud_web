"use client";

import { useEffect } from "react";
import Link from "next/link";
import { characterPanelHooks, useAppearanceStore } from "@/features/character";
import { CharacterView } from "@/widgets/character-view";
import { globalStyles } from "@/shared/ui";

export default function UnityTestPage() {
  const { clearAll } = useAppearanceStore();

  // 페이지 진입 시 Unity 상태 초기화
  useEffect(() => {
    clearAll();
  }, [clearAll]);

  return (
    <div className="h-dvh w-full bg-gray-900 text-white flex flex-col overflow-hidden">
      {/* 헤더 */}
      <header className="flex-none p-3 border-b border-gray-700 safe-area-top flex items-center justify-between relative z-50">
        <h1 className="text-lg font-bold">유니티 테스트</h1>
        <Link
          href="/test"
          className="text-sm text-gray-400 hover:text-white px-3 py-2"
        >
          ← 목록
        </Link>
      </header>

      {/* 메인 컨텐츠 */}
      <div className="flex-1 min-h-0 safe-area-bottom">
        <CharacterView
          hooks={characterPanelHooks}
          showPanel={true}
          allowToggle={true}
        />
      </div>

      <style jsx global>{globalStyles}</style>
    </div>
  );
}
