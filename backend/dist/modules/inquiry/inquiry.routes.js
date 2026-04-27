"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = inquiryRoutes;
const inquiry_controller_js_1 = require("./inquiry.controller.js");
async function inquiryRoutes(app) {
    app.post("/", {
        config: {
            rateLimit: {
                max: 3,
                timeWindow: 1000 * 60 * 60 * 10,
            }
        }
    }, inquiry_controller_js_1.createInquiryHandler);
    app.get("/", { preHandler: [app.verifyAccess] }, inquiry_controller_js_1.getInquiriesHandler);
    app.get("/:id", { preHandler: [app.verifyAccess] }, inquiry_controller_js_1.getInquiryByIdHandler);
    app.patch("/:id/status", { preHandler: [app.verifyAccess] }, inquiry_controller_js_1.updateInquiryStatusHandler);
    app.delete("/:id", { preHandler: [app.verifyAccess] }, inquiry_controller_js_1.deleteInquiryHandler);
}
