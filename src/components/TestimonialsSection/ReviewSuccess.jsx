import { motion } from "framer-motion";
import { CheckCircle2, ArrowRight } from "lucide-react";

export default function ReviewSuccess({ onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.35 }}
      className="space-y-8 px-2 py-4 text-center"
    >
      {/* Success Icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{
          type: "spring",
          stiffness: 250,
          damping: 12,
        }}
        className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10 shadow-lg shadow-emerald-500/20"
      >
        <CheckCircle2 className="h-11 w-11 text-emerald-400" />
      </motion.div>

      {/* Badge */}
      <div>
        <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-1 text-xs font-bold uppercase tracking-widest text-emerald-400">
          Review Submitted
        </span>
      </div>

      {/* Title */}
      <div className="space-y-3">
        <h2 className="text-3xl font-black text-white">
          Thank You!
        </h2>

        <p className="mx-auto max-w-md text-sm leading-7 text-slate-400">
          Your transformation story has been successfully submitted.
          Our Gymnation team will review your testimonial before it is
          published on the website.
        </p>
      </div>

      {/* Information Card */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5 text-left">
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-slate-500">
              Status
            </span>

            <span className="font-bold text-amber-400">
              Pending Approval
            </span>
          </div>

          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-slate-500">
              Reviewed By
            </span>

            <span className="font-semibold text-white">
              Gymnation Admin
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500">
              Visibility
            </span>

            <span className="font-semibold text-white">
              Hidden Until Approved
            </span>
          </div>
        </div>
      </div>

      {/* CTA */}
      <button
        type="button"
        onClick={onClose}
        className="
          flex
          w-full
          items-center
          justify-center
          gap-2
          rounded-xl
          bg-gradient-to-r
          from-orange-600
          to-amber-600
          px-6
          py-3.5
          text-sm
          font-extrabold
          text-white
          shadow-xl
          shadow-orange-600/30
          transition-all
          hover:from-orange-500
          hover:to-amber-500
        "
      >
        Back to Testimonials

        <ArrowRight className="h-4 w-4" />
      </button>
    </motion.div>
  );
}