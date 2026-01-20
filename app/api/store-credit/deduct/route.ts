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
    const { userId, amount, orderNumber } = await request.json()

    if (!userId || !amount || !orderNumber) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (amount <= 0) {
      return NextResponse.json({ error: 'Amount must be greater than 0' }, { status: 400 })
    }

    // First check if user has sufficient store credit
    const { data: userProfile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('store_credit')
      .eq('id', userId)
      .single()

    if (profileError) {
      console.error('Error fetching user profile:', profileError)
      return NextResponse.json({ error: 'Failed to fetch user profile' }, { status: 500 })
    }

    const currentBalance = userProfile?.store_credit || 0
    if (currentBalance < amount) {
      return NextResponse.json({ 
        error: 'Insufficient store credit balance',
        currentBalance,
        requestedAmount: amount
      }, { status: 400 })
    }

    // Call the database function to deduct store credit
    const { data, error } = await supabaseAdmin.rpc('update_store_credit_balance', {
      target_user_id: userId,
      credit_amount: amount, // Positive amount, function handles the subtraction
      transaction_type: 'credit_used',
      order_num: orderNumber,
      admin_id: null, // User-initiated transaction
      transaction_notes: `Store credit used for order #${orderNumber}`
    })

    if (error) {
      console.error('Error deducting store credit:', error)
      return NextResponse.json({ error: 'Failed to deduct store credit' }, { status: 500 })
    }

    // Get updated balance
    const { data: updatedProfile, error: updatedError } = await supabaseAdmin
      .from('user_profiles')
      .select('store_credit')
      .eq('id', userId)
      .single()

    if (updatedError) {
      console.error('Error fetching updated balance:', updatedError)
      return NextResponse.json({ error: 'Failed to fetch updated balance' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      deductedAmount: amount,
      previousBalance: currentBalance,
      newBalance: updatedProfile?.store_credit || 0,
      orderNumber
    })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
