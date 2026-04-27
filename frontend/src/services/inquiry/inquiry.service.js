import { api } from "@/lib/axios/client";

/* ---------------- Inquiries ---------------- */

export async function createInquiry(payload) {
  // Uses your public POST / route
  const res = await api.post("/inquiry", payload);
  return res.data;
}

export async function getInquiries(query = {}) {
  // Uses your protected GET / route
  const res = await api.get("/inquiry", { params: query });
  return res.data;
}

export async function getInquiryById(id) {
  if (!id) throw new Error("Inquiry id is required");
  // Uses your protected GET /:id route
  const res = await api.get(`/inquiry/${id}`);
  return res.data;
}

export async function updateInquiryStatus(id, status) {
  if (!id) throw new Error("Inquiry id is required");
  if (!status) throw new Error("Status is required");
  // Uses your protected PATCH /:id/status route
  const res = await api.patch(`/inquiry/${id}/status`, { status });
  return res.data;
}

export async function deleteInquiry(id) {
  if (!id) throw new Error("Inquiry id is required");
  // Uses your protected DELETE /:id route
  const res = await api.delete(`/inquiry/${id}`);
  return res.data;
}