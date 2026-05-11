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
      attachments: {
        Row: {
          content_type: string | null
          created_at: string
          entity_id: string
          entity_type: string
          file_name: string
          file_path: string
          file_size: number | null
          id: string
          uploaded_by: string
        }
        Insert: {
          content_type?: string | null
          created_at?: string
          entity_id: string
          entity_type: string
          file_name: string
          file_path: string
          file_size?: number | null
          id?: string
          uploaded_by: string
        }
        Update: {
          content_type?: string | null
          created_at?: string
          entity_id?: string
          entity_type?: string
          file_name?: string
          file_path?: string
          file_size?: number | null
          id?: string
          uploaded_by?: string
        }
        Relationships: []
      }
      departments: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      document_custom_fields: {
        Row: {
          created_at: string
          document_id: string
          field_name: string
          field_value: string | null
          id: string
        }
        Insert: {
          created_at?: string
          document_id: string
          field_name: string
          field_value?: string | null
          id?: string
        }
        Update: {
          created_at?: string
          document_id?: string
          field_name?: string
          field_value?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_custom_fields_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      document_types: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      documents: {
        Row: {
          created_at: string
          created_by: string
          department_id: string | null
          description: string | null
          document_number: number
          id: string
          knowledge_area_id: string | null
          status: string
          tags: string[] | null
          technician_id: string | null
          title: string
          type: string
          updated_at: string
          version: string | null
        }
        Insert: {
          created_at?: string
          created_by: string
          department_id?: string | null
          description?: string | null
          document_number?: number
          id?: string
          knowledge_area_id?: string | null
          status?: string
          tags?: string[] | null
          technician_id?: string | null
          title: string
          type?: string
          updated_at?: string
          version?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string
          department_id?: string | null
          description?: string | null
          document_number?: number
          id?: string
          knowledge_area_id?: string | null
          status?: string
          tags?: string[] | null
          technician_id?: string | null
          title?: string
          type?: string
          updated_at?: string
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_knowledge_area_id_fkey"
            columns: ["knowledge_area_id"]
            isOneToOne: false
            referencedRelation: "knowledge_areas"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      inventory_items: {
        Row: {
          brand: string | null
          category: string
          code: string
          created_at: string
          created_by: string
          department_id: string | null
          id: string
          invoice_id: string | null
          location: string | null
          location_id: string | null
          model: string | null
          name: string
          purchase_date: string | null
          serial_number: string | null
          sku: string | null
          status: string
          supplier_id: string | null
          unit_price: number | null
          updated_at: string
          user_name: string | null
          warehouse_id: string | null
        }
        Insert: {
          brand?: string | null
          category?: string
          code: string
          created_at?: string
          created_by: string
          department_id?: string | null
          id?: string
          invoice_id?: string | null
          location?: string | null
          location_id?: string | null
          model?: string | null
          name: string
          purchase_date?: string | null
          serial_number?: string | null
          sku?: string | null
          status?: string
          supplier_id?: string | null
          unit_price?: number | null
          updated_at?: string
          user_name?: string | null
          warehouse_id?: string | null
        }
        Update: {
          brand?: string | null
          category?: string
          code?: string
          created_at?: string
          created_by?: string
          department_id?: string | null
          id?: string
          invoice_id?: string | null
          location?: string | null
          location_id?: string | null
          model?: string | null
          name?: string
          purchase_date?: string | null
          serial_number?: string | null
          sku?: string | null
          status?: string
          supplier_id?: string | null
          unit_price?: number | null
          updated_at?: string
          user_name?: string | null
          warehouse_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_items_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_locations: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      knowledge_areas: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          department_id: string | null
          email: string | null
          full_name: string | null
          id: string
          is_active: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          department_id?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          is_active?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          department_id?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          is_active?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      project_tasks: {
        Row: {
          assignee_id: string | null
          created_at: string
          created_by: string
          delay_days: number | null
          description: string | null
          end_date: string | null
          hours_estimated: number
          hours_logged: number
          id: string
          is_milestone: boolean
          milestone_label: string | null
          parent_task_id: string | null
          priority: string
          project_id: string
          risk_level: string | null
          start_date: string | null
          status: string
          team_ids: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          assignee_id?: string | null
          created_at?: string
          created_by: string
          delay_days?: number | null
          description?: string | null
          end_date?: string | null
          hours_estimated?: number
          hours_logged?: number
          id?: string
          is_milestone?: boolean
          milestone_label?: string | null
          parent_task_id?: string | null
          priority?: string
          project_id: string
          risk_level?: string | null
          start_date?: string | null
          status?: string
          team_ids?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          assignee_id?: string | null
          created_at?: string
          created_by?: string
          delay_days?: number | null
          description?: string | null
          end_date?: string | null
          hours_estimated?: number
          hours_logged?: number
          id?: string
          is_milestone?: boolean
          milestone_label?: string | null
          parent_task_id?: string | null
          priority?: string
          project_id?: string
          risk_level?: string | null
          start_date?: string | null
          status?: string
          team_ids?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_tasks_parent_task_id_fkey"
            columns: ["parent_task_id"]
            isOneToOne: false
            referencedRelation: "project_tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          end_date: string | null
          id: string
          priority: string
          responsible_id: string | null
          start_date: string | null
          status: string
          technician_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          end_date?: string | null
          id?: string
          priority?: string
          responsible_id?: string | null
          start_date?: string | null
          status?: string
          technician_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          end_date?: string | null
          id?: string
          priority?: string
          responsible_id?: string | null
          start_date?: string | null
          status?: string
          technician_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      resources: {
        Row: {
          created_at: string
          created_by: string
          current_allocation: number
          department_id: string | null
          email: string
          id: string
          name: string
          role: string
          skills: string[] | null
          status: string
          updated_at: string
          weekly_capacity: number
        }
        Insert: {
          created_at?: string
          created_by: string
          current_allocation?: number
          department_id?: string | null
          email: string
          id?: string
          name: string
          role?: string
          skills?: string[] | null
          status?: string
          updated_at?: string
          weekly_capacity?: number
        }
        Update: {
          created_at?: string
          created_by?: string
          current_allocation?: number
          department_id?: string | null
          email?: string
          id?: string
          name?: string
          role?: string
          skills?: string[] | null
          status?: string
          updated_at?: string
          weekly_capacity?: number
        }
        Relationships: [
          {
            foreignKeyName: "resources_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          end_date: string | null
          id: string
          priority: string
          responsible_id: string | null
          start_date: string | null
          status: string
          technician_id: string | null
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          end_date?: string | null
          id?: string
          priority?: string
          responsible_id?: string | null
          start_date?: string | null
          status?: string
          technician_id?: string | null
          title: string
          type?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          end_date?: string | null
          id?: string
          priority?: string
          responsible_id?: string | null
          start_date?: string | null
          status?: string
          technician_id?: string | null
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      supplier_invoice_items: {
        Row: {
          brand: string | null
          created_at: string
          created_by: string
          id: string
          inventory_item_id: string | null
          invoice_id: string
          model: string | null
          name: string
          notes: string | null
          quantity: number
          serial_number: string | null
          sku: string | null
          unit_price: number | null
          updated_at: string
          vat_rate: number | null
          warranty_end: string | null
          warranty_start: string | null
          warranty_years: number | null
        }
        Insert: {
          brand?: string | null
          created_at?: string
          created_by: string
          id?: string
          inventory_item_id?: string | null
          invoice_id: string
          model?: string | null
          name: string
          notes?: string | null
          quantity?: number
          serial_number?: string | null
          sku?: string | null
          unit_price?: number | null
          updated_at?: string
          vat_rate?: number | null
          warranty_end?: string | null
          warranty_start?: string | null
          warranty_years?: number | null
        }
        Update: {
          brand?: string | null
          created_at?: string
          created_by?: string
          id?: string
          inventory_item_id?: string | null
          invoice_id?: string
          model?: string | null
          name?: string
          notes?: string | null
          quantity?: number
          serial_number?: string | null
          sku?: string | null
          unit_price?: number | null
          updated_at?: string
          vat_rate?: number | null
          warranty_end?: string | null
          warranty_start?: string | null
          warranty_years?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "supplier_invoice_items_inventory_item_id_fkey"
            columns: ["inventory_item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "supplier_invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      supplier_invoices: {
        Row: {
          atcud: string | null
          client_name: string | null
          client_nif: string | null
          created_at: string
          created_by: string
          currency: string | null
          description: string | null
          due_date: string | null
          file_path: string | null
          id: string
          invoice_number: string
          issue_date: string | null
          net_total: number | null
          notes: string | null
          payment_method: string | null
          payment_terms: string | null
          supplier_address: string | null
          supplier_email: string | null
          supplier_id: string
          supplier_phone: string | null
          total_amount: number | null
          updated_at: string
          vat_total: number | null
        }
        Insert: {
          atcud?: string | null
          client_name?: string | null
          client_nif?: string | null
          created_at?: string
          created_by: string
          currency?: string | null
          description?: string | null
          due_date?: string | null
          file_path?: string | null
          id?: string
          invoice_number: string
          issue_date?: string | null
          net_total?: number | null
          notes?: string | null
          payment_method?: string | null
          payment_terms?: string | null
          supplier_address?: string | null
          supplier_email?: string | null
          supplier_id: string
          supplier_phone?: string | null
          total_amount?: number | null
          updated_at?: string
          vat_total?: number | null
        }
        Update: {
          atcud?: string | null
          client_name?: string | null
          client_nif?: string | null
          created_at?: string
          created_by?: string
          currency?: string | null
          description?: string | null
          due_date?: string | null
          file_path?: string | null
          id?: string
          invoice_number?: string
          issue_date?: string | null
          net_total?: number | null
          notes?: string | null
          payment_method?: string | null
          payment_terms?: string | null
          supplier_address?: string | null
          supplier_email?: string | null
          supplier_id?: string
          supplier_phone?: string | null
          total_amount?: number | null
          updated_at?: string
          vat_total?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "supplier_invoices_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          address: string | null
          category: string
          contact_person: string | null
          created_at: string
          created_by: string
          email: string | null
          id: string
          name: string
          nif: string | null
          notes: string | null
          phone: string | null
          status: string
          updated_at: string
          website: string | null
        }
        Insert: {
          address?: string | null
          category?: string
          contact_person?: string | null
          created_at?: string
          created_by: string
          email?: string | null
          id?: string
          name: string
          nif?: string | null
          notes?: string | null
          phone?: string | null
          status?: string
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: string | null
          category?: string
          contact_person?: string | null
          created_at?: string
          created_by?: string
          email?: string | null
          id?: string
          name?: string
          nif?: string | null
          notes?: string | null
          phone?: string | null
          status?: string
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      task_dependencies: {
        Row: {
          created_at: string
          dependency_type: string
          id: string
          predecessor_id: string
          successor_id: string
        }
        Insert: {
          created_at?: string
          dependency_type?: string
          id?: string
          predecessor_id: string
          successor_id: string
        }
        Update: {
          created_at?: string
          dependency_type?: string
          id?: string
          predecessor_id?: string
          successor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_dependencies_predecessor_id_fkey"
            columns: ["predecessor_id"]
            isOneToOne: false
            referencedRelation: "project_tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_dependencies_successor_id_fkey"
            columns: ["successor_id"]
            isOneToOne: false
            referencedRelation: "project_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_categories: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      ticket_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          ticket_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          ticket_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          ticket_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_comments_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_equipment_types: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      tickets: {
        Row: {
          assigned_to: string | null
          category: string | null
          created_at: string
          created_by: string
          department_id: string | null
          description: string | null
          due_date: string | null
          equipment_type: string | null
          id: string
          operating_system: string | null
          priority: string
          related_ticket_id: string | null
          sla_hours: number | null
          status: string
          tags: string[] | null
          ticket_number: number
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          category?: string | null
          created_at?: string
          created_by: string
          department_id?: string | null
          description?: string | null
          due_date?: string | null
          equipment_type?: string | null
          id?: string
          operating_system?: string | null
          priority?: string
          related_ticket_id?: string | null
          sla_hours?: number | null
          status?: string
          tags?: string[] | null
          ticket_number?: number
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          category?: string | null
          created_at?: string
          created_by?: string
          department_id?: string | null
          description?: string | null
          due_date?: string | null
          equipment_type?: string | null
          id?: string
          operating_system?: string | null
          priority?: string
          related_ticket_id?: string | null
          sla_hours?: number | null
          status?: string
          tags?: string[] | null
          ticket_number?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tickets_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_related_ticket_id_fkey"
            columns: ["related_ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      user_permissions: {
        Row: {
          can_create: boolean
          can_delete: boolean
          can_edit: boolean
          can_view: boolean
          created_at: string
          id: string
          module: string
          updated_at: string
          user_id: string
        }
        Insert: {
          can_create?: boolean
          can_delete?: boolean
          can_edit?: boolean
          can_view?: boolean
          created_at?: string
          id?: string
          module: string
          updated_at?: string
          user_id: string
        }
        Update: {
          can_create?: boolean
          can_delete?: boolean
          can_edit?: boolean
          can_view?: boolean
          created_at?: string
          id?: string
          module?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vehicles: {
        Row: {
          brand: string
          created_at: string
          created_by: string
          department_id: string | null
          id: string
          insurance_expiry: string | null
          location: string | null
          mileage: number
          model: string
          next_maintenance: string | null
          plate: string
          status: string
          type: string
          updated_at: string
          year: number
        }
        Insert: {
          brand: string
          created_at?: string
          created_by: string
          department_id?: string | null
          id?: string
          insurance_expiry?: string | null
          location?: string | null
          mileage?: number
          model: string
          next_maintenance?: string | null
          plate: string
          status?: string
          type?: string
          updated_at?: string
          year?: number
        }
        Update: {
          brand?: string
          created_at?: string
          created_by?: string
          department_id?: string | null
          id?: string
          insurance_expiry?: string | null
          location?: string | null
          mileage?: number
          model?: string
          next_maintenance?: string | null
          plate?: string
          status?: string
          type?: string
          updated_at?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "vehicles_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      warehouses: {
        Row: {
          address: string | null
          code: string
          created_at: string
          id: string
          name: string
        }
        Insert: {
          address?: string | null
          code: string
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          address?: string | null
          code?: string
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      warranties: {
        Row: {
          created_at: string
          created_by: string
          end_date: string | null
          id: string
          inventory_item_id: string | null
          invoice_id: string | null
          invoice_item_id: string | null
          notes: string | null
          serial_number: string | null
          start_date: string | null
          supplier_id: string | null
          updated_at: string
          years: number | null
        }
        Insert: {
          created_at?: string
          created_by: string
          end_date?: string | null
          id?: string
          inventory_item_id?: string | null
          invoice_id?: string | null
          invoice_item_id?: string | null
          notes?: string | null
          serial_number?: string | null
          start_date?: string | null
          supplier_id?: string | null
          updated_at?: string
          years?: number | null
        }
        Update: {
          created_at?: string
          created_by?: string
          end_date?: string | null
          id?: string
          inventory_item_id?: string | null
          invoice_id?: string | null
          invoice_item_id?: string | null
          notes?: string | null
          serial_number?: string | null
          start_date?: string | null
          supplier_id?: string | null
          updated_at?: string
          years?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "warranties_inventory_item_id_fkey"
            columns: ["inventory_item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "warranties_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "supplier_invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "warranties_invoice_item_id_fkey"
            columns: ["invoice_item_id"]
            isOneToOne: false
            referencedRelation: "supplier_invoice_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "warranties_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_access_attachment: { Args: { file_path: string }; Returns: boolean }
      get_my_department_id: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
      is_collaborator: { Args: never; Returns: boolean }
      is_manager: { Args: never; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "manager" | "collaborator"
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
      app_role: ["admin", "manager", "collaborator"],
    },
  },
} as const
