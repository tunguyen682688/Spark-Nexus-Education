# 💻 Workstation Setup Guide (Local Development Setup)

Tài liệu này hướng dẫn chi tiết cách thiết lập môi trường máy chủ cục bộ (Local Development Environment) dành cho kỹ sư phát triển phần mềm của dự án **Spark-Nexus-Ed** chạy trên hệ thống **Windows (Native PowerShell hoặc WSL2)** hoặc **macOS**. 

Hệ thống của chúng tôi được xây dựng trên cấu trúc **Nx Monorepo**, NestJS ở Backend, React/Vite ở Frontend, và PostgreSQL/Redis ở tầng lưu trữ.

---

## 1. Công Cụ Bắt Buộc (Prerequisites)

Trước khi thực hiện bất kỳ câu lệnh nào, bạn bắt buộc phải cài đặt đầy đủ các công cụ sau:

*   **Node.js (LTS Version)**: Phiên bản **v20.x** (Khuyến khích dùng `nvm` hoặc `fnm` để quản lý phiên bản Node).
*   **Docker Desktop**: Cần thiết để khởi chạy PostgreSQL, Redis và BullMQ cục bộ.
*   **Git**: Cấu hình tên và email trùng khớp với thông tin đã cấp quyền trên GitHub.
*   **Nx CLI**: Cài đặt toàn cục để chạy các tác vụ monorepo tối ưu:
    ```bash
    npm install -g nx
    ```

---

## 2. Tích Hợp Quản Lý Biến Môi Trường (Doppler Integration)

Dự án **Spark-Nexus-Ed** sử dụng **Doppler** để quản lý tập trung và đồng bộ hóa các biến môi trường cấu hình mật (Secrets Management) một cách an toàn. Bạn tuyệt đối không được tự ý chia sẻ file `.env` chứa mật khẩu qua chat hay email.

### ⚙️ Hướng dẫn cài đặt và cấu hình Doppler CLI:

#### Bước 2.1: Cài đặt Doppler CLI
*   **macOS (sử dụng Homebrew)**:
    ```bash
    brew install dopplerhq/cli/doppler
    ```
*   **Windows (sử dụng Scoop hoặc tải Installer)**:
    ```powershell
    scoop bucket add doppler https://github.com/dopplerhq/scoop-bucket.git
    scoop install doppler
    ```
*   **Linux / WSL2 (Ubuntu/Debian)**:
    ```bash
    curl -sLf https://dl.doppler.com/public/cli/gpg.DEB-GPG-KEY-doppler | sudo gpg --dearmor -o /usr/share/keyrings/doppler-archive-keyring.gpg
    echo "deb [signed-by=/usr/share/keyrings/doppler-archive-keyring.gpg] https://dl.doppler.com/public/cli/deb/debian any-version main" | sudo tee /etc/apt/sources.list.d/doppler-cli.list
    sudo apt update && sudo apt install doppler
    ```

#### Bước 2.2: Đăng nhập tài khoản Doppler tuyển dụng cấp
Thực hiện lệnh sau trên Terminal và làm theo hướng dẫn trên trình duyệt để liên kết máy workstation của bạn:
```bash
doppler login
```

#### Bước 2.3: Thiết lập liên kết dự án (Doppler Setup)
Di chuyển vào thư mục gốc của dự án đã clone và liên kết với dự án trên Doppler:
```bash
doppler setup
```
*Hệ thống sẽ hiển thị danh sách dự án, hãy chọn:*
*   **Project**: `spark-nexus-ed`
*   **Config**: `dev_local` (hoặc cấu hình tương ứng được Tech Lead chỉ định)

Xác nhận việc lấy biến môi trường thành công bằng lệnh:
```bash
doppler secrets
```

---

## 3. Thiết Lập Mã Nguồn & Cài Đặt (Clone & Installation)

### Bước 3.1: Clone dự án về ổ đĩa cục bộ
Mở PowerShell (Windows) hoặc Terminal (WSL2/macOS) và chạy:
```bash
git clone https://github.com/tumolaha/Spark-Nexus-Ed.git
cd Spark-Nexus-Ed
```

### Bước 3.2: Cài đặt dependencies
Cài đặt toàn bộ các thư viện dùng chung trong Monorepo bằng một lệnh duy nhất:
```bash
npm install
```

