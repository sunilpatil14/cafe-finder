"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Loader2, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export type StatusKind = "empty" | "notfound" | "busy";

const CUP = "M60 70H120V100A25 25 0 0 1 95 125H85A25 25 0 0 1 60 100Z";

/* ---------- illustrations ---------- */

function EmptyIllustration() {
  return (
    <svg viewBox="0 0 200 160" className="size-48" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <motion.g
        stroke="#7a6658"
        strokeWidth="2.5"
        strokeDasharray="4 7"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <path d={CUP} />
        <path d="M120 78h8a12 12 0 0 1 0 24h-9" />
        <path d="M45 135H135" />
      </motion.g>

      {/* magnifier searching around the empty cup */}
      <motion.g
        animate={{ x: [0, -34, 22, 0], y: [0, 14, -4, 0], rotate: [0, -8, 6, 0] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <circle cx="112" cy="58" r="15" stroke="#b8763e" strokeWidth="3" fill="#f6f0e6" fillOpacity="0.6" />
        <path d="M123 69L136 82" stroke="#b8763e" strokeWidth="4" />
      </motion.g>

      {/* floating question mark */}
      <motion.text
        x="150"
        y="46"
        fontSize="26"
        fill="#b8763e"
        fontFamily="serif"
        animate={{ y: [46, 38, 46], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
      >
        ?
      </motion.text>
    </svg>
  );
}

function BusyIllustration() {
  return (
    <svg viewBox="0 0 200 160" className="size-48" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <defs>
        <clipPath id="cup-inside">
          <path d={CUP} />
        </clipPath>
      </defs>

      {/* coffee slowly filling */}
      <g clipPath="url(#cup-inside)">
        <motion.rect
          x="50"
          y="72"
          width="90"
          height="70"
          fill="#4a2c1b"
          initial={{ y: 60 }}
          animate={{ y: [60, 0, 0, 60] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", times: [0, 0.6, 0.85, 1] }}
        />
      </g>

      <path d={CUP} stroke="#2b1b14" strokeWidth="3" />
      <path d="M120 78h8a12 12 0 0 1 0 24h-9" stroke="#2b1b14" strokeWidth="3" />
      <path d="M45 135H135" stroke="#2b1b14" strokeWidth="3" />

      {/* steam */}
      {[78, 90, 102].map((x, i) => (
        <motion.path
          key={x}
          d={`M${x} 58c-6-8 6-12 0-22`}
          stroke="#b8763e"
          strokeWidth="3"
          animate={{ opacity: [0, 1, 0], y: [8, -6] }}
          transition={{ duration: 2.2, repeat: Infinity, delay: i * 0.45, ease: "easeOut" }}
        />
      ))}
    </svg>
  );
}

/* ---------- busy state with auto retry ---------- */

const WAIT = 10;
const AUTO_RETRIES = 3;

function BusyActions() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [seconds, setSeconds] = useState(WAIT);
  const [attempt, setAttempt] = useState(0);
  const exhausted = attempt >= AUTO_RETRIES;

  const retry = useCallback(() => {
    startTransition(() => router.refresh());
  }, [router]);

  // tick every second while waiting
  useEffect(() => {
    if (exhausted || isPending) return;
    const id = setInterval(() => setSeconds((s) => s - 1), 1000);
    return () => clearInterval(id);
  }, [exhausted, isPending]);

  // when the countdown hits zero, retry once
  useEffect(() => {
    if (seconds > 0 || exhausted) return;
    retry();
    setAttempt((a) => a + 1);
    setSeconds(WAIT);
  }, [seconds, exhausted, retry]);

  return (
    <div className="mt-6 flex flex-col items-center gap-4">
      {!exhausted && (
        <div className="w-56">
          <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
            <motion.div
              className="h-full origin-left rounded-full bg-accent"
              animate={{ scaleX: isPending ? 1 : seconds / WAIT }}
              transition={{ duration: 1, ease: "linear" }}
            />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {isPending ? "Trying again…" : `Trying again in ${seconds}s`}
          </p>
        </div>
      )}

      {exhausted && (
        <p className="max-w-sm text-sm text-muted-foreground">
          Still busy. Give it a minute and try again.
        </p>
      )}

      <Button onClick={retry} disabled={isPending} className="rounded-full px-6">
        {isPending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <RotateCw className="size-4" />
        )}
        {isPending ? "Trying…" : "Try again now"}
      </Button>
    </div>
  );
}

/* ---------- main component ---------- */

export function StatusState({ kind, place }: { kind: StatusKind; place?: string }) {
  const copy = {
    empty: {
      title: `No cafes found around ${place ?? "here"}`,
      text: "We searched within about 4 km. Try a nearby area or a bigger city.",
    },
    notfound: {
      title: "We couldn't find that place",
      text: "Check the spelling, or add the city, like “Indiranagar, Bengaluru”.",
    },
    busy: {
      title: "Our map service is busy",
      text: "A lot of people are searching right now. We'll keep trying for you.",
    },
  }[kind];

  return (
    <motion.div
      role="status"
      aria-live="polite"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto mt-14 flex max-w-md flex-col items-center text-center"
    >
      {kind === "busy" ? <BusyIllustration /> : <EmptyIllustration />}

      <h2 className="font-display mt-2 text-3xl">{copy.title}</h2>
      <p className="mt-3 text-muted-foreground">{copy.text}</p>

      {kind === "busy" ? (
        <BusyActions />
      ) : (
        <Link
          href="/"
          className="mt-6 rounded-full bg-primary px-6 py-2.5 text-sm text-primary-foreground transition hover:opacity-90"
        >
          Search another place
        </Link>
      )}
    </motion.div>
  );
}