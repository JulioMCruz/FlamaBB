// script to initialize firebase with mock data using admin sdk
// run with: node scripts/init-firebase-data.js

require('dotenv').config({ path: '../.env' })
const admin = require('firebase-admin')

// initialize firebase admin
const serviceAccount = {
  type: "service_account",
  project_id: "flamabb",
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.FIREBASE_CLIENT_EMAIL}`
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
})

const db = admin.firestore()

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

// mock experiences data for live demo
const experiences = [
  {
    id: 'buenos-aires-tango-night',
    title: 'Tango Night in Buenos Aires',
    description: 'Experience the passion of Argentine tango with professional dancers in a historic milonga. Learn the basic steps and enjoy live music in an authentic atmosphere.',
    hostId: 'host-argentina',
    venue: 'La Catedral Club',
    venueType: 'Dance Club',
    city: 'Buenos Aires',
    date: new Date('2024-12-15T20:00:00Z'),
    minContribution: 0.1,
    maxParticipants: 20,
    currentParticipants: 8,
    status: 'published',
    includedItems: ['Professional tango lesson', 'Live music', 'Welcome drink', 'Snacks'],
    checkinPercentage: 80,
    midExperiencePercentage: 60,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    imageUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&h=600&fit=crop',
    tags: ['dance', 'culture', 'music', 'nightlife']
  },
  {
    id: 'paris-wine-tasting',
    title: 'Wine Tasting in Paris',
    description: 'Discover French wines with a sommelier in a charming Parisian wine cellar. Taste exceptional wines and learn about French wine culture.',
    hostId: 'host-france',
    venue: 'Cave de la Madeleine',
    venueType: 'Wine Bar',
    city: 'Paris',
    date: new Date('2024-12-20T19:00:00Z'),
    minContribution: 0.2,
    maxParticipants: 15,
    currentParticipants: 12,
    status: 'published',
    includedItems: ['Wine tasting flight', 'Cheese pairing', 'Expert guidance', 'Take-home wine guide'],
    checkinPercentage: 90,
    midExperiencePercentage: 75,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    imageUrl: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&h=600&fit=crop',
    tags: ['wine', 'food', 'culture', 'luxury']
  },
  {
    id: 'tokyo-ramen-tour',
    title: 'Ramen Tour in Tokyo',
    description: 'Explore the best ramen shops in Tokyo with a local food expert. Visit hidden gems and learn about Japanese ramen culture.',
    hostId: 'host-japan',
    venue: 'Various Ramen Shops',
    venueType: 'Food Tour',
    city: 'Tokyo',
    date: new Date('2024-12-25T18:00:00Z'),
    minContribution: 0.15,
    maxParticipants: 12,
    currentParticipants: 6,
    status: 'published',
    includedItems: ['3 ramen tastings', 'Local guide', 'Transportation', 'Cultural insights'],
    checkinPercentage: 70,
    midExperiencePercentage: 50,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&h=600&fit=crop',
    tags: ['food', 'culture', 'local', 'tasting']
  },
  {
    id: 'new-york-broadway-backstage',
    title: 'Broadway Backstage Tour',
    description: 'Go behind the scenes of a Broadway show with exclusive backstage access. Meet cast members and see how the magic happens.',
    hostId: 'host-nyc',
    venue: 'Broadway Theater District',
    venueType: 'Theater',
    city: 'New York',
    date: new Date('2024-12-30T14:00:00Z'),
    minContribution: 0.3,
    maxParticipants: 10,
    currentParticipants: 10,
    status: 'full',
    includedItems: ['Backstage tour', 'Meet cast members', 'Show ticket', 'Souvenir program'],
    checkinPercentage: 100,
    midExperiencePercentage: 85,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop',
    tags: ['theater', 'culture', 'exclusive', 'entertainment']
  },
  {
    id: 'london-pub-crawl',
    title: 'Historic Pub Crawl in London',
    description: 'Visit London\'s most historic pubs and learn about British pub culture. Discover hidden gems and traditional British hospitality.',
    hostId: 'host-uk',
    venue: 'Various Historic Pubs',
    venueType: 'Pub Crawl',
    city: 'London',
    date: new Date('2025-01-05T19:00:00Z'),
    minContribution: 0.1,
    maxParticipants: 18,
    currentParticipants: 14,
    status: 'published',
    includedItems: ['4 pub visits', 'Local guide', 'Beer tastings', 'Historical stories'],
    checkinPercentage: 85,
    midExperiencePercentage: 65,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    imageUrl: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&h=600&fit=crop',
    tags: ['pub', 'culture', 'history', 'social']
  },
  {
    id: 'barcelona-tapas-tour',
    title: 'Tapas Tour in Barcelona',
    description: 'Experience authentic Spanish tapas culture in Barcelona\'s most vibrant neighborhoods. Taste traditional dishes and learn about Spanish cuisine.',
    hostId: 'host-spain',
    venue: 'Various Tapas Bars',
    venueType: 'Food Tour',
    city: 'Barcelona',
    date: new Date('2025-01-10T20:00:00Z'),
    minContribution: 0.12,
    maxParticipants: 16,
    currentParticipants: 9,
    status: 'published',
    includedItems: ['5 tapas tastings', 'Wine pairings', 'Local guide', 'Cultural insights'],
    checkinPercentage: 75,
    midExperiencePercentage: 55,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    imageUrl: 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800&h=600&fit=crop',
    tags: ['food', 'culture', 'tasting', 'social']
  }
]

// initialize firebase collections
async function initializeFirebaseData() {
  console.log('🚀 Initializing Firebase with mock data...')
  console.log('📊 Project ID:', serviceAccount.project_id)
  
  try {
    // initialize cities
    console.log('🏙️ Adding cities...')
    for (const city of cities) {
      await db.collection('cities').doc(city.id).set({
        ...city,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      })
      console.log(`  ✅ Added: ${city.name}`)
    }
    console.log(`✅ Added ${cities.length} cities`)
    
    // initialize interests
    console.log('🎯 Adding interests...')
    for (const interest of interests) {
      await db.collection('interests').doc(interest.id).set({
        ...interest,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      })
      console.log(`  ✅ Added: ${interest.name}`)
    }
    console.log(`✅ Added ${interests.length} interests`)
    
    // initialize experiences
    console.log('🎪 Adding experiences...')
    for (const experience of experiences) {
      await db.collection('experiences').doc(experience.id).set({
        ...experience,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      })
      console.log(`  ✅ Added: ${experience.title}`)
    }
    console.log(`✅ Added ${experiences.length} experiences`)
    
    console.log('🎉 Firebase initialization complete!')
    console.log('📊 Summary:')
    console.log(`   - Cities: ${cities.length}`)
    console.log(`   - Interests: ${interests.length}`)
    console.log(`   - Experiences: ${experiences.length}`)
    console.log('🌐 Check your Firebase console to see the data!')
    
  } catch (error) {
    console.error('❌ Firebase initialization failed:', error)
    console.error('Error details:', error.message)
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
