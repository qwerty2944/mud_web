import { create } from "zustand";
import { supabase } from "@/shared/api";

// ============ 타입 정의 ============

export interface GameMap {
  id: string;
  nameKo: string;
  nameEn: string;
  descriptionKo: string | null;
  descriptionEn: string | null;
  icon: string;
  minLevel: number;
  maxPlayers: number;
  isPvp: boolean;
  isSafeZone: boolean;
  connectedMaps: string[];
}

interface MapsState {
  // 상태
  maps: GameMap[];
  isLoading: boolean;
  error: string | null;

  // 액션
  fetchMaps: () => Promise<void>;
  getMapById: (id: string) => GameMap | undefined;
  getConnectedMaps: (currentMapId: string) => GameMap[];
}

// ============ 스토어 ============

export const useMapsStore = create<MapsState>((set, get) => ({
  maps: [],
  isLoading: false,
  error: null,

  fetchMaps: async () => {
    set({ isLoading: true, error: null });

    try {
      const { data, error } = await supabase
        .from("maps")
        .select("*")
        .order("min_level", { ascending: true });

      if (error) throw error;

      const maps: GameMap[] = (data || []).map((row: any) => ({
        id: row.id,
        nameKo: row.name_ko,
        nameEn: row.name_en,
        descriptionKo: row.description_ko,
        descriptionEn: row.description_en,
        icon: row.icon || "🏠",
        minLevel: row.min_level || 1,
        maxPlayers: row.max_players || 100,
        isPvp: row.is_pvp || false,
        isSafeZone: row.is_safe_zone ?? true,
        connectedMaps: row.connected_maps || [],
      }));

      set({ maps, isLoading: false });
    } catch (err: any) {
      console.error("Failed to fetch maps:", err);
      set({ error: err.message, isLoading: false });
    }
  },

  getMapById: (id) => {
    return get().maps.find((m) => m.id === id);
  },

  getConnectedMaps: (currentMapId) => {
    const { maps, getMapById } = get();
    const currentMap = getMapById(currentMapId);
    if (!currentMap) return [];

    return currentMap.connectedMaps
      .map((id) => maps.find((m) => m.id === id))
      .filter((m): m is GameMap => m !== undefined);
  },
}));

// ============ 유틸리티 ============

/**
 * 맵 표시 이름 가져오기 (한국어 기본)
 */
export function getMapDisplayName(map: GameMap, locale: "ko" | "en" = "ko"): string {
  return locale === "ko" ? map.nameKo : map.nameEn;
}

/**
 * 맵 설명 가져오기
 */
export function getMapDescription(map: GameMap, locale: "ko" | "en" = "ko"): string {
  const desc = locale === "ko" ? map.descriptionKo : map.descriptionEn;
  return desc || "";
}
