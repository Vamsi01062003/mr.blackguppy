import { useEffect, useMemo, useState } from "react";
import { Sparkles, Fish, Leaf, ShoppingCart } from "lucide-react";
import { supabase } from "../lib/supabase";
import { imageUrl, money, chosenKey, OFFER_BUCKET, isLive } from "../lib/offerShowcase";
import "./notifications.css";

const EMPTY = { is_active: false, title: "", description: "", image_url: "", product_refs: [] };

export default function Notifications() {
  const [offer, setOffer] = useState(EMPTY);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [clock, setClock] = useState(Date.now());
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = JSON.parse(
        localStorage.getItem("Mr Black-Guppy-cart") || "[]"
      );
      return Array.isArray(saved) ? saved : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    const onCartUpdated = (event) => {
      if (Array.isArray(event.detail)) {
        setCartItems(event.detail);
      } else {
        try {
          const saved = JSON.parse(
            localStorage.getItem("Mr Black-Guppy-cart") || "[]"
          );
          setCartItems(Array.isArray(saved) ? saved : []);
        } catch {
          setCartItems([]);
        }
      }
    };

    const onStorage = (event) => {
      if (event.key === "Mr Black-Guppy-cart") {
        onCartUpdated({});
      }
    };

    window.addEventListener("cartUpdated", onCartUpdated);
    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener("cartUpdated", onCartUpdated);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  useEffect(() => {
    if (!supabase) { setError("Offers are temporarily unavailable."); setLoading(false); return; }
    let active = true;
    const load = async () => {
      const { data, error: loadError } = await supabase.from("offer_showcase").select("*").eq("id", 1).maybeSingle();
      if (!active) return;
      if (loadError) { setError("Offers are temporarily unavailable."); setLoading(false); return; }
      const current = data || EMPTY;
      setOffer(current);
      const ids = Array.isArray(current.product_refs) ? current.product_refs : [];
      if (!ids.length) { setProducts([]); setLoading(false); setError(""); return; }
      const fetches = ["fish", "plants"].map(async type => {
        const requestedIds = ids.filter(ref => ref.type === type).map(ref => ref.id);
        if (!requestedIds.length) return [];
        const table = type === "fish" ? "fish_products" : "plant_accessory_products";
        const result = await supabase.from(table).select("id,name,price,discount_price,stock,image_url").in("id", requestedIds);
        if (result.error) throw result.error;
        return (result.data || []).map(item => ({ ...item, type }));
      });
      try {
        const rows = (await Promise.all(fetches)).flat();
        if (active) {
          const byKey = new Map(rows.map(item => [chosenKey(item.type, item.id), item]));
          setProducts(ids.map(ref => byKey.get(chosenKey(ref.type, ref.id))).filter(Boolean));
          setError("");
        }
      } catch (err) { if (active) setError("Unable to load related products."); }
      if (active) setLoading(false);
    };
    load();
    const refresh = window.setInterval(load, 60000);
    const ticker = window.setInterval(() => setClock(Date.now()), 60000);
    const onFocus = () => load();
    document.addEventListener("visibilitychange", onFocus);
    return () => { active = false; window.clearInterval(refresh); window.clearInterval(ticker); document.removeEventListener("visibilitychange", onFocus); };
  }, []);


  const addOfferToCart = (item) => {
    const key = "Mr Black-Guppy-cart";
    let cart = [];

    try {
      const saved = JSON.parse(localStorage.getItem(key) || "[]");
      if (Array.isArray(saved)) cart = saved;

      const existing = cart.find(
        product => String(product.id) === String(item.id)
      );

      const updated = existing
        ? cart.map(product =>
            String(product.id) === String(item.id)
              ? { ...product, quantity: (Number(product.quantity) || 1) + 1 }
              : product
          )
        : [...cart, { ...item, quantity: 1 }];

      localStorage.setItem(key, JSON.stringify(updated));
      setCartItems(updated);
      window.dispatchEvent(
        new CustomEvent("cartUpdated", { detail: updated })
      );
    } catch (error) {
      console.error("Unable to add to cart:", error);
      alert("Could not add this item to the cart.");
    }
  };

  const visible = useMemo(() => isLive(offer), [offer, clock]);
  const mainImage = imageUrl(offer.image_url, OFFER_BUCKET);
  return (
    <section className="mbg-offers" id="offers-section" aria-labelledby="mbg-offers-heading">
      <div className="mbg-offers__inner">
        <div className="mbg-offers__heading"><span className="mbg-offers__eyebrow"><Sparkles size={15}/> THE MR BLACK GUPPY EDIT</span><h2 id="mbg-offers-heading">Offers <em>& Announcements</em></h2></div>
        {loading ? <div className="mbg-offers__state" role="status">Loading the latest offer…</div> : error ? <div className="mbg-offers__state" role="alert">{error}</div> : !visible ? <div className="mbg-offers__state"><Sparkles size={27}/><h3>Something special is coming</h3><p>Check back for our next announcement.</p></div> : <>
          <div className="mbg-offers__showcase">
            <article className="mbg-offers__feature">
              <div className="mbg-offers__image-wrap">
                <div className="mbg-offers__poster">
                  {mainImage ? (
                    <img
                      className="mbg-offers__banner"
                      src={mainImage}
                      alt={offer.title || "Mr Black Guppy announcement"}
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <div className="mbg-offers__no-image">
                      MR BLACK GUPPY
                    </div>
                  )}
                </div>
              </div>

              <div className="mbg-offers__feature-body">
                <span className="mbg-offers__kicker">
                  EXCLUSIVE ANNOUNCEMENT
                </span>
                <h3>{offer.title || "Special Announcement"}</h3>
                {offer.description && <p>{offer.description}</p>}
              </div>
            </article>

            {products.length > 0 && (
              <div className="mbg-offers__related">
                <div className="mbg-offers__related-title">
                  <span>HANDPICKED FOR THIS OFFER</span>
                  <h3>Offer Available Items</h3>
                </div>

                <div className="mbg-offers__grid">
                  {products.map((item) => {
                    const original = Number(item.price);
                    const discounted = Number(item.discount_price);

                    const hasDiscount =
                      item.discount_price != null &&
                      item.discount_price !== "" &&
                      Number.isFinite(original) &&
                      Number.isFinite(discounted) &&
                      original > 0 &&
                      discounted > 0 &&
                      discounted < original;

                    const discountPct = hasDiscount
                      ? Math.round((1 - discounted / original) * 100)
                      : 0;

                    const soldOut =
                      item.stock != null && Number(item.stock) <= 0;

                    const quantity =
                      Number(
                        cartItems.find(
                          (entry) =>
                            String(entry.id) === String(item.id)
                        )?.quantity
                      ) || 0;

                    return (
                      <article
                        key={chosenKey(item.type, item.id)}
                        className="mbg-offers__product"
                      >
                        <div className="mbg-offers__product-photo">
                          {item.image_url ? (
                            <img
                              src={imageUrl(item.image_url)}
                              alt={item.name || "Aquarium product"}
                              loading="lazy"
                              decoding="async"
                            />
                          ) : (
                            <span>
                              {item.type === "fish"
                                ? <Fish size={32} />
                                : <Leaf size={32} />}
                            </span>
                          )}
                        </div>

                        <div className="mbg-offers__product-copy">
                          <span className="mbg-offers__product-kind">
                            {item.type === "fish"
                              ? "AQUARIUM FISH"
                              : "PLANTS & ACCESSORIES"}
                          </span>

                          <h4>{item.name}</h4>

                          <div className="mbg-offers__purchase-row">
                            <div className="mbg-offers__price">
                              {hasDiscount && (
                                <span className="mbg-offers__discount">
                                  -{discountPct}%
                                </span>
                              )}

                              <strong>
                                {money(
                                  hasDiscount
                                    ? item.discount_price
                                    : item.price
                                )}
                              </strong>

                              {hasDiscount && (
                                <s>M.R.P. {money(item.price)}</s>
                              )}
                            </div>

                            <span
                              className={`mbg-offers__stock ${
                                soldOut
                                  ? "is-sold-out"
                                  : "is-available"
                              }`}
                            >
                              <span className="mbg-offers__stock-dot" />
                              {soldOut ? "SOLD OUT" : "AVAILABLE"}
                            </span>
                          </div>

                          <button
                            type="button"
                            className="mbg-offers__product-link"
                            disabled={soldOut}
                            onClick={() => addOfferToCart(item)}
                          >
                            <ShoppingCart size={16} />
                            {soldOut
                              ? "Sold Out"
                              : quantity > 0
                              ? `Added to Cart (${quantity})`
                              : "Add to Cart"}
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </>}
      </div>
    </section>
  );
}
