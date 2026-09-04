import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test.describe('Sell Bike Flow', () => {
  test.setTimeout(120000); // Set timeout to 120 seconds for this describe block
  const email = 'choxedap.notify@gmail.com';
  const password = '123456';

  // Path to your existing asset files
  const assetsDir = path.join(__dirname, 'assets');
  const imagePath = path.join(assetsDir, 'sample-img.jpg');
  const videoPath = path.join(assetsDir, 'sample-clip.mp4');

  test('should login and complete the sell flow (handling KYC if needed)', async ({ page }) => {
    // 1. LOGIN
    await page.goto('/');
    await page.getByRole('button', { name: 'Đăng nhập' }).click();
    
    await page.getByLabel('Email', { exact: true }).fill(email);
    await page.getByLabel('Mật khẩu', { exact: true }).fill(password);
    await page.locator('form').getByRole('button', { name: 'Đăng nhập' }).click();

    // Verify login success
    await expect(page.getByRole('button', { name: 'Đăng tin' })).toBeVisible();

    // 2. NAVIGATE TO SELL PAGE AND HANDLE KYC
    await page.getByRole('button', { name: 'Đăng tin' }).click();
    
    // Check if we are on the KYC alert page
    const kycHeading = page.getByRole('heading', { name: 'Xác thực hồ sơ (KYC)' });
    
    // Give it a moment to redirect if needed
    let isKycPage = false;
    try {
        await kycHeading.waitFor({ state: 'visible', timeout: 5000 });
        isKycPage = true;
    } catch (e) {
        // Not on KYC page, maybe already verified
    }

    if (isKycPage) {
        console.log('KYC required. Navigating to profile...');
        await page.getByRole('link', { name: 'Hoàn thiện hồ sơ ngay' }).click();
        await expect(page).toHaveURL(/\/account\/profile/);

        // Wait for profile page to finish loading (wait for the heading)
        await expect(page.getByText('Thông tin cá nhân')).toBeVisible({ timeout: 10000 });

        console.log('Filling profile information...');
        await page.getByRole('button', { name: 'Chỉnh sửa' }).click();
        
        // Helper to fill input by label text in the PageProfile structure
        const fillProfileField = async (labelRegex, value) => {
            // Find the group div that contains the label text
            const fieldGroup = page.locator('div.group').filter({ hasText: labelRegex });
            const input = fieldGroup.locator('input');
            await input.fill(value);
        };

        const randomSuffix = Math.floor(Math.random() * 900000 + 100000); // 6 random digits
        const randomPhone = `09${Math.floor(Math.random() * 90000000 + 10000000)}`;
        const randomBankRepo = `10${randomSuffix}${Math.floor(Math.random() * 1000)}`;

        await fillProfileField(/Họ và tên/, 'Test User ' + randomSuffix);
        await fillProfileField(/Số điện thoại/, randomPhone);
        await fillProfileField(/Địa chỉ/, '123 Test Street, District 1, HCM');
        await fillProfileField(/Tên ngân hàng/, 'Vietcombank');
        await fillProfileField(/Số tài khoản/, randomBankRepo);
        await fillProfileField(/Tên chủ tài khoản/, 'TEST USER');
        
        await page.getByRole('button', { name: 'Lưu thay đổi' }).click();
        
        // Wait for success toast and for the profile to re-load
        await expect(page.getByText('Đã cập nhật thông tin cá nhân!')).toBeVisible();
        await page.waitForTimeout(2000); // Small delay to let the UI refresh

        // Handle Phone Verification if needed (OTP Bypass)
        const verifyBtn = page.locator('#otp-send-btn');
        
        // If button is not immediately visible, wait a bit
        try {
            await verifyBtn.waitFor({ state: 'visible', timeout: 5000 });
        } catch (e) {
            // Button might not appear if already verified
        }

        if (await verifyBtn.isVisible()) {
            console.log('Phone verification required. Sending OTP...');
            await verifyBtn.click();
            
            // Wait for the OTP Dialog to appear
            await expect(page.getByRole('dialog').getByText('Xác nhận mã OTP')).toBeVisible();
            
            console.log('Entering OTP: 123456');
            // Target the OTP input specifically
            const otpInput = page.locator('input[data-slot="input-otp"]');
            await otpInput.fill('123456');
            
            // Click the confirmation button inside the dialog
            await page.getByRole('button', { name: 'Xác nhận mã OTP' }).click();
            
            // Wait for success message
            await expect(page.getByText('Xác thực số điện thoại thành công!')).toBeVisible({ timeout: 10000 });
            console.log('Phone verified successfully.');
        }

        console.log('KYC completed. Returning to sell page...');
        await page.goto('/sell');
    }

    await expect(page).toHaveURL(/\/sell/);

    // Wait for metadata to finish loading
    const loader = page.locator('.animate-spin');
    if (await loader.isVisible()) {
        await expect(loader).not.toBeVisible({ timeout: 15000 });
    }

    // Optional: Clear draft to ensure clean state and placeholders are visible
    const clearDraftBtn = page.getByRole('button', { name: 'Xóa bản nháp' });
    if (await clearDraftBtn.isVisible()) {
        console.log('Clearing existing draft...');
        page.on('dialog', dialog => dialog.accept()); // Auto-confirm the delete dialog
        await clearDraftBtn.click();
        // Wait for page to reload and loader to disappear again
        await page.waitForLoadState('load');
        const postLoader = page.locator('.animate-spin');
        if (await postLoader.isVisible()) {
            await expect(postLoader).not.toBeVisible({ timeout: 15000 });
        }
    }

    // 3. FILL SELL FORM
    const randomTitleNum = Math.floor(Math.random() * 10000);
    const uniqueTitle = `[TEST] Xe đạp thể thao Giant Escape 3 2023 - ${randomTitleNum}`;
    
    // Upload Images
    console.log('Uploading media...');
    const imageInput = page.locator('input[type="file"][accept="image/*"]');
    await imageInput.setInputFiles([imagePath]);
    
    // Upload Video
    const videoInput = page.locator('input[type="file"][accept="video/*"]');
    await videoInput.setInputFiles([videoPath]);

    // Title
    await page.getByPlaceholder(/Ví dụ: Xe đạp Trek/).fill(uniqueTitle);

    // Model
    await page.getByPlaceholder(/Ví dụ: Marlin 7/).fill('Escape 3');

    // Brand (Combobox)
    console.log('Selecting brand...');
    const brandSection = page.locator('div').filter({ hasText: /^Thương hiệu/ }).first();
    await brandSection.getByRole('combobox').click();
    await page.getByPlaceholder('Chọn hoặc nhập thương hiệu').fill('Giant');
    // Wait for the option to be visible and stable
    const brandOption = page.getByRole('option', { name: 'Giant', exact: true });
    await brandOption.waitFor({ state: 'visible' });
    await brandOption.click();

    // Color (Combobox)
    console.log('Selecting color...');
    const colorSection = page.locator('div').filter({ hasText: /^Màu sắc/ }).first();
    await colorSection.getByRole('combobox').click();
    await page.getByPlaceholder('Chọn hoặc nhập màu').fill('Đen');
    
    // Use a more robust way to pick the color option
    // It could be an existing option or the "Sử dụng Đen" button
    const colorOption = page.getByRole('option', { name: 'Đen', exact: true });
    const useColorButton = page.getByRole('button', { name: /Sử dụng "Đen"/i });
    
    await page.waitForTimeout(500); // Give list time to filter
    
    if (await colorOption.isVisible()) {
        await colorOption.click();
    } else {
        await useColorButton.click();
    }

    // Category (Select)
    console.log('Selecting category...');
    const categorySection = page.locator('div').filter({ hasText: /^Dòng xe/ }).first();
    await categorySection.getByRole('combobox').click();
    // Wait for popover and select using regex
    await page.getByRole('option', { name: /Xe đạp địa hình/i }).click();

    // Condition (Select)
    console.log('Selecting condition...');
    const conditionSection = page.locator('div').filter({ hasText: /^Tình trạng xe/ }).first();
    await conditionSection.getByRole('combobox').click();
    await page.getByRole('option', { name: /Như mới 99%/i }).click();

    // Frame Size (Select)
    console.log('Selecting frame size...');
    const frameSizeSection = page.locator('div').filter({ hasText: /^Kích thước khung/ }).first();
    await frameSizeSection.getByRole('combobox').click();
    await page.getByRole('option', { name: /Size M/i }).click();

    // Year
    await page.getByPlaceholder('Ví dụ: 2022').fill('2023');

    // Description
    await page.getByPlaceholder('Hãy mô tả chi tiết về tình trạng xe, các phụ tùng đã thay thế, lịch sử bảo dưỡng...').fill('Xe mới đi được 2 tháng, còn bảo hành chính hãng. Phụ kiện đầy đủ.');

    // Price
    await page.getByPlaceholder('Ví dụ: 15.000.000').fill('8500000');

    // Location (Select)
    console.log('Selecting location...');
    const locationSection = page.locator('div').filter({ hasText: /^Khu vực bán/ }).first();
    await locationSection.getByRole('combobox').click();
    await page.getByRole('option', { name: 'Hà Nội' }).click();

    // Submit form
    await page.getByRole('button', { name: 'Đăng tin ngay' }).click();

    // 4. REVIEW PAGE
    await expect(page).toHaveURL(/\/sell\/review/);

    // Wait for AI check to pass (it shows "Hệ thống AI đang đánh giá bài đăng của bạn...")
    // We expect "Nội dung hợp lệ! AI đã phê duyệt bài đăng này."
    await expect(page.getByText('Nội dung hợp lệ! AI đã phê duyệt bài đăng này.')).toBeVisible({ timeout: 30000 });

    // Click "Đăng tin ngay" (Rocket icon button)
    // There are two "Đăng tin ngay" buttons, one in the sticky panel.
    // The sticky panel one is more likely to be used.
    const finalPostButton = page.getByRole('button', { name: 'Đăng tin ngay' }).last();
    await expect(finalPostButton).toBeEnabled();
    await finalPostButton.click();

    // 5. PRICING PAGE
    await expect(page).toHaveURL(/\/sell\/pricing/);
    console.log('On pricing page. Selecting inspection service...');
    
    // Add Inspection Service ("Thêm dịch vụ")
    const addServiceBtn = page.getByRole('button', { name: 'Thêm dịch vụ' });
    await expect(addServiceBtn).toBeVisible();
    await addServiceBtn.click();
    
    // Verify it changed to "Đã thêm" (optional but good for verification)
    await expect(page.getByRole('button', { name: 'Đã thêm' })).toBeVisible();

    console.log('Proceeding to payment...');
    // Click "Thanh toán ngay"
    const payNowBtn = page.getByRole('button', { name: 'Thanh toán ngay' });
    await expect(payNowBtn).toBeEnabled();
    await payNowBtn.click();

    // 6. CHECKOUT PAGE
    await expect(page).toHaveURL(/\/checkout/);
    console.log('On checkout page. Clicking Bypass Payment...');
    
    // Click "Bypass Payment (Test Only)" button
    const bypassBtn = page.getByRole('button', { name: /Bypass Payment/i });
    await expect(bypassBtn).toBeVisible({ timeout: 10000 });
    await bypassBtn.click();

    // 7. SUCCESS REDIRECTION
    // After bypass, first wait for the toast confirmation
    await expect(page.getByText(/Đã gửi yêu cầu Bypass thành công/i).first()).toBeVisible({ timeout: 10000 });

    // Then wait for the success UI to appear
    console.log('Waiting for success UI...');
    await expect(page.getByText(/Thanh toán thành công/i).first()).toBeVisible({ timeout: 20000 });

    // 8. VERIFY LISTING IN MY ADS
    console.log(`Navigating to My Ads to verify listing status: ${uniqueTitle}`);
    // The app should automatically redirect to /account/seller/my-post after 2 seconds
    await expect(page).toHaveURL(/\/account\/seller\/my-post/, { timeout: 15000 });

    // Find the listing by its UNIQUE title precisely
    const listingCard = page.locator('div.group').filter({ has: page.locator('h3', { hasText: uniqueTitle }) }).first();
    await expect(listingCard).toBeVisible({ timeout: 10000 });

    // Check if status is "Đang hiển thị" within that specific card
    const statusBadge = listingCard.locator('.badge, .inline-flex').filter({ hasText: /Đang hiển thị/i });
    await expect(statusBadge).toBeVisible({ timeout: 5000 });


    console.log('Sell flow completed and verified: Listing is Active!');
  });

  test('should login and complete the featured sell flow (Nổi bật package)', async ({ page }) => {
    // 1. LOGIN
    await page.goto('/');
    await page.getByRole('button', { name: 'Đăng nhập' }).click();
    
    await page.getByLabel('Email', { exact: true }).fill(email);
    await page.getByLabel('Mật khẩu', { exact: true }).fill(password);
    await page.locator('form').getByRole('button', { name: 'Đăng nhập' }).click();

    // Verify login success
    await expect(page.getByRole('button', { name: 'Đăng tin' })).toBeVisible();

    // 2. NAVIGATE TO SELL PAGE
    await page.getByRole('button', { name: 'Đăng tin' }).click();
    
    // Check if we are on the KYC alert page (Skipping detailed KYC handling as it's tested in the first case)
    const kycHeading = page.getByRole('heading', { name: 'Xác thực hồ sơ (KYC)' });
    if (await kycHeading.isVisible({ timeout: 2000 })) {
        console.log('KYC required for featured test. Following KYC flow...');
        await page.getByRole('link', { name: 'Hoàn thiện hồ sơ ngay' }).click();
        await page.getByRole('button', { name: 'Chỉnh sửa' }).click();
        const randomSuffix = Math.floor(Math.random() * 900000 + 100000);
        const randomPhone = `09${Math.floor(Math.random() * 90000000 + 10000000)}`;
        const fillProfileField = async (labelRegex, value) => {
            const fieldGroup = page.locator('div.group').filter({ hasText: labelRegex });
            await fieldGroup.locator('input').fill(value);
        };
        await fillProfileField(/Họ và tên/, 'Test User ' + randomSuffix);
        await fillProfileField(/Số điện thoại/, randomPhone);
        await fillProfileField(/Địa chỉ/, '123 Test Street, District 1, HCM');
        await fillProfileField(/Tên ngân hàng/, 'Vietcombank');
        await fillProfileField(/Số tài khoản/, `10${randomSuffix}`);
        await fillProfileField(/Tên chủ tài khoản/, 'TEST USER');
        await page.getByRole('button', { name: 'Lưu thay đổi' }).click();
        await expect(page.getByText('Đã cập nhật thông tin cá nhân!')).toBeVisible();
        
        const verifyBtn = page.locator('#otp-send-btn');
        if (await verifyBtn.isVisible({ timeout: 3000 })) {
            await verifyBtn.click();
            await page.locator('input[data-slot="input-otp"]').fill('123456');
            await page.getByRole('button', { name: 'Xác nhận mã OTP' }).click();
            await expect(page.getByText('Xác thực số điện thoại thành công!')).toBeVisible();
        }
        await page.goto('/sell');
    }

    await expect(page).toHaveURL(/\/sell/);

    // Optional: Clear draft
    const clearDraftBtn = page.getByRole('button', { name: 'Xóa bản nháp' });
    if (await clearDraftBtn.isVisible({ timeout: 5000 })) {
        page.on('dialog', dialog => dialog.accept());
        await clearDraftBtn.click();
        await page.waitForLoadState('load');
    }

    // 3. FILL SELL FORM
    const randomTitleNum = Math.floor(Math.random() * 10000);
    const uniqueTitle = `[NỔI BẬT] Xe đạp Giant Escape 3 2023 - ${randomTitleNum}`;
    
    console.log('Uploading media...');
    await page.locator('input[type="file"][accept="image/*"]').setInputFiles([imagePath]);
    await page.locator('input[type="file"][accept="video/*"]').setInputFiles([videoPath]);

    await page.getByPlaceholder(/Ví dụ: Xe đạp Trek/).fill(uniqueTitle);
    await page.getByPlaceholder(/Ví dụ: Marlin 7/).fill('Escape 3');

    // Brand
    await page.locator('div').filter({ hasText: /^Thương hiệu/ }).first().getByRole('combobox').click();
    await page.getByPlaceholder('Chọn hoặc nhập thương hiệu').fill('Giant');
    await page.getByRole('option', { name: 'Giant', exact: true }).click();

    // Color
    console.log('Selecting color...');
    await page.locator('div').filter({ hasText: /^Màu sắc/ }).first().getByRole('combobox').click();
    await page.getByPlaceholder('Chọn hoặc nhập màu').fill('Xanh');
    await page.waitForTimeout(1000); // Wait for filtering

    const colorOption = page.getByRole('option', { name: 'Xanh', exact: true });
    const useCustomColor = page.getByText(/Sử dụng "Xanh"/i);

    if (await colorOption.isVisible()) {
        await colorOption.click();
    } else if (await useCustomColor.isVisible()) {
        await useCustomColor.click();
    } else {
        // Fallback: just click the first available option if "Xanh" is not found
        await page.getByRole('option').first().click();
    }

    // Category, Condition, Frame Size
    await page.locator('div').filter({ hasText: /^Dòng xe/ }).first().getByRole('combobox').click();
    await page.getByRole('option', { name: /Xe đạp địa hình/i }).click();

    await page.locator('div').filter({ hasText: /^Tình trạng xe/ }).first().getByRole('combobox').click();
    await page.getByRole('option', { name: /Như mới 99%/i }).click();

    await page.locator('div').filter({ hasText: /^Kích thước khung/ }).first().getByRole('combobox').click();
    await page.getByRole('option', { name: /Size M/i }).click();

    await page.getByPlaceholder('Ví dụ: 2022').fill('2023');
    await page.getByPlaceholder(/Hãy mô tả chi tiết/).fill('Xe bản giới hạn, màu cực đẹp. Bảo hành dài hạn.');
    await page.getByPlaceholder('Ví dụ: 15.000.000').fill('12000000');

    // Location
    await page.locator('div').filter({ hasText: /^Khu vực bán/ }).first().getByRole('combobox').click();
    await page.getByRole('option', { name: 'Hồ Chí Minh' }).click();

    await page.getByRole('button', { name: 'Đăng tin ngay' }).click();

    // 4. REVIEW PAGE
    await expect(page).toHaveURL(/\/sell\/review/);
    await expect(page.getByText('Nội dung hợp lệ! AI đã phê duyệt bài đăng này.')).toBeVisible({ timeout: 30000 });
    await page.getByRole('button', { name: 'Đăng tin ngay' }).last().click();

    // 5. PRICING PAGE - SELECT "NỔI BẬT"
    await expect(page).toHaveURL(/\/sell\/pricing/);
    console.log('On pricing page. Waiting for packages to load...');
    
    // Wait for any loaders to disappear
    const pricingLoader = page.locator('.animate-spin');
    try {
        await expect(pricingLoader).not.toBeVisible({ timeout: 15000 });
    } catch (e) {
        console.log('Pricing loader did not disappear in time, continuing anyway...');
    }

    console.log('Selecting "Nổi bật" package...');
    
    // Direct and robust way: Find the heading with exact text "Nổi bật"
    // Clicking this heading will bubble up to the parent clickable div.
    const featuredHeading = page.getByRole('heading', { name: 'Nổi bật', exact: true });
    await expect(featuredHeading).toBeVisible({ timeout: 20000 });
    await featuredHeading.click();
    
    // Verify it was selected (optional but good: the duration input should appear)
    console.log('Verifying selection and setting duration...');
    const durationInput = page.locator('input[type="number"]');
    await expect(durationInput).toBeVisible({ timeout: 10000 });
    await durationInput.fill('5');

    // Add Inspection Service
    console.log('Adding inspection service...');
    await page.getByRole('button', { name: 'Thêm dịch vụ' }).click();

    // Click "Thanh toán ngay"
    const payNowBtn = page.getByRole('button', { name: 'Thanh toán ngay' });
    await expect(payNowBtn).toBeEnabled();
    await payNowBtn.click();

    // 6. CHECKOUT PAGE
    await expect(page).toHaveURL(/\/checkout/);
    await page.getByRole('button', { name: /Bypass Payment/i }).click();

    // 7. SUCCESS REDIRECTION
    await expect(page.getByText(/Thanh toán thành công/i).first()).toBeVisible({ timeout: 20000 });

    // 8. VERIFY LISTING
    await expect(page).toHaveURL(/\/account\/seller\/my-post/, { timeout: 15000 });
    const listingCard = page.locator('div.group').filter({ has: page.locator('h3', { hasText: uniqueTitle }) }).first();
    await expect(listingCard).toBeVisible({ timeout: 10000 });
    await expect(listingCard.locator('.badge, .inline-flex').filter({ hasText: /Đang hiển thị/i })).toBeVisible();

    console.log('Featured sell flow (Nổi bật) completed and verified!');
  });
});
