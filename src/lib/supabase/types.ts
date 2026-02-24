export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          user_id: string
          name: string
          relation: string | null
          birth_date: string
          birth_time: string
          birth_place: string
          latitude: number
          longitude: number
          timezone: string
          chart_data: Json | null
          chart_calculated_at: string | null
          avatar_url: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          relation?: string | null
          birth_date: string
          birth_time: string
          birth_place: string
          latitude: number
          longitude: number
          timezone: string
          chart_data?: Json | null
          chart_calculated_at?: string | null
          avatar_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          relation?: string | null
          birth_date?: string
          birth_time?: string
          birth_place?: string
          latitude?: number
          longitude?: number
          timezone?: string
          chart_data?: Json | null
          chart_calculated_at?: string | null
          avatar_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      reports: {
        Row: {
          id: string
          profile_id: string
          report_type: string
          language: string
          content: string | null
          summary: string | null
          model_used: string | null
          pdf_url: string | null
          pdf_generated_at: string | null
          is_favorite: boolean
          year: number | null
          generation_status: string
          created_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          report_type: string
          language?: string
          content?: string | null
          summary?: string | null
          model_used?: string | null
          pdf_url?: string | null
          pdf_generated_at?: string | null
          is_favorite?: boolean
          year?: number | null
          generation_status?: string
          created_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          report_type?: string
          language?: string
          content?: string | null
          summary?: string | null
          model_used?: string | null
          pdf_url?: string | null
          pdf_generated_at?: string | null
          is_favorite?: boolean
          year?: number | null
          generation_status?: string
          created_at?: string
        }
      }
      report_chunks: {
        Row: {
          id: string
          report_id: string
          profile_id: string
          chunk_index: number
          content: string
          embedding: number[] | null
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          report_id: string
          profile_id: string
          chunk_index: number
          content: string
          embedding?: number[] | null
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          report_id?: string
          profile_id?: string
          chunk_index?: number
          content?: string
          embedding?: number[] | null
          metadata?: Json | null
          created_at?: string
        }
      }
      chat_sessions: {
        Row: {
          id: string
          profile_id: string
          title: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          title?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          title?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      chat_messages: {
        Row: {
          id: string
          session_id: string
          role: string
          content: string
          sources: Json | null
          model_used: string | null
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          role: string
          content: string
          sources?: Json | null
          model_used?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          role?: string
          content?: string
          sources?: Json | null
          model_used?: string | null
          created_at?: string
        }
      }
      transit_alerts: {
        Row: {
          id: string
          profile_id: string
          alert_type: string
          title: string
          content: string
          trigger_date: string
          planet: string | null
          natal_planet: string | null
          orb: number | null
          dispatched_whatsapp: boolean
          dispatched_email: boolean
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          alert_type: string
          title: string
          content: string
          trigger_date: string
          planet?: string | null
          natal_planet?: string | null
          orb?: number | null
          dispatched_whatsapp?: boolean
          dispatched_email?: boolean
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          alert_type?: string
          title?: string
          content?: string
          trigger_date?: string
          planet?: string | null
          natal_planet?: string | null
          orb?: number | null
          dispatched_whatsapp?: boolean
          dispatched_email?: boolean
          is_read?: boolean
          created_at?: string
        }
      }
      user_preferences: {
        Row: {
          id: string
          user_id: string
          ayanamsha: string
          house_system: string
          dasha_system: string
          default_language: string
          chart_style: string
          preferred_model: string
          whatsapp_number: string | null
          whatsapp_digest_enabled: boolean
          whatsapp_digest_time: string
          email_digest_enabled: boolean
          email_digest_day: string
          alert_orb: number
          alert_enabled: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          ayanamsha?: string
          house_system?: string
          dasha_system?: string
          default_language?: string
          chart_style?: string
          preferred_model?: string
          whatsapp_number?: string | null
          whatsapp_digest_enabled?: boolean
          whatsapp_digest_time?: string
          email_digest_enabled?: boolean
          email_digest_day?: string
          alert_orb?: number
          alert_enabled?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          ayanamsha?: string
          house_system?: string
          dasha_system?: string
          default_language?: string
          chart_style?: string
          preferred_model?: string
          whatsapp_number?: string | null
          whatsapp_digest_enabled?: boolean
          whatsapp_digest_time?: string
          email_digest_enabled?: boolean
          email_digest_day?: string
          alert_orb?: number
          alert_enabled?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      search_report_chunks: {
        Args: {
          p_profile_id: string
          p_query_embedding: number[]
          p_query_text: string
          p_limit?: number
        }
        Returns: {
          id: string
          content: string
          metadata: Json
          report_id: string
          similarity: number
          ts_rank: number
          combined_score: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}
