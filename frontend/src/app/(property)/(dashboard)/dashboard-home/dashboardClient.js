'use client'

import { useEffect, useState } from "react";

import DashboardHeader from "@/components/common/DashboardHeader";
import MobileMenu from "@/components/common/mobile-menu";
import DboardMobileNavigation from "@/components/property/dashboard/DboardMobileNavigation";
import Footer from "@/components/property/dashboard/Footer";
import SidebarDashboard from "@/components/property/dashboard/SidebarDashboard";
import RecentActivities from "@/components/property/dashboard/dashboard-home/RecentActivities";
import TopStateBlock from "@/components/property/dashboard/dashboard-home/TopStateBlock";
import PropertyViews from "@/components/property/dashboard/dashboard-home/property-view";

import { getOverallStats } from "@/services/analytics/analytics.service";



const DashboardClient = () => {
   const [loading, setLoading] = useState(false);
  const [range, setRange] = useState("30d");
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getOverallStats(range);
        setStats(data);
      } catch (e) {
        console.error(e);
        setError("Failed to load dashboard stats");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [range]);

  return (
    <>
      <DashboardHeader />
      <MobileMenu />

      <div className="dashboard_content_wrapper">
        <div className="dashboard dashboard_wrapper pr30 pr0-xl">
          <SidebarDashboard />

          <div className="dashboard__main pl0-md">
            <div className="dashboard__content bgc-f7">
              <div className="row pb40">
                <div className="col-lg-12">
                  <DboardMobileNavigation />
                </div>

                <div className="col-lg-12">
                  <div className="dashboard_title_area">
                    <h2>Howdy!</h2>
                    <p className="text">Here’s what’s happening with your listings.</p>
                  </div>
                </div>
              </div>

              {/* ---- TOP STATS ---- */}
              <div className="row">
                <TopStateBlock
                  loading={loading}
                  stats={stats}
                  range={range}
                  onRangeChange={setRange}
                />
              </div>

              {/* ---- CHART + ACTIVITY ---- */}
              <div className="row">
                <div className="">
                  <div className="ps-widget bgc-white bdrs12 default-box-shadow2 p30 mb30 overflow-hidden position-relative">
                    <PropertyViews
                      loading={loading}
                      daily={stats?.daily || []}
                    />
                  </div>
                </div>

                {/* <div className="col-xl-4">
                  <div className="ps-widget bgc-white bdrs12 default-box-shadow2 p30 mb30 overflow-hidden position-relative">
                    <h4 className="title fz17 mb25">Recent Activities</h4>
                    <RecentActivities
                      loading={loading}
                      stats={stats}
                    />
                  </div>
                </div> */}
              </div>

              {error && (
                <div className="row">
                  <div className="col-12 text-danger mt10">{error}</div>
                </div>
              )}
            </div>

            <Footer />
          </div>
        </div>
      </div>
    </>
  );
}

export default DashboardClient