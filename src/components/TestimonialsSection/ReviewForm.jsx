import { useState } from "react";
import { User, Mail, MessageSquareText } from "lucide-react";
import { motion } from "framer-motion";
import StarRating from "./StarRating";

export default function ReviewForm({
  onSubmit,
  loading = false,
}) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    rating: 5,
    review: "",
  });

  const [errors, setErrors] = useState({});

  const MAX_CHARACTERS = 500;

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Please enter your name.";
    }

    if (formData.review.trim().length < 20) {
      newErrors.review =
        "Tell us a little more about your experience.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validate()) return;

    onSubmit?.(formData);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      {/* Intro */}
      <div className="space-y-2">
        <h3 className="text-xl font-black text-white">
          Share Your Transformation
        </h3>

        <p className="text-sm leading-6 text-slate-400">
          Your journey may inspire someone to begin theirs.
          Every approved review helps grow the Gymnation community.
        </p>
      </div>

      {/* Name */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-400">
          Full Name
        </label>

        <div className="relative">
          <User
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-400"
          />

          <input
            type="text"
            value={formData.name}
            onChange={(e) =>
              handleChange("name", e.target.value)
            }
            placeholder="John Doe"
            className="
              w-full
              rounded-xl
              border
              border-slate-800
              bg-slate-950
              py-3
              pl-12
              pr-4
              text-white
              outline-none
              transition-all
              placeholder:text-slate-500
              focus:border-orange-500
            "
          />
        </div>

        {errors.name && (
          <p className="mt-2 text-xs text-red-400">
            {errors.name}
          </p>
        )}
      </motion.div>

      {/* Email */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-400">
          Email (Optional)
        </label>

        <div className="relative">
          <Mail
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-400"
          />

          <input
            type="email"
            value={formData.email}
            onChange={(e) =>
              handleChange("email", e.target.value)
            }
            placeholder="john@example.com"
            className="
              w-full
              rounded-xl
              border
              border-slate-800
              bg-slate-950
              py-3
              pl-12
              pr-4
              text-white
              outline-none
              transition-all
              placeholder:text-slate-500
              focus:border-orange-500
            "
          />
        </div>
      </motion.div>

      {/* Rating */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <label className="mb-3 block text-xs font-bold uppercase tracking-wider text-slate-400">
          Overall Experience
        </label>

        <StarRating
          value={formData.rating}
          onChange={(rating) =>
            handleChange("rating", rating)
          }
        />
      </motion.div>

      {/* Review */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-400">
          Your Story
        </label>

        <div className="relative">
          <MessageSquareText
            size={18}
            className="absolute left-4 top-4 text-orange-400"
          />

          <textarea
            rows={6}
            value={formData.review}
            onChange={(e) =>
              handleChange("review", e.target.value)
            }
            maxLength={MAX_CHARACTERS}
            placeholder="Tell us about your Gymnation journey..."
            className="
              w-full
              resize-none
              rounded-xl
              border
              border-slate-800
              bg-slate-950
              py-4
              pl-12
              pr-4
              text-white
              outline-none
              transition-all
              placeholder:text-slate-500
              focus:border-orange-500
            "
          />
        </div>

        <div className="mt-2 flex items-center justify-between">
          {errors.review ? (
            <p className="text-xs text-red-400">
              {errors.review}
            </p>
          ) : (
            <span />
          )}

          <span className="text-xs text-slate-500">
            {formData.review.length}/{MAX_CHARACTERS}
          </span>
        </div>
      </motion.div>
      {/* Submit Button */}
<motion.button
  type="submit"
  disabled={loading}
  whileHover={{ scale: loading ? 1 : 1.02 }}
  whileTap={{ scale: loading ? 1 : 0.98 }}
  className="
    w-full
    rounded-xl
    bg-gradient-to-r
    from-orange-500
    to-orange-600
    py-3
    text-sm
    font-bold
    text-white
    transition-all
    duration-300
    hover:shadow-lg
    hover:shadow-orange-500/30
    disabled:cursor-not-allowed
    disabled:opacity-60
  "
>
  {loading ? "Submitting..." : "Submit Review"}
</motion.button>
    </form>
  );
}