"use client";

import React, { useState, useEffect } from "react";
import { createInquiry } from "@/services/inquiry/inquiry.service"

const COOLDOWN_HOURS = 10;
const COOLDOWN_MS = COOLDOWN_HOURS * 60 * 60 * 1000;
const STORAGE_KEY = "last_tour_request_time";

const ScheduleForm = ({ property, agent, onContactClick }) => {
  const title = property?.title || "this property";

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "", // Will be populated by useEffect
    agree: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // 1. Check for Cooldown Lock
  useEffect(() => {
    const lastSubmission = window.localStorage.getItem(STORAGE_KEY);
    if (lastSubmission) {
      const timePassed = Date.now() - parseInt(lastSubmission, 10);
      if (timePassed < COOLDOWN_MS) {
        setIsLocked(true);
      } else {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  // 2. Set default message safely so the textarea doesn't bug out
  useEffect(() => {
    if (title && !form.message) {
      setForm((prev) => ({
        ...prev,
        message: `Hello, I am interested in ${title}.`,
      }));
    }
  }, [title]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({
      ...p,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!form.agree) {
      setErrorMsg("Please agree to the Terms of Use.");
      return;
    }

    try {
      setIsSubmitting(true);

      // Trigger analytics if provided
      onContactClick?.({
        source: "schedule_form",
        action: "submit_tour_request",
      });

      const payload = {
        name: form.name,
        email: form.email,
        phone: form.phone,
        message: form.message,
        listing: property?._id || property?.id || undefined,
        agent: agent?._id || agent?.id || undefined,
      };

      const res = await createInquiry(payload);
      if (res?.status=="success") {
        window.localStorage.setItem(STORAGE_KEY, Date.now().toString());
        setIsLocked(true);
      } else {
        setErrorMsg(res?.message || "Failed to send request. Please try again.");
      }
    } catch (err) {
      console.error("Inquiry Error:", err);
      setErrorMsg(
        err?.response?.data?.message || 
        "An error occurred while sending your request. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLocked) {
    return (
      <div className="alert alert-success fz15 mb-0 text-center" style={{ padding: "30px 20px" }}>
        <i className="fas fa-check-circle fz30 mb10" />
        <h5 className="mb-2">Request Received!</h5>
        <p className="mb-0 text-muted">
          You've recently submitted an inquiry. Our team is reviewing it and an agent will contact you shortly. 
          <br/><br/>
          <small>Need immediate assistance? Please contact us via phone or WhatsApp.</small>
        </p>
      </div>
    );
  }

  return (
    <form className="form-style1" onSubmit={handleSubmit}>
      <div className="row">
        
        {errorMsg && (
          <div className="col-12 mb15">
            <div className="alert alert-danger fz14 mb-0">{errorMsg}</div>
          </div>
        )}

        <div className="col-lg-12">
          <div className="mb15">
            <input
              type="text"
              name="name"
              className="form-control"
              placeholder="Name"
              value={form.name}
              onChange={handleChange}
              required
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className="col-md-12">
          <div className="mb15">
            <input
              type="email"
              name="email"
              className="form-control"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              required
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className="col-lg-12">
          <div className="mb15">
            <input
              type="text"
              name="phone"
              className="form-control"
              placeholder="Enter your phone"
              value={form.phone}
              onChange={handleChange}
              required
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className="col-md-12">
          <div className="mb15">
            <textarea
              name="message"
              cols={30}
              rows={4}
              value={form.message}
              onChange={handleChange}
              disabled={isSubmitting}
              required
            />
          </div>
        </div>

        <div className="checkbox-style1 d-block d-sm-flex align-items-center justify-content-between mb10">
          <label className="custom_checkbox fz14 ff-heading">
            By submitting form I agree to Terms of Use
            <input
              type="checkbox"
              name="agree"
              checked={form.agree}
              onChange={handleChange}
              disabled={isSubmitting}
            />
            <span className="checkmark" />
          </label>
        </div>

        <div className="col-md-12">
          <div className="d-grid">
            <button 
              type="submit" 
              className="ud-btn btn-thm" 
              disabled={isSubmitting}
            >
              {isSubmitting ? "Sending..." : "Submit a Tour Request"}
              {!isSubmitting && <i className="fal fa-arrow-right-long" />}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default ScheduleForm;