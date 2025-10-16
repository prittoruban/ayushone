"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import {
  Mail,
  Lock,
  User,
  Phone,
  ArrowRight,
  Heart,
  Shield,
  CheckCircle,
  Leaf,
  UserCheck,
  Stethoscope,
} from "lucide-react";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<"doctor" | "citizen">("citizen");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  const { signUp, signInWithGoogle } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { error } = await signUp(email, password, { name, role, phone });

      if (error) {
        setError(
          typeof error === "string" ? error : "Failed to create account"
        );
      } else {
        // Redirect based on role
        if (role === "doctor") {
          router.push("/doctor/profile");
        } else {
          router.push("/doctors");
        }
      }
    } catch (error) {
      console.error("Signup error:", error);
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setGoogleLoading(true);
    setError("");

    try {
      // Store the selected role in sessionStorage so we can use it after OAuth callback
      sessionStorage.setItem("pendingRole", role);

      const { error } = await signInWithGoogle();

      if (error) {
        setError(
          typeof error === "string" ? error : "Failed to sign up with Google"
        );
        setGoogleLoading(false);
      }
      // Don't set loading to false here as user will be redirected
    } catch (error) {
      console.error("Google signup error:", error);
      setError("An unexpected error occurred");
      setGoogleLoading(false);
    }
  };

  const benefits = [
    "Join 50,000+ users trusting traditional medicine",
    "Connect with 1,400+ verified practitioners",
    "Access to holistic wellness treatments",
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-72 h-72 bg-accent-200/20 dark:bg-accent-400/10 rounded-full blur-3xl animate-float" />
        <div
          className="absolute bottom-20 left-10 w-96 h-96 bg-primary-200/20 dark:bg-primary-400/10 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "1s" }}
        />
      </div>

      <div className="relative flex items-center justify-center min-h-[calc(100vh-4rem)] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Left side - Info */}
            <div className="hidden lg:block animate-fade-in-left">
              <div className="text-center lg:text-left">
                <Badge variant="outline" className="mb-6 px-4 py-2">
                  <Leaf className="w-4 h-4 mr-2" />
                  Join Our Community
                </Badge>

                <h1 className="text-4xl lg:text-5xl font-bold text-secondary-900 mb-6 leading-tight">
                  Start Your
                  <span className="gradient-text"> Wellness Journey</span>
                </h1>

                <p className="text-xl text-secondary-600 mb-8 leading-relaxed">
                  Create your account to access verified AYUSH practitioners,
                  book consultations, and experience the power of traditional
                  medicine.
                </p>

                <div className="space-y-4 mb-8">
                  {benefits.map((benefit, index) => (
                    <div
                      key={benefit}
                      className="flex items-center space-x-3 animate-fade-in-up"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="flex-shrink-0 w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-primary-600" />
                      </div>
                      <span className="text-secondary-700">{benefit}</span>
                    </div>
                  ))}
                </div>

                {/* Role highlight */}
                <div className="grid grid-cols-2 gap-4 p-6 bg-gradient-to-r from-primary-50 to-accent-50 rounded-2xl">
                  <div className="text-center">
                    <UserCheck className="w-10 h-10 text-primary-600 mx-auto mb-3" />
                    <div className="text-sm font-semibold text-secondary-900">
                      For Patients
                    </div>
                    <div className="text-xs text-secondary-600">
                      Find & consult practitioners
                    </div>
                  </div>
                  <div className="text-center">
                    <Stethoscope className="w-10 h-10 text-accent-600 mx-auto mb-3" />
                    <div className="text-sm font-semibold text-secondary-900">
                      For Doctors
                    </div>
                    <div className="text-xs text-secondary-600">
                      Join our network
                    </div>
                  </div>
                </div>

                {/* Trust indicators */}
                <div className="grid grid-cols-3 gap-6 pt-8 mt-8 border-t border-secondary-200">
                  <div className="text-center">
                    <Shield className="w-8 h-8 text-primary-600 mx-auto mb-2" />
                    <div className="text-sm font-medium text-secondary-900">
                      Secure
                    </div>
                    <div className="text-xs text-secondary-600">
                      Data Protected
                    </div>
                  </div>
                  <div className="text-center">
                    <Heart className="w-8 h-8 text-accent-600 mx-auto mb-2" />
                    <div className="text-sm font-medium text-secondary-900">
                      Trusted
                    </div>
                    <div className="text-xs text-secondary-600">
                      4.9/5 Rating
                    </div>
                  </div>
                  <div className="text-center">
                    <CheckCircle className="w-8 h-8 text-success-600 mx-auto mb-2" />
                    <div className="text-sm font-medium text-secondary-900">
                      Verified
                    </div>
                    <div className="text-xs text-secondary-600">
                      Licensed Only
                    </div>
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
                    <h2 className="text-2xl font-bold text-secondary-900 mb-2">
                      Create Account
                    </h2>
                    <p className="text-secondary-600">
                      Join AYUSH ONE community
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl animate-fade-in">
                        {error}
                      </div>
                    )}

                    <div className="space-y-4">
                      <div>
                        <label
                          htmlFor="name"
                          className="block text-sm font-medium text-secondary-700 mb-2"
                        >
                          Full Name
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-5 h-5" />
                          <Input
                            id="name"
                            name="name"
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="pl-10"
                            placeholder="Enter your full name"
                          />
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor="email"
                          className="block text-sm font-medium text-secondary-700 mb-2"
                        >
                          Email Address
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-5 h-5" />
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="pl-10"
                            placeholder="Enter your email address"
                          />
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor="phone"
                          className="block text-sm font-medium text-secondary-700 mb-2"
                        >
                          Phone Number{" "}
                          <span className="text-secondary-400">(Optional)</span>
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-5 h-5" />
                          <Input
                            id="phone"
                            name="phone"
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="pl-10"
                            placeholder="Enter your phone number"
                          />
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor="password"
                          className="block text-sm font-medium text-secondary-700 mb-2"
                        >
                          Password
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-5 h-5" />
                          <Input
                            id="password"
                            name="password"
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="pl-10"
                            placeholder="Choose a strong password"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-3">
                          I am a:
                        </label>
                        <div className="grid grid-cols-1 gap-3">
                          <label
                            className={`relative flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                              role === "citizen"
                                ? "border-primary-500 bg-primary-50"
                                : "border-secondary-200 hover:border-secondary-300"
                            }`}
                          >
                            <input
                              type="radio"
                              name="role"
                              value="citizen"
                              checked={role === "citizen"}
                              onChange={(e) =>
                                setRole(e.target.value as "citizen")
                              }
                              className="sr-only"
                            />
                            <div className="flex items-center space-x-3">
                              <div
                                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                  role === "citizen"
                                    ? "bg-primary-100"
                                    : "bg-secondary-100"
                                }`}
                              >
                                <UserCheck
                                  className={`w-5 h-5 ${
                                    role === "citizen"
                                      ? "text-primary-600"
                                      : "text-secondary-400"
                                  }`}
                                />
                              </div>
                              <div>
                                <div className="font-medium text-secondary-900">
                                  Patient/Citizen
                                </div>
                                <div className="text-sm text-secondary-600">
                                  Looking for treatment
                                </div>
                              </div>
                            </div>
                            {role === "citizen" && (
                              <CheckCircle className="absolute right-4 w-6 h-6 text-primary-600" />
                            )}
                          </label>

                          <label
                            className={`relative flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                              role === "doctor"
                                ? "border-primary-500 bg-primary-50"
                                : "border-secondary-200 hover:border-secondary-300"
                            }`}
                          >
                            <input
                              type="radio"
                              name="role"
                              value="doctor"
                              checked={role === "doctor"}
                              onChange={(e) =>
                                setRole(e.target.value as "doctor")
                              }
                              className="sr-only"
                            />
                            <div className="flex items-center space-x-3">
                              <div
                                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                  role === "doctor"
                                    ? "bg-primary-100"
                                    : "bg-secondary-100"
                                }`}
                              >
                                <Stethoscope
                                  className={`w-5 h-5 ${
                                    role === "doctor"
                                      ? "text-primary-600"
                                      : "text-secondary-400"
                                  }`}
                                />
                              </div>
                              <div>
                                <div className="font-medium text-secondary-900">
                                  AYUSH Doctor
                                </div>
                                <div className="text-sm text-secondary-600">
                                  Join our network
                                </div>
                              </div>
                            </div>
                            {role === "doctor" && (
                              <CheckCircle className="absolute right-4 w-6 h-6 text-primary-600" />
                            )}
                          </label>
                        </div>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      disabled={loading || googleLoading}
                      className="w-full"
                    >
                      {loading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Creating Account...
                        </>
                      ) : (
                        <>
                          Create Account
                          <ArrowRight className="w-5 h-5 ml-2" />
                        </>
                      )}
                    </Button>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-secondary-200 dark:border-secondary-700"></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-4 bg-white dark:bg-slate-800 text-muted-foreground">
                          Or continue with
                        </span>
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="secondary"
                      size="lg"
                      onClick={handleGoogleSignUp}
                      disabled={loading || googleLoading}
                      className="w-full border-2 border-secondary-200 dark:border-secondary-700 hover:bg-secondary-100 dark:hover:bg-secondary-800"
                    >
                      {googleLoading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mr-2" />
                          Connecting to Google...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                            <path
                              fill="#4285F4"
                              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                              fill="#34A853"
                              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                              fill="#FBBC05"
                              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            />
                            <path
                              fill="#EA4335"
                              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                          </svg>
                          Continue with Google
                        </>
                      )}
                    </Button>

                    <div className="text-center pt-4 border-t border-secondary-200">
                      <p className="text-sm text-secondary-600">
                        Already have an account?{" "}
                        <Link
                          href="/auth/signin"
                          className="font-medium text-primary-600 hover:text-primary-500 transition-colors duration-200"
                        >
                          Sign in
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
  );
}
