"use client";

import { useEffect, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Award, MapPin, Route as RouteIcon, X } from "lucide-react";

// Fix for default marker icons in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Custom marker icons
const doctorIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const userIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
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

interface MapViewProps {
  doctors: Doctor[];
  userLocation: { lat: number; lng: number } | null;
  onDoctorSelect?: (doctor: Doctor) => void;
}

// Component to update map center
function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

// Component to display route with details
function RouteDisplay({
  route,
  routeInfo,
  onClear,
  fromLocation,
  toLocation,
}: {
  route: Array<[number, number]> | null;
  routeInfo: RouteInfo | null;
  onClear: () => void;
  fromLocation: { lat: number; lng: number } | null;
  toLocation: { lat: number; lng: number } | null;
}) {
  const [showDirections, setShowDirections] = useState(false);

  if (!route) return null;

  // Generate Google Maps link
  const generateGoogleMapsLink = () => {
    if (!fromLocation || !toLocation) return null;

    const origin = `${fromLocation.lat},${fromLocation.lng}`;
    const destination = `${toLocation.lat},${toLocation.lng}`;
    return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`;
  };

  const openInGoogleMaps = () => {
    const link = generateGoogleMapsLink();
    if (link) {
      window.open(link, "_blank");
    }
  };

  const formatDistance = (meters: number) => {
    if (meters < 1000) {
      return `${Math.round(meters)} m`;
    }
    return `${(meters / 1000).toFixed(2)} km`;
  };

  const formatDuration = (seconds: number) => {
    console.log("🕐 formatDuration called with:", seconds, "seconds");

    if (!seconds || seconds === 0) {
      console.warn("⚠️ Duration is 0 or undefined!");
      return "0 min";
    }

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    console.log("🕐 Formatted:", { hours, minutes });

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes} min`;
  };

  return (
    <>
      <Polyline positions={route} color="#3B82F6" weight={5} opacity={0.8} />

      {/* Route Info Card */}
      <div className="absolute top-4 right-4 z-[1000] bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-sm">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center space-x-2">
            <RouteIcon className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-semibold text-slate-900 dark:text-white">
              Route Details
            </span>
          </div>
          <button
            onClick={onClear}
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            title="Clear route"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Distance & Time */}
        {routeInfo &&
          (() => {
            console.log("📊 Rendering routeInfo:", routeInfo);
            return (
              <div className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                    <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">
                      Distance
                    </div>
                    <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      {formatDistance(routeInfo.distance)}
                    </div>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                    <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">
                      Duration
                    </div>
                    <div className="text-lg font-bold text-green-600 dark:text-green-400">
                      {formatDuration(routeInfo.duration )}
                    </div>
                    {/* Debug info */}
               
                  </div>
                </div>

                {/* Google Maps Button */}
                {fromLocation && toLocation && (
                  <button
                    onClick={openInGoogleMaps}
                    className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-all flex items-center justify-center space-x-2 shadow-md hover:shadow-lg"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                    </svg>
                    <span>Open in Google Maps</span>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </button>
                )}

                {/* Directions Toggle */}
                {routeInfo.steps.length > 0 && (
                  <button
                    onClick={() => setShowDirections(!showDirections)}
                    className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg text-sm font-medium transition-colors"
                  >
                    {showDirections ? "Hide" : "Show"} Directions (
                    {routeInfo.steps.length})
                  </button>
                )}

                {/* Turn-by-turn Directions */}
                {showDirections && routeInfo.steps.length > 0 && (
                  <div className="mt-3 max-h-60 overflow-y-auto space-y-2 border-t border-slate-200 dark:border-slate-700 pt-3">
                    {routeInfo.steps.map((step, index) => (
                      <div
                        key={index}
                        className="flex items-start space-x-3 p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg"
                      >
                        <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-slate-900 dark:text-white">
                            {step.instruction}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            {formatDistance(step.distance)} •{" "}
                            {formatDuration(step.duration)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })()}
      </div>
    </>
  );
}

interface RouteInfo {
  distance: number; // in meters
  duration: number; // in seconds
  steps: Array<{
    instruction: string;
    distance: number;
    duration: number;
  }>;
}

export default function MapView({
  doctors,
  userLocation,
  onDoctorSelect,
}: MapViewProps) {
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [route, setRoute] = useState<Array<[number, number]> | null>(null);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([
    20.5937, 78.9629,
  ]); // India center
  const GEOAPIFY_API_KEY =
    process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY || "YOUR_GEOAPIFY_API_KEY";

  useEffect(() => {
    if (userLocation) {
      setMapCenter([userLocation.lat, userLocation.lng]);
    } else if (doctors.length > 0 && doctors[0].location) {
      setMapCenter([doctors[0].location.lat, doctors[0].location.lng]);
    }
  }, [userLocation, doctors]);

  // Listen for show route events
  useEffect(() => {
    const handleShowRoute = async (event: any) => {
      const { from, to } = event.detail;
      if (from && to) {
        await fetchRoute(from, to);
      }
    };

    window.addEventListener("showRoute", handleShowRoute);
    return () => window.removeEventListener("showRoute", handleShowRoute);
  }, []);

  const fetchRoute = async (
    from: { lat: number; lng: number },
    to: { lat: number; lng: number }
  ) => {
    try {
      const url = `https://api.geoapify.com/v1/routing?waypoints=${from.lat},${from.lng}|${to.lat},${to.lng}&mode=drive&apiKey=${GEOAPIFY_API_KEY}`;

      console.log("🗺️ Fetching route from Geoapify...");
      const response = await fetch(url);

      if (response.ok) {
        const data = await response.json();

        console.log("📦 Full API Response:", data);

        if (data.features && data.features.length > 0) {
          const feature = data.features[0];
          const coordinates = feature.geometry.coordinates[0];
          const properties = feature.properties;

          console.log("📋 Properties object:", properties);
          console.log("⏱️ Time value:", properties.time);
          console.log("📏 Distance value:", properties.distance);

          // Convert from [lng, lat] to [lat, lng] for Leaflet
          const routePoints: Array<[number, number]> = coordinates.map(
            (coord: number[]) => [coord[1], coord[0]]
          );

          // Extract route details
          const distance = properties.distance || 0; // in meters

          // ⚠️ IMPORTANT: Geoapify returns time in SECONDS (not milliseconds!)
          const timeValue = properties.time || properties.duration || 0;
          const duration = timeValue; // Already in seconds, no conversion needed!

          console.log("🔍 Extracted route data:", {
            rawTime: properties.time,
            timeInSeconds: timeValue,
            durationSeconds: duration,
            durationMinutes: Math.round(duration / 60),
            distanceMeters: distance,
            distanceKm: (distance / 1000).toFixed(2),
          });

          // Extract turn-by-turn directions
          const steps = properties.legs?.[0]?.steps || [];
          const directions = steps.map((step: any) => ({
            instruction: step.instruction?.text || "Continue",
            distance: step.distance || 0,
            duration: step.time || 0, // Already in seconds!
          }));

          console.log("✅ Route fetched:", {
            distance: `${(distance / 1000).toFixed(2)} km`,
            duration: `${Math.round(duration / 60)} min (${duration}s)`,
            steps: directions.length,
          });

          setRoute(routePoints);
          setRouteInfo({
            distance,
            duration, // Already converted to seconds above
            steps: directions,
          });
        }
      } else {
        console.error("Failed to fetch route from Geoapify");
        // Fallback to straight line if API fails
        const straightLineDistance = calculateDistance(from, to);
        setRoute([
          [from.lat, from.lng],
          [to.lat, to.lng],
        ]);
        setRouteInfo({
          distance: straightLineDistance,
          duration: (straightLineDistance / 1000) * 120, // Rough estimate: 30 km/h average
          steps: [
            {
              instruction: "Head straight to destination",
              distance: straightLineDistance,
              duration: (straightLineDistance / 1000) * 120,
            },
          ],
        });
      }
    } catch (error) {
      console.error("Error fetching route:", error);
      // Fallback to straight line
      const straightLineDistance = calculateDistance(from, to);
      setRoute([
        [from.lat, from.lng],
        [to.lat, to.lng],
      ]);
      setRouteInfo({
        distance: straightLineDistance,
        duration: (straightLineDistance / 1000) * 120,
        steps: [
          {
            instruction: "Head straight to destination (offline mode)",
            distance: straightLineDistance,
            duration: (straightLineDistance / 1000) * 120,
          },
        ],
      });
    }
  };

  // Calculate straight-line distance using Haversine formula
  const calculateDistance = (
    from: { lat: number; lng: number },
    to: { lat: number; lng: number }
  ): number => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (from.lat * Math.PI) / 180;
    const φ2 = (to.lat * Math.PI) / 180;
    const Δφ = ((to.lat - from.lat) * Math.PI) / 180;
    const Δλ = ((to.lng - from.lng) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  };

  const handleDoctorClick = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    if (onDoctorSelect) {
      onDoctorSelect(doctor);
    }
  };

  const handleShowRoute = async (doctor: Doctor) => {
    if (userLocation && doctor.location) {
      await fetchRoute(userLocation, doctor.location);
    }
  };

  const clearRoute = () => {
    setRoute(null);
    setRouteInfo(null);
  };

  return (
    <div className="relative h-[600px] rounded-xl overflow-hidden">
      <MapContainer
        center={mapCenter}
        zoom={userLocation ? 13 : 6}
        className="h-full w-full"
        scrollWheelZoom={true}
      >
        <MapUpdater center={mapCenter} />

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* User location marker */}
        {userLocation && (
          <Marker
            position={[userLocation.lat, userLocation.lng]}
            icon={userIcon}
          >
            <Popup>
              <div className="text-center">
                <strong>You are here</strong>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Doctor markers */}
        {doctors.map((doctor) => {
          if (!doctor.location) return null;

          return (
            <Marker
              key={doctor.id}
              position={[doctor.location.lat, doctor.location.lng]}
              icon={doctorIcon}
              eventHandlers={{
                click: () => handleDoctorClick(doctor),
              }}
            >
              <Popup>
                <div className="min-w-[200px]">
                  <h3 className="font-bold text-base mb-2">
                    {doctor.user?.name || "Doctor"}
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-slate-600">
                      <Award className="w-3 h-3 mr-1" />
                      {doctor.specialty}
                    </div>
                    <div className="flex items-center text-slate-600">
                      <MapPin className="w-3 h-3 mr-1" />
                      {doctor.city}
                    </div>
                    {doctor.verified_badge && (
                      <Badge variant="outline" className="text-xs">
                        ✓ Verified
                      </Badge>
                    )}
                  </div>
                  {userLocation && (
                    <Button
                      variant="primary"
                      size="sm"
                      className="w-full mt-3"
                      onClick={() => handleShowRoute(doctor)}
                    >
                      <RouteIcon className="w-3 h-3 mr-1" />
                      Show Route
                    </Button>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Route display */}
        <RouteDisplay
          route={route}
          routeInfo={routeInfo}
          onClear={clearRoute}
          fromLocation={userLocation}
          toLocation={selectedDoctor?.location || null}
        />
      </MapContainer>
    </div>
  );
}
