"use client";

import { Tooltip as ReactTooltip } from "react-tooltip";
import React, { useMemo, useRef, useState } from "react";
import Image from "next/image";
import { uploadImages } from "@/services/listing/listings.service";

const ensureString = (v) => (typeof v === "string" ? v : "");

const normalizeImage = (img, order = 0) => {
  // allow string url
  if (typeof img === "string") {
    const url = img.trim();
    return url ? { url, alt: "", order } : null;
  }

  if (!img || typeof img !== "object") return null;

  // handle accidental File objects etc.
  const url = ensureString(img.url).trim();
  if (!url) return null;

  return {
    url,
    alt: ensureString(img.alt),
    order: Number.isFinite(Number(img.order)) ? Number(img.order) : order,
  };
};

const normalizeGallery = (gallery) => {
  const arr = Array.isArray(gallery) ? gallery : [];
  const normalized = arr
    .map((g, i) => normalizeImage(g, i))
    .filter(Boolean)
    // de-dupe by url (optional but helps)
    .filter((img, i, all) => all.findIndex((x) => x.url === img.url) === i)
    .map((img, i) => ({ ...img, order: i }));
  return normalized;
};

const normalizeCover = (cover) => {
  const c = normalizeImage(cover, 0);
  return c;
};

const UploadPhotoGallery = ({ cover, gallery, onChange, disabled = false }) => {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef(null);

  const safeGallery = useMemo(() => normalizeGallery(gallery), [gallery]);
  const safeCover = useMemo(() => normalizeCover(cover), [cover]);

  const emit = (next) => {
    if (typeof onChange === "function") onChange(next);
  };

  const handleUpload = async (files) => {
    const arr = Array.from(files || []);
    if (!arr.length) return;

    setUploading(true);
    try {
      const res = await uploadImages(arr);

      // ✅ support multiple backend shapes:
      // - {data: ["url1", ...]}
      // - {data: [{url,type,...}, ...]}
      // - ["url1", ...]
      // - [{url,...}]
      const raw =
        Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];

      const uploaded = raw
        .map((item, i) => {
          if (typeof item === "string") return normalizeImage(item, i);
          if (item && typeof item === "object") return normalizeImage(item.url, i);
          return null;
        })
        .filter(Boolean);

      const nextGallery = normalizeGallery([...(safeGallery || []), ...uploaded]);

      // ✅ cover rules:
      // - if cover already exists, keep it
      // - else use first image in gallery
      const nextCover = safeCover?.url ? safeCover : nextGallery[0] ?? null;

      emit({ cover: nextCover, gallery: nextGallery });
    } catch (e) {
      console.error(e);
      alert(e?.message || "Image upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    if (disabled || uploading) return;
    handleUpload(event.dataTransfer.files);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDelete = (index) => {
    const next = [...safeGallery];
    const removed = next[index];
    next.splice(index, 1);

    const nextGallery = normalizeGallery(next);
    const nextCover =
      safeCover?.url && removed?.url && safeCover.url === removed.url
        ? nextGallery[0] ?? null
        : safeCover?.url
        ? safeCover
        : nextGallery[0] ?? null;

    emit({ cover: nextCover, gallery: nextGallery });
  };

  const handleSetCover = (index) => {
    const img = safeGallery[index];
    if (!img?.url) return;
    emit({ cover: { ...img, order: 0 }, gallery: safeGallery });
  };

  return (
    <>
      <div
        className="upload-img position-relative overflow-hidden bdrs12 text-center mb30 px-2"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <div className="icon mb30">
          <span className="flaticon-upload" />
        </div>
        <h4 className="title fz17 mb10">Upload/Drag photos of your property</h4>
        <p className="text mb25">Photos must be JPEG or PNG format</p>

        <label
          className="ud-btn btn-white"
          style={{ cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.6 : 1 }}
        >
          {uploading ? "Uploading..." : "Browse Files"}
          <input
            ref={inputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={(e) => e.target.files && handleUpload(e.target.files)}
            style={{ display: "none" }}
            disabled={uploading || disabled}
          />
        </label>
      </div>

      {safeCover?.url && (
        <div className="mb20">
          <div className="d-flex align-items-center justify-content-between">
            <p className="fw600 mb10">Cover</p>
            <span style={{ fontSize: 12, color: "#6b7280" }}>
              Click any gallery image to set as cover
            </span>
          </div>

          <Image
            unoptimized
            width={320}
            height={200}
            className="w-100 bdrs12 cover"
            src={safeCover.url}
            alt={safeCover.alt || "Cover"}
          />
        </div>
      )}

      <div className="row profile-box position-relative d-md-flex align-items-end mb50">
        {safeGallery.map((img, index) => (
          <div className="col-2" key={`${img.url}-${index}`}>
            <div className="profile-img mb20 position-relative">
              <button
                type="button"
                onClick={() => handleSetCover(index)}
                disabled={disabled || uploading}
                style={{
                  border: "none",
                  padding: 0,
                  background: "transparent",
                  width: "100%",
                  cursor: disabled ? "not-allowed" : "pointer",
                }}
                title="Set as cover"
              >
                <Image
                  unoptimized
                  width={212}
                  height={194}
                  className="w-100 bdrs12 cover"
                  src={img.url}
                  alt={img.alt || `Uploaded Image ${index + 1}`}
                />
              </button>

              {/* Cover badge */}
              {safeCover?.url === img.url && (
                <span
                  style={{
                    position: "absolute",
                    top: 8,
                    left: 8,
                    background: "#eb6753",
                    color: "#fff",
                    fontSize: 11,
                    padding: "4px 8px",
                    borderRadius: 999,
                    fontWeight: 700,
                  }}
                >
                  Cover
                </span>
              )}

              <button
                style={{ border: "none" }}
                className="tag-del"
                title="Delete Image"
                onClick={() => handleDelete(index)}
                type="button"
                data-tooltip-id={`delete-${index}`}
                disabled={disabled || uploading}
              >
                <span className="fas fa-trash-can" />
              </button>

              <ReactTooltip id={`delete-${index}`} place="right" content="Delete Image" />
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default UploadPhotoGallery;