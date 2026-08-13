import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingDown, TrendingUp, Minus, Plus, Trash2,
  BarChart2, Activity, Scale, Ruler, ChevronDown, ChevronUp, Target
} from 'lucide-react';

const STORAGE_KEY = 'gymnation_progress_logs';

const METRICS = [
  { key: 'weight',  label: 'Weight',    unit: 'kg',  color: '#f97316' },
  { key: 'waist',   label: 'Waist',     unit: 'cm',  color: '#fb923c' },
  { key: 'chest',   label: 'Chest',     unit: 'cm',  color: '#fbbf24' },
  { key: 'hips',    label: 'Hips',      unit: 'cm',  color: '#f59e0b' },
  { key: 'bodyFat', label: 'Body Fat',  unit: '%',   color: '#ea580c' },
];

function toDateStr(d) { return d.toISOString().slice(0, 10); }
function formatDate(str) {
  const [y, m, d] = str.split('-');
  return `${d}/${m}/${y}`;
}

/* ─── SVG Line Chart ──────────────────────────────────────────────── */
function LineChart({ logs, metricKey, color }) {
  const points = logs
    .filter(l => l[metricKey] !== '' && l[metricKey] != null)
    .map(l => ({ date: l.date, val: parseFloat(l[metricKey]) }))
    .sort((a, b) => a.date.localeCompare(b.date));

  if (points.length < 2) {
    return (
      <div className="flex flex-col items-center justify-center h-40 gap-2 text-orange-500/50">
        <BarChart2 className="w-8 h-8" />
        <span className="text-xs font-semibold text-slate-500">Log at least 2 entries to see your chart</span>
      </div>
    );
  }

  const W = 520, H = 140, PAD = { t: 14, r: 14, b: 30, l: 44 };
  const vals = points.map(p => p.val);
  const minV = Math.min(...vals);
  const maxV = Math.max(...vals);
  const range = maxV - minV || 1;

  const toX = i => PAD.l + ((W - PAD.l - PAD.r) / (points.length - 1)) * i;
  const toY = v => PAD.t + (H - PAD.t - PAD.b) * (1 - (v - minV) / range);

  const polyline = points.map((p, i) => `${toX(i)},${toY(p.val)}`).join(' ');
  const area = `${toX(0)},${H - PAD.b} ` + points.map((p, i) => `${toX(i)},${toY(p.val)}`).join(' ') + ` ${toX(points.length - 1)},${H - PAD.b}`;
  const ticks = [minV, minV + range / 2, maxV];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 160 }}>
      {ticks.map((t, i) => {
        const y = toY(t);
        return (
          <g key={i}>
            <line x1={PAD.l} y1={y} x2={W - PAD.r} y2={y} stroke="#292524" strokeWidth="1" strokeDasharray="4 4" />
            <text x={PAD.l - 6} y={y + 4} textAnchor="end" fontSize="10" fill="#78716c">
              {t % 1 === 0 ? t : t.toFixed(1)}
            </text>
          </g>
        );
      })}
      <polygon points={area} fill={color} opacity="0.12" />
      <polyline points={polyline} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p, i) => (
        <circle key={i} cx={toX(i)} cy={toY(p.val)} r="5" fill={color} stroke="#0c0a09" strokeWidth="2">
          <title>{`${formatDate(p.date)}: ${p.val}`}</title>
        </circle>
      ))}
      {points.map((p, i) => {
        const step = Math.max(1, Math.floor(points.length / 5));
        if (i % step !== 0 && i !== points.length - 1) return null;
        return (
          <text key={i} x={toX(i)} y={H - PAD.b + 14} textAnchor="middle" fontSize="9" fill="#78716c">
            {formatDate(p.date).slice(0, 5)}
          </text>
        );
      })}
    </svg>
  );
}

/* ─── Stat Card ───────────────────────────────────────────────────── */
function StatCard({ label, value, unit, trend }) {
  const Icon = trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : Minus;
  const trendColor = trend < 0 ? 'text-emerald-400' : trend > 0 ? 'text-rose-400' : 'text-slate-500';
  return (
    <div className="bg-stone-950 border border-orange-500/20 rounded-2xl p-4 flex flex-col gap-1 shadow-inner">
      <span className="text-[10px] uppercase tracking-widest text-orange-500/60 font-bold">{label}</span>
      <span className="text-xl font-black text-white">
        {value ?? '—'}
        <span className="text-xs text-stone-500 ml-1">{unit}</span>
      </span>
      {trend !== null && (
        <span className={`flex items-center gap-1 text-xs font-bold ${trendColor}`}>
          <Icon className="w-3.5 h-3.5" />
          {Math.abs(trend).toFixed(1)} {unit}
        </span>
      )}
    </div>
  );
}

