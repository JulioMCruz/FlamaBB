import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';

// load environment variables
dotenv.config();

// import routes
import experienceRoutes from '@/routes/experienceRoutes';
import userRoutes from '@/routes/userRoutes';
import poolRoutes from '@/routes/poolRoutes';
import authRoutes from '@/routes/authRoutes';

// import middleware
import { errorHandler } from '@/middleware/errorHandler';
import { requestLogger } from '@/middleware/requestLogger';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'flamabb-backend'
  });
});

// api routes
app.use('/api/experiences', experienceRoutes);
app.use('/api/users', userRoutes);
app.use('/api/pools', poolRoutes);
app.use('/api/auth', authRoutes);

// websocket connection for real-time features
io.on('connection', (socket) => {
  console.log('user connected:', socket.id);
  
  // join experience room
  socket.on('join-experience', (experienceId: string) => {
    socket.join(`experience-${experienceId}`);
    console.log(`user ${socket.id} joined experience ${experienceId}`);
  });
  
  // handle check-ins
  socket.on('check-in', (data) => {
    socket.to(`experience-${data.experienceId}`).emit('user-checked-in', data);
  });
  
  // handle pool updates
  socket.on('pool-update', (data) => {
    socket.to(`experience-${data.experienceId}`).emit('pool-updated', data);
  });
  
  socket.on('disconnect', () => {
    console.log('user disconnected:', socket.id);
  });
});

// error handling middleware (must be last)
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'route not found',
    path: req.originalUrl 
  });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`🔥 FlamaBB Backend running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
});
