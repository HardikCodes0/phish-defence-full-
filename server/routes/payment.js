const express = require('express');
const router = express.Router();
// Check if Stripe secret key is properly configured
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
if (!stripeSecretKey || stripeSecretKey.startsWith('pk_')) {
  console.error('❌ Invalid Stripe secret key. Please check your .env file.');
  console.error('   Secret key should start with "sk_test_" or "sk_live_"');
}

const stripe = require('stripe')(stripeSecretKey);
const Enrollment = require('../models/Enrollment');
const Course = require('../models/course');
const User = require('../models/users');
const protect = require('../middleware/authmiddleware');

// Create Stripe Checkout Session
router.post('/create-checkout-session', protect, async (req, res) => {
  const { courseId } = req.body;
  const userId = req.user._id;

  try {
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    if (course.isFree) return res.status(400).json({ message: 'Course is free - use direct enrollment instead' });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: req.user.email,
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: course.title,
            description: course.description,
          },
          unit_amount: Math.round(course.price * 100),
        },
        quantity: 1,
      }],
      metadata: {
        courseId: course._id.toString(),
        userId: userId.toString(),
      },
      success_url: 'http://localhost:5173/courses/' + course._id + '?payment=success&session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'http://localhost:5173/courses/' + course._id + '?payment=cancel',
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error('Stripe session error:', err);
    
    // Check if it's a Stripe configuration error
    if (!stripeSecretKey || stripeSecretKey.startsWith('pk_')) {
      return res.status(500).json({ 
        message: 'Payment system not configured. Please contact administrator.' 
      });
    }
    
    // Check if it's a Stripe API error
    if (err.type === 'StripeError') {
      return res.status(400).json({ 
        message: `Payment error: ${err.message}` 
      });
    }
    
    res.status(500).json({ message: 'Failed to create checkout session' });
  }
});

// Verify payment and enroll user
router.post('/verify-payment', protect, async (req, res) => {
  const { sessionId } = req.body;
  const userId = req.user._id;

  try {
    console.log('🔍 Verifying payment for session:', sessionId);
    
    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    console.log('💰 Session status:', session.status);
    
    if (session.status === 'complete') {
      const courseId = session.metadata.courseId;
      
      // Check if already enrolled
      const existing = await Enrollment.findOne({ student: userId, course: courseId });
      if (existing) {
        console.log('ℹ️ User already enrolled');
        return res.json({ 
          success: true, 
          message: 'Already enrolled', 
          enrolled: true 
        });
      }
      
      // Create enrollment
      const enrollment = await Enrollment.create({ 
        student: userId, 
        course: courseId, 
        enrolledat: new Date(), 
        iscompleted: false 
      });
      
      console.log('✅ User enrolled after payment verification:', enrollment);
      res.json({ 
        success: true, 
        message: 'Payment verified and enrolled successfully', 
        enrolled: true 
      });
    } else {
      console.log('❌ Payment not complete, status:', session.status);
      res.status(400).json({ 
        success: false, 
        message: 'Payment not completed' 
      });
    }
  } catch (err) {
    console.error('❌ Payment verification failed:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Payment verification failed', 
      error: err.message 
    });
  }
});

// Stripe Webhook
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  console.log('🔔 Webhook received at:', new Date().toISOString());
  console.log('🔔 Headers:', Object.keys(req.headers));
  console.log('🔔 Body length:', req.body ? req.body.length : 'no body');
  console.log('🔔 Stripe signature:', req.headers['stripe-signature'] ? 'present' : 'missing');
  
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    console.log('✅ Webhook event verified:', event.type);
    console.log('✅ Event data:', JSON.stringify(event.data, null, 2));
  } catch (err) {
    console.error('❌ Webhook signature error:', err.message);
    console.error('❌ Webhook secret:', process.env.STRIPE_WEBHOOK_SECRET ? 'present' : 'missing');
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const courseId = session.metadata.courseId;
    const userId = session.metadata.userId;
    
    console.log('💰 Payment completed for:', { courseId, userId });
    
    // Enroll user in course
    try {
      // Check if already enrolled
      const existing = await Enrollment.findOne({ student: userId, course: courseId });
      console.log('🔍 Existing enrollment check:', existing ? 'Found' : 'Not found');
      
      if (!existing) {
        const newEnrollment = await Enrollment.create({ 
          student: userId, 
          course: courseId, 
          enrolledat: new Date(), 
          iscompleted: false 
        });
        console.log('✅ User enrolled via Stripe:', newEnrollment);
      } else {
        console.log('ℹ️ User already enrolled');
      }
    } catch (err) {
      console.error('❌ Enrollment error:', err);
    }
  } else {
    console.log('ℹ️ Webhook event type:', event.type);
  }

  res.json({ received: true });
});

// Test webhook endpoint (for debugging)
router.post('/test-webhook', async (req, res) => {
  console.log('🧪 Test webhook received at:', new Date().toISOString());
  console.log('🧪 Test webhook body:', JSON.stringify(req.body, null, 2));
  
  // Simulate a successful payment completion
  const { courseId, userId } = req.body;
  
  if (courseId && userId) {
    try {
      console.log('🧪 Simulating enrollment for:', { courseId, userId });
      
      // Check if already enrolled
      const existing = await Enrollment.findOne({ student: userId, course: courseId });
      if (!existing) {
        const enrollment = await Enrollment.create({ 
          student: userId, 
          course: courseId, 
          enrolledat: new Date(), 
          iscompleted: false 
        });
        console.log('🧪 Test enrollment created:', enrollment);
      } else {
        console.log('🧪 User already enrolled in test');
      }
    } catch (err) {
      console.error('🧪 Test enrollment failed:', err);
    }
  }
  
  res.json({ 
    received: true, 
    message: 'Test webhook processed',
    timestamp: new Date().toISOString()
  });
});

// Manual enrollment endpoint (for testing/debugging)
router.post('/manual-enroll', protect, async (req, res) => {
  const { courseId } = req.body;
  const userId = req.user._id;

  try {
    console.log('🔧 Manual enrollment attempt:', { courseId, userId });
    
    // Check if already enrolled
    const existing = await Enrollment.findOne({ student: userId, course: courseId });
    console.log('🔍 Existing enrollment check:', existing ? 'Found' : 'Not found');
    
    if (existing) {
      console.log('ℹ️ User already enrolled');
      return res.json({ message: 'Already enrolled', enrolled: true });
    }

    // Create enrollment
    const enrollment = await Enrollment.create({ 
      student: userId, 
      course: courseId, 
      enrolledat: new Date(), 
      iscompleted: false 
    });
    
    console.log('✅ Manual enrollment successful:', enrollment);
    res.json({ message: 'Enrolled successfully', enrolled: true });
  } catch (err) {
    console.error('❌ Manual enrollment failed:', err);
    res.status(500).json({ message: 'Enrollment failed', error: err.message });
  }
});

// Test endpoint to check enrollment status
router.get('/test-enrollment/:userId/:courseId', async (req, res) => {
  const { userId, courseId } = req.params;
  
  try {
    console.log('🧪 Testing enrollment for:', { userId, courseId });
    
    const enrollment = await Enrollment.findOne({ student: userId, course: courseId });
    console.log('🧪 Enrollment found:', enrollment ? 'Yes' : 'No');
    
    res.json({ 
      enrolled: !!enrollment, 
      enrollment: enrollment,
      message: enrollment ? 'User is enrolled' : 'User is not enrolled'
    });
  } catch (err) {
    console.error('❌ Test enrollment check failed:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 