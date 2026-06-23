const express = require('express');
const cors = require('cors');
const path = require('path');
const morgan = require('morgan');

const errorHandler = require('./middleware/error');

// Import routes
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const groupRoutes = require('./routes/groupRoutes');
const projectRoutes = require('./routes/projectRoutes');
const guideRoutes = require('./routes/guideRoutes');
const noticeRoutes = require('./routes/noticeRoutes');
const taskRoutes = require('./routes/taskRoutes');
const documentRoutes = require('./routes/documentRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const evaluationRoutes = require('./routes/evaluationRoutes');
const messageRoutes = require('./routes/messageRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const reportRoutes = require('./routes/reportRoutes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Register Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/guides', guideRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/evaluations', evaluationRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/reports', reportRoutes);

// Serve React frontend build
app.use(express.static(path.join(__dirname, '../../frontend-build')));

// Catch-all: serve index.html for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend-build', 'index.html'));
});

// Centralized Error Handler
app.use(errorHandler);

module.exports = app;
