import React, { useMemo, useState } from 'react';
import {
  BellRing, Mail, Send, CheckCircle2, Inbox, CalendarClock, Eye, RotateCcw,
  Loader2, TriangleAlert, PlusCircle,
} from 'lucide-react';
import {
  REMINDER_MILESTONES, getRenewalWatchlist, getPendingReminders,
  buildExpiryMessages, markSent, clearLedger, formatEndDate,
} from '../../utils/membershipExpiry';
import { sendMembershipExpiryEmail } from '../../utils/bookingNotifications';
import { recordMembershipSignup } from '../../utils/membershipSignups';
import { updateMemberSignup } from '../../utils/adminStore';

const MILESTONE_STYLES = {
  5: 'border-sky-500/30 bg-sky-500/10 text-sky-300',
  3: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
  1: 'border-red-500/30 bg-red-500/10 text-red-300',
};

const todayISO = () => new Date().toISOString().split('T')[0];

/** The simulated "today" the whole panel is evaluated against. */
function previewNow(dateStr) {
  if (!dateStr) return Date.now();
  const parsed = new Date(`${dateStr}T12:00:00`);
  return Number.isNaN(parsed.getTime()) ? Date.now() : parsed.getTime();
}

function remainingLabel(remaining) {
  if (remaining === 0) return 'Expires today';
  if (remaining === 1) return '1 day left';
  return `${remaining} days left`;
}

