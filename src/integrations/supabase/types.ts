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
      about_advantages: {
        Row: {
          created_at: string
          description: string
          icon: string
          id: string
          sort_order: number
          title: string
        }
        Insert: {
          created_at?: string
          description?: string
          icon?: string
          id?: string
          sort_order?: number
          title: string
        }
        Update: {
          created_at?: string
          description?: string
          icon?: string
          id?: string
          sort_order?: number
          title?: string
        }
        Relationships: []
      }
      about_content: {
        Row: {
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          value?: Json
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      about_stats: {
        Row: {
          created_at: string
          id: string
          label: string
          sort_order: number
          value: string
        }
        Insert: {
          created_at?: string
          id?: string
          label: string
          sort_order?: number
          value: string
        }
        Update: {
          created_at?: string
          id?: string
          label?: string
          sort_order?: number
          value?: string
        }
        Relationships: []
      }
      about_steps: {
        Row: {
          created_at: string
          description: string
          id: string
          sort_order: number
          title: string
        }
        Insert: {
          created_at?: string
          description?: string
          id?: string
          sort_order?: number
          title: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          sort_order?: number
          title?: string
        }
        Relationships: []
      }
      apartment_categories: {
        Row: {
          created_at: string
          id: string
          product_category_slugs: Json
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_category_slugs?: Json
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          product_category_slugs?: Json
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      apartment_content: {
        Row: {
          key: string
          updated_at: string
          value: string
        }
        Insert: {
          key: string
          updated_at?: string
          value?: string
        }
        Update: {
          key?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      apartment_discounts: {
        Row: {
          created_at: string
          description: string
          id: string
          min_amount: number
          min_items: number
          percent: number
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string
          id?: string
          min_amount?: number
          min_items?: number
          percent?: number
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          min_amount?: number
          min_items?: number
          percent?: number
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      apartment_events: {
        Row: {
          created_at: string
          data: Json
          event_type: string
          id: string
        }
        Insert: {
          created_at?: string
          data?: Json
          event_type: string
          id?: string
        }
        Update: {
          created_at?: string
          data?: Json
          event_type?: string
          id?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          id: string
          image_url: string | null
          slug: string
          sort_order: number
          title: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url?: string | null
          slug: string
          sort_order?: number
          title: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string | null
          slug?: string
          sort_order?: number
          title?: string
        }
        Relationships: []
      }
      customer_photos: {
        Row: {
          city: string
          comment: string
          created_at: string
          id: string
          model: string
          photo: string
          sort_order: number
        }
        Insert: {
          city?: string
          comment?: string
          created_at?: string
          id?: string
          model?: string
          photo: string
          sort_order?: number
        }
        Update: {
          city?: string
          comment?: string
          created_at?: string
          id?: string
          model?: string
          photo?: string
          sort_order?: number
        }
        Relationships: []
      }
      fabric_categories: {
        Row: {
          created_at: string
          id: string
          slug: string
          sort_order: number
          title: string
        }
        Insert: {
          created_at?: string
          id?: string
          slug: string
          sort_order?: number
          title: string
        }
        Update: {
          created_at?: string
          id?: string
          slug?: string
          sort_order?: number
          title?: string
        }
        Relationships: []
      }
      fabric_characteristics: {
        Row: {
          created_at: string
          id: string
          label: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          label: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          label?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      fabric_colors: {
        Row: {
          code: string
          created_at: string
          fabric_id: string
          id: string
          name: string
          photo: string | null
          sort_order: number
          updated_at: string
        }
        Insert: {
          code?: string
          created_at?: string
          fabric_id: string
          id?: string
          name?: string
          photo?: string | null
          sort_order?: number
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          fabric_id?: string
          id?: string
          name?: string
          photo?: string | null
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fabric_colors_fabric_id_fkey"
            columns: ["fabric_id"]
            isOneToOne: false
            referencedRelation: "fabrics"
            referencedColumns: ["id"]
          },
        ]
      }
      fabrics: {
        Row: {
          category_slug: string
          characteristics: Json
          code: string
          created_at: string
          description: string
          furniture_photos: Json
          id: string
          recommendations: string
          sample_photo: string | null
          sort_order: number
          surcharge: number
          title: string
          updated_at: string
        }
        Insert: {
          category_slug: string
          characteristics?: Json
          code?: string
          created_at?: string
          description?: string
          furniture_photos?: Json
          id?: string
          recommendations?: string
          sample_photo?: string | null
          sort_order?: number
          surcharge?: number
          title: string
          updated_at?: string
        }
        Update: {
          category_slug?: string
          characteristics?: Json
          code?: string
          created_at?: string
          description?: string
          furniture_photos?: Json
          id?: string
          recommendations?: string
          sample_photo?: string | null
          sort_order?: number
          surcharge?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      faqs: {
        Row: {
          answer: string
          created_at: string
          id: string
          question: string
          sort_order: number
        }
        Insert: {
          answer?: string
          created_at?: string
          id?: string
          question: string
          sort_order?: number
        }
        Update: {
          answer?: string
          created_at?: string
          id?: string
          question?: string
          sort_order?: number
        }
        Relationships: []
      }
      form_configs: {
        Row: {
          button_text: string
          description: string
          fields: Json
          key: string
          success_text: string
          title: string
          updated_at: string
        }
        Insert: {
          button_text?: string
          description?: string
          fields?: Json
          key: string
          success_text?: string
          title?: string
          updated_at?: string
        }
        Update: {
          button_text?: string
          description?: string
          fields?: Json
          key?: string
          success_text?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      gallery_items: {
        Row: {
          caption: string
          category: string
          created_at: string
          id: string
          photo: string
          sort_order: number
        }
        Insert: {
          caption?: string
          category?: string
          created_at?: string
          id?: string
          photo: string
          sort_order?: number
        }
        Update: {
          caption?: string
          category?: string
          created_at?: string
          id?: string
          photo?: string
          sort_order?: number
        }
        Relationships: []
      }
      home_blocks: {
        Row: {
          enabled: boolean
          key: string
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          enabled?: boolean
          key: string
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          enabled?: boolean
          key?: string
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      home_slides: {
        Row: {
          bg_color: string | null
          button_link: string | null
          button_text: string | null
          created_at: string
          id: string
          image_url: string | null
          is_visible: boolean
          sort_order: number
          subtitle: string | null
          text_align: string | null
          title: string
          updated_at: string
        }
        Insert: {
          bg_color?: string | null
          button_link?: string | null
          button_text?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          is_visible?: boolean
          sort_order?: number
          subtitle?: string | null
          text_align?: string | null
          title?: string
          updated_at?: string
        }
        Update: {
          bg_color?: string | null
          button_link?: string | null
          button_text?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          is_visible?: boolean
          sort_order?: number
          subtitle?: string | null
          text_align?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      integrations: {
        Row: {
          apps_script_url: string
          enabled: boolean
          id: number
          last_test_at: string | null
          last_test_message: string
          last_test_status: string
          sheets_url: string
          updated_at: string
          webhook_url: string
        }
        Insert: {
          apps_script_url?: string
          enabled?: boolean
          id?: number
          last_test_at?: string | null
          last_test_message?: string
          last_test_status?: string
          sheets_url?: string
          updated_at?: string
          webhook_url?: string
        }
        Update: {
          apps_script_url?: string
          enabled?: boolean
          id?: number
          last_test_at?: string | null
          last_test_message?: string
          last_test_status?: string
          sheets_url?: string
          updated_at?: string
          webhook_url?: string
        }
        Relationships: []
      }
      nav_items: {
        Row: {
          created_at: string
          href: string
          id: string
          is_visible: boolean
          label: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          href: string
          id?: string
          is_visible?: boolean
          label: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          href?: string
          id?: string
          is_visible?: boolean
          label?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      page_blocks: {
        Row: {
          body: string | null
          button_link: string | null
          button_text: string | null
          created_at: string
          gallery: Json
          id: string
          image_url: string | null
          is_visible: boolean
          kind: string
          page_key: string
          settings: Json
          sort_order: number
          subtitle: string | null
          system_ref: string | null
          title: string | null
          updated_at: string
        }
        Insert: {
          body?: string | null
          button_link?: string | null
          button_text?: string | null
          created_at?: string
          gallery?: Json
          id?: string
          image_url?: string | null
          is_visible?: boolean
          kind?: string
          page_key: string
          settings?: Json
          sort_order?: number
          subtitle?: string | null
          system_ref?: string | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          body?: string | null
          button_link?: string | null
          button_text?: string | null
          created_at?: string
          gallery?: Json
          id?: string
          image_url?: string | null
          is_visible?: boolean
          kind?: string
          page_key?: string
          settings?: Json
          sort_order?: number
          subtitle?: string | null
          system_ref?: string | null
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      partner_applications: {
        Row: {
          category_slug: string
          comment: string
          company: string
          created_at: string
          email: string
          id: string
          name: string
          phone: string
          status: string
          updated_at: string
          website: string
        }
        Insert: {
          category_slug?: string
          comment?: string
          company?: string
          created_at?: string
          email?: string
          id?: string
          name: string
          phone?: string
          status?: string
          updated_at?: string
          website?: string
        }
        Update: {
          category_slug?: string
          comment?: string
          company?: string
          created_at?: string
          email?: string
          id?: string
          name?: string
          phone?: string
          status?: string
          updated_at?: string
          website?: string
        }
        Relationships: []
      }
      partner_categories: {
        Row: {
          created_at: string
          id: string
          slug: string
          sort_order: number
          title: string
        }
        Insert: {
          created_at?: string
          id?: string
          slug: string
          sort_order?: number
          title: string
        }
        Update: {
          created_at?: string
          id?: string
          slug?: string
          sort_order?: number
          title?: string
        }
        Relationships: []
      }
      partners: {
        Row: {
          advantages: Json
          category_slug: string
          created_at: string
          description: string
          email: string
          gallery: Json
          id: string
          is_active: boolean
          logo: string | null
          main_photo: string | null
          phone: string
          recommended_for: Json
          socials: Json
          sort_order: number
          title: string
          updated_at: string
          website: string
        }
        Insert: {
          advantages?: Json
          category_slug: string
          created_at?: string
          description?: string
          email?: string
          gallery?: Json
          id?: string
          is_active?: boolean
          logo?: string | null
          main_photo?: string | null
          phone?: string
          recommended_for?: Json
          socials?: Json
          sort_order?: number
          title: string
          updated_at?: string
          website?: string
        }
        Update: {
          advantages?: Json
          category_slug?: string
          created_at?: string
          description?: string
          email?: string
          gallery?: Json
          id?: string
          is_active?: boolean
          logo?: string | null
          main_photo?: string | null
          phone?: string
          recommended_for?: Json
          socials?: Json
          sort_order?: number
          title?: string
          updated_at?: string
          website?: string
        }
        Relationships: []
      }
      partners_content: {
        Row: {
          key: string
          updated_at: string
          value: string
        }
        Insert: {
          key: string
          updated_at?: string
          value?: string
        }
        Update: {
          key?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      product_fabrics: {
        Row: {
          created_at: string
          fabric_id: string
          product_id: string
        }
        Insert: {
          created_at?: string
          fabric_id: string
          product_id: string
        }
        Update: {
          created_at?: string
          fabric_id?: string
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_fabrics_fabric_id_fkey"
            columns: ["fabric_id"]
            isOneToOne: false
            referencedRelation: "fabrics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_fabrics_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_stats: {
        Row: {
          cart_adds: number
          likes: number
          product_id: string
          updated_at: string
          views: number
        }
        Insert: {
          cart_adds?: number
          likes?: number
          product_id: string
          updated_at?: string
          views?: number
        }
        Update: {
          cart_adds?: number
          likes?: number
          product_id?: string
          updated_at?: string
          views?: number
        }
        Relationships: [
          {
            foreignKeyName: "product_stats_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: true
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          availability: string | null
          category_slug: string
          created_at: string
          custom_size_enabled: boolean
          description: string
          filling: string | null
          filling_id: string | null
          has_box: boolean | null
          id: string
          is_bestseller: boolean
          mechanism: string | null
          mechanism_id: string | null
          photo1: string | null
          photo2: string | null
          photo3: string | null
          photo4: string | null
          photo5: string | null
          photo6: string | null
          price: number
          price_from: boolean
          production_time: string | null
          sale_enabled: boolean
          sale_label: string | null
          sale_new_price: number | null
          sale_old_price: number | null
          sale_text: string | null
          sizes: Json
          sleeping_place: string | null
          sofa_type: string | null
          sort_order: number
          specs: Json
          title: string
          updated_at: string
        }
        Insert: {
          availability?: string | null
          category_slug: string
          created_at?: string
          custom_size_enabled?: boolean
          description?: string
          filling?: string | null
          filling_id?: string | null
          has_box?: boolean | null
          id?: string
          is_bestseller?: boolean
          mechanism?: string | null
          mechanism_id?: string | null
          photo1?: string | null
          photo2?: string | null
          photo3?: string | null
          photo4?: string | null
          photo5?: string | null
          photo6?: string | null
          price?: number
          price_from?: boolean
          production_time?: string | null
          sale_enabled?: boolean
          sale_label?: string | null
          sale_new_price?: number | null
          sale_old_price?: number | null
          sale_text?: string | null
          sizes?: Json
          sleeping_place?: string | null
          sofa_type?: string | null
          sort_order?: number
          specs?: Json
          title: string
          updated_at?: string
        }
        Update: {
          availability?: string | null
          category_slug?: string
          created_at?: string
          custom_size_enabled?: boolean
          description?: string
          filling?: string | null
          filling_id?: string | null
          has_box?: boolean | null
          id?: string
          is_bestseller?: boolean
          mechanism?: string | null
          mechanism_id?: string | null
          photo1?: string | null
          photo2?: string | null
          photo3?: string | null
          photo4?: string | null
          photo5?: string | null
          photo6?: string | null
          price?: number
          price_from?: boolean
          production_time?: string | null
          sale_enabled?: boolean
          sale_label?: string | null
          sale_new_price?: number | null
          sale_old_price?: number | null
          sale_text?: string | null
          sizes?: Json
          sleeping_place?: string | null
          sofa_type?: string | null
          sort_order?: number
          specs?: Json
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_slug_fkey"
            columns: ["category_slug"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["slug"]
          },
          {
            foreignKeyName: "products_filling_id_fkey"
            columns: ["filling_id"]
            isOneToOne: false
            referencedRelation: "spec_fillings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_mechanism_id_fkey"
            columns: ["mechanism_id"]
            isOneToOne: false
            referencedRelation: "spec_mechanisms"
            referencedColumns: ["id"]
          },
        ]
      }
      requests: {
        Row: {
          created_at: string
          data: Json
          id: string
          source: string
          status: string
          title: string
        }
        Insert: {
          created_at?: string
          data?: Json
          id?: string
          source?: string
          status?: string
          title?: string
        }
        Update: {
          created_at?: string
          data?: Json
          id?: string
          source?: string
          status?: string
          title?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          created_at: string
          id: string
          name: string
          rating: number
          sort_order: number
          source: string
          text: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          rating?: number
          sort_order?: number
          source?: string
          text: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          rating?: number
          sort_order?: number
          source?: string
          text?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          value?: Json
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      spec_fillings: {
        Row: {
          created_at: string
          description: string
          id: string
          name: string
          photo: string | null
          recommendations: string
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string
          id?: string
          name: string
          photo?: string | null
          recommendations?: string
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          name?: string
          photo?: string | null
          recommendations?: string
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      spec_mechanisms: {
        Row: {
          created_at: string
          description: string
          id: string
          name: string
          photo: string | null
          recommendations: string
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string
          id?: string
          name: string
          photo?: string | null
          recommendations?: string
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          name?: string
          photo?: string | null
          recommendations?: string
          slug?: string
          sort_order?: number
          updated_at?: string
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
          role: Database["public"]["Enums"]["app_role"]
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
    }
    Views: {
      all_applications: {
        Row: {
          created_at: string | null
          data: Json | null
          email: string | null
          form_key: string | null
          id: string | null
          name: string | null
          origin: string | null
          phone: string | null
          status: string | null
          title: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_product_stat: {
        Args: { p_delta?: number; p_field: string; p_id: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin"
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
      app_role: ["admin"],
    },
  },
} as const
