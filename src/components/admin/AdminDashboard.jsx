import React, { useEffect, useState } from 'react';
import {
  CalendarCheck, Settings2, BarChart3, LogOut, ExternalLink, MonitorSmartphone, CreditCard, Info, BellRing, Tag,
} from 'lucide-react';
import BookingsPanel from './BookingsPanel';
import MembershipsPanel from './MembershipsPanel';
import RenewalsPanel from './RenewalsPanel';
import ManagePanel from './ManagePanel';
import AnalyticsPanel from './AnalyticsPanel';
import AboutPanel from './AboutPanel';
import OfferPanel from './OfferPanel';

import {
  getBookings, bucketOf, getMemberSignups, saveMemberSignups, effectiveMembershipStatus,
} from '../../utils/adminStore';

import { getSession, logout } from '../../utils/adminAuth';
import logoImg from '../../assets/logo.png';

import { getBookingsFromFirebase, subscribeToMembershipSignups } from '../../firebase';
import { MEMBERSHIP_SIGNUP_EVENT } from '../../utils/membershipSignups';

const TABS = [
  { id: 'bookings', label: 'Bookings', icon: CalendarCheck },
  { id: 'memberships', label: 'Memberships', icon: CreditCard },
  { id: 'renewals', label: 'Renewals', icon: BellRing },
  { id: 'offer', label: 'Special Offer', icon: Tag },
  { id: 'manage', label: 'Manage', icon: Settings2 },
  { id: 'about', label: 'About Us', icon: Info },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
];

/** Cloud rows win on conflict; local-only rows (offline signups) are kept. */
function mergeSignups(cloudList, localList) {
  const byId = new Map();
  [...localList, ...cloudList].forEach((signup) => {
    if (signup?.id) byId.set(signup.id, signup);
  });
  return Array.from(byId.values()).sort((a, b) =>
    String(b.createdAt || '').localeCompare(String(a.createdAt || ''))
  );
}

