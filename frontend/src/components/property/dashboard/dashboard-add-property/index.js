"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PropertyDescription from "./property-description";
import UploadMedia from "./upload-media";
import LocationField from "./LocationField";
import DetailsFiled from "./details-field";
import Amenities from "./Amenities";
import {
  createListing,
  getListingById,
  updateListing,
} from "@/services/listing/listings.service";
import { getAgents } from "@/services/agents/agents.service"; // ✅ Added Agent Service
import FloorPlansStep from "../../property-single-style/common/floorPlan";

const DEFAULT_CURRENCY = "BDT";

const initialForm = () => ({
  title: "",
  propertyType: "Houses",
  businessType: "",
  agent: "", // ✅ Added agent field

  pricing: { amount: 0, currency: DEFAULT_CURRENCY },

  forRent: false,
  featured: false,
  yearBuilding: new Date().getFullYear(),

  description: "",
  propertyStatus: "",

  media: {
    cover: null,
    gallery: [],
    video: null,
    virtualTourUrl: "",
  },

  city: "",
  locationText: "",
  lat: null,
  lng: null,

  zip: "",
  thana: "",
  neighborhood: "",

  beds: 0,
  baths: 0,
  sqft: 0,

  features: [],
  tags: [],

  floorPlans: [],
});

function sanitizeMedia(media) {
  const m = media || {};
  const cover =
    m?.cover && typeof m.cover === "object" && typeof m.cover.url === "string"
      ? {
          url: String(m.cover.url).trim(),
          alt: typeof m.cover.alt === "string" ? m.cover.alt : "",
          order: Number.isFinite(Number(m.cover.order)) ? Number(m.cover.order) : 0,
        }
      : m?.cover ?? null;

  const gallery = Array.isArray(m.gallery)
    ? m.gallery
        .map((g) => {
          if (typeof g === "string") {
            const u = g.trim();
            return u ? { url: u, alt: "", order: 0 } : null;
          }
          if (!g || typeof g !== "object") return null;
          if (typeof g.url !== "string") return null;
          const url = String(g.url).trim();
          return url ? { url, alt: g.alt || "", order: g.order || 0 } : null;
        })
        .filter(Boolean)
    : [];

  return {
    cover,
    gallery,
    video: m.video ?? null,
    virtualTourUrl: m.virtualTourUrl || "",
  };
}

function hydrateFloorPlans(floorPlans) {
  const arr = Array.isArray(floorPlans) ? floorPlans : [];
  return arr.map((p, idx) => {
    const image = p?.image || {};
    const pricing = p?.pricing ?? { amount: Number(p?.price || 0), currency: DEFAULT_CURRENCY };
    return {
      title: p?.title ?? "",
      sizeSqft: Number(p?.sizeSqft ?? 0),
      bedrooms: Number(p?.bedrooms ?? 0),
      bathrooms: Number(p?.bathrooms ?? 0),
      pricing: { ...pricing, currency: DEFAULT_CURRENCY },
      image: {
        type: image?.type === "pdf" ? "pdf" : "image",
        url: image?.url || "",
        alt: image?.alt || "",
        order: image?.order ?? idx,
      },
      description: p?.description ?? "",
      order: p?.order ?? idx,
    };
  });
}

function sanitizeFloorPlans(plans) {
  const arr = Array.isArray(plans) ? plans : [];
  return arr
    .map((p, idx) => {
      const image = p?.image || {};
      return {
        title: String(p?.title || "").trim(),
        sizeSqft: Number(p?.sizeSqft ?? 0),
        bedrooms: Number(p?.bedrooms ?? 0),
        bathrooms: Number(p?.bathrooms ?? 0),
        pricing: { ...p.pricing, currency: DEFAULT_CURRENCY },
        image: {
          type: image.type || "image",
          url: String(image.url || "").trim(),
          alt: image.alt || "",
          order: image.order ?? idx,
        },
        description: p.description ?? "",
        order: p.order ?? idx,
      };
    })
    .filter((p) => p.title && p.image?.url);
}

