"use client";

import { useEffect } from "react";
import { useMapsStore, getMapDisplayName, getMapDescription, type GameMap } from "../model";

interface MapSelectorProps {
  currentMapId: string;
  onMapChange: (mapId: string) => void;
  playerLevel?: number;
}

export function MapSelector({
  currentMapId,
  onMapChange,
  playerLevel = 1,
}: MapSelectorProps) {
  const { maps, isLoading, fetchMaps, getConnectedMaps, getMapById } = useMapsStore();

  // 맵 데이터 로드
  useEffect(() => {
    if (maps.length === 0) {
      fetchMaps();
    }
  }, [maps.length, fetchMaps]);

  // 현재 맵에서 이동 가능한 맵들
  const connectedMaps = getConnectedMaps(currentMapId);
  const currentMap = getMapById(currentMapId);

  // 레벨 제한 체크
  const canEnterMap = (map: GameMap) => playerLevel >= map.minLevel;

  if (isLoading) {
    return (
      <div className="bg-gray-900 rounded-lg border border-gray-700 p-4">
        <div className="text-gray-500 text-sm text-center">맵 로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-lg border border-gray-700 overflow-hidden">
      {/* 헤더 */}
      <div className="px-3 py-2 bg-gray-800 border-b border-gray-700 flex items-center justify-between">
        <span className="text-sm font-medium text-gray-300">🗺️ 이동</span>
        {currentMap && (
          <span className="text-xs text-gray-500">
            현재: {currentMap.icon} {getMapDisplayName(currentMap)}
          </span>
        )}
      </div>

      {/* 맵 목록 */}
      <div className="p-2 space-y-2 max-h-64 overflow-y-auto">
        {connectedMaps.length === 0 ? (
          <div className="text-center text-gray-500 text-sm py-2">
            이동 가능한 맵이 없습니다.
          </div>
        ) : (
          connectedMaps.map((map) => {
            const canEnter = canEnterMap(map);
            return (
              <button
                key={map.id}
                onClick={() => canEnter && onMapChange(map.id)}
                disabled={!canEnter}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded transition-colors text-left ${
                  canEnter
                    ? "bg-gray-800 hover:bg-gray-700 cursor-pointer"
                    : "bg-gray-800/50 cursor-not-allowed opacity-50"
                }`}
              >
                <span className="text-xl flex-shrink-0">{map.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white truncate">
                      {getMapDisplayName(map)}
                    </span>
                    {map.isPvp && (
                      <span className="text-xs px-1.5 py-0.5 bg-red-500/20 text-red-400 rounded">
                        PvP
                      </span>
                    )}
                    {map.isSafeZone && (
                      <span className="text-xs px-1.5 py-0.5 bg-green-500/20 text-green-400 rounded">
                        안전
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {getMapDescription(map)}
                  </div>
                  {!canEnter && (
                    <div className="text-xs text-red-400 mt-0.5">
                      Lv.{map.minLevel} 이상 필요
                    </div>
                  )}
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

// 하위호환성을 위한 export
export const AVAILABLE_MAPS = [
  { id: "starting_village", name: "시작 마을", icon: "🏠", description: "평화로운 마을" },
];
