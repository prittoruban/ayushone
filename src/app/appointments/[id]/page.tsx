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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-green-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <Navbar />
        <div className="flex items-center justify-center py-12">
          <div className="text-center bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border border-slate-200/50 dark:border-slate-700/50">
            <User className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Access Denied</h2>
            <p className="text-gray-600 dark:text-slate-400">Please sign in to view appointment details.</p>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-green-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <Navbar />
        <div className="flex items-center justify-center py-12">
          <div className="text-center bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border border-slate-200/50 dark:border-slate-700/50">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-slate-400">Loading appointment details...</p>
          </div>
        </div>
      </div>
    )
  }

  if (message) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-green-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <Navbar />
        <div className="flex items-center justify-center py-12">
          <div className="text-center bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border border-slate-200/50 dark:border-slate-700/50">
            <Calendar className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Error</h2>
            <p className="text-gray-600 dark:text-slate-400">{message}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!appointment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-green-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <Navbar />
        <div className="flex items-center justify-center py-12">
          <div className="text-center bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border border-slate-200/50 dark:border-slate-700/50">
            <Calendar className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Appointment Not Found</h2>
            <p className="text-gray-600 dark:text-slate-400">The requested appointment could not be found.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-green-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Navbar />
      
      {/* Floating Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-blue-200/20 dark:bg-blue-500/10 rounded-full blur-xl animate-float"></div>
        <div className="absolute top-3/4 right-1/4 w-48 h-48 bg-green-200/20 dark:bg-green-500/10 rounded-full blur-xl animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-3/4 w-24 h-24 bg-purple-200/20 dark:bg-purple-500/10 rounded-full blur-xl animate-float" style={{ animationDelay: '2s' }}></div>
      </div>
      
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-green-500 rounded-2xl mb-6 shadow-lg">
            <Calendar className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 bg-clip-text text-transparent">
              Appointment Details
            </span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-slate-400 max-w-2xl mx-auto">
            View your consultation details and join your video session when ready
          </p>
          {appointment.status === 'confirmed' && (
            <div className="inline-flex items-center mt-4 px-4 py-2 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-full border border-green-200 dark:border-green-800">
              <CheckCircle className="h-5 w-5 mr-2" />
              <span className="font-medium">Confirmed</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Appointment Information */}
          <div className="animate-fade-in-left">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 p-8 h-full">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Appointment Information</h2>
                  <p className="text-sm text-gray-600 dark:text-slate-400">Your scheduled consultation details</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex items-center p-4 bg-gradient-to-r from-blue-50 to-transparent dark:from-blue-900/20 dark:to-transparent rounded-xl border border-blue-100 dark:border-blue-800/30">
                    <Calendar className="h-6 w-6 text-blue-500 mr-4" />
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white text-lg">{formatDate(appointment.scheduled_at)}</p>
                      <p className="text-sm text-gray-600 dark:text-slate-400">Appointment Date</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                    <Clock className="h-5 w-5 text-green-500 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{formatTime(appointment.scheduled_at)}</p>
                      <p className="text-xs text-gray-600 dark:text-slate-400">Scheduled Time</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                    <User className="h-5 w-5 text-purple-500 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Dr. {appointment.doctor.user?.name || 'Doctor'}</p>
                      <p className="text-xs text-gray-600 dark:text-slate-400">Consulting Doctor</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                    <Award className="h-5 w-5 text-yellow-500 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{appointment.doctor.specialty}</p>
                      <p className="text-xs text-gray-600 dark:text-slate-400">Medical Specialty</p>
                    </div>
                  </div>
                </div>
                
                {/* Patient Information */}
                <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Patient Information</h3>
                  <div className="bg-gradient-to-r from-green-50 to-transparent dark:from-green-900/20 dark:to-transparent p-4 rounded-xl border border-green-100 dark:border-green-800/30">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center text-white font-semibold mr-3">
                        {appointment.citizen.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{appointment.citizen.name}</p>
                        <p className="text-sm text-gray-600 dark:text-slate-400">{appointment.citizen.phone}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Video Consultation */}
          <div className="animate-fade-in-right">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 p-8 h-full">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                  <Video className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Video Consultation</h2>
                  <p className="text-sm text-gray-600 dark:text-slate-400">Connect with your doctor online</p>
                </div>
              </div>
              
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-green-100 dark:from-blue-900/30 dark:to-green-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Video className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                </div>
                
                {isAppointmentTime() ? (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-semibold text-green-600 dark:text-green-400 mb-2">
                        🟢 Ready to Start
                      </h3>
                      <p className="text-gray-600 dark:text-slate-400 mb-6">
                        Your consultation is ready! Click the button below to join your video session.
                      </p>
                    </div>
                    <a
                      href={getJitsiUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 space-x-3"
                    >
                      <Video className="h-6 w-6" />
                      <span>Start Video Consultation</span>
                    </a>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        📅 Consultation Scheduled
                      </h3>
                      <p className="text-gray-600 dark:text-slate-400 mb-4">
                        The video consultation link will be available 15 minutes before your appointment time.
                      </p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-xl">
                      <p className="text-sm text-gray-600 dark:text-slate-400 mb-1">Room ID</p>
                      <p className="font-mono text-sm font-semibold text-gray-900 dark:text-white bg-white dark:bg-slate-800 px-3 py-2 rounded-lg border">
                        {appointment.jitsi_room_id}
                      </p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="mt-8 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 p-6 rounded-xl border border-blue-100 dark:border-blue-800/30">
                <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-3 flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Preparation Tips
                </h4>
                <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-2">
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Ensure you have a stable internet connection
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Test your camera and microphone beforehand
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Find a quiet, well-lit space
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Have your medical history ready
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="mt-8 animate-fade-in">
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-800/30 rounded-2xl p-6 shadow-lg">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-yellow-900 dark:text-yellow-300 mb-2 text-lg">Need Help?</h3>
                <p className="text-yellow-800 dark:text-yellow-300 mb-4">
                  If you experience any technical issues or need to reschedule, please contact support or reach out to the doctor directly.
                </p>
                <div className="flex flex-wrap gap-3">
                  <button className="inline-flex items-center px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white font-medium rounded-lg transition-colors duration-200">
                    <User className="w-4 h-4 mr-2" />
                    Contact Support
                  </button>
                  <button className="inline-flex items-center px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors duration-200">
                    <Calendar className="w-4 h-4 mr-2" />
                    Reschedule
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}