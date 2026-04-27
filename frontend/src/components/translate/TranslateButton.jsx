"use client";
import { useEffect, useState } from "react";

export default function TranslateToggle() {
  const [lang, setLang] = useState("en");

  useEffect(() => {
    const m = document.cookie.match(/googtrans=\/en\/(\w+)/);
    if (m?.[1] === "bn") setLang("bn");
  }, []);

  const toggle = () => {
    const next = lang === "en" ? "bn" : "en";
    document.cookie = `googtrans=/en/${next}; path=/`;
    window.location.reload();
  };

  const nextLabel = lang === "en" ? "BN" : "EN";

  return (
    <button
      onClick={toggle}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "6px 10px",
        borderRadius: 10,
        border: "1px solid rgba(0,0,0,.15)",
        background: "#fff",
        fontSize: 13,
        fontWeight: 600,
        cursor: "pointer"
      }}
      title={`Switch to ${nextLabel}`}
    >
      <span style={{ opacity: 0.6 }}>{lang.toUpperCase()}</span>
      <span style={{ opacity: 0.35 }}>→</span>
      <span>{nextLabel}</span>
    </button>
  );
}
