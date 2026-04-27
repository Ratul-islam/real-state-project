"use client";

import React, { useMemo, useState, useEffect } from "react";
import ListingSidebar from "../../sidebar";
import TopFilterBar from "./TopFilterBar";
import FeaturedListings from "./FeatuerdListings";
import PaginationTwo from "../../PaginationTwo";


function normalizeListing(raw) {
  const id = raw?._id || raw?.id;

  const priceNum = Number(raw?.price ?? 0);
  const currency = raw?.currency || "USD";

  const priceStr = (() => {
    try {
      return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency,
        maximumFractionDigits: 0,
      }).format(priceNum);
    } catch {
      return `৳${priceNum}`;
    }
  })();

  return {
    ...raw,
    id,
    bed: Number(raw?.beds ?? raw?.bed ?? 0),
    bath: Number(raw?.baths ?? raw?.bath ?? 0),
    location: raw?.locationText ?? raw?.location ?? raw?.city ?? "",
    price: raw?.priceStr ?? priceStr,
    sqft: Number(raw?.sqft ?? 0),
    yearBuilding: Number(raw?.yearBuilding ?? 0),
    city: raw?.city ?? "",
    forRent: Boolean(raw?.forRent),
    propertyType: raw?.propertyType ?? "Houses",
    features: Array.isArray(raw?.features) ? raw.features : [],
  };
}

