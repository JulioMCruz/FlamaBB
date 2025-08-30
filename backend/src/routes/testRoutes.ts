import { Router } from 'express';
import { getAdminDb } from '@/config/firebase';

const router = Router();

// test firebase connection
router.get('/firebase', async (req, res) => {
  try {
    // test basic firebase connection
    const db = getAdminDb();
    console.log('Firebase connection test - DB instance created successfully');
    
    // test a simple query (this won't create any data)
    const testCollection = db.collection('_test_connection');
    const testQuery = await testCollection.limit(1).get();
    
    console.log('Firebase query test - Query executed successfully');
    
    res.json({
      success: true,
      message: 'firebase connection successful',
      timestamp: new Date().toISOString(),
      testQuery: {
        empty: testQuery.empty,
        size: testQuery.size
      }
    });
  } catch (error) {
    console.error('Firebase connection test failed:', error);
    res.status(500).json({
      success: false,
      error: 'firebase connection failed',
      details: error instanceof Error ? error.message : 'unknown error'
    });
  }
});

// test environment variables
router.get('/env', (req, res) => {
  res.json({
    success: true,
    env: {
      hasFirebaseProjectId: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      hasFirebasePrivateKey: !!process.env.FIREBASE_PRIVATE_KEY,
      hasFirebaseClientEmail: !!process.env.FIREBASE_CLIENT_EMAIL,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKeyLength: process.env.FIREBASE_PRIVATE_KEY?.length || 0
    }
  });
});

export default router;
