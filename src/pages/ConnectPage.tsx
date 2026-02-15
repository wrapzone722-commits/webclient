import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BrowserMultiFormatReader, type IScannerControls } from "@zxing/browser";
import { useBackend } from "@/context/BackendContext";

export function ConnectPage() {
  const { apiBaseUrl, setFromManual, setFromQr } = useBackend();
  const navigate = useNavigate();
  const [manual, setManual] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const reader = useMemo(() => new BrowserMultiFormatReader(), []);

  useEffect(() => {
    if (apiBaseUrl) navigate("/", { replace: true });
  }, [apiBaseUrl, navigate]);

  useEffect(() => {
    if (!scanning) return;
    let stopped = false;
    let controls: IScannerControls | null = null;
    setError(null);

    const start = async () => {
      try {
        if (!videoRef.current) throw new Error("Видеоэлемент не найден");
        controls = await reader.decodeFromVideoDevice(undefined, videoRef.current, (result, err) => {
          if (stopped) return;
          if (result) {
            const raw = result.getText();
            const parsed = setFromQr(raw);
            if (!parsed) {
              setError("QR-код распознан, но URL бэкенда не найден. Ожидаю формат URL или JSON с api_url.");
              return;
            }
            setScanning(false);
            navigate("/", { replace: true });
          }
          if (err) {
            // zxing часто кидает NotFoundException пока не нашёл QR — это нормально
          }
        });
      } catch (e) {
        setError(e instanceof Error ? e.message : "Не удалось запустить камеру");
        setScanning(false);
      }
    };

    start();

    return () => {
      stopped = true;
      try { controls?.stop(); } catch { /* ignore */ }
    };
  }, [scanning, reader, navigate, setFromQr]);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-xl font-semibold text-gray-900">Подключение к бэкенду</h1>
        <p className="text-sm text-gray-600 mt-2">
          Отсканируйте QR-код из консоли или введите URL сервера вручную.
        </p>

        <div className="mt-4 bg-white border border-gray-100 rounded-xl p-4 space-y-3">
          <label className="block text-sm font-medium text-gray-700">URL бэкенда</label>
          <input
            value={manual}
            onChange={(e) => setManual(e.target.value)}
            placeholder="https://example.com"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            inputMode="url"
          />
          <button
            type="button"
            onClick={() => {
              setError(null);
              if (!manual.trim()) return;
              setFromManual(manual);
              navigate("/", { replace: true });
            }}
            className="w-full py-2 bg-blue-600 text-white rounded-lg text-sm"
          >
            Сохранить
          </button>

          <div className="pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setScanning((v) => !v)}
              className="w-full py-2 border border-gray-200 rounded-lg text-sm text-gray-700"
            >
              {scanning ? "Остановить сканер" : "Сканировать QR-код"}
            </button>

            {scanning && (
              <div className="mt-3">
                <div className="rounded-lg overflow-hidden bg-black aspect-video">
                  <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Камера работает только по HTTPS (или на localhost). Разрешите доступ к камере в браузере.
                </p>
              </div>
            )}
          </div>
        </div>

        {error && <div className="mt-3 text-sm text-red-600">{error}</div>}
      </div>
    </div>
  );
}