---

## 4. Khởi Chạy Hạ Tầng Lưu Trữ (Docker Infrastructure)

Chúng tôi cung cấp tệp cấu hình `docker-compose.yml` định hình toàn bộ hạ tầng cơ sở dữ liệu và hàng đợi phục vụ cho môi trường phát triển local.

### Bước 4.1: Khởi chạy các container dưới dạng chạy ngầm (Detached mode)
```bash
docker-compose up -d
```

### Bước 4.2: Xác thực trạng thái hoạt động của các Containers
```bash
docker ps
```
Bạn phải đảm bảo cả 3 dịch vụ sau đều đang ở trạng thái `Up`:
*   `postgres-sne` (Cơ sở dữ liệu PostgreSQL chính) - Port `5432`
*   `redis-sne` (Bộ nhớ đệm Redis & Lưu trữ hàng đợi) - Port `6379`
*   `bullmq-board-sne` (Dashboard giám sát hàng đợi) - Port `3001`

### 🧹 Docker Cleanup Playbook (Khi Database bị hỏng hoặc lỗi Volume)
Nếu trong quá trình phát triển, cơ sở dữ liệu local của bạn bị lỗi đồng bộ, xung đột dữ liệu mẫu, hãy chạy lệnh dọn dẹp triệt để sau để làm sạch volume và khởi chạy lại từ đầu:
```bash
# Dừng container và xóa toàn bộ dữ liệu lưu trữ (Volumes) cục bộ
docker-compose down -v

# Khởi động lại hạ tầng sạch
docker-compose up -d
```

---

## 5. Khởi Tạo Cơ Sở Dữ Liệu & Seed (Prisma Database Sync)

Chúng tôi sử dụng **Prisma ORM** để quản lý cấu trúc bảng (schema migrations) của cơ sở dữ liệu PostgreSQL.

### Bước 5.1: Đồng bộ cấu trúc bảng và Client cục bộ
Sử dụng Doppler để nạp chuỗi kết nối Database mật (`DATABASE_URL`) và chạy migration:
```bash
doppler run -- npx prisma migrate dev --schema=packages/backend/infrastructure/database/prisma/schema.prisma
```
*Lưu ý: Prisma sẽ đồng bộ cấu trúc bảng tự động và tạo mã nguồn client (`prisma generate`) tương ứng.*

### Bước 5.2: Nạp dữ liệu mẫu ban đầu (Database Seeding)
Nếu đây là lần đầu chạy dự án, hãy nạp dữ liệu mẫu ban đầu (từ vựng mẫu, danh mục từ điển mặc định, cấu hình hệ thống) bằng lệnh:
```bash
doppler run -- npx prisma db seed --schema=packages/backend/infrastructure/database/prisma/schema.prisma
```

---

## 6. Khởi Chạy Các Ứng Dụng (Development Servers)

Sử dụng Nx CLI kết hợp Doppler để nạp cấu hình bí mật và chạy máy chủ phát triển cục bộ.

### 6.1. Khởi chạy Backend API (NestJS)
```bash
doppler run -- npx nx run api-sne:serve --configuration=development
```
*Backend API sẽ được khởi chạy tại địa chỉ: `http://localhost:3000/api/v1`*

### 6.2. Khởi chạy Frontend Application (React / Vite)
```bash
doppler run -- npx nx run frontend-sne:dev
```
*Frontend sẽ chạy trên cổng phát triển mặc định: `http://localhost:4200`*

---

## 7. Khuyến Nghị VS Code Extensions Matrix

Để tối ưu hóa năng suất lập trình và tự động sửa lỗi định dạng code, bạn bắt buộc/khuyến khích cài đặt các extensions sau trên VS Code:

