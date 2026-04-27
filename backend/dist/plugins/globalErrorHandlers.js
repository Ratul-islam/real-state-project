"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = errorHandler;
const responses_js_1 = require("../utils/responses.js");
async function errorHandler(app) {
    app.setErrorHandler((error, request, reply) => {
        if (error.code === "FST_ERR_VALIDATION" || error.validation) {
            return (0, responses_js_1.sendError)(reply, {
                statusCode: 402,
                message: "Validation error",
                errors: {
                    message: error.message,
                    details: error.validation ?? [],
                },
            });
        }
        return (0, responses_js_1.sendError)(reply, {
            statusCode: error.statusCode ?? 500,
            message: error.message ?? "Internal Server Error",
            errors: error
        });
    });
}
