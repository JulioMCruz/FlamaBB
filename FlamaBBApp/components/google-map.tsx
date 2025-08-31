"use client"

import { useEffect, useRef, useState } from "react"
import { MapPin } from "lucide-react"
import { loadGoogleMaps } from "@/lib/google-maps-loader"

interface GoogleMapProps {
  address: string
  city: string
  country: string
  venue: string
}

declare global {
  interface Window {
    google: any
  }
}

export function GoogleMap({ address, city, country, venue }: GoogleMapProps) {
  console.log('🗺️ GoogleMap component rendered with props:', { address, city, country, venue })
  
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<any>(null)
  const [marker, setMarker] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    console.log('🗺️ GoogleMap useEffect triggered')
    // Use shared loader to prevent multiple script loads
    loadGoogleMaps()
      .then(() => {
        console.log('🗺️ GoogleMap: Google Maps loaded successfully')
        setIsLoading(false)
        initializeMap()
      })
      .catch((error) => {
        console.error('🗺️ GoogleMap: Failed to load Google Maps:', error)
        setError(error.message)
        setIsLoading(false)
      })
  }, [])

  const initializeMap = () => {
    if (!mapRef.current || !window.google) return

    const defaultLocation = { lat: 39.8283, lng: -98.5795 } // Center of US
    
    const newMap = new window.google.maps.Map(mapRef.current, {
      center: defaultLocation,
      zoom: 10,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      zoomControl: true,
      styles: [
        {
          featureType: "poi",
          elementType: "labels",
          stylers: [{ visibility: "off" }]
        }
      ]
    })

    setMap(newMap)
  }

  useEffect(() => {
    if (!map || !address || !city) return

    const geocoder = new window.google.maps.Geocoder()
    const fullAddress = country ? `${address}, ${city}, ${country}` : `${address}, ${city}`

    geocoder.geocode({ address: fullAddress }, (results: any, status: any) => {
      if (status === "OK" && results[0]) {
        const location = results[0].geometry.location

        // Remove existing marker
        if (marker) {
          marker.setMap(null)
        }

        // Add new marker
        const newMarker = new window.google.maps.Marker({
          position: location,
          map: map,
          title: venue || "Experience Location"
        })

        setMarker(newMarker)

        // Center map on the location
        map.setCenter(location)
        map.setZoom(15)

        // Add info window
        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="padding: 8px; max-width: 200px;">
              <div style="font-weight: bold; margin-bottom: 4px;">${venue || "Experience Location"}</div>
              <div style="font-size: 12px; color: #666;">${address}</div>
              <div style="font-size: 12px; color: #666;">${city}</div>
            </div>
          `
        })

        newMarker.addListener("click", () => {
          infoWindow.open(map, newMarker)
        })
      } else {
        // Try alternative address formats
        const alternativeAddresses = [
          `${venue}, ${city}, ${country}`,
          `${city}, ${country}`,
          `${address}`,
          `${city}`
        ]
        
        let attempts = 0
        const maxAttempts = alternativeAddresses.length
        
        const tryNextAddress = () => {
          if (attempts >= maxAttempts) {
            setError("Could not find the address on the map. Try adding more details like street number and neighborhood.")
            return
          }
          
          const altAddress = alternativeAddresses[attempts]
          
          geocoder.geocode({ address: altAddress }, (altResults: any, altStatus: any) => {
            if (altStatus === "OK" && altResults[0]) {
              const location = altResults[0].geometry.location
              
              // Remove existing marker
              if (marker) {
                marker.setMap(null)
              }
              
              // Add new marker
              const newMarker = new window.google.maps.Marker({
                position: location,
                map: map,
                title: venue || "Experience Location"
              })
              
              setMarker(newMarker)
              map.setCenter(location)
              map.setZoom(15)
              
              const infoWindow = new window.google.maps.InfoWindow({
                content: `
                  <div style="padding: 8px; max-width: 200px;">
                    <div style="font-weight: bold; margin-bottom: 4px;">${venue || "Experience Location"}</div>
                    <div style="font-size: 12px; color: #666;">${address}</div>
                    <div style="font-size: 12px; color: #666;">${city}</div>
                  </div>
                `
              })
              
              newMarker.addListener("click", () => {
                infoWindow.open(map, newMarker)
              })
            } else {
              attempts++
              tryNextAddress()
            }
          })
        }
        
        tryNextAddress()
      }
    })
  }, [map, address, city, country, venue, marker])

  if (isLoading) {
    return (
      <div className="h-32 bg-gray-100 rounded-2xl flex items-center justify-center">
        <div className="text-gray-500">Loading map...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-32 bg-gray-100 rounded-2xl flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-500 text-sm mb-1">📍 {venue || "Location"}</div>
          <div className="text-gray-400 text-xs">{address}</div>
          <div className="text-gray-400 text-xs mt-1">{city}</div>
          <div className="text-blue-400 text-xs mt-2">{error}</div>
        </div>
      </div>
    )
  }

  if (!address && !city) {
    return (
      <div className="h-32 bg-gray-100 rounded-2xl flex items-center justify-center">
        <div className="text-gray-400">
          Select a country, city, and enter address
        </div>
      </div>
    )
  }

  if (!address) {
    return (
      <div className="h-32 bg-gray-100 rounded-2xl flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-500 text-sm mb-1">📍 {venue || "Location"}</div>
          <div className="text-gray-400 text-xs">{city}</div>
          <div className="text-gray-400 text-xs mt-1">Enter street address to see map</div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-32 bg-gray-100 rounded-2xl relative overflow-hidden">
      <div ref={mapRef} className="w-full h-full" />
      <div className="absolute top-2 left-2 bg-white px-2 py-1 rounded text-xs text-gray-600 shadow">
        📍 {venue || "Location"}
      </div>
    </div>
  )
}
