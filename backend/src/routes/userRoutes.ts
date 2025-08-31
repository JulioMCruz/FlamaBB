import { Router } from 'express';
import { z } from 'zod';
import { FirebaseService } from '@/services/firebaseService';
import { authenticateToken } from '@/middleware/authMiddleware';

const router = Router();
const firebaseService = new FirebaseService();

// validation schemas
const updateProfileSchema = z.object({
  username: z.string().optional(),
  bio: z.string().optional(),
  avatar: z.string().optional(),
  shareProfilePublicly: z.boolean().optional()
});

// get user profile (requires authentication)
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user!.userId;
    
    const user = await firebaseService.getUserByWallet(req.user!.walletAddress);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'user not found'
      });
    }

    res.json({
      success: true,
      data: user,
      message: 'user profile retrieved successfully'
    });
  } catch (error) {
    console.error('Error getting user profile:', error);
    res.status(500).json({
      success: false,
      error: 'failed to retrieve user profile'
    });
  }
});

// update user profile (requires authentication)
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user!.userId;
    const updates = updateProfileSchema.parse(req.body);
    
    await firebaseService.updateUser(userId, updates);
    
    // get updated user
    const updatedUser = await firebaseService.getUserByWallet(req.user!.walletAddress);
    
    res.json({
      success: true,
      data: updatedUser,
      message: 'user profile updated successfully'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: 'validation failed',
        details: error.errors
      });
    } else {
      console.error('Error updating user profile:', error);
      res.status(500).json({
        success: false,
        error: 'failed to update user profile'
      });
    }
  }
});

// get user by wallet address (public endpoint)
router.get('/wallet/:walletAddress', async (req, res) => {
  try {
    const { walletAddress } = req.params;
    
    const user = await firebaseService.getUserByWallet(walletAddress);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'user not found'
      });
    }

    // only return public information
    const publicUser = {
      id: user.id,
      username: user.username,
      reputation: user.reputation,
      verificationLevel: user.verificationLevel,
      createdAt: user.createdAt
    };

    res.json({
      success: true,
      data: publicUser,
      message: 'user retrieved successfully'
    });
  } catch (error) {
    console.error('Error getting user by wallet:', error);
    res.status(500).json({
      success: false,
      error: 'failed to retrieve user'
    });
  }
});

export default router;
