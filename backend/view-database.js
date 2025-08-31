// script to view database contents
import { getAdminDb } from './src/config/firebase.ts';

async function viewDatabase() {
  console.log('🔍 Viewing database contents...\n');
  
  try {
    const db = getAdminDb();
    
    // view all users
    console.log('👥 USERS:');
    console.log('==========');
    const usersSnapshot = await db.collection('users').get();
    
    if (usersSnapshot.empty) {
      console.log('No users found in database');
    } else {
      usersSnapshot.forEach((doc) => {
        const user = doc.data();
        console.log(`ID: ${doc.id}`);
        console.log(`Wallet: ${user.walletAddress}`);
        console.log(`Username: ${user.displayName || user.username}`);
        console.log(`Created: ${user.createdAt?.toDate?.() || user.createdAt}`);
        console.log('---');
      });
    }
    
    console.log('\n🎪 EXPERIENCES:');
    console.log('===============');
    const experiencesSnapshot = await db.collection('experiences').get();
    
    if (experiencesSnapshot.empty) {
      console.log('No experiences found in database');
    } else {
      experiencesSnapshot.forEach((doc) => {
        const experience = doc.data();
        console.log(`ID: ${doc.id}`);
        console.log(`Title: ${experience.title}`);
        console.log(`Host: ${experience.hostId || experience.hostWalletAddress}`);
        console.log(`City: ${experience.city}`);
        console.log(`Status: ${experience.status}`);
        console.log(`Created: ${experience.createdAt?.toDate?.() || experience.createdAt}`);
        console.log('---');
      });
    }
    
  } catch (error) {
    console.error('❌ Error viewing database:', error);
  }
}

viewDatabase();
