import { 
  collection, 
  doc, 
  getDocs, 
  getDoc,
  setDoc,
  query,
  orderBy
} from 'firebase/firestore'
import { firestore } from './firebase-config'

// City interface
export interface City {
  id: string
  name: string
  icon: string
  country: string
  region?: string
  popular: boolean
  order?: number
}

// Get all suggested cities from Firebase
export const getSuggestedCities = async (): Promise<City[]> => {
  try {
    const citiesRef = collection(firestore, 'cities')
    const q = query(citiesRef, orderBy('order', 'asc'))
    const querySnapshot = await getDocs(q)
    
    const cities: City[] = []
    querySnapshot.forEach((doc) => {
      cities.push({ id: doc.id, ...doc.data() } as City)
    })
    
    return cities
  } catch (error) {
    console.error('Error fetching cities:', error)
    // Return fallback cities if Firebase fails
    return [
      { id: 'buenos-aires', name: 'Buenos Aires', icon: '🌆', country: 'Argentina', popular: true, order: 1 },
      { id: 'new-york', name: 'New York', icon: '🏙️', country: 'USA', popular: true, order: 2 },
      { id: 'paris', name: 'Paris', icon: '🏛️', country: 'France', popular: true, order: 3 },
      { id: 'tokyo', name: 'Tokyo', icon: '🏯', country: 'Japan', popular: true, order: 4 },
      { id: 'london', name: 'London', icon: '🏛️', country: 'UK', popular: true, order: 5 },
      { id: 'singapore', name: 'Singapore', icon: '🏢', country: 'Singapore', popular: true, order: 6 },
      { id: 'dubai', name: 'Dubai', icon: '🕌', country: 'UAE', popular: true, order: 7 },
      { id: 'sydney', name: 'Sydney', icon: '🏛️', country: 'Australia', popular: true, order: 8 },
    ]
  }
}

// Initialize cities collection with default data (admin function)
export const initializeCitiesCollection = async () => {
  try {
    const cities: Omit<City, 'id'>[] = [
      { name: 'Buenos Aires', icon: '🌆', country: 'Argentina', popular: true, order: 1 },
      { name: 'New York', icon: '🏙️', country: 'USA', popular: true, order: 2 },
      { name: 'Paris', icon: '🏛️', country: 'France', popular: true, order: 3 },
      { name: 'Tokyo', icon: '🏯', country: 'Japan', popular: true, order: 4 },
      { name: 'London', icon: '🏛️', country: 'UK', popular: true, order: 5 },
      { name: 'Singapore', icon: '🏢', country: 'Singapore', popular: true, order: 6 },
      { name: 'Dubai', icon: '🕌', country: 'UAE', popular: true, order: 7 },
      { name: 'Sydney', icon: '🏛️', country: 'Australia', popular: true, order: 8 },
      { name: 'Barcelona', icon: '🏛️', country: 'Spain', popular: true, order: 9 },
      { name: 'Amsterdam', icon: '🏘️', country: 'Netherlands', popular: true, order: 10 },
      { name: 'Rome', icon: '🏛️', country: 'Italy', popular: true, order: 11 },
      { name: 'York', icon: '🏰', country: 'UK', popular: false, order: 12 }
    ]

    for (const city of cities) {
      const cityId = city.name.toLowerCase().replace(/\s+/g, '-')
      await setDoc(doc(firestore, 'cities', cityId), city)
    }

    console.log('Cities collection initialized successfully')
    return { success: true }
  } catch (error) {
    console.error('Error initializing cities:', error)
    return { success: false, error }
  }
}

// Save user's city preferences using wallet address
export const saveCityPreferences = async (walletAddress: string, selectedCities: string[]) => {
  try {
    const preferencesRef = doc(firestore, 'cityPreferences', walletAddress)
    await setDoc(preferencesRef, {
      walletAddress,
      cities: selectedCities,
      updatedAt: new Date().toISOString()
    }, { merge: true })

    return { success: true }
  } catch (error) {
    console.error('Error saving city preferences:', error)
    return { success: false, error }
  }
}

// Get user's city preferences by wallet address
export const getCityPreferences = async (walletAddress: string): Promise<string[]> => {
  try {
    const preferencesRef = doc(firestore, 'cityPreferences', walletAddress)
    const docSnap = await getDoc(preferencesRef)
    
    if (docSnap.exists()) {
      const data = docSnap.data()
      return data.cities || []
    }
    
    return []
  } catch (error) {
    console.error('Error getting city preferences:', error)
    return []
  }
}