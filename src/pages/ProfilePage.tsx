import { useEffect, useState } from "react";
import { fetchProfile } from "@/api/client";
import { useAuth } from "@/context/AuthContext";
import type { User } from "@/api/types";

export function ProfilePage() {
  const { apiKey, logout } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!apiKey) {
      setLoading(false);
      return;
    }
    fetchProfile()
      .then(setUser)
      .catch((e) => setError(e instanceof Error ? e.message : "Ошибка загрузки"))
      .finally(() => setLoading(false));
  }, [apiKey]);

  const displayName = user
    ? [user.first_name, user.last_name].filter(Boolean).join(" ").trim() || "Клиент"
    : "Клиент";

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold text-gray-900 mb-4">Профиль</h1>
      {loading ? (
        <div className="text-gray-500">Загрузка...</div>
      ) : error && !user ? (
        <div className="text-red-600">{error}</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-3">
          <p className="font-medium text-gray-900">{displayName}</p>
          {user?.email && <p className="text-sm text-gray-500">{user.email}</p>}
          {user?.phone && <p className="text-sm text-gray-500">{user.phone}</p>}
          {user?.client_tier && (
            <p className="text-xs text-gray-500">Уровень: {user.client_tier}</p>
          )}
        </div>
      )}
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
