'use client'

import { useAuth } from '@/contexts/AuthContext'
import Navbar from '@/components/Navbar'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import Link from 'next/link'
import { 
  Search, 
  Shield, 
  Calendar, 
  Video, 
  Heart,
  Users,
  Clock,
  Award,
  Star,
  ArrowRight,
  CheckCircle,
  Leaf,
  Brain,
  Activity
} from 'lucide-react'

export default function Home() {
  const { user, userProfile } = useAuth()

  const features = [
    {
      icon: Search,
      title: 'Smart Search',
      description: 'Find doctors by specialty, location, and availability',
      color: 'primary'
    },
    {
      icon: Shield,
      title: 'Verified Practitioners',
      description: 'All doctors are licensed and background-verified',
      color: 'therapeutic'
    },
    {
      icon: Calendar,
      title: 'Easy Scheduling',
      description: 'Book appointments that fit your schedule',
      color: 'accent'
    },
    {
      icon: Video,
      title: 'Secure Consultations',
      description: 'HIPAA-compliant video calls and messaging',
      color: 'success'
    }
  ]

  const specialties = [
    { icon: Leaf, name: 'Ayurveda', count: '500+ Doctors' },
    { icon: Brain, name: 'Yoga Therapy', count: '300+ Experts' },
    { icon: Heart, name: 'Unani Medicine', count: '200+ Practitioners' },
    { icon: Activity, name: 'Homeopathy', count: '400+ Specialists' },
  ]

  const stats = [
    { label: 'Verified Doctors', value: '1,400+', icon: Users },
    { label: 'Consultations', value: '50,000+', icon: Video },
    { label: 'Patient Rating', value: '4.9/5', icon: Star },
    { label: 'Response Time', value: '<2 min', icon: Clock },
  ]

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-24">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 via-transparent to-accent-500/5" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-200/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent-200/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Hero Content */}
            <div className="text-center lg:text-left animate-fade-in-up">
              <Badge variant="outline" className="mb-6 px-4 py-2">
                🌿 Traditional Medicine, Modern Technology
              </Badge>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-secondary-900 mb-6 leading-tight">
                Connect with 
                <span className="gradient-text"> AYUSH Experts</span>
                <br />
                From Anywhere
              </h1>
              
              <p className="text-xl text-secondary-600 mb-8 leading-relaxed">
                Experience the wisdom of traditional Indian medicine through verified practitioners. 
                Book consultations for Ayurveda, Yoga, Unani, Siddha, and Homeopathy treatments.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                {!user ? (
                  <>
                    <Link href="/auth/signup">
                      <Button variant="primary" size="lg" className="w-full sm:w-auto">
                        <Users className="w-5 h-5" />
                        Get Started Free
                      </Button>
                    </Link>
                    <Link href="/doctors">
                      <Button variant="outline" size="lg" className="w-full sm:w-auto">
                        <Search className="w-5 h-5" />
                        Explore Doctors
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/doctors">
                      <Button variant="primary" size="lg" className="w-full sm:w-auto">
                        <Search className="w-5 h-5" />
                        Find Doctors
                      </Button>
                    </Link>
                    {userProfile?.role === 'doctor' && (
                      <Link href="/doctor/profile">
                        <Button variant="outline" size="lg" className="w-full sm:w-auto">
                          <Award className="w-5 h-5" />
                          Manage Profile
                        </Button>
                      </Link>
                    )}
                  </>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                  <div key={stat.label} className="text-center animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                    <div className="flex items-center justify-center w-12 h-12 bg-primary-100 rounded-xl mb-2 mx-auto">
                      <stat.icon className="w-6 h-6 text-primary-600" />
                    </div>
                    <div className="text-2xl font-bold text-secondary-900">{stat.value}</div>
                    <div className="text-sm text-secondary-600">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero Image/Illustration */}
            <div className="relative animate-fade-in-right">
              <div className="relative bg-gradient-to-br from-primary-500 to-therapeutic-500 rounded-3xl p-8 shadow-2xl">
                <div className="absolute inset-0 bg-white/10 rounded-3xl backdrop-blur-sm" />
                <div className="relative space-y-6">
                  <div className="flex items-center space-x-4 bg-white/20 rounded-2xl p-4 backdrop-blur-sm">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
                      <Heart className="w-6 h-6 text-therapeutic-500" />
                    </div>
                    <div className="text-white">
                      <div className="font-semibold">Dr. Priya Sharma</div>
                      <div className="text-sm opacity-90">Ayurveda Specialist</div>
                    </div>
                    <Badge variant="success" size="sm">Online</Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {['Video Call', 'Chat', 'Prescription', 'Follow-up'].map((feature) => (
                      <div key={feature} className="bg-white/20 rounded-xl p-3 text-center backdrop-blur-sm">
                        <CheckCircle className="w-6 h-6 text-white mx-auto mb-1" />
                        <div className="text-sm text-white font-medium">{feature}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in-up">
            <Badge variant="outline" className="mb-4">How It Works</Badge>
            <h2 className="text-3xl lg:text-4xl font-bold text-secondary-900 mb-6">
              Your Health Journey Simplified
            </h2>
            <p className="text-xl text-secondary-600 max-w-3xl mx-auto">
              From finding the right practitioner to receiving personalized care, 
              we&apos;ve made traditional medicine accessible and convenient.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const colorClasses = {
                primary: 'bg-primary-100 text-primary-600',
                therapeutic: 'bg-therapeutic-100 text-therapeutic-600',
                accent: 'bg-accent-100 text-accent-600',
                warning: 'bg-warning-100 text-warning-600'
              }
              
              return (
                <div key={feature.title} className="animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                  <Card hover className="relative group h-full">
                    <CardContent className="p-8 text-center">
                      <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-200 ${colorClasses[feature.color as keyof typeof colorClasses]}`}>
                        <feature.icon className="w-8 h-8" />
                      </div>
                      <h3 className="text-xl font-semibold text-secondary-900 mb-3">
                        {feature.title}
                      </h3>
                      <p className="text-secondary-600 leading-relaxed">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Specialties Section */}
      <section className="py-24 bg-gradient-to-br from-primary-50 to-therapeutic-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in-up">
            <Badge variant="outline" className="mb-4">Specialties</Badge>
            <h2 className="text-3xl lg:text-4xl font-bold text-secondary-900 mb-6">
              Explore Traditional Medicine
            </h2>
            <p className="text-xl text-secondary-600 max-w-3xl mx-auto">
              Discover the diverse world of AYUSH practitioners, each bringing 
              centuries of wisdom to modern healthcare.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {specialties.map((specialty, index) => (
              <div key={specialty.name} className="animate-fade-in-up cursor-pointer" style={{ animationDelay: `${index * 100}ms` }}>
                <Card hover gradient className="group h-full">
                  <CardContent className="p-6 text-center">
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-primary-100 rounded-2xl mb-4 group-hover:bg-primary-200 transition-colors duration-200">
                      <specialty.icon className="w-7 h-7 text-primary-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-secondary-900 mb-2">
                      {specialty.name}
                    </h3>
                    <p className="text-sm text-secondary-600 mb-4">{specialty.count}</p>
                    <ArrowRight className="w-4 h-4 text-primary-500 mx-auto opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-primary-600 to-accent-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 animate-fade-in-up">
          <div className="mb-8">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
              {userProfile?.role === 'doctor' 
                ? 'Join Our Network of Verified Practitioners'
                : 'Ready to Experience Traditional Healing?'
              }
            </h2>
            <p className="text-xl text-white/90 leading-relaxed">
              {userProfile?.role === 'doctor'
                ? 'Help patients discover the power of traditional medicine. Complete your profile and start making a difference today.'
                : 'Take the first step towards holistic wellness. Connect with qualified AYUSH practitioners who understand your health journey.'
              }
            </p>
          </div>
          
          <div className="space-y-4">
            {!user ? (
              <Link href="/auth/signup">
                <Button variant="secondary" size="xl" className="bg-white text-primary-600 hover:bg-white/90">
                  <Users className="w-5 h-5" />
                  Start Your Journey Today
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            ) : userProfile?.role === 'doctor' ? (
              <Link href="/doctor/profile">
                <Button variant="secondary" size="xl" className="bg-white text-primary-600 hover:bg-white/90">
                  <Award className="w-5 h-5" />
                  Complete Your Profile
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            ) : (
              <Link href="/doctors">
                <Button variant="secondary" size="xl" className="bg-white text-primary-600 hover:bg-white/90">
                  <Search className="w-5 h-5" />
                  Find Your Doctor
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-secondary-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                <Heart className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold">AYUSH ONE</span>
            </div>
            <p className="text-secondary-400 mb-8">
              Bridging traditional wisdom with modern technology for better health outcomes.
            </p>
            <div className="flex justify-center space-x-8 text-sm text-secondary-400">
              <span>© 2025 AYUSH ONE. All rights reserved.</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}