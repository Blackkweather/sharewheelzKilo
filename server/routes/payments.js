import express from 'express';
import Stripe from 'stripe';
import { protect } from '../middleware/auth.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';

const router = express.Router();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');

router.post('/create-payment-intent',
  protect,
  asyncHandler(async (req, res) => {
    const { amount, currency = 'gbp', bookingId } = req.body;
    
    if (!amount || amount < 100) {
      throw new AppError('Invalid amount', 400);
    }
    
    let customerId = req.user.stripeCustomerId;
    
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: req.user.email,
        name: `${req.user.firstName} ${req.user.lastName}`,
        metadata: { userId: req.user._id.toString() },
      });
      
      customerId = customer.id;
      
      const User = (await import('../models/User.js')).default;
      await User.findByIdAndUpdate(req.user._id, { stripeCustomerId: customerId });
    }
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency,
      customer: customerId,
      metadata: {
        bookingId: bookingId || '',
        userId: req.user._id.toString(),
      },
      automatic_payment_methods: { enabled: true },
    });
    
    res.json({
      status: 'success',
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      },
    });
  })
);

router.post('/webhook',
  express.raw({ type: 'application/json' }),
  asyncHandler(async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;
    
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        console.log('Payment succeeded:', paymentIntent.id);
        break;
      case 'payment_intent.payment_failed':
        console.log('Payment failed:', event.data.object.id);
        break;
    }
    
    res.json({ received: true });
  })
);

router.get('/cards',
  protect,
  asyncHandler(async (req, res) => {
    if (!req.user.stripeCustomerId) {
      return res.json({ data: [] });
    }
    
    const cards = await stripe.paymentMethods.list({
      customer: req.user.stripeCustomerId,
      type: 'card',
    });
    
    res.json({ 
      status: 'success', 
      data: cards.data.map(card => ({
        id: card.id,
        brand: card.card.brand,
        last4: card.card.last4,
        expMonth: card.card.exp_month,
        expYear: card.card.exp_year,
      })),
    });
  })
);

export default router;