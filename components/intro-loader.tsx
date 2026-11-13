"use client";

import { useEffect } from "react";
import {
  animate,
  motion,
  useMotionValue,
  useTransform,
  type MotionValue,
} from "motion/react";

const OPEN_AT = 2.9; // seconds before the doors start to open
const SKY = "#bfddf0";
const CREAM = "#f6f0e6";
const BRAND = "Brew Atlas";

const draw = (delay: number, duration = 1) => ({
  initial: { pathLength: 0, opacity: 0 },
  animate: { pathLength: 1, opacity: 1 },
  transition: { duration, delay, ease: "easeInOut" as const },
});

const streets = [
  "M-20 120L1020 170",
  "M-20 330C250 300 600 380 1020 320",
  "M-20 500L1020 450",
  "M180 -20L220 620",
  "M470 -20C430 200 520 400 480 620",
  "M760 -20L800 620",
];
const ring =
  "M120 300C120 120 360 60 500 60S880 140 880 300S640 540 500 540S120 480 120 300Z";

// where the little "cafe" dots appear (percent of the screen)
const DOTS = [
  { x: 14, y: 32 },
  { x: 24, y: 62 },
  { x: 10, y: 72 },
  { x: 30, y: 22 },
  { x: 70, y: 24 },
  { x: 78, y: 64 },
  { x: 88, y: 36 },
  { x: 66, y: 80 },
];

function StreetMap() {
  return (
    <svg
      viewBox="0 0 1000 600"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 h-full w-full"
      fill="none"
    >
      {streets.map((d, i) => (
        <motion.path
          key={i}
          d={d}
          stroke={SKY}
          strokeWidth={1.2}
          strokeOpacity={0.22}
          vectorEffect="non-scaling-stroke"
          {...draw(0.1 + i * 0.12, 1.3)}
        />
      ))}
      <motion.path
        d={ring}
        stroke={SKY}
        strokeWidth={1.6}
        strokeOpacity={0.4}
        vectorEffect="non-scaling-stroke"
        {...draw(0.5, 1.6)}
      />
    </svg>
  );
}

function Dots() {
  return (
    <>
      {DOTS.map((d, i) => (
        <motion.div
          key={i}
          className="absolute size-3"
          style={{
            left: `${d.x}%`,
            top: `${d.y}%`,
            marginLeft: -6,
            marginTop: -6,
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 14,
            delay: 1.9 + i * 0.12,
          }}
        >
          <span
            className="absolute inset-0 rounded-full"
            style={{ background: SKY }}
          />
          <motion.span
            className="absolute inset-0 rounded-full border"
            style={{ borderColor: SKY }}
            animate={{ scale: [1, 3.2], opacity: [0.8, 0] }}
            transition={{
              duration: 1.8,
              repeat: Infinity,
              ease: "easeOut",
              delay: 2.2 + i * 0.12,
            }}
          />
        </motion.div>
      ))}
    </>
  );
}

function Pin() {
  return (
    <div className="relative">
      {/* ground shadow, stays put while the pin falls */}
      <div className="pointer-events-none absolute inset-x-0 bottom-[6%] flex justify-center">
        <motion.span
          className="block h-3 w-14 rounded-full bg-black/50 blur-md"
          initial={{ scaleX: 0.2, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.4 }}
        />
      </div>

      {/* ripples where the tip lands */}
      <div className="pointer-events-none absolute inset-x-0 bottom-[8%] flex h-0 items-center justify-center">
        {[0, 0.3].map((d) => (
          <div key={d} className="absolute" style={{ transform: "scaleY(0.35)" }}>
            <motion.span
              className="block size-24 rounded-full border"
              style={{ borderColor: SKY }}
              initial={{ scale: 0.2, opacity: 0 }}
              animate={{ scale: 3.2, opacity: [0, 0.8, 0] }}
              transition={{ delay: 1.2 + d, duration: 1.3, ease: "easeOut" }}
            />
          </div>
        ))}
      </div>

      {/* the falling pin */}
      <motion.div
        initial={{ y: -420, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 12, delay: 0.7 }}
      >
        {/* squash and stretch on impact */}
        <motion.div
          style={{ originY: 1 }}
          animate={{ scaleY: [1, 0.82, 1.06, 1], scaleX: [1, 1.1, 0.97, 1] }}
          transition={{
            delay: 1.0,
            duration: 0.55,
            times: [0, 0.3, 0.65, 1],
            ease: "easeOut",
          }}
        >
          <svg
            viewBox="0 0 24 24"
            className="relative size-28 drop-shadow-[0_12px_24px_rgba(0,0,0,0.45)] sm:size-36"
            fill="none"
          >
            <path
              d="M12 22s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12z"
              fill={SKY}
            />
            <g
              transform="translate(-0.4 0)"
              stroke="#2b1b14"
              strokeWidth="0.9"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path
                d="M8.6 9h5.6v2.4a2.8 2.8 0 0 1-2.8 2.8 2.8 2.8 0 0 1-2.8-2.8z"
                fill="#2b1b14"
              />
              <path d="M14.2 9.8h.6a1.4 1.4 0 0 1 0 2.8h-.6" />
              {[10.2, 12.6].map((x, i) => (
                <motion.path
                  key={x}
                  d={`M${x} 7.8c-.6-.7.6-1.2 0-2`}
                  animate={{ opacity: [0, 1, 0], y: [0, -1.4] }}
                  transition={{
                    duration: 1.8,
                    repeat: Infinity,
                    delay: 1.4 + i * 0.5,
                    ease: "easeOut",
                  }}
                />
              ))}
            </g>
          </svg>
        </motion.div>
      </motion.div>
    </div>
  );
}

