"use client";

import React, { useMemo } from "react";

const DEFAULT_CURRENCY = "BDT";

const formatPricing = (pricing, fallbackCurrency = DEFAULT_CURRENCY) => {
  if (!pricing || typeof pricing !== "object") return "—";

  const currency = pricing.currency || fallbackCurrency;

  const fmt = (n) => {
    if (!Number.isFinite(Number(n))) return null;
    try {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
        maximumFractionDigits: 0,
      }).format(Number(n));
    } catch {
      // fallback if currency code invalid
      return `${currency} ${Number(n).toLocaleString()}`;
    }
  };

  // fixed
  if (Number.isFinite(Number(pricing.amount))) {
    return fmt(pricing.amount) ?? "—";
  }

  // range
  const hasMin = Number.isFinite(Number(pricing.min));
  const hasMax = Number.isFinite(Number(pricing.max));
  if (hasMin && hasMax) {
    const minStr = fmt(pricing.min);
    const maxStr = fmt(pricing.max);
    if (!minStr || !maxStr) return "—";
    return `${minStr} - ${maxStr}`;
  }

  return "—";
};

const PropertyDetails = ({ property }) => {
  const columns = useMemo(() => {
    if (!property) return [[], []];

    const id = property?._id || property?.id || "—";

    // ✅ new schema: property.pricing
    const price = formatPricing(property?.pricing, DEFAULT_CURRENCY);

    const sqft = Number(property?.sqft ?? 0);
    const beds = Number(property?.beds ?? 0);
    const baths = Number(property?.baths ?? 0);

    const garages = property?.garages; // ✅ new schema field
    const garageSize = property?.garageSize;

    return [
      [
        // { label: "Property ID", value: id },
        { label: "Price", value: price },
        { label: "Property Size", value: sqft > 0 ? `${sqft} Sq Ft` : "—" },
        { label: "Bathrooms", value: Number.isFinite(baths) ? baths : "—" },
        { label: "Bedrooms", value: Number.isFinite(beds) ? beds : "—" },
      ],
      [
        // ✅ fixed: garages (not garage)
        { label: "Garages", value: Number.isFinite(Number(garages)) ? garages : "—" },
        { label: "Garage Size", value: garageSize ? `${garageSize}` : "—" },
        { label: "Year Built", value: property?.yearBuilding || "—" },
        { label: "Property Type", value: property?.propertyType || "—" },
        { label: "Property Status", value: property?.forRent ? "For Rent" : "For Sale" },
      ],
    ];
  }, [property]);

  return (
    <div className="row">
      {columns.map((column, columnIndex) => (
        <div
          key={columnIndex}
          className={`col-md-6 col-xl-4${columnIndex === 1 ? " offset-xl-2" : ""}`}
        >
          {column.map((detail, index) => (
            <div key={index} className="d-flex justify-content-between">
              <div className="pd-list">
                <p className="fw600 mb10 ff-heading dark-color">{detail.label}</p>
              </div>
              <div className="pd-list">
                <p className="text mb10">{detail.value}</p>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default PropertyDetails;