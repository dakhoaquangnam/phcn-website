import type { Metadata } from "next";
import BookingForm from "./BookingForm";
import { getSpecialties } from "@/lib/revita";

export const metadata: Metadata = {
  title: "Đặt lịch khám",
  description:
    "Đặt lịch khám phục hồi chức năng trực tuyến: chọn chuyên khoa, bác sĩ, khung giờ trống và nhận mã lịch hẹn.",
};

export const revalidate = 300;

interface PageProps {
  searchParams: Promise<{ doctorId?: string }>;
}

export default async function DatLichPage({ searchParams }: PageProps) {
  const { doctorId } = await searchParams;
  const specialties = await getSpecialties().catch(() => []);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold">Đặt lịch khám</h1>
      <p className="mt-2 text-slate-600">
        Không cần tạo tài khoản — điền thông tin bên dưới, phòng khám sẽ giữ chỗ
        và xác nhận lại qua điện thoại.
      </p>
      <div className="mt-8">
        <BookingForm specialties={specialties} presetDoctorId={doctorId ?? ""} />
      </div>
    </div>
  );
}
