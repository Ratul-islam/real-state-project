"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendOTPEmail = void 0;
const email_js_1 = require("../../utils/email.js");
const email_template_js_1 = require("./email.template.js");
const sendOTPEmail = async (fastify, email, otp, type, expiresInMinutes) => {
    const template = email_template_js_1.emailTemplates[type];
    if (!template) {
        throw new Error(`No email template defined for OTP type: ${type}`);
    }
    const { subject, html } = template(otp, expiresInMinutes);
    console.log(otp);
    await (0, email_js_1.sendEmail)(fastify, { to: email, subject, html });
};
exports.sendOTPEmail = sendOTPEmail;
