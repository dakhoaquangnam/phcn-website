// Client gọi API Revita (NestJS) — CHỈ CHẠY PHÍA SERVER.
// Đây là nơi duy nhất trong web được phép gọi backend Revita, và chỉ gọi
// đúng danh sách endpoint đã kiểm tra (xem báo cáo revita-api-cho-web-cong-khai).
// Không bao giờ import file này từ Client Component.
import 'server-only';

const BASE =
  process.env.REVITA_API_URL?.replace(/\/$/, '') ?? 'http://localhost:3000';

export class RevitaError extends Error {
  status: number;
  constructor(message: string, status = 502) {
    super(message);
    this.name = 'RevitaError';
    this.status = status;
  }
}

export function isRevitaConfigured(): boolean {
  return Boolean(process.env.REVITA_API_URL);
}

async function revitaFetch<T>(
  path: string,
  init: RequestInit & { revalidate?: number } = {},
): Promise<T> {
  const { revalidate, ...rest } = init;
  let res: Response;
  try {
    res = await fetch(`${BASE}/api${path}`, {
      ...rest,
      headers: { 'Content-Type': 'application/json', ...(rest.headers ?? {}) },
      ...(revalidate !== undefined
        ? { next: { revalidate } }
        : { cache: 'no-store' }),
      signal: AbortSignal.timeout(10_000),
    });
  } catch {
    throw new RevitaError('Không kết nối được máy chủ Revita', 502);
  }
  if (!res.ok) {
    let detail = '';
    try {
      const body = (await res.json()) as { message?: string | string[] };
      detail = Array.isArray(body.message)
        ? body.message.join('; ')
        : (body.message ?? '');
    } catch {
      // bỏ qua, dùng message mặc định
    }
    throw new RevitaError(detail || `Revita trả lỗi ${res.status}`, res.status);
  }
  return (await res.json()) as T;
}

/* ---------------- Kiểu dữ liệu (chỉ lấy trường web cần) ---------------- */

export interface Specialty {
  id: string;
  specialtyCode?: string;
  name: string;
  imgUrl?: string | null;
  description?: string | null;
}

export interface PublicDoctor {
  id: string;
  name: string;
  avatar?: string | null;
  doctor: {
    id: string;
    doctorCode: string;
    yearsExperience?: number | null;
    rating?: number | null;
    workHistory?: string | null;
    description?: string | null;
    specialty?: Specialty | null;
  } | null;
}

export interface Service {
  id: string;
  serviceCode: string;
  name: string;
  description?: string | null;
}

export interface DoctorService {
  serviceId: string;
  serviceName: string;
  serviceCode: string;
  price?: number;
  timePerPatient?: number;
  description?: string;
}

export interface AvailableDoctor {
  doctorId: string;
  doctorCode: string;
  doctorName: string;
  specialtyId: string;
  specialtyName: string;
  rating: number;
  workSessionStart: string;
  workSessionEnd: string;
  boothName?: string;
  roomName?: string;
}

export interface Slot {
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  reason?: string;
}

export interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt?: string | null;
  content?: string | null;
  contentHtml?: string | null;
  coverImage?: string | null;
  imageUrl?: string | null;
  publishedAt?: string | null;
  createdAt?: string;
  authorName?: string | null;
  category?: { name: string; slug: string } | null;
}

export interface AppointmentInfo {
  appointmentId?: string;
  appointmentCode: string;
  doctorName?: string;
  patientName?: string;
  serviceName?: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
}

export interface Counter {
  id: string;
  name?: string;
  boothName?: string;
  roomName?: string;
  currentNumber?: string | null;
  [key: string]: unknown;
}

function asArray<T>(v: unknown): T[] {
  if (Array.isArray(v)) return v as T[];
  if (v && typeof v === 'object') {
    const o = v as Record<string, unknown>;
    for (const k of ['posts', 'services', 'doctors', 'data', 'items']) {
      if (Array.isArray(o[k])) return o[k] as T[];
    }
  }
  return [];
}

/* ---------------- Đọc công khai (dùng cho trang tĩnh/ISR) ---------------- */

export async function getSpecialties(): Promise<Specialty[]> {
  return revitaFetch<Specialty[]>('/public/specialties', { revalidate: 300 });
}

export async function getDoctors(specialtyId?: string): Promise<PublicDoctor[]> {
  const q = specialtyId ? `?specialtyId=${encodeURIComponent(specialtyId)}` : '';
  return revitaFetch<PublicDoctor[]>(`/public/doctors${q}`, { revalidate: 300 });
}

export async function getServices(limit = 100): Promise<Service[]> {
  const data = await revitaFetch<{ services: Service[] }>(
    `/services?limit=${limit}&offset=0`,
    { revalidate: 300 },
  );
  return data.services ?? [];
}

export async function getPosts(limit = 12): Promise<Post[]> {
  const data = await revitaFetch<unknown>(`/posts?limit=${limit}`, {
    revalidate: 300,
  });
  return asArray<Post>(data);
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  try {
    return await revitaFetch<Post>(`/posts/${encodeURIComponent(slug)}`, {
      revalidate: 300,
    });
  } catch (e) {
    if (e instanceof RevitaError && e.status === 404) return null;
    throw e;
  }
}

