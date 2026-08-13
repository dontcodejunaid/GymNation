// Data layer for the admin portal.
//
// Everything lives in localStorage, on the same keys the public site already
// reads, so an edit here shows up on the live site after a refresh:
//   gymnation_bookings  <- BookingForm.jsx writes, Bookings panel manages
//   gymnation_trainers  <- Trainers.jsx reads
//   gymnation_classes   <- ClassSchedule.jsx reads
//   gymnation_memberships <- managed here only (no public section renders it yet)

import { INITIAL_TRAINERS, INITIAL_SCHEDULE } from '../data/trainersAndScheduleData';
import { DEFAULT_MEMBERSHIP_PLANS } from '../data/membershipPlans';

export const STORE_KEYS = {
  BOOKINGS: 'gymnation_bookings',
  TRAINERS: 'gymnation_trainers',
  CLASSES: 'gymnation_classes',
  MEMBERSHIPS: 'gymnation_memberships',
  ABOUT: 'gymnation_about_data',
  MEMBER_SIGNUPS: 'gymnation_member_signups',
};

export const INITIAL_ABOUT_DATA = {
  header: {
    badge: 'About Gymnation Fitness Centre',
    titleMain: 'More Than a Gym - A Community',
    titleSub: 'Built on Discipline & Growth',
    story: "Gymnation Fitness Centre was founded with a simple belief: fitness should be accessible, motivating, and sustainable for everyone - not just athletes. Located in the heart of Shikaripalya, we've built a space where beginners feel welcome and serious lifters feel challenged. Our certified trainers, modern equipment, and supportive community come together to help every member reach their goals, one rep at a time.",
  },
  tabContents: {
    philosophy: {
      title: '1. Consistency Over Intensity',
      quote: 'Sustainable progress beats short bursts of extreme effort. We focus on building lifelong habits.',
      bullets: [
        'Sustainable, habit-building fitness routines',
        'Long-term progressive development over quick fixes',
        'Designed for beginners and advanced athletes alike',
      ],
    },
    equipment: {
      title: '2. Commercial Grade Equipment',
      quote: 'We invest in biomechanically engineered machinery for optimal muscle activation and maximum joint safety.',
      bullets: [
        'Bio-mechanically correct plate-loaded & pin-selected machines',
        'Imported rubberized dumbbells (2.5kg to 50kg) & Olympic turf',
        'Dedicated cardio zone with treadmills, spin bikes & ellipticals',
      ],
    },
    coaching: {
      title: '3. Expert Guidance',
      quote: 'Every plan is backed by certified trainers, not guesswork.',
      bullets: [
        'ACE Certified Trainers & structured guidance',
        'Custom workout & form assessment routines',
        'Regular tracking to ensure consistent results',
      ],
    },
  },
  founder: {
    badge: 'Head Coach & Owner',
    title: "Owner's Note",
    note: '"We didn\'t just want to open another gym — we wanted to build a place where people actually show up. Every piece of equipment, every class, every trainer we hired was chosen with that goal in mind."',
    rating: '4.9 / 5 Rating',
    photo: '',
  },
  highlights: [
    {
      id: 'trainers',
      title: 'Consistency Over Intensity',
      description: 'Sustainable progress beats short bursts of extreme effort.',
      color: 'from-orange-500 to-amber-500',
    },
    {
      id: 'equipment',
      title: 'Community First',
      description: 'Members train together, motivate each other, and celebrate wins together.',
      color: 'from-amber-500 to-red-500',
    },
    {
      id: 'community',
      title: 'Expert Guidance',
      description: 'Every plan is backed by certified trainers, not guesswork.',
      color: 'from-red-500 to-orange-500',
    },
  ],
  badges: [
    { id: 1, text: 'ACE Certified Trainers' },
    { id: 2, text: 'ISO Hygiene Standards' },
    { id: 3, text: 'Karnataka Fitness Association Member' },
    { id: 4, text: '100% Sanitized Facility' },
  ],
  metrics: [
    { value: '5', label: 'Years Active' },
    { value: '1,200+', label: 'Members Trained' },
    { value: '8', label: 'Certified Trainers' },
    { value: '50+', label: 'Pieces of Equipment' },
  ],
};


export const BOOKING_STATUSES = ['Pending', 'Approved', 'Rejected'];

export const MEMBERSHIP_STATUSES = ['Active', 'Expired', 'Cancelled'];

// Dummy price list used only for the revenue estimate. Update these to the
// gym's real rates — nothing else depends on them.
export const SERVICE_PRICES = {
  'Gym Session': 500,
  'Personal Training': 1200,
  'Group Class': 700,
  'Membership Enquiry': 0,
};

