# Cho Xe Dap - Admin Portal (Frontend)

Trang quản trị dành cho sàn thương mại điện tử xe đạp thể thao **Cho Xe Dap**. Cung cấp giao diện bảo mật cho Admin và Inspector để quản lý tin đăng, báo cáo, người dùng và theo dõi các chỉ số hệ thống.

## 🚀 Công nghệ sử dụng (Tech Stack)

Hệ thống được xây dựng trên nền tảng React hiện đại, tối ưu hiệu năng và trải nghiệm người dùng:

- **Framework:** React 18
- **Tooling:** Vite 6 + SWC (Siêu nhanh)
- **Language:** TypeScript (Type-safe)
- **Styling:** Tailwind CSS v4 (Utility-first)
- **UI Components:** Radix UI (Headless components) + Shadcn UI
- **Forms & Validation:** React Hook Form + Zod
- **Routing:** React Router v7
- **API Client:** Axios
- **Bot Protection:** Cloudflare Turnstile

## 🛠️ Tính năng chính

### 1. Quản lý Tin đăng (Posting Moderation)
- Kiểm duyệt video (Video chỉ hiển thị sau khi Admin duyệt).
- Phê duyệt / Yêu cầu bổ sung thông tin / Từ chối tin đăng.
- Quản lý trạng thái tin đăng toàn hệ thống.

### 2. Xử lý Báo cáo (Report Handling)
- Tiếp nhận báo cáo từ Inspector.
- Ra quyết định cảnh cáo hoặc cấm tài khoản dựa trên mức độ vi phạm.
- Lịch sử xử lý báo cáo minh bạch.

### 3. Quản lý Người dùng & Danh mục
- Quản lý danh sách người dùng, xem lịch sử hoạt động.
- Quản lý danh mục (Categories) và Thương hiệu (Brands) xe đạp.
- Đình chỉ (Suspend) hoặc Cấm (Ban) các tài khoản vi phạm.

### 4. Dashboard & Thống kê
- Theo dõi các chỉ số tăng trưởng: Tin đăng mới, Giao dịch thành công, Người dùng mới.
- Biểu đồ thống kê doanh thu và hoạt động hệ thống (sử dụng Recharts).

## ⚙️ Cài đặt và Chạy dự án

### Yêu cầu hệ thống
- **Node.js:** v20.x trở lên
- **npm:** v9.x trở lên

### Các bước cài đặt

1. **Cài đặt dependencies:**
   ```bash
   npm install
   ```

2. **Cấu hình biến môi trường:**
   Tạo file `.env.local` dựa trên file `.env.local.template`. Đảm bảo `VITE_API_URL` trỏ đúng về Backend API.

3. **Chạy ở chế độ Development:**
   ```bash
   npm run dev
   ```

4. **Build cho Production:**
   ```bash
   npm run build
   ```

## 🏗️ Quy định phát triển (Development Conventions)

- **Naming:** Sử dụng **kebab-case** cho tên file và **PascalCase** cho các Component.
- **Styling:** Ưu tiên sử dụng utility classes của Tailwind trực tiếp trong JSX.
- **Components:** Sử dụng Functional Components và Hooks.
- **Quality Gate:** Mọi thay đổi phải vượt qua lệnh `npm run build` trước khi tạo Pull Request.

---
*Dự án được phát triển theo kiến trúc Microservices. Xem thêm tài liệu chi tiết tại thư mục `documentation/`.*
