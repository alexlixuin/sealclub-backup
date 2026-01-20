import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

export async function POST(request: NextRequest) {
  try {
    const { userId, amount, transactionType, notes, adminUserId } = await request.json()

    if (!userId || !amount || !transactionType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Call the database function to update store credit balance
    const { data, error } = await supabaseAdmin.rpc('update_store_credit_balance', {
      target_user_id: userId,
      credit_amount: amount,
      transaction_type: transactionType,
      order_num: null,
      admin_id: adminUserId || null,
      transaction_notes: notes || null
    })

    if (error) {
      console.error('Error updating store credit:', error)
      return NextResponse.json({ error: 'Failed to update store credit' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
