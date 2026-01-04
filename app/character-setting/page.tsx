"use client";

import { useEffect, useState } from "react";
import { Unity, useUnityContext } from "react-unity-webgl";
import { useCharacterStore } from "@/stores/character";

const UNITY_OBJECT_NAME = "SPUM_20260103203421028";

export default function CharacterSettingPage() {
  const [selectedColor, setSelectedColor] = useState("#FF0000");

  const {
    spriteCounts,
    characterState,
    animationState,
    animationCounts,
    setUnityLoaded,
    setSendMessage,
    setSpriteCounts,
    setCharacterState,
    setAnimationState,
    setAnimationCounts,
    nextBody,
    prevBody,
    nextEye,
    prevEye,
    nextHair,
    prevHair,
    nextCloth,
    prevCloth,
    nextArmor,
    prevArmor,
    nextPant,
    prevPant,
    nextHelmet,
    prevHelmet,
    nextBack,
    prevBack,
    setHairColor,
    setClothColor,
    setBodyColor,
    setArmorColor,
    nextAnimation,
    prevAnimation,
    changeAnimationState,
    randomize,
    clearAll,
    resetColors,
  } = useCharacterStore();

  const { unityProvider, sendMessage, isLoaded, loadingProgression } = useUnityContext({
    loaderUrl: "/unity/characterbuilder.loader.js",
    dataUrl: "/unity/characterbuilder.data.br",
    frameworkUrl: "/unity/characterbuilder.framework.js.br",
    codeUrl: "/unity/characterbuilder.wasm.br",
    webglContextAttributes: {
      alpha: true,
      premultipliedAlpha: false,
    },
  });

  // Unity 로드 상태 동기화
  useEffect(() => {
    if (isLoaded) {
      setUnityLoaded(true);
      setSendMessage(sendMessage, UNITY_OBJECT_NAME);
    }
  }, [isLoaded, sendMessage, setUnityLoaded, setSendMessage]);

  // Unity 이벤트 리스너
  useEffect(() => {
    const handleCharacterChanged = (e: CustomEvent) => setCharacterState(e.detail);
    const handleSpritesLoaded = (e: CustomEvent) => setSpriteCounts(e.detail);
    const handleAnimationsLoaded = (e: CustomEvent) => setAnimationCounts(e.detail);
    const handleAnimationChanged = (e: CustomEvent) => setAnimationState(e.detail);

    window.addEventListener("unityCharacterChanged", handleCharacterChanged as EventListener);
    window.addEventListener("unitySpritesLoaded", handleSpritesLoaded as EventListener);
    window.addEventListener("unityAnimationsLoaded", handleAnimationsLoaded as EventListener);
    window.addEventListener("unityAnimationChanged", handleAnimationChanged as EventListener);

    return () => {
      window.removeEventListener("unityCharacterChanged", handleCharacterChanged as EventListener);
      window.removeEventListener("unitySpritesLoaded", handleSpritesLoaded as EventListener);
      window.removeEventListener("unityAnimationsLoaded", handleAnimationsLoaded as EventListener);
      window.removeEventListener("unityAnimationChanged", handleAnimationChanged as EventListener);
    };
  }, [setCharacterState, setSpriteCounts, setAnimationCounts, setAnimationState]);

  return (
    <div className="h-dvh w-full bg-gray-900 text-white flex flex-col overflow-hidden">
      {/* 로딩 오버레이 */}
      {!isLoaded && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-gray-900">
          <div className="text-center">
            <p className="mb-2">로딩 중... {Math.round(loadingProgression * 100)}%</p>
            <div className="w-48 h-2 bg-gray-700 rounded">
              <div
                className="h-full bg-blue-500 rounded transition-all"
                style={{ width: `${loadingProgression * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* 헤더 */}
      <header className="flex-none p-3 border-b border-gray-700 safe-area-top">
        <h1 className="text-lg font-bold text-center">캐릭터 설정</h1>
      </header>

      {/* 메인 컨텐츠 */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0">
        {/* Unity 캔버스 */}
        <div className="flex-1 min-h-0 flex items-center justify-center p-2">
          <div
            className="w-full h-full max-w-lg rounded-lg overflow-hidden"
            style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}
          >
            <Unity
              unityProvider={unityProvider}
              devicePixelRatio={typeof window !== "undefined" ? window.devicePixelRatio : 1}
              style={{ width: "100%", height: "100%", background: "transparent" }}
            />
          </div>
        </div>

        {/* 컨트롤 패널 */}
        <div className="flex-none lg:w-80 max-h-[45vh] lg:max-h-full overflow-y-auto p-3 space-y-3 bg-gray-800 safe-area-bottom">
          {/* 파츠 */}
          <section>
            <h2 className="text-sm font-semibold mb-2 text-gray-400">파츠</h2>
            <div className="space-y-1">
              <PartRow label="종족" onPrev={prevBody} onNext={nextBody}
                current={characterState?.bodyIndex ?? 0} total={spriteCounts?.bodyCount ?? 0} />
              <PartRow label="눈" onPrev={prevEye} onNext={nextEye}
                current={characterState?.eyeIndex ?? 0} total={spriteCounts?.eyeCount ?? 0} />
              <PartRow label="머리" onPrev={prevHair} onNext={nextHair}
                current={characterState?.hairIndex ?? -1} total={spriteCounts?.hairCount ?? 0} />
              <PartRow label="옷" onPrev={prevCloth} onNext={nextCloth}
                current={characterState?.clothIndex ?? -1} total={spriteCounts?.clothCount ?? 0} />
              <PartRow label="갑옷" onPrev={prevArmor} onNext={nextArmor}
                current={characterState?.armorIndex ?? -1} total={spriteCounts?.armorCount ?? 0} />
              <PartRow label="바지" onPrev={prevPant} onNext={nextPant}
                current={characterState?.pantIndex ?? -1} total={spriteCounts?.pantCount ?? 0} />
              <PartRow label="투구" onPrev={prevHelmet} onNext={nextHelmet}
                current={characterState?.helmetIndex ?? -1} total={spriteCounts?.helmetCount ?? 0} />
              <PartRow label="등" onPrev={prevBack} onNext={nextBack}
                current={characterState?.backIndex ?? -1} total={spriteCounts?.backCount ?? 0} />
            </div>
          </section>

          {/* 색상 */}
          <section>
            <h2 className="text-sm font-semibold mb-2 text-gray-400">색상</h2>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={selectedColor}
                onChange={(e) => setSelectedColor(e.target.value)}
                className="w-10 h-8 rounded cursor-pointer"
              />
              <div className="flex-1 grid grid-cols-4 gap-1">
                <button onClick={() => setHairColor(selectedColor)} className="btn-sm">머리</button>
                <button onClick={() => setClothColor(selectedColor)} className="btn-sm">옷</button>
                <button onClick={() => setBodyColor(selectedColor)} className="btn-sm">피부</button>
                <button onClick={() => setArmorColor(selectedColor)} className="btn-sm">갑옷</button>
              </div>
            </div>
          </section>

          {/* 애니메이션 */}
          <section>
            <h2 className="text-sm font-semibold mb-2 text-gray-400">애니메이션</h2>
            {animationCounts?.states && (
              <div className="flex flex-wrap gap-1 mb-2">
                {animationCounts.states.map((state) => (
                  <button
                    key={state}
                    onClick={() => changeAnimationState(state)}
                    className={`px-2 py-1 text-xs rounded ${
                      animationState?.currentState === state ? "bg-blue-600" : "bg-gray-700"
                    }`}
                  >
                    {state}
                  </button>
                ))}
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">클립</span>
              <div className="flex items-center gap-2">
                <button onClick={prevAnimation} className="btn-icon">&lt;</button>
                <span className="text-xs w-12 text-center">
                  {(animationState?.currentIndex ?? 0) + 1}/{animationState?.totalInState ?? 0}
                </span>
                <button onClick={nextAnimation} className="btn-icon">&gt;</button>
              </div>
            </div>
          </section>

          {/* 액션 */}
          <section>
            <div className="grid grid-cols-3 gap-2">
              <button onClick={randomize} className="btn-action bg-purple-600">랜덤</button>
              <button onClick={clearAll} className="btn-action bg-red-600">초기화</button>
              <button onClick={resetColors} className="btn-action bg-gray-600">색초기화</button>
            </div>
          </section>
        </div>
      </div>

      <style jsx global>{`
        .btn-sm {
          padding: 0.25rem 0.5rem;
          background: #374151;
          border-radius: 0.25rem;
          font-size: 0.75rem;
          transition: background-color 0.2s;
        }
        .btn-sm:active { background: #4b5563; }
        .btn-icon {
          width: 1.75rem;
          height: 1.75rem;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #374151;
          border-radius: 0.25rem;
          font-size: 0.875rem;
        }
        .btn-icon:active { background: #4b5563; }
        .btn-action {
          padding: 0.5rem;
          border-radius: 0.25rem;
          font-size: 0.75rem;
          font-weight: 500;
        }
        .safe-area-top { padding-top: env(safe-area-inset-top); }
        .safe-area-bottom { padding-bottom: env(safe-area-inset-bottom); }
      `}</style>
    </div>
  );
}

function PartRow({
  label,
  onPrev,
  onNext,
  current,
  total,
}: {
  label: string;
  onPrev: () => void;
  onNext: () => void;
  current: number;
  total: number;
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="w-12 text-gray-400">{label}</span>
      <div className="flex items-center gap-1">
        <button onClick={onPrev} className="btn-icon">&lt;</button>
        <span className="w-14 text-center text-xs">
          {current >= 0 ? current + 1 : "-"}/{total}
        </span>
        <button onClick={onNext} className="btn-icon">&gt;</button>
      </div>
    </div>
  );
}
