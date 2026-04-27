"use client";

import Select from "react-select";
import PriceRange from "./PriceRange";
import Bedroom from "./Bedroom";
import Bathroom from "./Bathroom";
import Amenities from "./Amenities";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const toQS = (obj) => {
  const sp = new URLSearchParams();
  Object.entries(obj).forEach(([k, v]) => {
    if (v === undefined || v === null) return;

    if (Array.isArray(v)) {
      const joined = v.map(String).map((s) => s.trim()).filter(Boolean).join(",");
      if (joined) sp.set(k, joined);
      return;
    }

    const val = String(v).trim();
    if (!val) return;
    sp.set(k, val);
  });
  return sp.toString();
};

const AdvanceFilterModal = () => {
  const [showSelect, setShowSelect] = useState(false);
  useEffect(() => setShowSelect(true), []);

  const router = useRouter();

  const catOptions = useMemo(
    () => [
      { value: "Houses", label: "Houses" },
      { value: "Apartments", label: "Apartments" },
      { value: "Villa", label: "Villa" },
      { value: "Office", label: "Office" },
    ],
    []
  );

const locationOptions = useMemo(
  () => [
    { value: "", label: "All Cities" },

    { value: "Dhaka", label: "Dhaka" },
    { value: "Chattogram", label: "Chattogram" },
    { value: "Khulna", label: "Khulna" },
    { value: "Rajshahi", label: "Rajshahi" },
    { value: "Sylhet", label: "Sylhet" },
    { value: "Barishal", label: "Barishal" },
    { value: "Rangpur", label: "Rangpur" },
    { value: "Mymensingh", label: "Mymensingh" },

    // Large & important cities
    { value: "Narayanganj", label: "Narayanganj" },
    { value: "Gazipur", label: "Gazipur" },
    { value: "Cumilla", label: "Cumilla" },
    { value: "Cox's Bazar", label: "Cox's Bazar" },
    { value: "Feni", label: "Feni" },
    { value: "Noakhali", label: "Noakhali" },
    { value: "Bogra", label: "Bogra" },
    { value: "Jessore", label: "Jessore" },
    { value: "Dinajpur", label: "Dinajpur" },
    { value: "Pabna", label: "Pabna" },
    { value: "Tangail", label: "Tangail" },
    { value: "Jamalpur", label: "Jamalpur" },
    { value: "Faridpur", label: "Faridpur" },
    { value: "Gopalganj", label: "Gopalganj" },
    { value: "Kushtia", label: "Kushtia" },
    { value: "Satkhira", label: "Satkhira" },
    { value: "Bagerhat", label: "Bagerhat" },
    { value: "Patuakhali", label: "Patuakhali" },
    { value: "Bhola", label: "Bhola" },
    { value: "Lakshmipur", label: "Lakshmipur" },
    { value: "Brahmanbaria", label: "Brahmanbaria" },
    { value: "Chandpur", label: "Chandpur" },
    { value: "Madaripur", label: "Madaripur" },
    { value: "Manikganj", label: "Manikganj" },
    { value: "Munshiganj", label: "Munshiganj" },
    { value: "Narsingdi", label: "Narsingdi" },
    { value: "Sherpur", label: "Sherpur" },
    { value: "Naogaon", label: "Naogaon" },
    { value: "Natore", label: "Natore" },
    { value: "Chapainawabganj", label: "Chapainawabganj" },
    { value: "Sirajganj", label: "Sirajganj" },
    { value: "Thakurgaon", label: "Thakurgaon" },
    { value: "Nilphamari", label: "Nilphamari" },
    { value: "Lalmonirhat", label: "Lalmonirhat" },
    { value: "Kurigram", label: "Kurigram" },
    { value: "Gaibandha", label: "Gaibandha" },
    { value: "Sunamganj", label: "Sunamganj" },
    { value: "Habiganj", label: "Habiganj" },
    { value: "Moulvibazar", label: "Moulvibazar" },
    { value: "Bandarban", label: "Bandarban" },
    { value: "Khagrachari", label: "Khagrachari" },
    { value: "Rangamati", label: "Rangamati" },
  ],
  []
);


  const customStyles = {
    option: (styles, { isFocused, isSelected, isHovered }) => ({
      ...styles,
      backgroundColor: isSelected
        ? "#eb6753"
        : isHovered
        ? "#eb675312"
        : isFocused
        ? "#eb675312"
        : undefined,
    }),
  };

  const [propertyType, setPropertyType] = useState("");
  const [city, setCity] = useState("");
  const [propertyId, setPropertyId] = useState("");

  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const [minBeds, setMinBeds] = useState("");
  const [minBaths, setMinBaths] = useState("");

  const [minSqft, setMinSqft] = useState("");
  const [maxSqft, setMaxSqft] = useState("");

  const [features, setFeatures] = useState([]); 

  const resetAll = () => {
    setPropertyType("");
    setCity("");
    setPropertyId("");
    setMinPrice("");
    setMaxPrice("");
    setMinBeds("");
    setMinBaths("");
    setMinSqft("");
    setMaxSqft("");
    setFeatures([]);
  };

  const onSearch = () => {
    const query = {
      propertyType,
      city,
      minPrice,
      maxPrice,
      minBeds,
      minBaths,
      minSqft,
      maxSqft,
      features,
    };

    const qs = toQS(query);
    router.push(qs ? `/map?${qs}` : "/map");
  };

  return (
    <div className="modal-dialog modal-dialog-centered modal-lg">
      <div className="modal-content">
        <div className="modal-header pl30 pr30">
          <h5 className="modal-title" id="exampleModalLabel">
            More Filter
          </h5>
          <button
            type="button"
            className="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
          />
        </div>

        <div className="modal-body pb-0">
          <div className="row">
            <div className="col-lg-12">
              <div className="widget-wrapper">
                <h6 className="list-title mb20">Price Range</h6>
                <div className="range-slider-style modal-version">
                  <PriceRange
                    value={{ min: minPrice, max: maxPrice }}
                    onChange={({ min, max }) => {
                      setMinPrice(min ?? "");
                      setMaxPrice(max ?? "");
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-sm-6">
              <div className="widget-wrapper">
                <h6 className="list-title">Type</h6>
                <div className="form-style2 input-group">
                  {showSelect && (
                    <Select
                      value={catOptions.find((o) => o.value === propertyType) || null}
                      onChange={(opt) => setPropertyType(opt?.value || "")}
                      options={catOptions}
                      styles={customStyles}
                      className="select-custom"
                      classNamePrefix="select"
                      isClearable
                    />
                  )}
                </div>
              </div>
            </div>

            <div className="col-sm-6">
              <div className="widget-wrapper">
                <h6 className="list-title">Property ID</h6>
                <div className="form-style2">
                  <input
                    type="text"
                    className="form-control"
                    value={propertyId}
                    onChange={(e) => setPropertyId(e.target.value)}
                    placeholder="RT04949213"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-sm-6">
              <div className="widget-wrapper">
                <h6 className="list-title">Bedrooms</h6>
                <div className="d-flex">
                  <Bedroom value={minBeds} onChange={(v) => setMinBeds(String(v ?? ""))} />
                </div>
              </div>
            </div>

            <div className="col-sm-6">
              <div className="widget-wrapper">
                <h6 className="list-title">Bathrooms</h6>
                <div className="d-flex">
                  <Bathroom value={minBaths} onChange={(v) => setMinBaths(String(v ?? ""))} />
                </div>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-sm-6">
              <div className="widget-wrapper">
                <h6 className="list-title">Location</h6>
                <div className="form-style2 input-group">
                  {showSelect && (
                    <Select
                      value={locationOptions.find((o) => o.value === city) || locationOptions[0]}
                      onChange={(opt) => setCity(opt?.value || "")}
                      styles={customStyles}
                      options={locationOptions}
                      className="select-custom"
                      classNamePrefix="select"
                      isClearable
                    />
                  )}
                </div>
              </div>
            </div>

            <div className="col-sm-6">
              <div className="widget-wrapper">
                <h6 className="list-title">Square Feet</h6>
                <div className="space-area">
                  <div className="d-flex align-items-center justify-content-between">
                    <div className="form-style1">
                      <input
                        type="number"
                        className="form-control"
                        placeholder="Min."
                        value={minSqft}
                        onChange={(e) => setMinSqft(e.target.value)}
                        min={0}
                      />
                    </div>
                    <span className="dark-color">-</span>
                    <div className="form-style1">
                      <input
                        type="number"
                        className="form-control"
                        placeholder="Max"
                        value={maxSqft}
                        onChange={(e) => setMaxSqft(e.target.value)}
                        min={0}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-lg-12">
              <div className="widget-wrapper mb0">
                <h6 className="list-title mb10">Amenities</h6>
              </div>
            </div>

            <Amenities value={features} onChange={setFeatures} />
          </div>
        </div>

        <div className="modal-footer justify-content-between">
          <button
            type="button"
            className="reset-button"
            onClick={resetAll}
          >
            <span className="flaticon-turn-back" />
            <u>Reset all filters</u>
          </button>

          <div className="btn-area">
            <button
              data-bs-dismiss="modal"
              type="button"
              className="ud-btn btn-thm"
              onClick={onSearch}
            >
              <span className="flaticon-search align-text-top pr10" />
              Search
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvanceFilterModal;
