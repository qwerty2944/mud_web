import { test, expect } from "@playwright/test";

test.describe("Unity Loading", () => {
  test("should load Unity on character-test page", async ({ page }) => {
    // Console 로그 수집
    const logs: string[] = [];
    page.on("console", (msg) => {
      logs.push(`[${msg.type()}] ${msg.text()}`);
    });

    // character-test 페이지로 이동
    await page.goto("/character-test");

    // 로딩 텍스트 확인
    const loadingText = page.locator("text=로딩 중...");
    await expect(loadingText).toBeVisible({ timeout: 5000 });

    // Unity 로딩 진행률 확인 (0%에서 증가하는지)
    let progressIncreased = false;
    for (let i = 0; i < 30; i++) {
      const text = await loadingText.textContent();
      console.log(`Loading progress: ${text}`);
      const match = text?.match(/(\d+)%/);
      if (match && parseInt(match[1]) > 0) {
        progressIncreased = true;
        break;
      }
      await page.waitForTimeout(1000);
    }

    // 로딩이 완료되었거나 진행 중인지 확인
    const isLoaded = await page.locator(".react-unity-webgl-canvas").isVisible().catch(() => false);
    const loadingVisible = await loadingText.isVisible().catch(() => false);

    console.log("Logs:", logs.filter((l) => l.includes("unity") || l.includes("Unity") || l.includes("warn") || l.includes("error")));
    console.log("Is loaded:", isLoaded);
    console.log("Progress increased:", progressIncreased);
    console.log("Loading still visible:", loadingVisible);

    expect(progressIncreased || isLoaded).toBe(true);
  });

  test("should check game status page Unity loading", async ({ page }) => {
    // Console 로그 수집
    const logs: string[] = [];
    page.on("console", (msg) => {
      logs.push(`[${msg.type()}] ${msg.text()}`);
    });

    // game 페이지로 이동 (로그인 없이 - 리다이렉트 될 수 있음)
    await page.goto("/game/status");

    await page.waitForTimeout(2000);

    // 현재 URL 확인
    const currentUrl = page.url();
    console.log("Current URL:", currentUrl);

    // 로그인 페이지로 리다이렉트 되었는지 확인
    if (currentUrl.includes("/login")) {
      console.log("Redirected to login - need auth for this test");
      return;
    }

    // 로딩 텍스트 확인
    const loadingText = page.locator("text=캐릭터 로딩 중...");
    if (await loadingText.isVisible().catch(() => false)) {
      console.log("Unity loading visible on status page");

      // 진행률 확인
      for (let i = 0; i < 10; i++) {
        const text = await loadingText.textContent();
        console.log(`Status page loading: ${text}`);
        await page.waitForTimeout(1000);
      }
    }

    console.log("Logs:", logs.slice(-20));
  });

  test("debug: check UnityPortalProvider rendering", async ({ page }) => {
    const logs: string[] = [];
    page.on("console", (msg) => {
      logs.push(`[${msg.type()}] ${msg.text()}`);
    });

    await page.goto("/game");

    await page.waitForTimeout(3000);

    // hidden Unity div 확인
    const hiddenUnity = await page.locator('[class*="-left-"]').count();
    console.log("Hidden Unity divs:", hiddenUnity);

    // Unity provider warning 확인
    const warnings = logs.filter((l) => l.includes("warn") || l.includes("UnityBridge"));
    console.log("Warnings:", warnings);

    // 현재 페이지 상태
    const html = await page.content();
    console.log("Contains Unity loading:", html.includes("캐릭터 로딩 중"));
    console.log("Contains Unity canvas:", html.includes("react-unity-webgl"));
  });
});
