import React, { useState, useEffect } from 'react';
import { Users, X, Search, Phone, MessageSquare, ShieldCheck, Clock, Calendar, User, RefreshCw, CheckCircle2 } from 'lucide-react';
import { getBookings } from '../utils/localStorage';
import { getBookingsFromFirebase } from '../firebase';
import { WhatsAppConfig } from '../utils/whatsapp';

export default function ClassRosterModal({ isOpen, onClose, classItem }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!isOpen || !classItem) return;

    const fetchRoster = async () => {
      setLoading(true);
      try {
        const localList = getBookings() || [];
        const cloudList = await getBookingsFromFirebase() || [];
        const combined = [...localList, ...cloudList];

        const targetClassName = (classItem.className || '').toLowerCase().trim();
        const targetId = classItem.id;

        // Deduplicate & filter bookings matching this class session
        const uniqueMap = new Map();

        combined.forEach((b) => {
          if (!b || b.status === 'Cancelled') return;
          const serviceName = (b.service || '').toLowerCase().trim();
          const matchesName = targetClassName && serviceName.includes(targetClassName);
          const matchesId = b.classId && b.classId === targetId;

          if (matchesName || matchesId) {
            const key = `${b.phone || b.name || ''}_${b.date || ''}_${b.time || ''}`;
            if (!uniqueMap.has(key)) {
              uniqueMap.set(key, {
                id: b.id || `GN-${Math.floor(10000 + Math.random() * 90000)}`,
                name: b.name || 'Gymnation Member',
                phone: b.phone || 'N/A',
                email: b.email || '',
                date: b.date || classItem.day || 'Scheduled',
                time: b.time || classItem.time || '',
                status: b.status || 'Confirmed',
                createdAt: b.createdAt || new Date().toISOString()
              });
            }
          }
        });

        setMembers(Array.from(uniqueMap.values()));
      } catch (err) {
        console.error('Error loading session roster:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRoster();

    // Listen for real-time booking updates
    const handleUpdate = () => fetchRoster();
    window.addEventListener('storage', handleUpdate);
    window.addEventListener('gymnation-schedule-update', handleUpdate);
    window.addEventListener('booking-created', handleUpdate);

    return () => {
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('gymnation-schedule-update', handleUpdate);
      window.removeEventListener('booking-created', handleUpdate);
    };
  }, [isOpen, classItem]);

  if (!isOpen || !classItem) return null;

  const filteredMembers = members.filter((m) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      m.name.toLowerCase().includes(q) ||
      m.phone.includes(q) ||
      m.id.toLowerCase().includes(q)
    );
  });

  const spotsLeft = Math.max(0, (classItem.capacity || 20) - members.length);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-800 p-6 sm:p-8 space-y-6 shadow-2xl text-slate-100 max-h-[90vh] flex flex-col">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800/80 text-slate-400 hover:text-white transition-colors cursor-pointer"
          type="button"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="space-y-2 border-b border-slate-800/80 pb-4 pr-8">
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-white tracking-tight">{classItem.className}</h3>
              <p className="text-xs text-slate-400">
                Instructor: <strong className="text-slate-200">{classItem.trainer || 'Unassigned'}</strong> • {classItem.day} ({classItem.time})
              </p>
            </div>
          </div>

          {/* Real-Time Stats Banner */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <span className="px-3 py-1 rounded-lg bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-bold flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              Real-Time Joined: {members.length} Members
            </span>
            <span className="px-3 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 text-xs font-medium">
              Capacity: {classItem.capacity || 20} Seats ({spotsLeft > 0 ? `${spotsLeft} left` : 'Class Full'})
            </span>
          </div>
        </div>

        {/* Search & Actions Bar */}
        <div className="flex items-center justify-between gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search joined member name or phone..."
              className="w-full rounded-xl border border-slate-800 bg-slate-950/80 py-2.5 pl-9 pr-4 text-xs text-slate-100 placeholder:text-slate-600 focus:border-orange-500/60 focus:outline-none"
            />
            <Search className="absolute left-3 top-3 h-3.5 w-3.5 text-slate-500" />
          </div>
          <button
            onClick={() => setSearchQuery('')}
            className="px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-400 hover:text-white"
            type="button"
          >
            Clear
          </button>
        </div>

        {/* Member Roster List Container */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-3 min-h-[220px]">
          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400 space-y-3">
              <RefreshCw className="w-6 h-6 text-orange-500 animate-spin mx-auto" />
              <p>Syncing Real-Time Attendance Roster...</p>
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500 bg-slate-950/40 rounded-xl border border-dashed border-slate-800 space-y-2">
              <Users className="w-8 h-8 text-slate-700 mx-auto" />
              <p className="font-semibold text-slate-400">No members match this search</p>
              <p className="text-[11px] text-slate-600">New session bookings will appear here instantly in real-time.</p>
            </div>
          ) : (
            filteredMembers.map((member, index) => {
              const initials = member.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)
                .toUpperCase();

              return (
                <div
                  key={member.id + index}
                  className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-orange-500/30 transition-all"
                >
                  {/* Member Name & Details */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 border border-orange-500/30 text-orange-400 flex items-center justify-center font-bold text-xs shrink-0">
                      {initials || 'BF'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white">{member.name}</h4>
                        <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-extrabold uppercase">
                          {member.status}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 pt-0.5">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-500" /> {member.phone}
                        </span>
                        <span className="text-slate-600">•</span>
                        <span className="font-mono text-slate-300">ID: {member.id}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <a
                      href={`https://wa.me/${member.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi ${member.name}! We look forward to seeing you at ${classItem.className} (${classItem.day} ${classItem.time}) at Gymnation.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 text-xs font-bold transition-all"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </a>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="border-t border-slate-800/80 pt-4 flex items-center justify-between text-xs text-slate-400">
          <span>Real-Time Sync Active ⚡</span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs transition-all cursor-pointer"
            type="button"
          >
            Close Roster
          </button>
        </div>

      </div>
    </div>
  );
}
