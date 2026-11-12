import { NextResponse } from 'next/server';
import { getAppointmentByCode, RevitaError } from '@/lib/revita';

// GET /api/lookup?code=... — tra cứu lịch hẹn bằng mã.
export async function GET(req: Request) {
  const code = new URL(req.url).searchParams.get('code')?.trim() ?? '';
  if (!code) {
    return NextResponse.json({ error: 'Vui lòng nhập mã lịch hẹn.' }, { status: 400 });
  }
  try {
    const appt = await getAppointmentByCode(code);
    return NextResponse.json({ appointment: appt });
  } catch (e) {
    if (e instanceof RevitaError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    return NextResponse.json({ error: 'Lỗi máy chủ.' }, { status: 500 });
  }
}
