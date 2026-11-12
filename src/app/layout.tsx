import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { SITE, NAV } from "@/lib/site";

const beVietnam = Be_Vietnam_Pro({
  variable: "--font-be-vietnam",
  subsets: ["vietnamese", "latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} — Đặt lịch khám trực tuyến`,
    template: `%s | ${SITE.shortName}`,
  },
  description: SITE.description,
  openGraph: {
    title: SITE.name,
    description: SITE.description,
    type: "website",
    locale: "vi_VN",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "MedicalClinic",
  name: SITE.name,
  description: SITE.description,
  address: SITE.address,
  telephone: SITE.phone,
  email: SITE.email,
  url: SITE.url,
  medicalSpecialty: "PhysicalTherapy",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="vi" className={`${beVietnam.variable} h-full antialiased`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-white text-slate-900">
        <header className="border-b border-slate-200 bg-white sticky top-0 z-40">
          <div className="mx-auto max-w-6xl px-4">
            <div className="flex items-center justify-between py-3">
              <Link href="/" className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-700 text-white text-xl font-bold">
                  +
                </span>
                <span className="leading-tight">
                  <span className="block font-bold text-cyan-900">
                    {SITE.shortName}
                  </span>
                  <span className="block text-xs text-slate-500">
                    Phục hồi chức năng
                  </span>
                </span>
              </Link>
              <nav className="hidden md:flex items-center gap-5 text-sm font-medium">
                {NAV.filter((n) => n.href !== "/dat-lich").map((n) => (
                  <Link
                    key={n.href}
                    href={n.href}
                    className="text-slate-700 hover:text-cyan-700"
                  >
                    {n.label}
                  </Link>
                ))}
              </nav>
              <Link
                href="/dat-lich"
                className="rounded-full bg-cyan-700 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-800"
              >
                Đặt lịch khám
              </Link>
            </div>
            <nav className="flex md:hidden gap-4 overflow-x-auto pb-2 text-sm font-medium">
              {NAV.map((n) => (
                <Link
                  key={n.href}
                  href={n.href}
                  className="whitespace-nowrap text-slate-700 hover:text-cyan-700"
                >
                  {n.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="border-t border-slate-200 bg-slate-50">
          <div className="mx-auto max-w-6xl px-4 py-8 grid gap-6 md:grid-cols-3 text-sm">
            <div>
              <p className="font-bold text-cyan-900">{SITE.name}</p>
              <p className="mt-2 text-slate-600">{SITE.description}</p>
            </div>
            <div>
              <p className="font-semibold">Liên hệ</p>
              <p className="mt-2 text-slate-600">Địa chỉ: {SITE.address}</p>
              <p className="text-slate-600">Điện thoại: {SITE.phone}</p>
              <p className="text-slate-600">Email: {SITE.email}</p>
            </div>
            <div>
              <p className="font-semibold">Dịch vụ trực tuyến</p>
              <ul className="mt-2 space-y-1 text-slate-600">
                <li>
                  <Link href="/dat-lich" className="hover:text-cyan-700">
                    Đặt lịch khám
                  </Link>
                </li>
                <li>
                  <Link href="/tra-cuu" className="hover:text-cyan-700">
                    Tra cứu lịch hẹn / hàng đợi
                  </Link>
                </li>
                <li>
                  <Link href="/bai-viet" className="hover:text-cyan-700">
                    Bài viết sức khỏe
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <p className="border-t border-slate-200 py-4 text-center text-xs text-slate-500">
            Thông tin trên web chỉ mang tính tham khảo, không thay thế tư vấn
            khám chữa bệnh trực tiếp.
          </p>
        </footer>
      </body>
    </html>
  );
}
