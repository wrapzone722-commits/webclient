import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { Layout } from "@/components/Layout";
import { HomePage } from "@/pages/HomePage";
import { ServiceDetailPage } from "@/pages/ServiceDetailPage";
import { BookingCreatePage } from "@/pages/BookingCreatePage";
import { BookingsPage } from "@/pages/BookingsPage";
import { ProfilePage } from "@/pages/ProfilePage";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="services/:id" element={<ServiceDetailPage />} />
            <Route path="services/:id/book" element={<BookingCreatePage />} />
            <Route path="bookings" element={<BookingsPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
