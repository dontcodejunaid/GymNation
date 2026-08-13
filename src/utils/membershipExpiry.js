// Membership expiry reminders — 5, 3 and 1 days before a plan lapses.
//
// ---------------------------------------------------------------------------
// WHAT THIS CAN AND CANNOT DO
// ---------------------------------------------------------------------------
// This is a static site with no backend. Nothing can be *sent* while every tab
// is closed, and WhatsApp has no browser API that sends on a member's behalf —
// api.whatsapp.com/send only opens a chat with the text pre-filled, which a
// person then presses Send on.
//
// So this module owns the decisions, not the delivery: who is due, which
// milestone they are owed, and exactly what each message says. The admin
// Renewals panel dispatches them (email goes out on its own through EmailJS,
// WhatsApp opens pre-filled per member).
//
// For truly unattended sending, run getPendingReminders() on a daily server job
// (Firebase Cloud Function + Cloud Scheduler) against the membershipSignups
// collection, and post to an email/WhatsApp Business API from there. The
// milestone logic and message copy below are written to be reused as-is.

import { formatWhatsAppNumber } from './whatsapp.js';

/** Days before expiry that a member is nudged. Most urgent last. */
export const REMINDER_MILESTONES = [5, 3, 1];

const LEDGER_KEY = 'gymnation_expiry_reminders';
const DAY_MS = 86400000;

/* ------------------------------- timing --------------------------------- */

/**
 * Whole days left before the plan lapses. 0 means it expires today, negative
 * means it already has. `now` is injectable so the admin panel can preview a
 * future date without waiting for it.
 */
export function daysLeft(signup, now = Date.now()) {
  if (!signup?.endDate) return null;

  // Calendar-day difference, both ends snapped to local midnight. Subtracting
  // raw timestamps instead would fold in the remaining hours of today, so a
  // plan ending on the 18th reads as 6 days out on the 13th and the 5-day
  // reminder fires a day late. Math.round absorbs any DST shift between them.
  const end = new Date(`${signup.endDate}T00:00:00`);
  if (Number.isNaN(end.getTime())) return null;

  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  return Math.round((end.getTime() - today.getTime()) / DAY_MS);
}

/** Cancelled plans are never chased; a plan with no end date can't be timed. */
export function isRemindable(signup) {
  return Boolean(signup?.endDate) && (signup?.status || 'Active') !== 'Cancelled';
}

/* ------------------------------- ledger ---------------------------------- */
//
// Keyed on the end date as well as the member, so renewing a plan moves the end
// date and naturally starts a fresh reminder cycle rather than being suppressed
// by last month's entries.

export const reminderKey = (signup, milestone) =>
  `${signup?.id}|${signup?.endDate}|${milestone}`;

