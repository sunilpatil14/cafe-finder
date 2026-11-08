"use client";

import { motion } from "motion/react";
import { SearchBox } from "@/components/search-box";

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6">
      {/* soft background glow (we can swap this for a Rare UI component later) */}
      <div className="pointer-events-none absolute -top-40 left-1/2 size-[600px] -translate-x-1/2 rounded-full bg-accent/20 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative flex flex-col items-center text-center"
      >
        <p className="mb-4 text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground">
          Cafe finder
        </p>
        <h1 className="font-display max-w-3xl text-5xl leading-tight sm:text-7xl">
          Find the cafe that feels{" "}
          <span className="italic text-accent">just right</span>
        </h1>
        <p className="mt-6 max-w-lg text-lg text-muted-foreground">
          Browse interiors, menus and coffee types in your city, before you
          step through the door.
        </p>

        <div className="mt-10 flex w-full justify-center">
          <SearchBox />
        </div>
      </motion.div>
    </main>
  );
}