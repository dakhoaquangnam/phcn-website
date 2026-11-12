// Rate limit trong bộ nhớ (theo IP) cho các Route Handler ghi dữ liệu.
// Đủ cho 1 instance. Khi chạy nhiều instance, thay bằng Redis/Upstash.
type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

export function checkRateLimit(
  ip: string,
  limit = 5,
  windowMs = 10 * 60 * 1000,
): boolean {
  const now = Date.now();
  const b = buckets.get(ip);
  if (!b || now > b.resetAt) {
    buckets.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (b.count >= limit) return false;
  b.count += 1;
  return true;
}

export function getClientIp(req: Request): string {
  const xff = req.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0].trim();
  const real = req.headers.get('x-real-ip');
  if (real) return real;
  return 'unknown';
}
