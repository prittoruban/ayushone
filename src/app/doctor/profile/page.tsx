'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { 
  Upload, 
  CheckCircle, 
  AlertCircle, 
  User,
  Award,
  MapPin,
  Calendar,
  Languages,
  FileText,
  Shield,
  Heart,
  Sparkles,
  Save,
  Star,
  Clock
} from 'lucide-react'

export default function DoctorProfilePage() {
  const [specialty, setSpecialty] = useState('')
  const [city, setCity] = useState('')
  const [licenseNumber, setLicenseNumber] = useState('')
  const [experienceYears, setExperienceYears] = useState(0)
  const [languages, setLanguages] = useState<string[]>([])
  const [licenseFile, setLicenseFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')
  const [doctorProfile, setDoctorProfile] = useState<{
    id: string
    specialty: string
    city: string
    license_number?: string
    experience_years: number
    languages: string[]
    verified_badge: boolean
    license_url?: string
  } | null>(null)
  
  const { user, userProfile } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push('/auth/signin')
      return
    }
    
    if (userProfile?.role !== 'doctor') {
      router.push('/')
      return
    }
    
    // Fetch existing doctor profile
    const loadProfile = async () => {
      if (!user) return
      
      try {
        const response = await fetch(`/api/doctors?user_id=${user.id}`)
        if (response.ok) {
          const doctors = await response.json()
          if (doctors.length > 0) {
            const profile = doctors[0]
            setDoctorProfile(profile)
            setSpecialty(profile.specialty || '')
            setCity(profile.city || '')
            setLicenseNumber(profile.license_number || '')
            setExperienceYears(profile.experience_years || 0)
            setLanguages(profile.languages || [])
          }
        }
      } catch (error) {
        console.error('Error fetching doctor profile:', error)
      }
    }
    
    loadProfile()
  }, [user, userProfile, router])

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    
    setLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/doctors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id,
          specialty,
          city,
          license_number: licenseNumber,
          experience_years: experienceYears,
          languages,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setDoctorProfile(data)
        setMessage('Profile saved successfully!')
      } else {
        setMessage('Failed to save profile')
      }
    } catch (error) {
      console.error('Error saving profile:', error)
      setMessage('An error occurred while saving profile')
    } finally {
      setLoading(false)
    }
  }

  const handleLicenseUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !licenseFile) return

    setUploading(true)
    setMessage('')

    try {
      const formData = new FormData()
      formData.append('license', licenseFile)
      formData.append('user_id', user.id)

      const response = await fetch('/api/doctors/upload', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        setDoctorProfile(data.doctor)
        setMessage('License uploaded and verified successfully!')
        setLicenseFile(null)
      } else {
        setMessage('Failed to upload license')
      }
    } catch (error) {
      console.error('Error uploading license:', error)
      setMessage('An error occurred while uploading license')
    } finally {
      setUploading(false)
    }
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

  const availableLanguages = ['English', 'Hindi', 'Tamil', 'Telugu', 'Bengali', 'Marathi', 'Gujarati', 'Kannada']

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

  if (!user || userProfile?.role !== 'doctor') {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <Card>
            <CardContent className="p-8 text-center">
              <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-secondary-900 mb-2">Access Denied</h2>
              <p className="text-secondary-600 mb-6">This page is only accessible to doctors.</p>
              <Button variant="primary" onClick={() => router.push('/')}>
                Go Home
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-200/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent-200/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      </div>
      
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in-up">
          <Badge variant="outline" className="mb-6 px-4 py-2">
            <Heart className="w-4 h-4 mr-2" />
            Doctor Dashboard
          </Badge>
          
          <h1 className="text-4xl md:text-5xl font-bold text-secondary-900 mb-6 leading-tight">
            Complete Your 
            <span className="gradient-text"> Professional Profile</span>
          </h1>
          
          <p className="text-xl text-secondary-600 max-w-3xl mx-auto mb-8">
            Build your professional presence and start connecting with patients seeking traditional medicine expertise.
          </p>
          
          {/* Profile completion status */}
          <div className="flex items-center justify-center space-x-8 p-6 bg-white/50 backdrop-blur-sm rounded-2xl border border-secondary-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-600">
                {specialty && city ? '80%' : '40%'}
              </div>
              <div className="text-sm text-secondary-600">Profile Complete</div>
            </div>
            {doctorProfile?.verified_badge ? (
              <div className="flex items-center space-x-2 text-success-600">
                <CheckCircle className="w-6 h-6" />
                <span className="font-medium">Verified Doctor</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2 text-warning-600">
                <Clock className="w-6 h-6" />
                <span className="font-medium">Pending Verification</span>
              </div>
            )}
          </div>
        </div>

        {message && (
          <div className={`mb-8 p-4 rounded-xl animate-fade-in ${
            message.includes('successfully') || message.includes('saved')
              ? 'bg-success-50 text-success-700 border border-success-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            <div className="flex items-center space-x-2">
              {message.includes('successfully') ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
              <span>{message}</span>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Profile Form */}
          <div className="lg:col-span-2 space-y-8">
            <Card>
              <CardContent className="p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                    <User className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-secondary-900">Basic Information</h2>
                    <p className="text-sm text-secondary-600">Complete your professional details</p>
                  </div>
                </div>
                
                <form onSubmit={handleProfileSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="specialty" className="block text-sm font-medium text-secondary-700 mb-2">
                        <Award className="w-4 h-4 inline mr-2" />
                        Specialty *
                      </label>
                      <select
                        id="specialty"
                        value={specialty}
                        onChange={(e) => setSpecialty(e.target.value)}
                        required
                        className="w-full px-4 py-3 bg-white border border-secondary-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
                      >
                        <option value="">Select your specialty</option>
                        {specialties.map((spec) => (
                          <option key={spec} value={spec}>
                            {getSpecialtyIcon(spec)} {spec}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="city" className="block text-sm font-medium text-secondary-700 mb-2">
                        <MapPin className="w-4 h-4 inline mr-2" />
                        City *
                      </label>
                      <select
                        id="city"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        required
                        className="w-full px-4 py-3 bg-white border border-secondary-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
                      >
                        <option value="">Select your city</option>
                        {cities.map((cityOption) => (
                          <option key={cityOption} value={cityOption}>
                            📍 {cityOption}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="license_number" className="block text-sm font-medium text-secondary-700 mb-2">
                        <FileText className="w-4 h-4 inline mr-2" />
                        License Number
                      </label>
                      <Input
                        id="license_number"
                        type="text"
                        value={licenseNumber}
                        onChange={(e) => setLicenseNumber(e.target.value)}
                        placeholder="Enter your license number"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="experience_years" className="block text-sm font-medium text-secondary-700 mb-2">
                        <Calendar className="w-4 h-4 inline mr-2" />
                        Years of Experience
                      </label>
                      <Input
                        id="experience_years"
                        type="number"
                        min="0"
                        max="50"
                        value={experienceYears}
                        onChange={(e) => setExperienceYears(parseInt(e.target.value) || 0)}
                        placeholder="0"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-3">
                      <Languages className="w-4 h-4 inline mr-2" />
                      Languages Spoken
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {availableLanguages.map((lang) => (
                        <label key={lang} className={`relative flex items-center p-3 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                          languages.includes(lang)
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-secondary-200 hover:border-secondary-300'
                        }`}>
                          <input
                            type="checkbox"
                            checked={languages.includes(lang)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setLanguages([...languages, lang])
                              } else {
                                setLanguages(languages.filter(l => l !== lang))
                              }
                            }}
                            className="sr-only"
                          />
                          <div className="flex items-center space-x-2">
                            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                              languages.includes(lang)
                                ? 'border-primary-500 bg-primary-500'
                                : 'border-secondary-300'
                            }`}>
                              {languages.includes(lang) && (
                                <CheckCircle className="w-3 h-3 text-white" />
                              )}
                            </div>
                            <span className="text-sm text-secondary-700">{lang}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    disabled={loading}
                    className="w-full md:w-auto"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5 mr-2" />
                        Save Profile
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* License Verification */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-accent-100 rounded-xl flex items-center justify-center">
                      <Shield className="w-5 h-5 text-accent-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-secondary-900">License Verification</h3>
                      <p className="text-sm text-secondary-600">Upload your medical license</p>
                    </div>
                  </div>
                  {doctorProfile?.verified_badge && (
                    <Badge variant="success">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
                
                {!doctorProfile?.verified_badge ? (
                  <form onSubmit={handleLicenseUpload} className="space-y-4">
                    <div>
                      <div className="border-2 border-dashed border-secondary-300 rounded-xl p-6 text-center hover:border-primary-400 transition-colors duration-200">
                        <Upload className="mx-auto h-12 w-12 text-secondary-400 mb-4" />
                        <div className="text-sm text-secondary-600 mb-2">
                          <label
                            htmlFor="license"
                            className="cursor-pointer font-medium text-primary-600 hover:text-primary-500"
                          >
                            Upload a file
                          </label>
                          <span> or drag and drop</span>
                        </div>
                        <p className="text-xs text-secondary-500">
                          PDF, JPG, PNG up to 10MB
                        </p>
                        <input
                          id="license"
                          name="license"
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => setLicenseFile(e.target.files?.[0] || null)}
                          className="sr-only"
                        />
                      </div>
                      {licenseFile && (
                        <p className="mt-2 text-sm text-secondary-600 p-3 bg-primary-50 rounded-lg">
                          <FileText className="w-4 h-4 inline mr-2" />
                          Selected: {licenseFile.name}
                        </p>
                      )}
                    </div>
                    
                    <Button
                      type="submit"
                      variant="secondary"
                      disabled={!licenseFile || uploading}
                      className="w-full"
                    >
                      {uploading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          Upload & Verify
                        </>
                      )}
                    </Button>
                  </form>
                ) : (
                  <div className="text-center py-6">
                    <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="h-10 w-10 text-success-600" />
                    </div>
                    <h4 className="text-lg font-medium text-secondary-900 mb-2">
                      License Verified!
                    </h4>
                    <p className="text-secondary-600 text-sm">
                      You can now appear in search results and accept appointments.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-success-100 rounded-xl flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-success-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-secondary-900">Your Impact</h3>
                    <p className="text-sm text-secondary-600">Track your progress</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-primary-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <User className="w-5 h-5 text-primary-600" />
                      <span className="text-sm font-medium text-secondary-900">Profile Views</span>
                    </div>
                    <span className="text-lg font-bold text-primary-600">127</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-accent-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-accent-600" />
                      <span className="text-sm font-medium text-secondary-900">Appointments</span>
                    </div>
                    <span className="text-lg font-bold text-accent-600">23</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-warning-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Star className="w-5 h-5 text-warning-600" />
                      <span className="text-sm font-medium text-secondary-900">Rating</span>
                    </div>
                    <span className="text-lg font-bold text-warning-600">4.9</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}