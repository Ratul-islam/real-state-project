
export const normalizePricing=(input: any)=> {
  if (!input || typeof input !== "object") return undefined;

  if (input.pricing && typeof input.pricing === "object") {
    const pr = { ...input.pricing };

    if (pr.amount !== undefined) pr.amount = Number(pr.amount);
    if (pr.min !== undefined) pr.min = Number(pr.min);
    if (pr.max !== undefined) pr.max = Number(pr.max);

    if (!pr.currency) pr.currency = "BDT";

    if (pr.amount !== undefined && !Number.isFinite(pr.amount)) delete pr.amount;
    if (pr.min !== undefined && !Number.isFinite(pr.min)) delete pr.min;
    if (pr.max !== undefined && !Number.isFinite(pr.max)) delete pr.max;

    return pr;
  }

  if (input.price !== undefined && input.price !== null) {
    const amount = Number(input.price);
    if (Number.isFinite(amount)) {
      return {
        amount,
        currency: input.currency ? String(input.currency) : "BDT",
      };
    }
  }

  return undefined;
}

export const normalizeAsset=(input: any)=> {
  if (!input || typeof input !== "object") return undefined;

  const a = { ...input };

  if (!a.type) a.type = "image";

  if (a.type !== "image" && a.type !== "pdf") {
    a.type = "image";
  }

  if (a.url !== undefined) a.url = String(a.url).trim();

  if (a.alt !== undefined) a.alt = String(a.alt);
  if (a.order !== undefined) {
    const n = Number(a.order);
    if (Number.isFinite(n)) a.order = n;
    else delete a.order;
  }
  if (a.pages !== undefined) {
    const n = Number(a.pages);
    if (Number.isFinite(n) && n >= 1) a.pages = n;
    else delete a.pages;
  }

  return a;
}

export const normalizeListingPayload=(payload: any)=> {
  const p = { ...(payload || {}) };

  // Handle agent reference
  if (p.agent) {
    p.agent = String(p.agent).trim();
  }

  if (p.media) {
    if (!Array.isArray(p.media.gallery)) {
      p.media.gallery = p.media.gallery ? p.media.gallery : [];
    }
  }

  const hasLat = p.lat !== undefined && p.lat !== null;
  const hasLng = p.lng !== undefined && p.lng !== null;

  if (hasLat && hasLng) {
    const lat = Number(p.lat);
    const lng = Number(p.lng);

    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      p.geo = { type: "Point", coordinates: [lng, lat] };
    }
  }

  if (p.floorPlans !== undefined) {
    if (!Array.isArray(p.floorPlans)) p.floorPlans = [];
  }

  const listingPricing = normalizePricing(p);
  if (listingPricing) p.pricing = listingPricing;

  delete p.price;
  delete p.currency;

  if (Array.isArray(p.floorPlans)) {
    p.floorPlans = p.floorPlans.map((fp: any) => {
      const plan = { ...(fp || {}) };

      const planPricing = normalizePricing(plan);
      if (planPricing) plan.pricing = planPricing;

      delete plan.price;
      delete plan.currency;

      if (plan.image) {
        plan.image = normalizeAsset(plan.image);
      }

      return plan;
    });
  }

  return p;
}
