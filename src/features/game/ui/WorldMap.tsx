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

export function WorldMap({ currentMapId, onMapSelect, playerLevel }: WorldMapProps) {
  const { theme } = useThemeStore();
  const { data: maps = [] } = useMaps();

  // 현재 맵에서 이동 가능한 맵 ID 목록
  const currentMap = getMapById(maps, currentMapId);
  const connectedMapIds = useMemo(() => {
    return currentMap?.connectedMaps || [];
  }, [currentMap]);

  return (
    <div
      className="w-full overflow-hidden font-mono text-sm"
      style={{
        background: theme.colors.bgDark,
        border: `1px solid ${theme.colors.border}`,
      }}
    >
      {/* 헤더 */}
      <div
        className="px-3 py-2 border-b"
        style={{
          background: theme.colors.bgLight,
          borderColor: theme.colors.border,
        }}
      >
        <span className="font-medium" style={{ color: theme.colors.text }}>
          🗺️ 월드맵
        </span>
      </div>

      {/* 맵 목록 */}
      <div className="p-3 space-y-2">
        {maps.map((map) => {
          const isCurrent = map.id === currentMapId;
          const isConnected = connectedMapIds.includes(map.id);
          const canEnter = playerLevel >= map.minLevel;
          const canMove = isConnected && canEnter && !isCurrent;

          return (
            <MapRow
              key={map.id}
              map={map}
              isCurrent={isCurrent}
              isConnected={isConnected}
              canEnter={canEnter}
              canMove={canMove}
              onSelect={() => canMove && onMapSelect(map.id)}
            />
          );
        })}
      </div>

      {/* 범례 */}
      <div
        className="px-3 py-2 border-t flex flex-wrap gap-3 text-xs"
        style={{ borderColor: theme.colors.border }}
      >
        <span>
          <span style={{ color: theme.colors.primary }}>●</span> 현재 위치
        </span>
        <span>
          <span style={{ color: theme.colors.success }}>●</span> 이동 가능
        </span>
        <span>
          <span style={{ color: theme.colors.textMuted }}>●</span> 연결 안됨
        </span>
        <span>
          <span style={{ color: theme.colors.error }}>🔒</span> 레벨 부족
        </span>
      </div>
    </div>
  );
}

// 맵 행 컴포넌트
interface MapRowProps {
  map: GameMap;
  isCurrent: boolean;
  isConnected: boolean;
  canEnter: boolean;
  canMove: boolean;
  onSelect: () => void;
}

function MapRow({ map, isCurrent, isConnected, canEnter, canMove, onSelect }: MapRowProps) {
  const { theme } = useThemeStore();

  // 상태에 따른 색상 결정
  const getStatusColor = () => {
    if (isCurrent) return theme.colors.primary;
    if (!canEnter) return theme.colors.error;
    if (canMove) return theme.colors.success;
    return theme.colors.textMuted;
  };

  const statusColor = getStatusColor();

  return (
    <div
      className="flex items-center gap-2 py-1"
      style={{ opacity: !isConnected && !isCurrent ? 0.6 : 1 }}
    >
      {/* 상태 표시 */}
      <span style={{ color: statusColor }}>●</span>

      {/* 맵 아이콘 */}
      <span>{!canEnter ? "🔒" : map.icon}</span>

      {/* 맵 이름 - 클릭 가능 */}
      <button
        onClick={onSelect}
        disabled={!canMove}
        className="transition-colors text-left"
        style={{
          color: statusColor,
          cursor: canMove ? "pointer" : "default",
          textDecoration: canMove ? "underline" : "none",
        }}
      >
        {map.nameKo}
      </button>

      {/* 상태 태그 */}
      {isCurrent && (
        <span
          className="text-xs px-1.5 py-0.5 rounded"
          style={{
            background: `${theme.colors.primary}20`,
            color: theme.colors.primary,
          }}
        >
          현재
        </span>
      )}

      {isConnected && !isCurrent && (
        <span
          className="text-xs px-1.5 py-0.5 rounded"
          style={{
            background: `${theme.colors.success}20`,
            color: theme.colors.success,
          }}
        >
          연결됨
        </span>
      )}

      {!canEnter && (
        <span
          className="text-xs px-1.5 py-0.5 rounded"
          style={{
            background: `${theme.colors.error}20`,
            color: theme.colors.error,
          }}
        >
          Lv.{map.minLevel}+
        </span>
      )}

      {map.isSafeZone && canEnter && (
        <span
          className="text-xs px-1.5 py-0.5 rounded"
          style={{
            background: `${theme.colors.success}15`,
            color: theme.colors.success,
          }}
        >
          안전
        </span>
      )}

      {/* 몬스터 정보 */}
      <MonsterInfo mapId={map.id} />
    </div>
  );
}

// 몬스터 정보 표시
function MonsterInfo({ mapId }: { mapId: string }) {
  const { theme } = useThemeStore();
  const { data: monsters = [] } = useMonstersByMap(mapId);

  if (monsters.length === 0) return null;

  return (
    <span className="text-xs ml-auto" style={{ color: theme.colors.warning }}>
      {monsters.map((m) => `${m.nameKo} Lv.${m.level}`).join(", ")}
    </span>
  );
}
