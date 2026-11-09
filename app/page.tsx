"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, useReducedMotion, type Variants } from "motion/react";
import { IntroLoader } from "@/components/intro-loader";
import { SearchBox } from "@/components/search-box";

// Lives outside the component: resets on a full page refresh,
// but survives navigation inside the site (e.g. coming back from search).
let introPlayed = false;

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.25 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 36, filter: "blur(12px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] },
  },
};

const plainWords = ["Find", "the", "cafe", "that", "feels"];
const accentWords = ["just", "right"];

export default function Home() {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = useState(() => !introPlayed);
  const [revealed, setRevealed] = useState(() => introPlayed);

  const handleReveal = useCallback(() => setRevealed(true), []);
  const handleDone = useCallback(() => setMounted(false), []);

  useEffect(() => {
    // remember that the intro has been shown, even if they leave mid-way
    introPlayed = true;

    // skip the intro for people who turned on "reduce motion" in their OS
    if (reduceMotion) {
      setMounted(false);
      setRevealed(true);
    }
  }, [reduceMotion]);

  return (
    <>
      {mounted && <IntroLoader onReveal={handleReveal} onDone={handleDone} />}

      <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6">
        {/* drifting glows */}
        <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2">
          <motion.div
            className="size-[600px] rounded-full bg-accent/20 blur-3xl"
            animate={{ x: [0, 70, -50, 0], y: [0, 30, -20, 0] }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
        <div className="pointer-events-none absolute -bottom-40 -right-20">
          <motion.div
            className="size-[420px] rounded-full bg-[#b8763e]/10 blur-3xl"
            animate={{ x: [0, -60, 30, 0], y: [0, -40, 20, 0] }}
            transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          animate={revealed ? "show" : "hidden"}
          className="relative flex flex-col items-center text-center"
        >
          <motion.p
            variants={item}
            className="mb-4 text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground"
          >
            Cafe finder
          </motion.p>

          <h1 className="font-display max-w-3xl text-5xl leading-tight sm:text-7xl">
            {plainWords.map((w) => (
              <motion.span key={w} variants={item} className="mr-[0.25em] inline-block">
                {w}
              </motion.span>
            ))}
            {accentWords.map((w, i) => (
              <motion.span
                key={w}
                variants={item}
                className={`inline-block italic text-accent ${i === 0 ? "mr-[0.25em]" : ""}`}
              >
                {w}
              </motion.span>
            ))}
          </h1>

          <motion.p variants={item} className="mt-6 max-w-lg text-lg text-muted-foreground">
            Browse interiors, menus and coffee types in your city, before you
            step through the door.
          </motion.p>

          <motion.div variants={item} className="mt-10 flex w-full justify-center">
            <SearchBox />
          </motion.div>
        </motion.div>
      </main>
    </>
  );
}