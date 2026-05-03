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
      crm_appointments: {
        Row: {
          address: string | null
          contact_id: string
          created_at: string
          duration_minutes: number | null
          id: string
          notes: string | null
          owner_id: string
          scheduled_at: string
          service: string | null
          status: Database["public"]["Enums"]["crm_appointment_status"]
          updated_at: string
        }
        Insert: {
          address?: string | null
          contact_id: string
          created_at?: string
          duration_minutes?: number | null
          id?: string
          notes?: string | null
          owner_id: string
          scheduled_at: string
          service?: string | null
          status?: Database["public"]["Enums"]["crm_appointment_status"]
          updated_at?: string
        }
        Update: {
          address?: string | null
          contact_id?: string
          created_at?: string
          duration_minutes?: number | null
          id?: string
          notes?: string | null
          owner_id?: string
          scheduled_at?: string
          service?: string | null
          status?: Database["public"]["Enums"]["crm_appointment_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_appointments_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "crm_contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_automations: {
        Row: {
          action_type: string
          config: Json | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          last_run_at: string | null
          name: string
          owner_id: string
          trigger_type: string
          updated_at: string
        }
        Insert: {
          action_type: string
          config?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          last_run_at?: string | null
          name: string
          owner_id: string
          trigger_type: string
          updated_at?: string
        }
        Update: {
          action_type?: string
          config?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          last_run_at?: string | null
          name?: string
          owner_id?: string
          trigger_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      crm_contact_notes: {
        Row: {
          body: string
          contact_id: string
          created_at: string
          id: string
          owner_id: string
        }
        Insert: {
          body: string
          contact_id: string
          created_at?: string
          id?: string
          owner_id: string
        }
        Update: {
          body?: string
          contact_id?: string
          created_at?: string
          id?: string
          owner_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_contact_notes_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "crm_contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_contact_timeline: {
        Row: {
          contact_id: string
          created_at: string
          description: string | null
          event_type: string
          id: string
          metadata: Json | null
          owner_id: string
        }
        Insert: {
          contact_id: string
          created_at?: string
          description?: string | null
          event_type: string
          id?: string
          metadata?: Json | null
          owner_id: string
        }
        Update: {
          contact_id?: string
          created_at?: string
          description?: string | null
          event_type?: string
          id?: string
          metadata?: Json | null
          owner_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_contact_timeline_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "crm_contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_contacts: {
        Row: {
          assignee_id: string | null
          city: string | null
          company: string | null
          created_at: string
          email: string | null
          id: string
          last_contact_at: string | null
          lost_at: string | null
          lost_reason: string | null
          name: string
          neighborhood: string | null
          next_step: string | null
          next_step_at: string | null
          notes: string | null
          owner_id: string
          phone: string | null
          potential_value: number | null
          priority: Database["public"]["Enums"]["crm_priority"]
          service: string | null
          source: string | null
          stage: Database["public"]["Enums"]["crm_stage"]
          temperature: Database["public"]["Enums"]["crm_temperature"]
          updated_at: string
        }
        Insert: {
          assignee_id?: string | null
          city?: string | null
          company?: string | null
          created_at?: string
          email?: string | null
          id?: string
          last_contact_at?: string | null
          lost_at?: string | null
          lost_reason?: string | null
          name: string
          neighborhood?: string | null
          next_step?: string | null
          next_step_at?: string | null
          notes?: string | null
          owner_id: string
          phone?: string | null
          potential_value?: number | null
          priority?: Database["public"]["Enums"]["crm_priority"]
          service?: string | null
          source?: string | null
          stage?: Database["public"]["Enums"]["crm_stage"]
          temperature?: Database["public"]["Enums"]["crm_temperature"]
          updated_at?: string
        }
        Update: {
          assignee_id?: string | null
          city?: string | null
          company?: string | null
          created_at?: string
          email?: string | null
          id?: string
          last_contact_at?: string | null
          lost_at?: string | null
          lost_reason?: string | null
          name?: string
          neighborhood?: string | null
          next_step?: string | null
          next_step_at?: string | null
          notes?: string | null
          owner_id?: string
          phone?: string | null
          potential_value?: number | null
          priority?: Database["public"]["Enums"]["crm_priority"]
          service?: string | null
          source?: string | null
          stage?: Database["public"]["Enums"]["crm_stage"]
          temperature?: Database["public"]["Enums"]["crm_temperature"]
          updated_at?: string
        }
        Relationships: []
      }
      crm_followups: {
        Row: {
          completed_at: string | null
          contact_id: string
          created_at: string
          id: string
          notes: string | null
          owner_id: string
          priority: Database["public"]["Enums"]["crm_priority"]
          reason: string | null
          scheduled_at: string
          status: Database["public"]["Enums"]["crm_followup_status"]
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          contact_id: string
          created_at?: string
          id?: string
          notes?: string | null
          owner_id: string
          priority?: Database["public"]["Enums"]["crm_priority"]
          reason?: string | null
          scheduled_at: string
          status?: Database["public"]["Enums"]["crm_followup_status"]
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          contact_id?: string
          created_at?: string
          id?: string
          notes?: string | null
          owner_id?: string
          priority?: Database["public"]["Enums"]["crm_priority"]
          reason?: string | null
          scheduled_at?: string
          status?: Database["public"]["Enums"]["crm_followup_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_followups_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "crm_contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_lost_reasons: {
        Row: {
          created_at: string
          id: string
          label: string
          owner_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          label: string
          owner_id: string
        }
        Update: {
          created_at?: string
          id?: string
          label?: string
          owner_id?: string
        }
        Relationships: []
      }
      crm_quotes: {
        Row: {
          accepted_at: string | null
          amount: number
          contact_id: string
          created_at: string
          deposit: number | null
          description: string | null
          discount: number | null
          id: string
          observations: string | null
          owner_id: string
          payment_method: string | null
          rejection_reason: string | null
          sent_at: string | null
          service: string
          status: Database["public"]["Enums"]["crm_quote_status"]
          updated_at: string
          valid_until: string | null
        }
        Insert: {
          accepted_at?: string | null
          amount?: number
          contact_id: string
          created_at?: string
          deposit?: number | null
          description?: string | null
          discount?: number | null
          id?: string
          observations?: string | null
          owner_id: string
          payment_method?: string | null
          rejection_reason?: string | null
          sent_at?: string | null
          service: string
          status?: Database["public"]["Enums"]["crm_quote_status"]
          updated_at?: string
          valid_until?: string | null
        }
        Update: {
          accepted_at?: string | null
          amount?: number
          contact_id?: string
          created_at?: string
          deposit?: number | null
          description?: string | null
          discount?: number | null
          id?: string
          observations?: string | null
          owner_id?: string
          payment_method?: string | null
          rejection_reason?: string | null
          sent_at?: string | null
          service?: string
          status?: Database["public"]["Enums"]["crm_quote_status"]
          updated_at?: string
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_quotes_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "crm_contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_tasks: {
        Row: {
          contact_id: string | null
          created_at: string
          description: string | null
          due_at: string | null
          id: string
          owner_id: string
          priority: Database["public"]["Enums"]["crm_priority"]
          status: Database["public"]["Enums"]["crm_task_status"]
          title: string
          updated_at: string
        }
        Insert: {
          contact_id?: string | null
          created_at?: string
          description?: string | null
          due_at?: string | null
          id?: string
          owner_id: string
          priority?: Database["public"]["Enums"]["crm_priority"]
          status?: Database["public"]["Enums"]["crm_task_status"]
          title: string
          updated_at?: string
        }
        Update: {
          contact_id?: string | null
          created_at?: string
          description?: string | null
          due_at?: string | null
          id?: string
          owner_id?: string
          priority?: Database["public"]["Enums"]["crm_priority"]
          status?: Database["public"]["Enums"]["crm_task_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_tasks_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "crm_contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
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
      crm_appointment_status:
        | "agendado"
        | "confirmado"
        | "realizado"
        | "cancelado"
        | "reagendado"
      crm_followup_status: "pendente" | "concluido" | "reagendado" | "cancelado"
      crm_priority: "baixa" | "media" | "alta" | "urgente"
      crm_quote_status:
        | "rascunho"
        | "enviado"
        | "visualizado"
        | "aguardando"
        | "aceito"
        | "recusado"
        | "expirado"
      crm_stage:
        | "novo_lead"
        | "aguardando_info"
        | "orcamento_enviado"
        | "followup"
        | "agendado"
        | "servico_realizado"
        | "pos_venda"
        | "perdido"
      crm_task_status: "pendente" | "em_andamento" | "concluida" | "cancelada"
      crm_temperature: "frio" | "morno" | "quente"
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
      crm_appointment_status: [
        "agendado",
        "confirmado",
        "realizado",
        "cancelado",
        "reagendado",
      ],
      crm_followup_status: ["pendente", "concluido", "reagendado", "cancelado"],
      crm_priority: ["baixa", "media", "alta", "urgente"],
      crm_quote_status: [
        "rascunho",
        "enviado",
        "visualizado",
        "aguardando",
        "aceito",
        "recusado",
        "expirado",
      ],
      crm_stage: [
        "novo_lead",
        "aguardando_info",
        "orcamento_enviado",
        "followup",
        "agendado",
        "servico_realizado",
        "pos_venda",
        "perdido",
      ],
      crm_task_status: ["pendente", "em_andamento", "concluida", "cancelada"],
      crm_temperature: ["frio", "morno", "quente"],
    },
  },
} as const
