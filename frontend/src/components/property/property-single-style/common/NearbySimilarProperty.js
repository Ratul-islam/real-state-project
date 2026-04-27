"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import { getListings } from "@/services/listing/listings.service";

// --- small helpers ---
const toNumber = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

// Formats money based on currency
const formatMoney = (val, currency = "BDT") => {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(val);
  } catch {
    return `৳${val}`;
  }
};

// Calculates a -30% to +30% range based on either a fixed amount or a min/max range
const moneyRange = (pricingOrPrice) => {
  let baseMin = 0;
  let baseMax = 0;

  // Handle if an object (like property.pricing) is passed
  if (typeof pricingOrPrice === "object" && pricingOrPrice !== null) {
    const amt = toNumber(pricingOrPrice.amount);
    const pMin = toNumber(pricingOrPrice.min);
    const pMax = toNumber(pricingOrPrice.max);

    if (amt > 0) {
      baseMin = amt;
      baseMax = amt;
    } else if (pMin > 0 && pMax > 0) {
      baseMin = pMin;
      baseMax = pMax;
    } else if (pMin > 0) {
      baseMin = pMin;
      baseMax = pMin;
    } else if (pMax > 0) {
      baseMin = pMax;
      baseMax = pMax;
    }
  } else {
    // Handle fallback if just a flat price number/string is passed
    const p = toNumber(pricingOrPrice);
    if (p > 0) {
      baseMin = p;
      baseMax = p;
    }
  }

  if (!baseMin && !baseMax) return { min: 0, max: 0 };

  // Widen the bounds by 30% for the query
  const min = Math.max(0, Math.floor(baseMin * 0.7));
  const max = Math.ceil(baseMax * 1.3);

  return { min, max };
};

const adaptListing = (l) => {
  const currency = l?.currency || "BDT";

  console.log(l)

  const amt = toNumber(l?.pricing?.amount);
  const min = toNumber(l?.pricing?.min);
  const max = toNumber(l?.pricing?.max);

  let priceStr = "Price on Request";
  let priceNumber = 0; // Baseline for internal logic if needed

  // Handle Display Formatting for Amount vs Range
  if (amt > 0) {
    priceStr = formatMoney(amt, currency);
    priceNumber = amt;
  } else if (min > 0 && max > 0) {
    priceStr = `${formatMoney(min, currency)} - ${formatMoney(max, currency)}`;
    priceNumber = (min + max) / 2; // Store average for single-number logic
  } else if (min > 0) {
    priceStr = `From ${formatMoney(min, currency)}`;
    priceNumber = min;
  } else if (max > 0) {
    priceStr = `Up to ${formatMoney(max, currency)}`;
    priceNumber = max;
  }

  return {
    id: l?._id || l?.id,
    title: l?.title || "Untitled",
    image: l?.media?.cover?.url || l?.media?.gallery?.[0]?.url || "/images/listings/default.jpg",
    location: l?.locationText || l?.city || "",
    city: l?.city || "",
    forRent: Boolean(l?.forRent),
    bed: toNumber(l?.beds),
    bath: toNumber(l?.baths),
    sqft: toNumber(l?.sqft),
    price: priceStr,
    priceNumber, 
    currency,
  };
};

const NearbySimilarProperty = ({ property }) => {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);

  const propertyId = property?._id || property?.id || "";
  const city = property?.city || "";
  const propertyType = property?.propertyType || "";
  const forRent = property?.forRent;

  // Pass either the pricing object or the flat price fallback to get bounds
  const { min: minPrice, max: maxPrice } = useMemo(
    () => moneyRange(property?.pricing || property?.price),
    [property?.pricing, property?.price]
  );

  // Build “similar” query for your API
  const query = useMemo(() => {
    const q = {};
    if (typeof forRent === "boolean") q.forRent = String(forRent);

    // Match city if available
    if (city) q.city = city;

    // Match property type if available
    if (propertyType) q.propertyType = propertyType;

    // keep it small; you can increase later
    q.limit = "10";
    q.page = "1";

    // sort newest / relevant
    q.sort = "createdAt";
    q.order = "desc";

    return q;
  }, [forRent, city, propertyType, minPrice, maxPrice]);

  useEffect(() => {
    let alive = true;

    const run = async () => {
      if (!propertyId) return;

      setLoading(true);
      try {
        const res = await getListings(query);

        // your response format: { status, message, data: { items } }
        const raw = res?.data?.items || res?.items || [];
        
        const adapted = raw
          .map(adaptListing)
          .filter((x) => x.id && x.id !== propertyId);
        console.log(adapted)
        if (alive) setItems(adapted);
      } catch (e) {
        console.error("Failed to load similar listings", e);
        if (alive) setItems([]);
      } finally {
        if (alive) setLoading(false);
      }
    };

    run();
    return () => {
      alive = false;
    };
  }, [propertyId, query]);

  console.log(items)
  if (!propertyId) return null;

  if (loading) {
    return <div className="p-3">Loading similar properties…</div>;
  }

  if (!items.length) {
    return <div className="p-3">No similar properties found.</div>;
  }


  return (
    <Swiper
      spaceBetween={30}
      modules={[Navigation, Pagination]}
      navigation={{
        nextEl: ".featured-next__active",
        prevEl: ".featured-prev__active",
      }}
      pagination={{
        el: ".featured-pagination__active",
        clickable: true,
      }}
      slidesPerView={1}
      breakpoints={{
        300: { slidesPerView: 1 },
        768: { slidesPerView: 2 },
        1024: { slidesPerView: 2 },
        1200: { slidesPerView: 3 },
      }}
    >
      {items.slice(0, 8).map((listing) => (
        <SwiperSlide key={listing.id}>
          <div className="item">
            <div className="listing-style1">
              <div className="list-thumb">
                <Image
                  width={382}
                  height={248}
                  className="w-100 h-100 cover"
                  src={listing.image}
                  alt={listing.title}
                  unoptimized
                />

                <div className="sale-sticker-wrap">
                  {!listing.forRent && (
                    <div className="list-tag rounded-0 fz12">
                      <span className="flaticon-electricity" />
                      FEATURED
                    </div>
                  )}
                </div>

                <div className="list-price">
                  {listing.price}
                  {listing.forRent ? (
                    <>
                      {" "}
                      / <span>mo</span>
                    </>
                  ) : null}
                </div>
              </div>

              <div className="list-content">
                <h6 className="list-title">
                  <Link href={`/single/${listing.id}`}>{listing.title}</Link>
                </h6>

                <p className="list-text">{listing.location}</p>

                <div className="list-meta d-flex align-items-center">
                  <span>
                    <span className="flaticon-bed" /> {listing.bed} bed
                  </span>
                  <span>
                    <span className="flaticon-shower" /> {listing.bath} bath
                  </span>
                  <span>
                    <span className="flaticon-expand" /> {listing.sqft} sqft
                  </span>
                </div>

                <hr className="mt-2 mb-2" />

                <div className="list-meta2 d-flex justify-content-between align-items-center">
                  <span className="for-what">
                    {listing.forRent ? "For Rent" : "For Sale"}
                  </span>

                  <div className="icons d-flex gap-2 align-items-center" >
                    <div>
                      <span className="flaticon-fullscreen" />
                    </div>
                    <div>
                      <span className="flaticon-new-tab" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default NearbySimilarProperty;