export default function PropertyFiltering({ items = [] }) {
  const listings = useMemo(() => {
    const arr = Array.isArray(items) ? items : [];
    return arr.map(normalizeListing);
  }, [items]);

  const [filteredData, setFilteredData] = useState([]);
  const [currentSortingOption, setCurrentSortingOption] = useState("Newest");

  const [sortedFilteredData, setSortedFilteredData] = useState([]);
  const [pageNumber, setPageNumber] = useState(1);

  const [colstyle, setColstyle] = useState(false);
  const [pageItems, setPageItems] = useState([]);
  const [pageContentTrac, setPageContentTrac] = useState([]);

  const listingStatus = "Buy";

  const [propertyTypes, setPropertyTypes] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [bedrooms, setBedrooms] = useState(0);
  const [bathroms, setBathroms] = useState(0);
  const [location, setLocation] = useState("All Cities");
  const [squirefeet, setSquirefeet] = useState([]);
  const [yearBuild, setyearBuild] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setPageItems(sortedFilteredData.slice((pageNumber - 1) * 8, pageNumber * 8));
    setPageContentTrac([
      (pageNumber - 1) * 8 + 1,
      pageNumber * 8,
      sortedFilteredData.length,
    ]);
  }, [pageNumber, sortedFilteredData]);

  const resetFilter = () => {
    setPropertyTypes([]);
    setPriceRange([0, 100000]);
    setBedrooms(0);
    setBathroms(0);
    setLocation("All Cities");
    setSquirefeet([]);
    setyearBuild([0, 2050]);
    setCategories([]);
    setCurrentSortingOption("Newest");

    document.querySelectorAll(".filterInput").forEach((element) => {
      element.value = null;
    });
  };

  const handlelistingStatus = () => {};

  const handlepropertyTypes = (elm) => {
    if (elm === "All") {
      setPropertyTypes([]);
    } else {
      setPropertyTypes((pre) =>
        pre.includes(elm) ? pre.filter((el) => el !== elm) : [...pre, elm]
      );
    }
  };

  const handlepriceRange = (elm) => setPriceRange(elm);
  const handlebedrooms = (elm) => setBedrooms(elm);
  const handlebathroms = (elm) => setBathroms(elm);
  const handlelocation = (elm) => setLocation(elm);
  const handlesquirefeet = (elm) => setSquirefeet(elm);
  const handleyearBuild = (elm) => setyearBuild(elm);

  const handlecategories = (elm) => {
    if (elm === "All") {
      setCategories([]);
    } else {
      setCategories((pre) =>
        pre.includes(elm) ? pre.filter((el) => el !== elm) : [...pre, elm]
      );
    }
  };

  const filterFunctions = {
    handlelistingStatus,
    handlepropertyTypes,
    handlepriceRange,
    handlebedrooms,
    handlebathroms,
    handlelocation,
    handlesquirefeet,
    handleyearBuild,
    handlecategories,
    priceRange,
    listingStatus,
    propertyTypes,
    resetFilter,

    bedrooms,
    bathroms,
    location,
    squirefeet,
    yearBuild,
    categories,
    setPropertyTypes,
    setSearchQuery,
  };

  useEffect(() => {
    const refItems = listings.filter((elm) => !elm.forRent);

    let filteredArrays = [];

    if (propertyTypes.length > 0) {
      filteredArrays.push(refItems.filter((elm) => propertyTypes.includes(elm.propertyType)));
    }

    filteredArrays.push(refItems.filter((el) => Number(el.bed || 0) >= Number(bedrooms || 0)));
    filteredArrays.push(refItems.filter((el) => Number(el.bath || 0) >= Number(bathroms || 0)));

    const q = String(searchQuery || "").toLowerCase().trim();
    if (q) {
      filteredArrays.push(
        refItems.filter((el) => {
          const city = String(el.city || "").toLowerCase();
          const loc = String(el.location || "").toLowerCase();
          const title = String(el.title || "").toLowerCase();
          const feats = Array.isArray(el.features) ? el.features.join(" ").toLowerCase() : "";
          return city.includes(q) || loc.includes(q) || title.includes(q) || feats.includes(q);
        })
      );
    } else {
      filteredArrays.push([...refItems]);
    }

    filteredArrays.push(
      !categories.length
        ? [...refItems]
        : refItems.filter((elm) => categories.every((c) => (elm.features || []).includes(c)))
    );

    if (location !== "All Cities") {
      filteredArrays.push(refItems.filter((el) => el.city === location));
    }

    if (priceRange?.length > 0) {
      const min = Number(priceRange[0] || 0);
      const max = Number(priceRange[1] || 0);

      filteredArrays.push(
        refItems.filter((elm) => {
          const n = Number(String(elm.price || "").replace(/[^0-9.]/g, "")) || 0;
          return n >= min && n <= max;
        })
      );
    }

    if (squirefeet?.length > 0 && squirefeet[1]) {
      const min = Number(squirefeet[0] || 0);
      const max = Number(squirefeet[1] || 0);
      filteredArrays.push(refItems.filter((elm) => elm.sqft >= min && elm.sqft <= max));
    }

    if (yearBuild?.length > 0) {
      const min = Number(yearBuild[0] || 0);
      const max = Number(yearBuild[1] || 9999);
      filteredArrays.push(refItems.filter((elm) => elm.yearBuilding >= min && elm.yearBuilding <= max));
    }

    const commonItems = refItems.filter((item) => filteredArrays.every((arr) => arr.includes(item)));

    setFilteredData(commonItems);
  }, [
    listings,
    propertyTypes,
    priceRange,
    bedrooms,
    bathroms,
    location,
    squirefeet,
    yearBuild,
    categories,
    searchQuery,
  ]);

  useEffect(() => {
    setPageNumber(1);

    if (currentSortingOption === "Newest") {
      const sorted = [...filteredData].sort((a, b) => (b.yearBuilding || 0) - (a.yearBuilding || 0));
      setSortedFilteredData(sorted);
      return;
    }

    if (currentSortingOption.trim() === "Price Low") {
      const sorted = [...filteredData].sort((a, b) => {
        const pa = Number(String(a.price || "").replace(/[^0-9.]/g, "")) || 0;
        const pb = Number(String(b.price || "").replace(/[^0-9.]/g, "")) || 0;
        return pa - pb;
      });
      setSortedFilteredData(sorted);
      return;
    }

    if (currentSortingOption.trim() === "Price High") {
      const sorted = [...filteredData].sort((a, b) => {
        const pa = Number(String(a.price || "").replace(/[^0-9.]/g, "")) || 0;
        const pb = Number(String(b.price || "").replace(/[^0-9.]/g, "")) || 0;
        return pb - pa;
      });
      setSortedFilteredData(sorted);
      return;
    }

    setSortedFilteredData(filteredData);
  }, [filteredData, currentSortingOption]);

  return (
    <section className="pt0 pb90 bgc-f7">
      <div className="container">
        <div className="row gx-xl-5">
          <div className="col-lg-4 d-none d-lg-block">
            <ListingSidebar filterFunctions={filterFunctions} />
          </div>

          <div
            className="offcanvas offcanvas-start p-0"
            tabIndex="-1"
            id="listingSidebarFilter"
            aria-labelledby="listingSidebarFilterLabel"
          >
            <div className="offcanvas-header">
              <h5 className="offcanvas-title" id="listingSidebarFilterLabel">
                Listing Filter
              </h5>
              <button
                type="button"
                className="btn-close text-reset"
                data-bs-dismiss="offcanvas"
                aria-label="Close"
              />
            </div>
            <div className="offcanvas-body p-0">
              <ListingSidebar filterFunctions={filterFunctions} />
            </div>
          </div>

          <div className="col-lg-8">
            <div className="row align-items-center mb20">
              <TopFilterBar
                pageContentTrac={pageContentTrac}
                colstyle={colstyle}
                setColstyle={setColstyle}
                setCurrentSortingOption={setCurrentSortingOption}
              />
            </div>

            <div className="row mt15">
              <FeaturedListings colstyle={colstyle} data={pageItems} />
            </div>

            <div className="row">
              <PaginationTwo
                pageCapacity={8}
                data={sortedFilteredData}
                pageNumber={pageNumber}
                setPageNumber={setPageNumber}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
