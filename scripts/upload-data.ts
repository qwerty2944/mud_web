/**
 * Supabase Storage에 게임 데이터 JSON 업로드
 * 사용법: npm run upload-data
 *
 * public/data 폴더의 모든 JSON 파일을 game-data 버킷에 업로드
 *
 * 환경변수:
 * - NEXT_PUBLIC_SUPABASE_URL (필수)
 * - SUPABASE_SERVICE_ROLE_KEY 또는 NEXT_PUBLIC_SUPABASE_ANON_KEY
 */

import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

// .env.local 수동 로드
function loadEnv() {
  const envPath = path.join(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, "utf-8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#")) {
        const [key, ...valueParts] = trimmed.split("=");
        if (key && valueParts.length > 0) {
          process.env[key] = valueParts.join("=");
        }
      }
    }
  }
}

loadEnv();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error(
    "환경변수 필요: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY"
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const BUCKET_NAME = "game-data";
const LOCAL_DATA_PATH = path.join(process.cwd(), "public", "data");

// 재귀적으로 모든 JSON 파일 찾기
function findAllJsonFiles(dir: string, baseDir: string = dir): string[] {
  const files: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...findAllJsonFiles(fullPath, baseDir));
    } else if (entry.isFile() && entry.name.endsWith(".json")) {
      // baseDir 기준 상대 경로
      const relativePath = path.relative(baseDir, fullPath);
      files.push(relativePath);
    }
  }

  return files;
}

async function uploadFile(relativePath: string): Promise<boolean> {
  const localPath = path.join(LOCAL_DATA_PATH, relativePath);
  const fileContent = fs.readFileSync(localPath);
  // Storage 경로 (슬래시로 통일)
  const storagePath = relativePath.replace(/\\/g, "/");

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(storagePath, fileContent, {
      contentType: "application/json",
      upsert: true,
    });

  if (error) {
    console.error(`  ❌ ${storagePath}: ${error.message}`);
    return false;
  } else {
    console.log(`  ✅ ${storagePath}`);
    return true;
  }
}

async function main() {
  console.log(`\n📦 Supabase Storage 업로드`);
  console.log(`   버킷: ${BUCKET_NAME}`);
  console.log(`   소스: ${LOCAL_DATA_PATH}\n`);

  // 모든 JSON 파일 찾기
  const jsonFiles = findAllJsonFiles(LOCAL_DATA_PATH);
  console.log(`📁 총 ${jsonFiles.length}개 파일 발견\n`);

  // 폴더별로 그룹화
  const byFolder = new Map<string, string[]>();
  for (const file of jsonFiles) {
    const folder = path.dirname(file) || ".";
    if (!byFolder.has(folder)) {
      byFolder.set(folder, []);
    }
    byFolder.get(folder)!.push(file);
  }

  let successCount = 0;
  let failCount = 0;

  // 폴더별로 업로드
  for (const [folder, files] of byFolder) {
    console.log(`📂 ${folder === "." ? "(root)" : folder}/`);
    for (const file of files) {
      const success = await uploadFile(file);
      if (success) successCount++;
      else failCount++;
    }
    console.log("");
  }

  console.log(`\n🎉 완료: ${successCount}개 성공, ${failCount}개 실패\n`);
}

main();
