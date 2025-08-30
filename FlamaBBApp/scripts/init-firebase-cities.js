const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
// This will use the service account key from environment variables
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'flamabb'
  });
}

const db = admin.firestore();

const cities = [
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
];

async function initializeCities() {
  console.log('🚀 Initializing cities collection in Firebase...');
  
  try {
    const batch = db.batch();
    
    for (const city of cities) {
      const cityId = city.name.toLowerCase().replace(/\s+/g, '-');
      const cityRef = db.collection('cities').doc(cityId);
      batch.set(cityRef, city);
      console.log(`📍 Adding city: ${city.name} (${city.country})`);
    }
    
    await batch.commit();
    console.log('✅ Cities collection initialized successfully!');
    console.log(`📊 Total cities added: ${cities.length}`);
    
    // Verify the data was written
    const snapshot = await db.collection('cities').orderBy('order').get();
    console.log('🔍 Verification - Cities in database:');
    snapshot.forEach(doc => {
      const data = doc.data();
      console.log(`   ${data.order}. ${data.name} ${data.icon} (${data.country})`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error initializing cities:', error);
    process.exit(1);
  }
}

// Run the initialization
initializeCities();