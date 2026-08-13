import React, { useMemo } from 'react';
import { TrendingUp, IndianRupee, Clock, Star, Download, Users } from 'lucide-react';
import { buildAnalytics, buildMembers, toCsv, downloadCsv, todayISO } from '../../utils/adminStore';

function StatTile({ icon: Icon, label, value, hint }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
      <div className="flex items-center gap-2 text-slate-500">
        <Icon className="h-4 w-4" />
        <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
      </div>
      <div className="mt-2 text-2xl font-black text-white">{value}</div>
      {hint && <div className="mt-1 text-xs text-slate-500">{hint}</div>}
    </div>
  );
}

export default function AnalyticsPanel({ bookings }) {
  const stats = useMemo(() => buildAnalytics(bookings), [bookings]);
  const members = useMemo(() => buildMembers(bookings), [bookings]);

  const peakDay = Math.max(1, ...stats.perDay.map((day) => day.count));
  const topService = stats.services[0];
  const busiestHour = stats.hours[0];

  const exportMembers = () => {
    const csv = toCsv(members, [
      { key: 'name', label: 'Name' },
      { key: 'phone', label: 'Phone' },
      { key: 'email', label: 'Email' },
      { key: 'bookings', label: 'Total Bookings' },
      { key: 'firstBooking', label: 'First Booking' },
      { key: 'lastBooking', label: 'Last Booking' },
    ]);
    downloadCsv(`gymnation-members-${todayISO()}.csv`, csv);
  };

  return (
    <div className="space-y-8">
      {/* Headline numbers */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          hint={`${stats.pending} pending · ${stats.rejected} rejected`}
          icon={TrendingUp}
          label="Total bookings"
          value={stats.total}
        />
        <StatTile
          hint={`${stats.approvedCount} approved bookings`}
          icon={IndianRupee}
          label="Revenue estimate"
          value={`₹${stats.revenue.toLocaleString('en-IN')}`}
        />
        <StatTile
          hint={topService ? `${topService.count} bookings` : 'No data yet'}
          icon={Star}
          label="Most booked"
          value={topService ? topService.name : '—'}
        />
        <StatTile
          hint={busiestHour ? `${busiestHour.count} bookings` : 'No data yet'}
          icon={Clock}
          label="Busiest hour"
          value={busiestHour ? busiestHour.label : '—'}
        />
      </div>

      {/* Bookings per day */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
        <h3 className="text-sm font-bold text-white">Bookings per day</h3>
        <p className="mt-0.5 text-xs text-slate-500">Last 14 days</p>

        <div className="mt-6 flex h-40 items-end gap-1.5">
          {stats.perDay.map((day) => (
            <div className="group flex flex-1 flex-col items-center gap-2" key={day.date}>
              <div className="relative flex w-full flex-1 items-end">
                <div
                  className="w-full rounded-t bg-gradient-to-t from-orange-600 to-amber-500 transition-all group-hover:from-orange-500 group-hover:to-amber-400"
                  style={{ height: `${Math.max(2, (day.count / peakDay) * 100)}%` }}
                  title={`${day.label}: ${day.count} booking${day.count === 1 ? '' : 's'}`}
                />
              </div>
              <span className="text-[9px] whitespace-nowrap text-slate-600">{day.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Services breakdown */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
          <h3 className="text-sm font-bold text-white">Bookings by service</h3>
          <div className="mt-4 space-y-3">
            {stats.services.length === 0 && (
              <p className="text-sm text-slate-500">No bookings yet.</p>
            )}
            {stats.services.map((service) => (
              <div key={service.name}>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300">{service.name}</span>
                  <span className="font-bold text-slate-400">{service.count}</span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-500"
                    style={{ width: `${(service.count / stats.services[0].count) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Busiest hours */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
          <h3 className="text-sm font-bold text-white">Busiest hours</h3>
          <div className="mt-4 space-y-3">
            {stats.hours.length === 0 && <p className="text-sm text-slate-500">No bookings yet.</p>}
            {stats.hours.slice(0, 6).map((hour) => (
              <div key={hour.hour}>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300">{hour.label}</span>
                  <span className="font-bold text-slate-400">{hour.count}</span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500"
                    style={{ width: `${(hour.count / stats.hours[0].count) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Members */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="flex items-center gap-2 text-sm font-bold text-white">
              <Users className="h-4 w-4 text-orange-500" />
              Members
            </h3>
            <p className="mt-0.5 text-xs text-slate-500">
              {members.length} unique {members.length === 1 ? 'person' : 'people'}, derived from bookings
            </p>
          </div>
          <button
            className="inline-flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2 text-sm font-semibold text-slate-300 transition-colors hover:border-orange-500/40 hover:text-white"
            onClick={exportMembers}
            type="button"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        </div>

        {members.length > 0 && (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[32rem] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-[10px] uppercase tracking-wider text-slate-500">
                  <th className="pb-2 font-bold">Name</th>
                  <th className="pb-2 font-bold">Phone</th>
                  <th className="pb-2 font-bold">Bookings</th>
                  <th className="pb-2 font-bold">Last visit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {members.slice(0, 10).map((member) => (
                  <tr key={member.phone || member.email || member.name}>
                    <td className="py-2.5 font-semibold text-slate-200">{member.name}</td>
                    <td className="py-2.5 text-slate-400">{member.phone}</td>
                    <td className="py-2.5 text-slate-400">{member.bookings}</td>
                    <td className="py-2.5 text-slate-400">{member.lastBooking}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {members.length > 10 && (
              <p className="mt-3 text-xs text-slate-600">
                Showing 10 of {members.length} — export the CSV for the full list.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
