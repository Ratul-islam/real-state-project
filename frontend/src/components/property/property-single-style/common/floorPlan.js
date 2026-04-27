"use client";

import React, { useRef, useState } from "react";
import { uploadImage } from "@/services/listing/listings.service";
import Image from "next/image";

const DEFAULT_CURRENCY = "BDT";

export const FloorPlansStep = ({
  value,
  onChange,
  errors = {},
  touched = false,
  disabled = false,
}) => {
  const plans = Array.isArray(value?.floorPlans) ? value.floorPlans : [];
  const fileRefs = useRef({});
  const [uploadingIndex, setUploadingIndex] = useState(null);

  const patchPlans = (next) => onChange?.({ floorPlans: next });

  const addPlan = () => {
    const next = [
      ...plans,
      {
        title: "",
        sizeSqft: 0,
        bedrooms: 0,
        bathrooms: 0,
        pricing: { amount: 0, currency: DEFAULT_CURRENCY },
        image: { type: "image", url: "", alt: "", order: 0 },
        description: "",
        order: plans.length,
      },
    ];
    patchPlans(next);
  };

  const removePlan = (idx) => {
    const next = plans
      .filter((_, i) => i !== idx)
      .map((p, i) => ({ ...p, order: i }));
    patchPlans(next);
  };

  const updatePlan = (idx, patch) => {
    const next = plans.map((p, i) => (i === idx ? { ...p, ...patch } : p));
    patchPlans(next);
  };

  const updatePlanImage = (idx, patch) => {
    const next = plans.map((p, i) =>
      i === idx
        ? { ...p, image: { ...(p.image || { type: "image" }), ...patch } }
        : p
    );
    patchPlans(next);
  };

  const triggerPick = (idx) => {
    if (disabled) return;
    fileRefs.current[idx]?.click?.();
  };

  const detectAssetType = (file) => {
    const name = (file?.name || "").toLowerCase();
    const mime = (file?.type || "").toLowerCase();

    if (mime === "application/pdf" || name.endsWith(".pdf")) return "pdf";
    return "image";
  };

  const onPickFile = async (idx, file) => {
    if (!file) return;

    const selectedType = plans[idx]?.image?.type === "pdf" ? "pdf" : "image";
    const actualType = detectAssetType(file);

    if (selectedType !== actualType) {
      alert(
        selectedType === "pdf"
          ? "Please select a PDF file."
          : "Please select an image file."
      );
      if (fileRefs.current[idx]) fileRefs.current[idx].value = "";
      return;
    }

    try {
      setUploadingIndex(idx);

      const uploaded = await uploadImage(file);

      // backend may return either uploaded.data[0], uploaded.data, or uploaded
      const asset = Array.isArray(uploaded?.data)
        ? uploaded.data[0]
        : uploaded?.data ?? uploaded;

      const url = String(asset?.url || "").trim();
      if (!url) throw new Error("Upload failed (missing url).");

      const type = asset?.type || actualType;

      updatePlanImage(idx, {
        type,
        url,
        alt: type === "image" ? asset?.originalName || file?.name || "" : "",
        pages: type === "pdf" ? asset?.pages : undefined,
      });
    } catch (e) {
      console.error(e);
      alert(e?.message || "Failed to upload file");
    } finally {
      setUploadingIndex(null);
      if (fileRefs.current[idx]) fileRefs.current[idx].value = "";
    }
  };

  const ensureNumber = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  };

  const getPricingMode = (pricing) => {
    if (pricing && typeof pricing.amount === "number") return "fixed";
    if (
      pricing &&
      typeof pricing.min === "number" &&
      typeof pricing.max === "number"
    ) {
      return "range";
    }
    return "fixed";
  };

  const switchPricingMode = (idx, mode) => {
    const pr = plans[idx]?.pricing;

    if (mode === "fixed") {
      const amount =
        typeof pr?.amount === "number"
          ? pr.amount
          : typeof pr?.min === "number"
          ? pr.min
          : 0;

      const next = plans.map((p, i) => {
        if (i !== idx) return p;
        return { ...p, pricing: { currency: DEFAULT_CURRENCY, amount } };
      });
      patchPlans(next);
      return;
    }

    const base =
      typeof pr?.amount === "number"
        ? pr.amount
        : typeof pr?.min === "number"
        ? pr.min
        : 0;

    const next = plans.map((p, i) => {
      if (i !== idx) return p;
      return {
        ...p,
        pricing: { currency: DEFAULT_CURRENCY, min: base, max: base },
      };
    });
    patchPlans(next);
  };

  const switchAssetType = (idx, nextType) => {
    const cur = plans[idx]?.image || {};
    const shouldClear = cur?.type !== nextType;

    if (fileRefs.current[idx]) {
      fileRefs.current[idx].value = "";
    }

    updatePlanImage(idx, {
      type: nextType,
      ...(shouldClear ? { url: "", alt: "", pages: undefined } : {}),
    });
  };

  return (
    <div className="row">
      <div className="col-12 mb15 d-flex align-items-center justify-content-between">
        <h5 className="mb-0">Floor Plans</h5>
        <button
          type="button"
          className="ud-btn btn-theme"
          onClick={addPlan}
          disabled={disabled}
        >
          + Add Floor Plan
        </button>
      </div>

      {touched && errors?.floorPlans && (
        <div className="col-12">
          <div className="text-danger mb15" style={{ fontSize: 13 }}>
            {errors.floorPlans}
          </div>
        </div>
      )}

      {plans.length === 0 ? (
        <div className="col-12">
          <p className="text mb0">No floor plans added yet (optional).</p>
        </div>
      ) : (
        plans.map((p, idx) => {
          const uploading = uploadingIndex === idx;

          const asset = p?.image || {};
          const assetType = asset?.type === "pdf" ? "pdf" : "image";
          const url = String(asset?.url || "").trim();
          const hasUrl = url.length > 5;

          const priceMode = getPricingMode(p?.pricing);
          const pr = p?.pricing || { amount: 0, currency: DEFAULT_CURRENCY };

          return (
            <div key={idx} className="col-12 mb20">
              <div className="p20 bdrs12 bdr1 bgc-white">
                <div className="d-flex justify-content-between align-items-center mb15">
                  <h6 className="mb-0">Plan #{idx + 1}</h6>
                  <button
                    type="button"
                    className="ud-btn btn-white"
                    onClick={() => removePlan(idx)}
                    disabled={disabled}
                  >
                    Remove
                  </button>
                </div>

                <div className="row">
                  <div className="col-md-6 mb15">
                    <label className="form-label fw600">Title</label>
                    <input
                      className="form-control"
                      value={p.title || ""}
                      onChange={(e) => updatePlan(idx, { title: e.target.value })}
                      disabled={disabled}
                      placeholder="e.g. First Floor"
                    />
                  </div>

                  <div className="col-md-6 mb15">
                    <label className="form-label fw600">Floor Plan File</label>

                    <div
                      style={{
                        display: "flex",
                        border: "1px solid #e5e7eb",
                        borderRadius: 10,
                        overflow: "hidden",
                        marginBottom: 10,
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => switchAssetType(idx, "image")}
                        disabled={disabled}
                        style={{
                          flex: 1,
                          padding: "10px 12px",
                          border: "none",
                          background:
                            assetType === "image" ? "#eb6753" : "transparent",
                          color: assetType === "image" ? "#fff" : "#111",
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        Image
                      </button>
                      <button
                        type="button"
                        onClick={() => switchAssetType(idx, "pdf")}
                        disabled={disabled}
                        style={{
                          flex: 1,
                          padding: "10px 12px",
                          border: "none",
                          background:
                            assetType === "pdf" ? "#eb6753" : "transparent",
                          color: assetType === "pdf" ? "#fff" : "#111",
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        PDF
                      </button>
                    </div>

                    <div className="d-flex gap-2">
                      <button
                        type="button"
                        className="ud-btn btn-theme"
                        onClick={() => triggerPick(idx)}
                        disabled={disabled || uploading}
                      >
                        {uploading
                          ? "Uploading..."
                          : assetType === "pdf"
                          ? "Upload PDF"
                          : "Upload Image"}
                      </button>

                      <button
                        type="button"
                        className="ud-btn btn-white"
                        onClick={() =>
                          updatePlanImage(idx, {
                            url: "",
                            alt: "",
                            pages: undefined,
                          })
                        }
                        disabled={disabled || !hasUrl}
                      >
                        Remove File
                      </button>
                    </div>

                    <input
                      type="file"
                      accept={
                        assetType === "pdf"
                          ? "application/pdf,.pdf"
                          : "image/*"
                      }
                      ref={(el) => (fileRefs.current[idx] = el)}
                      style={{ display: "none" }}
                      onChange={(e) =>
                        onPickFile(idx, e.target.files?.[0] || undefined)
                      }
                      disabled={disabled}
                    />

                    {hasUrl ? (
                      <div className="mt10">
                        {assetType === "image" ? (
                          <>
                            <Image
                              unoptimized
                              src={url}
                              alt={asset?.alt || "floor-plan"}
                              width={1200}
                              height={600}
                              style={{
                                width: "100%",
                                maxWidth: 360,
                                height: 180,
                                objectFit: "cover",
                                borderRadius: 10,
                                border: "1px solid #eee",
                              }}
                            />

                            <div className="mt10">
                              <label className="form-label fw600">
                                Alt (optional)
                              </label>
                              <input
                                className="form-control"
                                value={asset?.alt || ""}
                                onChange={(e) =>
                                  updatePlanImage(idx, { alt: e.target.value })
                                }
                                disabled={disabled}
                                placeholder="Alt text"
                              />
                            </div>
                          </>
                        ) : (
                          <div style={{ maxWidth: 360 }}>
                            <div
                              className="p15 bdrs10"
                              style={{ border: "1px solid #eee" }}
                            >
                              <div className="fw600 mb10">PDF preview</div>

                              <iframe
                                src={url}
                                title={`floor-plan-pdf-${idx}`}
                                style={{
                                  width: "100%",
                                  height: 240,
                                  border: "1px solid #f0f0f0",
                                  borderRadius: 8,
                                }}
                              />

                              <div className="mt10 d-flex gap-2">
                                <a
                                  href={url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="ud-btn btn-theme"
                                  style={{ display: "inline-block" }}
                                >
                                  Open PDF
                                </a>
                              </div>

                              <div className="mt10">
                                <label className="form-label fw600">
                                  Pages (optional)
                                </label>
                                <input
                                  type="number"
                                  className="form-control"
                                  value={asset?.pages ?? ""}
                                  onChange={(e) => {
                                    const v = ensureNumber(e.target.value);
                                    updatePlanImage(idx, {
                                      pages: v > 0 ? v : undefined,
                                    });
                                  }}
                                  disabled={disabled}
                                  min={1}
                                  placeholder="e.g. 2"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="mt10">
                        <label className="form-label fw600">
                          Or paste {assetType === "pdf" ? "PDF" : "Image"} URL
                        </label>
                        <input
                          className="form-control"
                          value={url}
                          onChange={(e) =>
                            updatePlanImage(idx, { url: e.target.value })
                          }
                          disabled={disabled}
                          placeholder="https://..."
                        />
                      </div>
                    )}
                  </div>

                  <div className="col-md-4 mb15">
                    <label className="form-label fw600">Size (sqft)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={Number(p.sizeSqft ?? 0)}
                      onChange={(e) =>
                        updatePlan(idx, { sizeSqft: Number(e.target.value) })
                      }
                      disabled={disabled}
                      min={0}
                    />
                  </div>

                  <div className="col-md-4 mb15">
                    <label className="form-label fw600">Bedrooms</label>
                    <input
                      type="number"
                      className="form-control"
                      value={Number(p.bedrooms ?? 0)}
                      onChange={(e) =>
                        updatePlan(idx, { bedrooms: Number(e.target.value) })
                      }
                      disabled={disabled}
                      min={0}
                    />
                  </div>

                  <div className="col-md-4 mb15">
                    <label className="form-label fw600">Bathrooms</label>
                    <input
                      type="number"
                      className="form-control"
                      value={Number(p.bathrooms ?? 0)}
                      onChange={(e) =>
                        updatePlan(idx, { bathrooms: Number(e.target.value) })
                      }
                      disabled={disabled}
                      min={0}
                    />
                  </div>

                  <div className="col-md-6 mb15">
                    <label className="form-label fw600">Pricing type</label>
                    <div
                      style={{
                        display: "flex",
                        border: "1px solid #e5e7eb",
                        borderRadius: 10,
                        overflow: "hidden",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => switchPricingMode(idx, "fixed")}
                        disabled={disabled}
                        style={{
                          flex: 1,
                          padding: "10px 12px",
                          border: "none",
                          background:
                            priceMode === "fixed" ? "#eb6753" : "transparent",
                          color: priceMode === "fixed" ? "#fff" : "#111",
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        Fixed
                      </button>
                      <button
                        type="button"
                        onClick={() => switchPricingMode(idx, "range")}
                        disabled={disabled}
                        style={{
                          flex: 1,
                          padding: "10px 12px",
                          border: "none",
                          background:
                            priceMode === "range" ? "#eb6753" : "transparent",
                          color: priceMode === "range" ? "#fff" : "#111",
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        Range
                      </button>
                    </div>

                    <div style={{ marginTop: 8, fontSize: 12, color: "#6b7280" }}>
                      Currency defaults to <b>BDT</b>
                    </div>
                  </div>

                  <div className="col-md-6 mb15">
                    <label className="form-label fw600">
                      {priceMode === "fixed" ? "Price (BDT)" : "Price range (BDT)"}
                    </label>

                    {priceMode === "fixed" ? (
                      <input
                        type="number"
                        className="form-control"
                        value={typeof pr.amount === "number" ? pr.amount : 0}
                        onChange={(e) => {
                          const amount = ensureNumber(e.target.value);
                          const next = plans.map((pp, i) =>
                            i === idx
                              ? {
                                  ...pp,
                                  pricing: { currency: DEFAULT_CURRENCY, amount },
                                }
                              : pp
                          );
                          patchPlans(next);
                        }}
                        disabled={disabled}
                        min={0}
                      />
                    ) : (
                      <div style={{ display: "flex", gap: 10 }}>
                        <input
                          type="number"
                          className="form-control"
                          placeholder="Min"
                          value={typeof pr.min === "number" ? pr.min : 0}
                          onChange={(e) => {
                            const min = ensureNumber(e.target.value);
                            const max =
                              typeof pr.max === "number"
                                ? ensureNumber(pr.max)
                                : min;

                            const next = plans.map((pp, i) =>
                              i === idx
                                ? {
                                    ...pp,
                                    pricing: {
                                      currency: DEFAULT_CURRENCY,
                                      min,
                                      max,
                                    },
                                  }
                                : pp
                            );
                            patchPlans(next);
                          }}
                          disabled={disabled}
                          min={0}
                        />
                        <input
                          type="number"
                          className="form-control"
                          placeholder="Max"
                          value={typeof pr.max === "number" ? pr.max : 0}
                          onChange={(e) => {
                            const max = ensureNumber(e.target.value);
                            const min =
                              typeof pr.min === "number"
                                ? ensureNumber(pr.min)
                                : 0;

                            const next = plans.map((pp, i) =>
                              i === idx
                                ? {
                                    ...pp,
                                    pricing: {
                                      currency: DEFAULT_CURRENCY,
                                      min,
                                      max,
                                    },
                                  }
                                : pp
                            );
                            patchPlans(next);
                          }}
                          disabled={disabled}
                          min={0}
                        />
                      </div>
                    )}
                  </div>

                  <div className="col-12 mb0">
                    <label className="form-label fw600">
                      Description (optional)
                    </label>
                    <textarea
                      className="form-control"
                      rows={3}
                      value={p.description || ""}
                      onChange={(e) =>
                        updatePlan(idx, { description: e.target.value })
                      }
                      disabled={disabled}
                      placeholder="Short notes about this floor plan..."
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default FloorPlansStep;