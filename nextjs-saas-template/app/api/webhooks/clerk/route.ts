// app/api/webhooks/clerk/route.ts
// Synchronise les users Clerk → table profiles Supabase

import { NextRequest, NextResponse } from 'next/server'
import { Webhook } from 'svix'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET

  if (!webhookSecret) {
    return NextResponse.json({ error: 'Missing webhook secret' }, { status: 500 })
  }

  const svix_id = req.headers.get('svix-id')
  const svix_timestamp = req.headers.get('svix-timestamp')
  const svix_signature = req.headers.get('svix-signature')

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return NextResponse.json({ error: 'Missing svix headers' }, { status: 400 })
  }

  const body = await req.text()
  const wh = new Webhook(webhookSecret)

  let evt: any

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    })
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const { type, data } = evt

  if (type === 'user.created') {
    await supabase.from('profiles').upsert({
      id: data.id,
      email: data.email_addresses[0]?.email_address ?? '',
      full_name: `${data.first_name ?? ''} ${data.last_name ?? ''}`.trim(),
      avatar_url: data.image_url ?? null,
      role: 'owner',
      is_active: true,
    })
  }

  if (type === 'user.updated') {
    await supabase.from('profiles').update({
      email: data.email_addresses[0]?.email_address ?? '',
      full_name: `${data.first_name ?? ''} ${data.last_name ?? ''}`.trim(),
      avatar_url: data.image_url ?? null,
      updated_at: new Date().toISOString(),
    }).eq('id', data.id)
  }

  if (type === 'user.deleted') {
    await supabase.from('profiles').update({
      is_active: false,
    }).eq('id', data.id)
  }

  return NextResponse.json({ success: true })
}
