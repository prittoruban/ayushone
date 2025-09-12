'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import Navbar from '@/components/Navbar'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { LoadingSpinner } from '@/components/ui/Loading'
import Link from 'next/link'
import { 
  Search, 
  MapPin, 
  Award, 
  Calendar, 
  Star,
  User,
  Languages,
  Filter,
  Clock,
  Shield,
  Heart,
  Sparkles,
  ArrowRight
} from 'lucide-react'

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

  const getSpecialtyIcon = (specialty: string) => {
    switch (specialty.toLowerCase()) {
      case 'ayurveda': return '🌿'
      case 'yoga': return '🧘'
      case 'unani': return '⚗️'
      case 'siddha': return '🔬'
      case 'homeopathy': return '💊'
      case 'cardiology': return '❤️'
      case 'dermatology': return '👨‍⚕️'
      case 'pediatrics': return '👶'
      case 'orthopedics': return '🦴'
      default: return '🩺'
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-16 pb-8">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50/30 via-white to-white dark:from-slate-800/30 dark:via-slate-900 dark:to-slate-900" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200/20 dark:bg-blue-400/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-200/20 dark:bg-purple-400/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 animate-fade-in-up">
            <Badge variant="outline" className="mb-6 px-4 py-2">
              <Heart className="w-4 h-4 mr-2" />
              Find Your Perfect Match
            </Badge>
            
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6 leading-tight">
              Discover 
              <span className="gradient-text"> Verified AYUSH</span>
              <br />
              Practitioners
            </h1>
            
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto mb-8 leading-relaxed">
              Connect with qualified and verified traditional medicine practitioners. 
              Find experts in Ayurveda, Yoga, Unani, Siddha, and Homeopathy near you.
            </p>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{doctors.length}+</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Doctors Available</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">4.9</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Average Rating</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">24/7</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Support</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">2min</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Response Time</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {/* Search Form */}
        <div className="glass-card mb-12 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <Card>
            <CardContent className="p-8">
              <div className="flex items-center mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center">
                    <Filter className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Find Your Doctor</h2>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Search by specialty and location</p>
                  </div>
                </div>
              </div>
              
              <form onSubmit={handleSearch} className="space-y-6 md:space-y-0 md:grid md:grid-cols-3 md:gap-6">
                <div>
                  <label htmlFor="specialty" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    <Award className="w-4 h-4 inline mr-2" />
                    Specialty
                  </label>
                  <select
                    id="specialty"
                    value={searchSpecialty}
                    onChange={(e) => setSearchSpecialty(e.target.value)}
                    className="w-full px-4 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  >
                    <option value="">All Specialties</option>
                    {specialties.map((specialty) => (
                      <option key={specialty} value={specialty}>
                        {getSpecialtyIcon(specialty)} {specialty}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    <MapPin className="w-4 h-4 inline mr-2" />
                    City
                  </label>
                  <select
                    id="city"
                    value={searchCity}
                    onChange={(e) => setSearchCity(e.target.value)}
                    className="w-full px-4 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  >
                    <option value="">All Cities</option>
                    {cities.map((city) => (
                      <option key={city} value={city}>
                        📍 {city}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="flex items-end">
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-full md:w-auto"
                  >
                    <Search className="w-5 h-5 mr-2" />
                    Search Doctors
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Results Section */}
        {loading ? (
          <div className="space-y-8">
            <div className="flex items-center justify-center">
              <LoadingSpinner size="lg" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-6 bg-secondary-200 rounded mb-4"></div>
                    <div className="h-4 bg-secondary-200 rounded mb-2"></div>
                    <div className="h-4 bg-secondary-200 rounded mb-4"></div>
                    <div className="h-12 bg-secondary-200 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : doctors.length === 0 ? (
          <div className="text-center py-16 animate-fade-in">
            <div className="text-slate-400 dark:text-slate-500 mb-6">
              <Search className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">No doctors found</h3>
              <p className="text-slate-600 dark:text-slate-400">Try adjusting your search criteria or browse all doctors</p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchCity('')
                setSearchSpecialty('')
                fetchDoctors()
              }}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Show All Doctors
            </Button>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div className="animate-fade-in-left">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {doctors.length} Doctor{doctors.length !== 1 ? 's' : ''} Found
                </h2>
                <p className="text-slate-600 dark:text-slate-400">Choose from verified practitioners</p>
              </div>
              <Badge variant="outline" className="animate-fade-in-right">
                <Shield className="w-4 h-4 mr-2" />
                All Verified
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {doctors.map((doctor, index) => (
                <div
                  key={doctor.id}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <Card hover className="group h-full">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center text-white font-semibold text-lg">
                            {getSpecialtyIcon(doctor.specialty)}
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-secondary-900 mb-1 group-hover:text-primary-600 transition-colors duration-200">
                              Dr. {doctor.user?.name || 'Name not available'}
                            </h3>
                            {doctor.verified_badge && (
                              <Badge variant="success" size="sm">
                                <Shield className="w-3 h-3 mr-1" />
                                Verified
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-3 mb-6">
                        <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                          <Award className="h-4 w-4 mr-3 text-blue-500" />
                          <span className="font-medium">{doctor.specialty}</span>
                        </div>
                        <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                          <MapPin className="h-4 w-4 mr-3 text-purple-500" />
                          <span>{doctor.city}</span>
                        </div>
                        <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                          <Clock className="h-4 w-4 mr-3 text-green-500" />
                          <span>{doctor.experience_years} years experience</span>
                        </div>
                        {doctor.languages && doctor.languages.length > 0 && (
                          <div className="flex items-start text-sm text-slate-600 dark:text-slate-400">
                            <Languages className="h-4 w-4 mr-3 text-yellow-500 mt-0.5" />
                            <div>
                              <span>Languages: </span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {doctor.languages.slice(0, 3).map((lang) => (
                                  <Badge key={lang} variant="outline" size="sm" className="text-xs">
                                    {lang}
                                  </Badge>
                                ))}
                                {doctor.languages.length > 3 && (
                                  <Badge variant="outline" size="sm" className="text-xs">
                                    +{doctor.languages.length - 3} more
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Rating placeholder */}
                      <div className="flex items-center space-x-1 mb-6">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        ))}
                        <span className="text-sm text-slate-600 dark:text-slate-400 ml-2">4.9 (127 reviews)</span>
                      </div>
                      
                      {user ? (
                        <Link href={`/appointments/book?doctor_id=${doctor.id}`}>
                          <Button variant="primary" size="lg" className="w-full group">
                            <Calendar className="w-5 h-5 mr-2" />
                            Book Appointment
                            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
                          </Button>
                        </Link>
                      ) : (
                        <Link href="/auth/signin">
                          <Button variant="outline" size="lg" className="w-full">
                            <User className="w-5 h-5 mr-2" />
                            Sign In to Book
                          </Button>
                        </Link>
                      )}
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}