/* ─── Main Component ──────────────────────────────────────────────── */
export default function ProgressTracker() {
  const [logs, setLogs] = useState([]);
  const [activeMetric, setActiveMetric] = useState('weight');
  const [showForm, setShowForm] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [form, setForm] = useState({
    date: toDateStr(new Date()),
    weight: '', waist: '', chest: '', hips: '', bodyFat: '', notes: ''
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setLogs(JSON.parse(raw));
    } catch {}
  }, []);

  const persist = (newLogs) => {
    setLogs(newLogs);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(newLogs)); } catch {}
  };

  const handleAdd = () => {
    const entry = { id: Date.now(), ...form };
    persist([...logs, entry].sort((a, b) => a.date.localeCompare(b.date)));
    setSaved(true);
    setShowForm(false);
    setForm({ date: toDateStr(new Date()), weight: '', waist: '', chest: '', hips: '', bodyFat: '', notes: '' });
    setTimeout(() => setSaved(false), 2500);
  };

  const handleDelete = (id) => persist(logs.filter(l => l.id !== id));

  const stats = useMemo(() => {
    const valid = logs
      .filter(l => l[activeMetric] !== '' && l[activeMetric] != null)
      .sort((a, b) => a.date.localeCompare(b.date))
      .map(l => parseFloat(l[activeMetric]));
    if (!valid.length) return { start: null, current: null, best: null, change: null };
    return {
      start:   valid[0],
      current: valid[valid.length - 1],
      best:    ['weight','waist','hips','bodyFat'].includes(activeMetric) ? Math.min(...valid) : Math.max(...valid),
      change:  valid.length > 1 ? valid[valid.length - 1] - valid[0] : null,
    };
  }, [logs, activeMetric]);

  const metric = METRICS.find(m => m.key === activeMetric);

  /* Input style reused across all fields */
  const inputCls = "w-full bg-stone-950 border-2 border-orange-500/30 rounded-xl px-4 py-3 text-white font-semibold text-sm focus:outline-none focus:border-orange-500 focus:shadow-[0_0_0_3px_rgba(249,115,22,0.15)] transition-all placeholder-stone-600";

  return (
    <section
      id="progress-tracker"
      className="scroll-mt-20 py-16 sm:py-24 bg-slate-950 relative overflow-hidden border-t border-slate-800/60"
    >

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-8">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-orange-500/10 border border-orange-500/25 text-orange-400 text-xs font-extrabold uppercase tracking-wider">
              <BarChart2 className="w-4 h-4" />
              Member Feature
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Progress <span className="bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400 bg-clip-text text-transparent">Tracker</span>
            </h2>
            <p className="text-stone-400 text-sm max-w-lg">
              Log your weight &amp; body measurements over time. Watch your transformation unfold in a personal chart — stored privately on your device.
            </p>
          </div>

          <button
            onClick={() => setShowForm(v => !v)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-sm shadow-lg shadow-orange-600/30 transition-all active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4" />
            Log Today's Entry
          </button>
        </div>

        {/* ── Log Form ── */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="bg-stone-950 border border-orange-500/25 rounded-3xl p-6 space-y-5 shadow-2xl shadow-orange-500/5">
                {/* Top accent bar */}
                <div className="absolute top-0 left-0 right-0 h-1 rounded-t-3xl bg-gradient-to-r from-orange-600 via-amber-500 to-orange-600" style={{ position: 'relative', borderRadius: 9999 }} />

                <div className="flex items-center justify-between">
                  <h3 className="text-white font-bold text-base flex items-center gap-2">
                    <Target className="w-4 h-4 text-orange-400" /> New Progress Entry
                  </h3>
                  <span className="text-xs text-stone-500">All metric fields optional</span>
                </div>

                {/* Date */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-orange-400/70 block">Date</label>
                  <input
                    type="date"
                    value={form.date}
                    max={toDateStr(new Date())}
                    onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                    className={`${inputCls} w-full sm:w-52`}
                    style={{ colorScheme: 'dark' }}
                  />
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                  {METRICS.map(m => (
                    <div key={m.key} className="space-y-1">
                      <label className="text-[11px] font-bold uppercase tracking-wider block" style={{ color: m.color }}>
                        {m.label} <span className="text-stone-600">({m.unit})</span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        placeholder="—"
                        value={form[m.key]}
                        onChange={e => setForm(f => ({ ...f, [m.key]: e.target.value }))}
                        className={inputCls}
                        style={{ colorScheme: 'dark' }}
                      />
                    </div>
                  ))}
                </div>

                {/* Notes */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-orange-400/70 block">Notes (optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Felt strong today, chest day, 8hrs sleep..."
                    value={form.notes}
                    onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                    className={inputCls}
                  />
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleAdd}
                    disabled={!form.date}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 disabled:opacity-40 text-white font-bold text-sm shadow-lg shadow-orange-600/25 transition-all active:scale-95"
                  >
                    Save Entry
                  </button>
                  <button
                    onClick={() => setShowForm(false)}
                    className="px-5 py-2.5 rounded-xl border border-stone-700 text-stone-400 hover:text-white hover:border-stone-500 font-bold text-sm transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Saved toast */}
        <AnimatePresence>
          {saved && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="fixed top-24 right-6 z-50 px-5 py-3 rounded-2xl bg-orange-500 text-white font-bold text-sm shadow-xl shadow-orange-500/30 flex items-center gap-2"
            >
              ✅ Progress entry saved!
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Empty State or Chart ── */}
        {logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-5 rounded-3xl border-2 border-dashed border-orange-500/25 bg-orange-500/5">
            <div className="w-20 h-20 rounded-full bg-orange-500/10 border border-orange-500/30 flex items-center justify-center shadow-[0_0_40px_rgba(249,115,22,0.15)]">
              <BarChart2 className="w-10 h-10 text-orange-400" />
            </div>
            <div className="text-center space-y-1">
              <p className="text-white font-bold text-lg">Start Tracking Your Progress</p>
              <p className="text-stone-400 text-sm max-w-xs mx-auto">Log your first entry to see your personal transformation chart appear here.</p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-sm shadow-lg shadow-orange-600/25 transition-all active:scale-95"
            >
              + Log First Entry
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Metric Tabs */}
            <div className="flex flex-wrap gap-2">
              {METRICS.map(m => (
                <button
                  key={m.key}
                  onClick={() => setActiveMetric(m.key)}
                  className={`px-4 py-1.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all border ${
                    activeMetric === m.key
                      ? 'text-white border-transparent'
                      : 'bg-transparent border-stone-800 text-stone-500 hover:text-orange-300 hover:border-orange-500/40'
                  }`}
                  style={activeMetric === m.key
                    ? { background: `linear-gradient(135deg, ${m.color}, ${m.color}cc)`, boxShadow: `0 4px 18px ${m.color}44`, borderColor: 'transparent' }
                    : {}}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatCard label="Start"        value={stats.start}   unit={metric.unit} trend={null} />
              <StatCard label="Current"      value={stats.current} unit={metric.unit} trend={null} />
              <StatCard label="Best"         value={stats.best}    unit={metric.unit} trend={null} />
              <StatCard
                label="Total Change"
                value={stats.change !== null
                  ? (stats.change > 0 ? `+${stats.change.toFixed(1)}` : stats.change.toFixed(1))
                  : '—'}
                unit={stats.change !== null ? metric.unit : ''}
                trend={stats.change}
              />
            </div>

            {/* Chart Card */}
            <div className="bg-stone-950 border border-orange-500/20 rounded-3xl p-5 shadow-xl shadow-orange-500/5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-bold text-sm flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full inline-block shadow-sm" style={{ background: metric.color, boxShadow: `0 0 8px ${metric.color}` }} />
                  {metric.label} over time
                </h3>
                <span className="text-xs text-stone-500 bg-stone-900 border border-stone-800 px-2 py-0.5 rounded-lg">{metric.unit}</span>
              </div>
              <LineChart logs={logs} metricKey={activeMetric} color={metric.color} />
            </div>

            {/* History */}
            <div className="bg-stone-950 border border-orange-500/20 rounded-3xl overflow-hidden shadow-xl">
              <button
                onClick={() => setShowHistory(v => !v)}
                className="w-full flex items-center justify-between px-6 py-4 text-sm font-bold text-white hover:bg-orange-500/5 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-orange-400" />
                  Log History <span className="text-stone-500 font-normal">({logs.length} entries)</span>
                </span>
                {showHistory
                  ? <ChevronUp className="w-4 h-4 text-stone-500" />
                  : <ChevronDown className="w-4 h-4 text-stone-500" />}
              </button>

              <AnimatePresence>
                {showHistory && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="overflow-x-auto border-t border-orange-500/10">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-orange-500/5">
                          <tr>
                            <th className="px-4 py-2.5 text-orange-500/70 font-bold uppercase tracking-wider">Date</th>
                            {METRICS.map(m => (
                              <th key={m.key} className="px-3 py-2.5 font-bold uppercase tracking-wider whitespace-nowrap" style={{ color: m.color }}>
                                {m.label} ({m.unit})
                              </th>
                            ))}
                            <th className="px-3 py-2.5 text-stone-600 font-bold uppercase tracking-wider">Notes</th>
                            <th className="px-3 py-2.5" />
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-orange-500/5">
                          {[...logs].reverse().map(log => (
                            <tr key={log.id} className="hover:bg-orange-500/5 transition-colors">
                              <td className="px-4 py-3 font-semibold text-white whitespace-nowrap">{formatDate(log.date)}</td>
                              {METRICS.map(m => (
                                <td key={m.key} className="px-3 py-3 text-stone-300 whitespace-nowrap">
                                  {log[m.key] !== '' && log[m.key] != null
                                    ? <span style={{ color: m.color }}>{log[m.key]}</span>
                                    : <span className="text-stone-700">—</span>}
                                </td>
                              ))}
                              <td className="px-3 py-3 text-stone-500 max-w-[180px] truncate">{log.notes || '—'}</td>
                              <td className="px-3 py-3">
                                <button
                                  onClick={() => handleDelete(log.id)}
                                  className="p-1.5 rounded-lg hover:bg-rose-500/15 text-stone-700 hover:text-rose-400 transition-all"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
