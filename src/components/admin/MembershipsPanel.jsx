import React, { useMemo, useState } from 'react';
import {
  Search, Download, Trash2, Phone, Mail, UsersRound, BadgeCheck, CalendarClock,
  IndianRupee, RefreshCw, XCircle, Inbox, CreditCard,
} from 'lucide-react';
import {
  getMemberSignups, updateMemberSignup, deleteMemberSignup,
  effectiveMembershipStatus, daysUntilExpiry, isExpiringSoon, buildMembershipStats,
  todayISO, toCsv, downloadCsv,
} from '../../utils/adminStore';
import { buildRenewalPatch } from '../../utils/membershipSignups';
import {
  updateMembershipSignupInFirebase, deleteMembershipSignupFromFirebase,
} from '../../firebase';
import AdminConfirmModal from './AdminConfirmModal';

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'Active', label: 'Active' },
  { id: 'expiring', label: 'Expiring Soon' },
  { id: 'Expired', label: 'Expired' },
  { id: 'Cancelled', label: 'Cancelled' },
];

const STATUS_STYLES = {
  Active: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
  Expired: 'border-slate-600/40 bg-slate-700/20 text-slate-400',
  Cancelled: 'border-red-500/30 bg-red-500/10 text-red-400',
};

function formatDate(value) {
  if (!value) return '—';
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatJoinedAt(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true,
  });
}

function StatCard({ icon: Icon, label, value, tone }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
      <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">
        <Icon className={`h-3.5 w-3.5 ${tone}`} />
        {label}
      </div>
      <div className="mt-2 font-teko text-3xl leading-none text-white">{value}</div>
    </div>
  );
}

