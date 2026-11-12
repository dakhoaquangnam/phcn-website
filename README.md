# Web phòng khám PHCN — Next.js + Revita backend

Web công khai cho phòng khám chuyên khoa Phục hồi chức năng: giới thiệu dịch
vụ/bác sĩ, bài viết sức khỏe, đặt lịch khám trực tuyến, tra cứu lịch hẹn và
hàng đợi. Dữ liệu lấy từ backend Revita (`iamKhang/revita-be`) qua lớp
Backend-for-Frontend (Route Handler của Next.js).

Kiến trúc: **web Next.js (quảng bá + nhận lịch) → Revita backend (vận hành:
lịch hẹn, số thứ tự, thu ngân) → OpenEMR (hồ sơ bệnh án chính)**. Web không
ghi dữ liệu khám chữa trực tiếp.

## Chạy thử

```bash
cp .env.local.example .env.local   # điền REVITA_API_URL + tài khoản dịch vụ
npm install
npm run dev                        # http://localhost:3000
```

Không có backend Revita, web vẫn mở được: các trang hiện thông báo "máy chủ
phòng khám chưa kết nối" thay vì vỡ trang. Đặt lịch sẽ báo lỗi cấu hình cho
đến khi đủ biến môi trường.

## Tài khoản dịch vụ đặt lịch (phương án B)

Web đặt lịch hộ khách bằng một tài khoản **RECEPTIONIST** của Revita, giữ
phía server (JWT cache trong bộ nhớ, tự đăng nhập lại khi hết hạn):

1. Vào trang quản trị Revita → quản lý nhân viên → tạo tài khoản vai trò
   `RECEPTIONIST`, mật khẩu mạnh, chỉ dùng cho web này (không dùng tài khoản
   ADMIN, không dùng chung với nhân viên).
2. Điền `REVITA_SERVICE_EMAIL` / `REVITA_SERVICE_PASSWORD` vào `.env.local`.
3. Không commit file `.env.local`.

Luồng đặt lịch: form web → `POST /api/book` (kiểm tra dữ liệu + rate limit
5 lần/10 phút/IP) → tạo hồ sơ bệnh nhân → đặt lịch (trạng thái `PENDING`,
lễ tân xác nhận sau) → trả mã lịch hẹn cho khách.

## Deploy

- **Vercel (khuyên dùng):** import repo, đặt 3 biến môi trường trên, deploy.
  Nhớ trỏ `REVITA_API_URL` tới backend Revita công khai (không phải
  localhost).
- **Docker trên VPS:** `npm run build` tạo bản `standalone` trong
  `.next/standalone` — chạy bằng `node .next/standalone/server.js` (xem
  `Dockerfile` mẫu của Next.js standalone). Cần đặt biến môi trường khi chạy
  container.
- **Không export tĩnh lên GitHub Pages:** mất SSR/ISR là mất đúng lợi thế SEO
  của Next.js.

## Checklist an ninh trước khi mở ra ngoài

- [ ] Tài khoản dịch vụ là RECEPTIONIST, mật khẩu mạnh, riêng cho web.
- [ ] Reverse proxy chỉ cho phép web gọi đúng endpoint công khai đã kiểm tra
      (xem `workspace/goals/m-ph-ng-kh-m-phcn-v-i-openemr/files/revita-api-cho-web-cong-khai-2026-11-12.md`).
      Chặn các thao tác nội bộ đang để công khai trong Revita: `POST
      /specialties`, `POST /routing/*`, `POST
      /counter-assignment/next-patient|skip-current|rollback`.
- [ ] Bật rate limit/CDN (Vercel Firewall, Cloudflare...) trước `/api/book`.
- [ ] Điền tên/địa chỉ/số điện thoại thật trong `src/lib/site.ts` (đang là
      TODO) và kiểm tra lại JSON-LD.
- [ ] Revita hiện **UNLICENSED** (không có giấy phép, Issue #2 từ 06/11/2026
      chưa có trả lời): việc dùng backend cho phòng khám thương mại cần cân
      nhắc pháp lý riêng; web này (code Next.js) là của phòng khám, không
      phụ thuộc giấy phép Revita.

## Cấu trúc

- `src/lib/revita.ts` — client gọi Revita, chỉ chạy phía server; danh sách
  endpoint cho phép nằm ở đây, không gọi lẻ tẻ nơi khác.
- `src/lib/site.ts` — tên/địa chỉ/liên hệ phòng khám.
- `src/app/api/booking/*` — proxy xem lịch trống (chuyên khoa → bác sĩ →
  dịch vụ → khung giờ). `src/app/api/book` — đặt lịch phương án B.
  `src/app/api/lookup`, `src/app/api/queue` — tra cứu lịch hẹn, hàng đợi.
- `src/app/dat-lich/BookingForm.tsx` — form đặt lịch 5 bước (client).
- `src/app/bai-viet` — blog lấy từ CMS bài viết có sẵn của Revita.
