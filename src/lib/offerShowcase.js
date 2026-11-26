export const OFFER_BUCKET = "mr-black-guppy-images";
export const LEGACY_PRODUCT_BUCKET = "aquaa-bark-images";

export function imageUrl(path, fallbackBucket = LEGACY_PRODUCT_BUCKET) {
  if (!path) return "";
  const value = String(path).trim();
  if (/^(https?:\/\/|data:image\/)/i.test(value)) return value;
  let storagePath = value.replace(/^\/+/, "");
  let bucket = fallbackBucket;
  for (const known of [OFFER_BUCKET, LEGACY_PRODUCT_BUCKET]) {
    if (storagePath.startsWith(known + "/")) {
      bucket = known;
      storagePath = storagePath.slice(known.length + 1);
      break;
    }
  }
  // Mirrors the current public catalogue's legacy path handling.
  if (storagePath.startsWith("products/")) storagePath = storagePath.slice(9);
  const base = import.meta.env.VITE_SUPABASE_URL;
  if (!base) return "";
  return `${base.replace(/\/$/, "")}/storage/v1/object/public/${bucket}/${storagePath.split("/").map(encodeURIComponent).join("/")}`;
}

export const money = (value) => value === null || value === undefined || value === "" ? "" : Number.isFinite(Number(value)) ? `₹${Number(value).toLocaleString("en-IN")}` : String(value);
export const chosenKey = (type, id) => `${type}:${id}`;
export const isLive = (offer) => offer?.is_active && (!offer.starts_at || Date.parse(offer.starts_at) <= Date.now()) && (!offer.ends_at || Date.parse(offer.ends_at) > Date.now());