function Counter({ progress }: { progress: MotionValue<number> }) {
  const text = useTransform(progress, (v) =>
    String(Math.round(v)).padStart(3, "0")
  );
  return (
    <motion.span
      className="font-display absolute bottom-6 left-6 text-7xl leading-none text-[#f6f0e6]/15 sm:bottom-8 sm:left-10 sm:text-9xl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2, duration: 0.6 }}
    >
      {text}
    </motion.span>
  );
}

function Scene({ progress }: { progress: MotionValue<number> }) {
  return (
    <div className="relative h-full w-screen">
      {/* map slowly pushes in */}
      <motion.div
        className="absolute inset-0"
        initial={{ scale: 1 }}
        animate={{ scale: 1.3 }}
        transition={{ duration: OPEN_AT + 1.1, ease: "easeOut" }}
      >
        <StreetMap />
        <Dots />
      </motion.div>

      {/* soft vignette */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(43,27,20,0)_25%,#2b1b14_85%)]" />

      <Counter progress={progress} />
      <motion.p
        className="absolute bottom-8 right-6 text-[10px] uppercase tracking-[0.3em] sm:right-10 sm:text-xs"
        style={{ color: SKY, opacity: 0.6 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ delay: 1, duration: 0.8 }}
      >
        12.97° N · 77.59° E
      </motion.p>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <Pin />

        <h1 className="font-display mt-8 flex text-5xl text-[#f6f0e6] sm:text-7xl">
          {BRAND.split("").map((ch, i) => (
            <span key={i} className="inline-block overflow-hidden pb-2">
              <motion.span
                className="inline-block"
                initial={{ y: "110%" }}
                animate={{ y: 0 }}
                transition={{
                  duration: 0.8,
                  delay: 1.5 + i * 0.05,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                {ch === " " ? "\u00A0" : ch}
              </motion.span>
            </span>
          ))}
        </h1>

        <motion.p
          className="mt-3 text-xs uppercase tracking-[0.35em]"
          style={{ color: SKY }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.1, duration: 0.8 }}
        >
          Find your next favourite cafe
        </motion.p>
      </div>
    </div>
  );
}

export function IntroLoader({
  onReveal,
  onDone,
}: {
  onReveal: () => void;
  onDone: () => void;
}) {
  const progress = useMotionValue(0);

  useEffect(() => {
    const counter = animate(progress, 100, {
      duration: OPEN_AT,
      ease: "easeInOut",
    });
    const t1 = setTimeout(onReveal, (OPEN_AT + 0.15) * 1000);
    const t2 = setTimeout(onDone, (OPEN_AT + 1.25) * 1000);
    return () => {
      counter.stop();
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [progress, onReveal, onDone]);

  return (
    <>
      {/* left door */}
      <motion.div
        aria-hidden="true"
        className="fixed inset-y-0 left-0 z-[100] w-[calc(50%+1px)] overflow-hidden bg-[#2b1b14]"
        initial={{ x: 0 }}
        animate={{ x: "-100%" }}
        transition={{ delay: OPEN_AT, duration: 1.1, ease: [0.76, 0, 0.24, 1] }}
      >
        <Scene progress={progress} />
      </motion.div>

      {/* right door: same scene, shifted so the halves line up */}
      <motion.div
        aria-hidden="true"
        className="fixed inset-y-0 right-0 z-[100] w-1/2 overflow-hidden bg-[#2b1b14]"
        initial={{ x: 0 }}
        animate={{ x: "100%" }}
        transition={{ delay: OPEN_AT, duration: 1.1, ease: [0.76, 0, 0.24, 1] }}
      >
        <div className="h-full w-screen -translate-x-1/2">
          <Scene progress={progress} />
        </div>
      </motion.div>

      {/* glowing seam that draws down the middle before the doors part */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none fixed inset-y-0 left-1/2 z-[101] w-px -translate-x-1/2"
        style={{
          background: SKY,
          boxShadow: "0 0 18px 4px rgba(191,221,240,0.8)",
        }}
        initial={{ scaleY: 0, opacity: 0 }}
        animate={{ scaleY: [0, 1, 1, 1], opacity: [0, 1, 1, 0] }}
        transition={{
          delay: OPEN_AT - 0.8,
          duration: 1.4,
          times: [0, 0.35, 0.7, 1],
          ease: "easeOut",
        }}
      />

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