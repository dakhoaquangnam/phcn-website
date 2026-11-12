import type { Metadata } from "next";
import Link from "next/link";
import { getServices } from "@/lib/revita";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Dịch vụ khám & điều trị",
  description:
    "Danh sách dịch vụ phục hồi chức năng của phòng khám: khám, đánh giá và điều trị theo từng chuyên khoa.",
};

export const revalidate = 300;

export default async function DichVuPage() {
  const services = await getServices(100).catch(() => []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold">Dịch vụ khám &amp; điều trị</h1>
      <p className="mt-2 text-slate-600">
        Giá dịch vụ thay đổi theo bác sĩ thực hiện — chọn bác sĩ ở bước đặt lịch
        để xem giá chính xác từng ca.
      </p>
      {services.length === 0 ? (
        <p className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-800">
          Chưa tải được danh sách dịch vụ — máy chủ phòng khám chưa kết nối. Vui
          lòng gọi {SITE.phone} để được tư vấn.
        </p>
      ) : (
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {services.map((s) => (
            <article key={s.id} className="rounded-2xl border border-slate-200 p-5">
              <h2 className="font-semibold text-lg text-cyan-900">{s.name}</h2>
              {s.description ? (
                <p className="mt-1 text-sm text-slate-600">{s.description}</p>
              ) : null}
              <Link
                href="/dat-lich"
                className="mt-4 inline-block rounded-full bg-cyan-700 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-800"
              >
                Đặt lịch dịch vụ này
              </Link>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
