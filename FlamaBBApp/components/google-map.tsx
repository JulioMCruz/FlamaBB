"use client"

import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { MapPin } from "lucide-react"
import { loadGoogleMaps, isGoogleMapsLoaded } from "@/lib/google-maps-loader"

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
  const mapRef = useRef<HTMLDivElement>(null)
  const lastGeocodedAddress = useRef<string>("")
  const [map, setMap] = useState<any>(null)
  const [marker, setMarker] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    console.log('🗺️ GoogleMap component: Starting Google Maps load...')
    
    // Use shared loader to prevent multiple script loads
    loadGoogleMaps()
      .then(() => {
        console.log('🗺️ GoogleMap component: Google Maps loaded successfully')
        setIsLoading(false)
        // Wait a bit for DOM to be ready
        setTimeout(() => {
          initializeMap()
        }, 50)
      })
      .catch((error) => {
        console.error('🗺️ GoogleMap component: Failed to load Google Maps:', error)
        setError(error.message)
        setIsLoading(false)
      })
  }, [])

  // Use useLayoutEffect to ensure DOM is ready before initializing map
  useLayoutEffect(() => {
    if (mapRef.current && !map && !isLoading && !error && window.google && window.google.maps) {
      console.log('🗺️ Map ref available (useLayoutEffect), initializing map...')
      initializeMap()
    }
  }, [map, isLoading, error])

    const initializeMap = () => {
    // Prevent multiple initialization attempts
    if (map) {
      console.log('🗺️ Map already initialized, skipping...')
      return
    }

    console.log('🗺️ Initializing map:', {
      hasMapRef: !!mapRef.current,
      hasGoogle: !!window.google,
      hasGoogleMaps: !!(window.google && window.google.maps),
      mapRefElement: mapRef.current
    })
    
    if (!mapRef.current) {
      console.log('🗺️ Map ref not available, retrying in 200ms...')
      // retry after a longer delay to ensure DOM is fully rendered
      setTimeout(() => {
        if (mapRef.current && !map) {
          console.log('🗺️ Map ref now available, initializing...')
          initializeMap()
        } else {
          console.error('🗺️ Map ref still not available after retry')
          // Try one more time with an even longer delay
          setTimeout(() => {
            if (mapRef.current && !map) {
              console.log('🗺️ Map ref available on second retry, initializing...')
              initializeMap()
            } else {
              console.error('🗺️ Map ref failed to become available')
            }
          }, 500)
        }
      }, 200)
      return
    }
    
    if (!window.google || !window.google.maps) {
      console.error('🗺️ Google Maps not available')
      return
    }

    try {
      // Default to Buenos Aires if no city selected
      const defaultLocation = { lat: -34.6118, lng: -58.3960 } // Buenos Aires coordinates
      
      console.log('🗺️ Creating Google Maps instance...')
      
      const newMap = new window.google.maps.Map(mapRef.current, {
        center: defaultLocation,
        zoom: 13,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        disableDefaultUI: true,
        zoomControl: true,
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }]
          }
        ]
      })

      console.log('🗺️ Google Maps instance created:', newMap)
      setMap(newMap)
      console.log('🗺️ Map initialized successfully')
    } catch (error: any) {
      console.error('🗺️ Error initializing map:', error)
      console.error('🗺️ Error details:', {
        message: error?.message || 'Unknown error',
        stack: error?.stack,
        googleAvailable: !!window.google,
        mapsAvailable: !!(window.google && window.google.maps)
      })
      setError(`Map initialization failed: ${error?.message || 'Unknown error'}`)
    }
}

  useEffect(() => {
    console.log('🗺️ Map useEffect triggered:', {
      hasMap: !!map,
      address,
      city,
      country,
      venue
    })

    if (!map) {
      console.log('🗺️ No map available yet')
      return
    }

    if (!address && !city) {
      console.log('🗺️ No address or city provided')
      return
    }

    // Prevent multiple geocoding attempts for the same address
    const currentAddress = `${address}-${city}-${country}`
    if (currentAddress === lastGeocodedAddress.current) {
      console.log('🗺️ Address already geocoded, skipping...')
      return
    }
    lastGeocodedAddress.current = currentAddress

    const geocoder = new window.google.maps.Geocoder()
    // if address already contains city and country, use it directly
    const fullAddress = address.includes(',') ? address : (country ? `${address}, ${city}, ${country}` : `${address}, ${city}`)
    
    console.log('🗺️ Geocoding address:', {
      address,
      city,
      country,
      fullAddress
    })

    geocoder.geocode({ address: fullAddress }, (results: any, status: any) => {
      console.log('🗺️ Geocoding result:', {
        status,
        resultsCount: results?.length,
        firstResult: results?.[0]?.formatted_address
      })
      
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
          title: venue || "Experience Location",
          icon: {
            url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#3B82F6"/>
              </svg>
            `),
            scaledSize: new window.google.maps.Size(24, 24),
            anchor: new window.google.maps.Point(12, 12)
          }
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
        console.log('🗺️ First attempt failed, trying alternative formats...')
        
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
            console.error("All geocoding attempts failed")
            setError("Could not find the address on the map. Try adding more details like street number and neighborhood.")
            return
          }
          
          const altAddress = alternativeAddresses[attempts]
          console.log(`🗺️ Trying alternative address ${attempts + 1}:`, altAddress)
          
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
                title: venue || "Experience Location",
                icon: {
                  url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#3B82F6"/>
                    </svg>
                  `),
                  scaledSize: new window.google.maps.Size(24, 24),
                  anchor: new window.google.maps.Point(12, 12)
                }
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
          <div className="text-blue-400 text-xs mt-2">
            {error.includes("Google Maps API key not configured") 
              ? "Add Google Maps API key to see real map" 
              : error.includes("Failed to load Google Maps")
              ? "Google Maps failed to load - check API key"
              : error}
          </div>
          <div className="text-gray-400 text-xs mt-1">
            API Key: {process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? '✅ Configured' : '❌ Missing'}
          </div>
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
      <div 
        ref={mapRef} 
        className="w-full h-full" 
        style={{ minHeight: '128px' }}
      />
      <div className="absolute top-2 left-2 bg-white px-2 py-1 rounded text-xs text-gray-600 shadow">
        📍 {venue || "Location"}
      </div>
      {/* Debug info */}
      <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
        Map: {map ? '✅' : '❌'} | Address: {address ? '✅' : '❌'} | Ref: {mapRef.current ? '✅' : '❌'}
      </div>
    </div>
  )
}
