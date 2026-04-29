import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test('loads and shows stats', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();
    await expect(page.locator('[data-testid="stat-card"]').first()).toBeVisible();
  });
});

test.describe('Pipelines', () => {
  test('lists pipelines', async ({ page }) => {
    await page.goto('/pipelines');
    await expect(page.getByRole('heading', { name: /pipelines/i })).toBeVisible();
  });

  test('can trigger pipeline run', async ({ page }) => {
    await page.goto('/pipelines');
    const runBtn = page.getByRole('button', { name: /run|trigger/i }).first();
    if (await runBtn.isVisible()) {
      await runBtn.click();
      await expect(page.getByText(/queued|running|triggered/i)).toBeVisible({ timeout: 5000 });
    }
  });
});

test.describe('Errors', () => {
  test('shows error list', async ({ page }) => {
    await page.goto('/errors');
    await expect(page.getByRole('heading', { name: /errors/i })).toBeVisible();
  });
});

test.describe('Analytics', () => {
  test('shows DORA metrics', async ({ page }) => {
    await page.goto('/analytics');
    await expect(page.getByRole('heading', { name: /analytics/i })).toBeVisible();
    await expect(page.getByText(/deploy frequency|success rate/i).first()).toBeVisible({ timeout: 8000 });
  });
});

test.describe('Rollbacks', () => {
  test('shows rollback page', async ({ page }) => {
    await page.goto('/rollbacks');
    await expect(page.getByRole('heading', { name: /rollbacks/i })).toBeVisible();
  });
});

test.describe('Security Scans', () => {
  test('shows scan results', async ({ page }) => {
    await page.goto('/scans');
    await expect(page.getByRole('heading', { name: /security scans/i })).toBeVisible();
    await expect(page.getByText(/critical|high|medium/i).first()).toBeVisible({ timeout: 6000 });
  });
});

test.describe('Canary Deployments', () => {
  test('shows canary page and create form', async ({ page }) => {
    await page.goto('/deployments/canary');
    await expect(page.getByRole('heading', { name: /canary/i })).toBeVisible();
    await page.getByRole('button', { name: /new canary/i }).click();
    await expect(page.getByText(/configure canary/i)).toBeVisible();
  });
});

test.describe('Postmortem', () => {
  test('shows postmortem page', async ({ page }) => {
    await page.goto('/postmortem');
    await expect(page.getByRole('heading', { name: /postmortem/i })).toBeVisible();
  });

  test('generate button shows form', async ({ page }) => {
    await page.goto('/postmortem');
    await page.getByRole('button', { name: /generate report/i }).click();
    await expect(page.getByText(/new incident report/i)).toBeVisible();
  });
});

test.describe('Integrations', () => {
  test('shows integration cards', async ({ page }) => {
    await page.goto('/settings/integrations');
    await expect(page.getByRole('heading', { name: /integrations/i })).toBeVisible();
    await expect(page.getByText(/github/i)).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/gitlab/i)).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Marketplace', () => {
  test('shows skills', async ({ page }) => {
    await page.goto('/agent/marketplace');
    await expect(page.getByRole('heading', { name: /marketplace/i })).toBeVisible();
    await expect(page.getByText(/security audit/i)).toBeVisible({ timeout: 5000 });
  });

  test('install skill works', async ({ page }) => {
    await page.goto('/agent/marketplace');
    const installBtn = page.getByRole('button', { name: /install skill/i }).first();
    await installBtn.click();
    await expect(page.getByText(/installing/i)).toBeVisible({ timeout: 3000 });
    await expect(page.getByText(/installed/i).first()).toBeVisible({ timeout: 5000 });
  });
});