export default function AdminDashboard({ onLogout, onExit }) {
  const [tab, setTab] = useState('bookings');
  const [bookings, setBookings] = useState(() => getBookings());
  const [memberSignups, setMemberSignups] = useState(() => getMemberSignups());
  const [loadingCloud, setLoadingCloud] = useState(true);

  const session = getSession();
  const todayCount = bookings.filter((booking) => bucketOf(booking) === 'today').length;
  const pendingCount = bookings.filter((booking) => (booking.status || 'Pending') === 'Pending').length;
  const activeMembers = memberSignups.filter(
    (signup) => effectiveMembershipStatus(signup) === 'Active'
  ).length;

  // Load and subscribe to live bookings from Firebase Cloud Firestore
  useEffect(() => {
    let isMounted = true;

    const syncFirebaseBookings = async () => {
      try {
        const cloudBookings = await getBookingsFromFirebase();
        if (isMounted && cloudBookings.length > 0) {
          // Merge local and cloud bookings uniquely
          const localBookings = getBookings();
          const combinedMap = new Map();
          [...cloudBookings, ...localBookings].forEach(b => {
            if (b.id) combinedMap.set(b.id, b);
          });
          setBookings(Array.from(combinedMap.values()));
        }
      } catch (err) {
        console.warn('Could not sync cloud bookings:', err);
      } finally {
        if (isMounted) setLoadingCloud(false);
      }
    };

    syncFirebaseBookings();

    const refresh = () => {
      syncFirebaseBookings();
    };

    window.addEventListener('storage', refresh);
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', refresh);
    const interval = setInterval(refresh, 4000);

    return () => {
      isMounted = false;
      window.removeEventListener('storage', refresh);
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', refresh);
      clearInterval(interval);
    };
  }, []);

  // Memberships stream straight from Firestore — a signup on any device shows
  // up here without a refresh. Local rows cover anything taken while offline.
  useEffect(() => {
    let isMounted = true;

    const applyCloud = (cloudSignups) => {
      if (!isMounted) return;
      const merged = mergeSignups(cloudSignups, getMemberSignups());
      saveMemberSignups(merged);
      setMemberSignups(merged);
    };

    const unsubscribe = subscribeToMembershipSignups(applyCloud);

    // Same-tab signups and other-tab writes, for when the listener is offline.
    const refreshLocal = () => {
      if (isMounted) setMemberSignups(getMemberSignups());
    };

    window.addEventListener(MEMBERSHIP_SIGNUP_EVENT, refreshLocal);
    window.addEventListener('storage', refreshLocal);
    window.addEventListener('focus', refreshLocal);

    return () => {
      isMounted = false;
      unsubscribe();
      window.removeEventListener(MEMBERSHIP_SIGNUP_EVENT, refreshLocal);
      window.removeEventListener('storage', refreshLocal);
      window.removeEventListener('focus', refreshLocal);
    };
  }, []);

  const handleLogout = () => {
    logout();
    onLogout();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Top bar */}
      <header className="sticky top-0 z-10 border-b border-slate-800 bg-slate-950/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-3 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <img alt="Gymnation" className="h-8 sm:h-9 w-auto" src={logoImg} />
            <div>
              <div className="font-teko text-lg sm:text-xl leading-none tracking-wide text-white">
                OWNER <span className="text-orange-500">PANEL</span>
              </div>
              <div className="mt-0.5 text-[10px] sm:text-[11px] text-slate-500 truncate max-w-[160px] sm:max-w-none">
                {session?.name ? `${session.name} · ` : ''}
                {session?.email}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              className="inline-flex items-center gap-1.5 sm:gap-2 rounded-lg border border-slate-800 px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs font-semibold text-slate-400 transition-colors hover:text-white"
              onClick={onExit}
              type="button"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span className="hidden xs:inline sm:inline">View site</span>
            </button>
            <button
              className="inline-flex items-center gap-1.5 sm:gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs font-bold text-red-400 transition-colors hover:bg-red-500/20"
              onClick={handleLogout}
              type="button"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sign out</span>
            </button>
          </div>
        </div>

        {/* Tabs - Horizontally scrollable on mobile */}
        <div className="mx-auto flex max-w-7xl items-center gap-1 px-3 sm:px-6 overflow-x-auto scrollbar-none whitespace-nowrap">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              className={`-mb-px shrink-0 whitespace-nowrap inline-flex items-center gap-1.5 sm:gap-2 border-b-2 px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-bold transition-colors ${
                tab === id
                  ? 'border-orange-500 text-white'
                  : 'border-transparent text-slate-500 hover:text-slate-300'
              }`}
              key={id}
              onClick={() => setTab(id)}
              type="button"
            >
              <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span>{label}</span>
              {id === 'bookings' && pendingCount > 0 && (
                <span className="rounded-full bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-black text-amber-400">
                  {pendingCount}
                </span>
              )}
              {id === 'memberships' && activeMembers > 0 && (
                <span className="rounded-full bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-black text-emerald-400">
                  {activeMembers}
                </span>
              )}
            </button>
          ))}
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-3 sm:px-6 py-6 sm:py-8 overflow-x-hidden">
        {tab === 'bookings' && (
          <>
            <div className="mb-6">
              <h1 className="font-teko text-3xl uppercase tracking-wide text-white">Bookings</h1>
              <p className="mt-1 text-sm text-slate-400">
                {todayCount} today · {pendingCount} awaiting your decision
              </p>
            </div>

            <div className="mb-6 flex items-start gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-xs leading-relaxed text-emerald-200">
              <MonitorSmartphone className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
              <div>
                <strong className="font-bold">Google Firebase Cloud Database Active.</strong>{' '}
                Bookings made on any phone, laptop, or tablet now sync automatically to your Firestore cloud database in real-time.
              </div>
            </div>
            <BookingsPanel bookings={bookings} onChange={setBookings} />
          </>
        )}

        {tab === 'memberships' && (
          <>
            <div className="mb-6">
              <h1 className="font-teko text-3xl uppercase tracking-wide text-white">Memberships</h1>
              <p className="mt-1 text-sm text-slate-400">
                {memberSignups.length} total · {activeMembers} active right now
              </p>
            </div>

            <div className="mb-6 flex items-start gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-xs leading-relaxed text-emerald-200">
              <MonitorSmartphone className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
              <div>
                <strong className="font-bold">Live membership register.</strong>{' '}
                Everyone who takes a plan — through checkout or the booking form — is added
                here automatically and saved to the <code className="font-mono">membershipSignups</code>{' '}
                collection in your Firestore cloud database.
              </div>
            </div>

            <MembershipsPanel onChange={setMemberSignups} signups={memberSignups} />
          </>
        )}

        {tab === 'renewals' && (
          <>
            <div className="mb-6">
              <h1 className="font-teko text-3xl uppercase tracking-wide text-white">Renewals</h1>
              <p className="mt-1 text-sm text-slate-400">
                Expiry reminders at 5, 3 and 1 days before a membership lapses
              </p>
            </div>

            <RenewalsPanel
              onChange={() => setMemberSignups(getMemberSignups())}
              signups={memberSignups}
            />
          </>
        )}

        {tab === 'offer' && (
          <OfferPanel />
        )}

        {tab === 'manage' && (
          <>
            <div className="mb-6">
              <h1 className="font-teko text-3xl uppercase tracking-wide text-white">Manage</h1>
              <p className="mt-1 text-sm text-slate-400">
                Membership plans, trainers, and class schedule slots.
              </p>
            </div>
            <ManagePanel />
          </>
        )}

        {tab === 'about' && (
          <AboutPanel />
        )}


        {tab === 'analytics' && (
          <>
            <div className="mb-6">
              <h1 className="font-teko text-3xl uppercase tracking-wide text-white">Analytics</h1>
              <p className="mt-1 text-sm text-slate-400">
                Booking trends, popular services, and revenue estimate.
              </p>
            </div>
            <AnalyticsPanel bookings={bookings} />
          </>
        )}
      </main>
    </div>
  );
}