| VS Code Extension | Trạng Thái | Tác Dụng |
| :--- | :--- | :--- |
| **ESLint** (dbaeumer.vscode-eslint) | **Bắt buộc** | Hiển thị và cảnh báo vi phạm quy chuẩn code tĩnh ngay khi đang gõ code. |
| **Prettier - Code formatter** (esbenp.prettier-vscode) | **Bắt buộc** | Tự động định dạng code (Format on Save) theo tiêu chuẩn chung của dự án. |
| **Nx Console** (nrwl.angular-console) | **Khuyến khích** | Giao diện trực quan để chạy các tác vụ Nx, sinh component/module nhanh chóng. |
| **Prisma** (prisma.prisma) | **Bắt buộc** | Syntax highlighting và Auto-complete cho tệp `schema.prisma`. |
| **Tailwind CSS IntelliSense** (bradlc.vscode-tailwindcss) | **Khuyến khích** | Tự động gợi ý class Tailwind, hiển thị mã màu thiết kế trực quan. |
| **Thunder Client** hoặc **Postman** | **Khuyến khích** | Kiểm thử trực tiếp API endpoint trên VS Code không cần chuyển ứng dụng khác. |

---

## 🛠️ Cẩm Nang Sửa Lỗi Chuyên Sâu (Deep Troubleshooting)

### A. Dành Cho Hệ Điều Hành Windows (Native & WSL2)

#### Lỗi A.1: "scripts cannot be loaded because running scripts is disabled on this system"
*   **Nguyên nhân**: Chính sách bảo mật mặc định của PowerShell chặn các file script từ môi trường npm.
*   **Giải pháp**: Mở PowerShell với quyền Administrator và chạy lệnh sau để cho phép chạy script cục bộ:
    ```powershell
    Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
    ```

#### Lỗi A.2: WSL2 không kết nối được localhost đến các cổng Docker Desktop trên Windows
*   **Nguyên nhân**: WSL2 chạy trong một máy ảo hypervisor độc lập, đôi khi cơ chế NAT không tự động map cổng localhost về máy host.
*   **Giải pháp**:
    1.  Đảm bảo đã tích hợp WSL2 trong cài đặt của Docker Desktop (*Settings > Resources > WSL integration* và bật Ubuntu/WSL2 của bạn).
    2.  Tạo hoặc cập nhật tệp cấu hình `C:\Users\<Tên-User>\.wslconfig` trên Windows với cấu hình sau để ép WSL2 map localhost trực tiếp:
        ```ini
        [wsl2]
        localhostForwarding=true
        ```
    3.  Chạy lệnh `wsl --shutdown` trên PowerShell để khởi động lại máy ảo WSL2.

#### Lỗi A.3: node-gyp error khi chạy npm install (Lỗi build native C++ modules)
*   **Nguyên nhân**: Thiếu bộ công cụ biên dịch C++ (C++ Build Tools) cần thiết cho các thư viện mã hóa gốc như `bcrypt` hoặc `argon2`.
*   **Giải pháp**: Mở PowerShell với tư cách Administrator và cài đặt các công cụ build:
    ```powershell
    npm install --global windows-build-tools
    # Hoặc cài đặt qua công cụ Visual Studio Installer và chọn "Desktop development with C++"
    ```

---

### B. Dành Cho Hệ Điều Hành macOS

#### Lỗi B.1: Cảnh báo "The requested image's platform does not match the active platform" khi chạy Docker
*   **Nguyên nhân**: Bạn đang dùng Macbook chip Apple Silicon (M1/M2/M3 - arm64) nhưng Docker image được thiết kế cho kiến trúc Intel (amd64).
*   **Giải pháp**:
    1.  Mở Docker Desktop > *Settings (icon bánh răng)* > *General*.
    2.  Đảm bảo đã tích hợp và chọn **Use Virtualization framework**.
    3.  Chuyển sang mục *Features in development* hoặc *Resources*, bật tùy chọn **Use Rosetta 2 for x86/amd64 emulation on Apple Silicon**.
    4.  Nhấp vào *Apply & restart*.

#### Lỗi B.2: PostgreSQL container bị sập liên tục do lỗi Out of Memory (OOM)
*   **Nguyên nhân**: Docker Desktop trên macOS mặc định chỉ cấp phát tài nguyên RAM tối thiểu (khoảng 2GB), dẫn đến cạn kiệt RAM khi chạy PostgreSQL cùng Redis và các tác vụ nặng.
*   **Giải pháp**:
    1.  Mở Docker Desktop > *Settings* > *Resources*.
    2.  Tăng tài nguyên cấp phát **Memory** lên tối thiểu **4 GB** và **CPUs** lên tối thiểu **4 Cores**.
    3.  Nhấp vào *Apply & restart*.
