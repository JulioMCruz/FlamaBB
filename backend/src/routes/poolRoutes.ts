import { Router } from 'express';

const router = Router();

// get pool by experience id
router.get('/:experienceId', async (req, res) => {
  res.json({
    success: true,
    data: null,
    message: 'pool endpoint - to be implemented'
  });
});

// contribute to pool
router.post('/:experienceId/contribute', async (req, res) => {
  res.json({
    success: true,
    message: 'contribution endpoint - to be implemented'
  });
});

export default router;
