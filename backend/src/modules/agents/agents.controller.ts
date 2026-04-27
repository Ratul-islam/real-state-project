import { FastifyRequest, FastifyReply } from "fastify";
import * as agentService from "./agents.services.js";
import { IAgent } from "./agents.types.js";
import { sendError } from "../../utils/responses";

// --- Types for Fastify Requests ---
interface PaginationQuery {
  page?: string;
  limit?: string;
  activeOnly?: string;
}

interface AgentParams {
  id: string;
}

// --- Controller Functions ---

export const createAgentHandler = async (
  req: FastifyRequest<{ Body: Partial<IAgent> }>,
  reply: FastifyReply
) => {
  try {
    const agent = await agentService.createAgent(req.body);
    return reply.status(201).send({ success: true, data: agent });
  } catch (error: any) {
    if (error.code === 11000) {
      return sendError(reply, { message: "Email already exists.", statusCode: 409 });
    }
    return sendError(reply, { 
      message: "Something went wrong while creating the agent.", 
      statusCode: 400, 
      errors: error.message 
    });
  }
};

export const getAgentsHandler = async (
  req: FastifyRequest<{ Querystring: PaginationQuery }>,
  reply: FastifyReply
) => {
  try {
    const { page = "1", limit = "10", activeOnly } = req.query;
    
    // Build filter based on query params
    const filter = activeOnly === "true" ? { isActive: true } : {};
    
    const result = await agentService.getAgents(
      filter,
      parseInt(page, 10),
      parseInt(limit, 10)
    );
    
    return reply.status(200).send({ success: true, data: result });
  } catch (error: any) {
    return sendError(reply, { 
      message: "Failed to fetch agents.", 
      statusCode: 500, 
      errors: error.message 
    });
  }
};

export const getAgentByIdHandler = async (
  req: FastifyRequest<{ Params: AgentParams }>,
  reply: FastifyReply
) => {
  try {
    const agent = await agentService.getAgentById(req.params.id);
    
    if (!agent) {
      return sendError(reply, { message: "Agent not found.", statusCode: 404 });
    }
    
    return reply.status(200).send({ success: true, data: agent });
  } catch (error: any) {
    return sendError(reply, { 
      message: "Failed to fetch agent details.", 
      statusCode: 500, 
      errors: error.message 
    });
  }
};

export const updateAgentHandler = async (
  req: FastifyRequest<{ Params: AgentParams; Body: Partial<IAgent> }>,
  reply: FastifyReply
) => {
  try {
    const updatedAgent = await agentService.updateAgent(req.params.id, req.body);
    
    if (!updatedAgent) {
      return sendError(reply, { message: "Agent not found.", statusCode: 404 });
    }
    
    return reply.status(200).send({ success: true, data: updatedAgent });
  } catch (error: any) {
    return sendError(reply, { 
      message: "Failed to update agent.", 
      statusCode: 400, 
      errors: error.message 
    });
  }
};

export const deactivateAgentHandler = async (
  req: FastifyRequest<{ Params: AgentParams }>,
  reply: FastifyReply
) => {
  try {
    const deactivatedAgent = await agentService.deactivateAgent(req.params.id);
    
    if (!deactivatedAgent) {
      return sendError(reply, { message: "Agent not found.", statusCode: 404 });
    }
    
    return reply.status(200).send({ 
      success: true, 
      message: "Agent deactivated successfully", 
      data: deactivatedAgent 
    });
  } catch (error: any) {
    return sendError(reply, { 
      message: "Failed to deactivate agent.", 
      statusCode: 500, 
      errors: error.message 
    });
  }
};

export const deleteAgentHandler = async (
  req: FastifyRequest<{ Params: AgentParams }>,
  reply: FastifyReply
) => {
  try {
    const deletedAgent = await agentService.deleteAgent(req.params.id);
    
    if (!deletedAgent) {
      return sendError(reply, { message: "Agent not found.", statusCode: 404 });
    }
    
    return reply.status(200).send({ 
      success: true, 
      message: "Agent permanently deleted" 
    });
  } catch (error: any) {
    return sendError(reply, { 
      message: "Failed to delete agent.", 
      statusCode: 500, 
      errors: error.message 
    });
  }
};