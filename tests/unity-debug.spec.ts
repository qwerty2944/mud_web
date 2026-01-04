import { test, expect } from "@playwright/test";

test("debug game page Unity rendering", async ({ page }) => {
  const logs: string[] = [];
  const errors: string[] = [];

  page.on("console", (msg) => {
    logs.push(`[${msg.type()}] ${msg.text()}`);
  });

  page.on("pageerror", (err) => {
    errors.push(err.message);
  });

  // game 페이지로 이동
  await page.goto("/game");
  await page.waitForTimeout(5000);

  // 현재 URL
  console.log("Current URL:", page.url());

  // 에러 확인
  console.log("Page errors:", errors);

  // Unity 관련 로그
  const unityLogs = logs.filter(
    (l) =>
      l.toLowerCase().includes("unity") ||
      l.includes("UnityBridge") ||
      l.includes("Portal")
  );
  console.log("Unity logs:", unityLogs);

  // warning 로그
  const warnings = logs.filter((l) => l.includes("[warning]") || l.includes("[warn]"));
  console.log("Warnings:", warnings);

  // DOM 검사
  const bodyHTML = await page.evaluate(() => document.body.innerHTML);

  // UnityPortalProvider 관련 요소 찾기
  console.log("Contains 'fixed':", bodyHTML.includes("fixed"));
  console.log("Contains 'overflow-hidden':", bodyHTML.includes("overflow-hidden"));
  console.log("Contains 'Unity':", bodyHTML.includes("Unity"));
  console.log("Contains 'react-unity':", bodyHTML.includes("react-unity"));
  console.log("Contains '로딩':", bodyHTML.includes("로딩"));
  console.log("Contains 'canvas':", bodyHTML.includes("canvas"));

  // 모든 div 클래스 확인
  const allClasses = await page.evaluate(() => {
    const elements = document.querySelectorAll("div");
    return Array.from(elements)
      .map((el) => el.className)
      .filter((c) => c && (c.includes("unity") || c.includes("portal") || c.includes("fixed")));
  });
  console.log("Relevant div classes:", allClasses);

  // game layout 확인 - children과 modal이 렌더링되는지
  const gameLayoutChildren = await page.evaluate(() => {
    // body의 직접 자식들 확인
    return Array.from(document.body.children).map((el) => ({
      tag: el.tagName,
      className: (el as HTMLElement).className?.slice(0, 100),
    }));
  });
  console.log("Body children:", gameLayoutChildren);
});

test("compare character-test vs game page", async ({ page }) => {
  console.log("=== Testing character-test page ===");
  await page.goto("/character-test");
  await page.waitForTimeout(3000);

  const ctHTML = await page.evaluate(() => document.body.innerHTML);
  console.log("character-test has Unity:", ctHTML.includes("react-unity") || ctHTML.includes("Unity"));
  console.log("character-test has loading:", ctHTML.includes("로딩"));

  // 모든 Unity 관련 요소 찾기
  const ctUnityElements = await page.evaluate(() => {
    const all = document.querySelectorAll("*");
    return Array.from(all)
      .filter((el) => el.className?.toString().includes("unity") || el.tagName === "CANVAS")
      .map((el) => ({ tag: el.tagName, class: (el as HTMLElement).className }));
  });
  console.log("character-test Unity elements:", ctUnityElements);

  console.log("\n=== Testing game page ===");
  await page.goto("/game");
  await page.waitForTimeout(3000);

  const gameHTML = await page.evaluate(() => document.body.innerHTML);
  console.log("game has Unity:", gameHTML.includes("react-unity") || gameHTML.includes("Unity"));
  console.log("game has loading:", gameHTML.includes("로딩"));

  // 모든 Unity 관련 요소 찾기
  const gameUnityElements = await page.evaluate(() => {
    const all = document.querySelectorAll("*");
    return Array.from(all)
      .filter((el) => el.className?.toString().includes("unity") || el.tagName === "CANVAS")
      .map((el) => ({ tag: el.tagName, class: (el as HTMLElement).className }));
  });
  console.log("game Unity elements:", gameUnityElements);
});
