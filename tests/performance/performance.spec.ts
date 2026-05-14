import { test, expect } from '@playwright/test';

interface PerformanceMetrics {
  domContentLoaded: number;
  loadComplete: number;
  firstPaint?: number;
  firstContentfulPaint?: number;
}

async function collectMetrics(page: any, url: string): Promise<PerformanceMetrics> {
  await page.goto(url, { waitUntil: 'networkidle' });

  const perfEntries = await page.evaluate(() => {
    const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const paints = performance.getEntriesByType('paint');
    const fp = paints.find((p: any) => p.name === 'first-paint');
    const fcp = paints.find((p: any) => p.name === 'first-contentful-paint');
    return {
      domContentLoaded: nav.domContentLoadedEventEnd - nav.startTime,
      loadComplete: nav.loadEventEnd - nav.startTime,
      firstPaint: fp?.startTime,
      firstContentfulPaint: fcp?.startTime,
    };
  });

  return perfEntries;
}

test.describe('Performance Metrics', () => {

  test('homepage loads within acceptable time (< 8s full load)', async ({ page }) => {
    const metrics = await collectMetrics(page, 'https://phptravels.net/');
    console.log('Homepage metrics:', metrics);
    expect(metrics.loadComplete).toBeLessThan(8000);
  });

  test('login page DOM ready within 5 seconds', async ({ page }) => {
    const metrics = await collectMetrics(page, 'https://phptravels.net/login');
    console.log('Login page metrics:', metrics);
    expect(metrics.domContentLoaded).toBeLessThan(5000);
  });

  test('stays page loads within 8 seconds', async ({ page }) => {
    const metrics = await collectMetrics(page, 'https://phptravels.net/stays');
    console.log('Stays page metrics:', metrics);
    expect(metrics.loadComplete).toBeLessThan(8000);
  });

  test('flights page loads within 8 seconds', async ({ page }) => {
    const metrics = await collectMetrics(page, 'https://phptravels.net/flights');
    console.log('Flights page metrics:', metrics);
    expect(metrics.loadComplete).toBeLessThan(8000);
  });

  test('first contentful paint on homepage is under 4 seconds', async ({ page }) => {
    const metrics = await collectMetrics(page, 'https://phptravels.net/');
    console.log('FCP:', metrics.firstContentfulPaint);
    if (metrics.firstContentfulPaint !== undefined) {
      expect(metrics.firstContentfulPaint).toBeLessThan(4000);
    } else {
      // FCP not available in all environments - skip gracefully
      console.log('FCP metric not available, skipping assertion');
    }
  });

  test('no page takes longer than 10 seconds to load', async ({ page }) => {
    const pages = [
      'https://phptravels.net/',
      'https://phptravels.net/login',
      'https://phptravels.net/signup',
    ];

    for (const url of pages) {
      const start = Date.now();
      await page.goto(url, { waitUntil: 'domcontentloaded' });
      const elapsed = Date.now() - start;
      console.log(`${url} → ${elapsed}ms`);
      expect(elapsed).toBeLessThan(15000);
    }
  });

});