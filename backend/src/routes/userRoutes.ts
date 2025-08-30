import { Router } from 'express';

const router = Router();

// get user profile
router.get('/profile', async (req, res) => {
  res.json({
    success: true,
    data: null,
    message: 'user profile endpoint - to be implemented'
  });
});

// update user profile
router.put('/profile', async (req, res) => {
  res.json({
    success: true,
    message: 'user profile update endpoint - to be implemented'
  });
});

export default router;
