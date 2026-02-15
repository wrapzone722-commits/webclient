import { useEffect, useState } from "react";
import { fetchBookings, cancelBooking, fetchBookingAct } from "@/api/client";
import type { Booking } from "@/api/types";
import { formatDate, formatTime, formatPrice } from "@/lib/format";

type Tab = "upcoming" | "past" | "cancelled";

const statusLabel: Record<string, string> = {
  pending: "Ожидает",
  confirmed: "Подтверждена",
  in_progress: "В процессе",
  completed: "Завершена",
  cancelled: "Отменена",
};

export function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("upcoming");
  const [actLoadingId, setActLoadingId] = useState<string | null>(null);
  const [actError, setActError] = useState<string | null>(null);
  const [cancelConfirmId, setCancelConfirmId] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    setError(null);
    fetchBookings()
      .then(setBookings)
      .catch((e) => setError(e instanceof Error ? e.message : "Ошибка загрузки"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const now = new Date().toISOString();
  const filtered: Booking[] =
    tab === "upcoming"
      ? bookings.filter((b) => b.status !== "cancelled" && b.date_time >= now)
      : tab === "past"
        ? bookings.filter((b) => b.status !== "cancelled" && b.date_time < now)
        : bookings.filter((b) => b.status === "cancelled");

  const handleCancel = async (id: string) => {
    try {
      await cancelBooking(id);
      setCancelConfirmId(null);
      load();
    } catch {
      //
    }
  };

  const handleAct = async (booking: Booking) => {
    if (booking.status !== "completed") return;
    setActLoadingId(booking._id);
    setActError(null);
    try {
      const blob = await fetchBookingAct(booking._id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `akt-${booking._id}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setActError(e instanceof Error ? e.message : "Ошибка загрузки акта");
    } finally {
      setActLoadingId(null);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold text-gray-900 mb-4">Мои записи</h1>
      <div className="flex rounded-lg bg-gray-100 p-1 mb-4">
        {(["upcoming", "past", "cancelled"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`flex-1 py-2 text-sm font-medium rounded-md ${
              tab === t ? "bg-white shadow text-gray-900" : "text-gray-600"
            }`}
          >
            {t === "upcoming" ? "Предстоящие" : t === "past" ? "Прошедшие" : "Отменённые"}
          </button>
        ))}
      </div>
      {loading && bookings.length === 0 ? (
        <div className="text-gray-500 py-8 text-center">Загрузка записей...</div>
      ) : error && bookings.length === 0 ? (
        <div className="text-red-600 py-4">{error}</div>
      ) : filtered.length === 0 ? (
        <div className="text-gray-500 py-8 text-center">
          {tab === "upcoming" && "Нет предстоящих записей"}
          {tab === "past" && "Нет прошедших записей"}
          {tab === "cancelled" && "Нет отменённых записей"}
        </div>
      ) : (
        <ul className="space-y-3">
          {filtered.map((b) => (
            <li key={b._id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="font-medium text-gray-900">{b.service_name}</h2>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {formatDate(b.date_time)} · {formatTime(b.date_time)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{statusLabel[b.status] ?? b.status}</p>
                </div>
                <div className="text-right">
                  <span className="text-blue-600 font-medium">{formatPrice(b.price)}</span>
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                {(b.status === "pending" || b.status === "confirmed") && (
                  <button
                    type="button"
                    onClick={() => setCancelConfirmId(b._id)}
                    className="text-sm text-red-600"
                  >
                    Отменить
                  </button>
                )}
                {b.status === "completed" && (
                  <button
                    type="button"
                    onClick={() => handleAct(b)}
                    disabled={actLoadingId === b._id}
                    className="text-sm text-blue-600 disabled:opacity-50"
                  >
                    {actLoadingId === b._id ? "Загрузка..." : "Акт"}
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
      {actError && (
        <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
          {actError}
          <button type="button" onClick={() => setActError(null)} className="ml-2 underline">
            Закрыть
          </button>
        </div>
      )}
      {cancelConfirmId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-10">
          <div className="bg-white rounded-xl p-4 max-w-sm w-full">
            <p className="text-gray-900 font-medium">Отменить запись?</p>
            <p className="text-sm text-gray-500 mt-1">Запись будет отменена.</p>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => handleCancel(cancelConfirmId)}
                className="flex-1 py-2 bg-red-600 text-white rounded-lg text-sm"
              >
                Отменить запись
              </button>
              <button
                type="button"
                onClick={() => setCancelConfirmId(null)}
                className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm"
              >
                Назад
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
