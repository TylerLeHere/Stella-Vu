import { expect, test, type Page } from '@playwright/test';

const firstPhoto = 'Mai wearing a white blouse with green foliage behind her.';
const secondPhoto =
  'Mai holding a camera and wearing a sunhat beside a rocky shore.';

const opener = (page: Page, alt: string) =>
  page.getByRole('link', { name: `Open full-size photograph: ${alt}` });
const viewer = (page: Page) => page.getByRole('dialog');
const shownPhoto = (page: Page, alt: string) =>
  viewer(page).getByRole('img', { name: alt, exact: true });

async function expectNoSidewaysScroll(page: Page) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
}

async function openWithKeyboard(page: Page, alt: string) {
  await opener(page, alt).focus();
  await page.keyboard.press('Enter');
  await expect(viewer(page)).toBeVisible();
}

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('homepage shows her name, real photos, and real links', async ({
  page,
}) => {
  await expect(
    page.getByRole('heading', { level: 1, name: 'Quynh Mai Vu' }),
  ).toBeVisible();

  const photos = page.getByRole('main').getByRole('img');
  await expect(photos).toHaveCount(3);
  for (const photo of await photos.all()) {
    await photo.scrollIntoViewIfNeeded();
    await expect(photo).toHaveAttribute('alt', /\S/);
    await expect
      .poll(() => photo.evaluate((img: HTMLImageElement) => img.naturalWidth))
      .toBeGreaterThan(0);
  }

  await expect(
    page.getByRole('banner').getByRole('link', { name: 'LinkedIn' }),
  ).toHaveAttribute('href', 'https://www.linkedin.com/in/quynhmaivux/');
  await page.getByRole('link', { name: 'About', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'A little about me' }),
  ).toBeInViewport();
  await expectNoSidewaysScroll(page);
});

test('the initial load leaves full-size and unopened gallery photos alone', async ({
  page,
}) => {
  const loaded = await page.evaluate(() =>
    performance.getEntriesByType('resource').map((entry) => entry.name),
  );
  expect(loaded.filter((url) => /\.jpe?g($|\?)/.test(url))).toEqual([]);
  expect(
    loaded.filter((url) =>
      /cafe-cake|pink-pajamas|graduation|sunglasses/.test(url),
    ),
  ).toEqual([]);
});

test('a photo opens the gallery at that photograph', async ({ page }) => {
  await opener(page, secondPhoto).click();
  await expect(viewer(page)).toBeVisible();
  await expect(viewer(page).getByText('2 of 7')).toBeVisible();
  await expect(shownPhoto(page, secondPhoto)).toBeVisible();
});

test('visitors can move between photographs', async ({ page }) => {
  await openWithKeyboard(page, firstPhoto);
  await expect(viewer(page).getByText('1 of 7')).toBeVisible();

  await viewer(page).getByRole('button', { name: 'Next photograph' }).click();
  await expect(viewer(page).getByText('2 of 7')).toBeVisible();
  await expect(shownPhoto(page, secondPhoto)).toBeVisible();

  await page.keyboard.press('ArrowRight');
  await expect(viewer(page).getByText('3 of 7')).toBeVisible();
  await page.keyboard.press('ArrowLeft');
  await expect(viewer(page).getByText('2 of 7')).toBeVisible();

  await viewer(page)
    .getByRole('button', { name: 'Previous photograph' })
    .click();
  await expect(shownPhoto(page, firstPhoto)).toBeVisible();
});

test('Escape closes the gallery and returns focus and scroll position', async ({
  page,
}) => {
  const photo = opener(page, secondPhoto);
  await photo.scrollIntoViewIfNeeded();
  const scrollBefore = await page.evaluate(() => window.scrollY);

  await openWithKeyboard(page, secondPhoto);
  await page.keyboard.press('Escape');

  await expect(viewer(page)).toHaveCount(0);
  await expect(photo).toBeFocused();
  expect(await page.evaluate(() => window.scrollY)).toBe(scrollBefore);
});

test('the page and gallery work at phone size', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'phone projects only');
  await expectNoSidewaysScroll(page);

  const photo = opener(page, firstPhoto);
  await expect(photo).toBeInViewport();
  await photo.tap();
  await expect(viewer(page)).toBeVisible();

  const next = viewer(page).getByRole('button', { name: 'Next photograph' });
  const box = await next.boundingBox();
  expect(box?.width).toBeGreaterThanOrEqual(44);
  expect(box?.height).toBeGreaterThanOrEqual(44);
  await next.tap();
  await expect(viewer(page).getByText('2 of 7')).toBeVisible();

  await viewer(page).getByRole('button', { name: 'Close photo viewer' }).tap();
  await expect(viewer(page)).toHaveCount(0);
  await expectNoSidewaysScroll(page);
});

test.describe('with reduced motion', () => {
  test.use({ contextOptions: { reducedMotion: 'reduce' } });

  test('photos stay still and the gallery still works', async ({
    page,
    isMobile,
  }) => {
    const photo = opener(page, firstPhoto);
    if (!isMobile) {
      const frame = photo.getByRole('figure');
      const before = await frame.evaluate(
        (element) => getComputedStyle(element).transform,
      );
      await photo.hover({ position: { x: 20, y: 20 } });
      await page.waitForTimeout(250);
      expect(
        await frame.evaluate((element) => getComputedStyle(element).transform),
      ).toBe(before);
    }

    await openWithKeyboard(page, firstPhoto);
    await page.keyboard.press('ArrowRight');
    await expect(shownPhoto(page, secondPhoto)).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(viewer(page)).toHaveCount(0);
    await expect(photo).toBeFocused();
  });
});
