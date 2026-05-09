// app/actions/listings.ts
// Server Actions pour la gestion des annonces

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
  rooms: number
  price: number
  city: string
  postal_code: string
  ai_generated: boolean
  agency_id: string
}) {
  const { userId } = await auth()
  if (!userId) throw new Error('Non authentifié')

  const { error } = await supabase.from('listings').insert({
    ...data,
    status: 'draft',
    bedrooms: 0,
  })

  if (error) throw new Error(error.message)

  revalidatePath('/listings')
  return { success: true }
}
