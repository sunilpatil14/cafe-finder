"use client";

import { useEffect } from "react";
import {
  animate,
  motion,
  useMotionTemplate,
  useMotionValue,
} from "motion/react";

const REVEAL_AT = 3.2; // seconds before the iris starts opening

const draw = (delay: number, duration = 1) => ({
  initial: { pathLength: 0, opacity: 0 },
  animate: { pathLength: 1, opacity: 1 },
  transition: { duration, delay, ease: "easeInOut" as const },
});

export function IntroLoader({
  onReveal,
  onDone,
}: {
  onReveal: () => void;
  onDone: () => void;
}) {
  const r = useMotionValue(0);
  const mask = useMotionTemplate`radial-gradient(circle at 50% 50%, transparent ${r}px, #000 ${r}px)`;

  useEffect(() => {
    const max = Math.hypot(window.innerWidth, window.innerHeight) / 2 + 80;
    const t = setTimeout(onReveal, (REVEAL_AT + 0.1) * 1000);
    const controls = animate(r, max, {
      delay: REVEAL_AT,
      duration: 1.4,
      ease: [0.76, 0, 0.24, 1],
      onComplete: onDone,
    });
    return () => {
      clearTimeout(t);
      controls.stop();
    };
  }, [r, onReveal, onDone]);

  return (
    <>
      {/* dark curtain with an iris hole that grows */}
      <motion.div
        className="fixed inset-0 z-[100] bg-[#2b1b14]"
        style={{ maskImage: mask, WebkitMaskImage: mask }}
      />

      {/* the cup layer, above the curtain */}
      <motion.div
        className="pointer-events-none fixed inset-0 z-[101] flex items-center justify-center"
        initial={{ scale: 1, opacity: 1 }}
        animate={{ scale: 2.2, opacity: 0 }}
        transition={{ delay: REVEAL_AT, duration: 1.2, ease: [0.76, 0, 0.24, 1] }}
      >
        <svg
          viewBox="0 0 200 200"
          className="size-72 sm:size-96"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* saucer */}
          <motion.circle
            cx="100" cy="100" r="84"
            stroke="#f6f0e6" strokeOpacity={0.35} strokeWidth="1.5"
            {...draw(0.1, 1.2)}
          />
          {/* cup outline, then ceramic fill */}
          <motion.circle
            cx="100" cy="100" r="62"
            stroke="#f6f0e6" strokeWidth="2"
            {...draw(0.3, 1.1)}
          />
          <motion.circle
            cx="100" cy="100" r="62" fill="#f6f0e6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.7 }}
          />
          {/* handle */}
          <motion.path
            d="M160 92H178a8 8 0 0 1 0 16H160"
            stroke="#f6f0e6" strokeWidth="5"
            {...draw(0.9, 0.6)}
          />
          {/* coffee pours in */}
          <motion.circle
            cx="100" cy="100" r="50" fill="#4a2c1b"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 1.3, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          />
          <motion.circle
            cx="100" cy="100" r="50"
            stroke="#b8763e" strokeWidth="2"
            {...draw(1.6, 0.7)}
          />
          {/* latte art */}
          <g stroke="#f6f0e6" strokeWidth="2.5">
            <motion.path
              d="M100 138C70 116 60 96 76 84C88 75 100 82 100 92C100 82 112 75 124 84C140 96 130 116 100 138Z"
              {...draw(2, 0.8)}
            />
            <motion.path
              d="M100 124C82 110 78 98 86 91C93 86 100 90 100 96C100 90 107 86 114 91C122 98 118 110 100 124Z"
              {...draw(2.3, 0.6)}
            />
            <motion.path d="M100 140V104" {...draw(2.6, 0.4)} />
          </g>
        </svg>

        {/* brand name under the cup */}
        <div className="absolute left-1/2 top-1/2 mt-44 -translate-x-1/2 sm:mt-60">
          <motion.p
            className="font-display whitespace-nowrap text-2xl uppercase text-[#f6f0e6] sm:text-3xl"
            initial={{ opacity: 0, letterSpacing: "0.7em" }}
            animate={{ opacity: 1, letterSpacing: "0.25em" }}
            transition={{ delay: 2.2, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          >
            Brew Atlas
          </motion.p>
        </div>
      </motion.div>

      <button
        onClick={() => {
          onReveal();
          onDone();
        }}
        className="fixed bottom-8 right-8 z-[102] text-xs uppercase tracking-widest text-[#f6f0e6]/50 hover:text-[#f6f0e6]"
      >
        Skip
      </button>
    </>
  );
}