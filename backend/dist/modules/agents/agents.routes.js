"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = agentRoutes;
const agents_controller_js_1 = require("./agents.controller.js");
async function agentRoutes(app) {
    app.post("/", { preHandler: [app.verifyAccess] }, agents_controller_js_1.createAgentHandler);
    app.get("/", agents_controller_js_1.getAgentsHandler);
    app.get("/:id", agents_controller_js_1.getAgentByIdHandler);
    app.patch("/:id", { preHandler: [app.verifyAccess] }, agents_controller_js_1.updateAgentHandler);
    app.delete("/:id", { preHandler: [app.verifyAccess] }, agents_controller_js_1.deleteAgentHandler);
}
