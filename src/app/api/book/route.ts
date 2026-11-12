import { NextResponse } from 'next/server';
import {
  bookAppointmentAsService,
  createPatientProfileAsService,
  RevitaError,
} from '@/lib/revita';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { isValidDateString, isValidVNPhone } from '@/lib/utils';

// POST /api/book — đặt lịch hộ khách (phương án B).
// Trình duyệt gửi form -> Route Handler kiểm tra dữ liệu + chống spam,
// rồi dùng JWT tài khoản lễ tân (chỉ nằm phía server) để tạo hồ sơ và đặt lịch.
export async function POST(req: Request) {
  const ip = getClientIp(req);
  if (!checkRateLimit(ip, 5, 10 * 60 * 1000)) {
    return NextResponse.json(
      { error: 'Bạn gửi quá nhiều yêu cầu. Vui lòng thử lại sau 10 phút.' },
      { status: 429 },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'Dữ liệu gửi lên không hợp lệ.' }, { status: 400 });
  }

  const str = (v: unknown) => (typeof v === 'string' ? v.trim() : '');
  const name = str(body.name);
  const phone = str(body.phone);
  const dateOfBirth = str(body.dateOfBirth);
  const gender = str(body.gender);
  const address = str(body.address);
  const emergencyContactName = str(body.emergencyContactName);
  const emergencyContactPhone = str(body.emergencyContactPhone);
  const doctorId = str(body.doctorId);
  const serviceId = str(body.serviceId);
  const date = str(body.date);
  const startTime = str(body.startTime);
  const endTime = str(body.endTime);

  if (name.length < 2) {
    return NextResponse.json({ error: 'Vui lòng nhập họ tên.' }, { status: 400 });
  }
  if (!isValidVNPhone(phone)) {
    return NextResponse.json({ error: 'Số điện thoại không hợp lệ.' }, { status: 400 });
  }
  if (!isValidDateString(dateOfBirth) || new Date(dateOfBirth) > new Date()) {
    return NextResponse.json({ error: 'Ngày sinh không hợp lệ.' }, { status: 400 });
  }
  if (!['Nam', 'Nữ', 'Khác'].includes(gender)) {
    return NextResponse.json({ error: 'Vui lòng chọn giới tính.' }, { status: 400 });
  }
  if (emergencyContactName.length < 2 || !isValidVNPhone(emergencyContactPhone)) {
    return NextResponse.json(
      { error: 'Vui lòng nhập tên và số điện thoại người liên hệ khẩn cấp.' },
      { status: 400 },
    );
  }
  if (!doctorId || !serviceId || !isValidDateString(date)) {
    return NextResponse.json({ error: 'Chưa chọn đủ bác sĩ, dịch vụ, ngày khám.' }, { status: 400 });
  }
  if (!/^\d{2}:\d{2}(:\d{2})?$/.test(startTime) || !/^\d{2}:\d{2}(:\d{2})?$/.test(endTime)) {
    return NextResponse.json({ error: 'Chưa chọn khung giờ khám.' }, { status: 400 });
  }
  const today = new Date().toISOString().slice(0, 10);
  if (date < today || date > new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10)) {
    return NextResponse.json(
      { error: 'Chỉ đặt lịch từ hôm nay đến 30 ngày tới.' },
      { status: 400 },
    );
  }

  try {
    const profile = await createPatientProfileAsService({
      name,
      phone,
      dateOfBirth,
      gender,
      address: address || undefined,
      emergencyContactName,
      emergencyContactPhone,
    });
    const appt = await bookAppointmentAsService({
      patientProfileId: profile.id,
      doctorId,
      serviceId,
      date,
      startTime,
      endTime,
    });
    return NextResponse.json({
      appointmentCode: appt.appointmentCode,
      doctorName: appt.doctorName,
      serviceName: appt.serviceName,
      date: appt.date,
      startTime: appt.startTime,
      endTime: appt.endTime,
      status: appt.status,
    });
  } catch (e) {
    if (e instanceof RevitaError) {
      const status = e.status === 503 ? 503 : 502;
      return NextResponse.json({ error: e.message }, { status });
    }
    return NextResponse.json(
      { error: 'Đặt lịch thất bại. Vui lòng thử lại hoặc gọi phòng khám.' },
      { status: 500 },
    );
  }
}