export function readLedger() {
  try {
    const raw = localStorage.getItem(LEDGER_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writeLedger(ledger) {
  try {
    localStorage.setItem(LEDGER_KEY, JSON.stringify(ledger));
  } catch {
    // Storage full or blocked — reminders just re-offer themselves next time.
  }
}

export function wasSent(signup, milestone, ledger = readLedger()) {
  return Boolean(ledger[reminderKey(signup, milestone)]);
}

/**
 * Records a milestone as handled. Every earlier milestone is closed out at the
 * same time — if nobody opened the site on day 5, there is no point sending
 * "5 days left" once only 3 remain.
 */
export function markSent(signup, milestone, channel = 'manual') {
  const ledger = readLedger();
  const at = new Date().toISOString();

  REMINDER_MILESTONES.filter((m) => m >= milestone).forEach((m) => {
    if (ledger[reminderKey(signup, m)]) return;
    ledger[reminderKey(signup, m)] = {
      at,
      milestone: m,
      channel: m === milestone ? channel : 'superseded',
    };
  });

  writeLedger(ledger);
  return ledger;
}

/** Wipes the send history — used by the panel's demo reset. */
export function clearLedger() {
  writeLedger({});
}

/* ----------------------------- what is due ------------------------------- */

/**
 * The milestone a member is currently owed, or null. Milestones use `<=` rather
 * than `===` so a reminder that came due while the site was closed still goes
 * out (late) instead of being skipped; the most urgent one wins, so a member
 * first seen at 1 day left gets the 1-day message, not the 5-day one.
 */
export function pendingMilestone(signup, now = Date.now(), ledger = readLedger()) {
  if (!isRemindable(signup)) return null;

  const remaining = daysLeft(signup, now);
  if (remaining === null || remaining < 0) return null;

  const reached = REMINDER_MILESTONES.filter((m) => remaining <= m).sort((a, b) => a - b);
  return reached.find((m) => !wasSent(signup, m, ledger)) ?? null;
}

/** Every member owed a reminder right now, most urgent first. */
export function getPendingReminders(signups = [], now = Date.now()) {
  const ledger = readLedger();
  return signups
    .map((signup) => {
      const milestone = pendingMilestone(signup, now, ledger);
      if (milestone === null) return null;
      return { signup, milestone, remaining: daysLeft(signup, now) };
    })
    .filter(Boolean)
    .sort((a, b) => a.remaining - b.remaining);
}

/**
 * Everyone inside the reminder window, whether or not they have been contacted
 * — this is what the panel lists, so already-sent members stay visible.
 */
export function getRenewalWatchlist(signups = [], now = Date.now()) {
  const ledger = readLedger();
  const widest = Math.max(...REMINDER_MILESTONES);

  return signups
    .filter(isRemindable)
    .map((signup) => {
      const remaining = daysLeft(signup, now);
      if (remaining === null || remaining < 0 || remaining > widest) return null;
      return {
        signup,
        remaining,
        milestone: pendingMilestone(signup, now, ledger),
        sent: REMINDER_MILESTONES.filter((m) => wasSent(signup, m, ledger)),
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.remaining - b.remaining);
}

/* ---------------------------- message copy ------------------------------- */

const urgency = (milestone) =>
  milestone === 1 ? 'expires tomorrow' : `expires in ${milestone} days`;

function renewUrl() {
  if (typeof window === 'undefined') return '';
  return `${window.location.origin}/#membership`;
}

/** Human date: 2026-08-18 -> 18 Aug 2026 */
export function formatEndDate(endDate) {
  if (!endDate) return '';
  const date = new Date(`${endDate}T00:00:00`);
  if (Number.isNaN(date.getTime())) return endDate;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function buildExpirySubject(signup, milestone) {
  return milestone === 1
    ? `Your Gymnation membership expires tomorrow`
    : `Your Gymnation membership ${urgency(milestone)}`;
}

export function buildExpiryBody(signup, milestone) {
  const name = signup?.memberName || 'there';
  const plan = signup?.planName || 'Gymnation membership';

  return (
    `Hi ${name}, your ${plan} ${urgency(milestone)} ` +
    `(valid until ${formatEndDate(signup?.endDate)}).\n\n` +
    `Renew before it lapses to keep your access, your locker and your current rate — ` +
    `renewing after expiry restarts the term from the day you pay.\n\n` +
    `Renew at the front desk, reply to this message, or call us on ` +
    `+91 97420 41444.\n\n` +
    `See you on the floor,\nGymnation, Shikaripalya, Electronic City`
  );
}

/** WhatsApp text — same message, trimmed and lightly formatted for chat. */
export function buildExpiryWhatsAppText(signup, milestone) {
  const name = signup?.memberName || 'there';
  const plan = signup?.planName || 'Gymnation membership';

  return (
    `🏋️ *Gymnation — Membership Reminder*\n\n` +
    `Hi ${name}! Your *${plan}* ${urgency(milestone)} ` +
    `(valid until ${formatEndDate(signup?.endDate)}).\n\n` +
    `Renew before it lapses to keep your access and your current rate. ` +
    `Reply here or call +91 97420 41444 and we'll sort it in a minute.\n\n` +
    `See you on the floor! 💪`
  );
}

/**
 * Everything needed to dispatch one reminder: the copy, plus a WhatsApp deep
 * link addressed to the member.
 */
export function buildExpiryMessages(signup, milestone) {
  const subject = buildExpirySubject(signup, milestone);
  const body = buildExpiryBody(signup, milestone);
  const whatsappText = buildExpiryWhatsAppText(signup, milestone);
  const memberNumber = signup?.phone ? formatWhatsAppNumber(signup.phone) : '';

  return {
    subject,
    body,
    whatsappText,
    renewUrl: renewUrl(),
    whatsappUrl: memberNumber
      ? `https://api.whatsapp.com/send?phone=${memberNumber}&text=${encodeURIComponent(whatsappText)}`
      : '',
  };
}
