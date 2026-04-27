"use client";

import Link from "next/link";
import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { adminLogout } from "@/services/auth/api";

const SidebarDashboard = () => {
  const pathname = usePathname();
  const router = useRouter();

  const sidebarItems = [
    {
      title: "MAIN",
      items: [
        // Changed to a pie chart / dashboard gauge icon
        { href: "/dashboard-home", icon: "fal fa-chart-pie", text: "Dashboard" },
      ],
    },
    {
      title: "MANAGE LISTINGS",
      items: [
        // Changed to a building with a plus sign / layer add
        { href: "/dashboard-add-property", icon: "fal fa-layer-plus", text: "Add New Property" },
        
        // Changed to a building/home list icon
        { href: "/dashboard-my-properties", icon: "fal fa-building", text: "My Properties" },
        
        // { href: "/dashboard-my-favourites", icon: "fal fa-heart", text: "My Favorites" },
        // { href: "/dashboard-reviews", icon: "fal fa-star", text: "Reviews" },
        
        // Changed to a professional user/agent icon
        { href: "/agents", icon: "fal fa-user-tie", text: "Agents" },
        
        // Changed to an envelope/messages icon for inquiries
        { href: "/inquiries", icon: "fal fa-envelope-open-text", text: "Inquiry requests" },
      ],
    },
    // {
    //   title: "MANAGE ACCOUNT",
    //   items: [
    //     { href: "/dashboard-my-package", icon: "fal fa-box-open", text: "My Package" },
    //     { href: "/dashboard-my-profile", icon: "fal fa-user-circle", text: "My Profile" },
    //     // { href: "/login", icon: "fal fa-sign-out-alt", text: "Logout" },
    //   ],
    // },
  ];

  const handleLogout = async () => {
    try {
      await adminLogout(); 
    } finally {
      router.replace("/login"); 
    }
  };

  return (
    <div className="dashboard__sidebar d-none d-lg-block">
      <div className="dashboard_sidebar_list">
        {sidebarItems.map((section, sectionIndex) => (
          <div key={sectionIndex}>
            <p
              className={`fz15 fw400 ff-heading ${
                sectionIndex === 0 ? "mt-0" : "mt30"
              }`}
            >
              {section.title}
            </p>

            {section.items.map((item, itemIndex) => {
              const isActive = pathname === item.href;

              if (item.text === "Logout") {
                return (
                  <div key={itemIndex} className="sidebar_list_item">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="items-center w-100 text-start bg-transparent border-0"
                    >
                      <i className={`${item.icon} mr15`} />
                      Logout
                    </button>
                  </div>
                );
              }

              return (
                <div key={itemIndex} className="sidebar_list_item">
                  <Link
                    href={item.href}
                    className={`items-center ${isActive ? "-is-active" : ""}`}
                  >
                    <i className={`${item.icon} mr15`} />
                    {item.text}
                  </Link>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SidebarDashboard;