import { supabase } from "@/shared/api";
import type { SavedCharacter, InventoryItem } from "./types";

// ============ 캐릭터 API ============

export async function fetchCharacters(userId: string): Promise<SavedCharacter[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("characters")
    .eq("id", userId)
    .single();

  if (error) throw error;

  return (data?.characters || []) as SavedCharacter[];
}

export async function fetchMainCharacter(userId: string): Promise<SavedCharacter | null> {
  const characters = await fetchCharacters(userId);
  if (!characters.length) return null;
  return characters.find((c) => c.isMain) || characters[0];
}

// ============ 인벤토리 API ============

export async function fetchInventory(userId: string): Promise<InventoryItem[]> {
  const { data, error } = await supabase
    .from("inventory")
    .select("*")
    .eq("user_id", userId)
    .order("acquired_at", { ascending: false });

  if (error) throw error;

  return (data || []).map((item: any) => ({
    id: item.id,
    itemId: item.item_id,
    itemType: item.item_type,
    quantity: item.quantity || 1,
    acquiredAt: item.acquired_at,
  }));
}
