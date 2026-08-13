import React, { useState, useEffect, useMemo, useCallback, useRef, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Maximize2, X, ChevronLeft, ChevronRight, Sparkles, ImageOff } from 'lucide-react';

/* ------------------------------------------------------------------ */
/* Data                                                                 */
/* Every item's category, title, description and image are matched     */
/* 1:1 — Training never shows Cardio art, Studio never shows Amenities. */
/* ------------------------------------------------------------------ */

const galleryItems = [
  // Training
  {
    id: 'training-main-floor',
    title: 'Main Workout Floor',
    category: 'Training',
    desc: 'State-of-the-art free weights, squat racks & plate-loaded machines.',
    url: '/gallery/training-personal-coaching.webp',
  },
  {
    id: 'training-strength-zone',
    title: 'Strength & Power Zone',
    category: 'Training',
    desc: 'Olympic barbells, custom bumper plates & dedicated power platforms.',
    url: '/gallery/training-performance-area.webp',
  },
  {
    id: 'training-functional-zone',
    title: 'Functional Training Zone',
    category: 'Training',
    desc: 'Sled tracks, battle ropes, kettlebells, TRX systems & agility ladders.',
    url: '/gallery/training-functional-zone.webp',
  },
  {
    id: 'training-dumbbell-zone',
    title: 'Dumbbell Zone',
    category: 'Training',
    desc: 'Full-range dumbbell rack with adjustable benches for isolation work.',
    url: '/gallery/training-dumbbell-zone.webp',
  },
  {
    id: 'training-personal-coaching',
    title: 'Personal Coaching Studio',
    category: 'Training',
    desc: 'Private one-on-one sessions with certified trainers and custom plans.',
    url: '/gallery/training-personal-coaching.webp',
  },
  {
    id: 'training-performance-area',
    title: 'Performance Training Area',
    category: 'Training',
    desc: 'Athletic conditioning space built for strength, speed & explosiveness.',
    url: '/gallery/training-performance-area.webp',
  },

  // Cardio
  {
    id: 'cardio-treadmills',
    title: 'Treadmill Row',
    category: 'Cardio',
    desc: 'Commercial treadmills fitted with immersive HD entertainment screens.',
    url: '/gallery/cardio-treadmills.webp',
  },
  {
    id: 'cardio-smart-treadmills',
    title: 'Smart Treadmill Zone',
    category: 'Cardio',
    desc: 'Interactive treadmills with incline simulation and live performance tracking.',
    url: '/gallery/cardio-smart-treadmills.webp',
  },
  {
    id: 'cardio-ellipticals',
    title: 'Elliptical Studio',
    category: 'Cardio',
    desc: 'Premium ellipticals delivering low-impact, full-body cardio conditioning.',
    url: '/gallery/cardio-ellipticals.webp',
  },
  {
    id: 'cardio-spin-bikes',
    title: 'Indoor Cycling Studio',
    category: 'Cardio',
    desc: 'High-energy spin bikes built for endurance rides and interval training.',
    url: '/gallery/cardio-spin-bikes.webp',
  },
  {
    id: 'cardio-rowing-machines',
    title: 'Rowing Zone',
    category: 'Cardio',
    desc: 'Competition-grade rowing machines for endurance and total-body strength.',
    url: '/gallery/cardio-rowing-machines.webp',
  },
  {
    id: 'cardio-cross-trainers',
    title: 'Cross Trainer Hub',
    category: 'Cardio',
    desc: 'Smooth, joint-friendly cross trainers for efficient full-body cardio.',
    url: '/gallery/cardio-cross-trainers.webp',
  },
  {
    id: 'cardio-stair-climbers',
    title: 'Stair Climber Deck',
    category: 'Cardio',
    desc: 'Advanced stair climbers for lower-body strength and cardio endurance.',
    url: '/gallery/cardio-stair-climbers.webp',
  },
  {
    id: 'cardio-hiit-zone',
    title: 'HIIT Cardio Corner',
    category: 'Cardio',
    desc: 'Assault bikes, ski ergs & battle ropes for explosive interval work.',
    url: '/gallery/cardio-hiit-zone.webp',
  },
  {
    id: 'cardio-endurance-zone',
    title: 'Endurance Conditioning Area',
    category: 'Cardio',
    desc: 'A dedicated zone built for marathon training and peak cardiovascular fitness.',
    url: '/gallery/cardio-endurance-zone.webp',
  },

  // Studio
  {
    id: 'studio-yoga',
    title: 'Yoga Studio',
    category: 'Studio',
    desc: 'A peaceful studio for flexibility training, breathwork and mindfulness.',
    url: '/gallery/studio-yoga.webp',
  },
  {
    id: 'studio-zumba',
    title: 'Zumba Dance Studio',
    category: 'Studio',
    desc: 'High-energy dance fitness classes combining music, rhythm and cardio.',
    url: '/gallery/studio-zumba.webp',
  },
  {
    id: 'studio-hiit',
    title: 'HIIT Training Studio',
    category: 'Studio',
    desc: 'Instructor-led high-intensity interval sessions to build strength fast.',
    url: '/gallery/studio-hiit.webp',
  },
  {
    id: 'studio-pilates',
    title: 'Pilates Studio',
    category: 'Studio',
    desc: 'Improve posture, flexibility and core strength with guided Pilates work.',
    url: '/gallery/studio-pilates.webp',
  },
  {
    id: 'studio-aerobics',
    title: 'Aerobics Studio',
    category: 'Studio',
    desc: 'A spacious hall for energetic group workouts and cardio choreography.',
    url: '/gallery/studio-aerobics.webp',
  },
  {
    id: 'studio-functional-class',
    title: 'Functional Training Class',
    category: 'Studio',
    desc: 'Group conditioning built around real-world movement patterns.',
    url: '/gallery/studio-functional-class.webp',
  },
  {
    id: 'studio-group-training',
    title: 'Group Fitness Arena',
    category: 'Studio',
    desc: 'Energetic instructor-led sessions spanning HIIT, Yoga, Zumba & Pilates.',
    url: '/gallery/studio-group-training.webp',
  },
  {
    id: 'studio-strength-class',
    title: 'Strength Training Class',
    category: 'Studio',
    desc: 'Coached group strength sessions using barbells, plates and tempo work.',
    url: '/gallery/studio-strength-class.webp',
  },
  {
    id: 'studio-martial-arts',
    title: 'Martial Arts Studio',
    category: 'Studio',
    desc: 'A dedicated space for boxing, kickboxing and self-defense training.',
    url: '/gallery/studio-martial-arts.webp',
  },
  {
    id: 'studio-meditation',
    title: 'Meditation & Wellness Studio',
    category: 'Studio',
    desc: 'A calming room for guided meditation, breathing work and recovery.',
    url: '/gallery/studio-meditation.webp',
  },
  {
    id: 'studio-virtual-fitness',
    title: 'Virtual Fitness Studio',
    category: 'Studio',
    desc: 'Interactive virtual classes with AI-guided, on-demand workouts.',
    url: '/gallery/studio-virtual-fitness.webp',
  },

  // Amenities
  {
    id: 'amenities-reception',
    title: 'Reception & Welcome Lounge',
    category: 'Amenities',
    desc: 'A bright, modern front desk where every membership journey begins.',
    url: '/gallery/amenities-reception.webp',
  },
  {
    id: 'amenities-locker-room',
    title: 'Premium Locker Room',
    category: 'Amenities',
    desc: 'Secure digital lockers, changing cabins and complimentary toiletries.',
    url: '/gallery/amenities-locker-room.webp',
  },
  {
    id: 'amenities-members-lounge',
    title: 'Members Lounge',
    category: 'Amenities',
    desc: 'Relax with Wi-Fi, charging stations, refreshments and comfy seating.',
    url: '/gallery/amenities-members-lounge.webp',
  },
  {
    id: 'amenities-showers',
    title: 'Luxury Shower Suites',
    category: 'Amenities',
    desc: 'Private showers and an infrared sauna for post-workout recovery.',
    url: '/gallery/amenities-showers.webp',
  },
  {
    id: 'amenities-recovery-zone',
    title: 'Recovery & Stretch Zone',
    category: 'Amenities',
    desc: 'Foam rollers, massage guns and guided mobility equipment.',
    url: '/gallery/amenities-recovery-zone.webp',
  },
  {
    id: 'amenities-refreshment-area',
    title: 'Refreshment & Nutrition Bar',
    category: 'Amenities',
    desc: 'Smoothies, protein bites and hydration to fuel your next session.',
    url: '/gallery/amenities-refreshment-area.webp',
  },
];

