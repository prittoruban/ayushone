import { NextRequest, NextResponse } from 'next/server'
import { createServerComponentClient } from '@/lib/supabase-server'

// GET /api/appointments/[id] - Get appointment details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    
    const supabase = await createServerComponentClient()
    
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        doctor:doctors (
          id,
          specialty,
          city,
          user:users!user_id (
            name,
            email
          )
        ),
        citizen:users!citizen_id (
          name,
          email
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