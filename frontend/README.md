# Hướng dẫn Cài đặt

npx playwright test --ui
npm install -D @playwright/test
Hướng dẫn này cung cấp từng bước để thiết lập dự án trên máy cá nhân từ con số 0.
npm run gen-api

## Yêu cầu Tiên quyết

Trước khi bắt đầu, hãy đảm bảo bạn đã cài đặt các phần mềm sau trên máy:

1.  **Git**
    - Tải xuống và cài đặt từ [git-scm.com](https://git-scm.com/).
    - Kiểm tra cài đặt:
      ```bash
      git --version
      ```
    - **Cấu hình Git (Bắt buộc):**
      Thiết lập tên người dùng và email để gắn với các commit của bạn.
      ```bash
      git config --global user.name "Tên Của Bạn"
      git config --global user.email "email.cua.ban@example.com"
      ```

2.  **Node.js** (bao gồm npm)
    - Tải xuống và cài đặt phiên bản LTS từ [nodejs.org](https://nodejs.org/).
    - Kiểm tra cài đặt:
      ```bash
      node --version
      npm --version
      ```

## Cài đặt

### 1. Clone Repository (Sao chép mã nguồn)

Mở terminal hoặc command prompt và chạy lệnh:

```bash
git clone https://github.com/choxedap/frontend.git
```

### 2. Di chuyển vào thư mục dự án

```bash
cd frontend
```

### 3. Cài đặt thư viện (Dependencies)

Cài đặt các thư viện cần thiết:

```bash
npm install
```

## Chạy ứng dụng

Khởi động server phát triển (local development server):

```bash
npm run dev
```

Mở trình duyệt và truy cập vào đường dẫn hiển thị trong terminal (ví dụ: `http://localhost:5173`) để xem ứng dụng.

## Quy trình Git cơ bản

Dưới đây là một số lệnh cơ bản bạn sẽ thường xuyên sử dụng:

**1. Cập nhật code mới nhất:**

Luôn kéo (pull) code mới nhất về trước khi bắt đầu làm việc để tránh xung đột.

```bash
git fetch origin
git pull
```

**2. Kiểm tra trạng thái:**

Xem các file đã bị thay đổi.

```bash
git status
```

**3. Lưu tạm thay đổi (Stage):**

Chuẩn bị các thay đổi để commit.

```bash
# Thêm tất cả file đã thay đổi
git add .
```

**4. Lưu thay đổi (Commit):**

Lưu các thay đổi của bạn kèm dòng ghi chú mô tả.

```bash
git commit -m "Viết mô tả thay đổi ở đây"
```

**5. Đẩy thay đổi lên server (Push):**

Đẩy các commit của bạn lên remote repository.

```bash
# Đẩy lên branch hiện tại
git push
```

## Branch & Pull Request (PR) workflow

> Mỗi người làm việc trên **1 branch riêng**, không commit trực tiếp lên `main`. Remote mặc định là `origin`, branch chuẩn là `main`.

### 1. Kiểm tra remote và branch mặc định

```bash
git remote -v
git branch -a
```

Nếu bạn cần đảm bảo local đang theo dõi `origin/main`:

```bash
git fetch origin
git checkout main
git pull origin main
```

### 2. Tạo branch riêng cho từng người

Đặt tên branch theo quy ước (ví dụ): `feature/<ten>-<mo-ta-ngan>` hoặc `fix/<ten>-<mo-ta-ngan>`.

```bash
# tạo branch từ main mới nhất
git checkout main
git pull origin main
git checkout -b feature/ten-cua-ban-mo-ta
```

### 3. Làm việc và push branch lên GitHub

```bash
# sau khi commit
git push -u origin feature/ten-cua-ban-mo-ta
```

### 4. Tạo Pull Request khi code xong

- Vào GitHub repo `choxedap/frontend`
- Chọn **Compare & pull request** (hoặc tab **Pull requests** → **New pull request**)
- Base: `main`
- Compare: `feature/ten-cua-ban-mo-ta`
- Mô tả rõ những gì đã làm
- Đợi review/approve rồi mới merge

### 5. Cập nhật branch của bạn với `main` (khi main có thay đổi)

Cách đơn giản:

```bash
git checkout feature/ten-cua-ban-mo-ta
git fetch origin
git merge origin/main
```

Nếu có conflict: sửa conflict → `git add .` → `git commit` → `git push`.
