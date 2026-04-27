import DefaultHeader from "@/components/common/DefaultHeader";
import MobileMenu from "@/components/common/mobile-menu";
import { PropertyFilteringTwoClient } from "./PropertyFilteringTwoClient";
import { Suspense } from "react";


export const metadata = {
  title: "Map Filter bankers housing society",
};

export default function MapV1() {
  return (
    <>
      <DefaultHeader />
      <MobileMenu />
      <Suspense fallback={<div>Loading filters…</div>}>
        <PropertyFilteringTwoClient />
      </Suspense>
    </>
  );
}
