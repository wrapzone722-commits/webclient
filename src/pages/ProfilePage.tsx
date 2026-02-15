import { useCallback, useEffect, useState } from "react";
import {
  fetchProfile,
  updateProfile,
  fetchCars,
  fetchNotifications,
  markNotificationRead,
} from "@/api/client";
import { useAuth } from "@/context/AuthContext";
import type { User, CarFolder, Notification } from "@/api/types";

const clientTierLabel: Record<string, string> = {
  client: "Клиент",
  regular: "Постоянный клиент",
  pride: "Прайд",
};

export function ProfilePage() {
  const { apiKey, logout } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [editFirst, setEditFirst] = useState("");
  const [editLast, setEditLast] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editTelegram, setEditTelegram] = useState("");
  const [editVk, setEditVk] = useState("");
  const [saving, setSaving] = useState(false);
  const [cars, setCars] = useState<CarFolder[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showCars, setShowCars] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const loadProfile = useCallback(() => {
    if (!apiKey) return;
    setLoading(true);
    setError(null);
    fetchProfile()
      .then((u) => {
        setUser(u);
        setEditFirst(u.first_name ?? "");
        setEditLast(u.last_name ?? "");
        setEditEmail(u.email ?? "");
        setEditTelegram(u.social_links?.telegram ?? "");
        setEditVk(u.social_links?.vk ?? "");
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Ошибка загрузки"))
      .finally(() => setLoading(false));
  }, [apiKey]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const loadNotifications = useCallback(() => {
    fetchNotifications()
      .then(setNotifications)
      .catch(() => setNotifications([]));
  }, []);

  useEffect(() => {
    if (showNotifications && apiKey) loadNotifications();
  }, [showNotifications, apiKey, loadNotifications]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const updated = await updateProfile({
        first_name: editFirst.trim() || undefined,
        last_name: editLast.trim() || undefined,
        email: editEmail.trim() || null,
        social_links: {
          telegram: editTelegram.trim() || null,
          vk: editVk.trim() || null,
        },
      });
      setUser(updated);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const handleSelectCar = async (car: CarFolder) => {
    if (!user) return;
    const photoUrl = car.profile_preview_url ?? car.images[0]?.url ?? null;
    try {
      const updated = await updateProfile({ profile_photo_url: photoUrl });
      setUser(updated);
      setShowCars(false);
    } catch {
      //
    }
  };

  const loadCars = useCallback(() => {
    fetchCars()
      .then(setCars)
      .catch(() => setCars([]));
  }, []);

  useEffect(() => {
    if (showCars) loadCars();
  }, [showCars, loadCars]);

  const displayName = user
    ? [user.first_name, user.last_name].filter(Boolean).join(" ").trim() || "Клиент"
    : "Клиент";
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold text-gray-900 mb-4">Профиль</h1>
      {loading ? (
        <div className="text-gray-500">Загрузка...</div>
      ) : error && !user ? (
        <div className="text-red-600">{error}</div>
      ) : user ? (
        <>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-3">
            <div className="flex items-center gap-3">
              {user.avatar_url || user.profile_photo_url ? (
                <img
                  src={user.avatar_url || user.profile_photo_url || ""}
                  alt=""
                  className="w-14 h-14 rounded-full object-cover bg-gray-100"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-medium">
                  {displayName.slice(0, 2).toUpperCase()}
                </div>
              )}
              <div className="flex-1">
                {!editing ? (
                  <>
                    <p className="font-medium text-gray-900">{displayName}</p>
                    {user.email && <p className="text-sm text-gray-500">{user.email}</p>}
                    {user.phone && !String(user.phone).startsWith("device:") && (
                      <p className="text-sm text-gray-500">{user.phone}</p>
                    )}
                    {user.client_tier && (
                      <p className="text-xs text-gray-500">
                        {clientTierLabel[user.client_tier] ?? user.client_tier}
                      </p>
                    )}
                    {typeof user.loyalty_points === "number" && (
                      <p className="text-xs text-gray-500">Баллы: {user.loyalty_points}</p>
                    )}
                  </>
                ) : (
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Имя"
                      value={editFirst}
                      onChange={(e) => setEditFirst(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Фамилия"
                      value={editLast}
                      onChange={(e) => setEditLast(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Telegram"
                      value={editTelegram}
                      onChange={(e) => setEditTelegram(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                    />
                    <input
                      type="text"
                      placeholder="VK"
                      value={editVk}
                      onChange={(e) => setEditVk(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                )}
              </div>
            </div>
            {!editing ? (
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="text-sm text-blue-600"
                >
                  Изменить
                </button>
                <button
                  type="button"
                  onClick={() => setShowCars(true)}
                  className="text-sm text-gray-600"
                >
                  Выбрать авто
                </button>
              </div>
            ) : (
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg disabled:opacity-50"
                >
                  {saving ? "Сохранение..." : "Сохранить"}
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-700 text-sm rounded-lg"
                >
                  Отмена
                </button>
              </div>
            )}
          </div>

          <div className="mt-4">
            <button
              type="button"
              onClick={() => setShowNotifications(!showNotifications)}
              className="w-full py-3 px-4 bg-white border border-gray-100 rounded-xl text-left flex items-center justify-between"
            >
              <span className="font-medium text-gray-900">Уведомления</span>
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs font-medium px-2 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </button>
            {showNotifications && (
              <ul className="mt-2 space-y-2">
                {notifications.length === 0 ? (
                  <li className="text-sm text-gray-500 py-2">Нет уведомлений</li>
                ) : (
                  notifications.map((n) => (
                    <li
                      key={n._id}
                      className={`p-3 rounded-lg border text-sm ${n.read ? "bg-gray-50 border-gray-100" : "bg-blue-50/50 border-blue-100"}`}
                    >
                      {n.title && <p className="font-medium text-gray-900">{n.title}</p>}
                      <p className="text-gray-700 mt-0.5">{n.body}</p>
                      {!n.read && (
                        <button
                          type="button"
                          onClick={() => {
                            markNotificationRead(n._id).then(loadNotifications);
                          }}
                          className="mt-2 text-xs text-blue-600"
                        >
                          Отметить прочитанным
                        </button>
                      )}
                    </li>
                  ))
                )}
              </ul>
            )}
          </div>

          {showCars && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-10">
              <div className="bg-white rounded-xl p-4 max-w-sm w-full max-h-[80vh] overflow-auto">
                <p className="font-medium text-gray-900 mb-3">Выберите автомобиль</p>
                <div className="grid grid-cols-2 gap-2">
                  {cars.map((car) => (
                    <button
                      key={car._id}
                      type="button"
                      onClick={() => handleSelectCar(car)}
                      className="rounded-lg border border-gray-200 p-2 text-center hover:bg-gray-50"
                    >
                      {(car.profile_preview_url || car.images[0]?.url) ? (
                        <img
                          src={car.profile_preview_url || car.images[0]?.url}
                          alt={car.name}
                          className="w-full h-20 object-contain rounded"
                        />
                      ) : (
                        <span className="text-2xl">🚗</span>
                      )}
                      <p className="text-xs mt-1 text-gray-700 truncate">{car.name}</p>
                    </button>
                  ))}
                </div>
                {cars.length === 0 && (
                  <p className="text-sm text-gray-500 py-4">Нет доступных типов авто</p>
                )}
                <button
                  type="button"
                  onClick={() => setShowCars(false)}
                  className="mt-4 w-full py-2 border border-gray-200 rounded-lg text-gray-700 text-sm"
                >
                  Закрыть
                </button>
              </div>
            </div>
          )}
        </>
      ) : null}

      <div className="mt-6">
        <button
          type="button"
          onClick={logout}
          className="w-full py-3 border border-gray-200 text-gray-700 font-medium rounded-xl"
        >
          Выйти
        </button>
      </div>
    </div>
  );
}
