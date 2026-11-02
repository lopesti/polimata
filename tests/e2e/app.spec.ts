import { test, expect } from "@playwright/test";

test.describe("Polimata smoke", () => {
  test("home carrega", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText(/orquestra|Polimata/i).first()).toBeVisible({
      timeout: 30_000,
    });
  });

  test("health API", async ({ request }) => {
    const res = await request.get("/api/health");
    expect(res.ok()).toBeTruthy();
    const json = await res.json();
    expect(json.ok ?? json.status).toBeTruthy();
  });

  test("navegação revisão", async ({ page }) => {
    await page.goto("/revisao");
    await expect(page.getByRole("heading", { name: /revisão/i })).toBeVisible({
      timeout: 20_000,
    });
  });

  test("stats dashboard", async ({ page }) => {
    await page.goto("/revisao/dashboard");
    await expect(page.getByText(/dashboard de revisão/i)).toBeVisible({
      timeout: 20_000,
    });
  });
});
