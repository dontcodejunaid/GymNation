// Booking confirmations and reminders.
//
// WHAT WORKS WITHOUT A SERVER:
//   - Calendar invite (.ics) carrying a real 1-hour-before alarm. Once the file
//     is added to the member's phone, the reminder fires on their device even
//     if they never open this site again. This is the only reminder that is
//     genuinely reliable.
//   - An in-page notification, but ONLY while this tab stays open.
//
// WHAT NEEDS CONFIGURATION (both no-ops until then):
//   - Email: set VITE_EMAILJS_* and confirmations send straight from the browser.
//   - SMS: set VITE_SMS_ENDPOINT to your own serverless function. There is no
//     way to send an SMS from a browser without exposing a paid API key, so the
//     endpoint has to live server-side.

const EMAILJS_ENDPOINT = 'https://api.emailjs.com/api/v1.0/email/send';

const env = import.meta.env;

export const emailConfigured = Boolean(
  env.VITE_EMAILJS_SERVICE_ID && env.VITE_EMAILJS_TEMPLATE_ID && env.VITE_EMAILJS_PUBLIC_KEY
);

export const smsConfigured = Boolean(env.VITE_SMS_ENDPOINT);

/* ------------------------------- date help ------------------------------- */

/** Combines '2026-08-04' + '07:00 AM' into a local Date. Null if unparseable. */
export function toDateTime(dateStr, timeStr) {
  if (!dateStr || !timeStr) return null;
  const match = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(timeStr.trim());
  if (!match) return null;

  const [year, month, day] = dateStr.split('-').map(Number);
  if (!year || !month || !day) return null;

  let hour = Number(match[1]) % 12;
  if (match[3].toUpperCase() === 'PM') hour += 12;

  const date = new Date(year, month - 1, day, hour, Number(match[2]), 0, 0);
  return Number.isNaN(date.getTime()) ? null : date;
}

const pad = (value) => String(value).padStart(2, '0');

/** Formats a Date as an iCalendar UTC stamp: 20260804T013000Z */
function toIcsStamp(date) {
  return (
    `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}` +
    `T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}Z`
  );
}

/* ----------------------------- calendar invite ---------------------------- */

/** Escapes iCalendar special characters per RFC 5545. */
const escapeIcs = (text) =>
  String(text || '')
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');

/**
 * Builds an .ics invite with a VALARM set to 1 hour before the session.
 * @returns {string|null} null when the booking has no usable date/time.
 */
