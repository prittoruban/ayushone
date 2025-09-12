'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Link from 'next/link'
import { Calendar, Clock, User, Video, Award } from 'lucide-react'

interface Appointment {
  id: string
  scheduled_at: string
  mode: 'online' | 'offline'
  reason?: string
  status: string
  jitsi_room_id: string
  doctor?: {
    id: string
    specialty: string
    city: string
    experience_years: number
    languages: string[]
    user: {
      name: string
      phone: string
    }
  }
  citizen?: {
    name: string
    phone: string
  }
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  
  const { user, userProfile } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push('/auth/signin')
      return
    }
    
    const loadAppointments = async () => {
      try {
        const response = await fetch(`/api/appointments?user_id=${user.id}`)
        if (response.ok) {
          const data = await response.json()
          setAppointments(data)
        } else {
          setMessage('Failed to load appointments')
        }
      } catch (error) {
        console.error('Error fetching appointments:', error)
        setMessage('An error occurred while loading appointments')
      } finally {
        setLoading(false)
      }
    }
    
    loadAppointments()
  }, [user, router])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const isUpcoming = (dateString: string) => {
    const appointmentTime = new Date(dateString)
    const now = new Date()
    return appointmentTime > now
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600">Please sign in to view your appointments.</p>
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
            <p className="text-gray-600">Loading appointments...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            My Appointments
          </h1>
          <p className="text-lg text-gray-600">
            {userProfile?.role === 'doctor' 
              ? 'Manage your patient appointments'
              : 'Your scheduled consultations'
            }
          </p>
        </div>

        {message && (
          <div className="mb-6 p-4 rounded-lg bg-red-100 text-red-700 border border-red-400">
            {message}
          </div>
        )}

        {appointments.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments found</h3>
            <p className="text-gray-600 mb-6">
              {userProfile?.role === 'doctor' 
                ? 'Patients will be able to book appointments once your profile is complete and verified.'
                : 'You haven\'t booked any appointments yet.'
              }
            </p>
            {userProfile?.role === 'citizen' && (
              <Link
                href="/doctors"
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium"
              >
                Find Doctors
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map((appointment) => (
              <div key={appointment.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {userProfile?.role === 'doctor' 
                              ? appointment.citizen?.name 
                              : `Dr. ${appointment.doctor?.user?.name || 'Doctor'}`
                            }
                          </h3>
                          {appointment.doctor && (
                            <div className="flex items-center text-sm text-gray-600 mt-1">
                              <Award className="h-4 w-4 mr-1" />
                              <span>{appointment.doctor.specialty}</span>
                            </div>
                          )}
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(appointment.status)}`}>
                          {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-6 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>{formatDate(appointment.scheduled_at)}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2" />
                        <span>{formatTime(appointment.scheduled_at)}</span>
                      </div>
                      <div className="flex items-center">
                        <Video className="h-4 w-4 mr-2" />
                        <span>{appointment.mode === 'online' ? 'Online' : 'In-Person'}</span>
                      </div>
                    </div>
                    
                    {appointment.reason && (
                      <div className="mt-2 text-sm text-gray-600">
                        <span className="font-medium">Reason:</span> {appointment.reason}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Link
                      href={`/appointments/${appointment.id}`}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2"
                    >
                      <User className="h-4 w-4" />
                      <span>Details</span>
                    </Link>
                    
                    {isUpcoming(appointment.scheduled_at) && appointment.status === 'confirmed' && appointment.mode === 'online' && (
                      <Link
                        href={`/appointments/${appointment.id}`}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2"
                      >
                        <Video className="h-4 w-4" />
                        <span>Join Call</span>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}