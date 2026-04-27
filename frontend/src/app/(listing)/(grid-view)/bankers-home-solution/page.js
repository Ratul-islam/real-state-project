import DefaultHeader from "@/components/common/DefaultHeader";
import Footer from "@/components/common/default-footer";
import MobileMenu from "@/components/common/mobile-menu";

import React from "react";
import PropertyFiltering from "@/components/listing/grid-view/grid-default/PropertyFiltering";
import { getListings } from "@/services/listing/listings.service";

export const metadata = {
  title: "Bankers' Home Solution",
};

async function fetchListings() {
  try {
    const payload = await getListings({
      businessType: "home solution",
      limit: 50,
      page: 1,
      sort: "createdAt",
      order: "desc",
    });

    const items = payload?.data?.items ?? payload?.items ?? payload?.data ?? [];
    return Array.isArray(items) ? items : [];
  } catch {
    return [];
  }
}

const BankersHomeSolution = async () => {
  const items = await fetchListings();

  return (
    <>
      <DefaultHeader />
      <MobileMenu />

      <section className="breadcumb-section bgc-f7 breadcumb-dark">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="breadcumb-style1">
                <h2 className="title">Bankers&apos; Home Solution</h2>
                <div className="breadcumb-list">
                  <a href="#">Home</a>
                  <a href="#">Bankers&apos; Home Solution</a>
                </div>
                <a
                  className="filter-btn-left mobile-filter-btn d-block d-lg-none"
                  data-bs-toggle="offcanvas"
                  href="#listingSidebarFilter"
                  role="button"
                  aria-controls="listingSidebarFilter"
                >
                  <span className="flaticon-settings" /> Filter
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <PropertyFiltering items={items} />

      <section className="footer-style1 pt60 pb-0">
        <Footer />
      </section>
    </>
  );
};

export default BankersHomeSolution;