export default function RenewalsPanel({ signups = [], onChange }) {
  const [asOf, setAsOf] = useState(todayISO());
  const [preview, setPreview] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [log, setLog] = useState([]);
  const [tick, setTick] = useState(0); // bumped to re-read the ledger after sends

  const now = previewNow(asOf);
  const isSimulated = asOf !== todayISO();

  const watchlist = useMemo(
    () => getRenewalWatchlist(signups, now),
    // `tick` is a deliberate dependency: the ledger lives outside React state.
    [signups, now, tick]
  );
  const pending = useMemo(() => getPendingReminders(signups, now), [signups, now, tick]);

  const note = (text, tone = 'ok') =>
    setLog((entries) => [{ text, tone, at: Date.now() }, ...entries].slice(0, 6));

  async function sendEmail(signup, milestone) {
    setBusyId(signup.id);
    const result = await sendMembershipExpiryEmail(signup, milestone);
    if (result.sent) {
      markSent(signup, milestone, `email:${result.mode}`);
      note(
        result.mode === 'simulated'
          ? `Email for ${signup.memberName} composed — EmailJS not configured, so it was logged to the console instead of delivered.`
          : `Email sent to ${signup.memberName} (${signup.email}).`,
        result.mode === 'simulated' ? 'warn' : 'ok'
      );
      setTick((n) => n + 1);
    } else {
      note(`Email to ${signup.memberName} failed: ${result.reason}.`, 'warn');
    }
    setBusyId(null);
  }

  function sendWhatsApp(signup, milestone) {
    const { whatsappUrl } = buildExpiryMessages(signup, milestone);
    if (!whatsappUrl) {
      note(`${signup.memberName} has no phone number on file.`, 'warn');
      return;
    }
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    markSent(signup, milestone, 'whatsapp');
    note(`WhatsApp opened for ${signup.memberName} — press Send in WhatsApp to deliver it.`, 'ok');
    setTick((n) => n + 1);
  }

  async function emailAllDue() {
    if (!pending.length) return;
    for (const { signup, milestone } of pending) {
      // Sequential: EmailJS rate-limits parallel bursts from one key.
      await sendEmail(signup, milestone);
    }
  }

  /** Drops in a member expiring in `days` days so the flow can be demonstrated. */
  async function seedDemoMember(days) {
    const signup = await recordMembershipSignup({
      customer: {
        name: `Demo Member (${days}d)`,
        phone: '9742041444',
        email: 'demo@example.com',
      },
      plan: { id: 'standard-plan', name: 'Standard (Gym + Classes)', price: '₹2,500' },
      source: 'Demo Seed',
      startDate: new Date(now).toISOString().split('T')[0],
    });

    // recordMembershipSignup derives endDate from the billing cycle (a month
    // out). Write it back through the store so it lands exactly on the
    // milestone being demonstrated — mutating the returned object alone would
    // not touch what is persisted.
    const endDate = new Date(now + days * 86400000).toISOString().split('T')[0];
    updateMemberSignup(signup.id, { endDate });

    if (onChange) onChange();
    setTick((n) => n + 1);
    note(`Seeded a demo member expiring in ${days} day${days === 1 ? '' : 's'}.`, 'ok');
  }

  return (
    <div className="space-y-6">
      {/* How this actually delivers — stated up front so it is not mistaken for a cron. */}
      <div className="flex items-start gap-3 rounded-2xl border border-amber-500/25 bg-amber-500/10 p-4 text-xs leading-relaxed text-amber-200/90">
        <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
        <p>
          <strong className="font-bold">Reminders are dispatched from this page, not automatically.</strong>{' '}
          The site has no backend, so nothing can send while every tab is closed. Email goes out on its
          own through EmailJS; WhatsApp opens a pre-filled chat you press Send on. Open this tab once a
          day and clear the queue. For unattended sending you need a scheduled server job — see the README note.
        </p>
      </div>

      {/* Preview controls */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Preview as if today is
            </label>
            <input
              type="date"
              value={asOf}
              onChange={(event) => setAsOf(event.target.value || todayISO())}
              className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-orange-500/60"
            />
          </div>

          <button
            type="button"
            onClick={() => setAsOf(todayISO())}
            className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs font-bold text-slate-300 transition-colors hover:border-slate-700 hover:text-white"
          >
            Back to today
          </button>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Seed demo</span>
            {REMINDER_MILESTONES.map((days) => (
              <button
                key={days}
                type="button"
                onClick={() => seedDemoMember(days)}
                className="flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-900 px-2.5 py-2 text-xs font-bold text-slate-300 transition-colors hover:border-orange-500/50 hover:text-orange-300"
              >
                <PlusCircle className="h-3.5 w-3.5" /> {days}d
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => { clearLedger(); setTick((n) => n + 1); note('Send history cleared — every reminder is due again.'); }}
            className="ml-auto flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs font-bold text-slate-300 transition-colors hover:border-red-500/40 hover:text-red-300"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Reset send history
          </button>
        </div>

        {isSimulated && (
          <p className="mt-3 text-xs font-semibold text-orange-300">
            Previewing {formatEndDate(asOf)} — the list below shows who would be due on that date.
            Sending still works and is recorded for real.
          </p>
        )}
      </div>

      {/* Queue summary */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 rounded-2xl border border-slate-800 bg-slate-900/40 px-4 py-3">
          <BellRing className="h-4 w-4 text-orange-400" />
          <span className="font-teko text-2xl leading-none text-white">{pending.length}</span>
          <span className="text-xs font-semibold text-slate-400">due now</span>
        </div>
        <div className="flex items-center gap-2 rounded-2xl border border-slate-800 bg-slate-900/40 px-4 py-3">
          <CalendarClock className="h-4 w-4 text-sky-400" />
          <span className="font-teko text-2xl leading-none text-white">{watchlist.length}</span>
          <span className="text-xs font-semibold text-slate-400">in the 5-day window</span>
        </div>

        <button
          type="button"
          onClick={emailAllDue}
          disabled={!pending.length || Boolean(busyId)}
          className="ml-auto flex items-center gap-2 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-lg transition-all hover:shadow-orange-500/30 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {busyId ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
          Email all due ({pending.length})
        </button>
      </div>

      {/* Activity log */}
      {log.length > 0 && (
        <ul className="space-y-1.5">
          {log.map((entry) => (
            <li
              key={entry.at}
              className={`rounded-xl border px-3 py-2 text-xs ${
                entry.tone === 'warn'
                  ? 'border-amber-500/25 bg-amber-500/10 text-amber-200'
                  : 'border-emerald-500/25 bg-emerald-500/10 text-emerald-200'
              }`}
            >
              {entry.text}
            </li>
          ))}
        </ul>
      )}

      {/* Watchlist */}
      {watchlist.length === 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-10 text-center">
          <Inbox className="mx-auto h-8 w-8 text-slate-600" />
          <p className="mt-3 text-sm font-semibold text-slate-400">
            Nobody is inside the 5-day window on this date.
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Use “Seed demo” above to create a member expiring in 5, 3 or 1 days and watch the flow.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {watchlist.map(({ signup, remaining, milestone, sent }) => {
            const messages = buildExpiryMessages(signup, milestone ?? Math.max(remaining, 1));
            const isBusy = busyId === signup.id;

            return (
              <div
                key={`${signup.id}-${signup.endDate}`}
                className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4"
              >
                <div className="flex flex-wrap items-center gap-3">
                  <div className="min-w-[180px] flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">{signup.memberName}</span>
                      <span
                        className={`rounded-lg border px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                          MILESTONE_STYLES[milestone] || 'border-slate-700 bg-slate-800/60 text-slate-400'
                        }`}
                      >
                        {remainingLabel(remaining)}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      {signup.planName} · expires {formatEndDate(signup.endDate)}
                      {signup.email ? ` · ${signup.email}` : ' · no email on file'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {sent.length > 0 && (
                      <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        {sent.sort((a, b) => b - a).join(' / ')}d done
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => setPreview(preview === signup.id ? null : signup.id)}
                      className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs font-bold text-slate-300 transition-colors hover:border-slate-700 hover:text-white"
                    >
                      <Eye className="h-3.5 w-3.5" /> Preview
                    </button>

                    <button
                      type="button"
                      disabled={milestone === null || isBusy || !signup.email}
                      onClick={() => sendEmail(signup, milestone)}
                      className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs font-bold text-slate-300 transition-colors hover:border-orange-500/50 hover:text-orange-300 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {isBusy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Mail className="h-3.5 w-3.5" />}
                      Email
                    </button>

                    <button
                      type="button"
                      disabled={milestone === null || !signup.phone}
                      onClick={() => sendWhatsApp(signup, milestone)}
                      className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs font-bold text-slate-300 transition-colors hover:border-emerald-500/50 hover:text-emerald-300 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Send className="h-3.5 w-3.5" /> WhatsApp
                    </button>
                  </div>
                </div>

                {preview === signup.id && (
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                      <p className="mb-2 text-[10px] font-black uppercase tracking-wider text-slate-500">
                        Email · subject
                      </p>
                      <p className="text-xs font-semibold text-white">{messages.subject}</p>
                      <p className="mt-2 whitespace-pre-wrap text-xs leading-relaxed text-slate-400">
                        {messages.body}
                      </p>
                    </div>
                    <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                      <p className="mb-2 text-[10px] font-black uppercase tracking-wider text-slate-500">
                        WhatsApp message
                      </p>
                      <p className="whitespace-pre-wrap text-xs leading-relaxed text-slate-400">
                        {messages.whatsappText}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
