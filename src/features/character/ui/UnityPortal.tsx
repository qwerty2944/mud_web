"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { createPortal } from "react-dom";
import { Unity } from "react-unity-webgl";
import { useUnityBridge } from "../model";

// Portal 타겟 컨텍스트
const UnityPortalContext = createContext<{
  setPortalTarget: (el: HTMLElement | null) => void;
} | null>(null);

/**
 * Unity 캔버스를 관리하는 Provider
 * Layout에 배치하면 Unity가 로드되고, 자식 페이지에서 UnityPortalTarget으로 표시 위치 지정
 */
export function UnityPortalProvider({ children }: { children: ReactNode }) {
  const { unityProvider, isLoaded, loadingProgression } = useUnityBridge();
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);

  const unityElement = (
    <div className="w-full h-full">
      {!isLoaded ? (
        <div className="w-full h-full flex items-center justify-center bg-gray-800">
          <div className="text-center text-gray-400">
            <p className="mb-2">캐릭터 로딩 중... {Math.round(loadingProgression * 100)}%</p>
            <div className="w-32 h-2 bg-gray-700 rounded mx-auto">
              <div
                className="h-full bg-blue-500 rounded transition-all"
                style={{ width: `${loadingProgression * 100}%` }}
              />
            </div>
          </div>
        </div>
      ) : (
        <Unity
          unityProvider={unityProvider}
          style={{
            width: "100%",
            height: "100%",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          }}
        />
      )}
    </div>
  );

  return (
    <UnityPortalContext.Provider value={{ setPortalTarget }}>
      {children}
      {/* Portal 타겟이 있으면 거기로, 없으면 숨김 */}
      {portalTarget ? (
        createPortal(unityElement, portalTarget)
      ) : (
        <div className="fixed -left-[9999px] w-1 h-1 overflow-hidden">
          {unityElement}
        </div>
      )}
    </UnityPortalContext.Provider>
  );
}

/**
 * Unity 캔버스가 렌더링될 위치를 지정하는 컴포넌트
 */
export function UnityPortalTarget({ className }: { className?: string }) {
  const context = useContext(UnityPortalContext);
  const [containerRef, setContainerRef] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (context && containerRef) {
      context.setPortalTarget(containerRef);
      return () => context.setPortalTarget(null);
    }
  }, [context, containerRef]);

  return <div ref={setContainerRef} className={className} />;
}
