'use client'

import { useState, useEffect, use } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { Calendar, Clock, User, Video, CheckCircle, Award } from 'lucide-react'

interface Appointment {
  id: string
  scheduled_at: string
  status: string
  jitsi_room_id: string
  doctor: {
    id: string
    specialty: string
    city: string
    user?: {
      name: string
      phone: string
    } | null
  }
  citizen: {
    name: string
    phone: string
  }
}

export default function AppointmentDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const [appointment, setAppointment] = useState<Appointment | null>(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push('/auth/signin')
      return
    }
    
    const loadAppointment = async () => {
      try {
        const response = await fetch(`/api/appointments/${resolvedParams.id}`)
        if (response.ok) {
          const data = await response.json()
          setAppointment(data)
        } else {
          setMessage('Appointment not found')
        }
      } catch (error) {
        console.error('Error fetching appointment:', error)
        setMessage('Failed to load appointment details')
      } finally {
        setLoading(false)
      }
    }
    
    loadAppointment()
  }, [user, resolvedParams.id, router])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getJitsiUrl = () => {
    if (!appointment) return ''
    const domain = process.env.NEXT_PUBLIC_JITSI_DOMAIN || 'meet.jit.si'
    return `https://${domain}/${appointment.jitsi_room_id}`
  }

  const isAppointmentTime = () => {
    if (!appointment) return false
    const appointmentTime = new Date(appointment.scheduled_at)
    const now = new Date()
    const timeDiff = appointmentTime.getTime() - now.getTime()
    // Allow joining 15 minutes before and up to 2 hours after
    return timeDiff <= 15 * 60 * 1000 && timeDiff >= -2 * 60 * 60 * 1000
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600">Please sign in to view appointment details.</p>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading appointment details...</p>
          </div>
        </div>
      </div>
    )
  }

  if (message) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
            <p className="text-gray-600">{message}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!appointment) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Appointment Not Found</h2>
            <p className="text-gray-600">The requested appointment could not be found.</p>
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
            Appointment Details
          </h1>
          {appointment.status === 'confirmed' && (
            <div className="flex items-center text-green-600">
              <CheckCircle className="h-5 w-5 mr-2" />
              <span className="font-medium">Confirmed</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Appointment Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Appointment Information
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">{formatDate(appointment.scheduled_at)}</p>
                  <p className="text-sm text-gray-600">Date</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">{formatTime(appointment.scheduled_at)}</p>
                  <p className="text-sm text-gray-600">Time</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <User className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Dr. {appointment.doctor.user?.name || 'Doctor'}</p>
                  <p className="text-sm text-gray-600">Doctor</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <Award className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">{appointment.doctor.specialty}</p>
                  <p className="text-sm text-gray-600">Specialty</p>
                </div>
              </div>
            </div>
          </div>

          {/* Video Consultation */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Video Consultation
            </h2>
            
            <div className="text-center">
              <Video className="h-16 w-16 text-blue-600 mx-auto mb-4" />
              
              {isAppointmentTime() ? (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Ready to Start
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Click the button below to join your video consultation.
                  </p>
                  <a
                    href={getJitsiUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg space-x-2"
                  >
                    <Video className="h-5 w-5" />
                    <span>Start Video Consultation</span>
                  </a>
                </div>
              ) : (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Consultation Scheduled
                  </h3>
                  <p className="text-gray-600 mb-4">
                    The video consultation link will be available 15 minutes before your appointment time.
                  </p>
                  <p className="text-sm text-gray-500">
                    Room ID: {appointment.jitsi_room_id}
                  </p>
                </div>
              )}
            </div>
            
            <div className="mt-6 bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Preparation Tips:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Ensure you have a stable internet connection</li>
                <li>• Test your camera and microphone beforehand</li>
                <li>• Find a quiet, well-lit space</li>
                <li>• Have your medical history ready</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-medium text-yellow-900 mb-2">Need Help?</h3>
          <p className="text-sm text-yellow-800">
            If you experience any technical issues or need to reschedule, please contact support or reach out to the doctor directly.
          </p>
        </div>
      </div>
    </div>
  )
}