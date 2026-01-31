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
      ai_suggestions: {
        Row: {
          created_at: string
          gadget_id: string
          id: string
          response_json: Json
        }
        Insert: {
          created_at?: string
          gadget_id: string
          id?: string
          response_json: Json
        }
        Update: {
          created_at?: string
          gadget_id?: string
          id?: string
          response_json?: Json
        }
        Relationships: [
          {
            foreignKeyName: "ai_suggestions_gadget_id_fkey"
            columns: ["gadget_id"]
            isOneToOne: false
            referencedRelation: "gadgets"
            referencedColumns: ["id"]
          },
        ]
      }
      attachments: {
        Row: {
          file_name: string
          file_size: number | null
          file_url: string
          gadget_id: string
          id: string
          mime_type: string | null
          type: Database["public"]["Enums"]["attachment_type"]
          uploaded_at: string
        }
        Insert: {
          file_name: string
          file_size?: number | null
          file_url: string
          gadget_id: string
          id?: string
          mime_type?: string | null
          type?: Database["public"]["Enums"]["attachment_type"]
          uploaded_at?: string
        }
        Update: {
          file_name?: string
          file_size?: number | null
          file_url?: string
          gadget_id?: string
          id?: string
          mime_type?: string | null
          type?: Database["public"]["Enums"]["attachment_type"]
          uploaded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "attachments_gadget_id_fkey"
            columns: ["gadget_id"]
            isOneToOne: false
            referencedRelation: "gadgets"
            referencedColumns: ["id"]
          },
        ]
      }
      gadgets: {
        Row: {
          brand: string
          category: Database["public"]["Enums"]["gadget_category"]
          condition: Database["public"]["Enums"]["gadget_condition"]
          created_at: string
          id: string
          image_url: string | null
          model: string | null
          name: string
          notes: string | null
          order_id: string | null
          price_paid: number | null
          purchase_date: string
          serial_number: string | null
          updated_at: string
          user_id: string
          vendor_name: string | null
          warranty_expiry: string | null
        }
        Insert: {
          brand: string
          category?: Database["public"]["Enums"]["gadget_category"]
          condition?: Database["public"]["Enums"]["gadget_condition"]
          created_at?: string
          id?: string
          image_url?: string | null
          model?: string | null
          name: string
          notes?: string | null
          order_id?: string | null
          price_paid?: number | null
          purchase_date: string
          serial_number?: string | null
          updated_at?: string
          user_id: string
          vendor_name?: string | null
          warranty_expiry?: string | null
        }
        Update: {
          brand?: string
          category?: Database["public"]["Enums"]["gadget_category"]
          condition?: Database["public"]["Enums"]["gadget_condition"]
          created_at?: string
          id?: string
          image_url?: string | null
          model?: string | null
          name?: string
          notes?: string | null
          order_id?: string | null
          price_paid?: number | null
          purchase_date?: string
          serial_number?: string | null
          updated_at?: string
          user_id?: string
          vendor_name?: string | null
          warranty_expiry?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          age: number | null
          avatar_url: string | null
          created_at: string
          currency: string
          display_name: string | null
          full_name: string | null
          id: string
          onboarding_completed: boolean
          updated_at: string
          user_id: string
          wants_tutorial: boolean | null
        }
        Insert: {
          age?: number | null
          avatar_url?: string | null
          created_at?: string
          currency?: string
          display_name?: string | null
          full_name?: string | null
          id?: string
          onboarding_completed?: boolean
          updated_at?: string
          user_id: string
          wants_tutorial?: boolean | null
        }
        Update: {
          age?: number | null
          avatar_url?: string | null
          created_at?: string
          currency?: string
          display_name?: string | null
          full_name?: string | null
          id?: string
          onboarding_completed?: boolean
          updated_at?: string
          user_id?: string
          wants_tutorial?: boolean | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      attachment_type: "bill" | "warranty" | "photo" | "other"
      gadget_category:
        | "phone"
        | "laptop"
        | "tablet"
        | "watch"
        | "headphones"
        | "tv"
        | "gaming"
        | "camera"
        | "speaker"
        | "wearable"
        | "other"
      gadget_condition: "excellent" | "good" | "okay" | "bad"
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
      attachment_type: ["bill", "warranty", "photo", "other"],
      gadget_category: [
        "phone",
        "laptop",
        "tablet",
        "watch",
        "headphones",
        "tv",
        "gaming",
        "camera",
        "speaker",
        "wearable",
        "other",
      ],
      gadget_condition: ["excellent", "good", "okay", "bad"],
    },
  },
} as const
