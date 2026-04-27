"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_plugin_1 = __importDefault(require("fastify-plugin"));
const jwt_1 = __importDefault(require("@fastify/jwt"));
exports.default = (0, fastify_plugin_1.default)(async (app) => {
    const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
    const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
    const RESET_SECRET = process.env.JWT_PASS_RESET_SECRET;
    if (!ACCESS_SECRET || !REFRESH_SECRET || !RESET_SECRET) {
        throw new Error("JWT secrets missing");
    }
    app.register(jwt_1.default, {
        secret: ACCESS_SECRET,
        namespace: "access",
        sign: { expiresIn: "15m" },
    });
    app.register(jwt_1.default, {
        secret: REFRESH_SECRET,
        namespace: "refresh",
        sign: { expiresIn: "7d" },
    });
    app.register(jwt_1.default, {
        secret: RESET_SECRET,
        namespace: "reset",
        sign: { expiresIn: "2m" },
    });
    app.decorate("verifyAccess", async (request, reply) => {
        try {
            let token = null;
            const auth = request.headers.authorization;
            if (auth?.startsWith("Bearer ")) {
                token = auth.slice(7);
            }
            if (!token && request.cookies?.accessToken) {
                token = request.cookies.accessToken;
            }
            if (!token) {
                return reply.code(401).send({ message: "Missing access token" });
            }
            const payload = app.jwt.access.verify(token);
            request.user = payload;
        }
        catch (err) {
            return reply.code(401).send({ message: "Unauthorized" });
        }
    });
});
