"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Camera,
  CheckCircle2,
  FileText,
  Loader2,
  Tag,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Kind = "photo" | "menu" | "offer";

const TABS: { kind: Kind; label: string; icon: LucideIcon; confirm: string }[] = [
  {
    kind: "photo",
    label: "Add a photo",
    icon: Camera,
    confirm: "I took this photo, or I have permission to share it.",
  },
  {
    kind: "menu",
    label: "Add the menu",
    icon: FileText,
    confirm: "I took this photo of the menu, or I have permission to share it.",
  },
  {
    kind: "offer",
    label: "Post an offer",
    icon: Tag,
    confirm: "To the best of my knowledge, this offer is real and current.",
  },
];

async function compress(file: File, maxDim: number): Promise<File> {
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, maxDim / Math.max(bmp.width, bmp.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bmp.width * scale);
  canvas.height = Math.round(bmp.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;
  ctx.drawImage(bmp, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise<Blob | null>((res) =>
    canvas.toBlob(res, "image/jpeg", 0.82)
  );
  return blob ? new File([blob], "upload.jpg", { type: "image/jpeg" }) : file;
}

const field =
  "w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";
const label = "mb-1.5 block text-xs font-medium uppercase tracking-widest text-muted-foreground";

export function Contribute({
  cafeId,
  cafeName,
}: {
  cafeId: string;
  cafeName: string;
}) {
  const [kind, setKind] = useState<Kind>("photo");
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState("");

  const tab = TABS.find((t) => t.kind === kind)!;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const data = new FormData(e.currentTarget);
    data.set("cafeId", cafeId);
    data.set("kind", kind);
    setStatus("sending");

    try {
      if (kind !== "offer") {
        const file = data.get("image");
        if (!(file instanceof File) || file.size === 0) {
          throw new Error("Please choose an image.");
        }
        let small: File;
        try {
          small = await compress(file, kind === "menu" ? 2000 : 1600);
        } catch {
          throw new Error("Couldn't read that image. Try a JPG or PNG.");
        }
        data.set("image", small);
      }

      const res = await fetch("/api/submit", { method: "POST", body: data });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) {
        throw new Error(json?.error ?? "Something went wrong. Please try again.");
      }
      setStatus("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setStatus("idle");
    }
  }

  return (
    <section className="mt-16 rounded-3xl border border-border bg-card p-6 sm:p-8">
      <h2 className="font-display text-3xl">Know {cafeName}?</h2>
      <p className="mt-2 text-muted-foreground">
        Help others find it: add a photo, the menu, or a current offer.
        Everything is reviewed before it appears.
      </p>

      <AnimatePresence mode="wait">
        {status === "done" ? (
          <motion.div
            key="done"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-8 flex flex-col items-center rounded-2xl bg-sky/40 p-8 text-center"
          >
            <CheckCircle2 className="size-10 text-accent" />
            <p className="font-display mt-3 text-2xl">Thank you!</p>
            <p className="mt-1 text-sm text-muted-foreground">
              We'll review it and it will appear on this page once approved.
            </p>
            <Button
              variant="outline"
              className="mt-5 rounded-full"
              onClick={() => setStatus("idle")}
            >
              Add another
            </Button>
          </motion.div>
        ) : (
          <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="mt-6 flex flex-wrap gap-2">
              {TABS.map((t) => (
                <button
                  key={t.kind}
                  type="button"
                  onClick={() => {
                    setKind(t.kind);
                    setError("");
                  }}
                  className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition ${
                    kind === t.kind
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border hover:bg-sky/40"
                  }`}
                >
                  <t.icon className="size-4" />
                  {t.label}
                </button>
              ))}
            </div>

            <form key={kind} onSubmit={onSubmit} className="mt-6 grid gap-5 sm:grid-cols-2">
              {kind === "offer" ? (
                <>
                  <div className="sm:col-span-2">
                    <label className={label}>Offer title</label>
                    <Input name="offerTitle" required maxLength={80} placeholder="e.g. Buy 1 get 1 on cold brew" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={label}>Details (optional)</label>
                    <textarea name="offerDetails" maxLength={200} className={`${field} min-h-20`} placeholder="Timings, conditions…" />
                  </div>
                  <div>
                    <label className={label}>Valid till</label>
                    <Input name="offerValidTill" type="date" required />
                  </div>
                </>
              ) : (
                <div className="sm:col-span-2">
                  <label className={label}>
                    {kind === "menu" ? "Photo of the menu" : "Photo of the cafe"}
                  </label>
                  <input
                    name="image"
                    type="file"
                    required
                    accept="image/jpeg,image/png,image/webp"
                    className="block w-full text-sm file:mr-4 file:rounded-full file:border-0 file:bg-sky/60 file:px-4 file:py-2 file:text-sm file:text-foreground"
                  />
                  <p className="mt-2 text-xs text-muted-foreground">
                    {kind === "menu"
                      ? "Make sure the text is sharp and readable."
                      : "Interior shots work best. No people's faces, please."}
                  </p>
                </div>
              )}

              <div>
                <label className={label}>Credit name (optional)</label>
                <Input name="credit" maxLength={60} placeholder="Shown next to your submission" />
              </div>
              <div>
                <label className={label}>Contact (optional, private)</label>
                <Input name="contact" maxLength={100} placeholder="Email or phone, only so I can verify" />
              </div>

              {/* honeypot: real visitors never see or fill this */}
              <input
                name="website"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                className="absolute -left-[9999px] h-0 w-0 opacity-0"
              />

              <div className="space-y-3 sm:col-span-2">
                <label className="flex items-start gap-3 text-sm">
                  <input type="checkbox" name="confirm" value="yes" required className="mt-1" />
                  {tab.confirm}
                </label>
                <label className="flex items-start gap-3 text-sm text-muted-foreground">
                  <input type="checkbox" name="isOwner" value="yes" className="mt-1" />
                  I own or work at this cafe.
                </label>
              </div>

              {error && (
                <p className="text-sm text-red-700 sm:col-span-2" role="alert">
                  {error}
                </p>
              )}

              <div className="sm:col-span-2">
                <Button type="submit" disabled={status === "sending"} className="rounded-full px-8">
                  {status === "sending" && <Loader2 className="size-4 animate-spin" />}
                  {status === "sending" ? "Sending…" : "Submit for review"}
                </Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}