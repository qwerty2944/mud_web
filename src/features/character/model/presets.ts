// 시작 장비 프리셋 (직업 대신 장비 세트)
export interface StarterPreset {
  id: string;
  name: string;
  description: string;
  icon: string;
  appearance: {
    clothIndex?: number;
    armorIndex?: number;
    pantIndex?: number;
    helmetIndex?: number;
    backIndex?: number;
  };
  // TODO: 시작 무기/아이템 추가
}

export const STARTER_PRESETS: StarterPreset[] = [
  {
    id: "warrior",
    name: "전사",
    description: "튼튼한 갑옷과 검",
    icon: "⚔️",
    appearance: {
      armorIndex: 0,
      pantIndex: 0,
      helmetIndex: 0,
    },
  },
  {
    id: "mage",
    name: "마법사",
    description: "로브와 지팡이",
    icon: "🔮",
    appearance: {
      clothIndex: 0,
      backIndex: 0,
    },
  },
  {
    id: "priest",
    name: "성직자",
    description: "신성한 법의와 지팡이",
    icon: "✨",
    appearance: {
      clothIndex: 1,
      backIndex: 1,
    },
  },
  {
    id: "thief",
    name: "도적",
    description: "가벼운 가죽 장비",
    icon: "🗡️",
    appearance: {
      clothIndex: 2,
      pantIndex: 1,
    },
  },
  {
    id: "archer",
    name: "궁수",
    description: "경갑과 활",
    icon: "🏹",
    appearance: {
      armorIndex: 1,
      pantIndex: 2,
      backIndex: 2,
    },
  },
  {
    id: "none",
    name: "평민",
    description: "아무것도 없이 시작",
    icon: "👤",
    appearance: {},
  },
];

// 성별
export type Gender = "male" | "female";

export const GENDERS = [
  { id: "male" as Gender, name: "남성", icon: "♂" },
  { id: "female" as Gender, name: "여성", icon: "♀" },
];

// 종족 (body index 기반)
export interface Race {
  id: string;
  name: string;
  bodyIndex: number;
  description: string;
}

export const RACES: Race[] = [
  { id: "human", name: "인간", bodyIndex: 0, description: "균형 잡힌 능력치" },
  { id: "elf", name: "엘프", bodyIndex: 1, description: "민첩하고 마법 친화적" },
  { id: "orc", name: "오크", bodyIndex: 2, description: "강인한 체력" },
  { id: "dwarf", name: "드워프", bodyIndex: 3, description: "단단한 방어력" },
  { id: "darkelf", name: "다크엘프", bodyIndex: 4, description: "은밀한 공격" },
  { id: "goblin", name: "고블린", bodyIndex: 5, description: "빠른 이동속도" },
];
