// shared google maps loader to prevent multiple script loads
let googleMapsLoaded = false
let googleMapsLoading = false
let loadPromise: Promise<void> | null = null

export const loadGoogleMaps = (): Promise<void> => {
  // if already loaded, return resolved promise
  if (googleMapsLoaded && window.google && window.google.maps) {
    return Promise.resolve()
  }

  // if currently loading, return existing promise
  if (googleMapsLoading && loadPromise) {
    return loadPromise
  }

  // start loading
  googleMapsLoading = true
  loadPromise = new Promise((resolve, reject) => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    
    if (!apiKey || apiKey === "your_google_maps_api_key_here") {
      reject(new Error("Google Maps API key not configured"))
      return
    }

    // check if script already exists
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]')
    if (existingScript) {
      // wait for existing script to load
      const checkGoogle = setInterval(() => {
        if (window.google && window.google.maps) {
          clearInterval(checkGoogle)
          googleMapsLoaded = true
          googleMapsLoading = false
          resolve()
        }
      }, 100)
      return
    }

    // create and load script
    const script = document.createElement("script")
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
    script.async = true
    script.defer = true
    
    script.onload = () => {
      console.log('🗺️ Google Maps script loaded successfully (shared loader)')
      googleMapsLoaded = true
      googleMapsLoading = false
      resolve()
    }
    
    script.onerror = () => {
      console.error('🗺️ Failed to load Google Maps script (shared loader)')
      googleMapsLoading = false
      reject(new Error("Failed to load Google Maps"))
    }
    
    document.head.appendChild(script)
  })

  return loadPromise
}

export const isGoogleMapsLoaded = (): boolean => {
  return googleMapsLoaded && !!(window.google && window.google.maps)
}