const categories = ['All', 'Training', 'Cardio', 'Studio', 'Amenities'];
const FALLBACK_IMAGE = '/gallery/fallback.webp';
const PAGE_SIZE = 8;

/* ------------------------------------------------------------------ */
/* Gallery card                                                        */
/* ------------------------------------------------------------------ */

const GalleryCard = memo(function GalleryCard({ item, index, onOpen }) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);

  const handleOpen = useCallback(() => onOpen(index), [onOpen, index]);
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onOpen(index);
      }
    },
    [onOpen, index]
  );

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.94 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      role="button"
      tabIndex={0}
      aria-label={`Open ${item.title} in full view`}
      onClick={handleOpen}
      onKeyDown={handleKeyDown}
      className="group relative cursor-pointer overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/40 shadow-xl transition-all duration-300 hover:border-orange-500/50 hover:shadow-orange-500/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
    >
      <div className="aspect-[4/3] w-full overflow-hidden bg-slate-900">
        {!loaded && (
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.6s_infinite] bg-gradient-to-r from-transparent via-slate-700/30 to-transparent" />
        )}
        {errored ? (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-slate-900 text-slate-600">
            <ImageOff className="h-6 w-6" aria-hidden="true" />
            <span className="text-[10px] uppercase tracking-wider">Image unavailable</span>
          </div>
        ) : (
          <img
            src={item.url}
            alt={`${item.title} — ${item.category} area at Gymnation`}
            loading="lazy"
            decoding="async"
            fetchPriority="low"
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            onLoad={() => setLoaded(true)}
            onError={(e) => {
              if (e.currentTarget.src.endsWith(FALLBACK_IMAGE)) {
                setErrored(true);
              } else {
                e.currentTarget.src = FALLBACK_IMAGE;
              }
            }}
            className={`h-full w-full object-cover transition-all duration-500 ease-out group-hover:scale-110 ${
              loaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        )}
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent opacity-75 transition-opacity duration-300 group-hover:opacity-90" />

      <div className="absolute top-3 left-3">
        <span className="rounded-md border border-orange-500/30 bg-slate-950/80 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-orange-400 backdrop-blur-md">
          {item.category}
        </span>
      </div>

      <div className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full border border-slate-700 bg-slate-950/80 text-white opacity-0 transition-all duration-300 group-hover:scale-105 group-hover:opacity-100">
        <Maximize2 className="h-4 w-4 text-orange-400" aria-hidden="true" />
      </div>

      <div className="absolute bottom-0 inset-x-0 transform p-4 transition-transform duration-300 group-hover:-translate-y-1">
        <h3 className="font-teko text-2xl uppercase leading-none tracking-wide text-white">
          {item.title}
        </h3>
        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-400">{item.desc}</p>
      </div>
    </motion.div>
  );
});

/* ------------------------------------------------------------------ */
/* Main component                                                       */
/* ------------------------------------------------------------------ */

export default function Gallery() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const touchStartX = useRef(null);

  const filteredItems = useMemo(
    () =>
      activeCategory === 'All'
        ? galleryItems
        : galleryItems.filter((item) => item.category === activeCategory),
    [activeCategory]
  );

  const visibleItems = useMemo(
    () => filteredItems.slice(0, visibleCount),
    [filteredItems, visibleCount]
  );

  const hasMore = visibleCount < filteredItems.length;

  const handleCategoryChange = useCallback((cat) => {
    setActiveCategory(cat);
    setVisibleCount(PAGE_SIZE);
    setLightboxIndex(null);
  }, []);

  const handleLoadMore = useCallback(() => {
    setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, filteredItems.length));
  }, [filteredItems.length]);

  const openLightbox = useCallback((index) => setLightboxIndex(index), []);
  const closeLightbox = useCallback(() => setLightboxIndex(null), []);

  const showPrev = useCallback(
    (e) => {
      e?.stopPropagation();
      setLightboxIndex((prev) =>
        prev === null ? null : prev === 0 ? visibleItems.length - 1 : prev - 1
      );
    },
    [visibleItems.length]
  );

  const showNext = useCallback(
    (e) => {
      e?.stopPropagation();
      setLightboxIndex((prev) =>
        prev === null ? null : prev === visibleItems.length - 1 ? 0 : prev + 1
      );
    },
    [visibleItems.length]
  );

  const activeItem = lightboxIndex !== null ? visibleItems[lightboxIndex] : null;

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (lightboxIndex === null) return undefined;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') showPrev();
      if (e.key === 'ArrowRight') showNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, closeLightbox, showPrev, showNext]);

  // Preload neighboring images so prev/next feel instant
  useEffect(() => {
    if (lightboxIndex === null || visibleItems.length < 2) return;
    const nextIdx = (lightboxIndex + 1) % visibleItems.length;
    const prevIdx = (lightboxIndex - 1 + visibleItems.length) % visibleItems.length;
    [visibleItems[nextIdx]?.url, visibleItems[prevIdx]?.url].forEach((src) => {
      if (!src) return;
      const img = new Image();
      img.src = src;
    });
  }, [lightboxIndex, visibleItems]);

  // Touch / swipe support
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    const SWIPE_THRESHOLD = 50;
    if (delta > SWIPE_THRESHOLD) showPrev();
    else if (delta < -SWIPE_THRESHOLD) showNext();
    touchStartX.current = null;
  };

  return (
    <section
      id="gallery"
      className="scroll-mt-20 relative overflow-hidden border-t border-slate-800/60 bg-slate-950 py-20 text-slate-100"
    >
      {/* Background glow accents */}
      <div className="pointer-events-none absolute -top-40 right-1/4 h-96 w-96 rounded-full bg-orange-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 left-1/4 h-96 w-96 rounded-full bg-orange-600/5 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-6">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-orange-400 backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            Inside Gymnation
          </div>
          <h2 className="font-teko mt-3 text-4xl uppercase tracking-wide text-white sm:text-5xl lg:text-6xl">
            Our <span className="text-orange-500">Facility</span> Gallery
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-slate-400 sm:text-base">
            Explore our world-class gym floor, cutting-edge equipment, high-energy studios, and
            luxury recovery zones.
          </p>

          {/* Category Filter Tabs */}
          <div
            className="mt-8 flex flex-wrap items-center justify-center gap-2 sm:gap-3"
            role="tablist"
            aria-label="Filter gallery by category"
          >
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                role="tab"
                aria-selected={activeCategory === cat}
                onClick={() => handleCategoryChange(cat)}
                className={`rounded-full px-5 py-2 text-xs font-bold uppercase tracking-wider transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${
                  activeCategory === cat
                    ? 'scale-105 bg-orange-500 text-slate-950 shadow-lg shadow-orange-500/25'
                    : 'border border-slate-800 bg-slate-900/80 text-slate-400 hover:border-slate-700 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Gallery Grid */}
        <motion.div
          layout
          className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-5"
        >
          <AnimatePresence mode="popLayout">
            {visibleItems.map((item, idx) => (
              <GalleryCard key={item.id} item={item} index={idx} onOpen={openLightbox} />
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Load More */}
        {hasMore && (
          <div className="mt-12 flex justify-center">
            <motion.button
              type="button"
              onClick={handleLoadMore}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="group relative overflow-hidden rounded-full border border-orange-500/30 bg-slate-900/80 px-8 py-3 text-xs font-bold uppercase tracking-widest text-orange-400 backdrop-blur-md transition-colors duration-300 hover:border-orange-500/60 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              <span className="relative z-10">Load More</span>
              <span className="absolute inset-0 -z-0 origin-left scale-x-0 bg-orange-500/90 transition-transform duration-300 group-hover:scale-x-100" />
            </motion.button>
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {activeItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeLightbox}
            role="dialog"
            aria-modal="true"
            aria-label={`${activeItem.title} image preview`}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 p-4 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              className="relative w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl"
            >
              {/* Image Preview */}
              <div className="relative flex max-h-[70vh] w-full items-center justify-center overflow-hidden bg-black">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={activeItem.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    src={activeItem.url}
                    alt={`${activeItem.title} — ${activeItem.category} area at Gymnation`}
                    onError={(e) => {
                      e.currentTarget.src = FALLBACK_IMAGE;
                    }}
                    className="max-h-[70vh] w-full object-contain"
                  />
                </AnimatePresence>

                <button
                  type="button"
                  onClick={closeLightbox}
                  className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full border border-slate-700 bg-slate-950/80 text-slate-300 transition-colors hover:bg-orange-500 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
                  aria-label="Close image"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>

                {visibleItems.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={showPrev}
                      className="absolute left-4 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-slate-700 bg-slate-950/80 text-white shadow-lg transition-colors hover:bg-orange-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="h-6 w-6" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={showNext}
                      className="absolute right-4 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-slate-700 bg-slate-950/80 text-white shadow-lg transition-colors hover:bg-orange-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
                      aria-label="Next image"
                    >
                      <ChevronRight className="h-6 w-6" aria-hidden="true" />
                    </button>
                  </>
                )}
              </div>

              {/* Modal Footer Description */}
              <div className="flex flex-col gap-4 border-t border-slate-800/80 bg-slate-900 p-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <span className="inline-block rounded-md border border-orange-500/20 bg-orange-500/10 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-orange-400">
                    {activeItem.category}
                  </span>
                  <h3 className="font-teko mt-1 text-3xl uppercase tracking-wide text-white">
                    {activeItem.title}
                  </h3>
                  <p className="text-sm text-slate-400">{activeItem.desc}</p>
                </div>
                <div className="font-mono text-xs text-slate-500">
                  {lightboxIndex + 1} / {visibleItems.length}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
        @media (prefers-reduced-motion: reduce) {
          * { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; }
        }
      `}</style>
    </section>
  );
}
