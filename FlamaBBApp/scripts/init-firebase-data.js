// script to initialize firebase with mock data
// run with: node scripts/init-firebase-data.js

import { initializeApp } from 'firebase/app'
import { getFirestore, collection, doc, setDoc, Timestamp } from 'firebase/firestore'

// firebase config - uses environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
}

// initialize firebase
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

// mock cities data
const cities = [
  { id: 'buenos-aires', name: 'Buenos Aires', icon: '🌆', country: 'Argentina', popular: true, order: 1 },
  { id: 'new-york', name: 'New York', icon: '🏙️', country: 'USA', popular: true, order: 2 },
  { id: 'paris', name: 'Paris', icon: '🏛️', country: 'France', popular: true, order: 3 },
  { id: 'tokyo', name: 'Tokyo', icon: '🏯', country: 'Japan', popular: true, order: 4 },
  { id: 'london', name: 'London', icon: '🏛️', country: 'UK', popular: true, order: 5 },
  { id: 'singapore', name: 'Singapore', icon: '🏢', country: 'Singapore', popular: true, order: 6 },
  { id: 'dubai', name: 'Dubai', icon: '🕌', country: 'UAE', popular: true, order: 7 },
  { id: 'sydney', name: 'Sydney', icon: '🏛️', country: 'Australia', popular: true, order: 8 },
  { id: 'barcelona', name: 'Barcelona', icon: '🏛️', country: 'Spain', popular: true, order: 9 },
  { id: 'amsterdam', name: 'Amsterdam', icon: '🏘️', country: 'Netherlands', popular: true, order: 10 },
  { id: 'rome', name: 'Rome', icon: '🏛️', country: 'Italy', popular: true, order: 11 },
  { id: 'berlin', name: 'Berlin', icon: '🏛️', country: 'Germany', popular: true, order: 12 }
]

// mock interests data
const interests = [
  { id: 'restaurants', name: 'Restaurants', icon: 'Utensils', category: 'Food & Dining', description: 'Fine dining, local cuisine, and food experiences', popular: true, order: 1 },
  { id: 'bars-nightlife', name: 'Bars & Nightlife', icon: 'Wine', category: 'Nightlife', description: 'Cocktail bars, wine bars, and nightlife venues', popular: true, order: 2 },
  { id: 'coffee-cafes', name: 'Coffee & Cafés', icon: 'Coffee', category: 'Food & Dining', description: 'Specialty coffee shops and cozy cafés', popular: true, order: 3 },
  { id: 'cultural-attractions', name: 'Cultural Attractions', icon: 'Palette', category: 'Culture & Arts', description: 'Museums, galleries, and cultural sites', popular: true, order: 4 },
  { id: 'parks-outdoor', name: 'Parks & Outdoor', icon: 'Trees', category: 'Outdoor Activities', description: 'Parks, gardens, and outdoor recreational activities', popular: true, order: 5 },
  { id: 'shopping', name: 'Shopping', icon: 'ShoppingBag', category: 'Shopping & Retail', description: 'Markets, boutiques, and shopping experiences', popular: true, order: 6 },
  { id: 'live-music', name: 'Live Music', icon: 'Music', category: 'Entertainment', description: 'Concerts, live music venues, and performances', popular: true, order: 7 },
  { id: 'sports-fitness', name: 'Sports & Fitness', icon: 'Dumbbell', category: 'Sports & Recreation', description: 'Gyms, sports activities, and fitness experiences', popular: true, order: 8 },
  { id: 'tours-sightseeing', name: 'Tours & Sightseeing', icon: 'MapPin', category: 'Tourism', description: 'Guided tours, walking tours, and sightseeing', popular: true, order: 9 },
  { id: 'art-creativity', name: 'Art & Creativity', icon: 'Paintbrush', category: 'Culture & Arts', description: 'Art workshops, creative spaces, and artistic experiences', popular: false, order: 10 },
  { id: 'wellness-spa', name: 'Wellness & Spa', icon: 'Heart', category: 'Health & Wellness', description: 'Spas, wellness centers, and relaxation experiences', popular: false, order: 11 },
  { id: 'food-markets', name: 'Food Markets', icon: 'Apple', category: 'Food & Dining', description: 'Local markets, food halls, and culinary markets', popular: true, order: 12 }
]

