import type { Metadata } from "next";
import Link from "next/link";
import { getDoctors } from "@/lib/revita";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Đội ngũ bác sĩ",
  description: "Bác sĩ chuyên khoa Phục hồi chức năng của phòng khám.",
};

export const revalidate = 300;

export default async function BacSiPage() {
  const doctors = await getDoctors().catch(() => []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold">Đội ngũ bác sĩ</h1>
      <p className="mt-2 text-slate-600">
        Chọn bác sĩ để xem lịch làm việc và đặt lịch khám trực tuyến.
      </p>
      {doctors.length === 0 ? (
        <p className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-800">
          Chưa tải được danh sách bác sĩ — máy chủ phòng khám chưa kết nối. Vui
          lòng gọi {SITE.phone}.
        </p>
      ) : (
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {doctors.map((d) => (
            <article key={d.id} className="flex gap-4 rounded-2xl border border-slate-200 p-5">
              {d.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={d.avatar}
                  alt={d.name}
                  className="h-20 w-20 rounded-full object-cover bg-slate-100"
                />
              ) : (
                <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-cyan-100 text-2xl font-bold text-cyan-800">
                  {d.name.charAt(0)}
                </span>
              )}
              <div className="min-w-0">
                <h2 className="font-semibold text-lg">{d.name}</h2>
                <p className="text-sm text-cyan-700">
                  {d.doctor?.specialty?.name ?? "Phục hồi chức năng"}
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  {[
                    d.doctor?.yearsExperience != null
                      ? `${d.doctor.yearsExperience} năm kinh nghiệm`
                      : null,
                    d.doctor?.rating != null
                      ? `★ ${Number(d.doctor.rating).toFixed(1)}`
                      : null,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
                {d.doctor?.description ? (
                  <p className="mt-1 text-sm text-slate-600 line-clamp-3">
                    {d.doctor.description}
                  </p>
                ) : null}
                <Link
                  href={`/dat-lich?doctorId=${encodeURIComponent(d.doctor?.id ?? d.id)}`}
                  className="mt-3 inline-block rounded-full bg-cyan-700 px-4 py-1.5 text-sm font-semibold text-white hover:bg-cyan-800"
                >
                  Đặt lịch với bác sĩ
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
