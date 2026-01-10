"use client";

import Link from "next/link";
import { characterPanelHooks } from "@/features/character";
import { CharacterView } from "@/widgets/character-view";
import { globalStyles } from "@/shared/ui";

export default function UnityTestPage() {
  return (
    <div className="h-dvh w-full bg-gray-900 text-white flex flex-col overflow-hidden">
      {/* 헤더 */}
      <header className="flex-none p-3 border-b border-gray-700 safe-area-top flex items-center justify-between">
        <h1 className="text-lg font-bold">유니티 테스트</h1>
        <Link
          href="/test"
          className="text-sm text-gray-400 hover:text-white"
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
