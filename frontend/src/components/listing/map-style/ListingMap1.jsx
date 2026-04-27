"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  GoogleMap,
  Marker,
  MarkerClusterer,
  InfoWindow,
  useLoadScript,
} from "@react-google-maps/api";
import Image from "next/image";
import Link from "next/link";

const options = {
  zoomControl: true,
  disableDefaultUI: true,
  scrollwheel: true,
  styles: [
    { featureType: "all", elementType: "geometry.fill", stylers: [{ weight: "2.0" }] },
    { featureType: "all", elementType: "geometry.stroke", stylers: [{ color: "#9c9c9c" }] },
    { featureType: "all", elementType: "labels.text", stylers: [{ visibility: "on" }] },
    { featureType: "landscape", elementType: "all", stylers: [{ color: "#f2f2f2" }] },
    { featureType: "landscape", elementType: "geometry.fill", stylers: [{ color: "#ffffff" }] },
    { featureType: "landscape.man_made", elementType: "geometry.fill", stylers: [{ color: "#ffffff" }] },
    { featureType: "poi", elementType: "all", stylers: [{ visibility: "off" }] },
    { featureType: "road", elementType: "all", stylers: [{ saturation: -100 }, { lightness: 45 }] },
    { featureType: "road", elementType: "geometry.fill", stylers: [{ color: "#eeeeee" }] },
    { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#7b7b7b" }] },
    { featureType: "road", elementType: "labels.text.stroke", stylers: [{ color: "#ffffff" }] },
    { featureType: "road.highway", elementType: "all", stylers: [{ visibility: "simplified" }] },
    { featureType: "road.arterial", elementType: "labels.icon", stylers: [{ visibility: "off" }] },
    { featureType: "transit", elementType: "all", stylers: [{ visibility: "off" }] },
    { featureType: "water", elementType: "all", stylers: [{ color: "#46bcec" }, { visibility: "on" }] },
    { featureType: "water", elementType: "geometry.fill", stylers: [{ color: "#c8d7d4" }] },
    { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#070707" }] },
    { featureType: "water", elementType: "labels.text.stroke", stylers: [{ color: "#ffffff" }] },
  ],
};

const containerStyle = { width: "100%", height: "100%" };

const toNumber = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

function extractCoords(item) {
  const lat1 = toNumber(item?.lat);
  const lng1 = toNumber(item?.lng ?? item?.long);

  const coords = Array.isArray(item?.geo?.coordinates) ? item.geo.coordinates : null;
  const lng2 = coords ? toNumber(coords[0]) : null;
  const lat2 = coords ? toNumber(coords[1]) : null;

  const lat = lat1 ?? lat2;
  const lng = lng1 ?? lng2;

  if (lat == null || lng == null) return null;
  if (lat === 0 && lng === 0) return null;
  if (lat > 90 || lat < -90) return null;
  if (lng > 180 || lng < -180) return null;

  return { lat, lng };
}

function formatMoney(price, currency = "USD") {
  const n = Number(price ?? 0);
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(n);
  } catch {
    return `$${n}`;
  }
}

export default function ListingMap1({
  data = [],
  selectedCoords = null,
}) {
  const [selected, setSelected] = useState(null);
  const mapRef = useRef(null);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  });

  const points = useMemo(() => {
    return (Array.isArray(data) ? data : [])
      .map((item) => {
        const c = extractCoords(item);
        if (!c) return null;
        return { item, coords: c, id: item?._id ?? item?.id };
      })
      .filter(Boolean);
  }, [data]);

  const fallbackCenter = useMemo(() => ({ lat: 23.8103, lng: 90.4125 }), []);

  useEffect(() => {
    if (!mapRef.current || !isLoaded) return;
    if (!points.length) return;

    const bounds = new window.google.maps.LatLngBounds();
    points.forEach((p) => bounds.extend(p.coords));
    mapRef.current.fitBounds(bounds);

    if (points.length === 1) mapRef.current.setZoom(14);
  }, [isLoaded, points]);

  useEffect(() => {
    if (!mapRef.current || !isLoaded) return;
    if (!selectedCoords) return;

    const lat = toNumber(selectedCoords.lat);
    const lng = toNumber(selectedCoords.lng);
    if (lat == null || lng == null) return;

    mapRef.current.panTo({ lat, lng });
    mapRef.current.setZoom(15);
  }, [isLoaded, selectedCoords]);

  if (loadError) return <div>Failed to load Google Maps</div>;
  if (!isLoaded) return <p>Loading...</p>;

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={points[0]?.coords ?? fallbackCenter}
      zoom={points.length ? 12 : 11}
      options={options}
      onLoad={(map) => (mapRef.current = map)}
      onUnmount={() => (mapRef.current = null)}
    >
      <MarkerClusterer>
        {(clusterer) =>
          points.map(({ item, coords, id }) => (
            <Marker
              key={id}
              position={coords}
              clusterer={clusterer}
              onClick={() => setSelected({ item, coords })}
            />
          ))
        }
      </MarkerClusterer>

      {selectedCoords?.lat != null && selectedCoords?.lng != null && (
        <Marker
          position={{
            lat: Number(selectedCoords.lat),
            lng: Number(selectedCoords.lng),
          }}
        />
      )}

      {selected && (
        <InfoWindow
          position={selected.coords}
          onCloseClick={() => setSelected(null)}
        >
          <div style={{ maxWidth: 320 }}>
            {/* Header */}
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 12, opacity: 0.75 }}>
                {(selected.item?.propertyType ?? "Property") +
                  " • " +
                  (selected.item?.forRent ? "For Rent" : "For Sale")}
              </div>

              <div style={{ fontWeight: 700, fontSize: 16, marginTop: 2 }}>
                {selected.item?.title ?? "Untitled"}
              </div>

              <div style={{ marginTop: 4, fontWeight: 700 }}>
                {selected.item?.priceNumber != null
                  ? formatMoney(selected.item.priceNumber, selected.item?.currency ?? "USD")
                  : selected.item?.price ?? ""}
                {selected.item?.forRent ? " / modjhdfj" : ""}
              </div>

              <div style={{ fontSize: 12, marginTop: 4, opacity: 0.8 }}>
                {selected.item?.locationText ?? selected.item?.location ?? ""}{" "}
                {selected.item?.city ? `• ${selected.item.city}` : ""}
              </div>
            </div>

            {/* Image */}
            {(
              selected.item?.media?.cover?.url ||
              selected.item?.image
            ) && (
              <div style={{ borderRadius: 10, overflow: "hidden", marginBottom: 10 }}>
                <Image
                unoptimized
                  width={382}
                  height={248}
                  style={{ width: "100%", height: 160, objectFit: "cover" }}
                  src={selected.item?.media?.cover?.url ?? selected.item?.image}
                  alt={selected.item?.media?.cover?.alt ?? "listing"}
                />
              </div>
            )}

            {/* Stats */}
            <div style={{ display: "flex", gap: 12, fontSize: 12, marginBottom: 8 }}>
              <span>🛏 {Number(selected.item?.bed ?? selected.item?.beds ?? 0)}</span>
              <span>🛁 {Number(selected.item?.bath ?? selected.item?.baths ?? 0)}</span>
              <span>📐 {Number(selected.item?.sqft ?? 0)} sqft</span>
            </div>

            {/* Extra info */}
            <div style={{ fontSize: 12, opacity: 0.85, marginBottom: 10 }}>
              {selected.item?.yearBuilding ? <>Built: {selected.item.yearBuilding}</> : null}
              {selected.item?.businessType ? <> • {selected.item.businessType}</> : null}
            </div>

            {/* Features (top 5) */}
            {Array.isArray(selected.item?.features) && selected.item.features.length > 0 && (
              <div style={{ fontSize: 12, marginBottom: 10 }}>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>Features</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {selected.item.features.slice(0, 5).map((f) => (
                    <span
                      key={f}
                      style={{
                        padding: "3px 8px",
                        borderRadius: 999,
                        background: "rgba(0,0,0,0.06)",
                      }}
                    >
                      {f}
                    </span>
                  ))}
                  {selected.item.features.length > 5 && (
                    <span style={{ opacity: 0.7 }}>
                      +{selected.item.features.length - 5} more
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* CTA */}
            <div style={{ display: "flex", gap: 8 }}>
              <Link
                className="ud-btn btn-thm"
                href={`/single/${selected.item?.slug ?? selected.item?.slug}`}
              >
                View details
              </Link>
              <a
                className="ud-btn btn-light"
                target="_blank"
                rel="noreferrer"
                href={`https://www.google.com/maps?q=${selected.coords.lat},${selected.coords.lng}`}
              >
                Open in Maps
              </a>
            </div>

            <div style={{ marginTop: 8, fontSize: 11, opacity: 0.6 }}>
              {selected.coords.lat.toFixed(6)}, {selected.coords.lng.toFixed(6)}
            </div>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
}
