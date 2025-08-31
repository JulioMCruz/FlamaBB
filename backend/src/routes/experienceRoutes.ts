import { Router } from 'express';
import { z } from 'zod';
import { FirebaseService } from '@/services/firebaseService';
import { authenticateToken } from '@/middleware/authMiddleware';

const router = Router();
const firebaseService = new FirebaseService();

// validation schemas
const createExperienceSchema = z.object({
  title: z.string().min(1, 'title is required').max(100),
  description: z.string().min(10, 'description must be at least 10 characters'),
  venue: z.string().min(1, 'venue is required'),
  venueType: z.string().min(1, 'venue type is required'),
  city: z.string().min(1, 'city is required'),
  date: z.string().datetime(),
  minContribution: z.number().positive('minimum contribution must be positive'),
  maxParticipants: z.number().int().positive('max participants must be positive'),
  includedItems: z.array(z.string()).optional(),
  checkinPercentage: z.number().min(0).max(100).optional(),
  midExperiencePercentage: z.number().min(0).max(100).optional()
});

const updateExperienceSchema = createExperienceSchema.partial();

// get all experiences
router.get('/', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;
    
    const experiences = await firebaseService.getExperiences(limit, offset);
    
    res.json({
      success: true,
      data: experiences,
      message: 'experiences retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching experiences:', error);
    res.status(500).json({
      success: false,
      error: 'failed to retrieve experiences'
    });
  }
});

// get experience by id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const experience = await firebaseService.getExperienceById(id);
    
    if (!experience) {
      return res.status(404).json({
        success: false,
        error: 'experience not found'
      });
    }
    
    res.json({
      success: true,
      data: experience,
      message: 'experience retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching experience:', error);
    res.status(500).json({
      success: false,
      error: 'failed to retrieve experience'
    });
  }
});

// create new experience (requires authentication)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const validatedData = createExperienceSchema.parse(req.body);
    
    // get user from authenticated request
    const user = req.user as any;
    
    // convert date string to Date object and add host info
    const experienceData = {
      ...validatedData,
      hostId: user.userId,
      hostWalletAddress: user.walletAddress,
      date: new Date(validatedData.date)
    };
    
    const experience = await firebaseService.createExperience(experienceData);
    
    res.status(201).json({
      success: true,
      data: experience,
      message: 'experience created successfully'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: 'validation failed',
        details: error.errors
      });
    } else {
      console.error('Error creating experience:', error);
      res.status(500).json({
        success: false,
        error: 'failed to create experience'
      });
    }
  }
});

// update experience (requires authentication)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const validatedData = updateExperienceSchema.parse(req.body);
    
    // TODO: implement experience service
    res.json({
      success: true,
      data: validatedData,
      message: 'experience updated successfully'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: 'validation failed',
        details: error.errors
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'failed to update experience'
      });
    }
  }
});

// delete experience (requires authentication)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // TODO: implement experience service
    res.json({
      success: true,
      message: 'experience deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'failed to delete experience'
    });
  }
});

export default router;
