'use server'

import { auth } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function createListingAction(data: {
  title: string
  description: string
  highlights: string[]
  property_type: string
  surface: number
  rooms: number | null
  bedrooms?: number | null
  bathrooms?: number | null
  price: number
  city: string
  postal_code: string
  ai_generated: boolean
  agency_id?: string
  status?: string
}) {
  const { userId } = await auth()
  if (!userId) throw new Error('Non authentifié')

  let agencyId = data.agency_id

  if (!agencyId) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('agency_id')
      .eq('id', userId)
      .single()
    agencyId = profile?.agency_id
  }

  const { error } = await supabase.from('listings').insert({
    title: data.title,
    description: data.description,
    highlights: data.highlights,
    property_type: data.property_type,
    surface: data.surface,
    rooms: data.rooms ?? 0,
    bedrooms: data.bedrooms ?? 0,
    price: data.price,
    city: data.city,
    postal_code: data.postal_code ?? '',
    ai_generated: data.ai_generated,
    agency_id: agencyId,
    status: data.status ?? 'draft',
  })

  if (error) throw new Error(error.message)

  revalidatePath('/listings')
  return { success: true }
}
