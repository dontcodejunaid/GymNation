import React, { useState } from 'react';
import { X, BookOpen, Utensils, Apple, Dumbbell, Flame, Sparkles, Search, ChevronRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
import logoImg from '../assets/logo.png';

const ARTICLES = [
  {
    id: 'calorie-deficit-101',
    category: 'Diets',
    title: 'Calorie Deficit 101: How Fat Loss Actually Works',
    readTime: '4 min read',
    summary: 'Understand the fundamental physics of fat loss without falling for extreme crash diets or restrictive fads.',
    author: 'Gymnation Nutrition Team',
    date: 'August 2026',
    icon: Flame,
    content: `
      ### The Thermodynamics of Fat Loss
      Weight loss fundamentally relies on energy balance: **Energy In vs. Energy Out**. To lose body fat, you must consistently consume fewer calories than your total daily energy expenditure (TDEE).

      #### 1. What is TDEE?
      Your TDEE consists of:
      - **BMR (Basal Metabolic Rate):** Calories burned at rest maintaining vital organs.
      - **NEAT (Non-Exercise Activity):** Walking, fidgeting, daily chores.
      - **TEF (Thermic Effect of Food):** Calories burned digesting meals (protein requires ~20-30% of its energy to digest!).
      - **EAT (Exercise Activity):** Weight training and cardio sessions.

      #### 2. The Ideal Deficit Size
      A moderate deficit of **300 to 500 kcal below TDEE** is ideal. This enables sustainable fat loss (~0.5 kg / 1 lb per week) while preserving precious lean muscle mass and energy levels.

      #### 3. Key Rules for Fat Loss
      - Keep protein high (1.6g - 2.2g per kg of body weight).
      - prioritize 7-8 hours of quality sleep to control hunger hormones (Ghrelin & Leptin).
      - Drink 3.5L+ of water daily.
    `
  },
  {
    id: 'protein-sources-guide',
    category: 'Nutrition',
    title: 'Top Protein Foods for Maximum Muscle Hypertrophy',
    readTime: '5 min read',
    summary: 'A complete breakdown of high-protein Indian and global food options for both Veg and Non-Veg lifters.',
    author: 'Gymnation Head Coach',
    date: 'August 2026',
    icon: Utensils,
    content: `
      ### Why Protein is King for Gym Goers
      Protein supplies essential amino acids (especially Leucine) required for muscle repair and building new muscle fibers after resistance training.

      #### Top Non-Vegetarian Options:
      - **Chicken Breast:** ~31g protein per 100g (Lean & low fat).
      - **Whole Eggs & Egg Whites:** Bioavailable gold standard protein.
      - **Fish (Rohu, Salmon, Tilapia):** High protein plus Omega-3 fatty acids.

      #### Top Vegetarian Options:
      - **Low-Fat Paneer / Cottage Cheese:** ~18g protein per 100g.
      - **Greek Yogurt / Soya Chunks:** Soya chunks yield ~52g protein per 100g dry weight!
      - **Sprouted Moong & Dal Blend:** Pair legumes with rice to ensure a complete amino acid profile.
      - **Whey Protein Isolate:** Convenient post-workout supplementation.
    `
  },
  {
    id: 'pre-post-workout-fueling',
    category: 'Nutrition',
    title: 'Pre-Workout & Post-Workout Meal Timing Secrets',
    readTime: '3 min read',
    summary: 'Fuel your workout performance and accelerate muscle recovery with optimal nutrient timing.',
    author: 'Certified Sports Nutritionist',
    date: 'August 2026',
    icon: Apple,
    content: `
      ### Pre-Workout Fueling (60-90 mins before training)
      Your pre-workout meal supplies glycogen to power heavy lifts and intense cardio sessions.
      - **Goal:** Fast-digesting complex carbs + light protein.
      - **Examples:** Oats with half a banana, or Whole wheat toast with 1 tbsp peanut butter.

      ### Post-Workout Recovery (Within 45 mins post training)
      After lifting, muscle fibers are sensitized for protein synthesis and glycogen replenishment.
      - **Goal:** Fast-acting protein + simple carbs.
      - **Examples:** 1 Scoop Whey Protein + 1 Banana, or Egg whites + rice cake.
    `
  },
  {
    id: 'hydration-recovery-hacks',
    category: 'Recovery',
    title: 'Hydration & Electrolytes: The Forgotten Growth Factor',
    readTime: '3 min read',
    summary: 'Why losing even 2% of body water drops strength levels by 15%, and how to hydrate effectively.',
    author: 'Gymnation Recovery Specialist',
    date: 'August 2026',
    icon: Dumbbell,
    content: `
      ### Water is 70% of Muscle Tissue
      Dehydration drastically increases muscle fatigue, joint friction, and risk of cramps.

      #### Daily Hydration Blueprint:
      - **Baseline:** Drink 35ml water per kg of body weight.
      - **During Workout:** Sip 500ml - 750ml water mixed with a pinch of Himalayan pink salt or electrolytes.
      - **Signs of Good Hydration:** Pale straw-colored urine throughout the day.
    `
  }
];

export default function NutritionHubModal({ isOpen, onClose }) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeArticle, setActiveArticle] = useState(null);

  if (!isOpen) return null;

  const categories = ['All', 'Nutrition', 'Diets', 'Recovery'];

  const filteredArticles = ARTICLES.filter(art => {
    const matchesCat = selectedCategory === 'All' || art.category === selectedCategory;
    const matchesSearch = art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          art.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Top Navigation Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <img src={logoImg} alt="Gymnation Logo" className="h-9 w-auto" />
            <div>
              <div className="flex items-center gap-2">
                {/* White Scale TIPS Badge */}
                <span className="px-2 py-0.5 rounded-full border border-white text-white font-black text-[10px] tracking-wider uppercase bg-white/10">
                  TIPS
                </span>
                <h3 className="text-base font-black text-white leading-none">NUTRITION &amp; DIET GUIDES</h3>
              </div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Simple Articles &amp; Science-Backed Advice</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {activeArticle ? (
            /* Article Detailed View */
            <div className="space-y-6 animate-fadeIn">
              <button
                type="button"
                onClick={() => setActiveArticle(null)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Articles</span>
              </button>

              <div className="space-y-3 bg-slate-950/80 p-6 rounded-2xl border border-slate-800">
                <div className="flex items-center gap-2 text-xs font-extrabold text-orange-400">
                  <span className="px-2.5 py-0.5 rounded-full bg-orange-500/10 border border-orange-500/30 uppercase">
                    {activeArticle.category}
                  </span>
                  <span>• {activeArticle.readTime}</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                  {activeArticle.title}
                </h2>
                <div className="text-xs text-slate-400 font-semibold border-b border-slate-800 pb-4">
                  By {activeArticle.author} • {activeArticle.date}
                </div>

                <div className="prose prose-invert max-w-none text-slate-300 text-sm leading-relaxed space-y-4 pt-2">
                  {activeArticle.content.split('\n\n').map((paragraph, idx) => (
                    <p key={idx} className="whitespace-pre-line">
                      {paragraph.trim()}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Article List View */
            <div className="space-y-6">
              {/* Search & Category Filter Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                {/* Category Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                        selectedCategory === cat
                          ? 'bg-orange-500 text-slate-950 shadow-md shadow-orange-500/20'
                          : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Search Input */}
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search guides & diets..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              {/* Articles Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredArticles.map((art) => {
                  const IconComp = art.icon;
                  return (
                    <div
                      key={art.id}
                      onClick={() => setActiveArticle(art)}
                      className="bg-slate-950/80 border border-slate-800/90 hover:border-orange-500/50 rounded-2xl p-5 space-y-3 cursor-pointer transition-all duration-300 hover:scale-[1.01] hover:shadow-xl group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-[10px] font-extrabold uppercase">
                          {art.category}
                        </span>
                        <span className="text-[10px] font-bold text-slate-500">{art.readTime}</span>
                      </div>

                      <h4 className="text-base font-black text-white group-hover:text-orange-400 transition-colors leading-tight">
                        {art.title}
                      </h4>

                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {art.summary}
                      </p>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-900 text-xs font-extrabold text-orange-400">
                        <span>Read Full Guide</span>
                        <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-400 font-semibold">
            Need customized dietary consulting? Visit our trainers at Gymnation.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
