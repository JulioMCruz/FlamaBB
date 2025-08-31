/**
 * Simple interests collection initialization
 */

const { initializeApp, getApps } = require('firebase/app')
const { getFirestore, collection, doc, setDoc } = require('firebase/firestore')

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
}

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
const firestore = getFirestore(app)

const interests = [
  { name: 'Restaurants', icon: 'Utensils', category: 'Food & Dining', popular: true, order: 1 },
  { name: 'Bars & Nightlife', icon: 'Wine', category: 'Nightlife', popular: true, order: 2 },
  { name: 'Coffee & Cafés', icon: 'Coffee', category: 'Food & Dining', popular: true, order: 3 },
  { name: 'Cultural Attractions', icon: 'Palette', category: 'Culture & Arts', popular: true, order: 4 },
  { name: 'Parks & Outdoor', icon: 'Trees', category: 'Outdoor Activities', popular: true, order: 5 },
  { name: 'Shopping', icon: 'ShoppingBag', category: 'Shopping & Retail', popular: true, order: 6 },
  { name: 'Live Music', icon: 'Music', category: 'Entertainment', popular: true, order: 7 },
  { name: 'Sports & Fitness', icon: 'Dumbbell', category: 'Sports & Recreation', popular: true, order: 8 }
]

async function initInterests() {
  try {
    console.log('🔥 Initializing interests...')
    
    for (const interest of interests) {
      const docId = interest.name.toLowerCase().replace(/[^a-z0-9]/g, '-')
      await setDoc(doc(firestore, 'interests', docId), interest)
      console.log(`✅ Added: ${interest.name}`)
    }
    
    console.log('🎉 Interests initialized!')
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

initInterests()