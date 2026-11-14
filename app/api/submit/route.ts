import { NextResponse } from "next/server";
import snapshot from "@/data/cafes-bengaluru.json";
import { BUCKET, supabaseAdmin } from "@/lib/supabase";

const CAFES = new Map(
  (snapshot as { id: string; name: string }[]).map(
    (c): [string, string] => [c.id, c.name]
  )
);

const MAX_BYTES = 3 * 1024 * 1024;
const MAX_PENDING = 300; // stops the queue from being flooded

const MIME = { jpg: "image/jpeg", png: "image/png", webp: "image/webp" } as const;

// check the file's real type from its first bytes, not what the browser claims
function sniff(b: Uint8Array): keyof typeof MIME | null {
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "jpg";
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return "png";
  if (
    b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 &&
    b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50
  )
    return "webp";
  return null;
}

const fail = (error: string, status = 400) =>
  NextResponse.json({ ok: false, error }, { status });

export async function POST(req: Request) {
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return fail("Invalid request.");
  }

  // hidden field only bots fill in
  if (String(form.get("website") ?? "")) return NextResponse.json({ ok: true });

  const cafeId = String(form.get("cafeId") ?? "");
  const kind = String(form.get("kind") ?? "");
  const cafeName = CAFES.get(cafeId);
  if (!cafeName) return fail("Unknown cafe.");
  if (!["photo", "menu", "offer"].includes(kind)) return fail("Unknown type.");
  if (form.get("confirm") !== "yes") return fail("Please tick the confirmation box.");

  const clean = (key: string, max: number) =>
    String(form.get(key) ?? "").trim().slice(0, max);

  let db;
  try {
    db = supabaseAdmin();
  } catch (e) {
    console.error(e);
    return fail("The server isn't set up for submissions yet.", 500);
  }

  const { count } = await db
    .from("submissions")
    .select("id", { count: "exact", head: true })
    .eq("status", "pending");
  if ((count ?? 0) >= MAX_PENDING) {
    return fail("A lot of submissions are waiting for review. Please try again in a few days.", 429);
  }

  const row: Record<string, unknown> = {
    cafe_id: cafeId,
    cafe_name: cafeName,
    kind,
    credit: clean("credit", 60) || null,
    contact: clean("contact", 100) || null,
    is_owner: form.get("isOwner") === "yes",
  };

  if (kind === "offer") {
    const title = clean("offerTitle", 80);
    const details = clean("offerDetails", 200);
    const validTill = clean("offerValidTill", 10);
    if (title.length < 3) return fail("Please add an offer title.");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(validTill)) return fail("Please choose an end date.");
    if (validTill < new Date().toISOString().slice(0, 10)) {
      return fail("That end date has already passed.");
    }
    row.offer_title = title;
    row.offer_details = details || null;
    row.offer_valid_till = validTill;
  } else {
    const file = form.get("image");
    if (!(file instanceof File) || file.size === 0) return fail("Please choose an image.");
    if (file.size > MAX_BYTES) return fail("That image is too large (max 3 MB).");

    const bytes = new Uint8Array(await file.arrayBuffer());
    const ext = sniff(bytes);
    if (!ext) return fail("Please upload a JPG, PNG or WebP image.");

    const path = `${cafeId}/${crypto.randomUUID()}.${ext}`;
    const { error } = await db.storage
      .from(BUCKET)
      .upload(path, bytes, { contentType: MIME[ext], upsert: false });
    if (error) {
      console.error(error);
      return fail("Upload failed. Please try again.", 500);
    }
    row.image_path = path;
  }

  const { error } = await db.from("submissions").insert(row);
  if (error) {
    console.error(error);
    return fail("Couldn't save your submission. Please try again.", 500);
  }

  return NextResponse.json({ ok: true });
}