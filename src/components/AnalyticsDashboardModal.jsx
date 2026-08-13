import React, { useState, useEffect } from 'react';
import { 
  X, TrendingUp, Users, CalendarCheck, CreditCard, PieChart, 
  Activity, CheckCircle2, ChevronRight, Phone, ShieldCheck, User, Clock, ArrowUpRight
} from 'lucide-react';
import { getAnalyticsSummary } from '../utils/analytics';

export default function AnalyticsDashboardModal({ isOpen, onClose }) {
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState('trials'); // 'trials' | 'memberships' | 'visitors' | 'conversion'

  useEffect(() => {
    if (isOpen) {
      setStats(getAnalyticsSummary());
    }
  }, [isOpen]);

  if (!isOpen || !stats) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-8 p-6 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">Gymnation Business Analytics & Member Roster</h3>
              <p className="text-xs text-slate-400">Click any metric card below to view detailed member entries</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Interactive Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          
          {/* Card 1: Total Visitors */}
          <button
            type="button"
            onClick={() => setActiveTab('visitors')}
            className={`p-4 rounded-2xl border text-left transition-all duration-300 relative group ${
              activeTab === 'visitors'
                ? 'bg-orange-500/10 border-orange-500 shadow-lg shadow-orange-500/20 ring-1 ring-orange-500'
                : 'bg-slate-950 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
            }`}
          >
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
              <span>Total Visitors</span>
              <Users className={`w-4 h-4 ${activeTab === 'visitors' ? 'text-orange-400' : 'text-slate-500'}`} />
            </div>
            <div className="text-xl font-black text-white mt-1">{stats.totalVisitors}</div>
            <span className="text-[10px] text-emerald-400 font-bold block">+12% this week</span>
            <span className="text-[9px] text-slate-500 mt-1 block font-medium group-hover:text-orange-400 transition-colors">
              Click to view sources →
            </span>
          </button>

          {/* Card 2: Conversion Rate */}
          <button
            type="button"
            onClick={() => setActiveTab('conversion')}
            className={`p-4 rounded-2xl border text-left transition-all duration-300 relative group ${
              activeTab === 'conversion'
                ? 'bg-amber-500/10 border-amber-500 shadow-lg shadow-amber-500/20 ring-1 ring-amber-500'
                : 'bg-slate-950 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
            }`}
          >
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
              <span>Conversion Rate</span>
              <TrendingUp className={`w-4 h-4 ${activeTab === 'conversion' ? 'text-amber-400' : 'text-slate-500'}`} />
            </div>
            <div className="text-xl font-black text-amber-400 mt-1">{stats.conversionRate}%</div>
            <span className="text-[10px] text-emerald-400 font-bold block">High intent leads</span>
            <span className="text-[9px] text-slate-500 mt-1 block font-medium group-hover:text-amber-400 transition-colors">
              Click to view funnel →
            </span>
          </button>

          {/* Card 3: Booked Trials */}
          <button
            type="button"
            onClick={() => setActiveTab('trials')}
            className={`p-4 rounded-2xl border text-left transition-all duration-300 relative group ${
              activeTab === 'trials'
                ? 'bg-purple-500/10 border-purple-500 shadow-lg shadow-purple-500/20 ring-1 ring-purple-500'
                : 'bg-slate-950 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
            }`}
          >
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
              <span>Booked Trials</span>
              <CalendarCheck className={`w-4 h-4 ${activeTab === 'trials' ? 'text-purple-400' : 'text-slate-500'}`} />
            </div>
            <div className="text-xl font-black text-white mt-1">{stats.trialBookings}</div>
            <span className="text-[10px] text-purple-400 font-bold block">{stats.bookedTrialMembers?.length || 5} active list</span>
            <span className="text-[9px] text-slate-500 mt-1 block font-medium group-hover:text-purple-400 transition-colors">
              Click to view list →
            </span>
          </button>

          {/* Card 4: Memberships */}
          <button
            type="button"
            onClick={() => setActiveTab('memberships')}
            className={`p-4 rounded-2xl border text-left transition-all duration-300 relative group ${
              activeTab === 'memberships'
                ? 'bg-emerald-500/10 border-emerald-500 shadow-lg shadow-emerald-500/20 ring-1 ring-emerald-500'
                : 'bg-slate-950 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
            }`}
          >
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
              <span>Memberships</span>
              <CreditCard className={`w-4 h-4 ${activeTab === 'memberships' ? 'text-emerald-400' : 'text-slate-500'}`} />
            </div>
            <div className="text-xl font-black text-emerald-400 mt-1">{stats.membershipPurchases}</div>
            <span className="text-[10px] text-emerald-400 font-bold block">Active paid passes</span>
            <span className="text-[9px] text-slate-500 mt-1 block font-medium group-hover:text-emerald-400 transition-colors">
              Click to view members →
            </span>
          </button>

        </div>

        {/* Revenue Summary Ribbon */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-950 via-orange-950/40 to-slate-950 border border-orange-500/30 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-orange-400 uppercase tracking-wider block">TOTAL REVENUE GENERATED</span>
            <span className="text-2xl font-black text-white">₹{stats.revenueGenerated.toLocaleString()}</span>
          </div>
          <span className="px-3 py-1 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20 text-xs font-bold">
            Most Popular: {stats.mostPopularPlan}
          </span>
        </div>

        {/* Dynamic Detailed Content View based on Selected Tab */}
        <div className="space-y-3">
          
          {/* View 1: Booked Trial Members List */}
          {activeTab === 'trials' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-purple-400 flex items-center gap-2">
                  <CalendarCheck className="w-4 h-4" />
                  Booked Trial Members ({stats.bookedTrialMembers?.length || 0})
                </h4>
                <span className="text-[11px] text-slate-400">Free Session Claimed</span>
              </div>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {stats.bookedTrialMembers && stats.bookedTrialMembers.length > 0 ? (
                  stats.bookedTrialMembers.map((member, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs hover:border-purple-500/40 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 font-bold flex items-center justify-center border border-purple-500/30 shrink-0">
                          {member.name.charAt(0)}
                        </div>
                        <div>
                          <h5 className="font-extrabold text-white">{member.name}</h5>
                          <span className="text-[11px] text-slate-400 flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-500" />
                            {member.phone}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-right">
                        <div>
                          <span className="text-[10px] text-purple-300 font-bold block">{member.slot}</span>
                          <span className="text-[10px] text-slate-400 font-medium">Coach: {member.trainer}</span>
                        </div>
                        <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                          {member.status}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-slate-500 text-xs">No trial bookings recorded yet.</div>
                )}
              </div>
            </div>
          )}

          {/* View 2: Active Paid Memberships List */}
          {activeTab === 'memberships' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Active Paid Members ({stats.activePaidMembers?.length || 0})
                </h4>
                <span className="text-[11px] text-slate-400">Official Pass Holders</span>
              </div>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {stats.activePaidMembers && stats.activePaidMembers.length > 0 ? (
                  stats.activePaidMembers.map((member, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs hover:border-emerald-500/40 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center border border-emerald-500/30 shrink-0">
                          {member.name.charAt(0)}
                        </div>
                        <div>
                          <h5 className="font-extrabold text-white flex items-center gap-1.5">
                            {member.name}
                            <span className="text-[10px] font-mono text-amber-400 bg-amber-400/10 border border-amber-400/20 px-1.5 py-0.5 rounded">
                              {member.passId}
                            </span>
                          </h5>
                          <span className="text-[11px] text-slate-400 flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-500" />
                            {member.phone}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-right">
                        <div>
                          <span className="text-[11px] text-white font-bold block">{member.plan}</span>
                          <span className="text-[10px] text-amber-400 font-semibold">{member.amount}</span>
                        </div>
                        <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-black uppercase">
                          {member.status}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-slate-500 text-xs">No active paid members recorded yet.</div>
                )}
              </div>
            </div>
          )}

          {/* View 3: Visitors Breakdown */}
          {activeTab === 'visitors' && (
            <div className="space-y-3">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-orange-400 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Traffic & Visitor Sources Breakdown
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Organic Search</span>
                  <span className="text-lg font-black text-white">45%</span>
                  <span className="text-[10px] text-slate-500 block">Google Maps / SEO</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Direct Visits</span>
                  <span className="text-lg font-black text-white">30%</span>
                  <span className="text-[10px] text-slate-500 block">gymnation.com</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Instagram</span>
                  <span className="text-lg font-black text-pink-400">15%</span>
                  <span className="text-[10px] text-slate-500 block">@gymnation_ecity</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">WhatsApp</span>
                  <span className="text-lg font-black text-emerald-400">10%</span>
                  <span className="text-[10px] text-slate-500 block">Referral Links</span>
                </div>
              </div>
            </div>
          )}

          {/* View 4: Conversion Funnel */}
          {activeTab === 'conversion' && (
            <div className="space-y-3">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Visitor-To-Booking Conversion Funnel
              </h4>

              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex justify-between items-center">
                  <span className="font-semibold text-slate-300">1. Total Site Visits</span>
                  <span className="font-black text-white">1,420 (100%)</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex justify-between items-center">
                  <span className="font-semibold text-slate-300">2. Viewed Membership / Facilities</span>
                  <span className="font-black text-amber-400">480 (33.8%)</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex justify-between items-center">
                  <span className="font-semibold text-slate-300">3. Initiated Trial / Checkout Form</span>
                  <span className="font-black text-orange-400">168 (11.8%)</span>
                </div>
                <div className="p-3 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-slate-950 border border-emerald-500/40 flex justify-between items-center">
                  <span className="font-black text-emerald-400">4. Confirmed Bookings & Active Members</span>
                  <span className="font-black text-emerald-400 text-sm">133 Total (9.3%)</span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors"
        >
          Close Analytics Dashboard
        </button>

      </div>
    </div>
  );
}
