import React, { useMemo, useState } from 'react';
import {
  Search, Check, X, CalendarClock, Trash2, Download, Phone, Mail, Inbox, Clock,
} from 'lucide-react';
import {
  getBookings, updateBooking, deleteBooking, bucketOf, todayISO, toCsv, downloadCsv,
} from '../../utils/adminStore';

import { updateBookingInFirebase, deleteBookingFromFirebase } from '../../firebase';
import AdminConfirmModal from './AdminConfirmModal';

function formatBookingTimestamp(createdAt, fallbackDate) {
  const ts = createdAt || fallbackDate;
  if (!ts) return 'N/A';
  try {
    const d = new Date(ts);
    if (isNaN(d.getTime())) return String(ts);
    return d.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch (e) {
    return String(ts);
  }
}

const BUCKETS = [
  { id: 'all', label: 'All' },
  { id: 'today', label: 'Today' },
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'past', label: 'Past' },
];

const STATUS_FILTERS = ['All', 'Pending', 'Approved', 'Rejected'];

const STATUS_STYLES = {
  Pending: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
  Approved: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
  Rejected: 'border-red-500/30 bg-red-500/10 text-red-400',
};

const MORNING_SLOTS = ['06:00 AM', '07:00 AM', '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM'];
const EVENING_SLOTS = ['05:00 PM', '06:00 PM', '07:00 PM', '08:00 PM', '09:00 PM'];
const ALL_SLOTS = [...MORNING_SLOTS, ...EVENING_SLOTS];

