import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore'
import { firestore } from './firebase-config'

// Experience data interfaces
export interface Experience {
  id?: string
  title: string
  description: string
  category: 'restaurant' | 'bar' | 'cultural' | 'outdoor' | 'shopping' | 'attraction'
  location: {
    name: string
    address: string
    coordinates?: {
      lat: number
      lng: number
    }
  }
  city: string
  neighborhood?: string
  priceRange: {
    min: number
    max: number
    currency: 'ETH' | 'USD'
  }
  images?: string[]
  tags?: string[]
  createdBy: string
  participants: string[]
  maxParticipants?: number
  date?: Timestamp
  status: 'active' | 'completed' | 'cancelled'
  rating?: number
  reviews?: number
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface ExperienceReview {
  id?: string
  experienceId: string
  userId: string
  rating: number
  comment?: string
  createdAt: Timestamp
}

// Experience CRUD operations
export const createExperience = async (experienceData: Omit<Experience, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const docRef = await addDoc(collection(firestore, 'experiences'), {
      ...experienceData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
    return { id: docRef.id, error: null }
  } catch (error) {
    return { id: null, error: error as Error }
  }
}

export const getExperience = async (id: string): Promise<Experience | null> => {
  try {
    const docSnap = await getDoc(doc(firestore, 'experiences', id))
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Experience
    }
    return null
  } catch (error) {
    console.error('Error getting experience:', error)
    return null
  }
}

export const updateExperience = async (id: string, updates: Partial<Experience>) => {
  try {
    await updateDoc(doc(firestore, 'experiences', id), {
      ...updates,
      updatedAt: serverTimestamp()
    })
    return { error: null }
  } catch (error) {
    return { error: error as Error }
  }
}

export const deleteExperience = async (id: string) => {
  try {
    await deleteDoc(doc(firestore, 'experiences', id))
    return { error: null }
  } catch (error) {
    return { error: error as Error }
  }
}

// Query experiences
export const getExperiencesByCity = async (city: string, limitCount = 20): Promise<Experience[]> => {
  try {
    const q = query(
      collection(firestore, 'experiences'),
      where('city', '==', city),
      where('status', '==', 'active'),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    )
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    })) as Experience[]
  } catch (error) {
    console.error('Error getting experiences by city:', error)
    return []
  }
}

export const getExperiencesByCategory = async (category: string, limitCount = 20): Promise<Experience[]> => {
  try {
    const q = query(
      collection(firestore, 'experiences'),
      where('category', '==', category),
      where('status', '==', 'active'),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    )
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    })) as Experience[]
  } catch (error) {
    console.error('Error getting experiences by category:', error)
    return []
  }
}

export const getExperiencesByUser = async (userId: string): Promise<Experience[]> => {
  try {
    const q = query(
      collection(firestore, 'experiences'),
      where('createdBy', '==', userId),
      orderBy('createdAt', 'desc')
    )
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    })) as Experience[]
  } catch (error) {
    console.error('Error getting experiences by user:', error)
    return []
  }
}

// Participation functions
export const joinExperience = async (experienceId: string, userId: string) => {
  try {
    const experienceDoc = await getDoc(doc(firestore, 'experiences', experienceId))
    if (!experienceDoc.exists()) {
      throw new Error('Experience not found')
    }

    const experience = experienceDoc.data() as Experience
    const participants = experience.participants || []

    if (participants.includes(userId)) {
      return { error: new Error('User already joined') }
    }

    if (experience.maxParticipants && participants.length >= experience.maxParticipants) {
      return { error: new Error('Experience is full') }
    }

    await updateDoc(doc(firestore, 'experiences', experienceId), {
      participants: [...participants, userId],
      updatedAt: serverTimestamp()
    })

    return { error: null }
  } catch (error) {
    return { error: error as Error }
  }
}

export const leaveExperience = async (experienceId: string, userId: string) => {
  try {
    const experienceDoc = await getDoc(doc(firestore, 'experiences', experienceId))
    if (!experienceDoc.exists()) {
      throw new Error('Experience not found')
    }

    const experience = experienceDoc.data() as Experience
    const participants = experience.participants || []

    await updateDoc(doc(firestore, 'experiences', experienceId), {
      participants: participants.filter(id => id !== userId),
      updatedAt: serverTimestamp()
    })

    return { error: null }
  } catch (error) {
    return { error: error as Error }
  }
}

// Review functions
export const addReview = async (reviewData: Omit<ExperienceReview, 'id' | 'createdAt'>) => {
  try {
    const docRef = await addDoc(collection(firestore, 'reviews'), {
      ...reviewData,
      createdAt: serverTimestamp()
    })

    // Update experience rating
    await updateExperienceRating(reviewData.experienceId)

    return { id: docRef.id, error: null }
  } catch (error) {
    return { id: null, error: error as Error }
  }
}

export const updateExperienceRating = async (experienceId: string) => {
  try {
    const q = query(
      collection(firestore, 'reviews'),
      where('experienceId', '==', experienceId)
    )
    const querySnapshot = await getDocs(q)
    const reviews = querySnapshot.docs.map(doc => doc.data()) as ExperienceReview[]

    if (reviews.length > 0) {
      const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      
      await updateDoc(doc(firestore, 'experiences', experienceId), {
        rating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
        reviews: reviews.length,
        updatedAt: serverTimestamp()
      })
    }

    return { error: null }
  } catch (error) {
    return { error: error as Error }
  }
}