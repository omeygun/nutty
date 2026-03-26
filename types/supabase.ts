import { DayOfWeek } from "@/types/availability"

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      availability: {
        Row: {
          created_at: string
          day_of_week: number
          end_time: string
          id: string
          start_time: string
          updated_at: string
          user_id: string
        }
        Insert: {
          day_of_week: number
          end_time: string
          id?: string
          start_time: string
          updated_at?: string
          user_id: string
        }
        Update: {
          day_of_week?: number
          end_time?: string
          id?: string
          start_time?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "availability_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      },
      date_availability: {
        Row: {
          created_at: string
          day_of_week: DayOfWeek
          date: string
          end_time: string
          id: string
          start_time: string
          updated_at: string
          user_id: string
        }
        Insert: {
          date: string
          day_of_week: number
          end_time: string
          id?: string
          start_time: string
          updated_at?: string
          user_id: string
        }
        Update: {
          date?: string
          end_time?: string
          day_of_week: number
          id?: string
          start_time?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "date_availability_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      },
      group_availability: {
        Row: {
          created_at: string
          date: string
          end_time: string
          event_id: string
          id: string
          participant_id: string
          start_time: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          date: string
          end_time: string
          event_id: string
          id?: string
          participant_id: string
          start_time: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          date?: string
          end_time?: string
          event_id?: string
          id?: string
          participant_id?: string
          start_time?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_availability_event_id_fkey"
            columns: ["event_id"]
            referencedRelation: "group_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_availability_participant_id_fkey"
            columns: ["participant_id"]
            referencedRelation: "group_participants"
            referencedColumns: ["id"]
          },
        ]
      },
      group_events: {
        Row: {
          confirmed_at: string | null
          confirmed_by: string | null
          confirmed_date: string | null
          confirmed_end_time: string | null
          confirmed_google_event_id: string | null
          confirmed_google_event_url: string | null
          confirmed_notes: string | null
          confirmed_start_time: string | null
          confirmed_title: string | null
          created_at: string
          description: string | null
          end_date: string
          id: string
          organizer_id: string
          results_visible: boolean
          slug: string
          start_date: string
          status: string
          timezone: string
          title: string
          updated_at: string
        }
        Insert: {
          confirmed_at?: string | null
          confirmed_by?: string | null
          confirmed_date?: string | null
          confirmed_end_time?: string | null
          confirmed_google_event_id?: string | null
          confirmed_google_event_url?: string | null
          confirmed_notes?: string | null
          confirmed_start_time?: string | null
          confirmed_title?: string | null
          created_at?: string
          description?: string | null
          end_date: string
          id?: string
          organizer_id: string
          results_visible?: boolean
          slug: string
          start_date: string
          status?: string
          timezone?: string
          title: string
          updated_at?: string
        }
        Update: {
          confirmed_at?: string | null
          confirmed_by?: string | null
          confirmed_date?: string | null
          confirmed_end_time?: string | null
          confirmed_google_event_id?: string | null
          confirmed_google_event_url?: string | null
          confirmed_notes?: string | null
          confirmed_start_time?: string | null
          confirmed_title?: string | null
          created_at?: string
          description?: string | null
          end_date?: string
          id?: string
          organizer_id?: string
          results_visible?: boolean
          slug?: string
          start_date?: string
          status?: string
          timezone?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_events_organizer_id_fkey"
            columns: ["organizer_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_events_organizer_id_fkey"
            columns: ["organizer_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      },
      group_participants: {
        Row: {
          created_at: string
          edit_token_hash: string
          event_id: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          edit_token_hash: string
          event_id: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          edit_token_hash?: string
          event_id?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_participants_event_id_fkey"
            columns: ["event_id"]
            referencedRelation: "group_events"
            referencedColumns: ["id"]
          },
        ]
      },
      friends: {
        Row: {
          created_at: string
          friend_id: string
          id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          friend_id: string
          id?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          friend_id?: string
          id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "friends_friend_id_fkey"
            columns: ["friend_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "friends_friend_id_fkey"
            columns: ["friend_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "friends_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "friends_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          first_name?: string | null
          last_name?: string | null
          id: string
          updated_at: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          first_name?: string | null
          last_name?: string | null
          id: string
          updated_at?: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          first_name?: string | null
          last_name?: string | null
          id?: string
          updated_at?: string
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_group_event: {
        Args: {
          p_title: string
          p_description: string
          p_start_date: string
          p_end_date: string
          p_timezone: string
        }
        Returns: Database["public"]["Tables"]["group_events"]["Row"]
      }
      get_group_event_public: {
        Args: {
          p_slug: string
          p_edit_token_hash?: string | null
        }
        Returns: Json
      }
      get_group_event_submissions: {
        Args: {
          p_slug: string
        }
        Returns: {
          participant_id: string
          participant_name: string
          date: string
          start_time: string
          end_time: string
        }[]
      }
      get_group_participant_availability: {
        Args: {
          p_slug: string
          p_edit_token_hash: string
        }
        Returns: {
          date: string
          start_time: string
          end_time: string
        }[]
      }
      replace_group_participant_availability: {
        Args: {
          p_slug: string
          p_edit_token_hash: string
          p_entries: Json
        }
        Returns: Json
      }
      toggle_group_results_visibility: {
        Args: {
          p_slug: string
          p_results_visible: boolean
        }
        Returns: Database["public"]["Tables"]["group_events"]["Row"]
      }
      upsert_group_participant: {
        Args: {
          p_slug: string
          p_name: string
          p_edit_token_hash: string
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
