import { Router } from 'express';
import { z } from 'zod';
import { AuthService } from '@/services/authService';

const router = Router();
const authService = new AuthService();

// validation schemas
const firebaseAuthSchema = z.object({
  firebaseToken: z.string().min(1, 'firebase token is required')
});

const walletAuthSchema = z.object({
  walletAddress: z.string().min(1, 'wallet address is required'),
  signature: z.string().min(1, 'signature is required'),
  message: z.string().min(1, 'message is required')
});

// authenticate with firebase token
router.post('/firebase', async (req, res) => {
  try {
    const { firebaseToken } = firebaseAuthSchema.parse(req.body);
    
    const result = await authService.authenticateWithFirebase(firebaseToken);
    
    if (!result) {
      return res.status(401).json({
        success: false,
        error: 'authentication failed'
      });
    }

    res.json({
      success: true,
      data: {
        token: result.token,
        user: result.user
      },
      message: 'authentication successful'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: 'validation failed',
        details: error.errors
      });
    } else {
      console.error('Firebase auth error:', error);
      res.status(500).json({
        success: false,
        error: 'authentication failed'
      });
    }
  }
});

// authenticate with wallet signature
router.post('/wallet', async (req, res) => {
  try {
    const { walletAddress, signature, message } = walletAuthSchema.parse(req.body);
    
    const result = await authService.authenticateWithWallet(walletAddress, signature, message);
    
    if (!result) {
      return res.status(401).json({
        success: false,
        error: 'authentication failed'
      });
    }

    res.json({
      success: true,
      data: {
        token: result.token,
        user: result.user
      },
      message: 'wallet authentication successful'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: 'validation failed',
        details: error.errors
      });
    } else {
      console.error('Wallet auth error:', error);
      res.status(500).json({
        success: false,
        error: 'authentication failed'
      });
    }
  }
});

// verify jwt token
router.post('/verify', async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'token is required'
      });
    }

    const decoded = authService.verifyToken(token);
    
    if (!decoded) {
      return res.status(401).json({
        success: false,
        error: 'invalid token'
      });
    }

    const user = await authService.getUserById(decoded.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'user not found'
      });
    }

    res.json({
      success: true,
      data: { user },
      message: 'token verified successfully'
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({
      success: false,
      error: 'verification failed'
    });
  }
});

export default router;
