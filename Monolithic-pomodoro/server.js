const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Determine MongoDB URI with IPv4 fallback
const rawUri = process.env.MONGODB_URI;
const defaultUri = 'mongodb://127.0.0.1:27017/pomodoro';
const mongoUri = rawUri
  ? rawUri.replace('localhost', '127.0.0.1')
  : defaultUri;
console.log('Connecting to MongoDB at', mongoUri);

// Initialize express
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from React build
app.use(express.static(path.join(__dirname, 'build')));

// Routes
const authRoutes = require('./routes/auth.routes');
const taskRoutes = require('./routes/task.routes');

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    service: 'pomodoro-monolithic-app',
    timestamp: new Date().toISOString()
  });
});

// Serve React app for all non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Connect to MongoDB
mongoose
  .connect(mongoUri)
  .then(() => {
    console.log('Pomodoro App: MongoDB connected successfully');
    
    // Start server
    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
      console.log(`Pomodoro App running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Pomodoro App: MongoDB connection error:', err);
    process.exit(1);
  });

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  mongoose.connection.close(() => {
    console.log('MongoDB connection closed');
    process.exit(0);
  });
});