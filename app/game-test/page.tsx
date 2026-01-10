"use client";

import { useState, useEffect, useMemo } from "react";
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

interface CategoryData {
  label: string;
  items: SpriteItem[];
  unityMethod: string;
  allowNone?: boolean;
  weaponType?: string;
  hand?: "left" | "right";
}

type RaceType = "all" | "elf" | "human" | "orc" | "undead" | "tiefling";

const RACES: { id: RaceType; ko: string; en: string }[] = [
  { id: "all", ko: "전체", en: "All" },
  { id: "elf", ko: "엘프", en: "Elf" },
  { id: "human", ko: "인간", en: "Human" },
  { id: "orc", ko: "오크", en: "Orc" },
  { id: "undead", ko: "언데드", en: "Undead" },
  { id: "tiefling", ko: "티플링", en: "Tiefling" },
];

// 종족과 스타일 매핑 (종족 선택시 해당 스타일도 포함)
const RACE_STYLE_MAP: Record<RaceType, string[]> = {
  all: [],
  elf: ["elf", "common"],
  human: ["human", "knight", "archer", "healer", "rogue", "mage", "common"],
  orc: ["orc", "common"],
  undead: ["undead", "common"],
  tiefling: ["tiefling", "common"],
};

export default function RaceEquipmentTestPage() {
  const { callUnity, characterState } = useAppearanceStore();
  const [categories, setCategories] = useState<Record<string, CategoryData>>({});
  const [loading, setLoading] = useState(true);
  const [selectedRace, setSelectedRace] = useState<RaceType>("elf");

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
          // 무기
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

  // 종족/스타일로 필터링된 아이템
  const filterByRace = (items: SpriteItem[], race: RaceType): SpriteItem[] => {
    if (race === "all") return items;

    const allowedStyles = RACE_STYLE_MAP[race];
    return items.filter((item) => {
      const itemStyle = item.style || item.race || "common";
      return allowedStyles.includes(itemStyle);
    });
  };

  // 필터링된 카테고리
  const filteredCategories = useMemo(() => {
    const result: Record<string, CategoryData> = {};
    for (const [key, data] of Object.entries(categories)) {
      result[key] = {
        ...data,
        items: filterByRace(data.items, selectedRace),
      };
    }
    return result;
  }, [categories, selectedRace]);

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

  // 종족 변경시 해당 종족의 첫 번째 body로 변경
  const handleRaceChange = (race: RaceType) => {
    setSelectedRace(race);

    // 해당 종족의 첫 번째 body 찾기
    if (race !== "all" && categories.body) {
      const filteredBodies = filterByRace(categories.body.items, race);
      if (filteredBodies.length > 0) {
        handleSelect("body", filteredBodies[0].index);
      }
    }
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

  // 통계 계산
  const totalFiltered = Object.values(filteredCategories).reduce((sum, cat) => sum + cat.items.length, 0);
  const totalAll = Object.values(categories).reduce((sum, cat) => sum + cat.items.length, 0);

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
          <h1 className="text-xl font-bold mb-4">종족별 장비 테스트</h1>

          {/* 종족 선택 */}
          <section className="mb-6 p-3 bg-gray-700 rounded-lg">
            <h2 className="text-sm font-semibold text-yellow-400 mb-2">종족 선택</h2>
            <div className="flex flex-wrap gap-2">
              {RACES.map((race) => (
                <button
                  key={race.id}
                  onClick={() => handleRaceChange(race.id)}
                  className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                    selectedRace === race.id
                      ? "bg-yellow-500 text-gray-900"
                      : "bg-gray-600 text-gray-300 hover:bg-gray-500"
                  }`}
                >
                  {race.ko}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-2">
              {selectedRace === "all"
                ? `전체 ${totalAll}개 아이템`
                : `${RACES.find(r => r.id === selectedRace)?.ko} 스타일: ${totalFiltered}개 / 전체 ${totalAll}개`
              }
            </p>
          </section>

          {/* 외형 섹션 */}
          <section className="mb-6">
            <h2 className="text-sm font-semibold text-gray-400 mb-2 border-b border-gray-700 pb-1">
              외형
            </h2>
            <div className="space-y-3">
              {appearanceCategories.map((cat) => {
                const data = filteredCategories[cat];
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
                const data = filteredCategories[cat];
                if (!data || data.items.length === 0) return null;
                const currentIndex = getCurrentIndex(cat);

                return (
                  <div key={cat}>
                    <label className="block text-xs text-gray-400 mb-1">
                      {data.label} ({data.items.length}개) {data.hand === "left" ? "🛡️" : "⚔️"}
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
                const data = filteredCategories[cat];
                if (!data || data.items.length === 0) return null;
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
