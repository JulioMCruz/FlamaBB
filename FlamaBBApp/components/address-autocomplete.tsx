"use client"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Search, MapPin } from "lucide-react"
import { loadGoogleMaps, isGoogleMapsLoaded } from "@/lib/google-maps-loader"

interface AddressAutocompleteProps {
  value: string
  onChange: (value: string) => void
  placeholder: string
  label: string
  className?: string
}

declare global {
  interface Window {
    google: any
  }
}

export function AddressAutocomplete({ 
  value, 
  onChange, 
  placeholder, 
  label,
  className = "" 
}: AddressAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const autocompleteService = useRef<any>(null)
  const placesService = useRef<any>(null)

  useEffect(() => {
    console.log('🗺️ AddressAutocomplete component: Starting Google Maps load...')
    
    // Use shared loader to prevent multiple script loads
    loadGoogleMaps()
      .then(() => {
        console.log('🗺️ AddressAutocomplete component: Google Maps loaded successfully')
        try {
          autocompleteService.current = new window.google.maps.places.AutocompleteService()
          placesService.current = new window.google.maps.places.PlacesService(document.createElement('div'))
          console.log('🗺️ Google Places services initialized for autocomplete')
        } catch (error) {
          console.error('🗺️ Error initializing Google Places services:', error)
        }
      })
      .catch((error) => {
        console.error('🗺️ AddressAutocomplete component: Failed to load Google Maps:', error)
      })
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    console.log('🗺️ Input changed:', { inputValue, selectionStart: e.target.selectionStart, selectionEnd: e.target.selectionEnd })
    
    // Always update the value to allow proper text editing
    onChange(inputValue)
    
    if (!inputValue.trim()) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    // Check if Google Places API is available
    if (!autocompleteService.current || !window.google) {
      console.log('🗺️ Google Places API not available for address autocomplete')
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    console.log('🗺️ Address autocomplete searching for:', inputValue)

    setIsLoading(true)
    
    try {
      // Create autocomplete request
      const request = {
        input: inputValue,
        types: ['address'],
        // Remove country restriction to allow global addresses
        // componentRestrictions: { country: 'AR' }
      }

      autocompleteService.current.getPlacePredictions(request, (predictions: any[], status: any) => {
        setIsLoading(false)
        
        console.log('🗺️ Address autocomplete result:', {
          status,
          predictionsCount: predictions?.length,
          firstPrediction: predictions?.[0]?.description
        })
        
        if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
          const formattedSuggestions = predictions.map(prediction => prediction.description)
          setSuggestions(formattedSuggestions)
          setShowSuggestions(true)
        } else {
          console.log('🗺️ No autocomplete suggestions found:', status)
          setSuggestions([])
          setShowSuggestions(false)
        }
      })
    } catch (error) {
      console.error('🗺️ Error in autocomplete:', error)
      setIsLoading(false)
      setSuggestions([])
      setShowSuggestions(false)
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    console.log('🗺️ Suggestion clicked:', suggestion)
    onChange(suggestion)
    setSuggestions([])
    setShowSuggestions(false)
    
    // Focus the input after a short delay to allow proper text selection
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus()
        // Select all text for easy editing
        inputRef.current.select()
      }
    }, 100)
  }

  const handleInputBlur = () => {
    // Delay hiding suggestions to allow for clicks
    setTimeout(() => {
      setShowSuggestions(false)
    }, 200)
  }

  const handleInputFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true)
    }
  }

  const handleInputClick = (e: React.MouseEvent<HTMLInputElement>) => {
    // Ensure the input is properly focused and text can be selected
    e.currentTarget.focus()
    console.log('🗺️ Input clicked, selection:', e.currentTarget.selectionStart, '-', e.currentTarget.selectionEnd)
  }

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow all normal text editing keys
    if (e.key === 'Backspace' || e.key === 'Delete' || e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'Home' || e.key === 'End') {
      // Let the default behavior happen
      return
    }
    
    // Allow Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X for text selection and editing
    if (e.ctrlKey && (e.key === 'a' || e.key === 'c' || e.key === 'v' || e.key === 'x')) {
      return
    }
    
    console.log('🗺️ Key pressed:', e.key, 'Ctrl:', e.ctrlKey, 'Selection:', e.currentTarget.selectionStart, '-', e.currentTarget.selectionEnd)
  }

  return (
    <div className={`relative ${className}`}>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="relative">
        <Input
          ref={inputRef}
          value={value}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onFocus={handleInputFocus}
          onKeyDown={handleInputKeyDown}
          onClick={handleInputClick}
          placeholder={placeholder}
          className="rounded-2xl border-gray-200 pr-10"
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <MapPin className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </div>
      
      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0"
            >
              <div className="flex items-center">
                <Search className="w-4 h-4 text-gray-400 mr-3" />
                <span className="text-sm text-gray-700">{suggestion}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
