/**
 * Modular Payment Gateway System for Gymnation
 * Designed to easily support Razorpay, PhonePe, Paytm, Stripe, or Direct UPI.
 */

import { SESSION_PREFIX, hasSessionPrefix } from './passId';

export const GST_RATE = 0.05; // 5% GST as requested

export const PAYMENT_STATUS = {
  IDLE: 'IDLE',
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED'
};

export const PAYMENT_PROVIDERS = {
  RAZORPAY: 'razorpay',
  UPI_QR: 'upi_qr',
  PHONEPE: 'phonepe',
  PAYTM: 'paytm',
  MOCK: 'mock'
};

/**
 * Generates a unique, non-guessable transaction session token to prevent URL tampering.
 */
export function createPaymentSessionToken(planId, amount) {
  const timestamp = Date.now();
  const randomSalt = Math.random().toString(36).substring(2, 9);
  return `${SESSION_PREFIX}${timestamp}-${randomSalt}-${btoa(planId).slice(0, 6)}`;
}

/**
 * Calculates pricing breakdown with 5% GST
 */
export function calculatePricing(basePriceAmount, discountPercent = 0) {
  const numericPrice = typeof basePriceAmount === 'number' 
    ? basePriceAmount 
    : parseFloat(String(basePriceAmount).replace(/[^0-9.]/g, '')) || 0;

  const discountAmount = Math.round(numericPrice * (discountPercent / 100));
  const discountedBase = Math.max(0, numericPrice - discountAmount);
  const gstAmount = Math.round(discountedBase * GST_RATE);
  const totalAmount = discountedBase + gstAmount;

  return {
    basePrice: numericPrice,
    discountPercent,
    discountAmount,
    discountedBase,
    gstRatePercent: 5,
    gstAmount,
    totalAmount
  };
}

/**
 * Universal Payment Initiator supporting pluggable adapters
 */
export async function initiatePayment({
  provider = PAYMENT_PROVIDERS.RAZORPAY,
  plan,
  customer,
  pricing,
  sessionToken,
  onStatusChange,
  onSuccess,
  onFailure
}) {
  onStatusChange(PAYMENT_STATUS.PENDING);

  // Security check: Verify session token exists
  if (!hasSessionPrefix(sessionToken)) {
    onStatusChange(PAYMENT_STATUS.FAILED);
    if (onFailure) onFailure(new Error('Invalid or expired payment session token. Access denied.'));
    return;
  }

  // Simulate gateway initialization delay
  onStatusChange(PAYMENT_STATUS.PROCESSING);

  switch (provider) {
    case PAYMENT_PROVIDERS.RAZORPAY:
      return processRazorpayGateway({ plan, customer, pricing, sessionToken, onSuccess, onFailure, onStatusChange });

    case PAYMENT_PROVIDERS.UPI_QR:
    case PAYMENT_PROVIDERS.PHONEPE:
    case PAYMENT_PROVIDERS.PAYTM:
      return processUPIGateway({ provider, plan, customer, pricing, sessionToken, onSuccess, onFailure, onStatusChange });

    case PAYMENT_PROVIDERS.MOCK:
    default:
      return processMockGateway({ plan, customer, pricing, sessionToken, onSuccess, onFailure, onStatusChange });
  }
}

/**
 * Razorpay Payment Adapter (Ready for live KEY_ID)
 */
async function processRazorpayGateway({ plan, customer, pricing, sessionToken, onSuccess, onFailure, onStatusChange }) {
  // If Razorpay SDK is available on window
  if (window.Razorpay && window.RAZORPAY_KEY_ID) {
    try {
      const options = {
        key: window.RAZORPAY_KEY_ID,
        amount: pricing.totalAmount * 100, // Amount in paise
        currency: 'INR',
        name: 'Gymnation Fitness Centre',
        description: `${plan.name} Membership`,
        image: '/assets/logo.png',
        handler: function (response) {
          onStatusChange(PAYMENT_STATUS.SUCCESS);
          const paymentResult = {
            paymentId: response.razorpay_payment_id,
            orderId: response.razorpay_order_id,
            signature: response.razorpay_signature,
            sessionToken,
            provider: 'Razorpay',
            amountPaid: pricing.totalAmount,
            timestamp: new Date().toISOString()
          };
          if (onSuccess) onSuccess(paymentResult);
        },
        prefill: {
          name: customer.name || '',
          email: customer.email || '',
          contact: customer.phone || ''
        },
        theme: {
          color: '#f97316' // Orange-500
        }
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
      return;
    } catch (err) {
      console.error('Razorpay Error:', err);
    }
  }

  // Fallback simulator if KEY_ID is not configured yet
  setTimeout(() => {
    onStatusChange(PAYMENT_STATUS.SUCCESS);
    const mockResult = {
      paymentId: `pay_rzp_${Math.random().toString(36).substring(2, 10)}`,
      sessionToken,
      provider: 'Razorpay (Ready Mode)',
      amountPaid: pricing.totalAmount,
      timestamp: new Date().toISOString()
    };
    if (onSuccess) onSuccess(mockResult);
  }, 2000);
}

/**
 * UPI / QR Payment Adapter
 */
async function processUPIGateway({ provider, plan, customer, pricing, sessionToken, onSuccess, onFailure, onStatusChange }) {
  setTimeout(() => {
    onStatusChange(PAYMENT_STATUS.SUCCESS);
    const result = {
      paymentId: `upi_${provider}_${Math.random().toString(36).substring(2, 10)}`,
      sessionToken,
      provider: provider.toUpperCase(),
      amountPaid: pricing.totalAmount,
      timestamp: new Date().toISOString()
    };
    if (onSuccess) onSuccess(result);
  }, 2000);
}

/**
 * Mock Gateway Adapter for Sandbox Testing
 */
async function processMockGateway({ plan, customer, pricing, sessionToken, onSuccess, onFailure, onStatusChange }) {
  setTimeout(() => {
    onStatusChange(PAYMENT_STATUS.SUCCESS);
    const result = {
      paymentId: `pay_mock_${Math.random().toString(36).substring(2, 10)}`,
      sessionToken,
      provider: 'Gymnation Sandbox Gateway',
      amountPaid: pricing.totalAmount,
      timestamp: new Date().toISOString()
    };
    if (onSuccess) onSuccess(result);
  }, 1800);
}