export async function getAppointmentByCode(code: string): Promise<AppointmentInfo> {
  return revitaFetch<AppointmentInfo>(
    `/appointment-booking/appointments/code/${encodeURIComponent(code)}`,
  );
}

export async function getCounters(): Promise<Counter[]> {
  const data = await revitaFetch<unknown>('/counter-assignment/counters');
  return asArray<Counter>(data);
}

export async function getQueue(counterId: string): Promise<unknown> {
  return revitaFetch<unknown>(
    `/counter-assignment/queue/${encodeURIComponent(counterId)}`,
  );
}

/* ---------------- Đặt lịch: xem lịch trống (tươi, không cache) ---------------- */

export async function getAvailableDoctors(
  specialtyId: string,
  date: string,
): Promise<AvailableDoctor[]> {
  const data = await revitaFetch<{ doctors: AvailableDoctor[] }>(
    `/appointment-booking/doctors/available?specialtyId=${encodeURIComponent(specialtyId)}&date=${encodeURIComponent(date)}`,
  );
  return data.doctors ?? [];
}

export async function getDoctorServices(
  doctorId: string,
  date: string,
): Promise<DoctorService[]> {
  const data = await revitaFetch<{ services: DoctorService[] }>(
    `/appointment-booking/doctors/${encodeURIComponent(doctorId)}/services?date=${encodeURIComponent(date)}`,
  );
  return data.services ?? [];
}

export async function getAvailableSlots(
  doctorId: string,
  serviceId: string,
  date: string,
): Promise<Slot[]> {
  const data = await revitaFetch<{ slots: Slot[] }>(
    `/appointment-booking/doctors/${encodeURIComponent(doctorId)}/available-slots?serviceId=${encodeURIComponent(serviceId)}&date=${encodeURIComponent(date)}`,
  );
  return data.slots ?? [];
}

/* ---------------- Tài khoản dịch vụ (phương án B) ----------------
   Một tài khoản RECEPTIONIST của phòng khám, chỉ nằm trong biến môi trường
   phía server. Dùng để tạo hồ sơ + đặt lịch hộ khách trên web công khai.
   Backend không kiểm tra người đặt có sở hữu hồ sơ hay không, nên JWT này
   đặt được lịch cho bất kỳ hồ sơ nào — vì vậy phải giữ quyền tối thiểu
   (RECEPTIONIST, không ADMIN) và không bao giờ để lọt ra trình duyệt. */

interface TokenCache {
  token: string;
  expMs: number;
}
let tokenCache: TokenCache | null = null;

function jwtExpMs(token: string): number {
  try {
    const payload = JSON.parse(
      Buffer.from(token.split('.')[1], 'base64url').toString('utf8'),
    ) as { exp?: number };
    return payload.exp ? payload.exp * 1000 : Date.now() + 50 * 60 * 1000;
  } catch {
    return Date.now() + 50 * 60 * 1000;
  }
}

export async function getServiceToken(): Promise<string> {
  const email = process.env.REVITA_SERVICE_EMAIL;
  const password = process.env.REVITA_SERVICE_PASSWORD;
  if (!email || !password) {
    throw new RevitaError(
      'Chưa cấu hình tài khoản dịch vụ đặt lịch (REVITA_SERVICE_EMAIL/PASSWORD)',
      503,
    );
  }
  if (tokenCache && Date.now() < tokenCache.expMs - 5 * 60 * 1000) {
    return tokenCache.token;
  }
  const data = await revitaFetch<{ accessToken: string }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ identifier: email, password }),
  });
  if (!data.accessToken) {
    throw new RevitaError('Đăng nhập tài khoản dịch vụ thất bại', 502);
  }
  tokenCache = { token: data.accessToken, expMs: jwtExpMs(data.accessToken) };
  return data.accessToken;
}

export interface BookingPatientInput {
  name: string;
  phone: string;
  dateOfBirth: string; // YYYY-MM-DD
  gender: string; // 'Nam' | 'Nữ' | 'Khác'
  address?: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
}

export async function createPatientProfileAsService(
  input: BookingPatientInput,
): Promise<{ id: string; profileCode?: string }> {
  const token = await getServiceToken();
  return revitaFetch<{ id: string; profileCode?: string }>('/patient-profiles', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      name: input.name,
      phone: input.phone,
      dateOfBirth: input.dateOfBirth,
      gender: input.gender,
      address: input.address,
      emergencyContact: {
        name: input.emergencyContactName,
        phone: input.emergencyContactPhone,
      },
    }),
  });
}

export async function bookAppointmentAsService(input: {
  patientProfileId: string;
  doctorId: string;
  serviceId: string;
  date: string;
  startTime: string;
  endTime: string;
}): Promise<AppointmentInfo> {
  const token = await getServiceToken();
  return revitaFetch<AppointmentInfo>('/appointment-booking/appointments', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(input),
  });
}
