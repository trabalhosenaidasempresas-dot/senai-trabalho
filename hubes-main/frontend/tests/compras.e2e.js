import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3001';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@secult.com';
const ADMIN_SENHA = process.env.ADMIN_SENHA || 'admin123';

async function login(page) {
  await page.goto(`${BASE_URL}/login`);
  await page.getByLabel('Email').fill(ADMIN_EMAIL);
  await page.getByLabel('Senha').fill(ADMIN_SENHA);
  await page.getByRole('button', { name: /entrar/i }).click();
  await page.waitForURL('**/dashboard');
}

async function ensureLoggedIn(page) {
  const token = await page.evaluate(() => window.localStorage.getItem('token'));
  if (!token) {
    await login(page);
  }
}

test.describe('Compras UI', () => {
  test('should load Compras page and show purchases table', async ({ page }) => {
    await page.goto(BASE_URL);
    await ensureLoggedIn(page);

    await page.click('a[href="/compras"]');
    await page.waitForURL('**/compras');

    const title = await page.locator('h4', { hasText: 'Compras' }).first();
    await expect(title).toBeVisible();

    const table = page.locator('table');
    await expect(table).toBeVisible();

    const rows = page.locator('tbody tr');
    const rowCount = await rows.count();
    await expect(rowCount).toBeGreaterThan(0);
  });
});
