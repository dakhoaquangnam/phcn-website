import Link from "next/link";
import { getDoctors, getPosts, getSpecialties } from "@/lib/revita";
import { SITE } from "@/lib/site";

export const revalidate = 300;

function Section({
  title,
  href,
  linkLabel,
  children,
}: {
  title: string;
  href: string;
  linkLabel: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex items-end justify-between">
        <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
        <Link href={href} className="text-sm font-semibold text-cyan-700 hover:underline">
          {linkLabel} →
        </Link>
      </div>
      <div className="mt-6">{children}</div>
    </section>
  );
}

export default async function HomePage() {
  const [specialties, doctors, posts] = await Promise.all([
    getSpecialties().catch(() => []),
    getDoctors().catch(() => []),
    getPosts(3).catch(() => []),
  ]);

  return (
    <>
      <section className="bg-cyan-800 text-white">
        <div className="mx-auto max-w-6xl px-4 py-14 md:py-20">
          <h1 className="max-w-2xl text-3xl md:text-5xl font-bold leading-tight">
            Phục hồi chức năng sau đột quỵ, sau phẫu thuật
          </h1>
          <p className="mt-4 max-w-2xl text-cyan-100">
            {SITE.description} Đặt lịch trực tuyến trong 2 phút, nhận mã lịch
            hẹn và theo dõi hàng đợi ngay trên web.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/dat-lich"
              className="rounded-full bg-white px-6 py-3 font-semibold text-cyan-800 hover:bg-cyan-50"
            >
              Đặt lịch khám
            </Link>
            <Link
              href="/tra-cuu"
              className="rounded-full border border-cyan-200 px-6 py-3 font-semibold text-white hover:bg-cyan-700"
            >
              Tra cứu lịch hẹn
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10">
        <h2 className="text-2xl font-bold">Đặt lịch chỉ 3 bước</h2>
        <ol className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            { n: "1", t: "Chọn chuyên khoa & bác sĩ", d: "Xem bác sĩ đang làm việc, khung giờ trống theo từng ngày." },
            { n: "2", t: "Nhập thông tin", d: "Họ tên, số điện thoại, ngày sinh và người liên hệ khẩn cấp." },
            { n: "3", t: "Nhận mã lịch hẹn", d: "Giữ mã để tra cứu, lấy số thứ tự và theo dõi hàng đợi khi đến khám." },
          ].map((s) => (
            <li key={s.n} className="rounded-2xl border border-slate-200 p-5">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-cyan-100 font-bold text-cyan-800">
                {s.n}
              </span>
              <p className="mt-3 font-semibold">{s.t}</p>
              <p className="mt-1 text-sm text-slate-600">{s.d}</p>
            </li>
          ))}
        </ol>
      </section>

      <Section title="Chuyên khoa" href="/dich-vu" linkLabel="Xem tất cả dịch vụ">
        {specialties.length === 0 ? (
          <p className="text-slate-500">
            Chưa tải được danh sách chuyên khoa — máy chủ phòng khám chưa kết nối. Vui lòng gọi {SITE.phone}.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {specialties.slice(0, 6).map((s) => (
              <Link
                key={s.id}
                href="/dat-lich"
                className="rounded-2xl border border-slate-200 p-5 hover:border-cyan-600"
              >
                <p className="font-semibold text-cyan-900">{s.name}</p>
                {s.description ? (
                  <p className="mt-1 text-sm text-slate-600 line-clamp-3">{s.description}</p>
                ) : null}
              </Link>
            ))}
          </div>
        )}
      </Section>

      <Section title="Bác sĩ" href="/bac-si" linkLabel="Xem tất cả bác sĩ">
        {doctors.length === 0 ? (
          <p className="text-slate-500">
            Chưa tải được danh sách bác sĩ — máy chủ phòng khám chưa kết nối.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {doctors.slice(0, 4).map((d) => (
              <Link
                key={d.id}
                href="/bac-si"
                className="rounded-2xl border border-slate-200 p-5 hover:border-cyan-600"
              >
                <p className="font-semibold">{d.name}</p>
                <p className="text-sm text-cyan-700">{d.doctor?.specialty?.name ?? "Phục hồi chức năng"}</p>
                {d.doctor?.yearsExperience != null ? (
                  <p className="mt-1 text-sm text-slate-600">{d.doctor.yearsExperience} năm kinh nghiệm</p>
                ) : null}
                {d.doctor?.rating != null ? (
                  <p className="mt-1 text-sm text-amber-600">★ {Number(d.doctor.rating).toFixed(1)}</p>
                ) : null}
              </Link>
            ))}
          </div>
        )}
      </Section>

      {posts.length > 0 ? (
        <Section title="Bài viết sức khỏe" href="/bai-viet" linkLabel="Xem tất cả bài viết">
          <div className="grid gap-4 md:grid-cols-3">
            {posts.map((p) => (
              <Link
                key={p.id}
                href={`/bai-viet/${p.slug}`}
                className="rounded-2xl border border-slate-200 p-5 hover:border-cyan-600"
              >
                <p className="font-semibold">{p.title}</p>
                {p.excerpt ? (
                  <p className="mt-1 text-sm text-slate-600 line-clamp-3">{p.excerpt}</p>
                ) : null}
              </Link>
            ))}
          </div>
        </Section>
      ) : null}
    </>
  );
}
