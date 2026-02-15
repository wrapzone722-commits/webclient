/** Типы по API консоли (snake_case с сервера). */

export interface Service {
  _id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  category: string;
  image_url: string | null;
  is_active: boolean;
}

export type BookingStatus = "pending" | "confirmed" | "in_progress" | "completed" | "cancelled";

export interface Booking {
  _id: string;
  service_id: string;
  service_name: string;
  user_id: string;
  user_name?: string;
  post_id?: string;
  date_time: string;
  status: BookingStatus;
  price: number;
  duration: number;
  notes: string | null;
  created_at: string;
  in_progress_started_at?: string | null;
}

export interface CreateBookingRequest {
  service_id: string;
  date_time: string;
  post_id?: string;
  notes?: string | null;
}

export interface TimeSlot {
  id: string;
  time: string;
  is_available: boolean;
}

export interface Post {
  _id: string;
  name: string;
  is_enabled: boolean;
  use_custom_hours: boolean;
  start_time: string;
  end_time: string;
  interval_minutes: number;
}

export interface User {
  _id: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string | null;
  avatar_url: string | null;
  social_links?: Record<string, string | null>;
  client_tier?: string;
  loyalty_points?: number;
}

export interface RegisterClientResponse {
  client_id: string;
  api_key: string;
}
