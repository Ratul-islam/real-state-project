"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testFunc = async (app) => {
    app.get("/", async (request, reply) => {
        reply.code(200).send({ message: "jdhsgfjhghjdsg" });
    });
};
exports.default = testFunc;
