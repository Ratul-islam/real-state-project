"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = analyticsRoutes;
const analytics_controller_js_1 = require("./analytics.controller.js");
async function analyticsRoutes(fastify) {
    fastify.post("/track", {
        schema: {
            body: {
                type: "object",
                required: ["listingId", "type", "visitorId"],
                properties: {
                    listingId: { type: "string" },
                    type: { type: "string", enum: ["page_view", "contact_click", "share_click", "save_click"] },
                    visitorId: { type: "string", minLength: 6 },
                    referrer: { type: "string", default: "" },
                    userAgent: { type: "string", default: "" },
                },
                additionalProperties: true,
            },
        },
        handler: analytics_controller_js_1.trackEventController,
    });
    fastify.get("/listing/:id", {
        schema: {
            params: {
                type: "object",
                required: ["id"],
                properties: { id: { type: "string" } },
            },
            querystring: {
                type: "object",
                properties: { range: { type: "string", default: "30d" } },
            },
        },
        handler: analytics_controller_js_1.getListingStatsController,
    });
    fastify.get("/overall", {
        schema: {
            querystring: {
                type: "object",
                properties: { range: { type: "string", default: "30d" } },
            },
        },
        handler: analytics_controller_js_1.getOverallStatsController,
    });
}
