export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1";
  };
  public: {
    Tables: {
      activity_log: {
        Row: {
          action: Database["public"]["Enums"]["log_action"];
          agent: string;
          created_at: string;
          details: Json | null;
          id: string;
          task_id: string;
          user_id: string;
        };
        Insert: {
          action: Database["public"]["Enums"]["log_action"];
          agent: string;
          created_at?: string;
          details?: Json | null;
          id?: string;
          task_id: string;
          user_id: string;
        };
        Update: {
          action?: Database["public"]["Enums"]["log_action"];
          agent?: string;
          created_at?: string;
          details?: Json | null;
          id?: string;
          task_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "activity_log_task_id_fkey";
            columns: ["task_id"];
            isOneToOne: false;
            referencedRelation: "tasks";
            referencedColumns: ["id"];
          },
        ];
      };
      agent_feedback: {
        Row: {
          agent_name: string;
          created_at: string | null;
          id: string;
          message: string;
          user_id: string;
        };
        Insert: {
          agent_name: string;
          created_at?: string | null;
          id?: string;
          message: string;
          user_id: string;
        };
        Update: {
          agent_name?: string;
          created_at?: string | null;
          id?: string;
          message?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      api_keys: {
        Row: {
          capabilities: string[] | null;
          created_at: string;
          description: string | null;
          id: string;
          key_hash: string;
          last_used_at: string | null;
          name: string;
          permissions: Json | null;
          user_id: string;
        };
        Insert: {
          capabilities?: string[] | null;
          created_at?: string;
          description?: string | null;
          id?: string;
          key_hash: string;
          last_used_at?: string | null;
          name: string;
          permissions?: Json | null;
          user_id: string;
        };
        Update: {
          capabilities?: string[] | null;
          created_at?: string;
          description?: string | null;
          id?: string;
          key_hash?: string;
          last_used_at?: string | null;
          name?: string;
          permissions?: Json | null;
          user_id?: string;
        };
        Relationships: [];
      };
      cheat_sheets: {
        Row: {
          content: Json | null;
          created_at: string | null;
          html_content: string | null;
          id: string;
          pdf_path: string | null;
          pdf_url: string | null;
          status: string | null;
          title: string;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          content?: Json | null;
          created_at?: string | null;
          html_content?: string | null;
          id?: string;
          pdf_path?: string | null;
          pdf_url?: string | null;
          status?: string | null;
          title: string;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          content?: Json | null;
          created_at?: string | null;
          html_content?: string | null;
          id?: string;
          pdf_path?: string | null;
          pdf_url?: string | null;
          status?: string | null;
          title?: string;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      focus_items: {
        Row: {
          created_at: string;
          day: string | null;
          id: string;
          project: string | null;
          task: string | null;
          updated_at: string | null;
          user_id: string | null;
        };
        Insert: {
          created_at?: string;
          day?: string | null;
          id?: string;
          project?: string | null;
          task?: string | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Update: {
          created_at?: string;
          day?: string | null;
          id?: string;
          project?: string | null;
          task?: string | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          created_at: string | null;
          credits: number | null;
          id: string;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          credits?: number | null;
          id: string;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          credits?: number | null;
          id?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      projects: {
        Row: {
          client: string | null;
          created_at: string;
          description: string | null;
          hourly_rate: number | null;
          id: string;
          is_active: boolean | null;
          name: string;
          user_id: string;
        };
        Insert: {
          client?: string | null;
          created_at?: string;
          description?: string | null;
          hourly_rate?: number | null;
          id?: string;
          is_active?: boolean | null;
          name: string;
          user_id: string;
        };
        Update: {
          client?: string | null;
          created_at?: string;
          description?: string | null;
          hourly_rate?: number | null;
          id?: string;
          is_active?: boolean | null;
          name?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "projects_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      projects_: {
        Row: {
          color: string | null;
          created_at: string;
          description: string | null;
          id: string;
          name: string;
          user_id: string;
        };
        Insert: {
          color?: string | null;
          created_at?: string;
          description?: string | null;
          id?: string;
          name: string;
          user_id: string;
        };
        Update: {
          color?: string | null;
          created_at?: string;
          description?: string | null;
          id?: string;
          name?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      task_attachments: {
        Row: {
          created_at: string;
          id: string;
          name: string;
          size: number;
          storage_path: string;
          task_id: string;
          type: string;
          url: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          name: string;
          size?: number;
          storage_path: string;
          task_id: string;
          type?: string;
          url: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          name?: string;
          size?: number;
          storage_path?: string;
          task_id?: string;
          type?: string;
          url?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "task_attachments_task_id_fkey";
            columns: ["task_id"];
            isOneToOne: false;
            referencedRelation: "tasks";
            referencedColumns: ["id"];
          },
        ];
      };
      task_dependencies: {
        Row: {
          created_at: string;
          depends_on_task_id: string;
          id: string;
          task_id: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          depends_on_task_id: string;
          id?: string;
          task_id: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          depends_on_task_id?: string;
          id?: string;
          task_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "task_dependencies_depends_on_task_id_fkey";
            columns: ["depends_on_task_id"];
            isOneToOne: false;
            referencedRelation: "tasks";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "task_dependencies_task_id_fkey";
            columns: ["task_id"];
            isOneToOne: false;
            referencedRelation: "tasks";
            referencedColumns: ["id"];
          },
        ];
      };
      task_messages: {
        Row: {
          content: string;
          created_at: string;
          from_agent: string;
          id: string;
          task_id: string;
          user_id: string;
        };
        Insert: {
          content: string;
          created_at?: string;
          from_agent?: string;
          id?: string;
          task_id: string;
          user_id: string;
        };
        Update: {
          content?: string;
          created_at?: string;
          from_agent?: string;
          id?: string;
          task_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "task_messages_task_id_fkey";
            columns: ["task_id"];
            isOneToOne: false;
            referencedRelation: "tasks";
            referencedColumns: ["id"];
          },
        ];
      };
      tasks: {
        Row: {
          artifacts: string[] | null;
          assigned_agent: string | null;
          blockers: string[] | null;
          claimed_at: string | null;
          completed_at: string | null;
          confidence: number | null;
          context: Json | null;
          created_at: string;
          created_by: string;
          deleted_at: string | null;
          description: string | null;
          human_input_needed: boolean;
          id: string;
          intent: Database["public"]["Enums"]["task_intent"];
          metadata: Json | null;
          next_run_at: string | null;
          parent_task_id: string | null;
          priority: number;
          project: string | null;
          recurrence: Json | null;
          recurrence_source_id: string | null;
          requires_human_review: boolean;
          result: Json | null;
          status: Database["public"]["Enums"]["task_status"];
          title: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          artifacts?: string[] | null;
          assigned_agent?: string | null;
          blockers?: string[] | null;
          claimed_at?: string | null;
          completed_at?: string | null;
          confidence?: number | null;
          context?: Json | null;
          created_at?: string;
          created_by?: string;
          deleted_at?: string | null;
          description?: string | null;
          human_input_needed?: boolean;
          id?: string;
          intent?: Database["public"]["Enums"]["task_intent"];
          metadata?: Json | null;
          next_run_at?: string | null;
          parent_task_id?: string | null;
          priority?: number;
          project?: string | null;
          recurrence?: Json | null;
          recurrence_source_id?: string | null;
          requires_human_review?: boolean;
          result?: Json | null;
          status?: Database["public"]["Enums"]["task_status"];
          title: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          artifacts?: string[] | null;
          assigned_agent?: string | null;
          blockers?: string[] | null;
          claimed_at?: string | null;
          completed_at?: string | null;
          confidence?: number | null;
          context?: Json | null;
          created_at?: string;
          created_by?: string;
          deleted_at?: string | null;
          description?: string | null;
          human_input_needed?: boolean;
          id?: string;
          intent?: Database["public"]["Enums"]["task_intent"];
          metadata?: Json | null;
          next_run_at?: string | null;
          parent_task_id?: string | null;
          priority?: number;
          project?: string | null;
          recurrence?: Json | null;
          recurrence_source_id?: string | null;
          requires_human_review?: boolean;
          result?: Json | null;
          status?: Database["public"]["Enums"]["task_status"];
          title?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "tasks_parent_task_id_fkey";
            columns: ["parent_task_id"];
            isOneToOne: false;
            referencedRelation: "tasks";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "tasks_recurrence_source_id_fkey";
            columns: ["recurrence_source_id"];
            isOneToOne: false;
            referencedRelation: "tasks";
            referencedColumns: ["id"];
          },
        ];
      };
      time_entries: {
        Row: {
          created_at: string;
          description: string | null;
          duration: number | null;
          end_time: string | null;
          id: string;
          project_id: string;
          start_time: string;
          tags: string[] | null;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          duration?: number | null;
          end_time?: string | null;
          id?: string;
          project_id: string;
          start_time: string;
          tags?: string[] | null;
          user_id: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          duration?: number | null;
          end_time?: string | null;
          id?: string;
          project_id?: string;
          start_time?: string;
          tags?: string[] | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "time_entries_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "time_entries_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      user_plans: {
        Row: {
          created_at: string;
          current_period_end: string | null;
          id: string;
          plan: Database["public"]["Enums"]["plan_type"];
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          current_period_end?: string | null;
          id?: string;
          plan?: Database["public"]["Enums"]["plan_type"];
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          current_period_end?: string | null;
          id?: string;
          plan?: Database["public"]["Enums"]["plan_type"];
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      users: {
        Row: {
          created_at: string | null;
          credits: number | null;
          email: string | null;
          gender: string | null;
          has_claimed_signup_bonus: boolean | null;
          id: string;
          is_public: boolean | null;
          name: string | null;
          onboarding_completed: boolean | null;
          photo_url: string | null;
          updated_at: string | null;
          username: string | null;
        };
        Insert: {
          created_at?: string | null;
          credits?: number | null;
          email?: string | null;
          gender?: string | null;
          has_claimed_signup_bonus?: boolean | null;
          id?: string;
          is_public?: boolean | null;
          name?: string | null;
          onboarding_completed?: boolean | null;
          photo_url?: string | null;
          updated_at?: string | null;
          username?: string | null;
        };
        Update: {
          created_at?: string | null;
          credits?: number | null;
          email?: string | null;
          gender?: string | null;
          has_claimed_signup_bonus?: boolean | null;
          id?: string;
          is_public?: boolean | null;
          name?: string | null;
          onboarding_completed?: boolean | null;
          photo_url?: string | null;
          updated_at?: string | null;
          username?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      add_user_credits_v2: {
        Args: {
          p_amount: number;
          p_description: string;
          p_transaction_type: string;
          p_user_id: string;
        };
        Returns: boolean;
      };
      deduct_credit: { Args: { user_id: string }; Returns: undefined };
      get_user_credits: { Args: { user_id: string }; Returns: number };
      use_user_credits: {
        Args: { p_amount: number; p_description: string; p_user_id: string };
        Returns: boolean;
      };
    };
    Enums: {
      log_action:
        | "created"
        | "claimed"
        | "updated"
        | "blocked"
        | "completed"
        | "added_subtask"
        | "request_review"
        | "unclaimed"
        | "message_sent"
        | "deleted";
      plan_type: "free" | "pro";
      task_intent:
        | "research"
        | "build"
        | "write"
        | "think"
        | "admin"
        | "ops"
        | "monitor"
        | "test"
        | "review"
        | "deploy";
      task_status: "todo" | "in_progress" | "blocked" | "review" | "done";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      log_action: [
        "created",
        "claimed",
        "updated",
        "blocked",
        "completed",
        "added_subtask",
        "request_review",
        "unclaimed",
        "message_sent",
        "deleted",
      ],
      plan_type: ["free", "pro"],
      task_intent: [
        "research",
        "build",
        "write",
        "think",
        "admin",
        "ops",
        "monitor",
        "test",
        "review",
        "deploy",
      ],
      task_status: ["todo", "in_progress", "blocked", "review", "done"],
    },
  },
} as const;
