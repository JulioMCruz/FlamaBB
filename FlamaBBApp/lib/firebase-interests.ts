import {
  collection,
  doc,
  getDocs,
  setDoc,
  getDoc,
  query,
  orderBy,
  Timestamp,
} from 'firebase/firestore'
import { firestore } from '@/lib/firebase-config'

export interface Interest {
  id: string
  name: string
  icon: string
  category: string
  description?: string
  popular: boolean
  order?: number
}

export interface UserInterestsPreference {
  walletAddress: string
  interests: string[]
  updatedAt: Timestamp
}

// Get all suggested interests from Firebase
export const getSuggestedInterests = async (): Promise<Interest[]> => {
  try {
    const interestsRef = collection(firestore, 'interests')
    const q = query(interestsRef, orderBy('order', 'asc'))
    const querySnapshot = await getDocs(q)
    
    const interests: Interest[] = []
    querySnapshot.forEach((doc) => {
      interests.push({
        id: doc.id,
        ...doc.data()
      } as Interest)
    })
    
    return interests
  } catch (error) {
    console.error('Error fetching interests:', error)
    // Return fallback interests if Firebase fails
    return [
      { id: 'food-dining', name: 'Food & Dining', icon: '🍽️', category: 'Food', popular: true, order: 1 },
      { id: 'bars-nightlife', name: 'Bars & Nightlife', icon: '🍺', category: 'Nightlife', popular: true, order: 2 },
      { id: 'culture-arts', name: 'Culture & Arts', icon: '🎭', category: 'Culture', popular: true, order: 3 },
      { id: 'outdoor-activities', name: 'Outdoor Activities', icon: '🏞️', category: 'Outdoor', popular: true, order: 4 },
      { id: 'shopping', name: 'Shopping', icon: '🛍️', category: 'Shopping', popular: true, order: 5 },
      { id: 'tours-sightseeing', name: 'Tours & Sightseeing', icon: '🗺️', category: 'Tours', popular: true, order: 6 },
      { id: 'sports-fitness', name: 'Sports & Fitness', icon: '⚽', category: 'Sports', popular: true, order: 7 },
      { id: 'music-entertainment', name: 'Music & Entertainment', icon: '🎵', category: 'Entertainment', popular: true, order: 8 },
    ]
  }
}

// Save user's interest preferences
export const saveInterestPreferences = async (
  walletAddress: string,
  selectedInterests: string[]
): Promise<void> => {
  try {
    const preferencesRef = doc(firestore, 'interestPreferences', walletAddress)
    await setDoc(preferencesRef, {
      walletAddress,
      interests: selectedInterests,
      updatedAt: Timestamp.now()
    })
  } catch (error) {
    console.error('Error saving interest preferences:', error)
    throw error
  }
}

// Get user's interest preferences
export const getInterestPreferences = async (
  walletAddress: string
): Promise<string[]> => {
  try {
    const preferencesRef = doc(firestore, 'interestPreferences', walletAddress)
    const docSnap = await getDoc(preferencesRef)
    
    if (docSnap.exists()) {
      const data = docSnap.data() as UserInterestsPreference
      return data.interests || []
    }
    
    return []
  } catch (error) {
    console.error('Error fetching interest preferences:', error)
    return []
  }
}

// Initialize interests collection with default data
export const initializeInterestsCollection = async (): Promise<void> => {
  const defaultInterests: Omit<Interest, 'id'>[] = [
    {
      name: 'Restaurants',
      icon: 'Utensils',
      category: 'Food & Dining',
      description: 'Fine dining, local cuisine, and food experiences',
      popular: true,
      order: 1
    },
    {
      name: 'Bars & Nightlife',
      icon: 'Wine',
      category: 'Nightlife',
      description: 'Cocktail bars, wine bars, and nightlife venues',
      popular: true,
      order: 2
    },
    {
      name: 'Coffee & Cafés',
      icon: 'Coffee',
      category: 'Food & Dining',
      description: 'Specialty coffee shops and cozy cafés',
      popular: true,
      order: 3
    },
    {
      name: 'Cultural Attractions',
      icon: 'Palette',
      category: 'Culture & Arts',
      description: 'Museums, galleries, and cultural sites',
      popular: true,
      order: 4
    },
    {
      name: 'Parks & Outdoor',
      icon: 'Trees',
      category: 'Outdoor Activities',
      description: 'Parks, gardens, and outdoor recreational activities',
      popular: true,
      order: 5
    },
    {
      name: 'Shopping',
      icon: 'ShoppingBag',
      category: 'Shopping & Retail',
      description: 'Markets, boutiques, and shopping experiences',
      popular: true,
      order: 6
    },
    {
      name: 'Live Music',
      icon: 'Music',
      category: 'Entertainment',
      description: 'Concerts, live music venues, and performances',
      popular: true,
      order: 7
    },
    {
      name: 'Sports & Fitness',
      icon: 'Dumbbell',
      category: 'Sports & Recreation',
      description: 'Gyms, sports activities, and fitness experiences',
      popular: true,
      order: 8
    },
    {
      name: 'Tours & Sightseeing',
      icon: 'MapPin',
      category: 'Tourism',
      description: 'Guided tours, walking tours, and sightseeing',
      popular: true,
      order: 9
    },
    {
      name: 'Art & Creativity',
      icon: 'Paintbrush',
      category: 'Culture & Arts',
      description: 'Art workshops, creative spaces, and artistic experiences',
      popular: false,
      order: 10
    },
    {
      name: 'Wellness & Spa',
      icon: 'Heart',
      category: 'Health & Wellness',
      description: 'Spas, wellness centers, and relaxation experiences',
      popular: false,
      order: 11
    },
    {
      name: 'Food Markets',
      icon: 'Apple',
      category: 'Food & Dining',
      description: 'Local markets, food halls, and culinary markets',
      popular: true,
      order: 12
    }
  ]

  try {
    const interestsRef = collection(firestore, 'interests')
    
    // Add each interest as a document
    for (const interest of defaultInterests) {
      const docRef = doc(interestsRef, interest.name.toLowerCase().replace(/[^a-z0-9]/g, '-'))
      await setDoc(docRef, {
        ...interest,
        createdAt: Timestamp.now()
      })
    }
    
    console.log('Successfully initialized interests collection')
  } catch (error) {
    console.error('Error initializing interests collection:', error)
    throw error
  }
}