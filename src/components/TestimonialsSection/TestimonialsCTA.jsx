import { useState } from "react";
import { motion } from "framer-motion";
import { FaArrowRightLong } from "react-icons/fa6";
import { IoFitnessOutline } from "react-icons/io5";

import ReviewModal from "./ReviewModal";
import ReviewForm from "./ReviewForm";
import ReviewSuccess from "./ReviewSuccess";
import { saveReviewToFirebase } from "../../firebase";

export default function TestimonialsCTA() {
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  return (
    <>
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        aria-label="Join Gymnation call to action"
        className="
          relative
          overflow-hidden
          rounded-2xl
          border
          border-orange-500/25
          bg-zinc-900/60
          backdrop-blur-xl
          px-5
          py-4
          sm:px-6
        "
      >
        {/* Background Glow */}
        <div
          aria-hidden="true"
          className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-orange-500/15 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-16 -left-16 h-40 w-40 rounded-full bg-orange-500/5 blur-3xl"
        />

        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Left Side */}
          <div className="flex items-center gap-4">
            <div
              aria-hidden="true"
              className="
                flex
                h-11
                w-11
                shrink-0
                items-center
                justify-center
                rounded-full
                border
                border-orange-500/40
                bg-orange-500/10
                text-lg
                text-orange-500
              "
            >
              <IoFitnessOutline aria-hidden="true" />
            </div>

            <div>
              <h2 className="text-lg font-black leading-tight text-white sm:text-xl">
                Your Story Could Be <span className="text-orange-500">Next</span>
              </h2>

              <p className="mt-0.5 text-sm text-zinc-400">
                Join our community and start your transformation today.
              </p>
            </div>
          </div>

          {/* Right Side */}
          <motion.button
            type="button"
            onClick={() => {
              setSubmitted(false);
              setIsReviewOpen(true);
            }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="
              group
              inline-flex
              shrink-0
              items-center
              justify-center
              gap-2
              rounded-full
              bg-gradient-to-r
              from-orange-500
              via-orange-500
              to-orange-600
              px-6
              py-3
              text-sm
              font-bold
              text-white
              shadow-[0_10px_30px_rgba(249,115,22,.3)]
              transition-all
              duration-300
              hover:shadow-[0_10px_35px_rgba(249,115,22,.45)]
              focus-visible:outline
              focus-visible:outline-2
              focus-visible:outline-offset-2
              focus-visible:outline-orange-500
            "
          >
            Join Now

            <FaArrowRightLong
              aria-hidden="true"
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </motion.button>
        </div>
      </motion.section>

      <ReviewModal
        isOpen={isReviewOpen}
        onClose={() => {
          setSubmitted(false);
          setIsReviewOpen(false);
        }}
      >
        {submitted ? (
          <ReviewSuccess
            onClose={() => {
              setSubmitted(false);
              setIsReviewOpen(false);
            }}
          />
        ) : (
         <ReviewForm
  loading={loading}
  onSubmit={async (data) => {
    try {
      setLoading(true);

      console.log("Submitting review:", data);

await saveReviewToFirebase(data);

console.log("Review saved successfully");

      setSubmitted(true);
    } catch (error) {
      console.error(error);
      alert("Failed to submit review. Please try again.");
    } finally {
      setLoading(false);
    }
  }}
/>
        )}
      </ReviewModal>
    </>
  );
}