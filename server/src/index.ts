/**
 * Server Entry Point
 *
 * This is the main entry point for the social-app backend server.
 * It initializes the Express application and sets up the API.
 *
 * Implementation will be added in subsequent tasks.
 */

import express from 'express';

const app = express();
const PORT = process.env.PORT || 5000;

// Basic middleware (will be expanded in future tasks)
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
