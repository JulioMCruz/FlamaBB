"use client"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Search, MapPin, Globe, ChevronDown } from "lucide-react"

interface LocationSelectorProps {
  selectedCountry: string
  selectedCity: string
  onCountryChange: (country: string) => void
  onCityChange: (city: string) => void
}

interface CountrySuggestion {
  name: string
  code: string
}

declare global {
  interface Window {
    google: any
  }
}

export function LocationSelector({ 
  selectedCountry, 
  selectedCity, 
  onCountryChange, 
  onCityChange 
}: LocationSelectorProps) {
  const [countrySuggestions, setCountrySuggestions] = useState<CountrySuggestion[]>([])
  const [citySuggestions, setCitySuggestions] = useState<string[]>([])
  const [showCountrySuggestions, setShowCountrySuggestions] = useState(false)
  const [showCitySuggestions, setShowCitySuggestions] = useState(false)
  const [isLoadingCountry, setIsLoadingCountry] = useState(false)
  const [isLoadingCity, setIsLoadingCity] = useState(false)
  const [tempCountry, setTempCountry] = useState(selectedCountry)
  const [tempCity, setTempCity] = useState(selectedCity)
  
  const countryInputRef = useRef<HTMLInputElement>(null)
  const cityInputRef = useRef<HTMLInputElement>(null)
  const autocompleteService = useRef<any>(null)

  useEffect(() => {
    // Check if Google Maps API key is available
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    
    if (!apiKey || apiKey === "your_google_maps_api_key_here") {
      console.log('🗺️ Google Maps API key not configured for location selector')
      return
    }

    // Only load if not already loaded
    if (!window.google) {
      // Check if script is already being loaded
      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]')
      if (existingScript) {
        console.log('🗺️ Google Maps script already loading')
        return
      }

      const script = document.createElement("script")
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
      script.async = true
      script.defer = true
      script.onload = () => {
        console.log('🗺️ Google Maps script loaded for location selector')
        if (window.google) {
          try {
            autocompleteService.current = new window.google.maps.places.AutocompleteService()
          } catch (error) {
            console.error('🗺️ Error initializing Google Places services:', error)
          }
        }
      }
      script.onerror = () => {
        console.error('🗺️ Failed to load Google Maps script for location selector')
      }
      document.head.appendChild(script)
    } else {
      try {
        autocompleteService.current = new window.google.maps.places.AutocompleteService()
      } catch (error) {
        console.error('🗺️ Error initializing Google Places services:', error)
      }
    }
  }, [])

  const handleCountryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setTempCountry(value)
    
    if (!value.trim() || !autocompleteService.current) {
      setCountrySuggestions([])
      setShowCountrySuggestions(false)
      return
    }

    setIsLoadingCountry(true)
    
    try {
      const request = {
        input: value,
        types: ['country'],
      }

      autocompleteService.current.getPlacePredictions(request, (predictions: any[], status: any) => {
        setIsLoadingCountry(false)
        
        if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
          const countries = predictions.map(prediction => ({
            name: prediction.description,
            code: prediction.terms?.find((term: any) => term.types?.includes('country'))?.value || ''
          }))
          setCountrySuggestions(countries)
          setShowCountrySuggestions(true)
        } else {
          setCountrySuggestions([])
          setShowCountrySuggestions(false)
        }
      })
    } catch (error) {
      console.error('🗺️ Error in country autocomplete:', error)
      setIsLoadingCountry(false)
      setCountrySuggestions([])
      setShowCountrySuggestions(false)
    }
  }

  const handleCityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setTempCity(value)
    
    if (!value.trim() || !autocompleteService.current) {
      setCitySuggestions([])
      setShowCitySuggestions(false)
      return
    }

    setIsLoadingCity(true)
    
    try {
      const request = {
        input: value,
        types: ['(cities)'],
        // Don't restrict by country code for now to avoid the error
        // componentRestrictions: selectedCountry ? { country: selectedCountry } : undefined
      }

      autocompleteService.current.getPlacePredictions(request, (predictions: any[], status: any) => {
        setIsLoadingCity(false)
        
        if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
          const cities = predictions.map(prediction => prediction.description)
          setCitySuggestions(cities)
          setShowCitySuggestions(true)
        } else {
          setCitySuggestions([])
          setShowCitySuggestions(false)
        }
      })
    } catch (error) {
      console.error('🗺️ Error in city autocomplete:', error)
      setIsLoadingCity(false)
      setCitySuggestions([])
      setShowCitySuggestions(false)
    }
  }

  const handleCountrySelect = (country: CountrySuggestion) => {
    setTempCountry(country.name)
    onCountryChange(country.name)
    setCountrySuggestions([])
    setShowCountrySuggestions(false)
    countryInputRef.current?.blur()
    
    // Clear city when country changes
    setTempCity("")
    onCityChange("")
  }

  const handleCitySelect = (city: string) => {
    setTempCity(city)
    onCityChange(city)
    setCitySuggestions([])
    setShowCitySuggestions(false)
    cityInputRef.current?.blur()
  }

  const handleCountryBlur = () => {
    setTimeout(() => {
      setShowCountrySuggestions(false)
    }, 200)
  }

  const handleCityBlur = () => {
    setTimeout(() => {
      setShowCitySuggestions(false)
    }, 200)
  }

  const handleCountryFocus = () => {
    if (countrySuggestions.length > 0) {
      setShowCountrySuggestions(true)
    }
  }

  const handleCityFocus = () => {
    if (citySuggestions.length > 0) {
      setShowCitySuggestions(true)
    }
  }

  return (
    <div className="space-y-4">
      {/* Country Selection */}
      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
        <div className="relative">
          <Input
            ref={countryInputRef}
            value={tempCountry}
            onChange={handleCountryChange}
            onBlur={handleCountryBlur}
            onFocus={handleCountryFocus}
            placeholder="Start typing a country..."
            className="rounded-2xl border-gray-200 pr-10"
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {isLoadingCountry ? (
              <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Globe className="w-5 h-5 text-gray-400" />
            )}
          </div>
        </div>
        
        {/* Country Suggestions */}
        {showCountrySuggestions && countrySuggestions.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {countrySuggestions.map((country, index) => (
              <button
                key={index}
                onClick={() => handleCountrySelect(country)}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0"
              >
                <div className="flex items-center">
                  <Globe className="w-4 h-4 text-gray-400 mr-3" />
                  <span className="text-sm text-gray-700">{country.name}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* City Selection */}
      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
        <div className="relative">
          <Input
            ref={cityInputRef}
            value={tempCity}
            onChange={handleCityChange}
            onBlur={handleCityBlur}
            onFocus={handleCityFocus}
            placeholder={selectedCountry ? `Start typing a city in ${selectedCountry}...` : "Select a country first"}
            disabled={!selectedCountry}
            className="rounded-2xl border-gray-200 pr-10"
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {isLoadingCity ? (
              <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <MapPin className="w-5 h-5 text-gray-400" />
            )}
          </div>
        </div>
        
        {/* City Suggestions */}
        {showCitySuggestions && citySuggestions.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {citySuggestions.map((city, index) => (
              <button
                key={index}
                onClick={() => handleCitySelect(city)}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0"
              >
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 text-gray-400 mr-3" />
                  <span className="text-sm text-gray-700">{city}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
