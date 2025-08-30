// Script to initialize the cities collection in Firebase
// Run with: node scripts/init-cities.js

const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc } = require('firebase/firestore');

// Firebase config - you would normally get this from env vars
const firebaseConfig = {
  // Add your Firebase config here
  // This is just for initial setup, you can run this manually once
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

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
  console.log('Initializing cities collection...');
  
  try {
    for (const city of cities) {
      const cityId = city.name.toLowerCase().replace(/\s+/g, '-');
      const cityRef = doc(db, 'cities', cityId);
      await setDoc(cityRef, city);
      console.log(`Added city: ${city.name}`);
    }
    
    console.log('Cities collection initialized successfully!');
  } catch (error) {
    console.error('Error initializing cities:', error);
  }
}

// Only run if this script is executed directly
if (require.main === module) {
  console.log('Please configure your Firebase credentials in this script, then run it to initialize the cities collection.');
  console.log('Alternatively, you can use the initializeCitiesCollection() function from firebase-cities.ts in your app.');
}

module.exports = { initializeCities };