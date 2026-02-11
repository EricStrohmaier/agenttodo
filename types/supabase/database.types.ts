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
      book_spreads: {
        Row: {
          book_id: string;
          created_at: string | null;
          error_message: string | null;
          generation_attempts: number | null;
          generation_completed_at: string | null;
          generation_started_at: string | null;
          id: string;
          image_prompt: string | null;
          image_storage_path: string | null;
          image_url: string | null;
          is_active: boolean;
          layout: Json | null;
          layout_template_id: string | null;
          layout_type: string | null;
          left_text: string | null;
          raw_image_storage_path: string | null;
          raw_image_url: string | null;
          right_text: string | null;
          scene_description: string | null;
          spread_index: number;
          spread_type: string | null;
          status: string | null;
          updated_at: string | null;
          version: number;
        };
        Insert: {
          book_id: string;
          created_at?: string | null;
          error_message?: string | null;
          generation_attempts?: number | null;
          generation_completed_at?: string | null;
          generation_started_at?: string | null;
          id?: string;
          image_prompt?: string | null;
          image_storage_path?: string | null;
          image_url?: string | null;
          is_active?: boolean;
          layout?: Json | null;
          layout_template_id?: string | null;
          layout_type?: string | null;
          left_text?: string | null;
          raw_image_storage_path?: string | null;
          raw_image_url?: string | null;
          right_text?: string | null;
          scene_description?: string | null;
          spread_index: number;
          spread_type?: string | null;
          status?: string | null;
          updated_at?: string | null;
          version?: number;
        };
        Update: {
          book_id?: string;
          created_at?: string | null;
          error_message?: string | null;
          generation_attempts?: number | null;
          generation_completed_at?: string | null;
          generation_started_at?: string | null;
          id?: string;
          image_prompt?: string | null;
          image_storage_path?: string | null;
          image_url?: string | null;
          is_active?: boolean;
          layout?: Json | null;
          layout_template_id?: string | null;
          layout_type?: string | null;
          left_text?: string | null;
          raw_image_storage_path?: string | null;
          raw_image_url?: string | null;
          right_text?: string | null;
          scene_description?: string | null;
          spread_index?: number;
          spread_type?: string | null;
          status?: string | null;
          updated_at?: string | null;
          version?: number;
        };
        Relationships: [
          {
            foreignKeyName: "book_spreads_book_id_fkey";
            columns: ["book_id"];
            isOneToOne: false;
            referencedRelation: "books";
            referencedColumns: ["id"];
          },
        ];
      };
      books: {
        Row: {
          art_style: string;
          chat_session_id: string | null;
          child_data: Json;
          child_profile_id: string | null;
          completed_spreads: number | null;
          cover_image_storage_path: string | null;
          cover_image_url: string | null;
          created_at: string | null;
          deleted_at: string | null;
          error_count: number | null;
          format_id: string | null;
          generation_completed_at: string | null;
          generation_started_at: string | null;
          id: string;
          last_error: string | null;
          orientation: string | null;
          pdf_generated_at: string | null;
          pdf_storage_path: string | null;
          pdf_url: string | null;
          status: string | null;
          story_concept: Json | null;
          style_preview_storage_path: string | null;
          style_preview_url: string | null;
          subtitle: string | null;
          target_age_group: string | null;
          theme: string | null;
          title: string;
          total_spreads: number | null;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          art_style: string;
          chat_session_id?: string | null;
          child_data: Json;
          child_profile_id?: string | null;
          completed_spreads?: number | null;
          cover_image_storage_path?: string | null;
          cover_image_url?: string | null;
          created_at?: string | null;
          deleted_at?: string | null;
          error_count?: number | null;
          format_id?: string | null;
          generation_completed_at?: string | null;
          generation_started_at?: string | null;
          id?: string;
          last_error?: string | null;
          orientation?: string | null;
          pdf_generated_at?: string | null;
          pdf_storage_path?: string | null;
          pdf_url?: string | null;
          status?: string | null;
          story_concept?: Json | null;
          style_preview_storage_path?: string | null;
          style_preview_url?: string | null;
          subtitle?: string | null;
          target_age_group?: string | null;
          theme?: string | null;
          title: string;
          total_spreads?: number | null;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          art_style?: string;
          chat_session_id?: string | null;
          child_data?: Json;
          child_profile_id?: string | null;
          completed_spreads?: number | null;
          cover_image_storage_path?: string | null;
          cover_image_url?: string | null;
          created_at?: string | null;
          deleted_at?: string | null;
          error_count?: number | null;
          format_id?: string | null;
          generation_completed_at?: string | null;
          generation_started_at?: string | null;
          id?: string;
          last_error?: string | null;
          orientation?: string | null;
          pdf_generated_at?: string | null;
          pdf_storage_path?: string | null;
          pdf_url?: string | null;
          status?: string | null;
          story_concept?: Json | null;
          style_preview_storage_path?: string | null;
          style_preview_url?: string | null;
          subtitle?: string | null;
          target_age_group?: string | null;
          theme?: string | null;
          title?: string;
          total_spreads?: number | null;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "books_chat_session_id_fkey";
            columns: ["chat_session_id"];
            isOneToOne: true;
            referencedRelation: "chat_sessions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "books_child_profile_id_fkey";
            columns: ["child_profile_id"];
            isOneToOne: false;
            referencedRelation: "child_profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "books_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      chat_messages: {
        Row: {
          chat_session_id: string;
          content: string;
          created_at: string | null;
          id: string;
          role: string;
          sequence_num: number;
          tool_invocations: Json | null;
        };
        Insert: {
          chat_session_id: string;
          content: string;
          created_at?: string | null;
          id?: string;
          role: string;
          sequence_num: number;
          tool_invocations?: Json | null;
        };
        Update: {
          chat_session_id?: string;
          content?: string;
          created_at?: string | null;
          id?: string;
          role?: string;
          sequence_num?: number;
          tool_invocations?: Json | null;
        };
        Relationships: [
          {
            foreignKeyName: "chat_messages_chat_session_id_fkey";
            columns: ["chat_session_id"];
            isOneToOne: false;
            referencedRelation: "chat_sessions";
            referencedColumns: ["id"];
          },
        ];
      };
      chat_sessions: {
        Row: {
          book_id: string | null;
          character_data: Json | null;
          created_at: string | null;
          current_step: string;
          id: string;
          story_preferences: Json | null;
          suggestions: Json | null;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          book_id?: string | null;
          character_data?: Json | null;
          created_at?: string | null;
          current_step?: string;
          id?: string;
          story_preferences?: Json | null;
          suggestions?: Json | null;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          book_id?: string | null;
          character_data?: Json | null;
          created_at?: string | null;
          current_step?: string;
          id?: string;
          story_preferences?: Json | null;
          suggestions?: Json | null;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "chat_sessions_book_id_fkey";
            columns: ["book_id"];
            isOneToOne: false;
            referencedRelation: "books";
            referencedColumns: ["id"];
          },
        ];
      };
      child_profiles: {
        Row: {
          age: string | null;
          appearance: Json | null;
          character_description: string | null;
          chat_session_id: string | null;
          created_at: string | null;
          deleted_at: string | null;
          gender: string | null;
          id: string;
          is_default: boolean | null;
          name: string;
          photo_analysis: Json | null;
          photo_paths: string[] | null;
          photo_storage_path: string | null;
          photo_url: string | null;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          age?: string | null;
          appearance?: Json | null;
          character_description?: string | null;
          chat_session_id?: string | null;
          created_at?: string | null;
          deleted_at?: string | null;
          gender?: string | null;
          id?: string;
          is_default?: boolean | null;
          name: string;
          photo_analysis?: Json | null;
          photo_paths?: string[] | null;
          photo_storage_path?: string | null;
          photo_url?: string | null;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          age?: string | null;
          appearance?: Json | null;
          character_description?: string | null;
          chat_session_id?: string | null;
          created_at?: string | null;
          deleted_at?: string | null;
          gender?: string | null;
          id?: string;
          is_default?: boolean | null;
          name?: string;
          photo_analysis?: Json | null;
          photo_paths?: string[] | null;
          photo_storage_path?: string | null;
          photo_url?: string | null;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "child_profiles_chat_session_id_fkey";
            columns: ["chat_session_id"];
            isOneToOne: false;
            referencedRelation: "chat_sessions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "child_profiles_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      credit_transactions: {
        Row: {
          amount: number;
          balance_after: number;
          book_id: string | null;
          created_at: string | null;
          description: string | null;
          id: string;
          stripe_payment_intent_id: string | null;
          stripe_session_id: string | null;
          type: string;
          user_id: string;
        };
        Insert: {
          amount: number;
          balance_after: number;
          book_id?: string | null;
          created_at?: string | null;
          description?: string | null;
          id?: string;
          stripe_payment_intent_id?: string | null;
          stripe_session_id?: string | null;
          type: string;
          user_id: string;
        };
        Update: {
          amount?: number;
          balance_after?: number;
          book_id?: string | null;
          created_at?: string | null;
          description?: string | null;
          id?: string;
          stripe_payment_intent_id?: string | null;
          stripe_session_id?: string | null;
          type?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "credit_transactions_book_id_fkey";
            columns: ["book_id"];
            isOneToOne: false;
            referencedRelation: "books";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "credit_transactions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      feedback: {
        Row: {
          book_id: string | null;
          contact_email: string | null;
          created_at: string | null;
          id: string;
          message: string | null;
          rating: number | null;
          status: string | null;
          type: string | null;
          user_id: string | null;
        };
        Insert: {
          book_id?: string | null;
          contact_email?: string | null;
          created_at?: string | null;
          id?: string;
          message?: string | null;
          rating?: number | null;
          status?: string | null;
          type?: string | null;
          user_id?: string | null;
        };
        Update: {
          book_id?: string | null;
          contact_email?: string | null;
          created_at?: string | null;
          id?: string;
          message?: string | null;
          rating?: number | null;
          status?: string | null;
          type?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "feedback_book_id_fkey";
            columns: ["book_id"];
            isOneToOne: false;
            referencedRelation: "books";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "feedback_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      generation_events: {
        Row: {
          art_style: string | null;
          book_id: string | null;
          book_spread_id: string | null;
          created_at: string | null;
          duration_ms: number | null;
          error_code: string | null;
          error_message: string | null;
          event_type: string;
          id: string;
          model_used: string | null;
          request_data: Json | null;
          response_data: Json | null;
          spread_index: number | null;
          success: boolean;
          user_id: string | null;
        };
        Insert: {
          art_style?: string | null;
          book_id?: string | null;
          book_spread_id?: string | null;
          created_at?: string | null;
          duration_ms?: number | null;
          error_code?: string | null;
          error_message?: string | null;
          event_type: string;
          id?: string;
          model_used?: string | null;
          request_data?: Json | null;
          response_data?: Json | null;
          spread_index?: number | null;
          success: boolean;
          user_id?: string | null;
        };
        Update: {
          art_style?: string | null;
          book_id?: string | null;
          book_spread_id?: string | null;
          created_at?: string | null;
          duration_ms?: number | null;
          error_code?: string | null;
          error_message?: string | null;
          event_type?: string;
          id?: string;
          model_used?: string | null;
          request_data?: Json | null;
          response_data?: Json | null;
          spread_index?: number | null;
          success?: boolean;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "generation_events_book_id_fkey";
            columns: ["book_id"];
            isOneToOne: false;
            referencedRelation: "books";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "generation_events_book_spread_id_fkey";
            columns: ["book_spread_id"];
            isOneToOne: false;
            referencedRelation: "book_spreads";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "generation_events_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      story_concepts: {
        Row: {
          book_id: string | null;
          chat_session_id: string;
          concept_index: number | null;
          cover_image_storage_path: string | null;
          cover_image_url: string | null;
          cover_prompt: string | null;
          created_at: string | null;
          id: string;
          selected: boolean | null;
          story_data: Json | null;
          synopsis: string;
          theme: string | null;
          title: string;
          user_id: string;
        };
        Insert: {
          book_id?: string | null;
          chat_session_id: string;
          concept_index?: number | null;
          cover_image_storage_path?: string | null;
          cover_image_url?: string | null;
          cover_prompt?: string | null;
          created_at?: string | null;
          id?: string;
          selected?: boolean | null;
          story_data?: Json | null;
          synopsis: string;
          theme?: string | null;
          title: string;
          user_id: string;
        };
        Update: {
          book_id?: string | null;
          chat_session_id?: string;
          concept_index?: number | null;
          cover_image_storage_path?: string | null;
          cover_image_url?: string | null;
          cover_prompt?: string | null;
          created_at?: string | null;
          id?: string;
          selected?: boolean | null;
          story_data?: Json | null;
          synopsis?: string;
          theme?: string | null;
          title?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "story_concepts_book_id_fkey";
            columns: ["book_id"];
            isOneToOne: false;
            referencedRelation: "books";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "story_concepts_chat_session_id_fkey";
            columns: ["chat_session_id"];
            isOneToOne: false;
            referencedRelation: "chat_sessions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "story_concepts_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      style_previews: {
        Row: {
          character_description: string | null;
          chat_session_id: string;
          created_at: string | null;
          id: string;
          image_storage_path: string | null;
          image_url: string;
          prompt_used: string | null;
          selected: boolean | null;
          style_id: string;
          style_name: string;
          user_id: string;
        };
        Insert: {
          character_description?: string | null;
          chat_session_id: string;
          created_at?: string | null;
          id?: string;
          image_storage_path?: string | null;
          image_url: string;
          prompt_used?: string | null;
          selected?: boolean | null;
          style_id: string;
          style_name: string;
          user_id: string;
        };
        Update: {
          character_description?: string | null;
          chat_session_id?: string;
          created_at?: string | null;
          id?: string;
          image_storage_path?: string | null;
          image_url?: string;
          prompt_used?: string | null;
          selected?: boolean | null;
          style_id?: string;
          style_name?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "style_previews_chat_session_id_fkey";
            columns: ["chat_session_id"];
            isOneToOne: false;
            referencedRelation: "chat_sessions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "style_previews_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      users: {
        Row: {
          account_status: string | null;
          created_at: string | null;
          email: string;
          first_name: string | null;
          id: string;
          is_early_launch_member: boolean | null;
          last_name: string | null;
          onboarding_completed: boolean | null;
          profile_photo_url: string | null;
          story_credits: number | null;
          stripe_customer_id: string | null;
          updated_at: string | null;
          user_type: string | null;
        };
        Insert: {
          account_status?: string | null;
          created_at?: string | null;
          email: string;
          first_name?: string | null;
          id: string;
          is_early_launch_member?: boolean | null;
          last_name?: string | null;
          onboarding_completed?: boolean | null;
          profile_photo_url?: string | null;
          story_credits?: number | null;
          stripe_customer_id?: string | null;
          updated_at?: string | null;
          user_type?: string | null;
        };
        Update: {
          account_status?: string | null;
          created_at?: string | null;
          email?: string;
          first_name?: string | null;
          id?: string;
          is_early_launch_member?: boolean | null;
          last_name?: string | null;
          onboarding_completed?: boolean | null;
          profile_photo_url?: string | null;
          story_credits?: number | null;
          stripe_customer_id?: string | null;
          updated_at?: string | null;
          user_type?: string | null;
        };
        Relationships: [];
      };
      waitlist: {
        Row: {
          converted_user_id: string | null;
          created_at: string | null;
          email: string;
          id: string;
          name: string | null;
          source: string | null;
        };
        Insert: {
          converted_user_id?: string | null;
          created_at?: string | null;
          email: string;
          id?: string;
          name?: string | null;
          source?: string | null;
        };
        Update: {
          converted_user_id?: string | null;
          created_at?: string | null;
          email?: string;
          id?: string;
          name?: string | null;
          source?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "waitlist_converted_user_id_fkey";
            columns: ["converted_user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      add_credits: {
        Args: {
          p_amount: number;
          p_description?: string;
          p_stripe_payment_intent_id?: string;
          p_type: string;
          p_user_id: string;
        };
        Returns: {
          amount: number;
          balance_after: number;
          book_id: string | null;
          created_at: string | null;
          description: string | null;
          id: string;
          stripe_payment_intent_id: string | null;
          stripe_session_id: string | null;
          type: string;
          user_id: string;
        };
        SetofOptions: {
          from: "*";
          to: "credit_transactions";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      admin_grant_credits: {
        Args: { p_amount: number; p_reason: string; p_target_user_id: string };
        Returns: {
          amount: number;
          balance_after: number;
          book_id: string | null;
          created_at: string | null;
          description: string | null;
          id: string;
          stripe_payment_intent_id: string | null;
          stripe_session_id: string | null;
          type: string;
          user_id: string;
        };
        SetofOptions: {
          from: "*";
          to: "credit_transactions";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      has_sufficient_credits: {
        Args: { p_required: number; p_user_id: string };
        Returns: boolean;
      };
      is_admin: { Args: never; Returns: boolean };
      log_generation_event: {
        Args: {
          p_art_style?: string;
          p_book_id?: string;
          p_book_spread_id?: string;
          p_duration_ms?: number;
          p_error_code?: string;
          p_error_message?: string;
          p_event_type: string;
          p_model_used?: string;
          p_request_data?: Json;
          p_response_data?: Json;
          p_spread_index?: number;
          p_success: boolean;
          p_user_id: string;
        };
        Returns: {
          art_style: string | null;
          book_id: string | null;
          book_spread_id: string | null;
          created_at: string | null;
          duration_ms: number | null;
          error_code: string | null;
          error_message: string | null;
          event_type: string;
          id: string;
          model_used: string | null;
          request_data: Json | null;
          response_data: Json | null;
          spread_index: number | null;
          success: boolean;
          user_id: string | null;
        };
        SetofOptions: {
          from: "*";
          to: "generation_events";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      select_story_concept: {
        Args: { p_concept_id: string; p_session_id: string };
        Returns: {
          book_id: string | null;
          chat_session_id: string;
          concept_index: number | null;
          cover_image_storage_path: string | null;
          cover_image_url: string | null;
          cover_prompt: string | null;
          created_at: string | null;
          id: string;
          selected: boolean | null;
          story_data: Json | null;
          synopsis: string;
          theme: string | null;
          title: string;
          user_id: string;
        };
        SetofOptions: {
          from: "*";
          to: "story_concepts";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      select_style_preview: {
        Args: { p_session_id: string; p_style_id: string };
        Returns: {
          character_description: string | null;
          chat_session_id: string;
          created_at: string | null;
          id: string;
          image_storage_path: string | null;
          image_url: string;
          prompt_used: string | null;
          selected: boolean | null;
          style_id: string;
          style_name: string;
          user_id: string;
        };
        SetofOptions: {
          from: "*";
          to: "style_previews";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      soft_delete_book: {
        Args: { p_book_id: string; p_user_id: string };
        Returns: boolean;
      };
      use_credits: {
        Args: {
          p_amount: number;
          p_book_id?: string;
          p_description?: string;
          p_user_id: string;
        };
        Returns: {
          amount: number;
          balance_after: number;
          book_id: string | null;
          created_at: string | null;
          description: string | null;
          id: string;
          stripe_payment_intent_id: string | null;
          stripe_session_id: string | null;
          type: string;
          user_id: string;
        };
        SetofOptions: {
          from: "*";
          to: "credit_transactions";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
    };
    Enums: {
      [_ in never]: never;
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
    Enums: {},
  },
} as const;
