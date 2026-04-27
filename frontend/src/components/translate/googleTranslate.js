"use client";

import { useEffect } from "react";

export default function GoogleTranslate() {

    useEffect(() => {
  const hideBanner = () => {
    const banner = document.querySelector(".goog-te-banner-frame");
    if (banner) {
      (banner).style.display = "none";
    }
  };

  const interval = setInterval(hideBanner, 500);

  return () => clearInterval(interval);
}, []);

  useEffect(() => {
    if (document.getElementById("google-translate-script")) return;

    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: "en",
          includedLanguages: "en,bn",
          autoDisplay: false,
        },
        "google_translate_element"
      );
    };

    const script = document.createElement("script");
    script.id = "google-translate-script";
    script.src =
      "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  return (
    <div style={{ display: "flex", justifyContent: "flex-end" }}>
      <div id="google_translate_element" />
    </div>
  );
}
