// Membership signup recorder.
//
// Anyone who takes a membership — through the secure checkout modal or by
// picking a plan and submitting the booking form — is written here. Each
// signup lands in three places:
//   localStorage['gymnation_member_signups']  <- instant, offline-safe
//   Firestore 'membershipSignups'           <- the owner's cloud database
//   a 'gymnation_memberships_signup' event    <- so an open admin tab refreshes
//
// The admin portal's Memberships tab reads all of them.

import { addMemberSignup, getMemberSignups } from './adminStore';
import { saveMembershipSignupToFirebase } from '../firebase';

export const MEMBERSHIP_SIGNUP_EVENT = 'gymnation_memberships_signup';

// Picking a plan opens checkout *and* scrolls to the booking form, so one
// person can trigger both paths. Within this window they count as one signup.
const DUPLICATE_WINDOW_MS = 5 * 60 * 1000;

/** '₹2,500' / '₹2,500/mo' / 2500 -> 2500. Returns 0 when there's no number. */
export function parsePriceAmount(value) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  if (!value) return 0;
  const digits = String(value).replace(/[^0-9.]/g, '');
  const amount = parseFloat(digits);
  return Number.isFinite(amount) ? amount : 0;
}

const toISODate = (date) => date.toISOString().split('T')[0];

/** Adds whole months to a date without rolling past the end of a short month. */
function addMonths(date, months) {
  const result = new Date(date.getTime());
  const targetDay = result.getDate();
  result.setMonth(result.getMonth() + months);
  if (result.getDate() < targetDay) result.setDate(0);
  return result;
}

export function newMemberId(name = '') {
  const nameSlug = (name || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  const num = Math.floor(10000 + Math.random() * 90000);
  return nameSlug ? `${nameSlug}-${num}` : `MB-${num}`;
}

/**
 * Normalises whatever the calling flow has into one membership row.
 *
 * @param {object} input
 * @param {object} input.customer      { name, phone, email }
 * @param {object} input.plan          the chosen plan
 * @param {object} [input.pricing]     checkout breakdown, when there was a payment
 * @param {object} [input.paymentResult] gateway response, when there was a payment
 * @param {string} [input.source]      'Online Payment' | 'Booking Form' | …
 */
export function buildMembershipSignup({
  customer = {},
  plan = {},
  pricing = null,
  paymentResult = null,
  source = 'Online Payment',
  startDate = null,
} = {}) {
  const billingCycle = plan.selectedCycle === 'yearly' ? 'yearly' : 'monthly';
  const start = startDate ? new Date(`${startDate}T00:00:00`) : new Date();
  const validStart = Number.isNaN(start.getTime()) ? new Date() : start;
  const end = addMonths(validStart, billingCycle === 'yearly' ? 12 : 1);

  const priceLabel = plan.price || plan.priceMonthly || '';
  const amountPaid = pricing
    ? Number(pricing.totalAmount) || 0
    : parsePriceAmount(priceLabel);

  const memberName = customer.name || 'Gymnation Member';
  const id = newMemberId(memberName);

  return {
    id,

    // Member
    memberName,
    phone: customer.phone || '',
    email: customer.email || '',

    // Plan
    planId: plan.id || plan.docId || '',
    planName: plan.name || 'Gymnation Membership',
    planTier: plan.tier || '',
    billingCycle,
    priceLabel,

    // Money
    amountPaid,
    basePrice: pricing ? Number(pricing.basePrice) || 0 : parsePriceAmount(priceLabel),
    discountAmount: pricing ? Number(pricing.discountAmount) || 0 : 0,
    gstAmount: pricing ? Number(pricing.gstAmount) || 0 : 0,
    paymentId: paymentResult?.paymentId || '',
    paymentProvider: paymentResult?.provider || '',
    paymentStatus: paymentResult ? 'Paid' : 'Pending at Counter',

    // Lifecycle
    startDate: toISODate(validStart),
    endDate: toISODate(end),
    status: 'Active',

    source,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Records a membership signup locally first (never lost, even offline) and
 * then mirrors it to Firestore.
 *
 * @returns {Promise<object>} the stored signup row
 */
export async function recordMembershipSignup(input) {
  const signup = buildMembershipSignup(input);

  const duplicate = getMemberSignups().find((existing) => {
    if (!signup.phone || existing.phone !== signup.phone) return false;
    if (existing.planName !== signup.planName) return false;
    const age = Date.now() - new Date(existing.createdAt || 0).getTime();
    return age >= 0 && age < DUPLICATE_WINDOW_MS;
  });

  if (duplicate) return duplicate;

  addMemberSignup(signup);

  try {
    window.dispatchEvent(new CustomEvent(MEMBERSHIP_SIGNUP_EVENT, { detail: signup }));
  } catch {
    // CustomEvent is unavailable in non-browser contexts — nothing to notify.
  }

  try {
    await saveMembershipSignupToFirebase(signup);
  } catch (error) {
    console.warn('Membership signup could not reach Firebase, kept locally:', error?.message);
  }

  return signup;
}

/**
 * Patch that pushes a membership one more billing cycle forward. Renewing an
 * already-lapsed plan restarts from today rather than from the old end date,
 * so the member gets the full term they paid for.
 */
export function buildRenewalPatch(signup) {
  const cycleMonths = signup?.billingCycle === 'yearly' ? 12 : 1;
  const currentEnd = signup?.endDate ? new Date(`${signup.endDate}T00:00:00`) : null;
  const hasFutureEnd = currentEnd && !Number.isNaN(currentEnd.getTime()) && currentEnd.getTime() > Date.now();
  const base = hasFutureEnd ? currentEnd : new Date();

  return {
    endDate: toISODate(addMonths(base, cycleMonths)),
    status: 'Active',
    renewedAt: new Date().toISOString(),
  };
}

/** True when a booking-form submission was made against a chosen plan. */
export function isMembershipService(serviceLabel) {
  return typeof serviceLabel === 'string' && serviceLabel.startsWith('Membership:');
}
