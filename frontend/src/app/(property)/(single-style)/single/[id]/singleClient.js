"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import DefaultHeader from "@/components/common/DefaultHeader";
import Footer from "@/components/common/default-footer";
import MobileMenu from "@/components/common/mobile-menu";

import FloorPlans from "@/components/property/property-single-style/common/FloorPlans";
import NearbySimilarProperty from "@/components/property/property-single-style/common/NearbySimilarProperty";
import PropertyAddress from "@/components/property/property-single-style/common/PropertyAddress";
import PropertyDetails from "@/components/property/property-single-style/common/PropertyDetails";
import PropertyFeaturesAminites from "@/components/property/property-single-style/common/PropertyFeaturesAminites";
import PropertyVideo from "@/components/property/property-single-style/common/PropertyVideo";
import ProperytyDescriptions from "@/components/property/property-single-style/common/ProperytyDescriptions";

import OverView from "@/components/property/property-single-style/single-v2/OverView";
import ContactWithAgent from "@/components/property/property-single-style/single-v2/ContactWithAgent";
import PropertyGallery from "@/components/property/property-single-style/single-v2/PropertyGallery";
import PropertyHeader from "@/components/property/property-single-style/single-v2/PropertyHeader";
import ScheduleForm from "@/components/property/property-single-style/single-v2/ScheduleForm";

import { getListingById, getListingBySlug } from "@/services/listing/listings.service";
import { trackListingEvent } from "@/services/analytics/analytics.service";

const LoaderBlock = () => (
  <section className="pt60 pb90 bgc-f7">
    <div className="container">
      <div className="ps-widget bgc-white bdrs12 default-box-shadow2 p30 mb30 overflow-hidden position-relative">
        <h4 className="title fz17 mb10">Loading property...</h4>
        <p className="text mb0">Please wait a moment.</p>
      </div>
    </div>
  </section>
);

const ErrorBlock = ({ message }) => (
  <section className="pt60 pb90 bgc-f7">
    <div className="container">
      <div className="ps-widget bgc-white bdrs12 default-box-shadow2 p30 mb30 overflow-hidden position-relative">
        <h4 className="title fz17 mb10">Could not load property</h4>
        <p className="text mb0">{message || "Something went wrong."}</p>
      </div>
    </div>
  </section>
);

const VISITOR_KEY = "visitor_id_v1";

function makeVisitorId() {
  const rand = Math.random().toString(36).slice(2);
  const time = Date.now().toString(36);
  return `v_${time}${rand}`.slice(0, 24);
}

function getOrCreateVisitorId() {
  try {
    const existing = window.localStorage.getItem(VISITOR_KEY);
    if (existing && existing.length >= 6) return existing;

    const created = makeVisitorId();
    window.localStorage.setItem(VISITOR_KEY, created);
    return created;
  } catch {
    return makeVisitorId();
  }
}

const isObjectIdLike = (v) => /^[a-f\d]{24}$/i.test(String(v || "").trim());

const decodeSlugToTitle = (slugOrTitle) => {
  const s = String(slugOrTitle || "").trim();
  if (!s) return "";
  try {
    return decodeURIComponent(s).replace(/\+/g, " ").trim();
  } catch {
    return s.replace(/\+/g, " ").trim();
  }
};

