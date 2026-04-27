import type { FastifyReply, FastifyRequest } from "fastify";
import * as inquiryService from "./inquiry.service.js";
import { sendError, sendSuccess } from "../../utils/responses.js";

export const createInquiryHandler = async (
  req: FastifyRequest<{ Body: Record<string, any> }>, 
  reply: FastifyReply
) => {
  try {
    const inquiry = await inquiryService.createInquiry(req.body);
    return sendSuccess(reply, { 
      statusCode: 201, 
      message: "Inquiry sent successfully", 
      data: inquiry 
    });
  } catch (error: any) {
    return sendError(reply, { 
      statusCode: 400, 
      message: "Failed to send inquiry", 
      errors: error.message 
    });
  }
};

export const getInquiriesHandler = async (
  req: FastifyRequest<{ Querystring: any }>,
  reply: FastifyReply
) => {
  try {
    const data = await inquiryService.getInquiries(req.query);
    return sendSuccess(reply, { statusCode: 200, message: "Inquiries fetched", data });
  } catch (error: any) {
    return sendError(reply, { statusCode: 500, message: "Error fetching inquiries" });
  }
};

export const getInquiryByIdHandler = async (
  req: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) => {
  try {
    const data = await inquiryService.getInquiryById(req.params.id);
    return sendSuccess(reply, { statusCode: 200, message: "Inquiry fetched", data });
  } catch (error: any) {
    return sendError(reply, { statusCode: error.statusCode || 500, message: error.message });
  }
};

export const updateInquiryStatusHandler = async (
  req: FastifyRequest<{ Params: { id: string }; Body: { status: string } }>,
  reply: FastifyReply
) => {
  try {
    const data = await inquiryService.updateInquiryStatus(req.params.id, req.body.status);
    return sendSuccess(reply, { statusCode: 200, message: "Status updated", data });
  } catch (error: any) {
    return sendError(reply, { statusCode: error.statusCode || 400, message: error.message });
  }
};

export const deleteInquiryHandler = async (
  req: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) => {
  try {
    await inquiryService.deleteInquiry(req.params.id);
    return sendSuccess(reply, { statusCode: 200, message: "Inquiry deleted" });
  } catch (error: any) {
    return sendError(reply, { statusCode: error.statusCode || 500, message: error.message });
  }
};