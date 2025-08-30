import { Router } from 'express';
import { z } from 'zod';

const router = Router();

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
    // TODO: implement experience service
    res.json({
      success: true,
      data: [],
      message: 'experiences retrieved successfully'
    });
  } catch (error) {
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
    
    // TODO: implement experience service
    res.json({
      success: true,
      data: null,
      message: 'experience retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'failed to retrieve experience'
    });
  }
});

// create new experience
router.post('/', async (req, res) => {
  try {
    const validatedData = createExperienceSchema.parse(req.body);
    
    // TODO: implement experience service
    res.status(201).json({
      success: true,
      data: validatedData,
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
      res.status(500).json({
        success: false,
        error: 'failed to create experience'
      });
    }
  }
});

// update experience
router.put('/:id', async (req, res) => {
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

// delete experience
router.delete('/:id', async (req, res) => {
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
