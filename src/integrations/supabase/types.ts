export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      calendar_events: {
        Row: {
          created_at: string
          description: string | null
          ends_at: string | null
          event_at: string
          experience_type: string
          id: string
          image_alt: string | null
          image_url: string | null
          import_notes: string | null
          imported_at: string
          instagram_media_id: string | null
          location: string | null
          parser_confidence: number | null
          reviewed_at: string | null
          reviewed_by: string | null
          source_caption: string | null
          source_published_at: string | null
          source_url: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          ends_at?: string | null
          event_at: string
          experience_type?: string
          id?: string
          image_alt?: string | null
          image_url?: string | null
          import_notes?: string | null
          imported_at?: string
          instagram_media_id?: string | null
          location?: string | null
          parser_confidence?: number | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          source_caption?: string | null
          source_published_at?: string | null
          source_url?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          ends_at?: string | null
          event_at?: string
          experience_type?: string
          id?: string
          image_alt?: string | null
          image_url?: string | null
          import_notes?: string | null
          imported_at?: string
          instagram_media_id?: string | null
          location?: string | null
          parser_confidence?: number | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          source_caption?: string | null
          source_published_at?: string | null
          source_url?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      community_albums: {
        Row: {
          created_at: string
          description: string | null
          id: string
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      community_comments: {
        Row: {
          body: string
          created_at: string
          edited_at: string | null
          id: string
          parent_id: string | null
          post_id: string
          status: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          edited_at?: string | null
          id?: string
          parent_id?: string | null
          post_id: string
          status?: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          edited_at?: string | null
          id?: string
          parent_id?: string | null
          post_id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "community_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      community_event_rsvps: {
        Row: {
          created_at: string
          id: string
          post_id: string
          response: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          response: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          response?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_event_rsvps_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      community_memberships: {
        Row: {
          created_at: string
          id: string
          invited_by: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          invited_by?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          invited_by?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      community_moderation_log: {
        Row: {
          action: string
          created_at: string
          id: string
          moderator_id: string
          notes: string | null
          target_id: string | null
          target_type: string
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          moderator_id: string
          notes?: string | null
          target_id?: string | null
          target_type: string
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          moderator_id?: string
          notes?: string | null
          target_id?: string | null
          target_type?: string
        }
        Relationships: []
      }
      community_notifications: {
        Row: {
          actor_id: string | null
          created_at: string
          id: string
          kind: string
          message: string
          post_id: string | null
          read_at: string | null
          user_id: string
        }
        Insert: {
          actor_id?: string | null
          created_at?: string
          id?: string
          kind: string
          message: string
          post_id?: string | null
          read_at?: string | null
          user_id: string
        }
        Update: {
          actor_id?: string | null
          created_at?: string
          id?: string
          kind?: string
          message?: string
          post_id?: string | null
          read_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_notifications_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      community_poll_options: {
        Row: {
          id: string
          label: string
          poll_id: string
          sort_order: number
        }
        Insert: {
          id?: string
          label: string
          poll_id: string
          sort_order?: number
        }
        Update: {
          id?: string
          label?: string
          poll_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "community_poll_options_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "community_polls"
            referencedColumns: ["id"]
          },
        ]
      }
      community_poll_votes: {
        Row: {
          created_at: string
          id: string
          option_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          option_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          option_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_poll_votes_option_id_fkey"
            columns: ["option_id"]
            isOneToOne: false
            referencedRelation: "community_poll_options"
            referencedColumns: ["id"]
          },
        ]
      }
      community_polls: {
        Row: {
          allows_multiple: boolean
          closes_at: string | null
          created_at: string
          id: string
          post_id: string
          question: string
        }
        Insert: {
          allows_multiple?: boolean
          closes_at?: string | null
          created_at?: string
          id?: string
          post_id: string
          question: string
        }
        Update: {
          allows_multiple?: boolean
          closes_at?: string | null
          created_at?: string
          id?: string
          post_id?: string
          question?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_polls_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: true
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      community_post_media: {
        Row: {
          alt_text: string | null
          created_at: string
          id: string
          media_type: string
          post_id: string
          sort_order: number
          storage_path: string
          user_id: string
        }
        Insert: {
          alt_text?: string | null
          created_at?: string
          id?: string
          media_type: string
          post_id: string
          sort_order?: number
          storage_path: string
          user_id: string
        }
        Update: {
          alt_text?: string | null
          created_at?: string
          id?: string
          media_type?: string
          post_id?: string
          sort_order?: number
          storage_path?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_post_media_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      community_posts: {
        Row: {
          body: string
          created_at: string
          edited_at: string | null
          event_at: string | null
          id: string
          is_announcement: boolean
          is_anonymous: boolean
          is_pinned: boolean
          link_url: string | null
          media_type: string | null
          media_url: string | null
          post_type: string
          status: string
          title: string | null
          topic: string | null
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          edited_at?: string | null
          event_at?: string | null
          id?: string
          is_announcement?: boolean
          is_anonymous?: boolean
          is_pinned?: boolean
          link_url?: string | null
          media_type?: string | null
          media_url?: string | null
          post_type?: string
          status?: string
          title?: string | null
          topic?: string | null
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          edited_at?: string | null
          event_at?: string | null
          id?: string
          is_announcement?: boolean
          is_anonymous?: boolean
          is_pinned?: boolean
          link_url?: string | null
          media_type?: string | null
          media_url?: string | null
          post_type?: string
          status?: string
          title?: string | null
          topic?: string | null
          user_id?: string
        }
        Relationships: []
      }
      community_reactions: {
        Row: {
          created_at: string
          id: string
          post_id: string
          reaction: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          reaction?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          reaction?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_reactions_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      community_reports: {
        Row: {
          created_at: string
          id: string
          post_id: string
          reason: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          reason: string
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          reason?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_reports_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      community_saved_posts: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_saved_posts_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      family_students: {
        Row: {
          class_year: string | null
          created_at: string
          dietary_notes: string | null
          first_name: string
          housing: string | null
          id: string
          last_name: string | null
          notes: string | null
          parent_id: string
          program: string | null
          start_term: string | null
          updated_at: string
        }
        Insert: {
          class_year?: string | null
          created_at?: string
          dietary_notes?: string | null
          first_name: string
          housing?: string | null
          id?: string
          last_name?: string | null
          notes?: string | null
          parent_id: string
          program?: string | null
          start_term?: string | null
          updated_at?: string
        }
        Update: {
          class_year?: string | null
          created_at?: string
          dietary_notes?: string | null
          first_name?: string
          housing?: string | null
          id?: string
          last_name?: string | null
          notes?: string | null
          parent_id?: string
          program?: string | null
          start_term?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      faq_suggestions: {
        Row: {
          answer: string | null
          category: string | null
          created_at: string
          id: string
          question: string
          reviewed_at: string | null
          status: string
          user_id: string
        }
        Insert: {
          answer?: string | null
          category?: string | null
          created_at?: string
          id?: string
          question: string
          reviewed_at?: string | null
          status?: string
          user_id: string
        }
        Update: {
          answer?: string | null
          category?: string | null
          created_at?: string
          id?: string
          question?: string
          reviewed_at?: string | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      instagram_highlights: {
        Row: {
          caption: string | null
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          post_url: string
          posted_at: string | null
          sort_order: number
        }
        Insert: {
          caption?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          post_url: string
          posted_at?: string | null
          sort_order?: number
        }
        Update: {
          caption?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          post_url?: string
          posted_at?: string | null
          sort_order?: number
        }
        Relationships: []
      }
      instagram_import_runs: {
        Row: {
          completed_at: string | null
          error_message: string | null
          id: string
          imported_count: number
          skipped_count: number
          started_at: string
          status: string
        }
        Insert: {
          completed_at?: string | null
          error_message?: string | null
          id?: string
          imported_count?: number
          skipped_count?: number
          started_at?: string
          status?: string
        }
        Update: {
          completed_at?: string | null
          error_message?: string | null
          id?: string
          imported_count?: number
          skipped_count?: number
          started_at?: string
          status?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_path: string | null
          bio: string | null
          created_at: string
          display_name: string
          id: string
          joined_at: string
          location: string | null
          member_status: string
          phone: string | null
        }
        Insert: {
          avatar_path?: string | null
          bio?: string | null
          created_at?: string
          display_name: string
          id: string
          joined_at?: string
          location?: string | null
          member_status?: string
          phone?: string | null
        }
        Update: {
          avatar_path?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string
          id?: string
          joined_at?: string
          location?: string | null
          member_status?: string
          phone?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_approved_member: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "member" | "moderator"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["member", "moderator"],
    },
  },
} as const
