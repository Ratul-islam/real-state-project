"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildApp = buildApp;
const rate_limit_1 = __importDefault(require("@fastify/rate-limit"));
const fastify_1 = __importDefault(require("fastify"));
const autoload_1 = __importDefault(require("@fastify/autoload"));
const node_path_1 = __importDefault(require("node:path"));
const db_js_1 = require("./config/db.js");
const cookie_1 = __importDefault(require("@fastify/cookie"));
const multipart_1 = __importDefault(require("@fastify/multipart"));
const static_1 = __importDefault(require("@fastify/static"));
const cors_1 = __importDefault(require("@fastify/cors"));
async function buildApp() {
    const app = (0, fastify_1.default)({ logger: true });
    await (0, db_js_1.connectDB)();
    app.register(cookie_1.default);
    app.register(cors_1.default, {
        credentials: true,
        origin: (origin, cb) => {
            if (!origin)
                return cb(null, true);
            if (origin === "http://localhost:3000" ||
                origin === process.env.FRONTEND_URL) {
                return cb(null, true);
            }
            return cb(new Error("Not allowed by CORS"), false);
        },
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
    });
    app.register(rate_limit_1.default, {
        global: false,
        errorResponseBuilder: function (request, context) {
            return {
                statusCode: 429,
                error: 'Too Many Requests',
                message: `You have reached the maximum allowed requests. Please try again later.`,
            };
        },
    });
    await app.register(multipart_1.default, {
        limits: { fileSize: 10 * 1024 * 1024 },
        attachFieldsToBody: false,
        throwFileSizeLimit: true,
    });
    const uploadDir = node_path_1.default.join(process.cwd(), "uploads");
    await app.register(static_1.default, {
        root: uploadDir,
        prefix: "/uploads/",
    });
    await app.register(autoload_1.default, {
        dir: node_path_1.default.join(__dirname, "plugins"),
        encapsulate: false,
    });
    await app.register(autoload_1.default, {
        dir: node_path_1.default.join(__dirname, "modules"),
        matchFilter: (p) => /\.routes\.(ts|js)$/.test(p),
        options: { prefix: "/api/v1" },
    });
    app.ready(() => {
        console.log(app.printRoutes());
    });
    return app;
}
