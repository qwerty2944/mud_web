/**
 * 아이템 JSON 파일들을 읽어서 items.json 생성
 *
 * 폴더 구조:
 *   public/data/items/
 *   ├── equipment/
 *   │   ├── weapons/*.json
 *   │   ├── armors/*.json
 *   │   └── accessories/*.json
 *   ├── consumables/*.json
 *   ├── materials/*.json
 *   └── misc/*.json
 *
 * 출력:
 *   public/data/items/items.json
 *
 * 사용법: npx tsx scripts/generate-items.ts
 */

import fs from "fs";
import path from "path";

// 경로 설정
const ITEMS_DIR = "public/data/items";
const OUTPUT_FILE = "public/data/items/items.json";

// 카테고리별 폴더
const CATEGORIES = {
  equipment: ["equipment/weapons", "equipment/armors", "equipment/accessories"],
  consumable: ["consumables"],
  material: ["materials"],
  misc: ["misc"],
};

interface BaseItem {
  id: string;
  nameKo: string;
  nameEn: string;
  description: string;
  rarity: string;
  value: number;
  weight: number;
}

interface EquipmentSourceItem extends BaseItem {
  spriteId: string;
  color?: string | null;
  stats?: Record<string, unknown>;
  requirements?: Record<string, unknown>;
}

interface EquipmentSource {
  category: string;
  subcategory: string;
  slot?: string;
  weaponType?: string;
  spriteMapping?: string;
  items: EquipmentSourceItem[];
}

interface ConsumableSourceItem extends BaseItem {
  icon?: string;
  stackSize?: number;
  effect?: Record<string, unknown>;
}

interface ConsumableSource {
  category: string;
  subcategory: string;
  items: ConsumableSourceItem[];
}

interface MaterialSourceItem extends BaseItem {
  icon?: string;
  stackSize?: number;
  dropFrom?: string[];
  craftingUse?: string[];
}

interface MaterialSource {
  category: string;
  subcategory: string;
  items: MaterialSourceItem[];
}

interface OutputItem {
  id: string;
  nameKo: string;
  nameEn: string;
  description: string;
  type: string;
  subtype?: string;
  rarity: string;
  value: number;
  weight: number;
  stackable: boolean;
  stackSize?: number;
  icon?: string;
  // Equipment specific
  slot?: string;
  weaponType?: string;
  spriteId?: string;
  spriteMapping?: string;
  color?: string | null;
  stats?: Record<string, unknown>;
  requirements?: Record<string, unknown>;
  // Consumable specific
  effect?: Record<string, unknown>;
  // Material specific
  dropFrom?: string[];
  craftingUse?: string[];
}

// JSON 파일 찾기
function findJsonFiles(dir: string): string[] {
  const files: string[] = [];
  const fullPath = path.join(ITEMS_DIR, dir);

  if (!fs.existsSync(fullPath)) {
    return files;
  }

  const entries = fs.readdirSync(fullPath, { withFileTypes: true });
  for (const entry of entries) {
    const entryPath = path.join(fullPath, entry.name);
    if (entry.isDirectory()) {
      // 재귀적으로 하위 폴더 탐색
      const subFiles = findJsonFiles(path.join(dir, entry.name));
      files.push(...subFiles.map((f) => path.join(dir, entry.name, f)));
    } else if (entry.name.endsWith(".json")) {
      files.push(entry.name);
    }
  }

  return files;
}

// 장비 아이템 변환
function convertEquipmentItem(
  item: EquipmentSourceItem,
  source: EquipmentSource
): OutputItem {
  return {
    id: item.id,
    nameKo: item.nameKo,
    nameEn: item.nameEn,
    description: item.description,
    type: "equipment",
    subtype: source.subcategory,
    rarity: item.rarity,
    value: item.value,
    weight: item.weight,
    stackable: false,
    slot: source.slot,
    weaponType: source.weaponType,
    spriteId: item.spriteId,
    spriteMapping: source.spriteMapping,
    color: item.color,
    stats: item.stats,
    requirements: item.requirements,
  };
}

// 소비 아이템 변환
function convertConsumableItem(
  item: ConsumableSourceItem,
  source: ConsumableSource
): OutputItem {
  return {
    id: item.id,
    nameKo: item.nameKo,
    nameEn: item.nameEn,
    description: item.description,
    type: "consumable",
    subtype: source.subcategory,
    rarity: item.rarity,
    value: item.value,
    weight: item.weight,
    stackable: true,
    stackSize: item.stackSize || 20,
    icon: item.icon,
    effect: item.effect,
  };
}

// 재료 아이템 변환
function convertMaterialItem(
  item: MaterialSourceItem,
  source: MaterialSource
): OutputItem {
  return {
    id: item.id,
    nameKo: item.nameKo,
    nameEn: item.nameEn,
    description: item.description,
    type: "material",
    subtype: source.subcategory,
    rarity: item.rarity,
    value: item.value,
    weight: item.weight,
    stackable: true,
    stackSize: item.stackSize || 99,
    icon: item.icon,
    dropFrom: item.dropFrom,
    craftingUse: item.craftingUse,
  };
}

