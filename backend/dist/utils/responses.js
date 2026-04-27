"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendError = exports.sendSuccess = void 0;
const sendSuccess = (reply, { data = null, message = 'Success', statusCode = 200 } = {}) => {
    // const { data = null, message = 'Success', statusCode = 200 } = options
    return reply.status(statusCode).send({
        status: 'success',
        message,
        data,
    });
};
exports.sendSuccess = sendSuccess;
const sendError = (reply, { message, statusCode = 400, errors = null }) => {
    // const { message, statusCode = 400, errors = null } = options
    return reply.status(statusCode).send({
        status: 'error',
        message,
        errors,
    });
};
exports.sendError = sendError;
