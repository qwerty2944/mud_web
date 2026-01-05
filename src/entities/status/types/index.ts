// 상태이상 카테고리
export type StatusCategory = "buff" | "debuff";

// 버프 종류
export type BuffType =
  | "atk_up"      // 공격력 증가
  | "def_up"      // 방어력 증가
  | "spd_up"      // 속도 증가
  | "regen"       // 지속 회복
  | "shield"      // 보호막
  | "magic_boost" // 마법 데미지 증가
  | "counter";    // 반격 자세 (피해 반사)

// 디버프 종류
export type DebuffType =
  | "poison"      // 독 (지속 피해)
  | "burn"        // 화상 (지속 피해)
  | "freeze"      // 빙결 (행동 불가)
  | "slow"        // 둔화 (속도 감소)
  | "blind"       // 실명 (명중 감소)
  | "silence"     // 침묵 (마법 불가)
  | "weaken"      // 약화 (공격력 감소)
  | "stun";       // 기절 (행동 불가)

export type StatusType = BuffType | DebuffType;

// 상태이상 효과
export interface StatusEffect {
  id: string;
  type: StatusType;
  category: StatusCategory;
  nameKo: string;
  nameEn: string;
  icon: string;
  duration: number;       // 남은 턴 수
  value: number;          // 효과 수치 (%, 고정값)
  stackable: boolean;     // 중첩 가능 여부
  currentStacks: number;  // 현재 중첩 수
  maxStacks: number;      // 최대 중첩 수
  source?: string;        // 효과 원인 (스킬 ID 등)
}

// 상태이상 정의 (데이터)
export interface StatusDefinition {
  type: StatusType;
  category: StatusCategory;
  nameKo: string;
  nameEn: string;
  icon: string;
  description: string;
  defaultDuration: number;
  stackable: boolean;
  maxStacks: number;
}

// 상태이상 정의 상수
export const STATUS_DEFINITIONS: Record<StatusType, StatusDefinition> = {
  // 버프
  atk_up: {
    type: "atk_up",
    category: "buff",
    nameKo: "공격 강화",
    nameEn: "Attack Up",
    icon: "⚔️",
    description: "공격력이 증가합니다.",
    defaultDuration: 4,
    stackable: false,
    maxStacks: 1,
  },
  def_up: {
    type: "def_up",
    category: "buff",
    nameKo: "방어 강화",
    nameEn: "Defense Up",
    icon: "🛡️",
    description: "방어력이 증가합니다.",
    defaultDuration: 4,
    stackable: false,
    maxStacks: 1,
  },
  spd_up: {
    type: "spd_up",
    category: "buff",
    nameKo: "속도 강화",
    nameEn: "Speed Up",
    icon: "💨",
    description: "속도가 증가합니다.",
    defaultDuration: 3,
    stackable: false,
    maxStacks: 1,
  },
  regen: {
    type: "regen",
    category: "buff",
    nameKo: "재생",
    nameEn: "Regeneration",
    icon: "💚",
    description: "매 턴 HP가 회복됩니다.",
    defaultDuration: 3,
    stackable: true,
    maxStacks: 3,
  },
  shield: {
    type: "shield",
    category: "buff",
    nameKo: "보호막",
    nameEn: "Shield",
    icon: "🔰",
    description: "피해를 흡수하는 보호막입니다.",
    defaultDuration: 5,
    stackable: false,
    maxStacks: 1,
  },
  magic_boost: {
    type: "magic_boost",
    category: "buff",
    nameKo: "마력 증폭",
    nameEn: "Magic Boost",
    icon: "✨",
    description: "마법 데미지가 증가합니다.",
    defaultDuration: 4,
    stackable: false,
    maxStacks: 1,
  },

  // 디버프
  poison: {
    type: "poison",
    category: "debuff",
    nameKo: "독",
    nameEn: "Poison",
    icon: "☠️",
    description: "매 턴 독 피해를 받습니다.",
    defaultDuration: 4,
    stackable: true,
    maxStacks: 3,
  },
  burn: {
    type: "burn",
    category: "debuff",
    nameKo: "화상",
    nameEn: "Burn",
    icon: "🔥",
    description: "매 턴 화상 피해를 받습니다.",
    defaultDuration: 3,
    stackable: true,
    maxStacks: 3,
  },
  freeze: {
    type: "freeze",
    category: "debuff",
    nameKo: "빙결",
    nameEn: "Freeze",
    icon: "🧊",
    description: "행동할 수 없습니다.",
    defaultDuration: 1,
    stackable: false,
    maxStacks: 1,
  },
  slow: {
    type: "slow",
    category: "debuff",
    nameKo: "둔화",
    nameEn: "Slow",
    icon: "🐌",
    description: "속도가 감소합니다.",
    defaultDuration: 3,
    stackable: false,
    maxStacks: 1,
  },
  blind: {
    type: "blind",
    category: "debuff",
    nameKo: "실명",
    nameEn: "Blind",
    icon: "🌑",
    description: "명중률이 크게 감소합니다.",
    defaultDuration: 2,
    stackable: false,
    maxStacks: 1,
  },
  silence: {
    type: "silence",
    category: "debuff",
    nameKo: "침묵",
    nameEn: "Silence",
    icon: "🤐",
    description: "마법을 사용할 수 없습니다.",
    defaultDuration: 2,
    stackable: false,
    maxStacks: 1,
  },
  weaken: {
    type: "weaken",
    category: "debuff",
    nameKo: "약화",
    nameEn: "Weaken",
    icon: "📉",
    description: "공격력이 감소합니다.",
    defaultDuration: 3,
    stackable: false,
    maxStacks: 1,
  },
  stun: {
    type: "stun",
    category: "debuff",
    nameKo: "기절",
    nameEn: "Stun",
    icon: "💫",
    description: "기절하여 행동할 수 없습니다.",
    defaultDuration: 1,
    stackable: false,
    maxStacks: 1,
  },
  counter: {
    type: "counter",
    category: "buff",
    nameKo: "반격 자세",
    nameEn: "Counter Stance",
    icon: "🥋",
    description: "받는 피해의 일부를 반사합니다.",
    defaultDuration: 2,
    stackable: false,
    maxStacks: 1,
  },
};
