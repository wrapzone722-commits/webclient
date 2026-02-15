import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchService } from "@/api/client";
import type { Service } from "@/api/types";
import { formatPrice, formatDuration } from "@/lib/format";

export function ServiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchService(id)
      .then((data) => {
        if (!cancelled) setService(data);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Ошибка загрузки");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (!id) return null;
  if (loading && !service) return <div className="p-4 text-gray-500">Загрузка...</div>;
  if (error && !service) return <div className="p-4 text-red-600">{error}</div>;
  if (!service) return <div className="p-4">Услуга не найдена</div>;

  return (
    <div className="p-4">
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-4">
        <h1 className="text-lg font-semibold text-gray-900">{service.name}</h1>
        <p className="text-sm text-gray-500 mt-1">{service.category}</p>
        <p className="text-gray-700 mt-3">{service.description}</p>
        <div className="mt-4 flex gap-4">
          <span className="text-blue-600 font-medium">{formatPrice(service.price)}</span>
          <span className="text-gray-500">{formatDuration(service.duration)}</span>
        </div>
      </div>
      <Link
        to={`/services/${id}/book`}
        className="block w-full py-3 text-center bg-blue-600 text-white font-medium rounded-xl"
      >
        Записаться
      </Link>
    </div>
  );
}
