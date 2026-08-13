import React from 'react';
import { Star, ExternalLink, Heart, MessageCircle, CheckCircle2, Award, Camera } from 'lucide-react';

const InstagramIcon = (props) => (
  <svg
    viewBox="0 0 24 24"
    width="24"
    height="24"
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const googleReviews = [
  {
    name: 'Aarav Sharma',
    avatar: 'A',
    time: '2 weeks ago',
    rating: 5,
    text: 'Best gym in Electronic City! The trainers at the Shikaripalya branch genuinely pay attention to your form during heavy lifts. Equipment is always clean and functional.',
    verified: true
  },
  {
    name: 'Riya Malhotra',
    avatar: 'R',
    time: '1 month ago',
    rating: 5,
    text: 'The steam bath and locker facilities are top notch. Super clean, safe environment for female members. Loved the HIIT classes with Trainer Karan!',
    verified: true
  },
  {
    name: 'Vikram Choudhary',
    avatar: 'V',
    time: '3 weeks ago',
    rating: 5,
    text: 'Lost 14 kg in 4 months under their custom diet plan and personal training suite. Highly recommended for anyone serious about physical transformation.',
    verified: true
  }
];

const instagramPosts = [
  {
    id: 1,
    imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&auto=format&fit=crop&q=80',
    likes: '482',
    comments: '34',
    caption: 'Monday Motivation: Heavy Olympic squad session on the turf floor! 🔥 #GymnationElectronicCity #NoExcuses'
  },
  {
    id: 2,
    imageUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500&auto=format&fit=crop&q=80',
    likes: '620',
    comments: '51',
    caption: 'Transformation Tuesday: Member Aarav hitting his 140kg deadlift personal record! 💪'
  },
  {
    id: 3,
    imageUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=500&auto=format&fit=crop&q=80',
    likes: '395',
    comments: '22',
    caption: 'Post-workout eucalyptus steam bath recovery. Refresh, detox, rebuild. 🌿'
  },
  {
    id: 4,
    imageUrl: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=500&auto=format&fit=crop&q=80',
    likes: '740',
    comments: '68',
    caption: 'New dumbbell racks up to 50kg installed in our free weights floor. Come lift! 🏋️‍♂️'
  }
];

export default function SocialProofFeed() {
  return (
    <section className="py-16 sm:py-24 bg-slate-950 text-slate-100 relative overflow-hidden border-t border-slate-800/60" id="reviews">
      {/* Background Lighting Orbs */}
      <div className="absolute top-1/3 left-10 w-96 h-96 bg-orange-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-amber-500/10 rounded-full blur-[130px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-16">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold uppercase tracking-wider">
            <Award className="w-4 h-4 text-orange-500" />
            Loved By 1,200+ Active Members
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Real Reviews,{' '}
            <span className="bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400 bg-clip-text text-transparent">
              Real Transformations.
            </span>
          </h2>
          <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
            Check out verified Google Maps reviews and follow our daily training stories live on Instagram.
          </p>
        </div>

        {/* 1. Google Reviews Ribbon & Cards */}
        <div className="space-y-8">
          {/* Rating Summary Bar */}
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
            <div className="flex items-center gap-4 text-center sm:text-left">
              <div className="w-14 h-14 rounded-2xl bg-white text-slate-950 flex items-center justify-center font-black text-2xl shadow-md shrink-0">
                G
              </div>
              <div>
                <div className="flex items-center justify-center sm:justify-start gap-1.5">
                  <span className="text-2xl font-black text-white">4.9</span>
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-slate-400 font-semibold">
                  Based on 350+ Verified Google Reviews • Shikaripalya, Electronic City
                </p>
              </div>
            </div>

            <a
              href="https://maps.google.com/?q=Gymnation,+01,+Gollahalli+Main+Rd,+Shikaripalya,+Electronic+City,+Bengaluru,+Karnataka+560100"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-2 transition-colors border border-slate-700 shrink-0"
            >
              <span>Write a Google Review</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          {/* Review Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {googleReviews.map((rev, idx) => (
              <div
                key={idx}
                className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md flex flex-col justify-between space-y-4 hover:border-orange-500/40 transition-colors shadow-lg"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex text-amber-400">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400" />
                      ))}
                    </div>
                    <span className="text-[10px] text-slate-500 font-medium">{rev.time}</span>
                  </div>
                  <p className="text-slate-300 text-xs sm:text-sm leading-relaxed italic">
                    "{rev.text}"
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-3 border-t border-slate-800/80">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 text-white font-bold text-sm flex items-center justify-center shadow-md">
                    {rev.avatar}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center gap-1">
                      {rev.name}
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    </h4>
                    <span className="text-[10px] text-slate-500 font-medium">Verified Google Reviewer</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Instagram Feed Section */}
        <div className="space-y-8 pt-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-600 text-white shadow-lg">
                <InstagramIcon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white">@gymnation_ecity</h3>
                <p className="text-xs text-slate-400">Follow us on Instagram for daily workout reels & tips</p>
              </div>
            </div>

            <a
              href="https://www.instagram.com/code_innovativetechnologies"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-pink-600/20 transition-all"
            >
              <InstagramIcon className="w-4 h-4" />
              <span>Follow on Instagram</span>
            </a>
          </div>

          {/* Instagram Post Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {instagramPosts.map((post) => (
              <a
                key={post.id}
                href="https://www.instagram.com/code_innovativetechnologies"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative rounded-2xl overflow-hidden aspect-square border border-slate-800 bg-slate-900 shadow-xl"
              >
                <img
                  src={post.imageUrl}
                  alt={post.caption}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-slate-950/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-4 text-white">
                  <div className="flex items-center justify-end gap-3 text-xs font-bold">
                    <span className="flex items-center gap-1">
                      <Heart className="w-4 h-4 text-pink-500 fill-pink-500" />
                      {post.likes}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="w-4 h-4 text-white" />
                      {post.comments}
                    </span>
                  </div>
                  <p className="text-[11px] line-clamp-3 text-slate-200 font-medium">
                    {post.caption}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
