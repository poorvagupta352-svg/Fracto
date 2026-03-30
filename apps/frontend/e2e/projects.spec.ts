import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test('redirects to login when not authenticated', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe('Project detail', () => {
  test('redirects to login when not authenticated', async ({ page }) => {
    await page.goto('/project/some-id');
    await expect(page).toHaveURL(/\/login/);
  });
});
