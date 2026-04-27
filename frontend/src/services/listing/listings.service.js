import { api } from "@/lib/axios/client";


export async function uploadImages(files) {
  const form = new FormData();
  Array.from(files).forEach((file) => form.append("files", file));

  const res = await api.post("/upload", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data;
}

export async function uploadImage(file) {
  const form = new FormData();
  form.append("files", file);

  const res = await api.post("/upload", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  const payload = res.data;
  return payload?.data?.[0];
}

/* ---------------- Listings ---------------- */

export async function createListing(payload) {
  const res = await api.post("/listings/add", payload);
  return res.data;
}

export async function updateListing(id, payload) {
  if (!id) throw new Error("Listing id is required");
  const res = await api.put(`/listings/${id}`, payload);
  return res.data;
}

export async function deleteListing(id) {
  if (!id) throw new Error("Listing id is required");
  const res = await api.delete(`/listings/${id}`);
  return res.data;
}

export async function getListings(query = {}) {
  const res = await api.get("/listings", { params: query });
  return res.data;
}

export async function getListingById(id) {
  if (!id) throw new Error("Listing id is required");
  const res = await api.get(`/listings/${id}`);
  return res.data;
}
export async function getListingBySlug(slug) {
  if (!slug) throw new Error("Listing slug is required");
  const res = await api.get(`/listings/slug/${slug}`);
  return res.data;
}