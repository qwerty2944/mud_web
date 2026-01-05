"use client";

import { useMemo } from "react";
import { useMaps, getMapById, type GameMap } from "@/entities/map";
import { useMonstersByMap } from "@/entities/monster";
import { useThemeStore } from "@/shared/config";

interface WorldMapProps {
  currentMapId: string;
  onMapSelect: (mapId: string) => void;
  playerLevel: number;
}

// 맵 노드 위치 정의 (상대적 좌표 %)
const MAP_POSITIONS: Record<string, { x: number; y: number }> = {
  town_square: { x: 50, y: 15 },
  shop_district: { x: 20, y: 35 },
  training_ground: { x: 80, y: 35 },
  forest_entrance: { x: 50, y: 55 },
  deep_forest: { x: 50, y: 80 },
};

// 맵 연결선 정의
const MAP_CONNECTIONS: [string, string][] = [
  ["town_square", "shop_district"],
  ["town_square", "training_ground"],
  ["town_square", "forest_entrance"],
  ["training_ground", "forest_entrance"],
  ["forest_entrance", "deep_forest"],
];

export function WorldMap({ currentMapId, onMapSelect, playerLevel }: WorldMapProps) {
  const { theme } = useThemeStore();
  const { data: maps = [] } = useMaps();

  // 현재 맵에서 이동 가능한 맵 ID 목록
  const currentMap = getMapById(maps, currentMapId);
  const connectedMapIds = useMemo(() => {
    return currentMap?.connectedMaps || [];
  }, [currentMap]);

  const canEnterMap = (map: GameMap) => playerLevel >= map.minLevel;
  const isConnected = (mapId: string) => connectedMapIds.includes(mapId);

  return (
    <div
      className="relative w-full h-80 overflow-hidden"
      style={{
        background: theme.colors.bgDark,
        border: `1px solid ${theme.colors.border}`,
      }}
    >
      {/* 헤더 */}
      <div
        className="absolute top-0 left-0 right-0 px-3 py-2 border-b z-10"
        style={{
          background: theme.colors.bgLight,
          borderColor: theme.colors.border,
        }}
      >
        <span className="text-sm font-mono font-medium" style={{ color: theme.colors.text }}>
          🗺️ 월드맵
        </span>
      </div>

      {/* SVG 연결선 */}
      <svg className="absolute inset-0 w-full h-full pt-10" style={{ pointerEvents: "none" }}>
        {MAP_CONNECTIONS.map(([from, to]) => {
          const fromPos = MAP_POSITIONS[from];
          const toPos = MAP_POSITIONS[to];
          if (!fromPos || !toPos) return null;

          const isPath =
            (currentMapId === from && isConnected(to)) ||
            (currentMapId === to && isConnected(from));

          return (
            <line
              key={`${from}-${to}`}
              x1={`${fromPos.x}%`}
              y1={`${fromPos.y}%`}
              x2={`${toPos.x}%`}
              y2={`${toPos.y}%`}
              stroke={isPath ? theme.colors.primary : theme.colors.border}
              strokeWidth={isPath ? 3 : 2}
              strokeDasharray={isPath ? "none" : "5,5"}
              opacity={isPath ? 1 : 0.5}
            />
          );
        })}
      </svg>

      {/* 맵 노드 */}
      {maps.map((map) => {
        const pos = MAP_POSITIONS[map.id];
        if (!pos) return null;

        const isCurrent = map.id === currentMapId;
        const canMove = isConnected(map.id) && canEnterMap(map);
        const isLocked = !canEnterMap(map);

        return (
          <button
            key={map.id}
            onClick={() => canMove && onMapSelect(map.id)}
            disabled={!canMove || isCurrent}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 transition-all"
            style={{
              left: `${pos.x}%`,
              top: `calc(${pos.y}% + 40px)`,
              cursor: canMove && !isCurrent ? "pointer" : "default",
            }}
          >
            {/* 노드 */}
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-all"
              style={{
                background: isCurrent
                  ? theme.colors.primary
                  : canMove
                  ? theme.colors.bgLight
                  : `${theme.colors.bgLight}80`,
                border: `3px solid ${
                  isCurrent
                    ? theme.colors.primaryDim
                    : canMove
                    ? theme.colors.border
                    : theme.colors.borderDim
                }`,
                boxShadow: isCurrent ? `0 0 12px ${theme.colors.primary}80` : "none",
                opacity: isLocked ? 0.5 : 1,
              }}
            >
              {isLocked ? "🔒" : map.icon}
            </div>

            {/* 라벨 */}
            <div className="text-center">
              <div
                className="text-xs font-mono font-medium whitespace-nowrap"
                style={{
                  color: isCurrent ? theme.colors.primary : theme.colors.text,
                }}
              >
                {map.nameKo}
              </div>
              {isLocked && (
                <div className="text-xs font-mono" style={{ color: theme.colors.error }}>
                  Lv.{map.minLevel}+
                </div>
              )}
              {map.isSafeZone && !isLocked && (
                <div className="text-xs font-mono" style={{ color: theme.colors.success }}>
                  안전
                </div>
              )}
            </div>

            {/* 몬스터 수 표시 */}
            <MonsterCount mapId={map.id} />
          </button>
        );
      })}
    </div>
  );
}

// 몬스터 수 표시 컴포넌트
function MonsterCount({ mapId }: { mapId: string }) {
  const { theme } = useThemeStore();
  const { data: monsters = [] } = useMonstersByMap(mapId);

  if (monsters.length === 0) return null;

  return (
    <div
      className="text-xs font-mono px-1.5 py-0.5 rounded"
      style={{
        background: `${theme.colors.error}20`,
        color: theme.colors.error,
      }}
    >
      {monsters.length}마리
    </div>
  );
}
