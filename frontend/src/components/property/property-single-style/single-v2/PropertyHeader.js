"use client";

import React, { useMemo, useState } from "react";

const formatPrice = (price, currency = "USD") => {
  const n = Number(price);

  if (!Number.isFinite(n)) return "—";
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(n);
  } catch {
    return `৳${n.toLocaleString("en-US")}`;
  }
};

const yearsAgo = (year) => {
  const y = Number(year);
  if (!Number.isFinite(y) || y < 1000) return "—";
  const diff = new Date().getFullYear() - y;
  return diff >= 0 ? `${diff} years ago` : "—";
};

const dollarsPerSqft = (price, sqft) => {
  const p = Number(price);
  const s = Number(sqft);
  if (!Number.isFinite(p) || !Number.isFinite(s) || s <= 0) return null;
  return (p / s).toFixed(2);
};

async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  }
}

const PropertyHeader = ({ id, property, onShareClick, onNewTabClick }) => {
  const [toast, setToast] = useState({ show: false, text: "", kind: "success" });

  const showToast = (text, kind = "success") => {
    setToast({ show: true, text, kind });
    window.clearTimeout(showToast._t);
    showToast._t = window.setTimeout(() => {
      setToast((p) => ({ ...p, show: false }));
    }, 2200);
  };

  const title = property?.title || "—";

  const locationLine =
    property?.locationText ||
    property?.location ||
    [property?.city, property?.neighborhood].filter(Boolean).join(", ") ||
    "—";

  const statusText =
    typeof property?.status === "string" && property.status.trim()
      ? property.status
      : property?.forRent === true
      ? "rent"
      : property?.forRent === false
      ? "sale"
      : "—";

  const built = property?.yearBuilt ?? property?.yearBuilding ?? null;
  const displayId = property?._id || property?.id || id || "—";

  const listingId = String(property?._id || property?.id || id || "");
  const listingPath = listingId ? `/single-v1/${listingId}` : "#";
  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}${listingPath}`
      : listingPath;

  // --- Pricing Logic Start ---
  const pricing = property?.pricing || {};
  const currency = pricing.currency || property?.currency || "USD";

  const priceText = useMemo(() => {
    if (pricing.amount != null) {
      return formatPrice(pricing.amount, currency);
    }
    if (pricing.min != null && pricing.max != null) {
      if (pricing.min === pricing.max) {
        return formatPrice(pricing.min, currency);
      }
      return `${formatPrice(pricing.min, currency)} - ${formatPrice(pricing.max, currency)}`;
    }
    if (pricing.min != null) return formatPrice(pricing.min, currency);
    if (pricing.max != null) return formatPrice(pricing.max, currency);
    return "—";
  }, [pricing, currency]);

  const perSqftText = useMemo(() => {
    const sqft = Number(property?.sqft);
    
    // 1. MUST have valid sqft to calculate. If 0 or missing, hide the text completely.
    if (!Number.isFinite(sqft) || sqft <= 0) return null;

    const calc = (val) => dollarsPerSqft(val, sqft);

    // 2. Handle flat amount
    if (pricing.amount != null) {
      const res = calc(pricing.amount);
      return res ? `${priceText} / ${sqft} sq ft = $${res}/sq ft` : null;
    }

    // 3. Handle min/max range
    if (pricing.min != null && pricing.max != null) {
      const minRes = calc(pricing.min);
      const maxRes = calc(pricing.max);

      // If min and max are different, show the full range
      if (pricing.min !== pricing.max && minRes && maxRes) {
         return `${priceText} / ${sqft} sq ft = ৳${minRes} - ৳${maxRes}/sq ft`;
      }

      return minRes ? `${priceText} / ${sqft} sq ft = ৳${minRes}/sq ft` : null;
    }

    if (pricing.min != null) {
      const res = calc(pricing.min);
      return res ? `${priceText} / ${sqft} sq ft = ৳${res}/sq ft` : null;
    }

    return null;
  }, [pricing, property?.sqft, priceText]);
  // --- Pricing Logic End ---

  const handleNewTab = (e) => {
    e.preventDefault();
    if (!listingId) return;

    onNewTabClick?.();
    onShareClick?.({ action: "new_tab" });

    window.open(shareUrl, "_blank", "noopener,noreferrer");
  };

  const handleShare = async (e) => {
    e.preventDefault();
    if (!listingId) return;

    onShareClick?.({ action: "share" });

    try {
      if (navigator.share) {
        await navigator.share({
          title: title || "Listing",
          text: `Check out: ${title}`,
          url: shareUrl,
        });
        return;
      }
    } catch {
      return;
    }

    const ok = await copyToClipboard(shareUrl);
    if (ok) showToast("Link copied to clipboard", "success");
    else showToast("Could not copy link", "error");
  };

  return (
    <>
      <div className="col-lg-8">
        <div className="single-property-content mb30-md">
          <h2 className="sp-lg-title">{title}</h2>

          <div className="pd-meta mb15 d-md-flex align-items-center">
            <p className="text fz15 mb-0 bdrr1 pr10 bdrrn-sm">{locationLine}</p>
          </div>

          <div className="property-meta d-flex align-items-center">
            <span className="ff-heading text-thm fz15 bdrr1 pr10 bdrrn-sm">
              <i className="fas fa-circle fz10 pe-2" />
              For {statusText}
            </span>

            <span className="ff-heading bdrr1 fz15 pr10 ml10 ml0-sm bdrrn-sm">
              <i className="far fa-clock pe-2" />
              {yearsAgo(built)}
            </span>

            <span className="ff-heading ml10 ml0-sm fz15">
              <i className="flaticon-fullscreen pe-2 align-text-top" />
              {displayId}
            </span>
          </div>
        </div>
      </div>

      <div className="col-lg-4">
        <div className="single-property-content">
          <div className="property-action text-lg-end" style={{ position: "relative" }}>
            <div className="d-flex mb20 mb10-md align-items-center justify-content-lg-end">
              {/* New tab */}
              <a
                className="icon mr10"
                href={listingPath}
                target="_blank"
                rel="noreferrer"
                onClick={handleNewTab}
                aria-label="Open in new tab"
                title="Open in new tab"
              >
                <span className="flaticon-new-tab" />
              </a>

              {/* Share */}
              <a
                className="icon mr10"
                href="#"
                onClick={handleShare}
                aria-label="Share"
                title="Share"
              >
                <span className="flaticon-share-1" />
              </a>
            </div>

            {/* Toast */}
            {toast.show && (
              <div
                role="status"
                aria-live="polite"
                style={{
                  position: "absolute",
                  right: 0,
                  top: 44,
                  padding: "8px 10px",
                  borderRadius: 10,
                  fontSize: 12,
                  boxShadow: "0 8px 20px rgba(0,0,0,0.12)",
                  background: toast.kind === "error" ? "#2b2b2b" : "#111",
                  color: "#fff",
                  maxWidth: 240,
                }}
              >
                {toast.text}
              </div>
            )}

            <h3 className="price mb-0">{priceText}</h3>

            {/* Conditionally render the perSqft line ONLY if we have valid data for it */}
            {perSqftText && (
              <p className="text space fz15">
                {perSqftText}
              </p>
            )}

          </div>
        </div>
      </div>
    </>
  );
};

export default PropertyHeader;