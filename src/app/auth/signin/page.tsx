'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { 
  Mail, 
  Lock, 
  ArrowRight, 
  Heart, 
  Shield, 
  CheckCircle,
  Leaf
} from 'lucide-react'

export default function SignInPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const { signIn } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { error } = await signIn(email, password)
      
      if (error) {
        setError(typeof error === 'string' ? error : 'Failed to sign in')
      } else {
        router.push('/')
      }
    } catch (error) {
      console.error('Signin error:', error)
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const benefits = [
    'Connect with verified AYUSH practitioners',
    'Secure and confidential consultations',
    'Access to traditional medicine wisdom'
  ]

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-200/20 dark:bg-primary-400/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent-200/20 dark:bg-accent-400/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      </div>
      
      <div className="relative flex items-center justify-center min-h-[calc(100vh-4rem)] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            
            {/* Left side - Info */}
            <div className="hidden lg:block animate-fade-in-left">
              <div className="text-center lg:text-left">
                <Badge variant="outline" className="mb-6 px-4 py-2">
                  <Leaf className="w-4 h-4 mr-2" />
                  Welcome Back
                </Badge>
                
                <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-6 leading-tight">
                  Continue Your 
                  <span className="gradient-text"> Wellness Journey</span>
                </h1>
                
                <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                  Sign in to access your appointments, consult with verified AYUSH practitioners, 
                  and manage your health journey with traditional medicine.
                </p>
                
                <div className="space-y-4 mb-8">
                  {benefits.map((benefit, index) => (
                    <div 
                      key={benefit} 
                      className="flex items-center space-x-3 animate-fade-in-up"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="flex-shrink-0 w-6 h-6 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                      </div>
                      <span className="text-muted-foreground">{benefit}</span>
                    </div>
                  ))}
                </div>

                {/* Trust indicators */}
                <div className="grid grid-cols-3 gap-6 pt-8 border-t border-secondary-200 dark:border-secondary-700">
                  <div className="text-center">
                    <Shield className="w-8 h-8 text-primary-600 dark:text-primary-400 mx-auto mb-2" />
                    <div className="text-sm font-medium text-foreground">Secure</div>
                    <div className="text-xs text-muted-foreground">HIPAA Compliant</div>
                  </div>
                  <div className="text-center">
                    <Heart className="w-8 h-8 text-accent-600 dark:text-accent-400 mx-auto mb-2" />
                    <div className="text-sm font-medium text-foreground">Trusted</div>
                    <div className="text-xs text-muted-foreground">1,400+ Doctors</div>
                  </div>
                  <div className="text-center">
                    <CheckCircle className="w-8 h-8 text-success-600 dark:text-success-400 mx-auto mb-2" />
                    <div className="text-sm font-medium text-foreground">Verified</div>
                    <div className="text-xs text-muted-foreground">Licensed Only</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right side - Form */}
            <div className="animate-fade-in-right">
              <Card className="max-w-md mx-auto glass-card">
                <CardContent className="p-8">
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl mb-4">
                      <Heart className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-foreground mb-2">
                      Welcome Back
                    </h2>
                    <p className="text-muted-foreground">
                      Sign in to your AYUSH ONE account
                    </p>
                  </div>
                  
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                      <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl animate-fade-in">
                        {error}
                      </div>
                    )}
                    
                    <div className="space-y-4">
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        label="Email Address"
                        icon={<Mail className="w-5 h-5" />}
                        placeholder="Enter your email address"
                      />
                      
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        label="Password"
                        icon={<Lock className="w-5 h-5" />}
                        placeholder="Enter your password"
                      />
                    </div>

                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      disabled={loading}
                      className="w-full"
                    >
                      {loading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Signing In...
                        </>
                      ) : (
                        <>
                          Sign In
                          <ArrowRight className="w-5 h-5 ml-2" />
                        </>
                      )}
                    </Button>
                    
                    <div className="text-center pt-4 border-t border-secondary-200 dark:border-secondary-700">
                      <p className="text-sm text-muted-foreground">
                        Don&apos;t have an account?{' '}
                        <Link 
                          href="/auth/signup" 
                          className="font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300 transition-colors duration-200"
                        >
                          Create account
                        </Link>
                      </p>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}