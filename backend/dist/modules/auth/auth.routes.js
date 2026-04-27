"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = authRoutes;
const auth_controller_js_1 = require("./auth.controller.js");
async function authRoutes(app) {
    app.post("/signup", {
        schema: {
            body: {
                type: "object",
                required: ["name", "email", "password"],
                properties: {
                    email: { type: "string", format: "email" },
                    password: { type: "string", minLength: 6 },
                    name: { type: "string" }
                },
            },
        },
    }, async (request, reply) => {
        await (0, auth_controller_js_1.signup)(request, reply, app);
    });
    app.post("/login", {
        schema: {
            body: {
                type: "object",
                required: ["email", "password"],
                properties: {
                    email: { type: "string", format: "email" },
                    password: { type: "string", minLength: 6 },
                },
            },
        },
    }, async (request, reply) => {
        await (0, auth_controller_js_1.login)(request, reply, app);
    });
    app.post("/refresh", {
        schema: {
            body: {
                type: "object",
                required: ["refreshToken"],
                properties: {
                    refreshToken: { type: "string", minLength: 10 },
                },
            },
        },
    }, async (request, reply) => {
        await (0, auth_controller_js_1.renewToken)(request, reply, app);
    });
    app.post("/password-reset/request", {
        schema: {
            body: {
                type: "object",
                required: ["email"],
                properties: {
                    email: { type: "string", format: "email" },
                },
            },
        },
    }, async (request, reply) => {
        await (0, auth_controller_js_1.requestPasswordReset)(request, reply, app);
    });
    app.post("/password-reset/verify-otp", {
        schema: {
            body: {
                type: "object",
                required: ["email", "otp"],
                properties: {
                    email: { type: "string", format: "email" },
                    otp: { type: "string", minLength: 6, maxLength: 6 },
                },
            },
        },
    }, async (request, reply) => {
        await (0, auth_controller_js_1.verifyPasswordResetOtp)(request, reply, app);
    });
    app.post("/password-reset/confirm", {
        schema: {
            body: {
                type: "object",
                required: ["resetToken", "newPassword"],
                properties: {
                    resetToken: { type: "string", },
                    newPassword: { type: "string", minLength: 6 },
                },
            },
        },
    }, async (request, reply) => {
        await (0, auth_controller_js_1.resetPassword)(request, reply, app);
    });
    app.post("/logout", {
        schema: {},
    }, async (request, reply) => {
        await (0, auth_controller_js_1.logout)(request, reply);
    });
}
