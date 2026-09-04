import { test, expect } from '@playwright/test';

test.describe('Purchase Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should complete a full purchase flow with login, search, filter, chat, and favorite', async ({ page }) => {
    // --- STEP 1: LOGIN ---
    await page.getByRole('button', { name: 'Đăng nhập' }).click();

    // Fill login info
    await page.getByLabel('Email', { exact: true }).fill('admin@choxedap.app');
    await page.getByLabel('Mật khẩu', { exact: true }).fill('123456');

    // Submit login
    await page.locator('form').getByRole('button', { name: 'Đăng nhập' }).click();

    // --- STEP 2: SEARCH & FILTER ---
    // Navigate to Buy page
    await page.getByText('Mua xe').first().click();
    await expect(page).toHaveURL(/\/buy/);

    // Use filter: Select a brand
    // Wait for the select trigger to be visible
    const brandSelect = page.getByLabel('Hãng xe').or(page.locator('button').filter({ hasText: /Chọn hãng/i })).or(page.locator('button').filter({ hasText: /Tất cả hãng/i }));
    await brandSelect.first().click();

    // Select the first brand option that is not "Tất cả hãng"
    const brandOption = page.getByRole('option').nth(1);
    const brandName = await brandOption.innerText();
    await brandOption.click();

    // Wait for products to update (skeleton to disappear and cards to appear)
    // Targeting the first grid within the main content area
    const productGrid = page.locator('main div.grid').first();
    await expect(productGrid).toBeVisible({ timeout: 10000 });

    // Select the first actual product card (avoiding skeletons if possible)
    const firstProduct = productGrid.locator('> div').filter({ has: page.locator('h3') }).first();
    await expect(firstProduct).toBeVisible({ timeout: 10000 });
    const productName = await firstProduct.locator('h3').innerText();
    await firstProduct.click();

    // Verify we are on the detail page
    await expect(page).toHaveURL(/\/listing\/\d+/);
    // Wait for the detail page to be fully loaded (heading visible)
    await expect(page.getByRole('heading', { name: productName, level: 1 }).first()).toBeVisible({ timeout: 10000 });

    // --- STEP 4: CHAT WITH SELLER ---
    // Wait a bit for the page to be interactive
    await page.waitForTimeout(1000);
    await page.getByRole('button', { name: 'Chat ngay' }).click();

    // Verify chat container is visible
    await expect(page.locator('div').filter({ hasText: /Chào bạn, mình quan tâm đến xe/i }).first()).toBeVisible();
    // Close chat container - targeting the close button specifically in the chat window
    const closeChatButton = page.locator('div').filter({ hasText: /Hỗ trợ khách hàng|Chat/i }).locator('button').filter({ has: page.locator('svg') }).first();
    if (await closeChatButton.isVisible()) {
      await closeChatButton.click();
    }


    // Give a small moment for any state updates to settle
    await page.waitForTimeout(1000);

    // --- STEP 6: BUY NOW & PAYMENT BYPASS ---
    const buyNowButton = page.getByRole('button', { name: 'Thanh toán ngay' });
    await expect(buyNowButton).toBeVisible();
    // Wait for the button to be stable (not moving/re-rendering)
    await buyNowButton.scrollIntoViewIfNeeded();
    await buyNowButton.click();
    await expect(page).toHaveURL(/\/checkout/);

    // Start payment process
    await page.getByRole('button', { name: 'Tiến hành thanh toán' }).click();

    // Wait for QR code and Bypass button to appear
    await expect(page.getByRole('button', { name: 'Bypass Payment (Test Only)' })).toBeVisible();
    await page.getByRole('button', { name: 'Bypass Payment (Test Only)' }).click();

    // --- STEP 7: VERIFY PURCHASE HISTORY ---
    // Wait for automatic redirection to history page (SePayCheckout has a 2s delay after success)
    await expect(page).toHaveURL(/\/account\/buyer\/history/, { timeout: 10000 });

    // Verify the product is in the history list
    // Use filter "Tất cả" to ensure we see the latest order
    await page.getByRole('button', { name: 'Tất cả' }).click();
    // Use first() because there might be multiple orders for the same product name
    await expect(page.getByRole('heading', { name: productName }).first()).toBeVisible();
  });
});
