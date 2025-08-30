import { Router } from 'express';

const router = Router();

// authenticate wallet
router.post('/wallet', async (req, res) => {
  res.json({
    success: true,
    data: { token: 'placeholder-jwt-token' },
    message: 'wallet authentication endpoint - to be implemented'
  });
});

// verify signature
router.post('/verify', async (req, res) => {
  res.json({
    success: true,
    message: 'signature verification endpoint - to be implemented'
  });
});

export default router;