// 메인 함수
async function main(): Promise<void> {
  console.log("🔧 아이템 데이터 생성 시작...\n");

  const allItems: OutputItem[] = [];
  const summary = {
    total: 0,
    byType: {} as Record<string, number>,
    bySubtype: {} as Record<string, number>,
    byRarity: {} as Record<string, number>,
  };

  // 1. 장비 파일들 처리
  console.log("📁 장비 파일 처리...");
  for (const subdir of CATEGORIES.equipment) {
    const fullDir = path.join(ITEMS_DIR, subdir);
    if (!fs.existsSync(fullDir)) continue;

    const files = fs.readdirSync(fullDir).filter((f) => f.endsWith(".json"));
    for (const file of files) {
      const filePath = path.join(fullDir, file);
      try {
        const content = fs.readFileSync(filePath, "utf8");
        const source: EquipmentSource = JSON.parse(content);
        if (!source.items) continue;

        console.log(`  - ${subdir}/${file}: ${source.items.length}개`);

        for (const item of source.items) {
          const outputItem = convertEquipmentItem(item, source);
          allItems.push(outputItem);

          summary.byType["equipment"] = (summary.byType["equipment"] || 0) + 1;
          summary.bySubtype[source.subcategory] =
            (summary.bySubtype[source.subcategory] || 0) + 1;
          summary.byRarity[item.rarity] =
            (summary.byRarity[item.rarity] || 0) + 1;
        }
      } catch (err) {
        console.error(`  ❌ ${file} 로드 실패:`, err);
      }
    }
  }

  // 2. 소비 아이템 처리
  console.log("\n📁 소비 아이템 처리...");
  for (const subdir of CATEGORIES.consumable) {
    const fullDir = path.join(ITEMS_DIR, subdir);
    if (!fs.existsSync(fullDir)) continue;

    const files = fs.readdirSync(fullDir).filter((f) => f.endsWith(".json"));
    for (const file of files) {
      const filePath = path.join(fullDir, file);
      try {
        const content = fs.readFileSync(filePath, "utf8");
        const source: ConsumableSource = JSON.parse(content);
        if (!source.items) continue;

        console.log(`  - ${subdir}/${file}: ${source.items.length}개`);

        for (const item of source.items) {
          const outputItem = convertConsumableItem(item, source);
          allItems.push(outputItem);

          summary.byType["consumable"] = (summary.byType["consumable"] || 0) + 1;
          summary.bySubtype[source.subcategory] =
            (summary.bySubtype[source.subcategory] || 0) + 1;
          summary.byRarity[item.rarity] =
            (summary.byRarity[item.rarity] || 0) + 1;
        }
      } catch (err) {
        console.error(`  ❌ ${file} 로드 실패:`, err);
      }
    }
  }

  // 3. 재료 아이템 처리
  console.log("\n📁 재료 아이템 처리...");
  for (const subdir of CATEGORIES.material) {
    const fullDir = path.join(ITEMS_DIR, subdir);
    if (!fs.existsSync(fullDir)) continue;

    const files = fs.readdirSync(fullDir).filter((f) => f.endsWith(".json"));
    for (const file of files) {
      const filePath = path.join(fullDir, file);
      try {
        const content = fs.readFileSync(filePath, "utf8");
        const source: MaterialSource = JSON.parse(content);
        if (!source.items) continue;

        console.log(`  - ${subdir}/${file}: ${source.items.length}개`);

        for (const item of source.items) {
          const outputItem = convertMaterialItem(item, source);
          allItems.push(outputItem);

          summary.byType["material"] = (summary.byType["material"] || 0) + 1;
          summary.bySubtype[source.subcategory] =
            (summary.bySubtype[source.subcategory] || 0) + 1;
          summary.byRarity[item.rarity] =
            (summary.byRarity[item.rarity] || 0) + 1;
        }
      } catch (err) {
        console.error(`  ❌ ${file} 로드 실패:`, err);
      }
    }
  }

  // 4. 기타 아이템 처리
  console.log("\n📁 기타 아이템 처리...");
  for (const subdir of CATEGORIES.misc) {
    const fullDir = path.join(ITEMS_DIR, subdir);
    if (!fs.existsSync(fullDir)) continue;

    const files = fs.readdirSync(fullDir).filter((f) => f.endsWith(".json"));
    for (const file of files) {
      const filePath = path.join(fullDir, file);
      try {
        const content = fs.readFileSync(filePath, "utf8");
        const source = JSON.parse(content);
        if (!source.items) continue;

        console.log(`  - ${subdir}/${file}: ${source.items.length}개`);

        for (const item of source.items) {
          allItems.push({
            ...item,
            type: "misc",
            subtype: source.subcategory || "other",
            stackable: item.stackable ?? true,
            stackSize: item.stackSize || 10,
          });

          summary.byType["misc"] = (summary.byType["misc"] || 0) + 1;
          summary.bySubtype[source.subcategory || "other"] =
            (summary.bySubtype[source.subcategory || "other"] || 0) + 1;
          summary.byRarity[item.rarity] =
            (summary.byRarity[item.rarity] || 0) + 1;
        }
      } catch (err) {
        console.error(`  ❌ ${file} 로드 실패:`, err);
      }
    }
  }

  // 5. 최종 items.json 생성
  summary.total = allItems.length;

  const output = {
    version: "2.0.0",
    generatedAt: new Date().toISOString(),
    items: allItems,
    summary,
  };

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));

  console.log(`\n✅ 생성 완료: ${OUTPUT_FILE}`);
  console.log(`   총 ${summary.total}개 아이템`);
  console.log(`   타입별:`, summary.byType);
  console.log(`   서브타입별:`, summary.bySubtype);
  console.log(`   등급별:`, summary.byRarity);
}

main().catch(console.error);
