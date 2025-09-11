import { NextRequest, NextResponse } from 'next/server'
import { createServerComponentClient } from '@/lib/supabase-server'

// POST /api/doctors/upload - Upload license and auto-verify
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('license') as File
    const user_id = formData.get('user_id') as string
    
    if (!file || !user_id) {
      return NextResponse.json(
        { error: 'Missing required fields: license file and user_id' },
        { status: 400 }
      )
    }
    
    const supabase = await createServerComponentClient()
    
    // Convert file to ArrayBuffer
    const fileBuffer = await file.arrayBuffer()
    const fileName = `${user_id}/${Date.now()}-${file.name}`
    
    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('licenses')
      .upload(fileName, fileBuffer, {
        contentType: file.type,
        upsert: false
      })
    
    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json({ error: 'Failed to upload license' }, { status: 500 })
    }
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('licenses')
      .getPublicUrl(fileName)
    
    // Update doctor profile with license URL and set verified_badge to true
    const { data: doctorData, error: updateError } = await supabase
      .from('doctors')
      .update({ 
        license_url: publicUrl,
        verified_badge: true // Auto-verify for hackathon demo
      })
      .eq('user_id', user_id)
      .select()
      .single()
    
    if (updateError) {
      console.error('Error updating doctor profile:', updateError)
      return NextResponse.json({ error: 'Failed to update doctor profile' }, { status: 500 })
    }
    
    return NextResponse.json({
      message: 'License uploaded and doctor verified successfully',
      doctor: doctorData,
      license_url: publicUrl
    })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}