export default function BookingsPanel({ bookings, onChange }) {
  const [bucket, setBucket] = useState('all');
  const [status, setStatus] = useState('All');
  const [query, setQuery] = useState('');
  const [rescheduling, setRescheduling] = useState(null); // booking id
  const [draft, setDraft] = useState({ date: '', time: '' });

  const refresh = () => onChange(getBookings());

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();

    return bookings
      .filter((booking) => (bucket === 'all' ? true : bucketOf(booking) === bucket))
      .filter((booking) => (status === 'All' ? true : (booking.status || 'Pending') === status))
      .filter((booking) => {
        if (!needle) return true;
        return [booking.id, booking.name, booking.phone, booking.email, booking.service, booking.trainer]
          .filter(Boolean)
          .some((field) => String(field).toLowerCase().includes(needle));
      })
      .sort((a, b) => `${b.date} ${b.time}`.localeCompare(`${a.date} ${a.time}`));
  }, [bookings, bucket, status, query]);

  const setStatusOf = async (id, next) => {
    const updatedLocal = updateBooking(id, { status: next });
    onChange(updatedLocal);
    await updateBookingInFirebase(id, { status: next });
  };

  const startReschedule = (booking) => {
    setRescheduling(booking.id);
    setDraft({ date: booking.date || todayISO(), time: booking.time || ALL_SLOTS[0] });
  };

  const saveReschedule = async (id) => {
    const patch = { date: draft.date, time: draft.time };
    const updatedLocal = updateBooking(id, patch);
    onChange(updatedLocal);
    await updateBookingInFirebase(id, patch);
    setRescheduling(null);
  };

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const confirmDeleteBooking = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const updatedLocal = deleteBooking(deleteTarget.id);
      onChange(updatedLocal);
      await deleteBookingFromFirebase(deleteTarget.id);
    } catch (err) {
      console.error('Error deleting booking:', err);
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const exportCsv = () => {
    const csv = toCsv(visible, [
      { key: 'id', label: 'Booking Ref' },
      { key: 'name', label: 'Name' },
      { key: 'phone', label: 'Phone' },
      { key: 'email', label: 'Email' },
      { key: 'service', label: 'Service' },
      { key: 'trainer', label: 'Trainer' },
      { key: 'date', label: 'Date' },
      { key: 'time', label: 'Time' },
      { key: 'status', label: 'Status' },
      { key: 'createdAt', label: 'Created At' },
    ]);
    downloadCsv(`gymnation-bookings-${todayISO()}.csv`, csv);
  };

  return (
    <div>
      {/* Controls */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {BUCKETS.map((item) => (
            <button
              className={`rounded-lg px-3.5 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
                bucket === item.id
                  ? 'bg-orange-500 text-white'
                  : 'border border-slate-800 bg-slate-900/50 text-slate-400 hover:text-white'
              }`}
              key={item.id}
              onClick={() => setBucket(item.id)}
              type="button"
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/50 px-3 focus-within:border-orange-500/60 sm:flex-none">
            <Search className="h-4 w-4 shrink-0 text-slate-500" />
            <input
              className="min-w-0 flex-1 bg-transparent py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none sm:w-56"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search name, phone, ref…"
              type="search"
              value={query}
            />
          </div>

          <select
            className="rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2 text-sm text-slate-300 focus:border-orange-500/60 focus:outline-none"
            onChange={(event) => setStatus(event.target.value)}
            value={status}
          >
            {STATUS_FILTERS.map((item) => (
              <option key={item} value={item}>
                {item === 'All' ? 'All statuses' : item}
              </option>
            ))}
          </select>

          <button
            className="inline-flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2 text-sm font-semibold text-slate-300 transition-colors hover:border-orange-500/40 hover:text-white"
            onClick={exportCsv}
            type="button"
          >
            <Download className="h-4 w-4" />
            CSV
          </button>
        </div>
      </div>

      <p className="mt-4 text-xs text-slate-500">
        Showing {visible.length} of {bookings.length} bookings
      </p>

      {/* List */}
      <div className="mt-4 space-y-3">
        {visible.length === 0 && (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 py-16 text-center">
            <Inbox className="h-8 w-8 text-slate-700" />
            <p className="text-sm text-slate-500">
              {bookings.length === 0
                ? 'No bookings yet. They appear here as soon as someone books.'
                : 'No bookings match these filters.'}
            </p>
          </div>
        )}

        {visible.map((booking) => {
          const currentStatus = booking.status || 'Pending';
          const isRescheduling = rescheduling === booking.id;

          return (
            <div
              className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 transition-colors hover:border-slate-700"
              key={booking.id}
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                {/* Who / what */}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-bold text-white">
                      {booking.name || 'Unnamed'}
                    </span>
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${STATUS_STYLES[currentStatus] || STATUS_STYLES.Pending}`}
                    >
                      {currentStatus}
                    </span>
                    <span className="font-mono text-[11px] text-slate-600">{booking.id}</span>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-700/60 bg-slate-800/80 px-2.5 py-0.5 text-[11px] font-medium text-slate-300">
                      <Clock className="h-3 w-3 text-orange-400" />
                      <span>Booked: {formatBookingTimestamp(booking.createdAt, booking.date)}</span>
                    </span>
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                    <span className="font-semibold text-orange-400">{booking.service}</span>
                    <span>
                      Slot: <strong className="text-slate-300 font-medium">{booking.date} · {booking.time}</strong>
                    </span>
                    {booking.trainer && <span className="text-slate-500">{booking.trainer}</span>}
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                    {booking.phone && (
                      <a
                        className="inline-flex items-center gap-1.5 text-slate-400 transition-colors hover:text-orange-400"
                        href={`tel:${booking.phone}`}
                      >
                        <Phone className="h-3 w-3" />
                        {booking.phone}
                      </a>
                    )}
                    {booking.email && (
                      <a
                        className="inline-flex items-center gap-1.5 text-slate-400 transition-colors hover:text-orange-400"
                        href={`mailto:${booking.email}`}
                      >
                        <Mail className="h-3 w-3" />
                        {booking.email}
                      </a>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  <button
                    className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs font-bold text-emerald-400 transition-colors hover:bg-emerald-500/20 disabled:opacity-40"
                    disabled={currentStatus === 'Approved'}
                    onClick={() => setStatusOf(booking.id, 'Approved')}
                    type="button"
                  >
                    <Check className="h-3.5 w-3.5" />
                    Approve
                  </button>
                  <button
                    className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-bold text-red-400 transition-colors hover:bg-red-500/20 disabled:opacity-40"
                    disabled={currentStatus === 'Rejected'}
                    onClick={() => setStatusOf(booking.id, 'Rejected')}
                    type="button"
                  >
                    <X className="h-3.5 w-3.5" />
                    Reject
                  </button>
                  <button
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/60 px-3 py-2 text-xs font-bold text-slate-300 transition-colors hover:border-orange-500/40 hover:text-white"
                    onClick={() => (isRescheduling ? setRescheduling(null) : startReschedule(booking))}
                    type="button"
                  >
                    <CalendarClock className="h-3.5 w-3.5" />
                    Reschedule
                  </button>
                  <button
                    aria-label="Delete booking"
                    className="rounded-lg border border-slate-800 p-2 text-slate-500 transition-colors hover:border-red-500/40 hover:text-red-400"
                    onClick={() => setDeleteTarget(booking)}
                    type="button"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Reschedule drawer */}
              {isRescheduling && (
                <div className="mt-4 flex flex-wrap items-end gap-3 border-t border-slate-800 pt-4">
                  <div>
                    <label
                      className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-500"
                      htmlFor={`date-${booking.id}`}
                    >
                      New date
                    </label>
                    <input
                      className="rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 focus:border-orange-500/60 focus:outline-none"
                      id={`date-${booking.id}`}
                      onChange={(event) => setDraft((prev) => ({ ...prev, date: event.target.value }))}
                      type="date"
                      value={draft.date}
                    />
                  </div>
                  <div>
                    <label
                      className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-500"
                      htmlFor={`time-${booking.id}`}
                    >
                      New slot
                    </label>
                    <select
                      className="rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 focus:border-orange-500/60 focus:outline-none"
                      id={`time-${booking.id}`}
                      onChange={(event) => setDraft((prev) => ({ ...prev, time: event.target.value }))}
                      value={draft.time}
                    >
                      <optgroup label="Morning shift">
                        {MORNING_SLOTS.map((slot) => (
                          <option key={slot} value={slot}>{slot}</option>
                        ))}
                      </optgroup>
                      <optgroup label="Evening shift">
                        {EVENING_SLOTS.map((slot) => (
                          <option key={slot} value={slot}>{slot}</option>
                        ))}
                      </optgroup>
                    </select>
                  </div>
                  <button
                    className="rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 px-4 py-2 text-xs font-black uppercase tracking-wider text-white transition-all active:scale-95"
                    onClick={() => saveReschedule(booking.id)}
                    type="button"
                  >
                    Save
                  </button>
                  <button
                    className="px-2 py-2 text-xs font-semibold text-slate-500 transition-colors hover:text-slate-300"
                    onClick={() => setRescheduling(null)}
                    type="button"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Delete Confirmation Modal */}
      <AdminConfirmModal
        cancelText="Keep Booking"
        confirmText="Delete Booking"
        isOpen={Boolean(deleteTarget)}
        itemName={deleteTarget ? `${deleteTarget.name || 'Client'} · ${deleteTarget.date} at ${deleteTarget.time}` : ''}
        loading={deleting}
        message="Are you sure you want to delete this booking request? This action cannot be undone."
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDeleteBooking}
        title="Delete Booking"
        type="danger"
      />
    </div>
  );
}
