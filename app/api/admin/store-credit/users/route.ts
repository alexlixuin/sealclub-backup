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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const filter = searchParams.get('filter') || 'all'
    const search = searchParams.get('search') || ''

    // Get user profiles with store credit data
    let query = supabaseAdmin
      .from('user_profiles')
      .select(`
        id,
        full_name,
        phone,
        store_credit,
        created_at,
        updated_at
      `)

    // Apply filters
    if (filter === 'with_credit') {
      query = query.gt('store_credit', 0)
    } else if (filter === 'with_transactions') {
      // Get users who have transactions
      const { data: usersWithTransactions } = await supabaseAdmin
        .from('store_credit_transactions')
        .select('user_id')
        .not('user_id', 'is', null)

      const userIds = [...new Set(usersWithTransactions?.map(t => t.user_id) || [])]
      if (userIds.length > 0) {
        query = query.in('id', userIds)
      } else {
        // No users with transactions
        return NextResponse.json({ users: [] })
      }
    }

    // Apply search filter
    if (search) {
      query = query.or(`full_name.ilike.%${search}%,id.ilike.%${search}%`)
    }

    query = query.order('created_at', { ascending: false }).limit(100)

    const { data: profiles, error: profilesError } = await query

    if (profilesError) {
      console.error('Error loading profiles:', profilesError)
      return NextResponse.json({ error: 'Failed to load profiles' }, { status: 500 })
    }

    // Get auth users for email addresses
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.listUsers()
    
    if (authError) {
      console.error('Error loading auth users:', authError)
      return NextResponse.json({ error: 'Failed to load auth users' }, { status: 500 })
    }

    // Create email lookup map
    const emailMap = new Map()
    authData.users.forEach(user => {
      emailMap.set(user.id, user.email)
    })

    // Combine profile and auth data
    const users = profiles?.map(profile => ({
      ...profile,
      email: emailMap.get(profile.id) || 'No email'
    })) || []

    return NextResponse.json({ users })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
