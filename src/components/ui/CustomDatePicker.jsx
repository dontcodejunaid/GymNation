import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, X } from 'lucide-react';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export default function CustomDatePicker({ value, onChange, placeholder = "Select Date", minYear = 1940, maxYear = 2030 }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Parse initial date
  const selectedDate = value ? new Date(value + 'T00:00:00') : null;
  const initialYear = selectedDate && !isNaN(selectedDate) ? selectedDate.getFullYear() : 2000;
  const initialMonth = selectedDate && !isNaN(selectedDate) ? selectedDate.getMonth() : 0;

  const [currentYear, setCurrentYear] = useState(initialYear);
  const [currentMonth, setCurrentMonth] = useState(initialMonth);
  const [viewMode, setViewMode] = useState('days'); // 'days' | 'months' | 'years'

  // Update view when value changes from outside
  useEffect(() => {
    if (value) {
      const d = new Date(value + 'T00:00:00');
      if (!isNaN(d)) {
        setCurrentYear(d.getFullYear());
        setCurrentMonth(d.getMonth());
      }
    }
  }, [value]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Helper to calculate days in month
  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const handlePrevMonth = (e) => {
    e.stopPropagation();
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = (e) => {
    e.stopPropagation();
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleSelectDay = (day) => {
    const mm = String(currentMonth + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    const formatted = `${currentYear}-${mm}-${dd}`;
    onChange(formatted);
    setIsOpen(false);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange('');
    setIsOpen(false);
  };

  const handleSetToday = (e) => {
    e.stopPropagation();
    const today = new Date();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const formatted = `${today.getFullYear()}-${mm}-${dd}`;
    onChange(formatted);
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
    setIsOpen(false);
  };

  // Generate Year options
  const years = [];
  for (let y = maxYear; y >= minYear; y--) {
    years.push(y);
  }

  // Format display text
  const formatDisplay = (val) => {
    if (!val) return '';
    try {
      const parts = val.split('-');
      if (parts.length === 3) {
        const [y, m, d] = parts;
        const monthName = MONTHS[parseInt(m, 10) - 1]?.slice(0, 3);
        return `${d} ${monthName}, ${y}`;
      }
    } catch (e) {}
    return val;
  };

  // Calendar matrix calculations
  const totalDays = getDaysInMonth(currentYear, currentMonth);
  const firstDayIndex = getFirstDayOfMonth(currentYear, currentMonth);
  const prevMonthDays = getDaysInMonth(currentYear, currentMonth === 0 ? 11 : currentMonth - 1);

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs hover:border-orange-500/60 focus:outline-none focus:border-orange-500 transition-all cursor-pointer text-left group"
      >
        <span className={value ? 'text-white font-medium' : 'text-slate-500'}>
          {value ? formatDisplay(value) : placeholder}
        </span>
        <CalendarIcon className="w-3.5 h-3.5 text-orange-400 group-hover:scale-110 transition-transform" />
      </button>

      {/* Modern Popover Picker */}
      {isOpen && (
        <div className="absolute z-[99999] top-full mt-2 left-0 w-72 bg-slate-950/95 backdrop-blur-2xl border border-slate-800 rounded-2xl p-3.5 shadow-2xl shadow-orange-500/20 animate-in fade-in zoom-in-95 duration-150">
          {/* Header Controls */}
          <div className="flex items-center justify-between mb-3 border-b border-slate-800/80 pb-2.5">
            <div className="flex items-center gap-1.5">
              {/* Month Dropdown / Selector */}
              <select
                value={currentMonth}
                onChange={(e) => setCurrentMonth(parseInt(e.target.value, 10))}
                className="bg-slate-900 text-orange-400 text-xs font-bold px-2 py-1 rounded-lg border border-slate-800 focus:outline-none focus:border-orange-500 cursor-pointer"
              >
                {MONTHS.map((m, idx) => (
                  <option key={m} value={idx}>
                    {m}
                  </option>
                ))}
              </select>

              {/* Year Dropdown / Selector */}
              <select
                value={currentYear}
                onChange={(e) => setCurrentYear(parseInt(e.target.value, 10))}
                className="bg-slate-900 text-white text-xs font-bold px-2 py-1 rounded-lg border border-slate-800 focus:outline-none focus:border-orange-500 cursor-pointer"
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            {/* Prev / Next Arrows */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrevMonth}
                title="Previous Month"
                className="p-1 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                title="Next Month"
                className="p-1 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors cursor-pointer"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Days of Week Header */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {DAYS.map((d, i) => (
              <div
                key={d}
                className={`text-[10px] font-bold uppercase ${
                  i === 0 ? 'text-orange-500' : 'text-slate-400'
                }`}
              >
                {d}
              </div>
            ))}
          </div>

          {/* Days Matrix */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {/* Previous month padding days */}
            {Array.from({ length: firstDayIndex }).map((_, i) => {
              const dayNum = prevMonthDays - firstDayIndex + i + 1;
              return (
                <div
                  key={`prev-${i}`}
                  className="h-7 flex items-center justify-center text-[11px] text-slate-700 font-medium select-none"
                >
                  {dayNum}
                </div>
              );
            })}

            {/* Current month days */}
            {Array.from({ length: totalDays }).map((_, i) => {
              const dayNum = i + 1;
              const isSelected =
                selectedDate &&
                selectedDate.getFullYear() === currentYear &&
                selectedDate.getMonth() === currentMonth &&
                selectedDate.getDate() === dayNum;

              const today = new Date();
              const isToday =
                today.getFullYear() === currentYear &&
                today.getMonth() === currentMonth &&
                today.getDate() === dayNum;

              return (
                <button
                  type="button"
                  key={`cur-${dayNum}`}
                  onClick={() => handleSelectDay(dayNum)}
                  className={`h-7 w-full rounded-lg text-xs font-semibold flex items-center justify-center transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/30 scale-105 font-bold'
                      : isToday
                      ? 'border border-orange-500/60 text-orange-400 hover:bg-orange-500/20'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`}
                >
                  {dayNum}
                </button>
              );
            })}
          </div>

          {/* Quick Footer Action Buttons */}
          <div className="flex items-center justify-between border-t border-slate-800/80 mt-3 pt-2 text-[11px]">
            <button
              type="button"
              onClick={handleClear}
              className="text-slate-400 hover:text-rose-400 transition-colors font-medium cursor-pointer"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={handleSetToday}
              className="text-orange-400 hover:text-orange-300 font-bold transition-colors cursor-pointer"
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
