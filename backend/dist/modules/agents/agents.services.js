"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAgent = exports.deactivateAgent = exports.updateAgent = exports.getAgentById = exports.getAgents = exports.createAgent = void 0;
const agents_model_js_1 = require("./agents.model.js");
/**
 * Create a new agent profile
 */
const createAgent = async (agentData) => {
    const newAgent = new agents_model_js_1.Agent(agentData);
    return await newAgent.save();
};
exports.createAgent = createAgent;
const getAgents = async (filter = {}, page = 1, limit = 10) => {
    const skip = (page - 1) * limit;
    const agents = await agents_model_js_1.Agent.find(filter)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });
    const total = await agents_model_js_1.Agent.countDocuments(filter);
    return {
        agents,
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page
    };
};
exports.getAgents = getAgents;
const getAgentById = async (id) => {
    return await agents_model_js_1.Agent.findById(id);
};
exports.getAgentById = getAgentById;
const updateAgent = async (id, updateData) => {
    return await agents_model_js_1.Agent.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
};
exports.updateAgent = updateAgent;
const deactivateAgent = async (id) => {
    return await agents_model_js_1.Agent.findByIdAndUpdate(id, { isActive: false }, { new: true });
};
exports.deactivateAgent = deactivateAgent;
const deleteAgent = async (id) => {
    // await Listing.updateMany({ agent: id }, { $unset: { agent: 1 } });
    return await agents_model_js_1.Agent.findByIdAndDelete(id);
};
exports.deleteAgent = deleteAgent;
