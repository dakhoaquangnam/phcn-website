// Thông tin phòng khám — TODO: thay địa chỉ/số điện thoại thật trước khi công bố.
export const SITE = {
  name: 'Phòng khám Phục hồi chức năng Bs Thanh Sang',
  shortName: 'PHCN Bs Thanh Sang',
  description:
    'Phòng khám chuyên khoa Phục hồi chức năng: phục hồi sau đột quỵ, sau phẫu thuật khớp gối, đau cơ xương khớp. Đặt lịch trực tuyến, lấy số thứ tự, theo dõi hàng đợi.',
  address: 'TODO: địa chỉ phòng khám',
  phone: 'TODO: số điện thoại phòng khám',
  email: 'dakhoaquangnam@gmail.com',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
};

export const NAV = [
  { href: '/', label: 'Trang chủ' },
  { href: '/dich-vu', label: 'Dịch vụ' },
  { href: '/bac-si', label: 'Bác sĩ' },
  { href: '/bai-viet', label: 'Bài viết' },
  { href: '/tra-cuu', label: 'Tra cứu lịch hẹn' },
  { href: '/dat-lich', label: 'Đặt lịch khám' },
];
