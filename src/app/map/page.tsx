"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { LoadingSpinner } from "@/components/ui/Loading";
import {
  MapPin,
  Navigation,
  Route as RouteIcon,
  User,
  Award,
  Calendar,
  Languages,
  Phone,
  X,
} from "lucide-react";

// Dynamically import the map component to avoid SSR issues
const MapView = dynamic(() => import("../../components/MapView"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[600px] bg-slate-100 dark:bg-slate-800 rounded-xl">
      <LoadingSpinner />
    </div>
  ),
});

interface Doctor {
  id: string;
  specialty: string;
  city: string;
  experience_years: number;
  languages: string[];
  location?: { lat: number; lng: number };
  verified_badge: boolean;
  user?: {
    id: string;
    name: string;
    role: string;
    phone: string;
  } | null;
}

export default function MapPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchDoctors();
    // Only get location once on mount
    if (!userLocation && !locationLoading) {
      getUserLocation();
    }
  }, []);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/doctors");
      if (response.ok) {
        const data = await response.json();
        // Filter only doctors with location data
        const doctorsWithLocation = data.filter((doc: Doctor) => doc.location);
        setDoctors(doctorsWithLocation);
      } else {
        console.error("Failed to fetch doctors");
      }
    } catch (error) {
      console.error("Error fetching doctors:", error);
    } finally {
      setLoading(false);
    }
  };

  const getUserLocation = () => {
    // Prevent multiple simultaneous requests
    if (locationLoading) {
      console.log("⏳ Location request already in progress...");
      return;
    }

    if (!navigator.geolocation) {
      console.error("❌ Geolocation is not supported by this browser");
      alert(
        "Geolocation is not supported by your browser. Please use a modern browser like Chrome, Firefox, or Safari."
      );
      return;
    }

    setLocationLoading(true);
    console.log("🔍 Requesting GPS location..."); // Debug

    // Options for high accuracy location
    const options = {
      enableHighAccuracy: true, // Force GPS usage instead of WiFi/IP
      timeout: 10000, // 10 seconds timeout
      maximumAge: 5000, // Use cache up to 5 seconds old (reduces repeated requests)
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        console.log("✅ Location captured:", newLocation);
        console.log("📊 Accuracy:", position.coords.accuracy, "meters");
        console.log(
          "⏰ Timestamp:",
          new Date(position.timestamp).toLocaleTimeString()
        );

        // Only warn if accuracy is very poor, but still use the location
        if (position.coords.accuracy > 200) {
          console.warn(
            `⚠️ Low accuracy (${position.coords.accuracy}m). For better results, move to an open area.`
          );
        }

        setUserLocation(newLocation);
        setLocationLoading(false);
      },
      (error) => {
        console.error("❌ Geolocation error:", error);
        console.error("Error code:", error.code);
        console.error("Error message:", error.message);

        let errorMessage = "Failed to get your location. ";

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage +=
              "Please enable location permissions in your browser settings.";
            console.log(
              "💡 Tip: Click the lock icon in address bar → Site Settings → Location → Allow"
            );
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage +=
              "Location information is unavailable. Make sure GPS/Location Services are enabled on your device.";
            console.log(
              "💡 Tip: Check device settings → Location Services → On"
            );
            break;
          case error.TIMEOUT:
            errorMessage +=
              "Location request timed out. Trying with network location...";
            console.log(
              "💡 Tip: Go outdoors or near a window for better GPS signal"
            );

            // Fallback: Try again with lower accuracy for faster response
            navigator.geolocation.getCurrentPosition(
              (position) => {
                setUserLocation({
                  lat: position.coords.latitude,
                  lng: position.coords.longitude,
                });
                setLocationLoading(false);
                console.log("✅ Location captured (network-based)");
              },
              (err) => {
                console.error("❌ Network location also failed:", err);
                alert(
                  "Could not determine your location. Please try again later."
                );
                setLocationLoading(false);
              },
              { enableHighAccuracy: false, timeout: 5000, maximumAge: 10000 }
            );
            return; // Don't show alert yet, wait for fallback
          default:
            errorMessage += "An unknown error occurred.";
        }

        alert(errorMessage);
        setLocationLoading(false);
      },
      options
    );
  };

  const handleCenterMap = () => {
    getUserLocation();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
                Find Doctors
                <span className="gradient-text"> Near You</span>
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-300">
                Discover verified doctors on the map and get directions
              </p>
            </div>
            <Button
              variant="primary"
              onClick={handleCenterMap}
              className="flex items-center space-x-2"
            >
              <Navigation className="w-5 h-5" />
              <span>My Location</span>
            </Button>
          </div>

          {/* Stats */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">
                      {doctors.length}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      Doctors on Map
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                    <Navigation className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">
                      {userLocation ? "Enabled" : "Disabled"}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      Your Location
                      {userLocation && (
                        <div className="text-xs mt-1 font-mono">
                          {userLocation.lat.toFixed(6)},{" "}
                          {userLocation.lng.toFixed(6)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                    <RouteIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">
                      Ready
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      Route Planning
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Map */}
        <Card>
          <CardContent className="p-6">
            {loading ? (
              <div className="flex items-center justify-center h-[600px]">
                <LoadingSpinner />
              </div>
            ) : (
              <MapView
                doctors={doctors}
                userLocation={userLocation}
                onDoctorSelect={setSelectedDoctor}
              />
            )}
          </CardContent>
        </Card>

        {/* Selected Doctor Info - Mobile Drawer */}
        {selectedDoctor && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setSelectedDoctor(null)}
            />
            <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-slate-800 rounded-t-2xl p-6 max-h-[80vh] overflow-y-auto">
              <button
                onClick={() => setSelectedDoctor(null)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <X className="w-5 h-5" />
              </button>

              <DoctorInfo doctor={selectedDoctor} userLocation={userLocation} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function DoctorInfo({
  doctor,
  userLocation,
}: {
  doctor: Doctor;
  userLocation: { lat: number; lng: number } | null;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
            {doctor.user?.name || "Doctor"}
          </h3>
          <div className="flex items-center space-x-2">
            <Badge variant="outline">
              <Award className="w-3 h-3 mr-1" />
              {doctor.specialty}
            </Badge>
            {doctor.verified_badge && (
              <Badge variant="outline" className="text-green-600">
                ✓ Verified
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-3 text-sm">
        <div className="flex items-center text-slate-600 dark:text-slate-400">
          <MapPin className="w-4 h-4 mr-2" />
          {doctor.city}
        </div>

        <div className="flex items-center text-slate-600 dark:text-slate-400">
          <Calendar className="w-4 h-4 mr-2" />
          {doctor.experience_years} years experience
        </div>

        {doctor.languages && doctor.languages.length > 0 && (
          <div className="flex items-start text-slate-600 dark:text-slate-400">
            <Languages className="w-4 h-4 mr-2 mt-0.5" />
            <div className="flex flex-wrap gap-1">
              {doctor.languages.map((lang) => (
                <span
                  key={lang}
                  className="text-xs bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded"
                >
                  {lang}
                </span>
              ))}
            </div>
          </div>
        )}

        {doctor.user?.phone && (
          <div className="flex items-center text-slate-600 dark:text-slate-400">
            <Phone className="w-4 h-4 mr-2" />
            {doctor.user.phone}
          </div>
        )}
      </div>

      {userLocation && doctor.location && (
        <Button
          variant="primary"
          className="w-full"
          onClick={() => {
            // This will be handled by the MapView component
            const event = new CustomEvent("showRoute", {
              detail: {
                from: userLocation,
                to: doctor.location,
              },
            });
            window.dispatchEvent(event);
          }}
        >
          <RouteIcon className="w-4 h-4 mr-2" />
          Show Route
        </Button>
      )}
    </div>
  );
}