// mock experiences data
const experiences = [
  {
    id: 'buenos-aires-tango-night',
    title: 'Tango Night in Buenos Aires',
    description: 'Experience the passion of Argentine tango with professional dancers in a historic milonga',
    hostId: 'host-argentina',
    venue: 'La Catedral Club',
    venueType: 'Dance Club',
    city: 'Buenos Aires',
    date: new Date('2024-02-15T20:00:00Z'),
    minContribution: 0.1,
    maxParticipants: 20,
    currentParticipants: 8,
    status: 'published',
    includedItems: ['Professional tango lesson', 'Live music', 'Welcome drink', 'Snacks'],
    checkinPercentage: 80,
    midExperiencePercentage: 60,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  },
  {
    id: 'paris-wine-tasting',
    title: 'Wine Tasting in Paris',
    description: 'Discover French wines with a sommelier in a charming Parisian wine cellar',
    hostId: 'host-france',
    venue: 'Cave de la Madeleine',
    venueType: 'Wine Bar',
    city: 'Paris',
    date: new Date('2024-02-20T19:00:00Z'),
    minContribution: 0.2,
    maxParticipants: 15,
    currentParticipants: 12,
    status: 'published',
    includedItems: ['Wine tasting flight', 'Cheese pairing', 'Expert guidance', 'Take-home wine guide'],
    checkinPercentage: 90,
    midExperiencePercentage: 75,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  },
  {
    id: 'tokyo-ramen-tour',
    title: 'Ramen Tour in Tokyo',
    description: 'Explore the best ramen shops in Tokyo with a local food expert',
    hostId: 'host-japan',
    venue: 'Various Ramen Shops',
    venueType: 'Food Tour',
    city: 'Tokyo',
    date: new Date('2024-02-25T18:00:00Z'),
    minContribution: 0.15,
    maxParticipants: 12,
    currentParticipants: 6,
    status: 'published',
    includedItems: ['3 ramen tastings', 'Local guide', 'Transportation', 'Cultural insights'],
    checkinPercentage: 70,
    midExperiencePercentage: 50,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  },
  {
    id: 'new-york-broadway-backstage',
    title: 'Broadway Backstage Tour',
    description: 'Go behind the scenes of a Broadway show with exclusive backstage access',
    hostId: 'host-nyc',
    venue: 'Broadway Theater District',
    venueType: 'Theater',
    city: 'New York',
    date: new Date('2024-03-01T14:00:00Z'),
    minContribution: 0.3,
    maxParticipants: 10,
    currentParticipants: 10,
    status: 'full',
    includedItems: ['Backstage tour', 'Meet cast members', 'Show ticket', 'Souvenir program'],
    checkinPercentage: 100,
    midExperiencePercentage: 85,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  },
  {
    id: 'london-pub-crawl',
    title: 'Historic Pub Crawl in London',
    description: 'Visit London\'s most historic pubs and learn about British pub culture',
    hostId: 'host-uk',
    venue: 'Various Historic Pubs',
    venueType: 'Pub Crawl',
    city: 'London',
    date: new Date('2024-03-05T19:00:00Z'),
    minContribution: 0.1,
    maxParticipants: 18,
    currentParticipants: 14,
    status: 'published',
    includedItems: ['4 pub visits', 'Local guide', 'Beer tastings', 'Historical stories'],
    checkinPercentage: 85,
    midExperiencePercentage: 65,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  }
]

// initialize firebase collections
async function initializeFirebaseData() {
  console.log('🚀 Initializing Firebase with mock data...')
  
  try {
    // initialize cities
    console.log('🏙️ Adding cities...')
    for (const city of cities) {
      await setDoc(doc(db, 'cities', city.id), {
        ...city,
        createdAt: Timestamp.now()
      })
    }
    console.log(`✅ Added ${cities.length} cities`)
    
    // initialize interests
    console.log('🎯 Adding interests...')
    for (const interest of interests) {
      await setDoc(doc(db, 'interests', interest.id), {
        ...interest,
        createdAt: Timestamp.now()
      })
    }
    console.log(`✅ Added ${interests.length} interests`)
    
    // initialize experiences
    console.log('🎪 Adding experiences...')
    for (const experience of experiences) {
      await setDoc(doc(db, 'experiences', experience.id), {
        ...experience,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      })
    }
    console.log(`✅ Added ${experiences.length} experiences`)
    
    console.log('🎉 Firebase initialization complete!')
    console.log('📊 Summary:')
    console.log(`   - Cities: ${cities.length}`)
    console.log(`   - Interests: ${interests.length}`)
    console.log(`   - Experiences: ${experiences.length}`)
    
  } catch (error) {
    console.error('❌ Firebase initialization failed:', error)
    throw error
  }
}

// run the initialization
initializeFirebaseData()
  .then(() => {
    console.log('✅ Script completed successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Script failed:', error)
    process.exit(1)
  })
