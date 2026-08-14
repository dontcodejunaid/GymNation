import React, { useEffect, useState } from 'react';
import AdminLogin from './AdminLogin';
import AdminDashboard from './AdminDashboard';
import { isLoggedIn } from '../../utils/adminAuth';

// The site has no router, so the portal rides on the URL hash. '#/admin' uses a
// slash to stay clear of the '#section-name' scroll anchors the nav and footer use.
export const ADMIN_HASH = '#/admin';

export default function AdminPortal() {
  const [open, setOpen] = useState(() => window.location.hash === ADMIN_HASH);
  const [authed, setAuthed] = useState(() => isLoggedIn());

  useEffect(() => {
    const onHashChange = () => {
      const next = window.location.hash === ADMIN_HASH;
      setOpen(next);
      if (next) setAuthed(isLoggedIn());
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  // Keep the page behind the portal from scrolling underneath it.
  useEffect(() => {
    if (!open) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  if (!open) return null;

  const exit = () => {
    // Clears the hash without leaving a '#' behind in the address bar.
    window.history.pushState('', document.title, window.location.pathname + window.location.search);
    setOpen(false);
  };

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto overscroll-contain bg-slate-950 max-w-[100vw] overflow-x-hidden">
      {authed ? (
        <AdminDashboard onExit={exit} onLogout={() => setAuthed(false)} />
      ) : (
        <AdminLogin onExit={exit} onSuccess={() => setAuthed(true)} />
      )}
    </div>
  );
}
