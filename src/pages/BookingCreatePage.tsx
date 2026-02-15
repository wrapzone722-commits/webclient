import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchService, fetchPosts, fetchSlots, createBooking } from "@/api/client";
import type { Service } from "@/api/types";
import type { Post, TimeSlot } from "@/api/types";
import { formatPrice, formatDuration, toDateString, toISODateTime } from "@/lib/format";

export function BookingCreatePage() {
  const { id } = useParams<{ id: string }>();
  const [service, setService] = useState<Service | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [selectedDate, setSelectedDate] = useState(() => toDateString(new Date()));
  const [selectedPostId, setSelectedPostId] = useState("");
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const today = toDateString(new Date());
  const maxDate = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return toDateString(d);
  })();

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetchService(id)
      .then((data) => {
        setService(data);
        setError(null);
      })
      .catch(() => setError("Не удалось загрузить услугу"))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    fetchPosts()
      .then((data) => {
        const enabled = data.filter((p) => p.is_enabled);
        setPosts(enabled);
        if (enabled.length) setSelectedPostId((prev) => prev || enabled[0]._id);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedDate || !selectedPostId || !id) {
      setSlots([]);
      return;
    }
    fetchSlots(id, selectedDate, selectedPostId)
      .then(setSlots)
      .catch(() => setSlots([]));
  }, [id, selectedDate, selectedPostId]);


  const availableSlots = slots.filter((s) => s.is_available);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!service || !selectedSlot || !selectedDate) return;
    setSubmitting(true);
    setError(null);
    const timeStr = selectedSlot.time.slice(11, 16);
    const dateTime = toISODateTime(selectedDate, timeStr);
    try {
      await createBooking({
        service_id: service._id,
        date_time: dateTime,
        post_id: selectedPostId || undefined,
        notes: notes.trim() || null,
      });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка записи");
    } finally {
      setSubmitting(false);
    }
  };

  if (!id) return null;
  if (loading && !service) {
    return (
      <div className="p-4">
        <p className="text-gray-500">Загрузка...</p>
      </div>
    );
  }
  if (!service) {
    return (
      <div className="p-4">
        <p className="text-red-600">Услуга не найдена</p>
        <Link to="/" className="text-blue-600 mt-2 inline-block">Назад к услугам</Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="p-4">
        <div className="bg-green-50 text-green-800 rounded-xl p-4 mb-4">
          Запись создана! Ожидайте подтверждения.
        </div>
        <Link to="/bookings" className="block w-full py-3 text-center bg-blue-600 text-white font-medium rounded-xl">
          Мои записи
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-4">
        <h1 className="font-semibold text-gray-900">{service.name}</h1>
        <p className="text-sm text-gray-500">{formatPrice(service.price)} · {formatDuration(service.duration)}</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Дата</label>
          <input
            type="date"
            min={today}
            max={maxDate}
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2"
          />
        </div>
        {posts.length > 1 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Пост</label>
            <select
              value={selectedPostId}
              onChange={(e) => setSelectedPostId(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2"
            >
              {posts.map((p) => (
                <option key={p._id} value={p._id}>{p.name}</option>
              ))}
            </select>
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Время</label>
          <div className="flex flex-wrap gap-2">
            {availableSlots.length === 0 && selectedDate ? (
              <p className="text-gray-500 text-sm">Нет свободных слотов</p>
            ) : (
              availableSlots.map((slot) => {
                const time = slot.time.slice(11, 16);
                const isSelected = selectedSlot?.time === slot.time;
                return (
                  <button
                    key={slot.id}
                    type="button"
                    onClick={() => setSelectedSlot(slot)}
                    className={`px-3 py-1.5 rounded-lg text-sm ${
                      isSelected ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {time}
                  </button>
                );
              })
            )}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Комментарий</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Необязательно"
            rows={2}
            className="w-full border border-gray-200 rounded-lg px-3 py-2"
          />
        </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={submitting || !selectedSlot}
          className="w-full py-3 bg-blue-600 text-white font-medium rounded-xl disabled:opacity-50"
        >
          {submitting ? "Отправка..." : "Подтвердить запись"}
        </button>
      </form>
    </div>
  );
}
