import { initializeCitiesCollection } from './firebase-cities'
import { initializeInterestsCollection } from './firebase-interests'

// initialize firebase with default data
export const initializeFirebaseData = async () => {
  console.log('🚀 Initializing Firebase with default data...')
  
  try {
    // initialize cities
    console.log('🏙️ Initializing cities...')
    const citiesResult = await initializeCitiesCollection()
    console.log('Cities result:', citiesResult)
    
    // initialize interests
    console.log('🎯 Initializing interests...')
    const interestsResult = await initializeInterestsCollection()
    console.log('Interests result:', interestsResult)
    
    console.log('✅ Firebase initialization complete!')
    return { success: true }
  } catch (error) {
    console.error('❌ Firebase initialization failed:', error)
    return { success: false, error }
  }
}
