import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should register a new account and then login with it', async ({ page }) => {
    const timestamp = Date.now();
    const randomEmail = `user_${timestamp}@example.com`;
    const password = 'Password123!';
    const fullName = `Test User ${timestamp}`;
    
    // Generate a random phone number starting with 09 and having 10 digits
    const randomPhone = `09${Math.floor(Math.random() * 90000000 + 10000000)}`;

    // --- STEP 1: REGISTER ---
    // Open login modal
    await page.getByRole('button', { name: 'Đăng nhập' }).click();
    
    // Switch to register tab
    await page.getByRole('tab', { name: 'Đăng ký' }).click();

    // Fill registration info
    await page.getByLabel('Họ và tên', { exact: true }).fill(fullName);
    await page.getByLabel('Email', { exact: true }).fill(randomEmail);
    await page.getByLabel('Số điện thoại', { exact: true }).fill(randomPhone);
    await page.getByLabel('Mật khẩu', { exact: true }).fill(password);
    await page.getByLabel('Xác nhận mật khẩu', { exact: true }).fill(password);

    // Click "Gửi mã OTP"
    await page.getByRole('button', { name: 'Gửi mã OTP' }).click();

    // Fill OTP bypass (123456)
    // Wait for the OTP input to be present and fill it
    const otpInput = page.getByLabel('Mã xác thực OTP', { exact: true });
    await expect(otpInput).toBeVisible({ timeout: 10000 });
    await otpInput.fill('123456');

    // Click "Xác nhận đăng ký"
    await page.getByRole('button', { name: 'Xác nhận đăng ký' }).click();

    // Verify registration success message and redirection to login
    await expect(page.getByText('Đăng ký thành công! Vui lòng đăng nhập.')).toBeVisible();
    
    // --- STEP 2: LOGIN ---
    // The email should be auto-filled in the login form after registration
    await expect(page.getByLabel('Email', { exact: true })).toHaveValue(randomEmail);
    await page.getByLabel('Mật khẩu', { exact: true }).fill(password);

    // Submit login
    await page.locator('form').getByRole('button', { name: 'Đăng nhập' }).click();

    // Verify login success
    // The button name is the first 4 letters of the email prefix in uppercase
    const emailPrefix = randomEmail.split('@')[0].toUpperCase().substring(0, 4);
    const userButton = page.getByRole('button', { name: emailPrefix });
    await expect(userButton).toBeVisible();

    // --- STEP 3: LOGOUT ---
    await userButton.click();
    await page.getByRole('menuitem', { name: 'Đăng xuất' }).click();

    // Verify logout success
    await expect(page.getByRole('button', { name: 'Đăng nhập' })).toBeVisible();
  });

  test('should show validation errors for empty fields', async ({ page }) => {
    await page.getByRole('button', { name: 'Đăng nhập' }).click();
    // Wait for form to be visible
    await expect(page.locator('form').getByRole('button', { name: 'Đăng nhập' })).toBeVisible();
    
    await page.locator('form').getByRole('button', { name: 'Đăng nhập' }).click();

    await expect(page.getByText('Email không hợp lệ')).toBeVisible();
    await expect(page.getByText('Mật khẩu phải có ít nhất 6 ký tự')).toBeVisible();
  });
});
