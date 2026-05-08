/**
 * Entry point for the social-app backend server
 * This file will be expanded in subsequent issues
 */

const express = require('express');

const app = express();
const PORT = process.env.PORT || 3001;

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
