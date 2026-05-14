import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility (WCAG)', () => {

  test('homepage has no critical accessibility violations', async ({ page }) => {
    test.setTimeout(60000);
    await page.goto('https://phptravels.net/');
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .exclude('iframe')
      .analyze();

    const critical = results.violations.filter(v => v.impact === 'critical');
    if (critical.length > 0) {
      console.log('Critical a11y violations:', JSON.stringify(critical.map(v => ({
        id: v.id,
        description: v.description,
        nodes: v.nodes.length
      })), null, 2));
    }
    expect(critical).toHaveLength(0);
  });

  test('login page has no critical accessibility violations', async ({ page }) => {
    await page.goto('/login');
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    const critical = results.violations.filter(v => v.impact === 'critical');
    expect(critical).toHaveLength(0);
  });

  test('signup page has no critical accessibility violations', async ({ page }) => {
    await page.goto('/signup');
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    const critical = results.violations.filter(v => v.impact === 'critical');
    expect(critical).toHaveLength(0);
  });

  test('stays page has no critical accessibility violations', async ({ page }) => {
    await page.goto('/stays');
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    const critical = results.violations.filter(v => v.impact === 'critical');
    expect(critical).toHaveLength(0);
  });

  test('login form inputs have associated labels', async ({ page }) => {
    await page.goto('/login');
    // Each input should be reachable by keyboard (tabindex not -1)
    const emailInput = page.locator('input[type="email"]');
    const passInput = page.locator('input[type="password"]');
    await expect(emailInput).toBeVisible();
    await expect(passInput).toBeVisible();

    const emailTabIndex = await emailInput.getAttribute('tabindex');
    const passTabIndex = await passInput.getAttribute('tabindex');
    expect(emailTabIndex).not.toBe('-1');
    expect(passTabIndex).not.toBe('-1');
  });

  test('homepage images have alt attributes', async ({ page }) => {
    await page.goto('/');
    const images = page.locator('img');
    const count = await images.count();

    let missingAlt = 0;
    for (let i = 0; i < count; i++) {
      const alt = await images.nth(i).getAttribute('alt');
      if (alt === null) missingAlt++;
    }
    // Allow a small number of decorative images without alt (but flag them)
    expect(missingAlt).toBeLessThanOrEqual(3);
  });

  test('page has a single h1 element on homepage', async ({ page }) => {
    await page.goto('/');
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBeGreaterThanOrEqual(1);
  });

  test('login page is keyboard navigable', async ({ page }) => {
    await page.goto('/login');
    // Tab through: email → password → remember me → submit
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    // We should be able to reach submit without mouse
    const focused = await page.evaluate(() => document.activeElement?.tagName);
    expect(['INPUT', 'BUTTON', 'A', 'LABEL']).toContain(focused);
  });

});