"use client";

import { createContext, useContext, useEffect, ReactNode } from "react";
import { useUnityContext } from "react-unity-webgl";
import { useAppearanceStore, type SpriteNames } from "@/application/stores";

const UNITY_OBJECT_NAME = "SPUM_20260103203421028";

interface UnityContextValue {
  unityProvider: ReturnType<typeof useUnityContext>["unityProvider"];
  isLoaded: boolean;
  loadingProgression: number;
}

const UnityCtx = createContext<UnityContextValue | null>(null);

export function UnityProvider({ children }: { children: ReactNode }) {
  const {
    setUnityLoaded,
    setSendMessage,
    setSpriteCounts,
    setSpriteNames,
    setCharacterState,
    setAnimationState,
    setAnimationCounts,
  } = useAppearanceStore();

  const { unityProvider, sendMessage, isLoaded, loadingProgression } = useUnityContext({
    loaderUrl: "/unity/characterbuilder.loader.js",
    dataUrl: "/unity/characterbuilder.data",
    frameworkUrl: "/unity/characterbuilder.framework.js",
    codeUrl: "/unity/characterbuilder.wasm",
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
    const handleSpritesLoaded = async (e: CustomEvent) => {
      const unityData = e.detail;
      // counts 설정
      setSpriteCounts(unityData);

      // Unity에서 일부 이름만 보내므로 all-sprites.json에서 나머지 로드
      try {
        const res = await fetch("/data/character/all-sprites.json");
        const jsonData = await res.json();

        // Unity 데이터 우선, 없으면 JSON 폴백
        const names: SpriteNames = {
          bodyNames: unityData.bodyNames?.length ? unityData.bodyNames : (jsonData.bodyNames || []),
          eyeNames: unityData.eyeNames?.length ? unityData.eyeNames : (jsonData.eyeNames || []),
          hairNames: unityData.hairNames?.length ? unityData.hairNames : (jsonData.hairNames || []),
          facehairNames: unityData.facehairNames?.length ? unityData.facehairNames : (jsonData.facehairNames || []),
          clothNames: unityData.clothNames?.length ? unityData.clothNames : (jsonData.clothNames || []),
          armorNames: unityData.armorNames?.length ? unityData.armorNames : (jsonData.armorNames || []),
          // Unity에서 안 보내는 것들은 JSON에서
          pantNames: jsonData.pantNames || [],
          helmetNames: jsonData.helmetNames || [],
          backNames: jsonData.backNames || [],
          swordNames: jsonData.swordNames || [],
          shieldNames: jsonData.shieldNames || [],
          axeNames: jsonData.axeNames || [],
          bowNames: jsonData.bowNames || [],
          wandNames: jsonData.wandNames || [],
        };
        setSpriteNames(names);
      } catch (err) {
        console.error("Failed to load sprite names:", err);
      }
    };
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
  }, [setCharacterState, setSpriteCounts, setAnimationCounts, setAnimationState, setSpriteNames]);

  return (
    <UnityCtx.Provider value={{ unityProvider, isLoaded, loadingProgression }}>
      {children}
    </UnityCtx.Provider>
  );
}

export function useUnityBridge(): UnityContextValue {
  const context = useContext(UnityCtx);

  // Context 없이 사용하는 경우 (fallback)
  if (!context) {
    console.warn("useUnityBridge called outside UnityProvider");
    return {
      unityProvider: null as unknown as UnityContextValue["unityProvider"],
      isLoaded: false,
      loadingProgression: 0,
    };
  }

  return context;
}
