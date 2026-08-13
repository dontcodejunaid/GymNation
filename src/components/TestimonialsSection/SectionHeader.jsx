import { motion } from "framer-motion";
import { Sparkles as HiMiniSparkles, ShieldCheck as HiOutlineShieldCheck } from "lucide-react";

const trustFeatures = ["Certified Trainers", "Modern Equipment", "Personal Coaching"];

export default function SectionHeader() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="mx-auto max-w-3xl text-center"
    >
      {/* Premium Badge */}
      <div
        className="
        inline-flex
        items-center
        gap-2
        rounded-full
        border
        border-orange-500/20
        bg-orange-500/10
        px-4
        py-1.5
        text-xs
        font-semibold
        uppercase
        tracking-widest
        text-orange-400
        backdrop-blur-md
      "
      >
        <HiMiniSparkles className="h-4 w-4" />
        <span>Real Stories, Real Results</span>
      </div>

      {/* Main Title */}
      <h2
        className="
        mt-6
        text-4xl
        font-black
        tracking-tight
        text-white
        sm:text-5xl
        lg:text-6xl
      "
      >
        WHAT OUR <span className="text-orange-500">MEMBERS SAY</span>
      </h2>

      {/* Subtitle */}
      <p className="mt-4 text-base text-slate-400 sm:text-lg">
        Join over 1,200+ members who transformed their lives at Gymnation Gym. Here is what they have to say about their journey.
      </p>

      {/* Trust Badges Bar */}
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {trustFeatures.map((feature, idx) => (
          <div
            key={idx}
            className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/40 px-3 py-1 text-xs text-slate-300 backdrop-blur-sm"
          >
            <HiOutlineShieldCheck className="h-3.5 w-3.5 text-orange-400" />
            <span>{feature}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
