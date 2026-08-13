import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  HiOutlineUsers,
  HiOutlineTrophy,
} from "react-icons/hi2";
import { IoBarbellOutline } from "react-icons/io5";
import { FaStar } from "react-icons/fa";

import useCountUp from "../hooks/useCountUp";
import { stats } from "./testimonialsData";

const iconMap = {
  users: HiOutlineUsers,
  trophy: HiOutlineTrophy,
  fire: IoBarbellOutline,
  star: FaStar,
};

function Metric({ item, index }) {
  const ref = useRef(null);

  const isInView = useInView(ref, {
    once: true,
    amount: 0.6,
  });

  const animatedValue = useCountUp(item.value, isInView);

  const Icon = iconMap[item.icon];

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{
        duration: 0.45,
        delay: index * 0.06,
      }}
      whileHover={{
        y: -2,
      }}
      className="
      relative
      flex
      flex-1
      items-center
      justify-center
      gap-3
      px-4
      py-3.5
      "
    >
      {/* Icon */}
      <div
        className="
        flex
        h-9
        w-9
        shrink-0
        items-center
        justify-center
        rounded-xl
        bg-orange-500/10
        text-orange-500
        text-base
        "
      >
        <Icon aria-hidden="true" />
      </div>

      <div className="flex flex-col items-start leading-none">
        {/* Number */}
        <h3
          className="
          text-lg
          sm:text-xl
          font-black
          tracking-tight
          text-white
          tabular-nums
          "
        >
          {animatedValue}
        </h3>

        {/* Label */}
        <p
          className="
          mt-1
          text-[10px]
          sm:text-xs
          uppercase
          tracking-[0.14em]
          text-zinc-400
          whitespace-nowrap
          "
        >
          {item.label}
        </p>
      </div>

      {/* Divider */}
      {index !== stats.length - 1 && (
        <div
          className="
          hidden
          sm:block
          absolute
          right-0
          top-1/2
          h-8
          w-px
          -translate-y-1/2
          bg-gradient-to-b
          from-transparent
          via-orange-500/25
          to-transparent
          "
        />
      )}
    </motion.div>
  );
}

export default function StatsBar() {
  return (
    <section
      aria-label="Gymnation Community Statistics"
      className="w-full"
    >
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="
        relative
        overflow-hidden
        rounded-2xl
        border
        border-orange-500/10
        bg-gradient-to-r
        from-zinc-900/40
        via-zinc-900/20
        to-zinc-900/40
        backdrop-blur-xl
        "
      >
        {/* Ambient Glow */}
        <div
          aria-hidden="true"
          className="
          absolute
          inset-0
          bg-gradient-to-r
          from-orange-500/5
          via-transparent
          to-orange-500/5
          "
        />

        {/* Metrics */}
        <div
          className="
          relative
          z-10
          grid
          grid-cols-2
          divide-y
          divide-orange-500/10

          sm:flex
          sm:flex-nowrap
          sm:divide-y-0
          "
        >
          {stats.map((item, index) => (
            <Metric
              key={item.id}
              item={item}
              index={index}
            />
          ))}
        </div>
      </motion.div>
    </section>
  );
}
