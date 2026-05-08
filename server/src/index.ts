/**
 * Entry point for the social-app backend server
 */

import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';

const app = express();
const PORT = process.env.PORT || 3001;

// Validate required environment variables
if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'change-this-to-a-strong-random-secret-at-least-32-characters-long') {
  console.error('FATAL: JWT_SECRET must be set in environment with a strong value');
  process.exit(1);
}

if (!process.env.DATABASE_URL) {
  console.error('FATAL: DATABASE_URL must be set in environment');
  process.exit(1);
}

// Configure CORS
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

// Parse JSON request bodies
app.use(express.json());

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Mount authentication routes
app.use('/auth', authRoutes);

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Handle server startup errors
server.on('error', (error) => {
  console.error('Server startup error:', error);
  process.exit(1);
});
