/**
 * Initialize Firebase interests collection with recommended interest categories
 * Run this script to populate the Firestore database with default interests
 */

const { initializeApp, getApps } = require('firebase/app')
const { getFirestore, collection, doc, setDoc, Timestamp } = require('firebase/firestore')

// Initialize Firebase (using same config as the app)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
}

// Initialize Firebase only if it hasn't been initialized yet
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
const firestore = getFirestore(app)

const defaultInterests = [
  {
    id: 'restaurants',
    name: 'Restaurants',
    icon: 'Utensils',
    category: 'Food & Dining',
    description: 'Fine dining, local cuisine, and food experiences',
    popular: true,
    order: 1
  },
  {
    id: 'bars-nightlife',
    name: 'Bars & Nightlife',
    icon: 'Wine',
    category: 'Nightlife',
    description: 'Cocktail bars, wine bars, and nightlife venues',
    popular: true,
    order: 2
  },
  {
    id: 'coffee-cafes',
    name: 'Coffee & Cafés',
    icon: 'Coffee',
    category: 'Food & Dining',
    description: 'Specialty coffee shops and cozy cafés',
    popular: true,
    order: 3
  },
  {
    id: 'cultural-attractions',
    name: 'Cultural Attractions',
    icon: 'Palette',
    category: 'Culture & Arts',
    description: 'Museums, galleries, and cultural sites',
    popular: true,
    order: 4
  },
  {
    id: 'parks-outdoor',
    name: 'Parks & Outdoor',
    icon: 'Trees',
    category: 'Outdoor Activities',
    description: 'Parks, gardens, and outdoor recreational activities',
    popular: true,
    order: 5
  },
  {
    id: 'shopping',
    name: 'Shopping',
    icon: 'ShoppingBag',
    category: 'Shopping & Retail',
    description: 'Markets, boutiques, and shopping experiences',
    popular: true,
    order: 6
  },
  {
    id: 'live-music',
    name: 'Live Music',
    icon: 'Music',
    category: 'Entertainment',
    description: 'Concerts, live music venues, and performances',
    popular: true,
    order: 7
  },
  {
    id: 'sports-fitness',
    name: 'Sports & Fitness',
    icon: 'Dumbbell',
    category: 'Sports & Recreation',
    description: 'Gyms, sports activities, and fitness experiences',
    popular: true,
    order: 8
  },
  {
    id: 'tours-sightseeing',
    name: 'Tours & Sightseeing',
    icon: 'MapPin',
    category: 'Tourism',
    description: 'Guided tours, walking tours, and sightseeing',
    popular: true,
    order: 9
  },
  {
    id: 'art-creativity',
    name: 'Art & Creativity',
    icon: 'Paintbrush',
    category: 'Culture & Arts',
    description: 'Art workshops, creative spaces, and artistic experiences',
    popular: false,
    order: 10
  },
  {
    id: 'wellness-spa',
    name: 'Wellness & Spa',
    icon: 'Heart',
    category: 'Health & Wellness',
    description: 'Spas, wellness centers, and relaxation experiences',
    popular: false,
    order: 11
  },
  {
    id: 'food-markets',
    name: 'Food Markets',
    icon: 'Apple',
    category: 'Food & Dining',
    description: 'Local markets, food halls, and culinary markets',
    popular: true,
    order: 12
  },
  {
    id: 'tango-dance',
    name: 'Tango & Dance',
    icon: 'Music2',
    category: 'Culture & Arts',
    description: 'Tango shows, dance lessons, and performance venues',
    popular: true,
    order: 13
  },
  {
    id: 'wine-tastings',
    name: 'Wine Tastings',
    icon: 'Wine',
    category: 'Food & Dining',
    description: 'Wine tastings, vineyards, and sommelier experiences',
    popular: true,
    order: 14
  },
  {
    id: 'historic-sites',
    name: 'Historic Sites',
    icon: 'Landmark',
    category: 'Culture & Arts',
    description: 'Historical landmarks, monuments, and heritage sites',
    popular: false,
    order: 15
  }
]

async function initializeInterests() {
  try {
    console.log('🔥 Initializing Firebase interests collection...')
    
    const interestsRef = collection(firestore, 'interests')
    
    for (const interest of defaultInterests) {
      const docId = interest.id
      const docRef = doc(interestsRef, docId)
      const interestData = {
        name: interest.name,
        icon: interest.icon,
        category: interest.category,
        description: interest.description,
        popular: interest.popular,
        order: interest.order,
        createdAt: new Date().toISOString()
      }
      await setDoc(docRef, interestData)
      console.log(`✅ Added interest: ${interest.name}`)
    }
    
    console.log(`🎉 Successfully initialized ${defaultInterests.length} interests`)
    console.log('💡 Interests include: Food & Dining, Nightlife, Culture & Arts, Outdoor Activities, and more')
    
  } catch (error) {
    console.error('❌ Error initializing interests:', error)
    process.exit(1)
  }
}

// Run the initialization
initializeInterests()
  .then(() => {
    console.log('🔥 Interest initialization complete!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Failed to initialize interests:', error)
    process.exit(1)
  })