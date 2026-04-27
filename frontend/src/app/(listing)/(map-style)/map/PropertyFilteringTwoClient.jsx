"use client";

import React, { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import PropertyFilteringTwo from "@/components/listing/map-style/map-v1/PropertyFilteringTwo";

export const PropertyFilteringTwoClient = () => {
  const searchParams = useSearchParams();
  const filters = useMemo(() => {
    const obj = {};
    for (const [k, v] of searchParams.entries()) obj[k] = v;
    return obj;
  }, [searchParams]);

  return <PropertyFilteringTwo filters={filters} />;
};

