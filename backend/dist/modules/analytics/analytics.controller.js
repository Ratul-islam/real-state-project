"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.trackEventController = trackEventController;
exports.getListingStatsController = getListingStatsController;
exports.getOverallStatsController = getOverallStatsController;
const responses_js_1 = require("../../utils/responses.js");
const analytics_service_js_1 = require("./analytics.service.js");
async function trackEventController(request, reply) {
    try {
        const body = request.body;
        const result = await (0, analytics_service_js_1.trackListingEvent)({
            listingId: body.listingId,
            type: body.type,
            visitorId: body.visitorId,
            referrer: body.referrer || request.headers.referer || "",
            userAgent: body.userAgent || request.headers["user-agent"] || "",
        });
        if (!result.accepted) {
            return (0, responses_js_1.sendError)(reply, { statusCode: 400, message: result.reason || "Invalid payload" });
        }
        return (0, responses_js_1.sendSuccess)(reply, { statusCode: 200, message: "tracked", data: result });
    }
    catch (err) {
        request.log.error(err);
        return (0, responses_js_1.sendError)(reply, { statusCode: 500, message: "Failed to track event" });
    }
}
async function getListingStatsController(request, reply) {
    try {
        const { id } = request.params;
        const { range } = request.query;
        const data = await (0, analytics_service_js_1.getListingStats)(id, range || "30d");
        return (0, responses_js_1.sendSuccess)(reply, { statusCode: 200, message: "ok", data });
    }
    catch (err) {
        request.log.error(err);
        return (0, responses_js_1.sendError)(reply, { statusCode: 400, message: err?.message || "Failed to get stats" });
    }
}
async function getOverallStatsController(request, reply) {
    try {
        const { range } = request.query;
        const data = await (0, analytics_service_js_1.getOverallStats)(range || "30d");
        return (0, responses_js_1.sendSuccess)(reply, { statusCode: 200, message: "ok", data });
    }
    catch (err) {
        request.log.error(err);
        return (0, responses_js_1.sendError)(reply, { statusCode: 500, message: "Failed to get overall stats" });
    }
}
