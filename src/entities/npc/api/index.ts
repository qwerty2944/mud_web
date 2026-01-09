import type { Npc } from "../types";

// ============ NPC 조회 API ============

let npcsCache: Npc[] | null = null;

export async function fetchNpcs(): Promise<Npc[]> {
  if (npcsCache) return npcsCache;

  const response = await fetch("/data/npcs.json");
  const data = await response.json();
  npcsCache = data.npcs;
  return npcsCache!;
}

export async function fetchNpcsByMap(mapId: string): Promise<Npc[]> {
  const npcs = await fetchNpcs();
  return npcs.filter((npc) => npc.mapId === mapId);
}

export async function fetchNpcById(npcId: string): Promise<Npc | undefined> {
  const npcs = await fetchNpcs();
  return npcs.find((npc) => npc.id === npcId);
}

export async function fetchHealerNpcs(): Promise<Npc[]> {
  const npcs = await fetchNpcs();
  return npcs.filter((npc) => npc.type === "healer");
}