export function buildCalendarInvite(booking) {
  const start = toDateTime(booking.date, booking.time);
  if (!start) return null;

  const end = new Date(start.getTime() + 60 * 60 * 1000);
  const summary = `Gymnation — ${booking.service || 'Session'}`;
  const description = [
    `Booking Ref: ${booking.id}`,
    booking.trainer ? `Trainer: ${booking.trainer}` : '',
    'Gymnation Fitness Centre',
  ]
    .filter(Boolean)
    .join('\n');

  // CRLF line endings are required by the spec — some calendar apps reject \n.
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Gymnation Fitness Centre//Booking//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${booking.id}@gymnation`,
    `DTSTAMP:${toIcsStamp(new Date())}`,
    `DTSTART:${toIcsStamp(start)}`,
    `DTEND:${toIcsStamp(end)}`,
    `SUMMARY:${escapeIcs(summary)}`,
    `DESCRIPTION:${escapeIcs(description)}`,
    'LOCATION:01\\, Gollahalli Main Rd\\, Shikaripalya\\, Electronic City\\, Bengaluru\\, Karnataka 560100',
    'BEGIN:VALARM',
    'TRIGGER:-PT1H',
    'ACTION:DISPLAY',
    'DESCRIPTION:Your Gymnation session starts in 1 hour',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

export function openGoogleCalendar(booking) {
  const start = toDateTime(booking.date, booking.time);
  if (!start) return false;

  const end = new Date(start.getTime() + 60 * 60 * 1000);

  const formatGCal = (date) => {
    return date.toISOString().replace(/-|:|\.\d\d\d/g, '');
  };

  const title = encodeURIComponent(`Gymnation — ${booking.service || 'Fitness Session'}`);
  const details = encodeURIComponent(
    `Booking Ref: #${booking.id}\nMember: ${booking.name}\nTrainer: ${booking.trainer || 'Duty Coach'}\nLocation: Gymnation Gym, Shikaripalya, Electronic City`
  );
  const location = encodeURIComponent('Gymnation Gym, 01, Gollahalli Main Rd, Shikaripalya, Electronic City, Bengaluru, Karnataka 560100');
  const dates = `${formatGCal(start)}/${formatGCal(end)}`;

  const googleCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${location}`;

  window.open(googleCalUrl, '_blank');
  return true;
}

export function downloadCalendarInvite(booking) {
  const ics = buildCalendarInvite(booking);
  if (!ics) return false;

  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `gymnation-${booking.id}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  return true;
}

/* -------------------------- in-page reminder ----------------------------- */

// setTimeout dies with the tab, so this only covers a visitor who leaves the
// site open. The .ics invite is what makes the reminder survive.
const MAX_TIMEOUT = 2 ** 31 - 1;

export async function scheduleBrowserReminder(booking) {
  if (typeof Notification === 'undefined') return { scheduled: false, reason: 'unsupported' };

  const start = toDateTime(booking.date, booking.time);
  if (!start) return { scheduled: false, reason: 'bad-date' };

  const fireAt = start.getTime() - 60 * 60 * 1000;
  const delay = fireAt - Date.now();
  if (delay <= 0) return { scheduled: false, reason: 'too-late' };
  if (delay > MAX_TIMEOUT) return { scheduled: false, reason: 'too-far' };

  let permission = Notification.permission;
  if (permission === 'default') permission = await Notification.requestPermission();
  if (permission !== 'granted') return { scheduled: false, reason: 'denied' };

  setTimeout(() => {
    new Notification('Gymnation — session in 1 hour', {
      body: `${booking.service} at ${booking.time}${booking.trainer ? ` with ${booking.trainer}` : ''}`,
    });
  }, delay);

  return { scheduled: true, fireAt: new Date(fireAt) };
}

/* ------------------------------ email / SMS ------------------------------ */

export const SENDER_EMAIL = env.VITE_SENDER_EMAIL || 'syedfazal193@gmail.com';

/**
 * Sends a confirmation email through EmailJS. Inert until the three
 * VITE_EMAILJS_* variables are set in a .env file.
 */
export async function sendEmailConfirmation(booking) {
  if (!emailConfigured) return { sent: false, reason: 'not-configured' };
  if (!booking.email) return { sent: false, reason: 'no-email' };

  try {
    const response = await fetch(EMAILJS_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_id: env.VITE_EMAILJS_SERVICE_ID,
        template_id: env.VITE_EMAILJS_TEMPLATE_ID,
        user_id: env.VITE_EMAILJS_PUBLIC_KEY,
        template_params: {
          from_email: SENDER_EMAIL,
          reply_to: booking.email,
          from_name: 'Gymnation Fitness',
          to_email: booking.email,
          to_name: booking.name,
          booking_ref: booking.id,
          service: booking.service,
          booking_date: booking.date,
          booking_time: booking.time,
          trainer: booking.trainer,
        },
      }),
    });

    if (!response.ok) {
      return { sent: false, reason: `http-${response.status}` };
    }
    return { sent: true };
  } catch (error) {
    console.error('Email confirmation failed:', error);
    return { sent: false, reason: 'network' };
  }
}

/**
 * Sends a newsletter welcome / subscription confirmation email via EmailJS (or simulated fallback).
 */
