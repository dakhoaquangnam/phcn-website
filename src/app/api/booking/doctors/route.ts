import { NextResponse } from 'next/server';
import { getAvailableDoctors, RevitaError } from '@/lib/revita';
import { isValidDateString } from '@/lib/utils';

// GET /api/booking/doctors?specialtyId=...&date=YYYY-MM-DD
// Proxy lớp BFF: trình duyệt chỉ gọi Next.js, không gọi thẳng Revita.
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const specialtyId = searchParams.get('specialtyId') ?? '';
  const date = searchParams.get('date') ?? '';
  if (!specialtyId || !isValidDateString(date)) {
    return NextResponse.json(
      { error: 'Thiếu chuyên khoa hoặc ngày không hợp lệ (YYYY-MM-DD).' },
      { status: 400 },
    );
  }
  try {
    const doctors = await getAvailableDoctors(specialtyId, date);
    return NextResponse.json({ doctors });
  } catch (e) {
    if (e instanceof RevitaError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    return NextResponse.json({ error: 'Lỗi máy chủ.' }, { status: 500 });
  }
}
