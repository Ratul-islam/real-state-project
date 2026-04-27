"use client";
import { useEffect, useMemo, useState } from "react";
import Select from "react-select";

const DEFAULT_CURRENCY = "BDT";

const PropertyDescription = ({
  value,
  onChange,
  errors = {},
  touched = false,
}) => {
  const catergoryOptions = [
    { value: "Apartments", label: "Apartments" },
    { value: "Houses", label: "Houses" },
    { value: "Office", label: "Office" },
    { value: "Villa", label: "Villa" },
    { value: "Land Sharing", label: "Land Sharing" },
  ];

  const businessOptions = [
    { value: "housing society", label: "Housing society" },
    { value: "housing construction", label: "Housing construction" },
    { value: "home solution", label: "Home solution" },
  ];

  const listedIn = [
    { value: "All Listing", label: "All Listing" },
    { value: "Active", label: "Active" },
    { value: "Sold", label: "Sold" },
    { value: "Processing", label: "Processing" },
  ];

  const PropertyStatus = [
    { value: "Active", label: "Active" },
    { value: "Pending", label: "Pending" },
    { value: "Sold", label: "Sold" },
    { value: "Rented", label: "Rented" },
    { value: "Draft", label: "Draft" },
    { value: "Archived", label: "Archived" },
  ];

  const customStyles = {
    option: (styles, { isFocused, isSelected }) => ({
      ...styles,
      backgroundColor: isSelected
        ? "#eb6753"
        : isFocused
        ? "#eb675312"
        : undefined,
    }),
  };

  const [showSelect, setShowSelect] = useState(false);
  useEffect(() => setShowSelect(true), []);

  // ---- pricing (new API) ----
  const pricing = value?.pricing;

  const initialMode = useMemo(() => {
    if (pricing && typeof pricing?.amount === "number") return "fixed";
    if (
      pricing &&
      typeof pricing?.min === "number" &&
      typeof pricing?.max === "number"
    )
      return "range";
    return "fixed";
  }, [pricing]);

  const [priceMode, setPriceMode] = useState(initialMode);
  useEffect(() => setPriceMode(initialMode), [initialMode]);

  const ensureNumber = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  };

  const setPricing = (nextPricing) => {
    onChange({ pricing: { ...nextPricing, currency: DEFAULT_CURRENCY } });
  };

  const onSwitchMode = (mode) => {
    setPriceMode(mode);

    if (mode === "fixed") {
      const amount =
        typeof pricing?.amount === "number"
          ? pricing.amount
          : typeof pricing?.min === "number"
          ? pricing.min
          : 0;
      setPricing({ amount });
    } else {
      const base =
        typeof pricing?.amount === "number"
          ? pricing.amount
          : typeof pricing?.min === "number"
          ? pricing.min
          : 0;
      setPricing({ min: base, max: base });
    }
  };

  const fixedAmount =
    pricing && typeof pricing?.amount === "number" ? pricing.amount : "";

  const rangeMin =
    pricing && typeof pricing?.min === "number" ? pricing.min : "";

  const rangeMax =
    pricing && typeof pricing?.max === "number" ? pricing.max : "";

  return (
    <form className="form-style1">
      <div className="row">
        {/* Title */}
        <div className="col-sm-12">
          <div className="mb20">
            <label className="heading-color ff-heading fw600 mb10">Title</label>
            <input
              type="text"
              className="form-control"
              placeholder="Property title"
              value={value.title ?? ""}
              onChange={(e) => onChange({ title: e.target.value })}
            />
            {touched && errors.title && (
              <p style={{ color: "red", marginTop: 6 }}>{errors.title}</p>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="col-sm-12">
          <div className="mb20">
            <label className="heading-color ff-heading fw600 mb10">
              Description
            </label>
            <textarea
              cols={30}
              rows={5}
              placeholder="Property description"
              value={value.description ?? ""}
              onChange={(e) => onChange({ description: e.target.value })}
            />
            {touched && errors.description && (
              <p style={{ color: "red", marginTop: 6 }}>
                {errors.description}
              </p>
            )}
          </div>
        </div>

        {/* Category */}
        <div className="col-sm-6 col-xl-4">
          <div className="mb20">
            <label className="heading-color ff-heading fw600 mb10">
              Select Category
            </label>
            {showSelect && (
              <Select
                value={
                  catergoryOptions.find(
                    (o) => o.value === value.propertyType
                  ) ?? null
                }
                options={catergoryOptions}
                styles={customStyles}
                className="select-custom pl-0"
                classNamePrefix="select"
                isMulti={false}
                onChange={(opt) =>
                  onChange({ propertyType: opt ? opt.value : "" })
                }
              />
            )}
            {touched && errors.propertyType && (
              <p style={{ color: "red", marginTop: 6 }}>
                {errors.propertyType}
              </p>
            )}
          </div>
        </div>

        {/* Listed In */}
        <div className="col-sm-6 col-xl-4">
          <div className="mb20">
            <label className="heading-color ff-heading fw600 mb10">
              Listed in
            </label>
            {showSelect && (
              <Select
                options={listedIn}
                styles={customStyles}
                className="select-custom pl-0"
                classNamePrefix="select"
                isMulti
              />
            )}
          </div>
        </div>

        {/* Property Status */}
        <div className="col-sm-6 col-xl-4">
          <div className="mb20">
            <label className="heading-color ff-heading fw600 mb10">
              Property Status
            </label>
            {showSelect && (
              <Select
                value={
                  PropertyStatus.find(
                    (o) => o.value === value.propertyStatus
                  ) ?? null
                }
                options={PropertyStatus}
                styles={customStyles}
                className="select-custom pl-0"
                classNamePrefix="select"
                isMulti={false}
                onChange={(opt) =>
                  onChange({ propertyStatus: opt ? opt.value : "" })
                }
              />
            )}
            {touched && errors.propertyStatus && (
              <p style={{ color: "red", marginTop: 6 }}>
                {errors.propertyStatus}
              </p>
            )}
          </div>
        </div>

        {/* Business Type */}
        <div className="col-sm-6 col-xl-4">
          <div className="mb20">
            <label className="heading-color ff-heading fw600 mb10">
              Business type
            </label>
            {showSelect && (
              <Select
                value={
                  businessOptions.find(
                    (o) => o.value === value.businessType
                  ) ?? null
                }
                options={businessOptions}
                styles={customStyles}
                className="select-custom pl-0"
                classNamePrefix="select"
                isMulti={false}
                onChange={(opt) =>
                  onChange({ businessType: opt ? opt.value : "" })
                }
              />
            )}
            {touched && errors.businessType && (
              <p style={{ color: "red", marginTop: 6 }}>
                {errors.businessType}
              </p>
            )}
          </div>
        </div>

        {/* ✅ Pricing Type (same column layout) */}
        <div className="col-sm-6 col-xl-4">
          <div className="mb20">
            <label className="heading-color ff-heading fw600 mb10">
              Pricing type
            </label>

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
                onClick={() => onSwitchMode("fixed")}
                style={{
                  flex: 1,
                  padding: "10px 12px",
                  border: "none",
                  background: priceMode === "fixed" ? "#eb6753" : "transparent",
                  color: priceMode === "fixed" ? "#fff" : "#111",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Fixed
              </button>
              <button
                type="button"
                onClick={() => onSwitchMode("range")}
                style={{
                  flex: 1,
                  padding: "10px 12px",
                  border: "none",
                  background: priceMode === "range" ? "#eb6753" : "transparent",
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
        </div>

        {/* ✅ Price field (same column layout) */}
        <div className="col-sm-6 col-xl-4">
          <div className="mb30">
            <label className="heading-color ff-heading fw600 mb10">
              {priceMode === "fixed" ? "Price (BDT)" : "Price range (BDT)"}
            </label>

            {priceMode === "fixed" ? (
              <div style={{ position: "relative" }}>
                <span
                  style={{
                    position: "absolute",
                    left: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#6b7280",
                    fontWeight: 700,
                  }}
                >
                  ৳
                </span>
                <input
                  type="number"
                  className="form-control"
                  placeholder="e.g. 2500000"
                  style={{ paddingLeft: 32 }}
                  value={fixedAmount}
                  onChange={(e) => {
                    const amount = ensureNumber(e.target.value);
                    setPricing({ amount });
                  }}
                />
              </div>
            ) : (
              <div style={{ display: "flex", gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>
                    Min
                  </div>
                  <div style={{ position: "relative" }}>
                    <span
                      style={{
                        position: "absolute",
                        left: 12,
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "#6b7280",
                        fontWeight: 700,
                      }}
                    >
                      ৳
                    </span>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="Min"
                      style={{ paddingLeft: 32 }}
                      value={rangeMin}
                      onChange={(e) => {
                        const min = ensureNumber(e.target.value);
                        const max =
                          typeof pricing?.max === "number"
                            ? ensureNumber(pricing.max)
                            : min;
                        setPricing({ min, max });
                      }}
                    />
                  </div>
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>
                    Max
                  </div>
                  <div style={{ position: "relative" }}>
                    <span
                      style={{
                        position: "absolute",
                        left: 12,
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "#6b7280",
                        fontWeight: 700,
                      }}
                    >
                      ৳
                    </span>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="Max"
                      style={{ paddingLeft: 32 }}
                      value={rangeMax}
                      onChange={(e) => {
                        const max = ensureNumber(e.target.value);
                        const min =
                          typeof pricing?.min === "number"
                            ? ensureNumber(pricing.min)
                            : 0;
                        setPricing({ min, max });
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {touched && (errors.pricing || errors.price) && (
              <p style={{ color: "red", marginTop: 6 }}>
                {errors.pricing || errors.price}
              </p>
            )}
          </div>
        </div>

        {/* Yearly Tax */}
        <div className="col-sm-6 col-xl-4">
          <div className="mb30">
            <label className="heading-color ff-heading fw600 mb10">
              Yearly Tax Rate
            </label>
            <input type="text" className="form-control" />
          </div>
        </div>

        {/* After Price Label */}
        <div className="col-sm-6 col-xl-4">
          <div className="mb30">
            <label className="heading-color ff-heading fw600 mb10">
              After Price Label
            </label>
            <input type="text" className="form-control" />
          </div>
        </div>
      </div>
    </form>
  );
};

export default PropertyDescription;