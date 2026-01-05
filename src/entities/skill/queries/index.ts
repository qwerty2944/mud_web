import { useQuery } from "@tanstack/react-query";
import type { Skill, SkillCategory } from "../types";
import { getSkillCategory } from "../types";

// Query keys
export const skillKeys = {
  all: ["skills"] as const,
  byCategory: (category: SkillCategory) =>
    [...skillKeys.all, "category", category] as const,
};

// Skills 데이터 타입
interface SkillsData {
  version: string;
  generatedAt: string;
  skills: Skill[];
  summary: {
    total: number;
    byType: Record<string, number>;
  };
}

// Skills 데이터 로드
async function fetchSkills(): Promise<Skill[]> {
  const response = await fetch("/data/skills.json");
  if (!response.ok) {
    throw new Error("Failed to fetch skills data");
  }
  const data: SkillsData = await response.json();
  return data.skills;
}

/**
 * 모든 스킬 조회
 */
export function useSkills() {
  return useQuery({
    queryKey: skillKeys.all,
    queryFn: fetchSkills,
    staleTime: Infinity, // 정적 데이터이므로 캐싱
  });
}

/**
 * 카테고리별 스킬 필터링
 */
export function useSkillsByCategory(category: SkillCategory) {
  return useQuery({
    queryKey: skillKeys.byCategory(category),
    queryFn: async () => {
      const skills = await fetchSkills();
      return skills.filter((skill) => getSkillCategory(skill) === category);
    },
    staleTime: Infinity,
  });
}

/**
 * 특정 스킬 ID로 조회
 */
export function useSkill(skillId: string) {
  const { data: skills } = useSkills();
  return skills?.find((s) => s.id === skillId);
}

/**
 * 마법 공격 스킬만 조회
 */
export function useMagicAttackSkills() {
  return useQuery({
    queryKey: [...skillKeys.all, "magic_attack"],
    queryFn: async () => {
      const skills = await fetchSkills();
      return skills.filter((skill) => skill.type === "magic_attack");
    },
    staleTime: Infinity,
  });
}

/**
 * 버프 스킬만 조회
 */
export function useBuffSkills() {
  return useQuery({
    queryKey: [...skillKeys.all, "buffs"],
    queryFn: async () => {
      const skills = await fetchSkills();
      return skills.filter(
        (skill) => skill.type === "buff" || skill.type === "heal"
      );
    },
    staleTime: Infinity,
  });
}

/**
 * 디버프 스킬만 조회
 */
export function useDebuffSkills() {
  return useQuery({
    queryKey: [...skillKeys.all, "debuffs"],
    queryFn: async () => {
      const skills = await fetchSkills();
      return skills.filter((skill) => skill.type === "debuff");
    },
    staleTime: Infinity,
  });
}
