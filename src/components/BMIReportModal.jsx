import React from 'react';
import { X, Printer, Download, Dumbbell, Utensils, CheckCircle2, Flame, ArrowRight, FileText } from 'lucide-react';
import logoImg from '../assets/logo.png';
import { scrollToSection } from '../lib/scrollToSection';

export default function BMIReportModal({ isOpen, onClose, metricsData }) {
  if (!isOpen || !metricsData) return null;

  const {
    gender,
    age,
    heightCm,
    weightKg,
    activityLabel,
    goalLabel,
    goalId,
    bmi,
    category,
    color,
    calorieTarget,
    proteinGrams,
    carbsGrams,
    fatsGrams
  } = metricsData;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadSummary = () => {
    const reportText = `=====================================================
GYMNATION FITNESS CENTRE - PERSONAL PERFORMANCE REPORT
=====================================================
Date: ${new Date().toLocaleDateString()}

USER METRICS:
- Gender & Age: ${gender.toUpperCase()} | ${age} Years
- Height & Weight: ${heightCm} cm | ${weightKg} kg
- Activity Level: ${activityLabel}
- Fitness Goal: ${goalLabel}
- BMI Score: ${bmi} (${category})

DAILY NUTRITION TARGET:
- Target Energy: ${calorieTarget} kcal / day
- Protein: ${proteinGrams} g
- Carbs: ${carbsGrams} g
- Fats: ${fatsGrams} g

SUGGESTED WEEKLY WORKOUT SPLIT:
${currentWorkout.map((w) => `• ${w.day}: ${w.workout}`).join('\n')}

SUGGESTED MEAL BLUEPRINT:
${currentDiet.map((d) => `• ${d.meal}: ${d.detail}`).join('\n')}

TRAINER RECOMMENDATIONS:
- Drink 3.5L to 4L of water daily.
- Ensure 7-8 hours of sound sleep for muscle hypertrophy and fat oxidation.
- Contact Gymnation Fitness Centre for 1-on-1 certified personal coaching.
=====================================================`;

    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Gymnation_Fitness_Report_${bmi}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Customized Routines based on Goal
  const workoutPlans = {
    loss: [
      { day: 'Day 1', workout: 'Full Body Compound Strength (Squats, Bench, Rows) + 15m HIIT' },
      { day: 'Day 2', workout: '30m Incline Treadmill Walk / Steady Cardio + Abs Core' },
      { day: 'Day 3', workout: 'Upper Body Hypertrophy (Dumbbell Press, Lat Pulldowns, Arms)' },
      { day: 'Day 4', workout: 'Active Recovery: 45m Outdoor Walk or Mobility Stretching' },
      { day: 'Day 5', workout: 'Lower Body & Core (Deadlifts, Lunges, Leg Extension, Planks)' },
      { day: 'Day 6', workout: 'Bodyweight Circuit & 20m Zone 2 Cardio Deck' },
    ],
    maintenance: [
      { day: 'Day 1', workout: 'Push Day: Chest, Shoulders & Triceps (Barbell Press, Lateral Raises)' },
      { day: 'Day 2', workout: 'Pull Day: Back & Biceps (Lat Pulldowns, Cable Rows, Curls)' },
      { day: 'Day 3', workout: 'Legs & Abs (Squats, Leg Press, Hamstring Curls, Hanging Raises)' },
      { day: 'Day 4', workout: 'Active Rest / Light Cardio' },
      { day: 'Day 5', workout: 'Upper Body Sculpt & Mobility' },
      { day: 'Day 6', workout: 'Lower Body & Core Conditioning' },
    ],
    gain: [
      { day: 'Day 1', workout: 'Heavy Push: Incline Bench, Overhead Press, Dips (Heavy 6-8 Reps)' },
      { day: 'Day 2', workout: 'Heavy Pull: Barbell Deadlift, Pull-Ups, Heavy T-Bar Rows' },
      { day: 'Day 3', workout: 'Quad & Calves Focus: Heavy Back Squats, Hack Squats, Calves' },
      { day: 'Day 4', workout: 'Rest & Nutrient Recovery' },
      { day: 'Day 5', workout: 'Shoulders & Arms Hypertrophy (DB Press, Supersets)' },
      { day: 'Day 6', workout: 'Hamstring & Glute Focus: Romanian Deadlifts, Leg Curls' },
    ]
  };

  // Customized Meal Ideas based on Goal
  const dietPlans = {
    loss: [
      { meal: 'Breakfast', detail: '3 Egg Whites + 1 Whole Egg Omelette with Spinach & Oats porridge' },
      { meal: 'Lunch', detail: '150g Grilled Chicken/Paneer + 1 Cup Brown Rice + Mixed Salad' },
      { meal: 'Pre-Workout', detail: '1 Apple / Black Coffee + 5 Almonds' },
      { meal: 'Dinner', detail: '150g Fish/Tofu Breast + Stir-Fried Vegetables (Broccoli, Peppers)' }
    ],
    maintenance: [
      { meal: 'Breakfast', detail: 'Oatmeal with Whey Protein, Banana, Chia Seeds & Peanut Butter' },
      { meal: 'Lunch', detail: '2 Chapattis + 150g Chicken Curry/Dal + Bowl of Curd (Dahi) & Veggies' },
      { meal: 'Pre-Workout', detail: 'Whole Wheat Toast with 1 tbsp Peanut Butter & Sliced Banana' },
      { meal: 'Dinner', detail: '150g Grilled Cottage Cheese/Chicken + Sweet Potato & Tossed Greens' }
    ],
    gain: [
      { meal: 'Breakfast', detail: '4 Whole Eggs Scrambled + 2 Slices Whole Wheat Toast + Glass of Milk' },
      { meal: 'Lunch', detail: '200g Chicken Breast/Paneer + Large Portion Jasmine Rice + Dal & Salad' },
      { meal: 'Pre-Workout', detail: 'Whey Protein Shake + 1 Banana + 1 tbsp Peanut Butter + Oats Smoothie' },
      { meal: 'Dinner', detail: '200g Lean Beef/Paneer + Baked Sweet Potatoes + Steamed Asparagus/Greens' }
    ]
  };

  const currentWorkout = workoutPlans[goalId] || workoutPlans.maintenance;
  const currentDiet = dietPlans[goalId] || dietPlans.maintenance;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
      
      {/* Modal Container */}
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col print:max-h-none print:h-auto print:border-none print:shadow-none print:bg-white" id="printable-bmi-report-wrapper">
        
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800 shrink-0 print:bg-white print:border-b-2 print:border-slate-300">
          <div className="flex items-center gap-3">
            <img src={logoImg} alt="Gymnation Logo" className="h-9 w-auto" />
            <div>
              <h3 className="text-base font-black text-white print:text-slate-900 leading-none">GYMNATION PERFORMANCE REPORT</h3>
              <span className="text-[10px] text-slate-400 print:text-slate-600 font-bold uppercase tracking-wider">Personalized Nutrition &amp; Workout Blueprint</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 print:hidden">
            <button
              type="button"
              onClick={handleDownloadSummary}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-all cursor-pointer"
              title="Download Text File Summary"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Text File</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-slate-950 font-black text-xs transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Scrollable Content Area */}
        <div className="p-6 space-y-5 overflow-y-auto print:p-2 print:overflow-visible print:bg-white print:text-slate-900" id="printable-bmi-report">
          
          {/* User Metrics Summary Card */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/80 p-4 rounded-2xl border border-slate-800 print:bg-slate-50 print:border-slate-300">
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-slate-400 print:text-slate-600 uppercase">Gender &amp; Age</span>
              <div className="text-sm font-black text-white print:text-slate-900">{gender.toUpperCase()} • {age} Yrs</div>
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-slate-400 print:text-slate-600 uppercase">Height &amp; Weight</span>
              <div className="text-sm font-black text-white print:text-slate-900">{heightCm} cm • {weightKg} kg</div>
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-slate-400 print:text-slate-600 uppercase">Activity &amp; Goal</span>
              <div className="text-sm font-black text-orange-400 print:text-orange-600 truncate">{activityLabel} • {goalLabel}</div>
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-slate-400 print:text-slate-600 uppercase">BMI Score</span>
              <div className="text-sm font-black text-white print:text-slate-900 flex items-center gap-1.5">
                <span>{bmi}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded font-extrabold ${color} bg-slate-900 border border-slate-800 print:bg-slate-200 print:text-slate-900`}>
                  {category}
                </span>
              </div>
            </div>
          </div>

          {/* Calorie & Macro Target Row */}
          <div className="bg-gradient-to-r from-orange-950/40 via-slate-900 to-amber-950/30 p-4 rounded-2xl border border-orange-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 print:border-slate-300 print:bg-slate-50">
            <div className="space-y-1 text-center sm:text-left">
              <span className="text-[10px] font-extrabold text-orange-400 print:text-orange-600 uppercase tracking-wider flex items-center gap-1 justify-center sm:justify-start">
                <Flame className="w-3.5 h-3.5 text-orange-500" /> Recommended Daily Energy Target
              </span>
              <div className="text-2xl font-black text-white print:text-slate-900">
                {calorieTarget} <span className="text-sm text-slate-400 print:text-slate-600">kcal / day</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 w-full sm:w-auto text-center">
              <div className="bg-slate-950/80 px-3 py-2 rounded-xl border border-slate-800 print:bg-white print:border-slate-300">
                <span className="block text-[9px] text-slate-400 print:text-slate-600 font-bold uppercase">Protein</span>
                <span className="text-sm font-black text-orange-400 print:text-orange-600">{proteinGrams}g</span>
              </div>
              <div className="bg-slate-950/80 px-3 py-2 rounded-xl border border-slate-800 print:bg-white print:border-slate-300">
                <span className="block text-[9px] text-slate-400 print:text-slate-600 font-bold uppercase">Carbs</span>
                <span className="text-sm font-black text-yellow-400 print:text-amber-600">{carbsGrams}g</span>
              </div>
              <div className="bg-slate-950/80 px-3 py-2 rounded-xl border border-slate-800 print:bg-white print:border-slate-300">
                <span className="block text-[9px] text-slate-400 print:text-slate-600 font-bold uppercase">Fats</span>
                <span className="text-sm font-black text-amber-500 print:text-orange-700">{fatsGrams}g</span>
              </div>
            </div>
          </div>

          {/* Grid: Suggested Routine & Diet Blueprint */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* Suggested Weekly Routine */}
            <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-3 print:border-slate-300 print:bg-slate-50">
              <h4 className="text-xs font-black text-white print:text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 print:border-slate-300 pb-2">
                <Dumbbell className="w-4 h-4 text-orange-500" /> Suggested Weekly Workout Split
              </h4>
              <div className="space-y-2">
                {currentWorkout.map((item) => (
                  <div key={item.day} className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 print:bg-white print:border-slate-200">
                    <div className="text-[11px] font-extrabold text-orange-400 print:text-orange-600">{item.day}</div>
                    <div className="text-[11px] text-slate-300 print:text-slate-800 leading-snug">{item.workout}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Suggested Meal Blueprint */}
            <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-3 print:border-slate-300 print:bg-slate-50">
              <h4 className="text-xs font-black text-white print:text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 print:border-slate-300 pb-2">
                <Utensils className="w-4 h-4 text-orange-500" /> Suggested Daily Nutrition Plan
              </h4>
              <div className="space-y-2">
                {currentDiet.map((item) => (
                  <div key={item.meal} className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 print:bg-white print:border-slate-200">
                    <div className="text-[11px] font-extrabold text-amber-400 print:text-amber-600">{item.meal}</div>
                    <div className="text-[11px] text-slate-300 print:text-slate-800 leading-snug">{item.detail}</div>
                  </div>
                ))}
              </div>

              {/* Certified Coach Guidelines */}
              <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/20 text-[10px] text-orange-300 space-y-1 print:bg-slate-100 print:text-slate-900 print:border-slate-300">
                <div className="font-extrabold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-orange-400" /> Gymnation Trainer Guidance
                </div>
                <p className="leading-tight text-slate-400 print:text-slate-700">
                  Drink 3.5L to 4L of water daily. Ensure 7-8 hours of sound sleep for muscle hypertrophy and optimal fat oxidation.
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Footer Action Bar */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between shrink-0 print:hidden">
          <span className="text-[11px] text-slate-400 font-semibold hidden sm:inline-block">
            Want 1-on-1 personalized trainer coaching at Gymnation?
          </span>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-bold transition-colors cursor-pointer"
            >
              Close
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                scrollToSection('book-appointment');
              }}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-black text-xs shadow-lg shadow-orange-600/30 flex items-center gap-1.5 cursor-pointer"
            >
              <span>Book Personal Consultation</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

      {/* High-Resolution Clean Print Styling */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 10mm;
          }
          body {
            background-color: #ffffff !important;
            color: #0f172a !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          #printable-bmi-report-wrapper {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            border: none !important;
            background: #ffffff !important;
          }
        }
      `}</style>
    </div>
  );
}
