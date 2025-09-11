import { NextRequest, NextResponse } from 'next/server'
import { createServerComponentClient } from '@/lib/supabase-server'

// GET /api/doctors - Search doctors
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const city = searchParams.get('city')
    const specialty = searchParams.get('specialty')
    
    const supabase = await createServerComponentClient()
    
    let query = supabase
      .from('doctors')
      .select(`
        id,
        specialty,
        city,
        verified_badge,
        license_url,
        created_at,
        user:users!user_id (
          id,
          name,
          email,
          role
        )
      `)
      .eq('verified_badge', true)
    
    if (city) {
      query = query.ilike('city', `%${city}%`)
    }
    
    if (specialty) {
      query = query.ilike('specialty', `%${specialty}%`)
    }
    
    const { data, error } = await query.order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching doctors:', error)
      return NextResponse.json({ error: 'Failed to fetch doctors' }, { status: 500 })
    }
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/doctors - Create/Update doctor profile
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { specialty, city, user_id } = body
    
    if (!specialty || !city || !user_id) {
      return NextResponse.json(
        { error: 'Missing required fields: specialty, city, user_id' },
        { status: 400 }
      )
    }
    
    const supabase = await createServerComponentClient()
    
    // Check if doctor profile already exists
    const { data: existingDoctor } = await supabase
      .from('doctors')
      .select('id')
      .eq('user_id', user_id)
      .single()
    
    let result
    
    if (existingDoctor) {
      // Update existing profile
      result = await supabase
        .from('doctors')
        .update({ specialty, city })
        .eq('user_id', user_id)
        .select()
        .single()
    } else {
      // Create new profile
      result = await supabase
        .from('doctors')
        .insert({ 
          user_id, 
          specialty, 
          city, 
          verified_badge: false // Will be set to true after license upload
        })
        .select()
        .single()
    }
    
    if (result.error) {
      console.error('Error saving doctor profile:', result.error)
      return NextResponse.json({ error: 'Failed to save doctor profile' }, { status: 500 })
    }
    
    return NextResponse.json(result.data)
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}