import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, MessageSquareQuote } from "lucide-react";

export default function ReviewModal({
  isOpen,
  onClose,
  children,
}) {
  const modalRef = useRef(null);

  /* ---------------------------------------------
   * Lock body scroll while modal is open
   * -------------------------------------------*/
  useEffect(() => {
    if (!isOpen) return;

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previous;
    };
  }, [isOpen]);

  /* ---------------------------------------------
   * Close on ESC
   * -------------------------------------------*/
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose?.();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  /* ---------------------------------------------
   * Close when clicking outside
   * -------------------------------------------*/
  const handleOverlayClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose?.();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          onMouseDown={handleOverlayClick}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="
            fixed
            inset-0
            z-[120]
            flex
            items-center
            justify-center
            overflow-y-auto
            bg-slate-950/80
            backdrop-blur-md
            p-4
          "
        >
          <motion.div
            ref={modalRef}
            initial={{
              opacity: 0,
              scale: 0.96,
              y: 24,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              scale: 0.97,
              y: 20,
            }}
            transition={{
              duration: 0.35,
              ease: "easeOut",
            }}
            onMouseDown={(e) => e.stopPropagation()}
            className="
              relative
              w-full
              max-w-2xl
              overflow-hidden
              rounded-3xl
              border
              border-slate-800
              bg-slate-900
              shadow-2xl
              my-8
            "
          >
            {/* Background Glow */}
            <div
              aria-hidden="true"
              className="
                absolute
                -right-24
                -top-24
                h-64
                w-64
                rounded-full
                bg-orange-500/10
                blur-[120px]
              "
            />

            <div
              aria-hidden="true"
              className="
                absolute
                -bottom-24
                -left-24
                h-64
                w-64
                rounded-full
                bg-orange-500/5
                blur-[120px]
              "
            />

            {/* Header */}
            <header
              className="
                relative
                flex
                items-center
                justify-between
                border-b
                border-slate-800
                bg-slate-950/50
                px-6
                py-5
              "
            >
              <div className="flex items-center gap-3">
                <div
                  className="
                    flex
                    h-11
                    w-11
                    items-center
                    justify-center
                    rounded-xl
                    border
                    border-orange-500/20
                    bg-orange-500/10
                    text-orange-400
                  "
                >
                  <MessageSquareQuote size={20} />
                </div>

                <div>
                  <h2 className="text-lg font-black text-white">
                    Share Your Story
                  </h2>

                  <p className="text-xs text-slate-400">
                    Inspire future Gymnation members with your transformation.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="
                  rounded-xl
                  p-2
                  text-slate-400
                  transition-colors
                  hover:bg-slate-800
                  hover:text-white
                "
              >
                <X size={20} />
              </button>
            </header>

            {/* Body */}
            <div className="relative px-6 py-6">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}