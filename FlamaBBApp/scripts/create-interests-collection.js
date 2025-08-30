const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = {
  type: "service_account",
  project_id: "flamabb",
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs"
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'flamabb'
});

const db = admin.firestore();

const interests = [
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
    id: 'tango-dance',
    name: 'Tango & Dance',
    icon: 'Music2',
    category: 'Culture & Arts',
    description: 'Tango shows, dance lessons, and performance venues',
    popular: true,
    order: 8
  },
  {
    id: 'wine-tastings',
    name: 'Wine Tastings',
    icon: 'Wine',
    category: 'Food & Dining',
    description: 'Wine tastings, vineyards, and sommelier experiences',
    popular: true,
    order: 9
  },
  {
    id: 'food-markets',
    name: 'Food Markets',
    icon: 'Apple',
    category: 'Food & Dining', 
    description: 'Local markets, food halls, and culinary markets',
    popular: true,
    order: 10
  },
  {
    id: 'tours-sightseeing',
    name: 'Tours & Sightseeing',
    icon: 'MapPin',
    category: 'Tourism',
    description: 'Guided tours, walking tours, and sightseeing',
    popular: false,
    order: 11
  },
  {
    id: 'sports-fitness',
    name: 'Sports & Fitness',
    icon: 'Dumbbell',
    category: 'Sports & Recreation',
    description: 'Gyms, sports activities, and fitness experiences',
    popular: false,
    order: 12
  }
];

async function createInterestsCollection() {
  try {
    console.log('🔥 Creating interests collection...');
    
    const batch = db.batch();
    
    interests.forEach((interest) => {
      const docRef = db.collection('interests').doc(interest.id);
      batch.set(docRef, {
        ...interest,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
    });
    
    await batch.commit();
    
    console.log(`✅ Successfully created ${interests.length} interests`);
    console.log('🎉 Interests collection ready!');
    
  } catch (error) {
    console.error('❌ Error creating interests:', error);
    process.exit(1);
  }
}

createInterestsCollection()
  .then(() => {
    console.log('✨ Interest collection creation complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Failed to create interests:', error);
    process.exit(1);
  });
