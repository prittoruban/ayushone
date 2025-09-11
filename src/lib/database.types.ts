export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          name: string
          email: string
          role: 'doctor' | 'citizen'
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          role: 'doctor' | 'citizen'
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          role?: 'doctor' | 'citizen'
          created_at?: string
        }
      }
      doctors: {
        Row: {
          id: string
          user_id: string
          specialty: string
          city: string
          verified_badge: boolean
          license_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          specialty: string
          city: string
          verified_badge?: boolean
          license_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          specialty?: string
          city?: string
          verified_badge?: boolean
          license_url?: string | null
          created_at?: string
        }
      }
      appointments: {
        Row: {
          id: string
          citizen_id: string
          doctor_id: string
          scheduled_at: string
          status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
          jitsi_room_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          citizen_id: string
          doctor_id: string
          scheduled_at: string
          status?: 'pending' | 'confirmed' | 'completed' | 'cancelled'
          jitsi_room_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          citizen_id?: string
          doctor_id?: string
          scheduled_at?: string
          status?: 'pending' | 'confirmed' | 'completed' | 'cancelled'
          jitsi_room_id?: string | null
          created_at?: string
        }
      }
    }
  }
}

export type User = Database['public']['Tables']['users']['Row']
export type Doctor = Database['public']['Tables']['doctors']['Row']
export type Appointment = Database['public']['Tables']['appointments']['Row']

export type UserInsert = Database['public']['Tables']['users']['Insert']
export type DoctorInsert = Database['public']['Tables']['doctors']['Insert']
export type AppointmentInsert = Database['public']['Tables']['appointments']['Insert']