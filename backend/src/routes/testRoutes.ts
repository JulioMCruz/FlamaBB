import { Router } from 'express';
import { getAdminDb } from '@/config/firebase';
import { AuthService } from '@/services/authService';
import { authenticateToken } from '@/middleware/authMiddleware';

const router = Router();
const authService = new AuthService();

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
      hasJwtSecret: !!process.env.JWT_SECRET,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKeyLength: process.env.FIREBASE_PRIVATE_KEY?.length || 0,
      jwtSecretLength: process.env.JWT_SECRET?.length || 0
    }
  });
});

// test jwt token generation
router.get('/jwt', (req, res) => {
  try {
    const testUserId = 'test-user-123';
    const testWalletAddress = '0x1234567890123456789012345678901234567890';
    
    // test token generation
    const token = authService['generateToken'](testUserId, testWalletAddress);
    
    // test token verification
    const decoded = authService.verifyToken(token);
    
    res.json({
      success: true,
      message: 'jwt token system working',
      test: {
        tokenGenerated: !!token,
        tokenVerified: !!decoded,
        userId: decoded?.userId,
        walletAddress: decoded?.walletAddress
      }
    });
  } catch (error) {
    console.error('JWT test failed:', error);
    res.status(500).json({
      success: false,
      error: 'jwt test failed',
      details: error instanceof Error ? error.message : 'unknown error'
    });
  }
});

// test authentication middleware
router.get('/auth-test', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: 'authentication middleware working',
    user: req.user
  });
});

export default router;
