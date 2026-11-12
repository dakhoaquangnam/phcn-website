import { NextResponse } from 'next/server';
import { getDoctorServices, RevitaError } from '@/lib/revita';
import { isValidDateString } from '@/lib/utils';

// GET /api/booking/services?doctorId=...&date=YYYY-MM-DD
// Dịch vụ bác sĩ làm ngày đó, kèm giá và thời lượng mỗi ca.
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const doctorId = searchParams.get('doctorId') ?? '';
  const date = searchParams.get('date') ?? '';
  if (!doctorId || !isValidDateString(date)) {
    return NextResponse.json(
      { error: 'Thiếu bác sĩ hoặc ngày không hợp lệ (YYYY-MM-DD).' },
      { status: 400 },
    );
  }
  try {
    const services = await getDoctorServices(doctorId, date);
    return NextResponse.json({ services });
  } catch (e) {
    if (e instanceof RevitaError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    return NextResponse.json({ error: 'Lỗi máy chủ.' }, { status: 500 });
  }
}