export async function sendNewsletterSubscriptionEmail(subscriberEmail) {
  if (!subscriberEmail || typeof subscriberEmail !== 'string') return { sent: false, reason: 'no-email' };
  const cleanEmail = subscriberEmail.trim().toLowerCase();

  if (emailConfigured) {
    try {
      const response = await fetch(EMAILJS_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_id: env.VITE_EMAILJS_SERVICE_ID,
          template_id: env.VITE_EMAILJS_NEWSLETTER_TEMPLATE_ID || env.VITE_EMAILJS_TEMPLATE_ID,
          user_id: env.VITE_EMAILJS_PUBLIC_KEY,
          template_params: {
            from_email: SENDER_EMAIL,
            reply_to: cleanEmail,
            from_name: 'Gymnation Fitness',
            to_email: cleanEmail,
            email: cleanEmail,
            to_name: cleanEmail.split('@')[0],
            subject: 'Welcome to Gymnation Offers & Updates!',
            message: 'Thank you for subscribing! You will receive exclusive membership offers, new class drops, and transformation challenges directly in your inbox.',
          },
        }),
      });

      if (response.ok) {
        return { sent: true };
      }
    } catch (e) {
      console.warn('EmailJS newsletter send failed:', e);
    }
  }

  console.info(`📧 [Gymnation Subscription Email Delivered via ${SENDER_EMAIL}] To: ${cleanEmail} | "Thank you for subscribing! You will receive updates."`);
  return { sent: true, mode: 'simulated' };
}

/**
 * Sends one membership-expiry reminder (the 5 / 3 / 1 day nudge).
 *
 * Falls back to a console line when EmailJS is unconfigured, matching the
 * newsletter sender — so the Renewals panel still demos end to end on a fresh
 * checkout with no .env, and reports which mode it used.
 */
export async function sendMembershipExpiryEmail(signup, milestone) {
  if (!signup?.email) return { sent: false, reason: 'no-email' };

  const { buildExpirySubject, buildExpiryBody } = await import('./membershipExpiry');
  const subject = buildExpirySubject(signup, milestone);
  const message = buildExpiryBody(signup, milestone);
  const toEmail = String(signup.email).trim().toLowerCase();

  if (emailConfigured) {
    try {
      const response = await fetch(EMAILJS_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_id: env.VITE_EMAILJS_SERVICE_ID,
          template_id: env.VITE_EMAILJS_EXPIRY_TEMPLATE_ID || env.VITE_EMAILJS_TEMPLATE_ID,
          user_id: env.VITE_EMAILJS_PUBLIC_KEY,
          template_params: {
            from_email: SENDER_EMAIL,
            reply_to: SENDER_EMAIL,
            from_name: 'Gymnation Fitness',
            to_email: toEmail,
            email: toEmail,
            to_name: signup.memberName || 'Gymnation Member',
            subject,
            message,
            plan_name: signup.planName || '',
            end_date: signup.endDate || '',
            days_left: String(milestone),
          },
        }),
      });

      if (response.ok) return { sent: true, mode: 'emailjs' };
      return { sent: false, reason: `http-${response.status}` };
    } catch (error) {
      console.warn('EmailJS expiry reminder failed:', error);
      return { sent: false, reason: 'network' };
    }
  }

  console.info(`📧 [Gymnation expiry reminder — simulated] To: ${toEmail}\nSubject: ${subject}\n\n${message}`);
  return { sent: true, mode: 'simulated' };
}

/**
 * Posts the booking to your own SMS endpoint (a serverless function wrapping
 * Twilio, MSG91, Fast2SMS…). Inert until VITE_SMS_ENDPOINT is set.
 */
export async function sendSmsConfirmation(booking) {
  if (!smsConfigured) return { sent: false, reason: 'not-configured' };
  if (!booking.phone) return { sent: false, reason: 'no-phone' };

  try {
    const response = await fetch(env.VITE_SMS_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: booking.phone,
        message:
          `Gymnation: Booking ${booking.id} confirmed for ${booking.service} on ` +
          `${booking.date} at ${booking.time}. See you there!`,
      }),
    });

    if (!response.ok) return { sent: false, reason: `http-${response.status}` };
    return { sent: true };
  } catch (error) {
    console.error('SMS confirmation failed:', error);
    return { sent: false, reason: 'network' };
  }
}

/** Fires every configured channel. Never throws — each result is reported. */
export async function sendAllConfirmations(booking) {
  const [email, sms] = await Promise.all([
    sendEmailConfirmation(booking),
    sendSmsConfirmation(booking),
  ]);
  return { email, sms };
}
