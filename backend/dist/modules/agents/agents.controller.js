"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAgentHandler = exports.deactivateAgentHandler = exports.updateAgentHandler = exports.getAgentByIdHandler = exports.getAgentsHandler = exports.createAgentHandler = void 0;
const agentService = __importStar(require("./agents.services.js"));
const responses_1 = require("../../utils/responses");
// --- Controller Functions ---
const createAgentHandler = async (req, reply) => {
    try {
        const agent = await agentService.createAgent(req.body);
        return reply.status(201).send({ success: true, data: agent });
    }
    catch (error) {
        if (error.code === 11000) {
            return (0, responses_1.sendError)(reply, { message: "Email already exists.", statusCode: 409 });
        }
        return (0, responses_1.sendError)(reply, {
            message: "Something went wrong while creating the agent.",
            statusCode: 400,
            errors: error.message
        });
    }
};
exports.createAgentHandler = createAgentHandler;
const getAgentsHandler = async (req, reply) => {
    try {
        const { page = "1", limit = "10", activeOnly } = req.query;
        // Build filter based on query params
        const filter = activeOnly === "true" ? { isActive: true } : {};
        const result = await agentService.getAgents(filter, parseInt(page, 10), parseInt(limit, 10));
        return reply.status(200).send({ success: true, data: result });
    }
    catch (error) {
        return (0, responses_1.sendError)(reply, {
            message: "Failed to fetch agents.",
            statusCode: 500,
            errors: error.message
        });
    }
};
exports.getAgentsHandler = getAgentsHandler;
const getAgentByIdHandler = async (req, reply) => {
    try {
        const agent = await agentService.getAgentById(req.params.id);
        if (!agent) {
            return (0, responses_1.sendError)(reply, { message: "Agent not found.", statusCode: 404 });
        }
        return reply.status(200).send({ success: true, data: agent });
    }
    catch (error) {
        return (0, responses_1.sendError)(reply, {
            message: "Failed to fetch agent details.",
            statusCode: 500,
            errors: error.message
        });
    }
};
exports.getAgentByIdHandler = getAgentByIdHandler;
const updateAgentHandler = async (req, reply) => {
    try {
        const updatedAgent = await agentService.updateAgent(req.params.id, req.body);
        if (!updatedAgent) {
            return (0, responses_1.sendError)(reply, { message: "Agent not found.", statusCode: 404 });
        }
        return reply.status(200).send({ success: true, data: updatedAgent });
    }
    catch (error) {
        return (0, responses_1.sendError)(reply, {
            message: "Failed to update agent.",
            statusCode: 400,
            errors: error.message
        });
    }
};
exports.updateAgentHandler = updateAgentHandler;
const deactivateAgentHandler = async (req, reply) => {
    try {
        const deactivatedAgent = await agentService.deactivateAgent(req.params.id);
        if (!deactivatedAgent) {
            return (0, responses_1.sendError)(reply, { message: "Agent not found.", statusCode: 404 });
        }
        return reply.status(200).send({
            success: true,
            message: "Agent deactivated successfully",
            data: deactivatedAgent
        });
    }
    catch (error) {
        return (0, responses_1.sendError)(reply, {
            message: "Failed to deactivate agent.",
            statusCode: 500,
            errors: error.message
        });
    }
};
exports.deactivateAgentHandler = deactivateAgentHandler;
const deleteAgentHandler = async (req, reply) => {
    try {
        const deletedAgent = await agentService.deleteAgent(req.params.id);
        if (!deletedAgent) {
            return (0, responses_1.sendError)(reply, { message: "Agent not found.", statusCode: 404 });
        }
        return reply.status(200).send({
            success: true,
            message: "Agent permanently deleted"
        });
    }
    catch (error) {
        return (0, responses_1.sendError)(reply, {
            message: "Failed to delete agent.",
            statusCode: 500,
            errors: error.message
        });
    }
};
exports.deleteAgentHandler = deleteAgentHandler;
