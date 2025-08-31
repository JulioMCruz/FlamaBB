import { 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  collection, 
  query, 
  where, 
  orderBy, 
  limit,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  type Timestamp 
} from 'firebase/firestore'
import { db } from '@/lib/firebase-config'
import type { ExperienceWallet } from '@/lib/cdp-wallet-service'

export interface Experience {
  id?: string
  title: string
  description: string
  category: 'asado' | 'bar' | 'walking-tour' | 'wine-tasting' | 'tango' | 'cultural' | string
  venue: string
  venueType: string
  city: string
  date: string
  contributionAmount: string // ETH amount as string
  maxParticipants: string
  checkinPercentage: string
  midExperiencePercentage: string
  includedItems: string[]
  experienceType: 'existing' | 'anonymous'
  
  // CDP Wallet Integration
  wallet?: {
    accountAddress: string
    accountName: string
    network: string
    createdAt: string
  }
  
  // Blockchain Integration
  blockchainExperienceId?: string // Blockchain experience ID for booking
  transactionHash?: string // Transaction hash from creation
  
  // Metadata
  createdBy: string
  participants: string[]
  status: 'active' | 'completed' | 'cancelled'
  createdAt?: Timestamp
  updatedAt?: Timestamp
  
  // Optional fields for future features
  images?: string[]
  tags?: string[]
  rating?: number
  reviews?: number
}

export interface CreateExperienceData {
  title: string
  description: string
  category: string
  venue: string
  venueType: string
  city: string
  date: string
  contributionAmount: string
  maxParticipants: string
  checkinPercentage: string
  midExperiencePercentage: string
  includedItems: string[]
  experienceType: 'existing' | 'anonymous'
}

/**
 * Create a new experience in Firestore with CDP wallet integration
 */
export async function createExperience(
  experienceData: CreateExperienceData, 
  userId: string,
  experienceWallet?: ExperienceWallet
): Promise<string> {
  try {
    console.log('🔥 Creating experience in Firestore...', experienceData.title)
    
    // Generate a unique experience ID
    const experienceRef = doc(collection(db, 'experiences'))
    const experienceId = experienceRef.id

    const experience: Experience = {
      id: experienceId,
      ...experienceData,
      createdBy: userId,
      participants: [],
      status: 'active',
      createdAt: serverTimestamp() as any,
      updatedAt: serverTimestamp() as any,
      
      // Add CDP wallet info if provided
      ...(experienceWallet && {
        wallet: {
          accountAddress: experienceWallet.accountAddress,
          accountName: experienceWallet.accountName,
          network: experienceWallet.network,
          createdAt: experienceWallet.createdAt
        }
      })
    }

    await setDoc(experienceRef, experience)
    console.log('✅ Experience created successfully:', experienceId)
    
    return experienceId

  } catch (error) {
    console.error('❌ Error creating experience:', error)
    throw error
  }
}

/**
 * Get a specific experience by ID
 */
export async function getExperience(experienceId: string): Promise<Experience | null> {
  try {
    const experienceRef = doc(db, 'experiences', experienceId)
    const experienceSnap = await getDoc(experienceRef)
    
    if (experienceSnap.exists()) {
      return { id: experienceId, ...experienceSnap.data() } as Experience
    }
    
    return null

  } catch (error) {
    console.error('❌ Error getting experience:', error)
    return null
  }
}

/**
 * Get all experiences for a specific city
 */
export async function getExperiencesByCity(city: string, limitCount: number = 20): Promise<Experience[]> {
  try {
    // Simplified query without orderBy to avoid index requirement
    const q = query(
      collection(db, 'experiences'),
      where('city', '==', city),
      where('status', '==', 'active')
    )
    
    const querySnapshot = await getDocs(q)
    const experiences: Experience[] = []
    
    querySnapshot.forEach((doc) => {
      experiences.push({ id: doc.id, ...doc.data() } as Experience)
    })
    
    // Sort in memory instead of in query
    experiences.sort((a, b) => {
      if (a.createdAt && b.createdAt) {
        return b.createdAt.toMillis() - a.createdAt.toMillis()
      }
      return 0
    })
    
    // Apply limit after sorting
    return experiences.slice(0, limitCount)

  } catch (error) {
    console.error('❌ Error getting experiences by city:', error)
    return []
  }
}

/**
 * Get all active experiences (regardless of city)
 */
export async function getAllActiveExperiences(limitCount: number = 20): Promise<Experience[]> {
  try {
    // Get all active experiences
    const q = query(
      collection(db, 'experiences'),
      where('status', '==', 'active')
    )
    
    const querySnapshot = await getDocs(q)
    const experiences: Experience[] = []
    
    querySnapshot.forEach((doc) => {
      experiences.push({ id: doc.id, ...doc.data() } as Experience)
    })
    
    // Sort in memory instead of in query
    experiences.sort((a, b) => {
      if (a.createdAt && b.createdAt) {
        return b.createdAt.toMillis() - a.createdAt.toMillis()
      }
      return 0
    })
    
    // Apply limit after sorting
    return experiences.slice(0, limitCount)

  } catch (error) {
    console.error('❌ Error getting all active experiences:', error)
    return []
  }
}

