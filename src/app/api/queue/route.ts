import { NextResponse } from 'next/server';
import { getCounters, getQueue, RevitaError } from '@/lib/revita';

// GET /api/queue — danh sách quầy.
// GET /api/queue?counterId=... — hàng đợi của một quầy.
export async function GET(req: Request) {
  const counterId = new URL(req.url).searchParams.get('counterId') ?? '';
  try {
    if (counterId) {
      const queue = await getQueue(counterId);
      return NextResponse.json({ queue });
    }
    const counters = await getCounters();
    return NextResponse.json({ counters });
  } catch (e) {
    if (e instanceof RevitaError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    return NextResponse.json({ error: 'Lỗi máy chủ.' }, { status: 500 });
  }
}
