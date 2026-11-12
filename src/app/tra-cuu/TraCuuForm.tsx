"use client";

import { useEffect, useState } from "react";
import { formatDateVN } from "@/lib/utils";
import type { AppointmentInfo } from "@/lib/revita";

async function getJSON<T>(url: string): Promise<T> {
  const res = await fetch(url);
  const data = (await res.json()) as T & { error?: string };
  if (!res.ok) throw new Error(data.error ?? "Lỗi máy chủ.");
  return data;
}

function renderQueueValue(v: unknown): string {
  if (v == null) return "—";
  if (typeof v === "string" || typeof v === "number") return String(v);
  if (Array.isArray(v)) return `${v.length} người`;
  return "";
}

export default function TraCuuForm({ presetCode = "" }: { presetCode?: string }) {
  const [code, setCode] = useState(presetCode);
  const [appt, setAppt] = useState<AppointmentInfo | null>(null);
  const [counters, setCounters] = useState<Record<string, unknown>[]>([]);
  const [queue, setQueue] = useState<unknown>(null);
  const [counterId, setCounterId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function lookup(c: string) {
    if (!c.trim()) return;
    setLoading(true);
    setError("");
    setAppt(null);
    try {
      const data = await getJSON<{ appointment: AppointmentInfo }>(
        `/api/lookup?code=${encodeURIComponent(c.trim())}`,
      );
      setAppt(data.appointment);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không tìm thấy lịch hẹn.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // Tra cứu tự động khi mở trang bằng link có sẵn mã (?code=...).
    if (presetCode) {
      getJSON<{ appointment: AppointmentInfo }>(
        `/api/lookup?code=${encodeURIComponent(presetCode.trim())}`,
      )
        .then((d) => setAppt(d.appointment))
        .catch((e: Error) => setError(e.message));
    }
    // Nạp danh sách quầy 1 lần khi mở trang
    getJSON<{ counters: Record<string, unknown>[] }>("/api/queue")
      .then((d) => setCounters(d.counters ?? []))
      .catch(() => setCounters([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadQueue(id: string) {
    setCounterId(id);
    setQueue(null);
    if (!id) return;
    try {
      const data = await getJSON<{ queue: unknown }>(
        `/api/queue?counterId=${encodeURIComponent(id)}`,
      );
      setQueue(data.queue);
    } catch {
      setQueue(null);
    }
  }

  return (
    <div className="space-y-10">
      <section>
        <h2 className="text-xl font-bold">Tra cứu lịch hẹn bằng mã</h2>
        <form
          className="mt-3 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            void lookup(code);
          }}
        >
          <input
            className="flex-1 rounded-lg border border-slate-300 px-3 py-2 uppercase focus:border-cyan-600 focus:outline-none"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Nhập mã lịch hẹn, ví dụ APT-..."
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-full bg-cyan-700 px-5 py-2 font-semibold text-white hover:bg-cyan-800 disabled:opacity-50"
          >
            {loading ? "Đang tìm..." : "Tra cứu"}
          </button>
        </form>
        {error ? (
          <p className="mt-3 rounded-xl border border-red-300 bg-red-50 p-4 text-red-700">{error}</p>
        ) : null}
        {appt ? (
          <div className="mt-4 rounded-2xl border border-slate-200 p-5">
            <p className="font-semibold text-lg">{appt.patientName ?? "Lịch hẹn"}</p>
            <dl className="mt-2 space-y-1 text-slate-700">
              <p>Mã: <strong>{appt.appointmentCode}</strong></p>
              {appt.doctorName ? <p>Bác sĩ: {appt.doctorName}</p> : null}
              {appt.serviceName ? <p>Dịch vụ: {appt.serviceName}</p> : null}
              <p>
                Thời gian: {formatDateVN(appt.date)} · {appt.startTime.slice(0, 5)} –{" "}
                {appt.endTime.slice(0, 5)}
              </p>
              <p>
                Trạng thái: <strong>{appt.status}</strong>
              </p>
            </dl>
          </div>
        ) : null}
      </section>

      <section>
        <h2 className="text-xl font-bold">Hàng đợi tại phòng khám</h2>
        {counters.length === 0 ? (
          <p className="mt-2 text-slate-500">
            Chưa tải được hàng đợi — máy chủ phòng khám chưa kết nối.
          </p>
        ) : (
          <>
            <div className="mt-3 flex flex-wrap gap-2">
              {counters.map((c) => {
                const id = String(c.id ?? "");
                const label = String(c.name ?? c.boothName ?? c.roomName ?? id);
                return (
                  <button
                    type="button"
                    key={id}
                    onClick={() => void loadQueue(id)}
                    className={`rounded-full border px-4 py-2 text-sm font-semibold ${
                      counterId === id
                        ? "border-cyan-700 bg-cyan-700 text-white"
                        : "border-slate-300 hover:border-cyan-600"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
            {queue != null ? (
              <div className="mt-4 rounded-2xl border border-slate-200 p-5">
                {Array.isArray(queue) ? (
                  <ul className="space-y-2">
                    {queue.map((q, i) => {
                      const o = q as Record<string, unknown>;
                      return (
                        <li key={i} className="flex justify-between border-b border-slate-100 pb-2 text-sm">
                          <span>{renderQueueValue(o.number ?? o.queueNumber ?? o.code ?? `#${i + 1}`)}</span>
                          <span className="text-slate-600">
                            {renderQueueValue(o.patientName ?? o.name ?? "")}{" "}
                            {renderQueueValue(o.status ?? "")}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <dl className="space-y-1 text-slate-700">
                    {Object.entries(queue as Record<string, unknown>)
                      .slice(0, 8)
                      .map(([k, v]) => (
                        <p key={k}>
                          {k}: <strong>{renderQueueValue(v)}</strong>
                        </p>
                      ))}
                  </dl>
                )}
              </div>
            ) : null}
          </>
        )}
      </section>
    </div>
  );
}
