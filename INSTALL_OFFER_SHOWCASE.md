# Mr Black Guppy — Premium Offer Showcase Update

Changes are scoped to the Notifications page, its admin manager, shared image optimization and wiring to the existing homepage/footer. The rest of the site and its database records are unchanged.

## 1. Backup your local project first

From `~/Desktop/mr.blackguppy-main`:

```bash
cp -R src "../mrblackguppy-src-backup-$(date +%Y%m%d-%H%M%S)"
```

## 2. Copy replacement files

Copy all paths in this archive into your project root, preserving folders. Do not copy or change `.env`.

Updated existing files: `src/App.jsx`, `src/pages/Home.jsx`, `src/pages/admin/Admin.jsx`, `src/components/Footer.jsx`.

Added files: `src/lib/imageCompression.js`, `src/lib/offerShowcase.js`, `src/pages/Notifications.jsx`, `src/pages/notifications.css`, `src/pages/admin/OffersManager.jsx`, `src/pages/admin/offersManager.css`.

## 3. Database migration — REQUIRED

Open the *existing Mr Black Guppy Supabase project's* SQL Editor. Run `offer-showcase-migration.sql` once. It creates only one new table: `public.offer_showcase`. It does not edit the existing catalogue tables. The row is written by Admin on first save.

The SQL assumes the existing `public.admins` table has an `email` field, as used by your current Admin login. It permits anonymous visitors to read only an active, in-date offer; admins can write.

### Storage permissions

Offer images are stored in the existing `mr-black-guppy-images` bucket, `offers/` folder. This bucket must be public for visitors to see the offer image. Confirm your current Storage INSERT rules permit authenticated admin users to upload to `offers/`. A narrowly-scoped optional policy is commented in the SQL file for cases where one is needed. Do not enable a broad public upload policy.

## 4. Build and check

```bash
npm run build
npm run dev
```

Check `/admin` → **Offers & Notifications**, upload a promotional image, select products from both catalogues, and click Save. Verify homepage offer after the hero and the standalone `/notifications` page. Check the page at phone width too.

## 5. Cloudflare deployment (only after verified)

```bash
npx wrangler pages deploy dist --project-name mrblackguppy --branch main
```

This assumes you first create the Pages project if you have not already. The Cloudflare project was **not** created by this archive.

## Notes

- Banner recommended 1600 × 900 (16:9). `object-fit: contain` avoids cropping on desktop/mobile, but different image proportions can produce letterboxing.
- New banner uploads are compressed in browser (max long edge 1400px, WebP when smaller, target ~100 KB). This is a target, not a strict limit.
- New product/category images in Admin are compressed to max 800px and target ~25 KB when achievable. Existing uploads are untouched.
- Existing catalogue image paths are resolved using the same legacy `aquaa-bark-images` bucket as the current public catalogue, and existing complete URLs continue to work. Offer banner uploads use `mr-black-guppy-images`.
- Dates use the administrator browser's local timezone (for your Mac in India, IST). Do not enter service/secret Supabase keys in frontend `.env`.
- Selected products reference catalogue item IDs; prices, images and stock are read live from existing product tables.
- Source ZIP did not include your `.env` or installed dependencies. Build/test in the local project before publishing.
