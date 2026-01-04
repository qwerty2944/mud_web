"use client";

import {
  UnityCanvas,
  PartSelector,
  ColorPicker,
  AnimationSelector,
  ActionButtons,
  PART_TYPES,
} from "@/features/character";
import { globalStyles } from "@/shared/ui";

export default function CharacterSettingPage() {
  return (
    <div className="h-dvh w-full bg-gray-900 text-white flex flex-col overflow-hidden">
      {/* 헤더 */}
      <header className="flex-none p-3 border-b border-gray-700 safe-area-top">
        <h1 className="text-lg font-bold text-center">캐릭터 설정</h1>
      </header>

      {/* 메인 컨텐츠 */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0">
        {/* Unity 캔버스 */}
        <div className="flex-1 min-h-0 flex items-center justify-center p-2">
          <div className="w-full h-full max-w-lg">
            <UnityCanvas />
          </div>
        </div>

        {/* 컨트롤 패널 */}
        <div className="flex-none lg:w-80 max-h-[45vh] lg:max-h-full overflow-y-auto p-3 space-y-3 bg-gray-800 safe-area-bottom">
          {/* 파츠 */}
          <Section title="파츠">
            <div className="space-y-1">
              {PART_TYPES.map((type) => (
                <PartSelector key={type} type={type} />
              ))}
            </div>
          </Section>

          {/* 색상 */}
          <Section title="색상">
            <ColorPicker />
          </Section>

          {/* 애니메이션 */}
          <Section title="애니메이션">
            <AnimationSelector />
          </Section>

          {/* 액션 */}
          <Section title="">
            <ActionButtons />
          </Section>
        </div>
      </div>

      <style jsx global>{globalStyles}</style>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      {title && <h2 className="text-sm font-semibold mb-2 text-gray-400">{title}</h2>}
      {children}
    </section>
  );
}
