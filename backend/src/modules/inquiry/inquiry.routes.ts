import type { FastifyInstance } from "fastify";
import {
  createInquiryHandler,
  getInquiriesHandler,
  getInquiryByIdHandler,
  updateInquiryStatusHandler,
  deleteInquiryHandler,
} from "./inquiry.controller.js";

export default async function inquiryRoutes(app: FastifyInstance) {
  app.post("/", {
    config: {
      rateLimit: {
        max: 3, 
        timeWindow: 1000 * 60 * 60 * 10,
      }
    }
  },createInquiryHandler);

  app.get("/", { preHandler: [(app as any).verifyAccess] }, getInquiriesHandler);
  
  app.get("/:id", { preHandler: [(app as any).verifyAccess] }, getInquiryByIdHandler);
  
  app.patch("/:id/status", { preHandler: [(app as any).verifyAccess] }, updateInquiryStatusHandler);
  
  app.delete("/:id", { preHandler: [(app as any).verifyAccess] }, deleteInquiryHandler);
}