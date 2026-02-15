import React from "react";
import ReactDOM from "react-dom/client";
import { setApiBaseUrl } from "@/api/client";
import App from "./App";
import "./index.css";

async function loadRuntimeConfig() {
  try {
    const r = await fetch("/config.json");
    if (!r.ok) return;
    const text = await r.text();
    const trimmed = text.trim();
    // Если сервер отдал HTML (SPA fallback или страница ошибки), не пытаемся парсить как JSON
    if (trimmed.startsWith("<") || trimmed.startsWith("<!")) return;
    const data = JSON.parse(text) as { api_base_url?: string };
    const url = data.api_base_url;
    if (typeof url === "string" && url.trim()) {
      const base = url.trim().replace(/\/$/, "").replace(/\/api\/v1$/, "");
      (window as Window & { __API_BASE_URL__?: string }).__API_BASE_URL__ = base;
      setApiBaseUrl(base);
    }
  } catch {
    // нет config.json или не JSON — используем VITE_API_BASE_URL из сборки
  }
}

function renderApp() {
  ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

loadRuntimeConfig().finally(renderApp);
