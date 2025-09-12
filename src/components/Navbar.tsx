'use client'

import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { LoadingSpinner } from '@/components/ui/Loading'
import { 
  Heart, 
  User, 
  Calendar, 
  Stethoscope, 
  LogOut, 
  Menu, 
  X,
  ChevronDown,
  Settings
} from 'lucide-react'
import { useState } from 'react'

export default function Navbar() {
  const { user, userProfile, signOut, loading } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)

  const handleSignOut = async () => {
    try {
      console.log('Sign out button clicked')
      await signOut()
      setIsProfileMenuOpen(false)
    } catch (error) {
      console.error('Sign out failed:', error)
      alert('Failed to sign out. Please try again.')
    }
  }

  const navigation = [
    { name: 'Find Doctors', href: '/doctors', icon: Stethoscope },
    ...(user ? [{ name: 'My Appointments', href: '/appointments', icon: Calendar }] : []),
    ...(userProfile?.role === 'doctor' ? [{ name: 'My Profile', href: '/doctor/profile', icon: User }] : []),
  ]

  if (loading) {
    return (
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-secondary-200/50 dark:border-slate-700/50 shadow-soft">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-therapeutic-600 rounded-xl flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold gradient-text">AYUSH ONE</span>
            </div>
            <div className="flex items-center">
              <LoadingSpinner size="sm" className="text-muted-foreground" />
            </div>
          </div>
        </div>
      </nav>
    )
  }

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-secondary-200/50 dark:border-slate-700/50 shadow-soft">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link 
            href="/" 
            className="flex items-center space-x-3 group transition-transform duration-200 hover:scale-105"
          >
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-therapeutic-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/25 group-hover:shadow-xl group-hover:shadow-primary-500/30 transition-all duration-200">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-therapeutic-500 rounded-full animate-pulse" />
            </div>
            <div className="hidden sm:block">
              <span className="text-xl font-bold gradient-text">AYUSH ONE</span>
              <p className="text-xs text-muted-foreground -mt-1">Healthcare Platform</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center space-x-2 px-4 py-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary-50 dark:hover:bg-secondary-800 transition-all duration-200 group"
              >
                <item.icon className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                <span className="font-medium">{item.name}</span>
              </Link>
            ))}
          </div>

          {/* User Menu / Auth Buttons */}
          <div className="flex items-center space-x-4">
            {user && userProfile ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center space-x-3 p-2 rounded-xl bg-secondary-50 dark:bg-secondary-800 hover:bg-secondary-100 dark:hover:bg-secondary-700 transition-all duration-200 group"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center text-white font-medium text-sm">
                    {userProfile.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium text-foreground">{userProfile.name}</p>
                    <div className="flex items-center space-x-2">
                      <Badge variant={userProfile.role === 'doctor' ? 'info' : 'success'} size="sm">
                        {userProfile.role === 'doctor' ? 'Doctor' : 'Patient'}
                      </Badge>
                    </div>
                  </div>
                  <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors duration-200" />
                </button>

                {/* Profile Dropdown */}
                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-card rounded-2xl shadow-large border border-secondary-200/50 dark:border-secondary-700/50 py-2 animate-fade-in-down">
                    <div className="px-4 py-3 border-b border-secondary-100 dark:border-secondary-700">
                      <p className="text-sm font-medium text-foreground">{userProfile.name}</p>
                      <p className="text-xs text-muted-foreground">{userProfile.phone || 'No phone number'}</p>
                    </div>
                    
                    {userProfile.role === 'doctor' && (
                      <Link
                        href="/doctor/profile"
                        className="flex items-center space-x-3 px-4 py-3 text-sm text-muted-foreground hover:bg-secondary-50 dark:hover:bg-secondary-800 transition-colors duration-200"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        <Settings className="w-4 h-4" />
                        <span>Manage Profile</span>
                      </Link>
                    )}
                    
                    <Link
                      href="/appointments"
                      className="flex items-center space-x-3 px-4 py-3 text-sm text-muted-foreground hover:bg-secondary-50 dark:hover:bg-secondary-800 transition-colors duration-200"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <Calendar className="w-4 h-4" />
                      <span>My Appointments</span>
                    </Link>
                    
                    <button
                      onClick={handleSignOut}
                      className="flex items-center space-x-3 px-4 py-3 text-sm text-error-600 dark:text-error-400 hover:bg-error-50 dark:hover:bg-error-950 transition-colors duration-200 w-full text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link href="/auth/signin">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button variant="primary" size="sm">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary-50 dark:hover:bg-secondary-800 transition-all duration-200"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-secondary-200/50 dark:border-secondary-700/50 animate-fade-in-down">
            <div className="space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center space-x-3 px-4 py-3 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary-50 dark:hover:bg-secondary-800 transition-all duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Click outside to close dropdowns */}
      {(isProfileMenuOpen || isMobileMenuOpen) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setIsProfileMenuOpen(false)
            setIsMobileMenuOpen(false)
          }}
        />
      )}
    </nav>
  )
}