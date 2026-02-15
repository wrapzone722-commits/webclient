import { Link, Outlet, useLocation } from "react-router-dom";

const nav = [
  { to: "/", label: "Услуги", icon: "🏠" },
  { to: "/bookings", label: "Мои записи", icon: "📅" },
  { to: "/profile", label: "Профиль", icon: "👤" },
];

export function Layout() {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <main className="flex-1 pb-16">
        <Outlet />
      </main>
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around py-2 safe-area-pb">
        {nav.map(({ to, label, icon }) => (
          <Link
            key={to}
            to={to}
            className={`flex flex-col items-center gap-0.5 px-4 py-1 rounded-lg text-sm ${
              to === "/"
                ? location.pathname === "/" || location.pathname.startsWith("/services")
                  ? "text-blue-600 font-medium"
                  : "text-gray-500"
                : location.pathname.startsWith(to)
                  ? "text-blue-600 font-medium"
                  : "text-gray-500"
            }`}
          >
            <span className="text-lg">{icon}</span>
            <span>{label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
