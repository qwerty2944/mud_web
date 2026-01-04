/**
 * Supabase Storage에서 게임 데이터 JSON을 가져오는 유틸리티
 */

import { supabase } from "./supabase";

const BUCKET_NAME = "game-data";
const STORAGE_PATH = "mappings";

// 캐시 (메모리)
const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5분

// ============ 타입 정의 ============

export interface EyeMapping {
  index: number;
  fileName: string;
  ko: string;
  en: string;
}

export interface HairMapping {
  index: number;
  fileName: string;
  ko: string;
  en: string;
  race: string;
}

export interface FacehairMapping {
  index: number;
  fileName: string;
  ko: string;
  en: string;
}

export interface BodyMapping {
  index: number;
  name: string;
  ko: string;
  en: string;
  race: string;
}

export interface MappingFile<T> {
  version: string;
  generatedAt: string;
  summary: { total: number };
}

export interface EyeMappingFile extends MappingFile<EyeMapping> {
  eyes: EyeMapping[];
}

export interface HairMappingFile extends MappingFile<HairMapping> {
  hairs: HairMapping[];
}

export interface FacehairMappingFile extends MappingFile<FacehairMapping> {
  facehairs: FacehairMapping[];
}

export interface BodyMappingFile extends MappingFile<BodyMapping> {
  bodies: BodyMapping[];
}

// ============ 데이터 페칭 ============

async function fetchFromStorage<T>(fileName: string): Promise<T | null> {
  // 캐시 확인
  const cached = cache.get(fileName);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data as T;
  }

  try {
    // Supabase Storage에서 가져오기
    const { data } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(`${STORAGE_PATH}/${fileName}`);

    const response = await fetch(data.publicUrl);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const json = await response.json();

    // 캐시에 저장
    cache.set(fileName, { data: json, timestamp: Date.now() });

    return json as T;
  } catch (error) {
    console.error(`Failed to fetch ${fileName} from storage:`, error);

    // 폴백: 로컬 public/data에서 가져오기
    try {
      const localResponse = await fetch(`/data/${fileName}`);
      if (localResponse.ok) {
        const json = await localResponse.json();
        cache.set(fileName, { data: json, timestamp: Date.now() });
        return json as T;
      }
    } catch {
      // 무시
    }

    return null;
  }
}

// ============ 데이터 API ============

export async function getEyeMappings(): Promise<EyeMapping[]> {
  const data = await fetchFromStorage<EyeMappingFile>("eye-mapping.json");
  return data?.eyes ?? [];
}

export async function getHairMappings(): Promise<HairMapping[]> {
  const data = await fetchFromStorage<HairMappingFile>("hair-mapping.json");
  return data?.hairs ?? [];
}

export async function getFacehairMappings(): Promise<FacehairMapping[]> {
  const data = await fetchFromStorage<FacehairMappingFile>("facehair-mapping.json");
  return data?.facehairs ?? [];
}

export async function getBodyMappings(): Promise<BodyMapping[]> {
  const data = await fetchFromStorage<BodyMappingFile>("body-mapping.json");
  return data?.bodies ?? [];
}

// 모든 매핑 데이터 한번에 가져오기
export async function getAllMappings() {
  const [eyes, hairs, facehairs, bodies] = await Promise.all([
    getEyeMappings(),
    getHairMappings(),
    getFacehairMappings(),
    getBodyMappings(),
  ]);

  return { eyes, hairs, facehairs, bodies };
}

// 캐시 클리어
export function clearMappingCache() {
  cache.clear();
}