function read(key, fallback = []) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch (error) {
    console.error(`Error reading ${key}:`, error);
    return fallback;
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing ${key}:`, error);
  }
  return value;
}

/** Seeds a key from its static defaults the first time the portal opens. */
function readSeeded(key, seed) {
  const raw = localStorage.getItem(key);
  if (raw === null) return write(key, seed);
  return read(key, seed);
}

/* ------------------------------- bookings ------------------------------- */

export const getBookings = () => read(STORE_KEYS.BOOKINGS);
export const saveBookings = (list) => write(STORE_KEYS.BOOKINGS, list);

export function updateBooking(id, patch) {
  const next = getBookings().map((booking) =>
    booking.id === id ? { ...booking, ...patch, updatedAt: new Date().toISOString() } : booking
  );
  return saveBookings(next);
}

export function deleteBooking(id) {
  return saveBookings(getBookings().filter((booking) => booking.id !== id));
}

export const todayISO = () => new Date().toISOString().split('T')[0];

/** Buckets a booking by its date: 'today' | 'upcoming' | 'past'. */
export function bucketOf(booking) {
  const today = todayISO();
  if (!booking.date) return 'past';
  if (booking.date === today) return 'today';
  return booking.date > today ? 'upcoming' : 'past';
}

/* ------------------------- manageable collections ------------------------ */

export const getTrainers = () => readSeeded(STORE_KEYS.TRAINERS, INITIAL_TRAINERS);
export const saveTrainers = (list) => {
  const result = write(STORE_KEYS.TRAINERS, list);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('gymnation-trainers-update'));
    window.dispatchEvent(new Event('storage'));
  }
  return result;
};

export const getClasses = () => readSeeded(STORE_KEYS.CLASSES, INITIAL_SCHEDULE);
export const saveClasses = (list) => {
  const result = write(STORE_KEYS.CLASSES, list);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('gymnation-schedule-update'));
    window.dispatchEvent(new Event('storage'));
  }
  return result;
};

/**
 * Membership plans, shared by the public pricing section and the admin editor.
 * An earlier build seeded a flatter shape ({name, price, duration}); anything
 * missing priceMonthly predates the current schema and is replaced with the
 * defaults rather than rendered as a broken card.
 */
export function getMemberships() {
  const stored = readSeeded(STORE_KEYS.MEMBERSHIPS, DEFAULT_MEMBERSHIP_PLANS);

  const isCurrentSchema =
    Array.isArray(stored) &&
    stored.length > 0 &&
    stored.every((plan) => typeof plan?.priceMonthly === 'string');

  if (!isCurrentSchema) return write(STORE_KEYS.MEMBERSHIPS, DEFAULT_MEMBERSHIP_PLANS);
  return stored;
}

export const saveMemberships = (list) => {
  const result = write(STORE_KEYS.MEMBERSHIPS, list);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('gymnation-memberships-update'));
    window.dispatchEvent(new Event('storage'));
  }
  return result;
};

export const newId = (prefix) => `${prefix}-${Date.now().toString(36)}`;

/* --------------------------- membership signups -------------------------- */
// One row per person who took a plan — written by the checkout flow and the
// booking form, managed by the admin Memberships tab, mirrored to Firestore.

export const getMemberSignups = () => read(STORE_KEYS.MEMBER_SIGNUPS);
export const saveMemberSignups = (list) => write(STORE_KEYS.MEMBER_SIGNUPS, list);

/** Adds a signup, replacing any earlier row that carries the same id. */
export function addMemberSignup(signup) {
  const existing = getMemberSignups().filter((item) => item.id !== signup.id);
  return saveMemberSignups([signup, ...existing]);
}

export function updateMemberSignup(id, patch) {
  const next = getMemberSignups().map((signup) =>
    signup.id === id ? { ...signup, ...patch, updatedAt: new Date().toISOString() } : signup
  );
  return saveMemberSignups(next);
}

export function deleteMemberSignup(id) {
  return saveMemberSignups(getMemberSignups().filter((signup) => signup.id !== id));
}

/** Days left before the plan lapses. Negative once it already has. */
export function daysUntilExpiry(signup) {
  if (!signup?.endDate) return null;
  const end = new Date(`${signup.endDate}T23:59:59`);
  if (Number.isNaN(end.getTime())) return null;
  return Math.ceil((end.getTime() - Date.now()) / 86400000);
}

/**
 * The status to show: a stored 'Cancelled' always wins, but an 'Active' plan
 * whose end date has passed is reported as expired without needing a write.
 */
export function effectiveMembershipStatus(signup) {
  const stored = signup?.status || 'Active';
  if (stored === 'Cancelled') return 'Cancelled';
  const remaining = daysUntilExpiry(signup);
  if (remaining !== null && remaining < 0) return 'Expired';
  return stored;
}

/** Active plans lapsing within `withinDays` — the renewal call list. */
export function isExpiringSoon(signup, withinDays = 7) {
  if (effectiveMembershipStatus(signup) !== 'Active') return false;
  const remaining = daysUntilExpiry(signup);
  return remaining !== null && remaining >= 0 && remaining <= withinDays;
}

export function buildMembershipStats(signups) {
  const active = signups.filter((signup) => effectiveMembershipStatus(signup) === 'Active');
  const expired = signups.filter((signup) => effectiveMembershipStatus(signup) === 'Expired');
  const cancelled = signups.filter((signup) => effectiveMembershipStatus(signup) === 'Cancelled');
  const expiringSoon = signups.filter((signup) => isExpiringSoon(signup));

  // Revenue counts money actually collected, so cancelled plans still count.
  const revenue = signups.reduce((total, signup) => total + (Number(signup.amountPaid) || 0), 0);

  const byPlan = {};
  signups.forEach((signup) => {
    const name = signup.planName || 'Unspecified plan';
    byPlan[name] = (byPlan[name] || 0) + 1;
  });

  return {
    total: signups.length,
    active: active.length,
    expired: expired.length,
    cancelled: cancelled.length,
    expiringSoon: expiringSoon.length,
    revenue,
    plans: Object.entries(byPlan)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count),
  };
}

/* ------------------------------- analytics ------------------------------- */

/** Parses '07:00 AM' into a 0-23 hour. Returns null if unparseable. */
export function hourOf(timeLabel) {
  if (!timeLabel) return null;
  const match = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(timeLabel.trim());
  if (!match) return null;
  let hour = Number(match[1]) % 12;
  if (match[3].toUpperCase() === 'PM') hour += 12;
  return hour;
}

export function formatHour(hour) {
  const suffix = hour >= 12 ? 'PM' : 'AM';
  const display = hour % 12 === 0 ? 12 : hour % 12;
  return `${display}:00 ${suffix}`;
}

export function buildAnalytics(bookings) {
  // Bookings per day for the last 14 days, oldest first.
  const perDay = [];
  for (let offset = 13; offset >= 0; offset -= 1) {
    const date = new Date();
    date.setDate(date.getDate() - offset);
    const iso = date.toISOString().split('T')[0];
    perDay.push({
      date: iso,
      label: date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      count: bookings.filter((booking) => booking.date === iso).length,
    });
  }

  const byService = {};
  bookings.forEach((booking) => {
    const service = booking.service || 'Unspecified';
    byService[service] = (byService[service] || 0) + 1;
  });
  const services = Object.entries(byService)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  const byHour = {};
  bookings.forEach((booking) => {
    const hour = hourOf(booking.time);
    if (hour === null) return;
    byHour[hour] = (byHour[hour] || 0) + 1;
  });
  const hours = Object.entries(byHour)
    .map(([hour, count]) => ({ hour: Number(hour), label: formatHour(Number(hour)), count }))
    .sort((a, b) => b.count - a.count);

  // Revenue estimate counts approved bookings only.
  const approved = bookings.filter((booking) => booking.status === 'Approved');
  const revenue = approved.reduce(
    (total, booking) => total + (SERVICE_PRICES[booking.service] ?? 0),
    0
  );

  return {
    perDay,
    services,
    hours,
    revenue,
    approvedCount: approved.length,
    total: bookings.length,
    pending: bookings.filter((booking) => booking.status === 'Pending').length,
    rejected: bookings.filter((booking) => booking.status === 'Rejected').length,
  };
}

/** Collapses bookings into one row per unique phone number. */
export function buildMembers(bookings) {
  const map = new Map();
  bookings.forEach((booking) => {
    const key = booking.phone || booking.email || booking.name;
    if (!key) return;
    const existing = map.get(key);
    if (existing) {
      existing.bookings += 1;
      if (booking.date > existing.lastBooking) existing.lastBooking = booking.date;
      if (booking.date < existing.firstBooking) existing.firstBooking = booking.date;
    } else {
      map.set(key, {
        name: booking.name || '',
        phone: booking.phone || '',
        email: booking.email || '',
        bookings: 1,
        firstBooking: booking.date || '',
        lastBooking: booking.date || '',
      });
    }
  });
  return Array.from(map.values()).sort((a, b) => b.bookings - a.bookings);
}

/* --------------------------------- CSV ---------------------------------- */

function escapeCell(value) {
  const text = value === null || value === undefined ? '' : String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function toCsv(rows, columns) {
  const header = columns.map((column) => escapeCell(column.label)).join(',');
  const body = rows
    .map((row) => columns.map((column) => escapeCell(row[column.key])).join(','))
    .join('\n');
  return `${header}\n${body}`;
}

export function downloadCsv(filename, csv) {
  // Prepend a BOM so Excel opens UTF-8 correctly.
  const blob = new Blob([`﻿${csv}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/* ------------------------------- About Us -------------------------------- */

export function getAboutData() {
  return readSeeded(STORE_KEYS.ABOUT, INITIAL_ABOUT_DATA);
}

export function saveAboutData(data) {
  const updated = write(STORE_KEYS.ABOUT, data);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('gymnation_about_updated'));
  }
  return updated;
}

export function resetAboutData() {
  const updated = write(STORE_KEYS.ABOUT, INITIAL_ABOUT_DATA);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('gymnation_about_updated'));
  }
  return updated;
}

