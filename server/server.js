const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');

// Load environment variables first
dotenv.config({ path: path.resolve(__dirname, './.env') });

const connectDb = require('./config/db');
const passport = require('passport');
require('./config/passport');

// Route files
const userRoutes = require('./routes/userRoutes');
const courseRoutes = require('./routes/courseroute');
const lessonRoutes = require('./routes/lessonroute');
const quizRoutes = require('./routes/quizroute');
const enrollmentRoutes = require('./routes/enrollmentroute');
const authRoutes = require('./routes/authroutes');
const ratingRoutes = require('./routes/ratingroute');
const supportRoutes = require('./routes/support');
const paymentRoutes = require('./routes/payment');

// Initialize app
const app = express();

// Middleware
app.use('/api/payment/webhook', paymentRoutes); // Webhook must be raw before express.json
app.use(express.json());
app.use(cors());
app.use(passport.initialize());

// Health check routes
app.get('/', (req, res) => {
  res.send('✅ Backend is working');
});

app.get('/about', (req, res) => {
  res.send('ℹ This is the about page');
});

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/lesson', lessonRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/enroll', enrollmentRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/payment', paymentRoutes); // Other payment routes (must come after express.json)

// Connect to DB
connectDb();

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server connected on port ${PORT}`);
});
