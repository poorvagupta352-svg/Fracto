import { test, expect } from '@playwright/test';

test.describe('Auth flow', () => {
  test('login page renders', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();
    await expect(page.getByLabel('Email address')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
  });

  test('signup page renders', async ({ page }) => {
    await page.goto('/signup');
    await expect(page.getByRole('heading', { name: /create.*account/i })).toBeVisible();
  });

  test('unauthenticated user is redirected to login', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });

  test('login page has link to signup', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('link', { name: 'Create one free' })).toBeVisible();
  });

  test('signup page has link to login', async ({ page }) => {
    await page.goto('/signup');
    await expect(page.getByRole('link', { name: 'Sign in' })).toBeVisible();
  });
});
