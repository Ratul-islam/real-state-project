import React, { useMemo } from "react";
import Image from "next/image";

const DEFAULT_CURRENCY = "BDT";

function formatPricing(pricing) {
  if (!pricing || typeof pricing !== "object") return "N/A";

  const currency = pricing.currency || DEFAULT_CURRENCY;

  if (typeof pricing.amount === "number" && Number.isFinite(pricing.amount)) {
    return `${currency} ${pricing.amount.toLocaleString()}`;
  }

  const hasMin = typeof pricing.min === "number" && Number.isFinite(pricing.min);
  const hasMax = typeof pricing.max === "number" && Number.isFinite(pricing.max);

  if (hasMin && hasMax) {
    return `${currency} ${pricing.min.toLocaleString()} - ${pricing.max.toLocaleString()}`;
  }

  return "N/A";
}

const FloorPlans = ({ property }) => {
  const floorPlanData = useMemo(() => {
    const plans = Array.isArray(property?.floorPlans) ? property.floorPlans : [];
    console.log(property)
    return plans
      .map((p, idx) => {
        const asset = p?.image || {}; 
        const type = asset?.type === "pdf" ? "pdf" : "image";
        const url = typeof asset?.url === "string" ? asset.url.trim() : "";

        return {
          id: p.id || p._id || `floor-${idx + 1}`,
          title: p.title || `Floor Plan ${idx + 1}`,
          size: Number(p.sizeSqft) ? `${Number(p.sizeSqft)} Sqft` : "N/A",
          bedrooms: p.bedrooms ?? "N/A",
          bathrooms: p.bathrooms ?? "N/A",
          price: formatPricing(p.pricing),
          assetType: type,
          assetUrl: url,
          assetAlt: asset?.alt || p.title || `Floor plan ${idx + 1}`,
          pages: asset?.pages,
        };
      })
      .filter((x) => x.title); 
  }, [property]);

  if (!floorPlanData.length) {
    return <p className="text mb0">No floor plans available.</p>;
  }

  return (
    <div className="accordion" id="accordionExample">
      {floorPlanData.map((floorPlan, index) => {
        const open = index === 0; 

        return (
          <div className={`accordion-item ${open ? "active" : ""}`} key={floorPlan.id}>
            <h2 className="accordion-header" id={`heading${index}`}>
              <button
                className={`accordion-button ${open ? "" : "collapsed"}`}
                type="button"
                data-bs-toggle="collapse"
                data-bs-target={`#collapse${index}`}
                aria-expanded={open ? "true" : "false"}
                aria-controls={`collapse${index}`}
              >
                <span className="w-100 d-md-flex align-items-center">
                  <span className="mr10-sm">{floorPlan.title}</span>

                  <span className="ms-auto d-md-flex align-items-center justify-content-end">
                    <span className="me-2 me-md-4">
                      <span className="fw600">Size: </span>
                      <span className="text">{floorPlan.size}</span>
                    </span>

                    <span className="me-2 me-md-4">
                      <span className="fw600">Bedrooms </span>
                      <span className="text">{floorPlan.bedrooms}</span>
                    </span>

                    <span className="me-2 me-md-4">
                      <span className="fw600">Bathrooms </span>
                      <span className="text">{floorPlan.bathrooms}</span>
                    </span>

                    <span>
                      <span className="fw600">Price </span>
                      <span className="text">{floorPlan.price}</span>
                    </span>
                  </span>
                </span>
              </button>
            </h2>

            <div
              id={`collapse${index}`}
              className={`accordion-collapse collapse ${open ? "show" : ""}`}
              aria-labelledby={`heading${index}`}
              data-bs-parent="#accordionExample"
            >
              <div className="accordion-body text-center">
                {!floorPlan.assetUrl ? (
                  <p className="text mb0">No file uploaded for this floor plan.</p>
                ) : floorPlan.assetType === "pdf" ? (
                  <div style={{ maxWidth: 900, margin: "0 auto" }}>
                    <iframe
                      src={floorPlan.assetUrl}
                      title={`floor-plan-pdf-${floorPlan.id}`}
                      style={{
                        width: "100%",
                        height: 520,
                        border: "1px solid #eee",
                        borderRadius: 10,
                      }}
                    />
                    <div className="mt15">
                      <a
                        href={floorPlan.assetUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="ud-btn btn-theme"
                      >
                        Open PDF
                      </a>
                      {typeof floorPlan.pages === "number" && floorPlan.pages > 0 ? (
                        <span className="ms-3 text" style={{ fontSize: 13 }}>
                          Pages: {floorPlan.pages}
                        </span>
                      ) : null}
                    </div>
                  </div>
                ) : (
                  <Image
                    unoptimized
                    width={736}
                    height={544}
                    className="w-100 h-100 cover"
                    src={floorPlan.assetUrl}
                    alt={floorPlan.assetAlt}
                    style={{ maxWidth: 900, borderRadius: 10 }}
                  />
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default FloorPlans;