/**
 * Get experiences created by a specific user
 */
export async function getUserExperiences(userId: string): Promise<Experience[]> {
  try {
    // Simplified query without orderBy to avoid index requirement
    const q = query(
      collection(db, 'experiences'),
      where('createdBy', '==', userId)
    )
    
    const querySnapshot = await getDocs(q)
    const experiences: Experience[] = []
    
    querySnapshot.forEach((doc) => {
      experiences.push({ id: doc.id, ...doc.data() } as Experience)
    })
    
    // Sort in memory instead of in query
    experiences.sort((a, b) => {
      if (a.createdAt && b.createdAt) {
        return b.createdAt.toMillis() - a.createdAt.toMillis()
      }
      return 0
    })
    
    return experiences

  } catch (error) {
    console.error('❌ Error getting user experiences:', error)
    return []
  }
}

/**
 * Get experiences that a user has booked/joined
 */
export async function getBookedExperiences(userId: string): Promise<Experience[]> {
  try {
    // Get all experiences where the user is in the participants array
    const q = query(
      collection(db, 'experiences'),
      where('participants', 'array-contains', userId)
    )
    
    const querySnapshot = await getDocs(q)
    const experiences: Experience[] = []
    
    querySnapshot.forEach((doc) => {
      experiences.push({ id: doc.id, ...doc.data() } as Experience)
    })
    
    // Sort in memory instead of in query
    experiences.sort((a, b) => {
      if (a.createdAt && b.createdAt) {
        return b.createdAt.toMillis() - a.createdAt.toMillis()
      }
      return 0
    })
    
    return experiences

  } catch (error) {
    console.error('❌ Error getting booked experiences:', error)
    return []
  }
}

/**
 * Update an experience
 */
export async function updateExperience(experienceId: string, updates: Partial<Experience>): Promise<boolean> {
  try {
    const experienceRef = doc(db, 'experiences', experienceId)
    await updateDoc(experienceRef, {
      ...updates,
      updatedAt: serverTimestamp()
    })
    
    console.log('✅ Experience updated successfully:', experienceId)
    return true

  } catch (error) {
    console.error('❌ Error updating experience:', error)
    return false
  }
}

/**
 * Delete an experience
 */
export async function deleteExperience(experienceId: string): Promise<boolean> {
  try {
    const experienceRef = doc(db, 'experiences', experienceId)
    await deleteDoc(experienceRef)
    
    console.log('✅ Experience deleted successfully:', experienceId)
    return true

  } catch (error) {
    console.error('❌ Error deleting experience:', error)
    return false
  }
}

/**
 * Join an experience (add user to participants)
 */
export async function joinExperience(experienceId: string, userId: string): Promise<boolean> {
  try {
    const experience = await getExperience(experienceId)
    
    if (!experience) {
      throw new Error('Experience not found')
    }
    
    if (experience.participants.includes(userId)) {
      console.log('User already joined this experience')
      return true
    }
    
    const updatedParticipants = [...experience.participants, userId]
    
    await updateExperience(experienceId, {
      participants: updatedParticipants
    })
    
    console.log('✅ User joined experience successfully')
    return true

  } catch (error) {
    console.error('❌ Error joining experience:', error)
    return false
  }
}

/**
 * Search experiences by multiple criteria
 */
export async function searchExperiences(filters: {
  city?: string
  category?: string
  priceRange?: { min: number, max: number }
  limitCount?: number
}): Promise<Experience[]> {
  try {
    let q = query(collection(db, 'experiences'))
    
    if (filters.city) {
      q = query(q, where('city', '==', filters.city))
    }
    
    if (filters.category) {
      q = query(q, where('category', '==', filters.category))
    }
    
    q = query(q, where('status', '==', 'active'))
    q = query(q, orderBy('createdAt', 'desc'))
    
    if (filters.limitCount) {
      q = query(q, limit(filters.limitCount))
    }
    
    const querySnapshot = await getDocs(q)
    const experiences: Experience[] = []
    
    querySnapshot.forEach((doc) => {
      const experience = { id: doc.id, ...doc.data() } as Experience
      
      // Apply price range filter if specified
      if (filters.priceRange) {
        const price = parseFloat(experience.contributionAmount)
        if (price < filters.priceRange.min || price > filters.priceRange.max) {
          return // Skip this experience
        }
      }
      
      experiences.push(experience)
    })
    
    return experiences

  } catch (error) {
    console.error('❌ Error searching experiences:', error)
    return []
  }
}