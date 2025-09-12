'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import Navbar from '@/components/Navbar'
import Link from 'next/link'
import { Search, MapPin, Award, Calendar } from 'lucide-react'

interface Doctor {
  id: string
  specialty: string
  city: string
  experience_years: number
  languages: string[]
  verified_badge: boolean
  user?: {
    id: string
    name: string
    role: string
    phone: string
  } | null
}

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)
  const [searchCity, setSearchCity] = useState('')
  const [searchSpecialty, setSearchSpecialty] = useState('')
  const { user } = useAuth()

  const fetchDoctors = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (searchCity) params.append('city', searchCity)
      if (searchSpecialty) params.append('specialty', searchSpecialty)
      
      const response = await fetch(`/api/doctors?${params}`)
      if (response.ok) {
        const data = await response.json()
        setDoctors(data)
      } else {
        console.error('Failed to fetch doctors')
      }
    } catch (error) {
      console.error('Error fetching doctors:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const loadDoctors = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        if (searchCity) params.append('city', searchCity)
        if (searchSpecialty) params.append('specialty', searchSpecialty)
        
        const response = await fetch(`/api/doctors?${params}`)
        if (response.ok) {
          const data = await response.json()
          setDoctors(data)
        } else {
          console.error('Failed to fetch doctors')
        }
      } catch (error) {
        console.error('Error fetching doctors:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadDoctors()
  }, [searchCity, searchSpecialty])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchDoctors()
  }

  const specialties = [
    'Ayurveda',
    'Yoga',
    'Unani',
    'Siddha',
    'Homeopathy',
    'General Medicine',
    'Cardiology',
    'Dermatology',
    'Pediatrics',
    'Orthopedics'
  ]

  const cities = [
    'Mumbai',
    'Delhi',
    'Bangalore',
    'Chennai',
    'Kolkata',
    'Hyderabad',
    'Pune',
    'Ahmedabad',
    'Jaipur',
    'Lucknow'
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Find Verified AYUSH Doctors
          </h1>
          <p className="text-lg text-gray-600">
            Connect with qualified and verified practitioners near you
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <form onSubmit={handleSearch} className="space-y-4 md:space-y-0 md:flex md:space-x-4">
            <div className="flex-1">
              <label htmlFor="specialty" className="block text-sm font-medium text-gray-700 mb-1">
                Specialty
              </label>
              <select
                id="specialty"
                value={searchSpecialty}
                onChange={(e) => setSearchSpecialty(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="">All Specialties</option>
                {specialties.map((specialty) => (
                  <option key={specialty} value={specialty}>
                    {specialty}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex-1">
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                City
              </label>
              <select
                id="city"
                value={searchCity}
                onChange={(e) => setSearchCity(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="">All Cities</option>
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex items-end">
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium flex items-center space-x-2"
              >
                <Search className="h-4 w-4" />
                <span>Search</span>
              </button>
            </div>
          </form>
        </div>

        {/* Results */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-4"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : doctors.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No doctors found</h3>
              <p>Try adjusting your search criteria</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map((doctor) => (
              <div key={doctor.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      Dr. {doctor.user?.name || 'Name not available'}
                    </h3>
                    <div className="flex items-center text-sm text-gray-600 mb-2">
                      <Award className="h-4 w-4 mr-1" />
                      <span>{doctor.specialty}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600 mb-2">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>{doctor.city}</span>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      <span>{doctor.experience_years} years experience</span>
                    </div>
                    {doctor.languages && doctor.languages.length > 0 && (
                      <div className="text-sm text-gray-600">
                        <span>Languages: {doctor.languages.slice(0, 2).join(', ')}{doctor.languages.length > 2 ? '...' : ''}</span>
                      </div>
                    )}
                  </div>
                  {doctor.verified_badge && (
                    <div className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                      Verified
                    </div>
                  )}
                </div>
                
                {user ? (
                  <Link
                    href={`/appointments/book?doctor_id=${doctor.id}`}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium flex items-center justify-center space-x-2"
                  >
                    <Calendar className="h-4 w-4" />
                    <span>Book Appointment</span>
                  </Link>
                ) : (
                  <Link
                    href="/auth/signin"
                    className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg font-medium flex items-center justify-center space-x-2"
                  >
                    <span>Sign In to Book</span>
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}