const AddPropertyTabContent = ({ listingId }) => {
  const router = useRouter();
  const isEdit = Boolean(listingId);

  const [form, setForm] = useState(initialForm());
  const [activeStep, setActiveStep] = useState(1);
  const [agents, setAgents] = useState([]); // ✅ Store agent list
  const [loadingAgents, setLoadingAgents] = useState(false);

  const [errors, setErrors] = useState({ step1: {}, step2: {}, step3: {}, step4: {}, step5: {}, step6: {} });
  const [touchedSteps, setTouchedSteps] = useState({ step1: false, step2: false, step3: false, step4: false, step5: false, step6: false });
  const [submitting, setSubmitting] = useState(false);
  const [loadingListing, setLoadingListing] = useState(isEdit);

  const [prompt, setPrompt] = useState({ open: false, mode: "loading", title: "", message: "" });

  const updateForm = (patch) => setForm((p) => ({ ...p, ...patch }));
  const updateMedia = (mediaPatch) => setForm((p) => ({ ...p, media: { ...p.media, ...mediaPatch } }));

  // ✅ Fetch Agents on mount
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        setLoadingAgents(true);
        const res = await getAgents({ activeOnly: "true" });
        setAgents(res?.data?.agents || res?.data || []);
      } catch (err) {
        console.error("Failed to fetch agents", err);
      } finally {
        setLoadingAgents(false);
      }
    };
    fetchAgents();
  }, []);

  const clickBootstrapTab = (step) => {
    document.getElementById(`nav-item${step}-tab`)?.click();
  };

  const goToStep = (step) => {
    if (submitting) return;
    if (step < activeStep) {
      setActiveStep(step);
      clickBootstrapTab(step);
      return;
    }
    for (let s = 1; s < step; s++) {
      const e = validateStep(s);
      if (Object.keys(e).length) {
        setErrors((prev) => ({ ...prev, [`step${s}`]: e }));
        setTouchedSteps((prev) => ({ ...prev, [`step${s}`]: true }));
        setActiveStep(s);
        clickBootstrapTab(s);
        return;
      }
    }
    setActiveStep(step);
    clickBootstrapTab(step);
  };

  const getPricingError = () => {
    const pr = form.pricing;
    if (!pr) return "Pricing is required.";
    if (pr.amount !== undefined && (pr.min !== undefined || pr.max !== undefined)) return "Provide amount OR range, not both.";
    if (pr.amount <= 0 && (!pr.min || !pr.max)) return "Invalid pricing.";
    return "";
  };

  const validateStep = (step) => {
    const e = {};
    if (step === 1) {
      if (!form.title || form.title.trim().length < 2) e.title = "Title is required.";
      if (!form.businessType) e.businessType = "Required.";
      if (!form.propertyType) e.propertyType = "Required.";
      if (!form.propertyStatus) e.propertyStatus = "Required.";
      const prErr = getPricingError();
      if (prErr) e.pricing = prErr;
    }
    if (step === 2 && !form.media?.cover?.url) e.cover = "Cover is required.";
    if (step === 3) {
      if (!form.city) e.city = "City required.";
      if (!form.lat || !form.lng) e.lat = "Select location on map.";
    }
    return e;
  };

  const handleNext = () => {
    const e = validateStep(activeStep);
    setErrors((prev) => ({ ...prev, [`step${activeStep}`]: e }));
    setTouchedSteps((prev) => ({ ...prev, [`step${activeStep}`]: true }));
    if (Object.keys(e).length) return;
    const next = Math.min(6, activeStep + 1);
    setActiveStep(next);
    clickBootstrapTab(next);
  };

  const handleBack = () => {
    const prev = Math.max(1, activeStep - 1);
    setActiveStep(prev);
    clickBootstrapTab(prev);
  };

  // ✅ Hydrate Edit Mode
  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      try {
        setLoadingListing(true);
        const res = await getListingById(listingId);
        const data = res?.data ?? res;
        
        setForm({
          ...initialForm(),
          ...data,
          agent: data.agent?._id || data.agent || "", // ✅ Hydrate selected agent
          media: sanitizeMedia(data.media),
          floorPlans: hydrateFloorPlans(data.floorPlans),
          lat: data.lat || data.geo?.coordinates[1],
          lng: data.lng || data.geo?.coordinates[0],
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingListing(false);
      }
    })();
  }, [listingId, isEdit]);

  const handleSubmit = async () => {
    if (submitting) return;
    const payload = {
      ...form,
      agent: form.agent || undefined, // ✅ Include agent ID in payload
      media: sanitizeMedia(form.media),
      floorPlans: sanitizeFloorPlans(form.floorPlans),
      beds: Number(form.beds),
      baths: Number(form.baths),
      sqft: Number(form.sqft),
      yearBuilding: Number(form.yearBuilding),
      lat: Number(form.lat),
      lng: Number(form.lng),
    };

    try {
      setSubmitting(true);
      setPrompt({ open: true, mode: "loading", title: "Saving", message: "Processing property..." });
      if (isEdit) {
        await updateListing(listingId, payload);
      } else {
        await createListing(payload);
      }
      setPrompt({ open: true, mode: "success", title: "Success", message: "Property saved!" });
    } catch (err) {
      setPrompt({ open: true, mode: "error", title: "Error", message: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingListing) return <div className="p30"><h4>Loading property...</h4></div>;

  return (
    <>
      {prompt.open && (
        <div className="prompt-modal-custom" style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div className="bgc-white p30 bdrs12" style={{ maxWidth: 400 }}>
            <h4>{prompt.title}</h4>
            <p>{prompt.message}</p>
            {prompt.mode !== "loading" && <button className="ud-btn btn-theme" onClick={() => prompt.mode === "success" ? router.push("/dashboard-my-properties") : setPrompt({ ...prompt, open: false })}>OK</button>}
          </div>
        </div>
      )}

      <nav>
        <div className="nav nav-tabs" id="nav-tab2" role="tablist">
          {[1, 2, 3, 4, 5, 6].map((s) => (
            <button key={s} className={`nav-link ${activeStep === s ? "active" : ""} fw600`} id={`nav-item${s}-tab`} onClick={() => goToStep(s)} type="button">
              {s}. {["Description", "Media", "Location", "Detail", "Amenities", "Floor Plans"][s - 1]}
            </button>
          ))}
        </div>
      </nav>

      <div className="tab-content mt30">
        {/* Step 1: Description + Agent Selection */}
        <div className={`tab-pane fade ${activeStep === 1 ? "show active" : ""}`} id="nav-item1">
          <div className="ps-widget bgc-white bdrs12 p30">
            <h4 className="title fz17 mb30">Property Description</h4>
            
            {/* ✅ AGENT SELECTION FIELD */}
            <div className="row mb-4">
              <div className="col-sm-12">
                <div className="mb20">
                  <label className="heading-color ff-heading fw600 mb10">Assign Agent</label>
                  <select 
                    className="form-select"
                    value={form.agent}
                    onChange={(e) => updateForm({ agent: e.target.value })}
                    disabled={submitting || loadingAgents}
                  >
                    <option value="">Select Agent (None)</option>
                    {agents.map((a) => (
                      <option key={a._id} value={a._id}>
                        {a.name} - {a.designation || "Agent"}
                      </option>
                    ))}
                  </select>
                  {loadingAgents && <small className="text-info">Loading agent list...</small>}
                </div>
              </div>
            </div>

            <PropertyDescription value={form} onChange={updateForm} errors={errors.step1} touched={touchedSteps.step1} disabled={submitting} />
          </div>
        </div>

        {/* Step 2: Media */}
        <div className={`tab-pane fade ${activeStep === 2 ? "show active" : ""}`} id="nav-item2">
          <UploadMedia media={form.media} onChange={updateMedia} errors={errors.step2} touched={touchedSteps.step2} disabled={submitting} />
        </div>

        {/* Step 3: Location */}
        <div className={`tab-pane fade ${activeStep === 3 ? "show active" : ""}`} id="nav-item3">
          <div className="ps-widget bgc-white bdrs12 p30">
            <LocationField value={form} onChange={updateForm} errors={errors.step3} touched={touchedSteps.step3} disabled={submitting} />
          </div>
        </div>

        {/* Step 4: Detail */}
        <div className={`tab-pane fade ${activeStep === 4 ? "show active" : ""}`} id="nav-item4">
          <div className="ps-widget bgc-white bdrs12 p30">
            <DetailsFiled value={form} onChange={updateForm} errors={errors.step4} touched={touchedSteps.step4} disabled={submitting} />
          </div>
        </div>

        {/* Step 5: Amenities */}
        <div className={`tab-pane fade ${activeStep === 5 ? "show active" : ""}`} id="nav-item5">
          <div className="ps-widget bgc-white bdrs12 p30">
            <Amenities value={form} onChange={updateForm} errors={errors.step5} touched={touchedSteps.step5} disabled={submitting} />
          </div>
        </div>

        {/* Step 6: Floor Plans */}
        <div className={`tab-pane fade ${activeStep === 6 ? "show active" : ""}`} id="nav-item6">
          <div className="ps-widget bgc-white bdrs12 p30">
            <FloorPlansStep value={form} onChange={updateForm} errors={errors.step6} touched={touchedSteps.step6} disabled={submitting} />
            <div className="mt30 d-flex gap-2">
              <button className="ud-btn btn-white" onClick={handleBack}>Back</button>
              <button className="ud-btn btn-theme" onClick={handleSubmit}>{isEdit ? "Update" : "Submit"}</button>
            </div>
          </div>
        </div>
      </div>

      {activeStep < 6 && (
        <div className="mt30 d-flex gap-2">
          <button className="ud-btn btn-white" onClick={handleBack} disabled={activeStep === 1}>Back</button>
          <button className="ud-btn btn-theme" onClick={handleNext}>Next</button>
        </div>
      )}
    </>
  );
};

export default AddPropertyTabContent;