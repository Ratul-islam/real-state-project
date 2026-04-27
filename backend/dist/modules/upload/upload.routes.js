"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = uploadRoutes;
const upload_controller_js_1 = require("./upload.controller.js");
async function uploadRoutes(app) {
    app.post("/", { preHandler: [app.verifyAccess] }, async (request, reply) => {
        await (0, upload_controller_js_1.uploadImages)(request, reply);
    });
}
