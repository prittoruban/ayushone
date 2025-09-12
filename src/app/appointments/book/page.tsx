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
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
        <Navbar />
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Access Denied</h2>
            <p className="text-gray-600 dark:text-slate-400">Please sign in as a patient to book appointments.</p>
          </div>
        </div>
      </div>
    )
  }

  if (!doctor) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
        <Navbar />
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-slate-400">Loading doctor information...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <Navbar />
      
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200/20 dark:bg-blue-400/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-green-200/20 dark:bg-green-400/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      </div>
      
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in-up">
          <div className="inline-flex items-center px-4 py-2 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium mb-6">
            <Calendar className="w-4 h-4 mr-2" />
            Book Consultation
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
            Schedule Your 
            <span className="gradient-text"> Healthcare</span>
            <br />
            Consultation
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-slate-400 max-w-3xl mx-auto">
            Book a personalized consultation with Dr. {doctor.user?.name || 'Doctor'} and take the first step towards better health.
          </p>
        </div>

        {message && (
          <div className="mb-8 p-4 rounded-xl animate-fade-in bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800">
            <div className="flex items-center space-x-2">
              <User className="w-5 h-5" />
              <span>{message}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Doctor Information */}
          <div className="animate-fade-in-left">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 p-8 h-full">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Doctor Information</h2>
                  <p className="text-sm text-gray-600 dark:text-slate-400">About your healthcare provider</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-center p-4 bg-gradient-to-r from-blue-50 to-transparent dark:from-blue-900/20 dark:to-transparent rounded-xl border border-blue-100 dark:border-blue-800/30">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-semibold text-lg mr-4">
                    {doctor.user?.name?.charAt(0).toUpperCase() || 'D'}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white text-lg">Dr. {doctor.user?.name || 'Doctor'}</p>
                    <p className="text-sm text-gray-600 dark:text-slate-400">{doctor.user?.phone || 'Phone not available'}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex items-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                    <Award className="h-5 w-5 text-blue-500 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{doctor.specialty}</p>
                      <p className="text-xs text-gray-600 dark:text-slate-400">Specialty</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                    <Calendar className="h-5 w-5 text-green-500 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{doctor.city}</p>
                      <p className="text-xs text-gray-600 dark:text-slate-400">Location</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                    <Clock className="h-5 w-5 text-purple-500 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{doctor.experience_years} years</p>
                      <p className="text-xs text-gray-600 dark:text-slate-400">Experience</p>
                    </div>
                  </div>
                  
                  {doctor.languages.length > 0 && (
                    <div className="flex items-start p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                      <User className="h-5 w-5 text-yellow-500 mr-3 mt-1" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{doctor.languages.join(', ')}</p>
                        <p className="text-xs text-gray-600 dark:text-slate-400">Languages</p>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Rating placeholder */}
                <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-1 mb-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <div key={star} className="w-4 h-4 text-yellow-400 fill-current">⭐</div>
                        ))}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-slate-400">4.9 (127 reviews)</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600">Available</p>
                      <p className="text-xs text-gray-600 dark:text-slate-400">Ready for consultation</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Form */}
          <div className="animate-fade-in-right">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 p-8 h-full">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Book Appointment</h2>
                  <p className="text-sm text-gray-600 dark:text-slate-400">Schedule your consultation</p>
                </div>
              </div>
              
              <form onSubmit={handleBooking} className="space-y-6">
                <div className="space-y-6">
                  <div className="relative">
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                      Appointment Date *
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400 dark:text-slate-500" />
                      <input
                        type="date"
                        id="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        min={minDate}
                        required
                        className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>
                  </div>
                  
                  <div className="relative">
                    <label htmlFor="time" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                      Preferred Time *
                    </label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-3 h-5 w-5 text-gray-400 dark:text-slate-500" />
                      <select
                        id="time"
                        value={selectedTime}
                        onChange={(e) => setSelectedTime(e.target.value)}
                        required
                        className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                      >
                        <option value="">Select a time</option>
                        {timeSlots.map((time) => (
                          <option key={time} value={time}>
                            {time}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-3">
                      Consultation Mode *
                    </label>
                    <div className="grid grid-cols-1 gap-3">
                      <label className="relative cursor-pointer">
                        <input
                          type="radio"
                          name="mode"
                          value="online"
                          checked={mode === 'online'}
                          onChange={(e) => setMode(e.target.value as 'online')}
                          className="sr-only"
                        />
                        <div className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                          mode === 'online' 
                            ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700/50'
                        }`}>
                          <div className="flex items-center">
                            <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${
                              mode === 'online' ? 'border-green-500' : 'border-slate-300 dark:border-slate-600'
                            }`}>
                              {mode === 'online' && <div className="w-2 h-2 bg-green-500 rounded-full"></div>}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">Online (Video Call)</p>
                              <p className="text-sm text-gray-600 dark:text-slate-400">Consult from comfort of your home</p>
                            </div>
                          </div>
                        </div>
                      </label>
                      
                      <label className="relative cursor-pointer">
                        <input
                          type="radio"
                          name="mode"
                          value="offline"
                          checked={mode === 'offline'}
                          onChange={(e) => setMode(e.target.value as 'offline')}
                          className="sr-only"
                        />
                        <div className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                          mode === 'offline' 
                            ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700/50'
                        }`}>
                          <div className="flex items-center">
                            <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${
                              mode === 'offline' ? 'border-green-500' : 'border-slate-300 dark:border-slate-600'
                            }`}>
                              {mode === 'offline' && <div className="w-2 h-2 bg-green-500 rounded-full"></div>}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">In-Person Visit</p>
                              <p className="text-sm text-gray-600 dark:text-slate-400">Visit doctor&apos;s clinic directly</p>
                            </div>
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>
                  
                  <div className="relative">
                    <label htmlFor="reason" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                      Reason for Visit (Optional)
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-5 w-5 text-gray-400 dark:text-slate-500" />
                      <textarea
                        id="reason"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        rows={3}
                        className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 resize-none"
                        placeholder="Brief description of your health concern..."
                      />
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800/30">
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-blue-600 mr-3" />
                    <p className="text-sm text-blue-800 dark:text-blue-300 font-medium">
                      {mode === 'online' ? 'Video Consultation' : 'In-Person Visit'}
                    </p>
                  </div>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                    {mode === 'online' 
                      ? "You'll receive a video call link after booking confirmation."
                      : "Please visit the doctor's clinic at the scheduled time."
                    }
                  </p>
                </div>
                
                <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
                  <button
                    type="submit"
                    disabled={loading || !selectedDate || !selectedTime}
                    className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-green-400 disabled:to-green-500 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none flex items-center justify-center space-x-2"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                        <span>Booking...</span>
                      </>
                    ) : (
                      <>
                        <Calendar className="w-5 h-5" />
                        <span>Book Appointment</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function BookAppointmentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
        <Navbar />
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-slate-400">Loading...</p>
          </div>
        </div>
      </div>
    }>
      <BookAppointmentContent />
    </Suspense>
  )
}