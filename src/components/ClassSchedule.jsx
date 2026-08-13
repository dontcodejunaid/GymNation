import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  User, 
  MapPin, 
  ChevronRight, 
  Filter, 
  LayoutGrid,
  List,
  Users
} from 'lucide-react';
import { INITIAL_SCHEDULE, CLASS_CATEGORIES, DAYS_OF_WEEK, getTrainerPhoto } from '../data/trainersAndScheduleData';
import ClassRosterModal from './ClassRosterModal';

export default function ClassSchedule({ onSelectClass }) {
  const [schedule, setSchedule] = useState([]);
  const [selectedDay, setSelectedDay] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [rosterClass, setRosterClass] = useState(null);

  // Load schedule from LocalStorage & calculate real-time seat availability
  const loadSchedule = () => {
    try {
      const saved = localStorage.getItem('gymnation_classes');
      const rawBookings = localStorage.getItem('gymnation_bookings');
      const bookingsList = rawBookings ? JSON.parse(rawBookings) : [];

      let classesList = saved ? JSON.parse(saved) : INITIAL_SCHEDULE;
      if (!saved) {
        localStorage.setItem('gymnation_classes', JSON.stringify(INITIAL_SCHEDULE));
      }

      // Calculate real-time seat availability by matching confirmed bookings
      const syncedSchedule = classesList.map(item => {
        const matchingBookingsCount = bookingsList.filter(b => {
          if (!b || b.status === 'Cancelled') return false;
          const serviceMatch = b.service && (b.service.includes(item.className) || item.className.includes(b.service));
          const classIdMatch = b.classId && b.classId === item.id;
          return serviceMatch || classIdMatch;
        }).length;

        const baseBooked = Number(item.booked || 0);
        const totalBooked = Math.max(baseBooked, matchingBookingsCount);
        const capacity = Number(item.capacity || 20);

        return {
          ...item,
          booked: Math.min(capacity, totalBooked),
          capacity: capacity
        };
      });

      setSchedule(syncedSchedule);
    } catch (e) {
      console.warn('LocalStorage error reading gymnation_classes:', e);
      setSchedule(INITIAL_SCHEDULE);
    }
  };

  useEffect(() => {
    loadSchedule();

    const handleUpdate = () => loadSchedule();
    window.addEventListener('storage', handleUpdate);
    window.addEventListener('gymnation-schedule-update', handleUpdate);
    window.addEventListener('booking-created', handleUpdate);

    return () => {
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('gymnation-schedule-update', handleUpdate);
      window.removeEventListener('booking-created', handleUpdate);
    };
  }, []);

  const filteredSchedule = schedule.filter(item => {
    const matchesDay = selectedDay === 'All' || item.day === selectedDay;
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesDay && matchesCategory;
  });

  const handleBookClass = (classItem) => {
    if (onSelectClass) {
      onSelectClass(classItem);
    }
    const el = document.getElementById('book-appointment') || document.getElementById('booking');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const getCategoryBadgeStyle = (category) => {
    switch (category) {
      case 'Yoga':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      case 'Zumba':
        return 'bg-pink-500/10 text-pink-400 border-pink-500/30';
      case 'CrossFit':
        return 'bg-orange-500/10 text-orange-400 border-orange-500/30';
      case 'Strength':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'Cardio':
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
      case 'Others':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      default:
        return 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border-amber-500/40 font-bold';
    }
  };

  const allCategoryPills = Array.from(
    new Set([
      ...CLASS_CATEGORIES.map(c => c.id),
      ...schedule.map(s => s.category).filter(Boolean)
    ])
  ).map(catId => {
    const matched = CLASS_CATEGORIES.find(c => c.id === catId);
    return {
      id: catId,
      label: matched ? matched.label : catId
    };
  });

  return (
    <section id="class-schedule" className="scroll-mt-20 relative py-20 bg-slate-950 text-slate-100 border-t border-slate-800/60 overflow-hidden">
      {/* Background ambient light */}
      <div className="absolute top-1/3 right-10 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs sm:text-sm font-semibold tracking-wide uppercase">
            <Calendar className="w-4 h-4 text-purple-400" />
            Weekly Class Timetable
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Energetic Group Classes <br />
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
              Designed For Every Goal
            </span>
          </h2>

          <p className="text-slate-400 text-base sm:text-lg leading-relaxed">
            From high-octane CrossFit sessions to calming Yoga flows, choose your slot and book your spot instantly before seats fill up.
          </p>
        </div>

        {/* Filters & View Toggle Bar */}
        <div className="bg-slate-900/80 border border-slate-800/80 backdrop-blur-md rounded-2xl p-4 sm:p-6 mb-10 space-y-6 shadow-xl">
          
          {/* Day Filters */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-orange-500" /> Select Day
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedDay('All')}
                className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  selectedDay === 'All'
                    ? 'bg-orange-600 text-white shadow-md shadow-orange-600/30'
                    : 'bg-slate-950 text-slate-400 border border-slate-800 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                All Days
              </button>
              {DAYS_OF_WEEK.map(day => (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                    selectedDay === day
                      ? 'bg-orange-600 text-white shadow-md shadow-orange-600/30'
                      : 'bg-slate-950 text-slate-400 border border-slate-800 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          {/* Category Filters & View Switcher */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pt-4 border-t border-slate-800/80">
            
            {/* Category Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1 mr-1">
                <Filter className="w-3.5 h-3.5 text-purple-400" /> Category:
              </span>
              {allCategoryPills.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                      : 'bg-slate-950/70 text-slate-400 border border-slate-800 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800 self-end md:self-auto">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  viewMode === 'grid'
                    ? 'bg-slate-800 text-orange-400 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
                <span className="hidden sm:inline">Grid View</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  viewMode === 'list'
                    ? 'bg-slate-800 text-orange-400 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="List View"
              >
                <List className="w-4 h-4" />
                <span className="hidden sm:inline">List View</span>
              </button>
            </div>

          </div>

        </div>

        {/* Schedule Display */}
        {filteredSchedule.length === 0 ? (
          <div className="text-center py-16 px-4 bg-slate-900/40 rounded-2xl border border-slate-800/80">
            <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-300">No classes found for this filter</h3>
            <p className="text-sm text-slate-500 mt-1">Try selecting a different day or category filter above.</p>
            <button
              onClick={() => { setSelectedDay('All'); setSelectedCategory('All'); }}
              className="mt-4 px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-semibold text-xs"
            >
              Reset Filters
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          
          /* Grid View Layout */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSchedule.map(item => {
              const spotsLeft = item.capacity - item.booked;
              const fillPercent = Math.round((item.booked / item.capacity) * 100);

              return (
                <div
                  key={item.id}
                  className="group relative rounded-2xl bg-slate-900/80 border border-slate-800/90 hover:border-purple-500/50 backdrop-blur-md p-6 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="space-y-4">
                    {/* Top Row: Category Badge & Level */}
                    <div className="flex items-center justify-between gap-2">
                      <span className={`px-2.5 py-1 rounded-lg border text-xs font-semibold ${getCategoryBadgeStyle(item.category)}`}>
                        {item.category}
                      </span>
                      <span className="text-xs text-slate-400 font-medium px-2 py-0.5 bg-slate-950 rounded-md border border-slate-800">
                        {item.level}
                      </span>
                    </div>

                    {/* Class Name */}
                    <h3 className="text-xl font-bold text-white group-hover:text-purple-300 transition-colors">
                      {item.className}
                    </h3>

                    {/* Time & Day */}
                    <div className="space-y-2 text-xs sm:text-sm text-slate-300">
                      <div className="flex items-center gap-2 text-orange-400 font-medium">
                        <Clock className="w-4 h-4 text-orange-500" />
                        <span>{item.day} • {item.time}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-400">
                        <MapPin className="w-4 h-4 text-slate-500" />
                        <span>{item.room}</span>
                      </div>
                    </div>

                    {/* Trainer Info */}
                    <div className="flex items-center gap-3 pt-2 border-t border-slate-800/60">
                      <img
                        src={getTrainerPhoto(item.trainer, item.trainerPhoto)}
                        alt={item.trainer}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(item.trainer || 'Instructor')}&background=f97316&color=ffffff&bold=true&size=128`;
                        }}
                        className="w-9 h-9 rounded-full object-cover border border-slate-700 shrink-0"
                      />
                      <div>
                        <div className="text-xs text-slate-400">Instructor</div>
                        <div className="text-sm font-semibold text-slate-200">{item.trainer}</div>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                      {item.description}
                    </p>

                    {/* Availability Bar */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between text-xs font-medium">
                        <span className="text-slate-400">Seat Availability</span>
                        <span className={spotsLeft <= 3 ? 'text-amber-400 font-bold' : 'text-emerald-400 font-semibold'}>
                          {spotsLeft > 0 ? `${spotsLeft} seats left` : 'Fully Booked'}
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            fillPercent >= 90 ? 'bg-amber-500' : 'bg-purple-500'
                          }`}
                          style={{ width: `${fillPercent}%` }}
                        />
                      </div>
                    </div>

                  </div>

                  {/* Booking & Roster CTA Buttons */}
                  <div className="pt-6 space-y-2">
                    <button
                      type="button"
                      onClick={() => setRosterClass(item)}
                      className="w-full py-2 px-3 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 text-orange-400 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>Joined Members ({item.booked || 0})</span>
                    </button>

                    <button
                      onClick={() => handleBookClass(item)}
                      disabled={spotsLeft === 0}
                      className={`w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all duration-200 ${
                        spotsLeft > 0
                          ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-md shadow-purple-600/20 active:scale-[0.98]'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                      }`}
                    >
                      <Calendar className="w-4 h-4" />
                      {spotsLeft > 0 ? 'Book This Slot' : 'Class Full'}
                      {spotsLeft > 0 && <ChevronRight className="w-4 h-4 ml-auto" />}
                    </button>
                  </div>

                </div>
              );
            })}
          </div>

        ) : (

          /* List View Layout */
          <div className="space-y-4">
            {filteredSchedule.map(item => {
              const spotsLeft = item.capacity - item.booked;
              return (
                <div
                  key={item.id}
                  className="rounded-2xl bg-slate-900/80 border border-slate-800/90 p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 backdrop-blur-md hover:border-purple-500/40 transition-all"
                >
                  <div className="flex items-start sm:items-center gap-4">
                    <img
                      src={getTrainerPhoto(item.trainer, item.trainerPhoto)}
                      alt={item.trainer}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(item.trainer || 'Instructor')}&background=f97316&color=ffffff&bold=true&size=128`;
                      }}
                      className="w-12 h-12 rounded-2xl object-cover border border-slate-700 flex-shrink-0"
                    />
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className={`px-2.5 py-0.5 rounded-md border text-[11px] font-semibold ${getCategoryBadgeStyle(item.category)}`}>
                          {item.category}
                        </span>
                        <span className="text-xs text-orange-400 font-semibold">{item.day}</span>
                      </div>
                      <h4 className="text-base font-bold text-white">{item.className}</h4>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 mt-1">
                        <span className="flex items-center gap-1 text-slate-300">
                          <Clock className="w-3.5 h-3.5 text-orange-400" /> {item.time}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-500" /> {item.room}
                        </span>
                        <span className="flex items-center gap-1 text-slate-300">
                          <User className="w-3.5 h-3.5 text-slate-500" /> Coach {item.trainer}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-4 border-t md:border-t-0 pt-3 md:pt-0 border-slate-800">
                    <div className="text-right">
                      <div className="text-xs text-slate-400">Available</div>
                      <div className={`text-xs font-bold ${spotsLeft <= 3 ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {spotsLeft} / {item.capacity} seats left
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setRosterClass(item)}
                      className="py-2 px-3 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 text-orange-400 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>Roster ({item.booked || 0})</span>
                    </button>

                    <button
                      onClick={() => handleBookClass(item)}
                      disabled={spotsLeft === 0}
                      className={`py-2.5 px-5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all ${
                        spotsLeft > 0
                          ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-600/20'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      {spotsLeft > 0 ? 'Book Slot' : 'Full'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

        )}

      </div>

      <ClassRosterModal
        isOpen={Boolean(rosterClass)}
        onClose={() => setRosterClass(null)}
        classItem={rosterClass}
      />
    </section>
  );
}
