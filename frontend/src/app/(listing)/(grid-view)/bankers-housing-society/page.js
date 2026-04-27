import DefaultHeader from "@/components/common/DefaultHeader";
import Footer from "@/components/common/default-footer";
import MobileMenu from "@/components/common/mobile-menu";

import React, { Suspense } from "react";
import PropertyFiltering from "@/components/listing/grid-view/grid-default/PropertyFiltering";
import { getListings } from "@/services/listing/listings.server";
import PageLoader from "@/components/common/PageLoader";

export const metadata = {
  title: "Bankers' Housing Society",
};

async function ListingsBlock() {
  const payload = await getListings({
    businessType: "housing society",
    limit: 50,
    page: 1,
    sort: "createdAt",
    order: "desc",
  });

  const items = payload?.data?.items ?? payload?.items ?? payload?.data ?? [];
  return <PropertyFiltering items={items} />;
}

const BankersHousingSociety = () => {
  return (
    <>
      <DefaultHeader />
      <MobileMenu />

      <section className="breadcumb-section bgc-f7 breadcumb-dark">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="breadcumb-style1">
                <h2 className="title">Bankers&apos; Housing Society</h2>
                <div className="breadcumb-list">
                  <a href="#">Home</a>
                  <a href="#">Bankers&apos; Housing Society</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Suspense fallback={<PageLoader />}>
        <ListingsBlock />
      </Suspense>

      <section className="footer-style1 pt60 pb-0">
        <Footer />
      </section>
    </>
  );
};

export default BankersHousingSociety;
