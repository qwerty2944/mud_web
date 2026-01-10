"use client";

import { useState, useEffect } from "react";
import { DynamicUnityCanvas, useAppearanceStore } from "@/features/character";

interface SpriteItem {
  id: string;
  index: number;
  sprite: string;
  ko: string;
  en?: string;
  style?: string;
  race?: string;
  type?: string;
}

interface AppearanceItem {
  index: number;
  ko: string;
  en?: string;
  race?: string;
  type?: string;
}

type CategoryData = {
  label: string;
  items: SpriteItem[] | AppearanceItem[];
  unityMethod: string;
  allowNone?: boolean;
  weaponType?: string;  // 무기 타입 (Sword, Axe 등)
  hand?: "left" | "right";  // 무기 손 위치
};

export default function EquipmentTestPage() {
  const { callUnity, characterState } = useAppearanceStore();
  const [categories, setCategories] = useState<Record<string, CategoryData>>({});
  const [loading, setLoading] = useState(true);

  // 매핑 데이터 로드
  useEffect(() => {
    async function loadMappings() {
      try {
        const [
          // 외형
          eyeRes,
          hairRes,
          facehairRes,
          bodyRes,
          // 무기
          swordRes,
          axeRes,
          bowRes,
          shieldRes,
          spearRes,
          wandRes,
          daggerRes,
          // 방어구
          helmetRes,
          armorRes,
          clothRes,
          pantRes,
          backRes,
        ] = await Promise.all([
          // 외형
          fetch("/data/sprites/appearance/eye.json"),
          fetch("/data/sprites/appearance/hair.json"),
          fetch("/data/sprites/appearance/facehair.json"),
          fetch("/data/sprites/appearance/body.json"),
          // 무기
          fetch("/data/sprites/equipment/weapons/sword.json"),
          fetch("/data/sprites/equipment/weapons/axe.json"),
          fetch("/data/sprites/equipment/weapons/bow.json"),
          fetch("/data/sprites/equipment/weapons/shield.json"),
          fetch("/data/sprites/equipment/weapons/spear.json"),
          fetch("/data/sprites/equipment/weapons/wand.json"),
          fetch("/data/sprites/equipment/weapons/dagger.json"),
          // 방어구
          fetch("/data/sprites/equipment/armor/helmet.json"),
          fetch("/data/sprites/equipment/armor/armor.json"),
          fetch("/data/sprites/equipment/armor/cloth.json"),
          fetch("/data/sprites/equipment/armor/pant.json"),
          fetch("/data/sprites/equipment/armor/back.json"),
        ]);

        const [
          eyeData,
          hairData,
          facehairData,
          bodyData,
          swordData,
          axeData,
          bowData,
          shieldData,
          spearData,
          wandData,
          daggerData,
          helmetData,
          armorData,
          clothData,
          pantData,
          backData,
        ] = await Promise.all([
          eyeRes.json(),
          hairRes.json(),
          facehairRes.json(),
          bodyRes.json(),
          swordRes.json(),
          axeRes.json(),
          bowRes.json(),
          shieldRes.json(),
          spearRes.json(),
          wandRes.json(),
          daggerRes.json(),
          helmetRes.json(),
          armorRes.json(),
          clothRes.json(),
          pantRes.json(),
          backRes.json(),
        ]);

        setCategories({
          // 외형
          body: { label: "신체", items: bodyData.bodies || [], unityMethod: "JS_SetBody" },
          eye: { label: "눈", items: eyeData.eyes || [], unityMethod: "JS_SetEye" },
          hair: { label: "머리", items: hairData.hairs || [], unityMethod: "JS_SetHair", allowNone: true },
          facehair: { label: "수염/장식", items: facehairData.facehairs || [], unityMethod: "JS_SetFacehair", allowNone: true },
          // 무기 (JS_SetRightWeapon/JS_SetLeftWeapon with "WeaponType,index" format)
          sword: { label: "검", items: swordData.swords || [], unityMethod: "JS_SetRightWeapon", allowNone: true, weaponType: "Sword", hand: "right" },
          axe: { label: "도끼", items: axeData.axes || [], unityMethod: "JS_SetRightWeapon", allowNone: true, weaponType: "Axe", hand: "right" },
          bow: { label: "활", items: bowData.bows || [], unityMethod: "JS_SetRightWeapon", allowNone: true, weaponType: "Bow", hand: "right" },
          shield: { label: "방패", items: shieldData.shields || [], unityMethod: "JS_SetLeftWeapon", allowNone: true, weaponType: "Shield", hand: "left" },
          spear: { label: "창", items: spearData.spears || [], unityMethod: "JS_SetRightWeapon", allowNone: true, weaponType: "Spear", hand: "right" },
          wand: { label: "지팡이", items: wandData.wands || [], unityMethod: "JS_SetRightWeapon", allowNone: true, weaponType: "Wand", hand: "right" },
          dagger: { label: "단검", items: daggerData.daggers || [], unityMethod: "JS_SetRightWeapon", allowNone: true, weaponType: "Dagger", hand: "right" },
          // 방어구
          helmet: { label: "투구", items: helmetData.helmets || [], unityMethod: "JS_SetHelmet", allowNone: true },
          armor: { label: "갑옷", items: armorData.armors || [], unityMethod: "JS_SetArmor", allowNone: true },
          cloth: { label: "옷", items: clothData.cloths || [], unityMethod: "JS_SetCloth", allowNone: true },
          pant: { label: "바지", items: pantData.pants || [], unityMethod: "JS_SetPant", allowNone: true },
          back: { label: "등", items: backData.backs || [], unityMethod: "JS_SetBack", allowNone: true },
        });
        setLoading(false);
      } catch (err) {
        console.error("Failed to load mappings:", err);
        setLoading(false);
      }
    }

    loadMappings();
  }, []);

  const handleSelect = (category: string, index: number) => {
    const data = categories[category];
    if (!data) return;

    // 무기인 경우 "WeaponType,index" 형식으로 호출
    if (data.weaponType) {
      const param = index === -1 ? `${data.weaponType},-1` : `${data.weaponType},${index}`;
      callUnity(data.unityMethod, param);
    } else {
      // 외형/방어구는 기존 방식
      callUnity(data.unityMethod, index.toString());
    }
  };

  const getCurrentIndex = (category: string): number => {
    if (!characterState) return -1;
    const indexKey = `${category}Index` as keyof typeof characterState;
    return (characterState[indexKey] as number) ?? -1;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <p>매핑 데이터 로딩 중...</p>
      </div>
    );
  }

  const appearanceCategories = ["body", "eye", "hair", "facehair"];
  const weaponCategories = ["sword", "axe", "bow", "shield", "spear", "wand", "dagger"];
  const armorCategories = ["helmet", "armor", "cloth", "pant", "back"];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="flex h-screen">
        {/* Unity 캔버스 */}
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-md aspect-square">
            <DynamicUnityCanvas />
          </div>
        </div>

        {/* 드롭다운 패널 */}
        <div className="w-96 bg-gray-800 p-4 overflow-y-auto">
          <h1 className="text-xl font-bold mb-4">장비 테스트</h1>

          {/* 외형 섹션 */}
          <section className="mb-6">
            <h2 className="text-sm font-semibold text-gray-400 mb-2 border-b border-gray-700 pb-1">
              외형
            </h2>
            <div className="space-y-3">
              {appearanceCategories.map((cat) => {
                const data = categories[cat];
                if (!data) return null;
                const currentIndex = getCurrentIndex(cat);

                return (
                  <div key={cat}>
                    <label className="block text-xs text-gray-400 mb-1">{data.label}</label>
                    <select
                      className="w-full bg-gray-700 text-white rounded px-3 py-2 text-sm"
                      value={currentIndex}
                      onChange={(e) => handleSelect(cat, parseInt(e.target.value))}
                    >
                      {data.allowNone && <option value={-1}>없음</option>}
                      {data.items.map((item) => (
                        <option key={item.index} value={item.index}>
                          {item.ko} ({item.index})
                        </option>
                      ))}
                    </select>
                  </div>
                );
              })}
            </div>
          </section>

          {/* 무기 섹션 */}
          <section className="mb-6">
            <h2 className="text-sm font-semibold text-gray-400 mb-2 border-b border-gray-700 pb-1">
              무기
            </h2>
            <div className="space-y-3">
              {weaponCategories.map((cat) => {
                const data = categories[cat];
                if (!data) return null;
                const currentIndex = getCurrentIndex(cat);

                return (
                  <div key={cat}>
                    <label className="block text-xs text-gray-400 mb-1">
                      {data.label} ({data.items.length}개) {data.hand === "left" ? "🛡️ 왼손" : "⚔️ 오른손"}
                    </label>
                    <select
                      className="w-full bg-gray-700 text-white rounded px-3 py-2 text-sm"
                      value={currentIndex}
                      onChange={(e) => handleSelect(cat, parseInt(e.target.value))}
                    >
                      {data.allowNone && <option value={-1}>없음</option>}
                      {data.items.map((item) => (
                        <option key={item.index} value={item.index}>
                          {item.ko}
                          {"id" in item && ` [${item.id}]`}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              })}
            </div>
          </section>

          {/* 방어구 섹션 */}
          <section className="mb-6">
            <h2 className="text-sm font-semibold text-gray-400 mb-2 border-b border-gray-700 pb-1">
              방어구
            </h2>
            <div className="space-y-3">
              {armorCategories.map((cat) => {
                const data = categories[cat];
                if (!data) return null;
                const currentIndex = getCurrentIndex(cat);

                return (
                  <div key={cat}>
                    <label className="block text-xs text-gray-400 mb-1">
                      {data.label} ({data.items.length}개)
                    </label>
                    <select
                      className="w-full bg-gray-700 text-white rounded px-3 py-2 text-sm"
                      value={currentIndex}
                      onChange={(e) => handleSelect(cat, parseInt(e.target.value))}
                    >
                      {data.allowNone && <option value={-1}>없음</option>}
                      {data.items.map((item) => (
                        <option key={item.index} value={item.index}>
                          {item.ko}
                          {"id" in item && ` [${item.id}]`}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              })}
            </div>
          </section>

          {/* 현재 상태 디버그 */}
          <section className="mt-4 p-3 bg-gray-900 rounded text-xs font-mono">
            <h3 className="text-gray-400 mb-2">현재 상태</h3>
            <pre className="text-gray-500 overflow-auto max-h-40">
              {JSON.stringify(characterState, null, 2)}
            </pre>
          </section>
        </div>
      </div>
    </div>
  );
}
