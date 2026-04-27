"use client";

import Image from "next/image";
import React from "react";

const FALLBACK_AGENT = {
  name: "Property Agent",
  phone: "—",
  avatar: "/images/about/agent-p.jpg",
};

const ContactWithAgent = ({ property, onContactClick }) => {
  const agent = property?.agent || property?.owner || {};

  const name = agent?.name || agent?.fullName || FALLBACK_AGENT.name;

  const phone =
    agent?.phone || agent?.mobile || agent?.contact || FALLBACK_AGENT.phone;

  const avatar =
    agent?.avatar || agent?.photoUrl || agent?.image || FALLBACK_AGENT.avatar;

  const handleContact = () => {
    // ✅ analytics hook (won’t crash if not provided)
    onContactClick?.();
  };

  return (
    <>
      <div className="agent-single d-sm-flex align-items-center pb25">
        <div
          className="single-img mb30-sm"
          style={{
            width: 90,
            height: 90,
            borderRadius: "50%",
            overflow: "hidden",
            flex: "0 0 90px",
          }}
        >
          <Image
            width={90}
            height={90}
            className="w90"
            src={avatar}
            alt={name}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              borderRadius: "50%",
            }}
            unoptimized
          />
        </div>

        <div className="single-contant ml20 ml0-xs">
          <h6 className="title mb-1">{name}</h6>

          <div className="agent-meta mb10 d-md-flex align-items-center">
            {phone !== "—" ? (
              <a
                className="text fz15"
                href={`tel:${phone}`}
                onClick={handleContact}
              >
                <i className="flaticon-call pe-1" />
                {phone}
              </a>
            ) : (
              <span className="text fz15">
                <i className="flaticon-call pe-1" />
                —
              </span>
            )}
          </div>

          {agent?.id && (
            <a
              href={`/agents/${agent.id}`}
              className="text-decoration-underline fw600"
              onClick={handleContact}
            >
              View Listings
            </a>
          )}
        </div>
      </div>
    </>
  );
};

export default ContactWithAgent;
