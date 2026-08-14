import React, { useEffect, useState } from 'react';
import { MessageCircle, X, QrCode } from 'lucide-react';
import FaqChatbot from './faq-chatbot';
import { ShinySheenButton } from './shiny-button-sheen';
import { ADMIN_HASH } from '../admin/AdminPortal';

/**
 * Fixed helper stack in the bottom-right corner:
 * 1. My Digital Pass (when active pass exists)
 * 2. FAQ Assistant ("Ask Us")
 */
export default function FloatingActions({ activeMemberPass, onOpenPass, onOpenRecovery }) {
  const [chatOpen, setChatOpen] = useState(false);
  const [hidden, setHidden] = useState(() => window.location.hash === ADMIN_HASH);
  const [savedPass, setSavedPass] = useState(activeMemberPass);

  useEffect(() => {
    const onHashChange = () => setHidden(window.location.hash === ADMIN_HASH);
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  useEffect(() => {
    if (activeMemberPass) {
      setSavedPass(activeMemberPass);
    } else {
      try {
        const stored = localStorage.getItem('gymnation_member_pass');
        if (stored) setSavedPass(JSON.parse(stored));
        else setSavedPass(null);
      } catch (e) {
        console.error(e);
      }
    }
  }, [activeMemberPass]);

  // Close the chat panel on Escape.
  useEffect(() => {
    if (!chatOpen) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setChatOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [chatOpen]);

  if (hidden) return null;

  return (
    <div className="fixed bottom-3 right-3 sm:bottom-5 sm:right-5 z-40 flex flex-col items-end gap-2 sm:gap-3 max-w-[calc(100vw-1.5rem)] print:hidden">
      {chatOpen && <FaqChatbot onClose={() => setChatOpen(false)} open={chatOpen} />}

      {/* Digital Pass Button */}
      {savedPass ? (
        <button
          onClick={onOpenPass}
          className="px-4 py-2.5 rounded-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-extrabold text-xs shadow-2xl flex items-center gap-2 border border-orange-400/40 animate-pulse transition-all hover:scale-105 cursor-pointer"
          title="View Digital Gym Entry Pass"
        >
          <QrCode className="w-4 h-4 text-white" />
          <span className="tracking-wider uppercase">My Digital Pass</span>
        </button>
      ) : (
        <button
          onClick={onOpenRecovery}
          className="px-3.5 py-2 rounded-full bg-slate-900/90 hover:bg-slate-800 text-orange-400 font-bold text-xs shadow-xl flex items-center gap-2 border border-orange-500/30 transition-all hover:scale-105 cursor-pointer"
          title="Find or Recover Lost Digital Pass"
        >
          <QrCode className="w-4 h-4 text-orange-500" />
          <span className="tracking-wider uppercase">Find My Pass</span>
        </button>
      )}

      {/* Ask Us Button */}
      <ShinySheenButton
        aria-expanded={chatOpen}
        aria-label={chatOpen ? 'Close assistant' : 'Open assistant'}
        className="rounded-full border border-slate-700/80 bg-slate-950/85 py-2.5 pl-3.5 pr-4 shadow-xl"
        onClick={() => setChatOpen((open) => !open)}
        type="button"
      >
        <span className="flex items-center gap-2.5">
          {chatOpen ? (
            <X className="h-5 w-5 shrink-0" />
          ) : (
            <MessageCircle className="h-5 w-5 shrink-0" />
          )}
          <span className="font-bold tracking-wider">{chatOpen ? 'Close' : 'Ask us'}</span>
        </span>
      </ShinySheenButton>
    </div>
  );
}
