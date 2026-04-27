"use client";

import React, { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

const DEFAULT_CURRENCY = "BDT";

const formatMoney = (n, currency = DEFAULT_CURRENCY) => {
  const num = Number(n);
  if (!Number.isFinite(num)) return "—";
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(num);
  } catch {
    // fallback if currency code is invalid
    return `${currency} ${Math.round(num)}`;
  }
};

const getPricingLabel = (listing) => {
  const pr = listing?.pricing;

  // fixed
  if (pr && typeof pr.amount === "number") {
    return formatMoney(pr.amount, pr.currency || DEFAULT_CURRENCY);
  }

  // range
  if (pr && typeof pr.min === "number" && typeof pr.max === "number") {
    const cur = pr.currency || DEFAULT_CURRENCY;
    return `${formatMoney(pr.min, cur)} - ${formatMoney(pr.max, cur)}`;
  }

  // backward-compat fallback (if some old docs still have price/currency)
  if (listing?.price !== undefined && listing?.price !== null) {
    return formatMoney(listing.price, listing?.currency || DEFAULT_CURRENCY);
  }

  return "—";
};

const getPricingNumbers = (listing) => {
  const pr = listing?.pricing;

  if (pr && typeof pr.amount === "number") {
    return { min: pr.amount, max: pr.amount, currency: pr.currency || DEFAULT_CURRENCY };
  }

  if (pr && typeof pr.min === "number" && typeof pr.max === "number") {
    return { min: pr.min, max: pr.max, currency: pr.currency || DEFAULT_CURRENCY };
  }

  if (listing?.price !== undefined && listing?.price !== null) {
    const amt = Number(listing.price);
    return {
      min: Number.isFinite(amt) ? amt : 0,
      max: Number.isFinite(amt) ? amt : 0,
      currency: listing?.currency || DEFAULT_CURRENCY,
    };
  }

  return { min: 0, max: 0, currency: DEFAULT_CURRENCY };
};

const getCoverUrl = (listing) =>
  listing?.media?.cover?.url ||
  listing?.cover?.url ||
  listing?.image ||
  "/images/listings/property-detail-pic.jpg";

const FeaturedListings = ({ listings = [] }) => {
  const data = useMemo(() => {
    const arr = Array.isArray(listings) ? listings : [];
    return arr.slice(0, 6);
  }, [listings]);

  return (
    <>
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
        {data.map((listing) => {
          const id = listing?._id || listing?.id;
          const title = listing?.title || "Untitled";
          const slug = listing?.slug;
          const location =
            listing?.locationText || listing?.location || listing?.city || "";

          const beds = Number(listing?.beds ?? listing?.bed ?? 0);
          const baths = Number(listing?.baths ?? listing?.bath ?? 0);
          const sqft = Number(listing?.sqft ?? 0);

          const priceLabel = getPricingLabel(listing);
          const prNums = getPricingNumbers(listing);

          // for per-sqft: use min (if range) so it stays sane
          const perSqft =
            Number.isFinite(prNums.min) && prNums.min > 0 && sqft > 0
              ? (prNums.min / sqft).toFixed(2)
              : null;

          const href = id ? `/single/${slug}` : "#";
          const imageUrl = getCoverUrl(listing);

          return (
            <SwiperSlide key={id || `${title}-${imageUrl}`}>
              <div className="item">
                <div className="listing-style1">
                  <div className="list-thumb">
                    <Image
                      width={382}
                      height={248}
                      className="w-100 h-100 cover"
                      src={imageUrl}
                      alt={listing?.media?.cover?.alt || title}
                      unoptimized
                    />

                    <div className="sale-sticker-wrap">
                      {!!listing?.featured && (
                        <div className="list-tag fz12">
                          <span className="flaticon-electricity me-2" />
                          FEATURED
                        </div>
                      )}
                    </div>

                    <div className="list-price">
                      {priceLabel}
                      {listing?.forRent ? (
                        <>
                          {" "}
                          / <span>mo</span>
                        </>
                      ) : null}
                    </div>
                  </div>

                  <div className="list-content">
                    <h6 className="list-title">
                      {id ? <Link href={href}>{title}</Link> : title}
                    </h6>

                    <p className="list-text">{location}</p>

                    <div className="list-meta d-flex align-items-center">
                      <span className="me-3">
                        <span className="flaticon-bed" /> {beds} bed
                      </span>
                      <span className="me-3">
                        <span className="flaticon-shower" /> {baths} bath
                      </span>
                      <span>
                        <span className="flaticon-expand" /> {sqft} sqft
                      </span>
                    </div>

                    <hr className="mt-2 mb-2" />

                    <div className="list-meta2 d-flex justify-content-between align-items-center">
                      <span className="for-what">
                        {listing?.forRent ? "For Rent" : "For Sale"}
                      </span>

                      <div className="icons d-flex align-items-center">
                        <span title={perSqft ? `${perSqft} ${prNums.currency}/sqft` : ""}>
                          <span
                            className="flaticon-fullscreen"
                            style={{ marginRight: "10px" }}
                          />
                        </span>
                        <span>
                          <span className="flaticon-new-tab" />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>

      <div className="row align-items-center justify-content-center">
        <div className="col-auto">
          <button className="featured-prev__active swiper_button" type="button">
            <i className="far fa-arrow-left-long" />
          </button>
        </div>

        <div className="col-auto">
          <div className="pagination swiper--pagination featured-pagination__active" />
        </div>

        <div className="col-auto">
          <button className="featured-next__active swiper_button" type="button">
            <i className="far fa-arrow-right-long" />
          </button>
        </div>
      </div>
    </>
  );
};

export default FeaturedListings;