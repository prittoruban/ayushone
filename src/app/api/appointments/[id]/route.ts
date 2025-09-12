import { NextRequest, NextResponse } from 'next/server'
import { createServerComponentClient } from '@/lib/supabase-server'

// GET /api/appointments/[id] - Get appointment details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const supabase = await createServerComponentClient()
    
    const { data, error } = await supabase
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
      .eq('id', id)
      .single()
    
    if (error) {
      console.error('Error fetching appointment:', error)
      return NextResponse.json({ error: 'Failed to fetch appointment' }, { status: 500 })
    }
    
    if (!data) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })
    }
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}