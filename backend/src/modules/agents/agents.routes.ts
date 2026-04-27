import { FastifyInstance } from "fastify";
import {
  createAgentHandler,
  getAgentsHandler,
  getAgentByIdHandler,
  updateAgentHandler,
  deleteAgentHandler,
} from "./agents.controller.js";

export default async function agentRoutes(app: FastifyInstance) {
  app.post("/", {preHandler: [(app as any).verifyAccess]}, createAgentHandler);

  app.get("/", getAgentsHandler);

  app.get("/:id", getAgentByIdHandler);

  app.patch("/:id",{preHandler: [(app as any).verifyAccess]}, updateAgentHandler);

  app.delete("/:id", {preHandler: [(app as any).verifyAccess]}, deleteAgentHandler);
}