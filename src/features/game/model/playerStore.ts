import { create } from "zustand";
import { supabase } from "@/shared/api";

// ============ 타입 정의 ============

export interface PlayerCharacter {
  id: string;
  name: string;
  isMain: boolean;
  appearance: Record<string, number>;
  colors: Record<string, string>;
}

export interface InventoryItem {
  id: string;
  itemId: string;
  itemType: string;
  quantity: number;
  acquiredAt: string;
}

export interface PlayerProfile {
  id: string;
  nickname: string | null;
  level: number;
  experience: number;
  gold: number;
  gems: number;
  stamina: number;
  maxStamina: number;
  staminaUpdatedAt: string;
  isPremium: boolean;
  premiumUntil: string | null;
  characters: PlayerCharacter[];
  buffs: any[];
}

interface PlayerState {
  // 상태
  profile: PlayerProfile | null;
  inventory: InventoryItem[];
  isLoading: boolean;
  error: string | null;
  activeTab: "status" | "inventory";

  // 액션
  fetchProfile: (userId: string) => Promise<void>;
  fetchInventory: (userId: string) => Promise<void>;
  setActiveTab: (tab: "status" | "inventory") => void;
  updateStamina: () => void;

  // Computed
  getMainCharacter: () => PlayerCharacter | null;
  getExpPercentage: () => number;
  getExpToNextLevel: () => number;
}

// ============ 상수 ============

// 레벨당 필요 경험치 (간단한 공식)
const getExpForLevel = (level: number) => level * 100;

// 스태미나 회복 속도 (분당)
const STAMINA_RECOVERY_PER_MINUTE = 1;

// ============ 스토어 ============

export const usePlayerStore = create<PlayerState>((set, get) => ({
  profile: null,
  inventory: [],
  isLoading: false,
  error: null,
  activeTab: "status",

  fetchProfile: async (userId) => {
    set({ isLoading: true, error: null });

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) throw error;

      const profile: PlayerProfile = {
        id: data.id,
        nickname: data.nickname,
        level: data.level || 1,
        experience: data.experience || 0,
        gold: data.gold || 0,
        gems: data.gems || 0,
        stamina: data.stamina || 100,
        maxStamina: data.max_stamina || 100,
        staminaUpdatedAt: data.stamina_updated_at || new Date().toISOString(),
        isPremium: data.is_premium || false,
        premiumUntil: data.premium_until,
        characters: data.characters || [],
        buffs: data.buffs || [],
      };

      set({ profile, isLoading: false });

      // 스태미나 자동 회복 계산
      get().updateStamina();
    } catch (err: any) {
      console.error("Failed to fetch profile:", err);
      set({ error: err.message, isLoading: false });
    }
  },

  fetchInventory: async (userId) => {
    try {
      const { data, error } = await supabase
        .from("inventory")
        .select("*")
        .eq("user_id", userId)
        .order("acquired_at", { ascending: false });

      if (error) throw error;

      const inventory: InventoryItem[] = (data || []).map((item: any) => ({
        id: item.id,
        itemId: item.item_id,
        itemType: item.item_type,
        quantity: item.quantity || 1,
        acquiredAt: item.acquired_at,
      }));

      set({ inventory });
    } catch (err: any) {
      console.error("Failed to fetch inventory:", err);
    }
  },

  setActiveTab: (tab) => set({ activeTab: tab }),

  updateStamina: () => {
    const { profile } = get();
    if (!profile) return;

    const now = new Date();
    const lastUpdate = new Date(profile.staminaUpdatedAt);
    const minutesPassed = Math.floor((now.getTime() - lastUpdate.getTime()) / 60000);

    if (minutesPassed > 0 && profile.stamina < profile.maxStamina) {
      const recovered = Math.min(
        minutesPassed * STAMINA_RECOVERY_PER_MINUTE,
        profile.maxStamina - profile.stamina
      );

      set({
        profile: {
          ...profile,
          stamina: profile.stamina + recovered,
          staminaUpdatedAt: now.toISOString(),
        },
      });
    }
  },

  getMainCharacter: () => {
    const { profile } = get();
    if (!profile?.characters?.length) return null;
    return profile.characters.find((c) => c.isMain) || profile.characters[0];
  },

  getExpPercentage: () => {
    const { profile } = get();
    if (!profile) return 0;
    const expNeeded = getExpForLevel(profile.level);
    return Math.min((profile.experience / expNeeded) * 100, 100);
  },

  getExpToNextLevel: () => {
    const { profile } = get();
    if (!profile) return 0;
    return getExpForLevel(profile.level) - profile.experience;
  },
}));
