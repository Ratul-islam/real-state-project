"use client";

import React, { useMemo } from "react";
import { GoogleMap, useLoadScript, MarkerF } from "@react-google-maps/api";

const isGood = (v) => Number.isFinite(Number(v));

function getLatLng(property) {
  // prefer geo (new backend normalization sets geo)
  const coords = Array.isArray(property?.geo?.coordinates)
    ? property.geo.coordinates
    : null;

  if (coords?.length >= 2 && isGood(coords[0]) && isGood(coords[1])) {
    const lng = Number(coords[0]);
    const lat = Number(coords[1]);
    if (!(lat === 0 && lng === 0)) return { lat, lng };
  }

  // fallback if lat/lng are still present in response
  if (isGood(property?.lat) && isGood(property?.lng)) {
    const lat = Number(property.lat);
    const lng = Number(property.lng);
    if (!(lat === 0 && lng === 0)) return { lat, lng };
  }

  return null;
}

const mapContainerStyle = {
  width: "100%",
  height: 260,
  borderRadius: 12,
  overflow: "hidden",
};

const mapOptions = {
  disableDefaultUI: true,
  zoomControl: false,
  clickableIcons: false,
  gestureHandling: "greedy",
  styles: [
    { featureType: "poi", stylers: [{ visibility: "off" }] },
    { featureType: "transit", stylers: [{ visibility: "off" }] },
    { featureType: "road", elementType: "geometry", stylers: [{ lightness: 35 }] },
    { featureType: "water", elementType: "geometry", stylers: [{ lightness: 10 }] },
    {
      featureType: "administrative",
      elementType: "labels.text.fill",
      stylers: [{ lightness: 20 }],
    },
  ],
};

const Field = ({ label, value }) => (
  <div className="d-flex justify-content-between gap-3">
    <div className="fw600 ff-heading dark-color">{label}</div>
    <div className="text">{value || "—"}</div>
  </div>
);

const PropertyAddress = ({ property }) => {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: apiKey,
  });

  const latLng = useMemo(() => getLatLng(property), [property]);

  // ✅ updated schema fields
  const addressLine = property?.locationText || "";
  const city = property?.city || "";
  const thana = property?.thana || "";
  const neighborhood = property?.neighborhood || "";
  const zip = property?.zip || "";

  const mapsQuery = latLng
    ? `${latLng.lat},${latLng.lng}`
    : [addressLine, neighborhood, thana, city, zip].filter(Boolean).join(", ");

  const openMapsUrl = mapsQuery
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapsQuery)}`
    : "#";

  const fallbackCenter = { lat: 23.78000285364817, lng: 90.37149088261403 };
  const center = latLng || fallbackCenter;

  return (
    <>
      {/* Top info grid */}
      <div className="col-12">
        <div className="row g-3">
          <div className="col-md-6">
            <div className="d-grid gap-2">
              <Field label="Address" value={addressLine} />
              <Field label="City" value={city} />
              <Field label="Thana" value={thana} />
            </div>
          </div>

          <div className="col-md-6">
            <div className="d-grid gap-2">
              <Field label="Neighborhood" value={neighborhood} />
              <Field label="Zip" value={zip} />
              <Field label="Coordinates" value={latLng ? `${center.lat}, ${center.lng}` : ""} />
            </div>
          </div>
        </div>
      </div>

      {/* Map card */}
      <div className="col-12">
        <div
          style={{
            marginTop: 22,
            background: "#dcebf7",
            borderRadius: 12,
            padding: 14,
          }}
        >
          <div style={{ position: "relative" }}>
            <a
              href={openMapsUrl}
              target="_blank"
              rel="noreferrer"
              style={{
                position: "absolute",
                right: 14,
                top: 14,
                zIndex: 5,
                background: "#fff",
                color: "#0f172a",
                textDecoration: "none",
                fontWeight: 600,
                fontSize: 14,
                padding: "10px 14px",
                borderRadius: 12,
                boxShadow: "0 10px 25px rgba(0,0,0,0.12)",
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              Open on Google Maps
              <span style={{ fontSize: 16, lineHeight: 1 }} aria-hidden>
                ↗
              </span>
            </a>

            {/* Center marker button */}
            <button
              type="button"
              aria-label="Center marker"
              onClick={() => {
                window.open(openMapsUrl, "_blank", "noopener,noreferrer");
              }}
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
                zIndex: 5,
                width: 56,
                height: 56,
                borderRadius: "50%",
                border: "none",
                background: "#0b1220",
                boxShadow: "0 18px 35px rgba(0,0,0,0.18)",
                display: "grid",
                placeItems: "center",
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 10,
                  border: "2px solid rgba(255,255,255,0.85)",
                  display: "grid",
                  placeItems: "center",
                }}
              >
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.85)",
                  }}
                />
              </div>
            </button>

            {/* Map */}
            <div style={mapContainerStyle}>
              {!apiKey ? (
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    background: "#e9eef5",
                    display: "grid",
                    placeItems: "center",
                    color: "#334155",
                    fontSize: 14,
                    borderRadius: 12,
                  }}
                >
                  Missing NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
                </div>
              ) : !isLoaded ? (
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    background: "#e9eef5",
                    display: "grid",
                    placeItems: "center",
                    color: "#334155",
                    fontSize: 14,
                    borderRadius: 12,
                  }}
                >
                  Loading map…
                </div>
              ) : (
                <GoogleMap
                  mapContainerStyle={{ width: "100%", height: "100%" }}
                  center={center}
                  zoom={latLng ? 15 : 12}
                  options={mapOptions}
                >
                  {/* ✅ actual marker so the location is obvious */}
                  {latLng ? <MarkerF position={latLng} /> : null}
                </GoogleMap>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PropertyAddress;