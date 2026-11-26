import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";
import { compressImage } from "../../lib/imageCompression";
import { OFFER_BUCKET, imageUrl, money, chosenKey } from "../../lib/offerShowcase";
import "./offersManager.css";

const START = { id: 1, title: "", description: "", image_url: "", is_active: false, starts_at: "", ends_at: "", product_refs: [] };
const parseLocal = value => value ? new Date(value).toISOString() : null;
const toLocal = value => { if (!value) return ""; const d = new Date(value); if (Number.isNaN(d.getTime())) return ""; const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000); return local.toISOString().slice(0, 16); };

export default function OffersManager() {
  const [form, setForm] = useState(START);
  const [catalogue, setCatalogue] = useState([]);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  useEffect(() => {
    let active = true;
    (async () => {
      const [offer, fish, plants] = await Promise.all([
        supabase.from("offer_showcase").select("*").eq("id", 1).maybeSingle(),
        supabase.from("fish_products").select("id,name,price,image_url,stock").order("created_at", { ascending: false }),
        supabase.from("plant_accessory_products").select("id,name,price,image_url,stock").order("created_at", { ascending: false })
      ]);
      if (!active) return;
      const issue = offer.error || fish.error || plants.error;
      if (issue) setError(`${issue.message}. If offer_showcase is missing, run the supplied SQL migration.`);
      else {
        const current = offer.data || START;
        setForm({ ...START, ...current, starts_at: toLocal(current.starts_at), ends_at: toLocal(current.ends_at), product_refs: Array.isArray(current.product_refs) ? current.product_refs : [] });
        setCatalogue([...(fish.data || []).map(row => ({ ...row, type: "fish" })), ...(plants.data || []).map(row => ({ ...row, type: "plants" }))]);
        setPreview(imageUrl(current.image_url, OFFER_BUCKET));
      }
      setLoading(false);
    })();
    return () => { active = false; };
  }, []);
  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);
  const change = (key, value) => setForm(current => ({ ...current, [key]: value }));
  const selected = useMemo(() => new Set(form.product_refs.map(ref => chosenKey(ref.type, ref.id))), [form.product_refs]);
  const byKey = useMemo(() => new Map(catalogue.map(item => [chosenKey(item.type,item.id),item])), [catalogue]);
  const selectedRows = form.product_refs.map(ref => byKey.get(chosenKey(ref.type, ref.id))).filter(Boolean);
  const filtered = catalogue.filter(item => (type === "all" || item.type === type) && item.name.toLowerCase().includes(search.toLowerCase())).slice(0, 100);
  const toggle = item => {
    const key = chosenKey(item.type, item.id);
    setForm(current => ({ ...current, product_refs: selected.has(key) ? current.product_refs.filter(ref => chosenKey(ref.type,ref.id) !== key) : [...current.product_refs, { type: item.type, id: item.id }] }));
  };
  async function save(event) {
    event.preventDefault(); setError(""); setNotice(""); setBusy(true);
    let uploadedPath = null;
    try {
      if (!form.title.trim()) throw new Error("Enter an announcement title.");
      const starts_at = parseLocal(form.starts_at), ends_at = parseLocal(form.ends_at);
      if (starts_at && ends_at && Date.parse(ends_at) <= Date.parse(starts_at)) throw new Error("End must be after start.");
      if (!file && !form.image_url) throw new Error("Select an offer template image.");
      let image_url = form.image_url;
      if (file) {
        if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) throw new Error("Choose a JPG, PNG or WebP template.");
        if (file.size > 10 * 1024 * 1024) throw new Error("The original image must be 10 MB or less.");
        const optimized = await compressImage(file, { maxDimension: 1400, targetKB: 100, minDimension: 800, minQuality: 0.72, maxQuality: 0.9 });
        const ext = optimized.name.split(".").pop().toLowerCase();
        uploadedPath = `offers/${crypto.randomUUID()}.${ext}`;
        const upload = await supabase.storage.from(OFFER_BUCKET).upload(uploadedPath, optimized, { contentType: optimized.type, cacheControl: "31536000", upsert: false });
        if (upload.error) throw upload.error;
        image_url = supabase.storage.from(OFFER_BUCKET).getPublicUrl(uploadedPath).data.publicUrl;
      }
      const payload = { id: 1, title: form.title.trim(), description: form.description.trim(), image_url, is_active: Boolean(form.is_active), starts_at, ends_at, product_refs: form.product_refs };
      const result = await supabase.from("offer_showcase").upsert(payload, { onConflict: "id" });
      if (result.error) throw result.error;
      setForm(current => ({ ...current, image_url })); setFile(null); setPreview(image_url); setNotice("Offer announcement and selected products saved successfully.");
    } catch (err) {
      if (uploadedPath) await supabase.storage.from(OFFER_BUCKET).remove([uploadedPath]);
      setError(err.message || "Could not save announcement.");
    } finally { setBusy(false); }
  }
  if (loading) return <div className="mbg-admin-offer">Loading offer manager…</div>;
  return <div className="mbg-admin-offer">
    <header><span className="mbg-admin-offer__label">MR BLACK GUPPY · PROMOTIONS</span><h1>Offer Announcement</h1><p>One premium announcement frame, followed by selected products from your existing catalogue.</p></header>
    {error && <div className="mbg-admin-offer__alert" role="alert">{error}</div>}
    {notice && <div className="mbg-admin-offer__notice" role="status">{notice}</div>}
    <form onSubmit={save}>
      <section className="mbg-admin-offer__panel"><h2>01 · Announcement template</h2><p>Recommended artwork: 1600 × 900 px (16:9). The complete image will be visible; no cropping.</p>
        <div className="mbg-admin-offer__preview">{preview ? <img src={preview} alt="Offer template preview"/> : <span>Your promotional template preview</span>}</div>
        <label>Upload template (JPG, PNG or WebP)</label><input type="file" accept="image/jpeg,image/png,image/webp" onChange={event => setFile(event.target.files?.[0] || null)}/><small>Images are automatically optimized to WebP where beneficial. Target around 100 KB; final size depends on the artwork. Existing uploaded images are not modified.</small>
        <label>Announcement heading *</label><input required maxLength={120} value={form.title} onChange={event => change("title", event.target.value)} placeholder="This week's exclusive aquarium offers"/>
        <label>Optional description</label><textarea rows={3} maxLength={600} value={form.description} onChange={event => change("description", event.target.value)} placeholder="Share the details of the offer"/>
        <div className="mbg-admin-offer__dates"><div><label>Start date and time (optional)</label><input type="datetime-local" value={form.starts_at || ""} onChange={event => change("starts_at", event.target.value)}/></div><div><label>End date and time (optional)</label><input type="datetime-local" value={form.ends_at || ""} onChange={event => change("ends_at", event.target.value)}/></div></div>
        <label className="mbg-admin-offer__check"><input type="checkbox" checked={form.is_active} onChange={event => change("is_active", event.target.checked)}/> Publish announcement when within the selected date range</label>
      </section>
      <section className="mbg-admin-offer__panel"><h2>02 · Products featured in this offer</h2><p>Select any existing items. Changes to prices, images or stock in the catalogue will automatically be reflected on the Notifications page.</p>
        <div className="mbg-admin-offer__filters"><input aria-label="Search products" placeholder="Search catalogue products…" value={search} onChange={event => setSearch(event.target.value)}/><select aria-label="Product category" value={type} onChange={event => setType(event.target.value)}><option value="all">All products</option><option value="fish">Collection (fish)</option><option value="plants">Plants & Accessories</option></select></div>
        <div className="mbg-admin-offer__list">{filtered.map(item => <label key={chosenKey(item.type,item.id)} className="mbg-admin-offer__item"><input type="checkbox" checked={selected.has(chosenKey(item.type,item.id))} onChange={() => toggle(item)}/><span className="mbg-admin-offer__thumb">{item.image_url ? <img src={imageUrl(item.image_url)} alt="" loading="lazy"/> : "—"}</span><span><b>{item.name}</b><small>{item.type === "fish" ? "Collection" : "Plants & Accessories"} · {money(item.price)}</small></span></label>)}{filtered.length === 0 && <p>No matching products.</p>}</div>
        <div className="mbg-admin-offer__selected"><strong>Selected products ({selectedRows.length})</strong>{selectedRows.map(item => <button type="button" key={chosenKey(item.type,item.id)} onClick={() => toggle(item)} title="Remove product">{item.name} ×</button>)}</div>
      </section><button className="mbg-admin-offer__save" type="submit" disabled={busy}>{busy ? "Saving announcement…" : "Save offer announcement"}</button>
    </form>
  </div>;
}
