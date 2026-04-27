import { api } from "@/lib/axios/client";

/* ---------------- Agents ---------------- */

export async function createAgent(payload) {
  const res = await api.post("/agents", payload);
  return res.data;
}

export async function updateAgent(id, payload) {
  if (!id) throw new Error("Agent id is required");
  // Uses your PATCH /:id route
  const res = await api.patch(`/agents/${id}`, payload);
  return res.data;
}

export async function deleteAgent(id) {
  if (!id) throw new Error("Agent id is required");
  // Uses your DELETE /:id route
  const res = await api.delete(`/agents/${id}`);
  return res.data;
}

export async function getAgents(query = {}) {
  // Uses your GET / route
  const res = await api.get("/agents", { params: query });
  return res.data;
}

export async function getAgentById(id) {
  if (!id) throw new Error("Agent id is required");
  // Uses your GET /:id route
  const res = await api.get(`/agents/${id}`);
  return res.data;
}