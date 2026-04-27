import { Agent } from "./agents.model.js";

import { IAgent } from "./agents.types.js";




/**
 * Create a new agent profile
 */
export const createAgent = async (agentData: Partial<IAgent>) => {
  const newAgent = new Agent(agentData);
  return await newAgent.save();
};

export const getAgents = async (
  filter: Record<string, any> = {},
  page: number = 1,
  limit: number = 10
) => {
  const skip = (page - 1) * limit;
  
  const agents = await Agent.find(filter)
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });
    
  const total = await Agent.countDocuments(filter);
  
  return { 
    agents, 
    total, 
    totalPages: Math.ceil(total / limit),
    currentPage: page 
  };
};

export const getAgentById = async (id: string) => {
  return await Agent.findById(id);
};

export const updateAgent = async (id: string, updateData: Partial<IAgent>) => {
  return await Agent.findByIdAndUpdate(
    id, 
    updateData, 
    { new: true, runValidators: true }
  );
};

export const deactivateAgent = async (id: string) => {
  return await Agent.findByIdAndUpdate(
    id, 
    { isActive: false }, 
    { new: true }
  );
};

export const deleteAgent = async (id: string) => {
  // await Listing.updateMany({ agent: id }, { $unset: { agent: 1 } });
  
  return await Agent.findByIdAndDelete(id);
};
