'use client'

import { useAuth } from '@/contexts/AuthContext'
import Navbar from '@/components/Navbar'
import Link from 'next/link'
import { Search, Shield, Calendar, Video } from 'lucide-react'

export default function Home() {
  const { user, userProfile } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              AYUSH ONE
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              Connect with Verified AYUSH Doctors Online
            </p>
            <p className="text-lg mb-12 opacity-80 max-w-3xl mx-auto">
              Find qualified Ayurveda, Yoga, Unani, Siddha, and Homeopathy practitioners 
              for online consultations. All doctors are verified and licensed.
            </p>
            
            {!user ? (
              <div className="space-x-4">
                <Link
                  href="/auth/signup"
                  className="bg-white text-green-600 hover:bg-gray-100 px-8 py-3 rounded-lg text-lg font-semibold inline-block"
                >
                  Get Started
                </Link>
                <Link
                  href="/doctors"
                  className="border-2 border-white text-white hover:bg-white hover:text-green-600 px-8 py-3 rounded-lg text-lg font-semibold inline-block"
                >
                  Find Doctors
                </Link>
              </div>
            ) : (
              <div className="space-x-4">
                <Link
                  href="/doctors"
                  className="bg-white text-green-600 hover:bg-gray-100 px-8 py-3 rounded-lg text-lg font-semibold inline-block"
                >
                  Find Doctors
                </Link>
                {userProfile?.role === 'doctor' && (
                  <Link
                    href="/doctor/profile"
                    className="border-2 border-white text-white hover:bg-white hover:text-green-600 px-8 py-3 rounded-lg text-lg font-semibold inline-block"
                  >
                    Manage Profile
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Simple steps to connect with verified AYUSH doctors
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Search Doctors</h3>
              <p className="text-gray-600">
                Find doctors by specialty and location
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Verified Doctors</h3>
              <p className="text-gray-600">
                All doctors are licensed and verified
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Book Appointment</h3>
              <p className="text-gray-600">
                Schedule at your convenient time
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Video className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Video Consult</h3>
              <p className="text-gray-600">
                Secure online consultation
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gray-100 py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {userProfile?.role === 'doctor' 
              ? 'Join Our Network of Verified Doctors'
              : 'Ready to Consult with AYUSH Experts?'
            }
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            {userProfile?.role === 'doctor'
              ? 'Complete your profile and start helping patients today'
              : 'Get started today and connect with qualified practitioners'
            }
          </p>
          {!user ? (
            <Link
              href="/auth/signup"
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg text-lg font-semibold"
            >
              Sign Up Now
            </Link>
          ) : userProfile?.role === 'doctor' ? (
            <Link
              href="/doctor/profile"
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg text-lg font-semibold"
            >
              Complete Profile
            </Link>
          ) : (
            <Link
              href="/doctors"
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg text-lg font-semibold"
            >
              Find Doctors
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}