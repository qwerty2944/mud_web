import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { WeaponType } from "@/entities/proficiency";

// 장착 가능한 슬롯
export type EquipmentSlot = "weapon" | "armor" | "helmet" | "accessory";

// 장착된 아이템 정보
export interface EquippedItem {
  itemId: string;
  itemName: string;
  itemType: WeaponType | string;
  icon: string;
  stats?: {
    attack?: number;
    defense?: number;
    magic?: number;
  };
}

// 장비 상태
interface EquipmentState {
  // 장착된 아이템
  weapon: EquippedItem | null;
  armor: EquippedItem | null;
  helmet: EquippedItem | null;
  accessory: EquippedItem | null;

  // 배운 스킬 ID 목록
  learnedSkills: string[];

  // 액션
  equipItem: (slot: EquipmentSlot, item: EquippedItem) => void;
  unequipItem: (slot: EquipmentSlot) => void;
  learnSkill: (skillId: string) => void;
  unlearnSkill: (skillId: string) => void;
  hasLearnedSkill: (skillId: string) => boolean;

  // 초기화 (테스트용)
  resetEquipment: () => void;
  initializeDefaultSkills: () => void;
}

// 기본 시작 스킬
const DEFAULT_SKILLS = ["heal"]; // 힐만 기본으로

const initialState = {
  weapon: null,
  armor: null,
  helmet: null,
  accessory: null,
  learnedSkills: DEFAULT_SKILLS,
};

export const useEquipmentStore = create<EquipmentState>()(
  persist(
    (set, get) => ({
      ...initialState,

      // 아이템 장착
      equipItem: (slot, item) => {
        set({ [slot]: item });
      },

      // 아이템 해제
      unequipItem: (slot) => {
        set({ [slot]: null });
      },

      // 스킬 배우기
      learnSkill: (skillId) => {
        const { learnedSkills } = get();
        if (!learnedSkills.includes(skillId)) {
          set({ learnedSkills: [...learnedSkills, skillId] });
        }
      },

      // 스킬 잊기
      unlearnSkill: (skillId) => {
        const { learnedSkills } = get();
        set({ learnedSkills: learnedSkills.filter((id) => id !== skillId) });
      },

      // 스킬 보유 확인
      hasLearnedSkill: (skillId) => {
        return get().learnedSkills.includes(skillId);
      },

      // 장비 초기화
      resetEquipment: () => {
        set(initialState);
      },

      // 기본 스킬 초기화
      initializeDefaultSkills: () => {
        set({ learnedSkills: DEFAULT_SKILLS });
      },
    }),
    {
      name: "equipment-storage",
      partialize: (state) => ({
        weapon: state.weapon,
        armor: state.armor,
        helmet: state.helmet,
        accessory: state.accessory,
        learnedSkills: state.learnedSkills,
      }),
    }
  )
);

// 유틸리티: 장착 무기 타입 가져오기
export function getEquippedWeaponType(
  weapon: EquippedItem | null
): WeaponType | null {
  if (!weapon) return null;
  return weapon.itemType as WeaponType;
}
