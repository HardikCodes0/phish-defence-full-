const express = require('express');
const router = express.Router();

// Stripe secret check
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

// ✅ Hardcoded production frontend URL (Netlify)
const FRONTEND_URL = 'https://phishdefencelms.netlify.app';

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
      success_url: `${FRONTEND_URL}/courses/${course._id}?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${FRONTEND_URL}/courses/${course._id}?payment=cancel`,
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error('Stripe session error:', err);

    if (!stripeSecretKey || stripeSecretKey.startsWith('pk_')) {
      return res.status(500).json({
        message: 'Payment system not configured. Please contact administrator.'
      });
    }

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
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.status === 'complete') {
      const courseId = session.metadata.courseId;
      const existing = await Enrollment.findOne({ student: userId, course: courseId });

      if (existing) {
        return res.json({
          success: true,
          message: 'Already enrolled',
          enrolled: true
        });
      }

      const enrollment = await Enrollment.create({
        student: userId,
        course: courseId,
        enrolledat: new Date(),
        iscompleted: false
      });

      res.json({
        success: true,
        message: 'Payment verified and enrolled successfully',
        enrolled: true
      });
    } else {
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
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const courseId = session.metadata.courseId;
    const userId = session.metadata.userId;

    try {
      const existing = await Enrollment.findOne({ student: userId, course: courseId });

      if (!existing) {
        await Enrollment.create({
          student: userId,
          course: courseId,
          enrolledat: new Date(),
          iscompleted: false
        });
      }
    } catch (err) {
      console.error('❌ Enrollment error:', err);
    }
  }

  res.json({ received: true });
});

// Test webhook endpoint (for debugging)
router.post('/test-webhook', async (req, res) => {
  const { courseId, userId } = req.body;

  if (courseId && userId) {
    try {
      const existing = await Enrollment.findOne({ student: userId, course: courseId });
      if (!existing) {
        await Enrollment.create({
          student: userId,
          course: courseId,
          enrolledat: new Date(),
          iscompleted: false
        });
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

// Manual enrollment (testing)
router.post('/manual-enroll', protect, async (req, res) => {
  const { courseId } = req.body;
  const userId = req.user._id;

  try {
    const existing = await Enrollment.findOne({ student: userId, course: courseId });
    if (existing) {
      return res.json({ message: 'Already enrolled', enrolled: true });
    }

    await Enrollment.create({
      student: userId,
      course: courseId,
      enrolledat: new Date(),
      iscompleted: false
    });

    res.json({ message: 'Enrolled successfully', enrolled: true });
  } catch (err) {
    console.error('❌ Manual enrollment failed:', err);
    res.status(500).json({ message: 'Enrollment failed', error: err.message });
  }
});

// Check enrollment status
router.get('/test-enrollment/:userId/:courseId', async (req, res) => {
  const { userId, courseId } = req.params;

  try {
    const enrollment = await Enrollment.findOne({ student: userId, course: courseId });

    res.json({
      enrolled: !!enrollment,
      enrollment,
      message: enrollment ? 'User is enrolled' : 'User is not enrolled'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
