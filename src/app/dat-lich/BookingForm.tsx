"use client";

import { useEffect, useState } from "react";
import { addDaysISO, formatVND, todayISO } from "@/lib/utils";
import type { AvailableDoctor, DoctorService, Slot, Specialty } from "@/lib/revita";

interface BookResult {
  appointmentCode: string;
  doctorName?: string;
  serviceName?: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
}

async function getJSON<T>(url: string): Promise<T> {
  const res = await fetch(url);
  const data = (await res.json()) as T & { error?: string };
  if (!res.ok) throw new Error(data.error ?? "Lỗi máy chủ.");
  return data;
}

export default function BookingForm({
  specialties,
  presetDoctorId = "",
}: {
  specialties: Specialty[];
  presetDoctorId?: string;
}) {

  const [specialtyId, setSpecialtyId] = useState("");
  const [date, setDate] = useState(todayISO());
  const [doctors, setDoctors] = useState<AvailableDoctor[]>([]);
  const [doctorId, setDoctorId] = useState(presetDoctorId);
  const [services, setServices] = useState<DoctorService[]>([]);
  const [serviceId, setServiceId] = useState("");
  const [slots, setSlots] = useState<Slot[]>([]);
  const [slot, setSlot] = useState<Slot | null>(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("Nữ");
  const [address, setAddress] = useState("");
  const [ecName, setEcName] = useState("");
  const [ecPhone, setEcPhone] = useState("");

  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [loadingServices, setLoadingServices] = useState(!!presetDoctorId);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<BookResult | null>(null);

  // Bước 1: chọn chuyên khoa + ngày -> bác sĩ có lịch.
  // (Reset lựa chọn phụ thuộc nằm ở onChange; effect chỉ fetch.)
  useEffect(() => {
    if (!specialtyId || !date || presetDoctorId) return;
    getJSON<{ doctors: AvailableDoctor[] }>(
      `/api/booking/doctors?specialtyId=${encodeURIComponent(specialtyId)}&date=${date}`,
    )
      .then((d) => setDoctors(d.doctors ?? []))
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoadingDoctors(false));
  }, [specialtyId, date, presetDoctorId]);

  // Bước 2: chọn bác sĩ + ngày -> dịch vụ (kèm giá)
  useEffect(() => {
    if (!doctorId || !date) return;
    getJSON<{ services: DoctorService[] }>(
      `/api/booking/services?doctorId=${encodeURIComponent(doctorId)}&date=${date}`,
    )
      .then((d) => setServices(d.services ?? []))
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoadingServices(false));
  }, [doctorId, date]);

  // Bước 3: chọn dịch vụ -> khung giờ trống
  useEffect(() => {
    if (!doctorId || !serviceId || !date) return;
    getJSON<{ slots: Slot[] }>(
      `/api/booking/slots?doctorId=${encodeURIComponent(doctorId)}&serviceId=${encodeURIComponent(serviceId)}&date=${date}`,
    )
      .then((d) => setSlots(d.slots ?? []))
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoadingSlots(false));
  }, [doctorId, serviceId, date]);

  function onSpecialtyChange(v: string) {
    setSpecialtyId(v);
    setDoctors([]);
    setDoctorId("");
    setServices([]);
    setServiceId("");
    setSlots([]);
    setSlot(null);
    setLoadingDoctors(true);
  }

  function onDateChange(v: string) {
    setDate(v);
    if (!presetDoctorId) {
      setDoctors([]);
      setDoctorId("");
      setLoadingDoctors(true);
    }
    setServices([]);
    setServiceId("");
    setSlots([]);
    setSlot(null);
    if (doctorId) setLoadingServices(true);
  }

  function onDoctorChange(v: string) {
    setDoctorId(v);
    setServices([]);
    setServiceId("");
    setSlots([]);
    setSlot(null);
    setLoadingServices(true);
  }

  function onServiceChange(v: string) {
    setServiceId(v);
    setSlots([]);
    setSlot(null);
    setLoadingSlots(true);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!slot) {
      setError("Vui lòng chọn khung giờ khám.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          dateOfBirth,
          gender,
          address,
          emergencyContactName: ecName,
          emergencyContactPhone: ecPhone,
          doctorId,
          serviceId,
          date,
          startTime: slot.startTime,
          endTime: slot.endTime,
        }),
      });
      const data = (await res.json()) as BookResult & { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Đặt lịch thất bại.");
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đặt lịch thất bại.");
    } finally {
      setSubmitting(false);
    }
  }

  if (result) {
    return (
      <div className="rounded-2xl border border-green-300 bg-green-50 p-6">
        <h2 className="text-xl font-bold text-green-800">Đặt lịch thành công</h2>
        <p className="mt-2 text-slate-700">
          Mã lịch hẹn của bạn là{" "}
          <strong className="text-lg tracking-widest text-green-800">
            {result.appointmentCode}
          </strong>
        </p>
        <p className="mt-1 text-slate-700">
          {result.doctorName ? `Bác sĩ ${result.doctorName} · ` : ""}
          {result.serviceName ?? ""} · {result.date} · {result.startTime} –{" "}
          {result.endTime}
        </p>
        <p className="mt-3 text-sm text-slate-600">
          Vui lòng đến đúng giờ, mang theo mã này để lấy số thứ tự. Lễ tân sẽ
          xác nhận lịch hẹn (trạng thái hiện tại: {result.status}).
        </p>
        <a
          href={`/tra-cuu?code=${encodeURIComponent(result.appointmentCode)}`}
          className="mt-4 inline-block rounded-full bg-cyan-700 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-800"
        >
          Tra cứu lịch hẹn này
        </a>
      </div>
    );
  }

  const inputCls =
    "w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-cyan-600 focus:outline-none";

  return (
    <form onSubmit={submit} className="space-y-8">
      {specialties.length === 0 && !presetDoctorId ? (
        <p className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-800">
          Chưa tải được danh sách chuyên khoa — máy chủ phòng khám chưa kết nối.
          Vui lòng thử lại sau hoặc gọi phòng khám.
        </p>
      ) : null}

      <fieldset>
        <legend className="font-semibold text-lg">1. Chọn chuyên khoa &amp; ngày khám</legend>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <label className="block">
            <span className="text-sm text-slate-600">Chuyên khoa</span>
            <select
              className={inputCls}
              value={specialtyId}
              onChange={(e) => onSpecialtyChange(e.target.value)}
              required={!presetDoctorId}
            >
              <option value="">— Chọn chuyên khoa —</option>
              {specialties.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-sm text-slate-600">Ngày khám</span>
            <input
              type="date"
              className={inputCls}
              value={date}
              min={todayISO()}
              max={addDaysISO(30)}
              onChange={(e) => onDateChange(e.target.value)}
              required
            />
          </label>
        </div>
      </fieldset>

      {!presetDoctorId ? (
        <fieldset>
          <legend className="font-semibold text-lg">2. Chọn bác sĩ</legend>
          {loadingDoctors ? (
            <p className="mt-2 text-slate-500">Đang tải bác sĩ...</p>
          ) : doctors.length === 0 ? (
            <p className="mt-2 text-slate-500">
              {specialtyId
                ? "Không có bác sĩ làm việc ngày này. Vui lòng chọn ngày khác."
                : "Chọn chuyên khoa và ngày khám để xem bác sĩ."}
            </p>
          ) : (
            <div className="mt-3 grid gap-2">
              {doctors.map((d) => (
                <label
                  key={d.doctorId}
                  className={`flex cursor-pointer items-center justify-between rounded-xl border p-3 ${
                    doctorId === d.doctorId ? "border-cyan-600 bg-cyan-50" : "border-slate-200"
                  }`}
                >
                  <span>
                    <input
                      type="radio"
                      name="doctor"
                      className="mr-2"
                      checked={doctorId === d.doctorId}
                      onChange={() => onDoctorChange(d.doctorId)}
                    />
                    <strong>{d.doctorName}</strong>
                    <span className="text-slate-600"> · {d.specialtyName}</span>
                    <span className="text-slate-500"> · ★ {d.rating}</span>
                  </span>
                  <span className="text-sm text-slate-500">
                    {d.workSessionStart.slice(11, 16)} – {d.workSessionEnd.slice(11, 16)}
                  </span>
                </label>
              ))}
            </div>
          )}
        </fieldset>
      ) : null}

      <fieldset>
        <legend className="font-semibold text-lg">
          {presetDoctorId ? "2. Chọn dịch vụ & khung giờ" : "3. Chọn dịch vụ"}
        </legend>
        {loadingServices ? (
          <p className="mt-2 text-slate-500">Đang tải dịch vụ...</p>
        ) : services.length === 0 ? (
          <p className="mt-2 text-slate-500">
            {doctorId ? "Bác sĩ không có dịch vụ ngày này." : "Chọn bác sĩ trước."}
          </p>
        ) : (
          <div className="mt-3 grid gap-2">
            {services.map((s) => (
              <label
                key={s.serviceId}
                className={`flex cursor-pointer items-center justify-between rounded-xl border p-3 ${
                  serviceId === s.serviceId ? "border-cyan-600 bg-cyan-50" : "border-slate-200"
                }`}
              >
                <span>
                  <input
                    type="radio"
                    name="service"
                    className="mr-2"
                    checked={serviceId === s.serviceId}
                    onChange={() => onServiceChange(s.serviceId)}
                  />
                  <strong>{s.serviceName}</strong>
                  {s.timePerPatient ? (
                    <span className="text-slate-500"> · {s.timePerPatient} phút/ca</span>
                  ) : null}
                </span>
                <span className="font-semibold text-cyan-800">{formatVND(s.price)}</span>
              </label>
            ))}
          </div>
        )}
      </fieldset>

      {serviceId ? (
        <fieldset>
          <legend className="font-semibold text-lg">4. Chọn khung giờ</legend>
          {loadingSlots ? (
            <p className="mt-2 text-slate-500">Đang tải khung giờ...</p>
          ) : slots.filter((s) => s.isAvailable).length === 0 ? (
            <p className="mt-2 text-slate-500">Hết khung giờ trống ngày này. Vui lòng chọn ngày khác.</p>
          ) : (
            <div className="mt-3 flex flex-wrap gap-2">
              {slots.map((s) =>
                s.isAvailable ? (
                  <button
                    type="button"
                    key={`${s.startTime}-${s.endTime}`}
                    onClick={() => setSlot(s)}
                    className={`rounded-full border px-4 py-2 text-sm font-semibold ${
                      slot?.startTime === s.startTime
                        ? "border-cyan-700 bg-cyan-700 text-white"
                        : "border-slate-300 hover:border-cyan-600"
                    }`}
                  >
                    {s.startTime.slice(0, 5)} – {s.endTime.slice(0, 5)}
                  </button>
                ) : null,
              )}
            </div>
          )}
        </fieldset>
      ) : null}

      <fieldset>
        <legend className="font-semibold text-lg">5. Thông tin bệnh nhân</legend>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <label className="block">
            <span className="text-sm text-slate-600">Họ tên *</span>
            <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} required />
          </label>
          <label className="block">
            <span className="text-sm text-slate-600">Số điện thoại *</span>
            <input
              className={inputCls}
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="09xxxxxxxx"
              required
            />
          </label>
          <label className="block">
            <span className="text-sm text-slate-600">Ngày sinh *</span>
            <input
              className={inputCls}
              type="date"
              value={dateOfBirth}
              max={todayISO()}
              onChange={(e) => setDateOfBirth(e.target.value)}
              required
            />
          </label>
          <label className="block">
            <span className="text-sm text-slate-600">Giới tính *</span>
            <select className={inputCls} value={gender} onChange={(e) => setGender(e.target.value)}>
              <option value="Nữ">Nữ</option>
              <option value="Nam">Nam</option>
              <option value="Khác">Khác</option>
            </select>
          </label>
          <label className="block md:col-span-2">
            <span className="text-sm text-slate-600">Địa chỉ</span>
            <input className={inputCls} value={address} onChange={(e) => setAddress(e.target.value)} />
          </label>
          <label className="block">
            <span className="text-sm text-slate-600">Người liên hệ khẩn cấp *</span>
            <input className={inputCls} value={ecName} onChange={(e) => setEcName(e.target.value)} required />
          </label>
          <label className="block">
            <span className="text-sm text-slate-600">SĐT người liên hệ *</span>
            <input
              className={inputCls}
              type="tel"
              value={ecPhone}
              onChange={(e) => setEcPhone(e.target.value)}
              placeholder="09xxxxxxxx"
              required
            />
          </label>
        </div>
      </fieldset>

      {error ? (
        <p className="rounded-xl border border-red-300 bg-red-50 p-4 text-red-700">{error}</p>
      ) : null}

      <button
        type="submit"
        disabled={submitting || !slot}
        className="w-full rounded-full bg-cyan-700 px-6 py-3 font-semibold text-white hover:bg-cyan-800 disabled:opacity-50"
      >
        {submitting ? "Đang đặt lịch..." : "Xác nhận đặt lịch"}
      </button>
      <p className="text-center text-xs text-slate-500">
        Lịch hẹn tạo ra ở trạng thái chờ xác nhận — lễ tân sẽ gọi điện xác nhận trước giờ khám.
      </p>
    </form>
  );
}
