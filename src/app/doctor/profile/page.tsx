'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { Upload, CheckCircle, AlertCircle } from 'lucide-react'

export default function DoctorProfilePage() {
  const [specialty, setSpecialty] = useState('')
  const [city, setCity] = useState('')
  const [licenseFile, setLicenseFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')
  const [doctorProfile, setDoctorProfile] = useState<{
    id: string
    specialty: string
    city: string
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

  if (!user || userProfile?.role !== 'doctor') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600">This page is only accessible to doctors.</p>
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
            Doctor Profile
          </h1>
          <p className="text-lg text-gray-600">
            Complete your profile to start accepting patients
          </p>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.includes('successfully') || message.includes('saved')
              ? 'bg-green-100 text-green-700 border border-green-400'
              : 'bg-red-100 text-red-700 border border-red-400'
          }`}>
            {message}
          </div>
        )}

        {/* Profile Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Basic Information
          </h2>
          
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div>
              <label htmlFor="specialty" className="block text-sm font-medium text-gray-700 mb-1">
                Specialty *
              </label>
              <select
                id="specialty"
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="">Select your specialty</option>
                {specialties.map((spec) => (
                  <option key={spec} value={spec}>
                    {spec}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                City *
              </label>
              <select
                id="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="">Select your city</option>
                {cities.map((cityOption) => (
                  <option key={cityOption} value={cityOption}>
                    {cityOption}
                  </option>
                ))}
              </select>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 text-white py-2 px-6 rounded-lg font-medium disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Profile'}
            </button>
          </form>
        </div>

        {/* License Upload */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              License Verification
            </h2>
            {doctorProfile?.verified_badge && (
              <div className="flex items-center text-green-600">
                <CheckCircle className="h-5 w-5 mr-2" />
                <span className="font-medium">Verified</span>
              </div>
            )}
          </div>
          
          {!doctorProfile?.verified_badge ? (
            <form onSubmit={handleLicenseUpload} className="space-y-4">
              <div>
                <label htmlFor="license" className="block text-sm font-medium text-gray-700 mb-1">
                  Upload License Document *
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                  <div className="space-y-1 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="license"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-green-600 hover:text-green-500 focus-within:outline-none"
                      >
                        <span>Upload a file</span>
                        <input
                          id="license"
                          name="license"
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => setLicenseFile(e.target.files?.[0] || null)}
                          className="sr-only"
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      PDF, JPG, PNG up to 10MB
                    </p>
                  </div>
                </div>
                {licenseFile && (
                  <p className="mt-2 text-sm text-gray-600">
                    Selected: {licenseFile.name}
                  </p>
                )}
              </div>
              
              <button
                type="submit"
                disabled={!licenseFile || uploading}
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg font-medium disabled:opacity-50"
              >
                {uploading ? 'Uploading...' : 'Upload & Verify'}
              </button>
            </form>
          ) : (
            <div className="text-center py-8">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Your license is verified!
              </h3>
              <p className="text-gray-600">
                You can now appear in search results and accept appointments.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}