import type { Metadata } from "next";
import TraCuuForm from "./TraCuuForm";

export const metadata: Metadata = {
  title: "Tra cứu lịch hẹn & hàng đợi",
  description: "Tra cứu lịch hẹn bằng mã và xem hàng đợi đang gọi tại phòng khám.",
};

interface PageProps {
  searchParams: Promise<{ code?: string }>;
}

export default async function TraCuuPage({ searchParams }: PageProps) {
  const { code } = await searchParams;
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold">Tra cứu lịch hẹn &amp; hàng đợi</h1>
      <p className="mt-2 text-slate-600">
        Nhập mã lịch hẹn nhận được khi đặt lịch để xem giờ khám và trạng thái.
      </p>
      <div className="mt-8">
        <TraCuuForm presetCode={code ?? ""} />
      </div>
    </div>
  );
}
