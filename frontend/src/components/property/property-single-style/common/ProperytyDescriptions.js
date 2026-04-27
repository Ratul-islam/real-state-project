"use client";

import React, { useMemo, useId } from "react";

const splitDescription = (text, limit = 260) => {
  const s = String(text || "").trim();
  if (!s) return { first: "", rest: "" };
  if (s.length <= limit) return { first: s, rest: "" };

  const cut = s.lastIndexOf(" ", limit);
  const idx = cut > 120 ? cut : limit;

  return {
    first: s.slice(0, idx).trim(),
    rest: s.slice(idx).trim(),
  };
};

const ProperytyDescriptions = ({ property }) => {
  // ✅ still from updated schema: property.description
  const desc = property?.description ?? "";

  const { first, rest } = useMemo(() => splitDescription(desc, 320), [desc]);

  const safeFirst = first || "No description provided for this property yet.";

  // ✅ avoid duplicate ids when multiple components render on a page
  const uid = useId();
  const accId = `accordionFlush-${uid}`;
  const headingId = `flush-heading-${uid}`;
  const collapseId = `flush-collapse-${uid}`;

  return (
    <>
      <p className="text mb10">{safeFirst}</p>

      {rest ? (
        <div className="agent-single-accordion">
          <div className="accordion accordion-flush" id={accId}>
            <div className="accordion-item">
              <h2 className="accordion-header" id={headingId}>
                <button
                  className="accordion-button p-0 collapsed"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target={`#${collapseId}`}
                  aria-expanded="false"
                  aria-controls={collapseId}
                >
                  Show more
                </button>
              </h2>

              <div
                id={collapseId}
                className="accordion-collapse collapse"
                aria-labelledby={headingId}
                data-bs-parent={`#${accId}`}
              >
                <div className="accordion-body p-0">
                  <p className="text mb0">{rest}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
};

export default ProperytyDescriptions;