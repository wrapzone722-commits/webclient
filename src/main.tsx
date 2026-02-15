import React from "react";
import ReactDOM from "react-dom/client";
import { setApiBaseUrl } from "@/api/client";
import App from "./App";
import "./index.css";

async function loadRuntimeConfig() {
  try {
    const r = await fetch("/config.json");
    if (!r.ok) return;
    const data = (await r.json()) as { api_base_url?: string };
    const url = data?.api_base_url;
    if (typeof url === "string" && url.trim()) {
      const base = url.trim().replace(/\/$/, "");
      (window as Window & { __API_BASE_URL__?: string }).__API_BASE_URL__ = base;
      setApiBaseUrl(base);
    }
  } catch {
    // нет config.json или не JSON — используем VITE_API_BASE_URL из сборки
  }
}

await loadRuntimeConfig();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
