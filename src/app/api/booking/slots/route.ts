import { NextResponse } from 'next/server';
import { getAvailableSlots, RevitaError } from '@/lib/revita';
import { isValidDateString } from '@/lib/utils';

// GET /api/booking/slots?doctorId=...&serviceId=...&date=YYYY-MM-DD
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const doctorId = searchParams.get('doctorId') ?? '';
  const serviceId = searchParams.get('serviceId') ?? '';
  const date = searchParams.get('date') ?? '';
  if (!doctorId || !serviceId || !isValidDateString(date)) {
    return NextResponse.json(
      { error: 'Thiếu bác sĩ, dịch vụ hoặc ngày không hợp lệ (YYYY-MM-DD).' },
      { status: 400 },
    );
  }
  try {
    const slots = await getAvailableSlots(doctorId, serviceId, date);
    return NextResponse.json({ slots });
  } catch (e) {
    if (e instanceof RevitaError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    return NextResponse.json({ error: 'Lỗi máy chủ.' }, { status: 500 });
  }
}
