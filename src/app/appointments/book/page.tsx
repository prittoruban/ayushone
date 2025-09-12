'use client'

import { useState, useEffect, Suspense } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter, useSearchParams } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { Calendar, Clock, User, Award } from 'lucide-react'

interface Doctor {
  id: string
  specialty: string
  city: string
  experience_years: number
  languages: string[]
  user?: {
    name: string
    phone: string
  } | null
}

function BookAppointmentContent() {
  const [doctor, setDoctor] = useState<Doctor | null>(null)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [mode, setMode] = useState<'online' | 'offline'>('online')
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  
  const { user, userProfile } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const doctorId = searchParams.get('doctor_id')

  useEffect(() => {
    if (!user) {
      router.push('/auth/signin')
      return
    }
    
    if (userProfile?.role !== 'citizen') {
      router.push('/')
      return
    }
    
    if (!doctorId) {
      router.push('/doctors')
      return
    }
    
    const loadDoctor = async () => {
      if (!doctorId) return
      
      try {
        const response = await fetch(`/api/doctors`)
        if (response.ok) {
          const doctors = await response.json()
          const selectedDoctor = doctors.find((d: Doctor) => d.id === doctorId)
          if (selectedDoctor) {
            setDoctor(selectedDoctor)
          } else {
            setMessage('Doctor not found')
          }
        }
      } catch (error) {
        console.error('Error fetching doctor:', error)
        setMessage('Failed to load doctor information')
      }
    }
    
    loadDoctor()
  }, [user, userProfile, doctorId, router])

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !doctor || !selectedDate || !selectedTime) return
    
    setLoading(true)
    setMessage('')

    try {
      const scheduledAt = new Date(`${selectedDate}T${selectedTime}:00`)
      
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          citizen_id: user.id,
          doctor_id: doctor.id,
          scheduled_at: scheduledAt.toISOString(),
          mode,
          reason,
        }),
      })

      if (response.ok) {
        const appointment = await response.json()
        router.push(`/appointments/${appointment.id}`)
      } else {
        setMessage('Failed to book appointment')
      }
    } catch (error) {
      console.error('Error booking appointment:', error)
      setMessage('An error occurred while booking appointment')
    } finally {
      setLoading(false)
    }
  }

  // Generate time slots
  const timeSlots = []
  for (let hour = 9; hour <= 17; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
      timeSlots.push(timeString)
    }
  }

  // Get minimum date (today)
  const today = new Date()
  const minDate = today.toISOString().split('T')[0]

  if (!user || userProfile?.role !== 'citizen') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600">Please sign in as a patient to book appointments.</p>
          </div>
        </div>
      </div>
    )
  }

  if (!doctor) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading doctor information...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Book Appointment
          </h1>
          <p className="text-lg text-gray-600">
            Schedule a consultation with Dr. {doctor.user?.name || 'Doctor'}
          </p>
        </div>

        {message && (
          <div className="mb-6 p-4 rounded-lg bg-red-100 text-red-700 border border-red-400">
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Doctor Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Doctor Information
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <User className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Dr. {doctor.user?.name || 'Doctor'}</p>
                  <p className="text-sm text-gray-600">{doctor.user?.phone || 'Phone not available'}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <Award className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">{doctor.specialty}</p>
                  <p className="text-sm text-gray-600">Specialty</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">{doctor.city}</p>
                  <p className="text-sm text-gray-600">Location</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">{doctor.experience_years} years</p>
                  <p className="text-sm text-gray-600">Experience</p>
                </div>
              </div>
              
              {doctor.languages.length > 0 && (
                <div className="flex items-start">
                  <User className="h-5 w-5 text-gray-400 mr-3 mt-1" />
                  <div>
                    <p className="font-medium text-gray-900">{doctor.languages.join(', ')}</p>
                    <p className="text-sm text-gray-600">Languages</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Booking Form */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Select Date & Time
            </h2>
            
            <form onSubmit={handleBooking} className="space-y-4">
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                  Date *
                </label>
                <input
                  type="date"
                  id="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={minDate}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              
              <div>
                <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">
                  Time *
                </label>
                <select
                  id="time"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">Select a time</option>
                  {timeSlots.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Consultation Mode *
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="mode"
                      value="online"
                      checked={mode === 'online'}
                      onChange={(e) => setMode(e.target.value as 'online')}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">Online (Video Call)</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="mode"
                      value="offline"
                      checked={mode === 'offline'}
                      onChange={(e) => setMode(e.target.value as 'offline')}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">In-Person Visit</span>
                  </label>
                </div>
              </div>
              
              <div>
                <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
                  Reason for Visit (Optional)
                </label>
                <textarea
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Brief description of your health concern..."
                />
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-blue-600 mr-2" />
                  <p className="text-sm text-blue-800 font-medium">
                    {mode === 'online' ? 'Video Consultation' : 'In-Person Visit'}
                  </p>
                </div>
                <p className="text-sm text-blue-700 mt-1">
                  {mode === 'online' 
                    ? "You'll receive a video call link after booking confirmation."
                    : "Please visit the doctor's clinic at the scheduled time."
                  }
                </p>
              </div>
              
              <button
                type="submit"
                disabled={loading || !selectedDate || !selectedTime}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Booking...' : 'Book Appointment'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function BookAppointmentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    }>
      <BookAppointmentContent />
    </Suspense>
  )
}