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
  public: {
    Tables: {
      adaptive_challenge_results: {
        Row: {
          average_time_per_question: number
          correct_answers: number
          created_at: string
          duration_seconds: number
          highest_level_reached: number
          id: string
          question_results: Json
          session_id: string | null
          skill_score: number
          skill_tier: string
          subject: string
          topic_performance: Json
          topics: string[]
          total_questions: number
          user_id: string | null
        }
        Insert: {
          average_time_per_question: number
          correct_answers: number
          created_at?: string
          duration_seconds: number
          highest_level_reached: number
          id?: string
          question_results?: Json
          session_id?: string | null
          skill_score: number
          skill_tier: string
          subject: string
          topic_performance?: Json
          topics: string[]
          total_questions: number
          user_id?: string | null
        }
        Update: {
          average_time_per_question?: number
          correct_answers?: number
          created_at?: string
          duration_seconds?: number
          highest_level_reached?: number
          id?: string
          question_results?: Json
          session_id?: string | null
          skill_score?: number
          skill_tier?: string
          subject?: string
          topic_performance?: Json
          topics?: string[]
          total_questions?: number
          user_id?: string | null
        }
        Relationships: []
      }
      friend_challenges: {
        Row: {
          challenged_id: string
          challenger_id: string
          created_at: string
          expires_at: string
          id: string
          room_code: string | null
          status: string
          subject: string
          topic: string
        }
        Insert: {
          challenged_id: string
          challenger_id: string
          created_at?: string
          expires_at?: string
          id?: string
          room_code?: string | null
          status?: string
          subject: string
          topic: string
        }
        Update: {
          challenged_id?: string
          challenger_id?: string
          created_at?: string
          expires_at?: string
          id?: string
          room_code?: string | null
          status?: string
          subject?: string
          topic?: string
        }
        Relationships: []
      }
      friendships: {
        Row: {
          addressee_id: string
          created_at: string
          id: string
          requester_id: string
          status: string
          updated_at: string
        }
        Insert: {
          addressee_id: string
          created_at?: string
          id?: string
          requester_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          addressee_id?: string
          created_at?: string
          id?: string
          requester_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      practice_schedules: {
        Row: {
          created_at: string
          ease_factor: number
          id: string
          interval_days: number
          last_performance: number | null
          last_practiced: string | null
          next_practice_date: string
          review_count: number
          subject: string
          topic_name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          ease_factor?: number
          id?: string
          interval_days?: number
          last_performance?: number | null
          last_practiced?: string | null
          next_practice_date?: string
          review_count?: number
          subject: string
          topic_name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          ease_factor?: number
          id?: string
          interval_days?: number
          last_performance?: number | null
          last_practiced?: string | null
          next_practice_date?: string
          review_count?: number
          subject?: string
          topic_name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          current_streak: number
          display_name: string
          grade: number | null
          id: string
          longest_streak: number
          questions_answered: number
          topics_mastered: number
          total_stars: number
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          current_streak?: number
          display_name: string
          grade?: number | null
          id?: string
          longest_streak?: number
          questions_answered?: number
          topics_mastered?: number
          total_stars?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          current_streak?: number
          display_name?: string
          grade?: number | null
          id?: string
          longest_streak?: number
          questions_answered?: number
          topics_mastered?: number
          total_stars?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      questions: {
        Row: {
          correct_answer: string
          created_at: string
          explanation: string | null
          hint: string | null
          id: string
          level: number
          option_a: string
          option_b: string
          option_c: string
          option_d: string
          question: string
          topic_id: string
        }
        Insert: {
          correct_answer: string
          created_at?: string
          explanation?: string | null
          hint?: string | null
          id?: string
          level: number
          option_a: string
          option_b: string
          option_c: string
          option_d: string
          question: string
          topic_id: string
        }
        Update: {
          correct_answer?: string
          created_at?: string
          explanation?: string | null
          hint?: string | null
          id?: string
          level?: number
          option_a?: string
          option_b?: string
          option_c?: string
          option_d?: string
          question?: string
          topic_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "questions_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_battles: {
        Row: {
          created_at: string
          current_question: number
          finished_at: string | null
          guest_id: string | null
          guest_score: number
          host_id: string
          host_score: number
          id: string
          room_code: string
          status: string
          subject: string
          topic: string
          total_questions: number
          winner: string | null
        }
        Insert: {
          created_at?: string
          current_question?: number
          finished_at?: string | null
          guest_id?: string | null
          guest_score?: number
          host_id: string
          host_score?: number
          id?: string
          room_code: string
          status?: string
          subject: string
          topic: string
          total_questions?: number
          winner?: string | null
        }
        Update: {
          created_at?: string
          current_question?: number
          finished_at?: string | null
          guest_id?: string | null
          guest_score?: number
          host_id?: string
          host_score?: number
          id?: string
          room_code?: string
          status?: string
          subject?: string
          topic?: string
          total_questions?: number
          winner?: string | null
        }
        Relationships: []
      }
      seen_fun_elements: {
        Row: {
          element_id: string
          id: string
          seen_at: string
          user_id: string
        }
        Insert: {
          element_id: string
          id?: string
          seen_at?: string
          user_id: string
        }
        Update: {
          element_id?: string
          id?: string
          seen_at?: string
          user_id?: string
        }
        Relationships: []
      }
      subjects: {
        Row: {
          created_at: string
          icon: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          icon?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          icon?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      topics: {
        Row: {
          created_at: string
          id: string
          name: string
          subject_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          subject_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          subject_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "topics_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      usage_logs: {
        Row: {
          action_type: string
          created_at: string
          details: Json | null
          estimated_cost: number | null
          id: string
          session_id: string | null
          user_id: string | null
        }
        Insert: {
          action_type: string
          created_at?: string
          details?: Json | null
          estimated_cost?: number | null
          id?: string
          session_id?: string | null
          user_id?: string | null
        }
        Update: {
          action_type?: string
          created_at?: string
          details?: Json | null
          estimated_cost?: number | null
          id?: string
          session_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
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
      get_adaptive_leaderboard: {
        Args: { p_limit?: number; p_subject?: string }
        Returns: {
          accuracy: number
          avatar_url: string
          best_result_date: string
          challenges_completed: number
          display_name: string
          highest_level: number
          rank: number
          skill_score: number
          skill_tier: string
        }[]
      }
      get_public_questions: {
        Args: never
        Returns: {
          correct_answer: string
          created_at: string
          explanation: string
          hint: string
          id: string
          level: number
          option_a: string
          option_b: string
          option_c: string
          option_d: string
          question: string
          topic_id: string
        }[]
      }
      get_question_summary: {
        Args: never
        Returns: {
          question_count: number
          subject_name: string
          topic_id: string
          topic_name: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
