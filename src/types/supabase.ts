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
    PostgrestVersion: "14.1"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
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
  public: {
    Tables: {
      articles: {
        Row: {
          author_name: string | null
          content: string
          created_at: string | null
          excerpt: string | null
          featured_image: string | null
          id: string
          published_at: string | null
          slug: string
          title: string
        }
        Insert: {
          author_name?: string | null
          content: string
          created_at?: string | null
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          published_at?: string | null
          slug: string
          title: string
        }
        Update: {
          author_name?: string | null
          content?: string
          created_at?: string | null
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          published_at?: string | null
          slug?: string
          title?: string
        }
        Relationships: []
      }
      course_lessons: {
        Row: {
          bunny_video_id: string | null
          created_at: string | null
          id: string
          is_free_preview: boolean | null
          lesson_number: number
          module_id: string
          text_content: string | null
          title: string
        }
        Insert: {
          bunny_video_id?: string | null
          created_at?: string | null
          id?: string
          is_free_preview?: boolean | null
          lesson_number: number
          module_id: string
          text_content?: string | null
          title: string
        }
        Update: {
          bunny_video_id?: string | null
          created_at?: string | null
          id?: string
          is_free_preview?: boolean | null
          lesson_number?: number
          module_id?: string
          text_content?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_lessons_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "course_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      course_modules: {
        Row: {
          course_id: string
          created_at: string | null
          description: string | null
          id: string
          module_number: number
          title: string
        }
        Insert: {
          course_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          module_number: number
          title: string
        }
        Update: {
          course_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          module_number?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_modules_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          instructor: string | null
          poster_horizontal: string | null
          poster_vertical: string | null
          slug: string
          status: string | null
          title: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          instructor?: string | null
          poster_horizontal?: string | null
          poster_vertical?: string | null
          slug: string
          status?: string | null
          title: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          instructor?: string | null
          poster_horizontal?: string | null
          poster_vertical?: string | null
          slug?: string
          status?: string | null
          title?: string
        }
        Relationships: []
      }
      episodes: {
        Row: {
          bunny_video_id: string
          created_at: string | null
          description: string | null
          duration: number | null
          episode_number: number
          id: string
          published_at: string | null
          season_id: string | null
          series_id: string | null
          source: string | null
          status: string
          thumbnail_custom: string | null
          title: string
        }
        Insert: {
          bunny_video_id: string
          created_at?: string | null
          description?: string | null
          duration?: number | null
          episode_number?: number
          id?: string
          published_at?: string | null
          season_id?: string | null
          series_id?: string | null
          source?: string | null
          status?: string
          thumbnail_custom?: string | null
          title: string
        }
        Update: {
          bunny_video_id?: string
          created_at?: string | null
          description?: string | null
          duration?: number | null
          episode_number?: number
          id?: string
          published_at?: string | null
          season_id?: string | null
          series_id?: string | null
          source?: string | null
          status?: string
          thumbnail_custom?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "episodes_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "episodes_series_id_fkey"
            columns: ["series_id"]
            isOneToOne: false
            referencedRelation: "series"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletters: {
        Row: {
          author: string
          content: string
          created_at: string | null
          id: string
          is_published: boolean | null
          published_at: string | null
          title: string
        }
        Insert: {
          author?: string
          content: string
          created_at?: string | null
          id?: string
          is_published?: boolean | null
          published_at?: string | null
          title: string
        }
        Update: {
          author?: string
          content?: string
          created_at?: string | null
          id?: string
          is_published?: boolean | null
          published_at?: string | null
          title?: string
        }
        Relationships: []
      }
      prayer_campaigns: {
        Row: {
          created_at: string | null
          description: string | null
          end_date: string
          id: string
          image_url: string | null
          is_active: boolean | null
          pray_count: number | null
          start_date: string
          title: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          end_date: string
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          pray_count?: number | null
          start_date?: string
          title: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          end_date?: string
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          pray_count?: number | null
          start_date?: string
          title?: string
        }
        Relationships: []
      }
      prayers: {
        Row: {
          campaign_id: string | null
          category_type: string | null
          content: string
          created_at: string | null
          email: string | null
          id: string
          is_answered: boolean | null
          is_approved: boolean | null
          is_private: boolean | null
          name: string
          pray_count: number | null
          topic: string
          updated_at: string | null
        }
        Insert: {
          campaign_id?: string | null
          category_type?: string | null
          content: string
          created_at?: string | null
          email?: string | null
          id?: string
          is_answered?: boolean | null
          is_approved?: boolean | null
          is_private?: boolean | null
          name: string
          pray_count?: number | null
          topic: string
          updated_at?: string | null
        }
        Update: {
          campaign_id?: string | null
          category_type?: string | null
          content?: string
          created_at?: string | null
          email?: string | null
          id?: string
          is_answered?: boolean | null
          is_approved?: boolean | null
          is_private?: boolean | null
          name?: string
          pray_count?: number | null
          topic?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prayers_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "prayer_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      quotes: {
        Row: {
          author: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          reference: string | null
          text: string
        }
        Insert: {
          author?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          reference?: string | null
          text: string
        }
        Update: {
          author?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          reference?: string | null
          text?: string
        }
        Relationships: []
      }
      seasons: {
        Row: {
          created_at: string | null
          id: string
          published_at: string | null
          season_number: number
          series_id: string
          title: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          published_at?: string | null
          season_number: number
          series_id: string
          title?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          published_at?: string | null
          season_number?: number
          series_id?: string
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "seasons_series_id_fkey"
            columns: ["series_id"]
            isOneToOne: false
            referencedRelation: "series"
            referencedColumns: ["id"]
          },
        ]
      }
      series: {
        Row: {
          created_at: string | null
          description: string | null
          host: string | null
          id: string
          poster_horizontal: string | null
          poster_vertical: string | null
          slug: string
          status: string | null
          title: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          host?: string | null
          id?: string
          poster_horizontal?: string | null
          poster_vertical?: string | null
          slug: string
          status?: string | null
          title: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          host?: string | null
          id?: string
          poster_horizontal?: string | null
          poster_vertical?: string | null
          slug?: string
          status?: string | null
          title?: string
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          created_at: string | null
          email: string
          id: string
          is_verified: boolean | null
          name: string | null
          segments: string[] | null
          tags: string[] | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          is_verified?: boolean | null
          name?: string | null
          segments?: string[] | null
          tags?: string[] | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          is_verified?: boolean | null
          name?: string | null
          segments?: string[] | null
          tags?: string[] | null
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          content: string
          created_at: string | null
          email: string | null
          id: string
          is_approved: boolean | null
          name: string
        }
        Insert: {
          content: string
          created_at?: string | null
          email?: string | null
          id?: string
          is_approved?: boolean | null
          name: string
        }
        Update: {
          content?: string
          created_at?: string | null
          email?: string | null
          id?: string
          is_approved?: boolean | null
          name?: string
        }
        Relationships: []
      }
      user_lesson_progress: {
        Row: {
          completed_at: string | null
          created_at: string | null
          id: string
          lesson_id: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          lesson_id: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          lesson_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_lesson_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "course_lessons"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
