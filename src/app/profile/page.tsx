"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { createClientComponentClient } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { User, Mail, Phone, Save } from "lucide-react";
import { User as AppUser } from "@/lib/database.types";

// Form state includes email for display, but it's not in the database
type ProfileFormData = Partial<AppUser> & { email?: string };

export default function ProfilePage() {
  const { user, userProfile, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isNewUser = searchParams.get("new") === "true";
  const supabase = createClientComponentClient();

  const [formData, setFormData] = useState<ProfileFormData>({
    name: "",
    email: "",
    phone: "",
    role: "citizen",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    // Redirect if not authenticated (after auth loading completes)
    if (!authLoading && !user) {
      console.log("No user detected, redirecting to signin");
      router.push("/auth/signin");
      return;
    }

    // Populate form when user is available
    if (user) {
      console.log("User found:", user.email, "Profile loaded:", !!userProfile);

      if (userProfile) {
        // Existing user with profile - populate all fields
        console.log("Loading existing profile data");
        setFormData({
          name: userProfile.name || "",
          email: user.email || "",
          phone: userProfile.phone || "",
          role: userProfile.role || "citizen",
        });
      } else {
        // New OAuth user - profile might not exist yet, pre-fill from Google
        console.log("New user, pre-filling from Google data");
        setFormData({
          name: user.user_metadata?.full_name || user.user_metadata?.name || "",
          email: user.email || "",
          phone: user.user_metadata?.phone || "",
          role: "citizen",
        });
      }
    }
  }, [user, userProfile, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (!user) {
        throw new Error("No user logged in");
      }

      // Prepare profile data (only fields in the schema)
      const profileData = {
        id: user.id,
        name:
          formData.name ||
          user.user_metadata?.full_name ||
          user.email!.split("@")[0],
        role: formData.role || userProfile?.role || "citizen",
        phone: formData.phone || null,
      };

      // Upsert user profile (insert if doesn't exist, update if exists)
      const { error } = await supabase.from("users").upsert(profileData, {
        onConflict: "id",
      });

      if (error) throw error;

      console.log("Profile saved successfully!");

      setMessage({
        type: "success",
        text: "Profile updated successfully!",
      });

      // Trigger a session refresh to reload the profile in AuthContext
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        console.log("Session refreshed, profile should reload automatically");
      }

      // Redirect to home after 2 seconds if new user
      if (isNewUser) {
        setTimeout(() => {
          router.push("/");
        }, 2000);
      } else {
        // For existing users, reload the page to show updated data
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
    } catch (error: unknown) {
      console.error("Error updating profile:", error);
      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Failed to update profile. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Show loading only while auth is loading
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-slate-600 dark:text-slate-400">
            Loading authentication...
          </p>
        </div>
      </div>
    );
  }

  // If no user after auth loads, redirect will happen in useEffect
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-slate-600 dark:text-slate-400">
            Redirecting to sign in...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
            {isNewUser ? "Complete Your " : "Edit Your "}
            <span className="gradient-text">Profile</span>
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300">
            {isNewUser
              ? "Welcome! Please complete your profile information to get started."
              : "Update your personal information and preferences."}
          </p>
        </div>

        {/* Success/Error Messages */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.type === "success"
                ? "bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800"
                : "bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800"
            }`}
          >
            {message.text}
          </div>
        )}

        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Profile Icon */}
              <div className="flex flex-col items-center space-y-4">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <User className="w-12 h-12 text-white" />
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {isNewUser ? "Welcome!" : "Your Profile"}
                </p>
              </div>

              {/* Basic Information - Only schema fields */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="pl-10"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Email (Read-only)
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                      type="email"
                      value={formData.email}
                      disabled
                      className="pl-10 bg-slate-100 dark:bg-slate-800 cursor-not-allowed"
                      placeholder="your@email.com"
                    />
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Email from your Google account
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Phone Number (Optional)
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                      type="tel"
                      value={formData.phone || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className="pl-10"
                      placeholder="+1 234 567 8900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Account Type *
                  </label>
                  <select
                    value={formData.role || "citizen"}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        role: e.target.value as "doctor" | "citizen",
                      })
                    }
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    required
                  >
                    <option value="citizen">Citizen</option>
                    <option value="doctor">Doctor</option>
                  </select>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Choose your account type
                  </p>
                </div>
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  <strong>Note:</strong> Your profile information will be saved
                  securely.
                </p>
                {isNewUser && (
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    Complete your profile to get started with the platform.
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex space-x-4">
                <Button
                  type="submit"
                  variant="primary"
                  disabled={loading}
                  className="flex-1 flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      <span>Save Changes</span>
                    </>
                  )}
                </Button>

                {!isNewUser && (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => router.back()}
                    className="px-6"
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Additional Info for New Users */}
        {isNewUser && (
          <Card className="mt-6">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
                Welcome to Our Platform! 🎉
              </h3>
              <ul className="space-y-2 text-slate-600 dark:text-slate-300">
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">✓</span>
                  Your email has been verified via Google
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">✓</span>
                  Complete your profile to access all features
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">✓</span>
                  You can update your information anytime
                </li>
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