const singleClient = ({ id }) => {
  const [loading, setLoading] = useState(true);
  const [property, setProperty] = useState(null);
  const [error, setError] = useState("");

  const visitorIdRef = useRef(null);
  const trackedPageViewRef = useRef(false);

  useEffect(() => {
    visitorIdRef.current = getOrCreateVisitorId();
  }, []);

  const track = useCallback(
    async (type, extra = {}) => {
      try {
        const listingId = String(property?._id || property?.id || "");
        const visitorId = String(visitorIdRef.current || "");

        if (!listingId) return;
        if (!visitorId || visitorId.length < 6) return;

        await trackListingEvent({
          listingId,
          type,
          visitorId,
          referrer: document?.referrer || "",
          userAgent: navigator?.userAgent || "",
          ...extra,
        });
      } catch (e) {}
    },
    [property]
  );

  const onNewTabClick = () =>
    track("share_click", { channel: "ui_button", action: "new_tab" });

  useEffect(() => {
    let alive = true;

    const run = async () => {
      setLoading(true);
      setError("");
      trackedPageViewRef.current = false;

      try {
        const raw = String(id || "").trim();
        if (!raw) throw new Error("Missing property identifier.");

        const res = isObjectIdLike(raw)
          ? await getListingById(raw)
          : await getListingBySlug(decodeSlugToTitle(raw));

        const listing = res?.data ?? res;

        if (!listing?._id && !listing?.id) {
          throw new Error("Property not found.");
        }

        if (alive) setProperty(listing);
      } catch (e) {
        if (alive) {
          setError(
            e?.response?.data?.message ||
              e?.message ||
              "Failed to load property."
          );
        }
      } finally {
        if (alive) setLoading(false);
      }
    };

    run();
    return () => {
      alive = false;
    };
  }, [id]);

  useEffect(() => {
    if (loading) return;
    if (error) return;
    if (!property) return;
    if (trackedPageViewRef.current) return;

    trackedPageViewRef.current = true;

    track("page_view", {
      page: "listing_single",
      path: typeof window !== "undefined" ? window.location.pathname : "",
      title: property?.title || "",
      city: property?.city || "",
    });
  }, [loading, error, property, track]);

  const onContactClick = () => track("contact_click");
  const onShareClick = () => track("share_click", { channel: "ui_button" });

  return (
    <>
      <DefaultHeader />
      <MobileMenu />

      {loading ? (
        <LoaderBlock />
      ) : error ? (
        <ErrorBlock message={error} />
      ) : (
        <>
          <section className="pt60 pb0 bgc-white">
            <div className="container">
              <div className="row">
                <PropertyHeader
                  id={property?._id || property?.id}
                  property={property}
                  onShareClick={onShareClick}
                  onNewTabClick={onNewTabClick}
                />
              </div>

              <div className="row mb30 mt30">
                <PropertyGallery
                  id={property?._id || property?.id}
                  property={property}
                />
              </div>

              <div className="row mt30">
                <OverView id={property?._id || property?.id} property={property} />
              </div>
            </div>
          </section>

          <section className="pt60 pb90 bgc-f7">
            <div className="container">
              <div className="row wrap">
                <div className="col-lg-8">
                  <div className="ps-widget bgc-white bdrs12 default-box-shadow2 p30 mb30 overflow-hidden position-relative">
                    <h4 className="title fz17 mb30">Property Description</h4>
                    <ProperytyDescriptions property={property} />

                    <h4 className="title fz17 mb30 mt50">Property Details</h4>
                    <div className="row">
                      <PropertyDetails property={property} />
                    </div>
                  </div>

                  <div className="ps-widget bgc-white bdrs12 default-box-shadow2 p30 mb30 overflow-hidden position-relative">
                    <h4 className="title fz17 mb30 mt30">Address</h4>
                    <div className="row">
                      <PropertyAddress property={property} />
                    </div>
                  </div>

                  <div className="ps-widget bgc-white bdrs12 default-box-shadow2 p30 mb30 overflow-hidden position-relative">
                    <h4 className="title fz17 mb30">Features &amp; Amenities</h4>
                    <div className="row">
                      <PropertyFeaturesAminites property={property} />
                    </div>
                  </div>

                  <div className="ps-widget bgc-white bdrs12 default-box-shadow2 p30 mb30 overflow-hidden position-relative">
                    <h4 className="title fz17 mb30">Floor Plans</h4>
                    <div className="row">
                      <div className="col-md-12">
                        <div className="accordion-style1 style2">
                          <FloorPlans property={property} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {property?.media?.video?.url && (
                    <div className="ps-widget bgc-white bdrs12 default-box-shadow2 p30 mb30">
                      <h4 className="title fz17 mb30">Video</h4>
                      <div className="row">
                        <PropertyVideo property={property} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Sidebar - Contact Agent */}
                <div className="col-lg-4">
                  <div className="column">
                    <div className="default-box-shadow1 bdrs12 bdr1 p30 mb30-md bgc-white position-relative">
                      <h6 className="title fz17 mb30">
                        {property?.agent ? "Contact Agent" : "Get More Information"}
                      </h6>
                      <ContactWithAgent
                        property={property}
                        agent={property?.agent} 
                        onContactClick={onContactClick}
                      />
                      
                      <ScheduleForm
                        property={property}
                        agent={property?.agent}
                        onContactClick={onContactClick}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Featured Listings Carousel (Unchanged) */}
              <div className="row mt30 align-items-center justify-content-between">
                <div className="col-auto">
                  <div className="main-title">
                    <h2 className="title">Discover Our Featured Listings</h2>
                    {/* <p className="paragraph">Aliquam lacinia diam quis lacus euismod</p> */}
                  </div>
                </div>

                <div className="col-auto mb30">
                  <div className="row align-items-center justify-content-center">
                    <div className="col-auto">
                      <button className="featured-prev__active swiper_button">
                        <i className="far fa-arrow-left-long" />
                      </button>
                    </div>

                    <div className="col-auto">
                      <div className="pagination swiper--pagination featured-pagination__active" />
                    </div>

                    <div className="col-auto">
                      <button className="featured-next__active swiper_button">
                        <i className="far fa-arrow-right-long" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-lg-12">
                  <div className="property-city-slider">
                    <NearbySimilarProperty property={property} />
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="footer-style1 pt60 pb-0">
            <Footer />
          </section>
        </>
      )}
    </>
  );
};

export default singleClient;