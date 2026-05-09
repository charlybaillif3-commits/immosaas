export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          role: string
          agency_id: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
      }
      agencies: {
        Row: {
          id: string
          name: string
          slug: string
          logo_url: string | null
          plan: string
          owner_id: string
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['agencies']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['agencies']['Insert']>
      }
      listings: {
        Row: {
          id: string
          agency_id: string
          title: string
          description: string | null
          highlights: string[]
          property_type: string
          surface: number
          rooms: number | null
          bedrooms: number | null
          price: number
          price_per_sqm: number | null
          city: string
          postal_code: string
          status: string
          ai_generated: boolean
          views_count: number
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['listings']['Row'], 'id' | 'price_per_sqm' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['listings']['Insert']>
      }
      subscriptions: {
        Row: {
          id: string
          agency_id: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          plan: string
          status: string
          current_period_end: string | null
          cancel_at_period_end: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['subscriptions']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['subscriptions']['Insert']>
      }
      ai_usage: {
        Row: {
          id: string
          agency_id: string
          user_id: string
          action_type: string
          tokens_used: number
          model: string | null
          metadata: Record<string, unknown>
          created_at: string
        }
        Insert: {
          agency_id: string
          user_id: string
          action_type: string
          tokens_used?: number
          model?: string | null
          metadata?: Record<string, unknown>
        }
        Update: Partial<{
          agency_id: string
          user_id: string
          action_type: string
          tokens_used: number
          model: string | null
          metadata: Record<string, unknown>
        }>
      }
      market_analyses: {
        Row: {
          id: string
          agency_id: string
          city: string
          postal_code: string
          property_type: string
          avg_price_sqm: number | null
          trend: string | null
          trend_percent: number | null
          narrative: string | null
          recommendations: string[]
          data: Record<string, unknown>
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['market_analyses']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['market_analyses']['Insert']>
      }
    }
  }
}
