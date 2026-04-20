import { test, expect } from '@playwright/test';

test.describe('Settings and guide sync', () => {
  test('toggling a service in settings is reflected on guide without reload', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem(
        'tv-guide-preferences',
        JSON.stringify({
          selectedServices: [],
          selectedSport: 'all',
          onboardingComplete: true,
        }),
      );
    });
    await page.reload();
    await page.waitForLoadState('networkidle');
    await expect(page.getByTestId('guide-screen')).toBeVisible({ timeout: 15_000 });

    await page.getByRole('link', { name: 'Settings' }).click();
    await expect(page.getByTestId('settings-screen')).toBeVisible({ timeout: 10_000 });

    await page.getByText('YouTube TV').click();
    await page.getByText('Peacock').click();

    await page.getByRole('link', { name: 'Guide' }).click();
    await expect(page.getByTestId('guide-screen')).toBeVisible({ timeout: 10_000 });

    const prefs = await page.evaluate(() => {
      const raw = localStorage.getItem('tv-guide-preferences');
      return raw ? JSON.parse(raw) : null;
    });
    expect(prefs.selectedServices).toContain('youtube-tv');
    expect(prefs.selectedServices).toContain('peacock');
    expect(prefs.selectedServices).toHaveLength(2);
  });

  test('deselecting a service in settings removes it from guide preferences', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem(
        'tv-guide-preferences',
        JSON.stringify({
          selectedServices: ['youtube-tv', 'espn-plus', 'peacock'],
          selectedSport: 'all',
          onboardingComplete: true,
        }),
      );
    });
    await page.reload();
    await page.waitForLoadState('networkidle');
    await expect(page.getByTestId('guide-screen')).toBeVisible({ timeout: 15_000 });

    await page.getByRole('link', { name: 'Settings' }).click();
    await expect(page.getByTestId('settings-screen')).toBeVisible({ timeout: 10_000 });

    await page.getByTestId('settings-screen').getByText('ESPN+').click();

    await page.getByRole('link', { name: 'Guide' }).click();
    await expect(page.getByTestId('guide-screen')).toBeVisible({ timeout: 10_000 });

    const prefs = await page.evaluate(() => {
      const raw = localStorage.getItem('tv-guide-preferences');
      return raw ? JSON.parse(raw) : null;
    });
    expect(prefs.selectedServices).not.toContain('espn-plus');
    expect(prefs.selectedServices).toContain('youtube-tv');
    expect(prefs.selectedServices).toContain('peacock');
  });
});
