import React, { useState, useEffect } from 'react';
import { 
  Star, 
  Award, 
  CheckCircle2, 
  Calendar, 
  Share2, 
  ChevronRight, 
  Filter, 
  X,
  ShieldCheck,
  Zap,
  Clock
} from 'lucide-react';
import { INITIAL_TRAINERS, getTrainerPhoto } from '../data/trainersAndScheduleData';
import { getTrainersFromFirebase, subscribeTrainersFromFirebase } from '../firebase';

export default function Trainers({ onSelectTrainer }) {
  const [trainers, setTrainers] = useState([]);
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedTrainerModal, setSelectedTrainerModal] = useState(null);

  // Load trainers from Firebase Firestore database with real-time sync and fallback
  useEffect(() => {
    let isMounted = true;
    async function loadTrainers() {
      let combined = [];
      try {
        const rawLocal = localStorage.getItem('gymnation_trainers');
        const localList = rawLocal ? JSON.parse(rawLocal) : [];
        const fbList = (await getTrainersFromFirebase()) || [];

        const mergedMap = new Map();
        INITIAL_TRAINERS.forEach(t => {
          const key = (t.name || t.id || '').toLowerCase().trim();
          if (key) mergedMap.set(key, t);
        });
        localList.forEach(t => {
          const key = (t.name || t.id || '').toLowerCase().trim();
          if (key) {
            const existing = mergedMap.get(key) || {};
            mergedMap.set(key, {
              ...existing,
              ...t,
              photo: (t.photo && String(t.photo).trim()) ? t.photo : existing.photo
            });
          }
        });
        fbList.forEach(t => {
          const key = (t.name || t.id || '').toLowerCase().trim();
          if (key) {
            const existing = mergedMap.get(key) || {};
            mergedMap.set(key, {
              ...existing,
              ...t,
              photo: (t.photo && String(t.photo).trim()) ? t.photo : existing.photo
            });
          }
        });

        combined = Array.from(mergedMap.values());
      } catch (err) {
        console.warn('Trainers fetch error:', err);
        combined = INITIAL_TRAINERS;
      }

      if (isMounted) {
        setTrainers(combined.length > 0 ? combined : INITIAL_TRAINERS);
      }
    }

    loadTrainers();

    // Subscribe to real-time updates from Firebase Cloud Database
    const unsubscribe = subscribeTrainersFromFirebase((liveTrainers) => {
      if (isMounted && Array.isArray(liveTrainers) && liveTrainers.length > 0) {
        setTrainers(liveTrainers);
      }
    });

    const handleStorageChange = () => loadTrainers();
    window.addEventListener('gymnation_trainers_updated', handleStorageChange);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      isMounted = false;
      unsubscribe();
      window.removeEventListener('gymnation_trainers_updated', handleStorageChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const filterCategories = [
    'All',
    'Strength',
    'Yoga',
    'Fat Loss',
    'Zumba',
    'CrossFit',
  ];

  const filteredTrainers = trainers.filter(trainer => {
    if (!trainer) return false;
    if (activeFilter === 'All') return true;
    const specs = Array.isArray(trainer.specialties)
      ? trainer.specialties
      : typeof trainer.specialties === 'string'
      ? trainer.specialties.split(',')
      : [];
    return specs.some(specialty => 
      String(specialty).toLowerCase().includes(activeFilter.toLowerCase())
    );
  });

  const handleBookSession = (trainer) => {
    if (onSelectTrainer) {
      onSelectTrainer(trainer);
    }
    // Scroll smoothly to book appointment section if present
    const el = document.getElementById('book-appointment') || document.getElementById('booking');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="trainers" className="scroll-mt-20 relative py-20 bg-slate-950 text-slate-100 overflow-hidden border-t border-slate-800/60">
      {/* Ambient background blur glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs sm:text-sm font-semibold tracking-wide uppercase">
            <ShieldCheck className="w-4 h-4 text-orange-500" />
            Certified Expert Coaches & Duty Schedules
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Train With Bengaluru’s Premier <br />
            <span className="bg-gradient-to-r from-orange-400 via-orange-500 to-amber-400 bg-clip-text text-transparent">
              Fitness & Transformation Specialists
            </span>
          </h2>

          <p className="text-slate-400 text-base sm:text-lg leading-relaxed">
            Our certified personal trainers are committed to personalizing your workouts, correcting technique, and pushing your limits to ensure real, sustainable results.
          </p>

          {/* Filter Pills */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            <span className="text-xs text-slate-400 font-medium mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-orange-500" /> Filter:
            </span>
            {filterCategories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
                  activeFilter === cat
                    ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/30'
                    : 'bg-slate-900/90 text-slate-400 border border-slate-800 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Trainers Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTrainers.map((trainer) => (
            <div
              key={trainer.id}
              // Card background is opaque so it matches the photo gradient's
              // base exactly. At 70% it rendered ~#0b1224 over the slate-950
              // page while the gradient ended at solid #0f172a, and that
              // mismatch showed as a light seam under every photo.
              className="group relative rounded-2xl bg-slate-900 border border-slate-800/80 hover:border-orange-500/50 overflow-hidden flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-orange-500/10"
            >
              {/* Photo & Top Badges */}
              <div className="relative h-72 w-full overflow-hidden bg-slate-900">
                <img
                  src={getTrainerPhoto(trainer.name, trainer.photo || trainer.imageUrl)}
                  alt={trainer.name}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(trainer.name || 'Coach')}&background=f97316&color=ffffff&bold=true&size=256`;
                  }}
                  className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
                />
                {/* Extends 1px past the bottom (clipped by overflow-hidden) so
                    sub-pixel rounding can't leave a bright sliver of the photo
                    showing as a hairline under the card image. */}
                <div className="pointer-events-none absolute left-0 right-0 top-0 -bottom-px bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />

                {/* Solid card-coloured strip pinned to the bottom edge. Even if
                    sub-pixel rounding leaves the gradient a fraction short, the
                    photo's last row can never show through as a light hairline. */}
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[2px] bg-slate-900" />
                
                {/* Experience Badge */}
                <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950/80 border border-slate-800 backdrop-blur-md text-xs font-semibold text-orange-400">
                  <Award className="w-3.5 h-3.5 text-orange-500" />
                  {trainer.experience}
                </div>

                {/* Rating Badge */}
                <div className="absolute top-4 right-4 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-950/80 border border-slate-800 backdrop-blur-md text-xs font-bold text-amber-400">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  {trainer.rating}
                  <span className="text-slate-400 font-normal">({trainer.reviewsCount})</span>
                </div>

                {/* Trainer Name Overlay */}
                <div className="absolute bottom-3 left-4 right-4">
                  <h3 className="text-2xl font-bold text-white tracking-tight group-hover:text-orange-400 transition-colors">
                    {trainer.name}
                  </h3>
                  <p className="text-xs sm:text-sm font-medium text-orange-400/90">
                    {trainer.role}
                  </p>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
                
                {/* Work Shift Schedule Badge */}
                {trainer.shiftHours && (
                  <div className="p-2.5 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center gap-2 text-xs text-orange-300 font-semibold">
                    <Clock className="w-4 h-4 text-orange-400 shrink-0" />
                    <span>Shift: {trainer.shiftHours}</span>
                  </div>
                )}

                {/* Specialty Tags */}
                <div className="flex flex-wrap gap-1.5">
                  {Array.isArray(trainer.specialties) ? (
                    trainer.specialties.map((spec, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-300 text-xs font-medium"
                      >
                        {spec}
                      </span>
                    ))
                  ) : typeof trainer.specialties === 'string' && trainer.specialties.trim() ? (
                    trainer.specialties.split(',').map((spec, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-300 text-xs font-medium"
                      >
                        {spec.trim()}
                      </span>
                    ))
                  ) : (
                    <span className="px-2.5 py-1 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-400 text-xs font-medium">
                      Fitness & Personal Training
                    </span>
                  )}
                </div>

                {/* Bio text */}
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed line-clamp-3">
                  {trainer.bio || 'Professional Gymnation fitness transformation coach.'}
                </p>

                {/* Action Buttons */}
                <div className="pt-2 space-y-2.5">
                  <button
                    onClick={() => handleBookSession(trainer)}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-sm shadow-md shadow-orange-600/20 transition-all duration-200 active:scale-[0.98]"
                  >
                    <Calendar className="w-4 h-4" />
                    Book Session with {(trainer.name || 'Trainer').split(' ')[0]}
                    <ChevronRight className="w-4 h-4 ml-auto" />
                  </button>

                  <button
                    onClick={() => setSelectedTrainerModal(trainer)}
                    className="w-full text-center text-xs text-slate-400 hover:text-slate-200 font-medium py-1.5 transition-colors"
                  >
                    View Certifications & Shift Schedule →
                  </button>
                </div>

              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Trainer Detail Modal */}
      {selectedTrainerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-6 sm:p-8 space-y-6 shadow-2xl text-slate-100 max-h-[90vh] overflow-y-auto">
            
            {/* Close Button */}
            <button
              onClick={() => setSelectedTrainerModal(null)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-4">
              <img
                src={getTrainerPhoto(selectedTrainerModal.name, selectedTrainerModal.photo || selectedTrainerModal.imageUrl)}
                alt={selectedTrainerModal.name}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedTrainerModal.name || 'Coach')}&background=f97316&color=ffffff&bold=true&size=256`;
                }}
                className="w-20 h-20 rounded-2xl object-cover border border-slate-700 shadow-md"
              />
              <div>
                <h3 className="text-xl font-bold text-white">{selectedTrainerModal.name}</h3>
                <p className="text-xs text-orange-400 font-medium">{selectedTrainerModal.role || 'Fitness Coach'}</p>
                <div className="flex items-center gap-2 mt-1.5 text-xs text-amber-400">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span className="font-bold">{selectedTrainerModal.rating || '4.9'}</span>
                  <span className="text-slate-400">({selectedTrainerModal.reviewsCount || 10} reviews)</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-slate-300 font-medium">{selectedTrainerModal.experience || '5+ Years'} Exp.</span>
                </div>
              </div>
            </div>

            {/* Work Shift Schedule Details */}
            {selectedTrainerModal.shiftHours && (
              <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/20 text-xs text-slate-200 space-y-1">
                <span className="font-bold text-orange-400 uppercase tracking-wider block">Allocated Work Shift</span>
                <p className="text-slate-300 font-semibold">{selectedTrainerModal.shiftHours}</p>
              </div>
            )}

            {/* Bio */}
            <div>
              <h4 className="text-xs font-semibold uppercase text-slate-400 tracking-wider mb-2">About Trainer</h4>
              <p className="text-sm text-slate-300 leading-relaxed">{selectedTrainerModal.bio || 'Dedicated Gymnation personal transformation & strength coach.'}</p>
            </div>

            {/* Certifications */}
            <div>
              <h4 className="text-xs font-semibold uppercase text-slate-400 tracking-wider mb-2">Certifications & Credentials</h4>
              <ul className="space-y-2">
                {Array.isArray(selectedTrainerModal.certifications) && selectedTrainerModal.certifications.length > 0 ? (
                  selectedTrainerModal.certifications.map((cert, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-xs sm:text-sm text-slate-200">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <span>{cert}</span>
                    </li>
                  ))
                ) : (
                  <li className="flex items-center gap-2 text-xs sm:text-sm text-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>Gymnation Certified Fitness & Transformation Specialist</span>
                  </li>
                )}
              </ul>
            </div>

            {/* Social */}
            <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
              <span className="flex items-center gap-1.5">
                <Share2 className="w-4 h-4 text-orange-400" />
                {selectedTrainerModal.instagram}
              </span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <Zap className="w-3.5 h-3.5" /> Shift Active Today
              </span>
            </div>

            {/* CTA */}
            <button
              onClick={() => {
                const tr = selectedTrainerModal;
                setSelectedTrainerModal(null);
                handleBookSession(tr);
              }}
              className="w-full py-3.5 px-4 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-sm shadow-lg shadow-orange-600/30 transition-all flex items-center justify-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              Book Personal Training Session
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