export default function MembershipsPanel({ signups, onChange }) {
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const stats = useMemo(() => buildMembershipStats(signups), [signups]);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();

    return signups
      .filter((signup) => {
        if (filter === 'all') return true;
        if (filter === 'expiring') return isExpiringSoon(signup);
        return effectiveMembershipStatus(signup) === filter;
      })
      .filter((signup) => {
        if (!needle) return true;
        return [signup.id, signup.memberName, signup.phone, signup.email, signup.planName, signup.paymentId]
          .filter(Boolean)
          .some((field) => String(field).toLowerCase().includes(needle));
      })
      .sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));
  }, [signups, filter, query]);

  // Local write first so the table reacts instantly, then mirror to Firestore.
  const patchSignup = async (id, patch) => {
    onChange(updateMemberSignup(id, patch));
    await updateMembershipSignupInFirebase(id, patch);
    onChange(getMemberSignups());
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      onChange(deleteMemberSignup(deleteTarget.id));
      await deleteMembershipSignupFromFirebase(deleteTarget.id);
    } catch (error) {
      console.error('Error deleting membership:', error);
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const exportCsv = () => {
    const rows = visible.map((signup) => ({
      ...signup,
      status: effectiveMembershipStatus(signup),
    }));
    const csv = toCsv(rows, [
      { key: 'id', label: 'Member Ref' },
      { key: 'memberName', label: 'Name' },
      { key: 'phone', label: 'Phone' },
      { key: 'email', label: 'Email' },
      { key: 'planName', label: 'Plan' },
      { key: 'billingCycle', label: 'Billing' },
      { key: 'amountPaid', label: 'Amount Paid' },
      { key: 'startDate', label: 'Start Date' },
      { key: 'endDate', label: 'Valid Till' },
      { key: 'status', label: 'Status' },
      { key: 'paymentStatus', label: 'Payment' },
      { key: 'paymentId', label: 'Transaction ID' },
      { key: 'source', label: 'Source' },
      { key: 'createdAt', label: 'Joined At' },
    ]);
    downloadCsv(`gymnation-memberships-${todayISO()}.csv`, csv);
  };

  return (
    <div>
      {/* Snapshot */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard icon={UsersRound} label="Total members" tone="text-orange-400" value={stats.total} />
        <StatCard icon={BadgeCheck} label="Active now" tone="text-emerald-400" value={stats.active} />
        <StatCard icon={CalendarClock} label="Expiring in 7 days" tone="text-amber-400" value={stats.expiringSoon} />
        <StatCard
          icon={IndianRupee}
          label="Revenue collected"
          tone="text-orange-400"
          value={`₹${stats.revenue.toLocaleString('en-IN')}`}
        />
      </div>

      {/* Controls */}
      <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {FILTERS.map((item) => (
            <button
              className={`rounded-lg px-3.5 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
                filter === item.id
                  ? 'bg-orange-500 text-white'
                  : 'border border-slate-800 bg-slate-900/50 text-slate-400 hover:text-white'
              }`}
              key={item.id}
              onClick={() => setFilter(item.id)}
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
              placeholder="Search member, phone, plan…"
              type="search"
              value={query}
            />
          </div>

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
        Showing {visible.length} of {signups.length} memberships
      </p>

      {/* List */}
      <div className="mt-4 space-y-3">
        {visible.length === 0 && (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 py-16 text-center">
            <Inbox className="h-8 w-8 text-slate-700" />
            <p className="max-w-sm text-sm text-slate-500">
              {signups.length === 0
                ? 'No memberships yet. Everyone who takes a plan on the site appears here automatically.'
                : 'No memberships match these filters.'}
            </p>
          </div>
        )}

        {visible.map((signup) => {
          const status = effectiveMembershipStatus(signup);
          const remaining = daysUntilExpiry(signup);

          return (
            <div
              className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 transition-colors hover:border-slate-700"
              key={signup.id}
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                {/* Who / what */}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-bold text-white">{signup.memberName || 'Unnamed'}</span>
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${STATUS_STYLES[status] || STATUS_STYLES.Active}`}
                    >
                      {status}
                    </span>
                    {isExpiringSoon(signup) && (
                      <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-400">
                        {remaining === 0 ? 'Ends today' : `${remaining}d left`}
                      </span>
                    )}
                    <span className="font-mono text-[11px] text-slate-600">{signup.id}</span>
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                    <span className="font-semibold text-orange-400">{signup.planName}</span>
                    <span className="capitalize">{signup.billingCycle} billing</span>
                    <span>
                      Valid: <strong className="font-medium text-slate-300">
                        {formatDate(signup.startDate)} → {formatDate(signup.endDate)}
                      </strong>
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-slate-300">
                      <CreditCard className="h-3 w-3 text-orange-400" />
                      ₹{(Number(signup.amountPaid) || 0).toLocaleString('en-IN')}
                      <span className="text-slate-500">· {signup.paymentStatus || 'Paid'}</span>
                    </span>
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                    {signup.phone && (
                      <a
                        className="inline-flex items-center gap-1.5 text-slate-400 transition-colors hover:text-orange-400"
                        href={`tel:${signup.phone}`}
                      >
                        <Phone className="h-3 w-3" />
                        {signup.phone}
                      </a>
                    )}
                    {signup.email && (
                      <a
                        className="inline-flex items-center gap-1.5 text-slate-400 transition-colors hover:text-orange-400"
                        href={`mailto:${signup.email}`}
                      >
                        <Mail className="h-3 w-3" />
                        {signup.email}
                      </a>
                    )}
                    <span className="text-slate-600">
                      Joined {formatJoinedAt(signup.createdAt)}
                      {signup.source ? ` · via ${signup.source}` : ''}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  <button
                    className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs font-bold text-emerald-400 transition-colors hover:bg-emerald-500/20"
                    onClick={() => patchSignup(signup.id, buildRenewalPatch(signup))}
                    title={`Extend by one ${signup.billingCycle === 'yearly' ? 'year' : 'month'}`}
                    type="button"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Renew
                  </button>
                  <button
                    className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-bold text-red-400 transition-colors hover:bg-red-500/20 disabled:opacity-40"
                    disabled={status === 'Cancelled'}
                    onClick={() => patchSignup(signup.id, { status: 'Cancelled' })}
                    type="button"
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    Cancel
                  </button>
                  {status === 'Cancelled' && (
                    <button
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/60 px-3 py-2 text-xs font-bold text-slate-300 transition-colors hover:border-orange-500/40 hover:text-white"
                      onClick={() => patchSignup(signup.id, { status: 'Active' })}
                      type="button"
                    >
                      <BadgeCheck className="h-3.5 w-3.5" />
                      Reactivate
                    </button>
                  )}
                  <button
                    aria-label="Delete membership"
                    className="rounded-lg border border-slate-800 p-2 text-slate-500 transition-colors hover:border-red-500/40 hover:text-red-400"
                    onClick={() => setDeleteTarget(signup)}
                    type="button"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <AdminConfirmModal
        cancelText="Keep Member"
        confirmText="Delete Member"
        isOpen={Boolean(deleteTarget)}
        itemName={deleteTarget ? `${deleteTarget.memberName || 'Member'} · ${deleteTarget.planName || ''}` : ''}
        loading={deleting}
        message="This removes the membership record from the cloud database. This action cannot be undone."
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Delete Membership"
        type="danger"
      />
    </div>
  );
}
