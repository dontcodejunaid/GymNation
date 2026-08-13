import React, { useState, useEffect } from 'react';
import {
  ShieldCheck, CheckCircle2, Lock, X, QrCode, CreditCard,
  Sparkles, AlertCircle, ArrowRight, Loader2, RefreshCw
} from 'lucide-react';
import {
  calculatePricing,
  initiatePayment,
  PAYMENT_STATUS,
  PAYMENT_PROVIDERS,
  createPaymentSessionToken
} from '../utils/payment';
import { hasSessionPrefix } from '../utils/passId';
import { trackEvent } from '../utils/analytics';

export default function PaymentModal({ plan, discountPercent = 0, isOpen, onClose, onPaymentSuccess }) {
  const [customer, setCustomer] = useState({
    name: '',
    phone: '',
    email: '',
    upiId: ''
  });
  const [selectedProvider, setSelectedProvider] = useState(PAYMENT_PROVIDERS.RAZORPAY);
  const [paymentStatus, setPaymentStatus] = useState(PAYMENT_STATUS.IDLE);
  const [errorMessage, setErrorMessage] = useState('');
  const [paymentResultData, setPaymentResultData] = useState(null);
  const [sessionToken, setSessionToken] = useState('');

  // Initialize secure session token when modal opens with a plan
  useEffect(() => {
    if (isOpen && plan) {
      const token = createPaymentSessionToken(plan.id || 'plan', plan.price || 1500);
      setSessionToken(token);
      setPaymentStatus(PAYMENT_STATUS.IDLE);
      setErrorMessage('');
      setPaymentResultData(null);
    }
  }, [isOpen, plan]);

  if (!isOpen || !plan) return null;

  const pricing = calculatePricing(plan.price || 1500, discountPercent);

  const handleStartCheckout = (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!customer.name || !customer.phone) {
      setErrorMessage('Please enter your Name and Mobile Number to proceed.');
      return;
    }

    if (customer.phone.length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number.');
      return;
    }

    // Security Verification: Require valid session token
    if (!hasSessionPrefix(sessionToken)) {
      setErrorMessage('Security Warning: Invalid payment session. Session expired.');
      return;
    }

    initiatePayment({
      provider: selectedProvider,
      plan,
      customer,
      pricing,
      sessionToken,
      onStatusChange: (status) => setPaymentStatus(status),
      onSuccess: (result) => {
        setPaymentStatus(PAYMENT_STATUS.SUCCESS);
        setPaymentResultData(result);
        trackEvent('MEMBERSHIP_PURCHASED', {
          planName: plan.name,
          amount: pricing.totalAmount,
          provider: selectedProvider
        });
        if (onPaymentSuccess) {
          onPaymentSuccess({
            customer,
            plan,
            pricing,
            paymentResult: result
          });
        }
      },
      onFailure: (err) => {
        setPaymentStatus(PAYMENT_STATUS.FAILED);
        setErrorMessage(err?.message || 'Payment processing failed. Please try again.');
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-8">

        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800/80 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">Secure Checkout</h3>
              <p className="text-xs text-slate-400">Official Gymnation Pass Purchase</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content depending on Payment Lifecycle State */}
        {paymentStatus === PAYMENT_STATUS.SUCCESS ? (
          /* Payment SUCCESS STATE: Digital Pass created ONLY AFTER Success */
          <div className="p-8 text-center space-y-6">
            <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20 animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold uppercase tracking-wider">
                Payment Received & Verified
              </span>
              <h4 className="text-2xl font-black text-white">Welcome to Gymnation!</h4>
              <p className="text-slate-300 text-sm max-w-md mx-auto">
                Your payment of <strong className="text-white">₹{pricing.totalAmount}</strong> was successful. Your official digital membership pass is now generated.
              </p>
            </div>

            {/* Receipt Summary */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-left space-y-2 max-w-md mx-auto">
              <div className="flex justify-between">
                <span className="text-slate-400">Transaction ID:</span>
                <span className="text-amber-400 font-mono font-bold">{paymentResultData?.paymentId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Selected Plan:</span>
                <span className="text-white font-bold">{plan.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Session Security Token:</span>
                <span className="text-slate-500 font-mono text-[10px] truncate max-w-[180px]">{sessionToken}</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-extrabold text-sm shadow-xl shadow-orange-600/30 flex items-center justify-center gap-2 transition-all"
            >
              <span>View My Digital Entry Pass & QR</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        ) : paymentStatus === PAYMENT_STATUS.PROCESSING || paymentStatus === PAYMENT_STATUS.PENDING ? (
          /* Payment PENDING / PROCESSING STATE */
          <div className="p-12 text-center space-y-6">
            <div className="w-16 h-16 bg-orange-500/10 border border-orange-500/30 text-orange-400 rounded-full flex items-center justify-center mx-auto shadow-lg">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
            <div className="space-y-2">
              <h4 className="text-xl font-bold text-white">Processing Payment Securely...</h4>
              <p className="text-slate-400 text-xs max-w-sm mx-auto">
                Connecting to payment gateway. Please do not close or refresh this window.
              </p>
            </div>
          </div>

        ) : (
          /* Payment IDLE / INITIAL STATE */
          <form onSubmit={handleStartCheckout} className="p-6 space-y-6">

            {/* Plan Breakdown */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <div>
                  <h4 className="font-extrabold text-white text-base">{plan.name}</h4>
                  <p className="text-xs text-slate-400">{plan.description}</p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20 text-xs font-extrabold">
                  {plan.tier || 'Selected'}
                </span>
              </div>

              {/* Price Calculation with 5% GST */}
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>Base Price</span>
                  <span>₹{pricing.basePrice.toLocaleString()}</span>
                </div>

                {pricing.discountAmount > 0 && (
                  <div className="flex justify-between text-amber-400 font-semibold">
                    <span>Seasonal Discount ({pricing.discountPercent}%)</span>
                    <span>-₹{pricing.discountAmount.toLocaleString()}</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-400">
                  <span>GST (5%)</span>
                  <span>+₹{pricing.gstAmount.toLocaleString()}</span>
                </div>

                <div className="flex justify-between text-white font-black text-sm pt-2 border-t border-slate-800">
                  <span>Total Due Today</span>
                  <span className="text-orange-400">₹{pricing.totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Customer Details */}
            <div className="space-y-3">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                1. Member Details
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1 font-semibold">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sourav Sharma"
                    value={customer.name}
                    onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1 font-semibold">Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 9876543210"
                    value={customer.phone}
                    onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Modular Payment Gateway Selection */}
            <div className="space-y-3">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                2. Choose Payment Method
              </h5>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedProvider(PAYMENT_PROVIDERS.RAZORPAY)}
                  className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all ${selectedProvider === PAYMENT_PROVIDERS.RAZORPAY
                      ? 'bg-orange-500/10 border-orange-500 text-white shadow-md'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                >
                  <CreditCard className="w-5 h-5 text-orange-400" />
                  <span>Razorpay / Cards</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedProvider(PAYMENT_PROVIDERS.UPI_QR)}
                  className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all ${selectedProvider === PAYMENT_PROVIDERS.UPI_QR
                      ? 'bg-orange-500/10 border-orange-500 text-white shadow-md'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                >
                  <QrCode className="w-5 h-5 text-amber-400" />
                  <span>UPI / GPay / QR</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedProvider(PAYMENT_PROVIDERS.MOCK)}
                  className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all ${selectedProvider === PAYMENT_PROVIDERS.MOCK
                      ? 'bg-orange-500/10 border-orange-500 text-white shadow-md'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                >
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  <span>Instant Test Checkout</span>
                </button>
              </div>
            </div>

            {/* Pay Button */}
            <button
              type="submit"
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-extrabold text-sm shadow-xl shadow-orange-600/30 flex items-center justify-center gap-2 transition-all"
            >
              <Lock className="w-4 h-4" />
              <span>Pay ₹{pricing.totalAmount.toLocaleString()} Securely</span>
            </button>

            <div className="flex items-center justify-center gap-2 text-[10px] text-slate-500">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>256-Bit SSL Encryption • 5% GST Included • Instant Turnstile Entry Pass</span>
            </div>

          </form>
        )}

      </div>
    </div>
  );
}
