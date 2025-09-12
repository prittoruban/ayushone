import { NextRequest, NextResponse } from 'next/server'
import { createServerComponentClient } from '@/lib/supabase-server'

// GET /api/appointments - Get user's appointments
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const user_id = searchParams.get('user_id')
    
    if (!user_id) {
      return NextResponse.json({ error: 'Missing user_id' }, { status: 400 })
    }
    
    const supabase = await createServerComponentClient()
    
    // First get the doctor_id if the user is a doctor
    const { data: doctorData } = await supabase
      .from('doctors')
      .select('id')
      .eq('user_id', user_id)
      .single()
    
    let query = supabase
      .from('appointments')
      .select(`
        *,
        doctor:doctors (
          id,
          specialty,
          city,
          experience_years,
          languages,
          user:users!user_id (
            name,
            phone
          )
        ),
        citizen:users!citizen_id (
          name,
          phone
        )
      `)
    
    // Build the query based on user role
    if (doctorData) {
      // User is a doctor, show appointments where they are the doctor OR citizen
      query = query.or(`citizen_id.eq.${user_id},doctor_id.eq.${doctorData.id}`)
    } else {
      // User is a citizen, show only their appointments
      query = query.eq('citizen_id', user_id)
    }
    
    const { data, error } = await query.order('scheduled_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching appointments:', error)
      return NextResponse.json({ error: 'Failed to fetch appointments' }, { status: 500 })
    }
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/appointments - Book new appointment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { citizen_id, doctor_id, scheduled_at, mode, reason } = body
    
    if (!citizen_id || !doctor_id || !scheduled_at) {
      return NextResponse.json(
        { error: 'Missing required fields: citizen_id, doctor_id, scheduled_at' },
        { status: 400 }
      )
    }
    
    const supabase = await createServerComponentClient()
    
    // Generate unique Jitsi room ID
    const jitsi_room_id = `ayush-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    // Create appointment
    const { data, error } = await supabase
      .from('appointments')
      .insert({
        citizen_id,
        doctor_id,
        scheduled_at,
        mode: mode || 'online',
        reason,
        status: 'confirmed', // Auto-confirm for demo
        jitsi_room_id
      })
      .select(`
        *,
        doctor:doctors (
          id,
          specialty,
          city,
          experience_years,
          languages,
          user:users!user_id (
            name,
            phone
          )
        ),
        citizen:users!citizen_id (
          name,
          phone
        )
      `)
      .single()
    
    if (error) {
      console.error('Error creating appointment:', error)
      return NextResponse.json({ error: 'Failed to create appointment' }, { status: 500 })
    }
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}