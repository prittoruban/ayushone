export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          name: string;
          role: "doctor" | "citizen";
          phone: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          role: "doctor" | "citizen";
          phone?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          role?: "doctor" | "citizen";
          phone?: string | null;
          created_at?: string;
        };
      };
      doctors: {
        Row: {
          id: string;
          user_id: string;
          specialty: string;
          city: string;
          license_number: string | null;
          license_url: string | null;
          experience_years: number;
          languages: string[];
          location: { lat: number; lng: number } | null;
          verified_badge: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          specialty: string;
          city: string;
          license_number?: string | null;
          license_url?: string | null;
          experience_years?: number;
          languages?: string[];
          location?: { lat: number; lng: number } | null;
          verified_badge?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          specialty?: string;
          city?: string;
          license_number?: string | null;
          license_url?: string | null;
          experience_years?: number;
          languages?: string[];
          location?: { lat: number; lng: number } | null;
          verified_badge?: boolean;
          created_at?: string;
        };
      };
      appointments: {
        Row: {
          id: string;
          citizen_id: string;
          doctor_id: string;
          scheduled_at: string;
          mode: "online" | "offline";
          reason: string | null;
          status: "pending" | "confirmed" | "completed" | "cancelled";
          jitsi_room_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          citizen_id: string;
          doctor_id: string;
          scheduled_at: string;
          mode?: "online" | "offline";
          reason?: string | null;
          status?: "pending" | "confirmed" | "completed" | "cancelled";
          jitsi_room_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          citizen_id?: string;
          doctor_id?: string;
          scheduled_at?: string;
          mode?: "online" | "offline";
          reason?: string | null;
          status?: "pending" | "confirmed" | "completed" | "cancelled";
          jitsi_room_id?: string | null;
          created_at?: string;
        };
      };
    };
  };
}

export type User = Database["public"]["Tables"]["users"]["Row"];
export type Doctor = Database["public"]["Tables"]["doctors"]["Row"];
export type Appointment = Database["public"]["Tables"]["appointments"]["Row"];

export type UserInsert = Database["public"]["Tables"]["users"]["Insert"];
export type DoctorInsert = Database["public"]["Tables"]["doctors"]["Insert"];
export type AppointmentInsert =
  Database["public"]["Tables"]["appointments"]["Insert"];
