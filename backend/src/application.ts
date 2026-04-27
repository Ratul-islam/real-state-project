import rateLimit from '@fastify/rate-limit';
import Fastify from "fastify";
import AutoLoad from "@fastify/autoload";
import path from "node:path";
import { connectDB } from "./config/db.js";
import cookie from "@fastify/cookie";
import multipart from "@fastify/multipart";
import fastifyStatic from "@fastify/static";
import cors from "@fastify/cors";

export async function buildApp() {
  const app = Fastify({ logger: true });

  await connectDB();

  app.register(cookie);

  app.register(cors, {
    credentials: true,
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);

      if (
        origin === "http://localhost:3000" ||
        origin === process.env.FRONTEND_URL
      ) {
        return cb(null, true);
      }

      return cb(new Error("Not allowed by CORS"), false);
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  });


app.register(rateLimit, {
  global: false,
  errorResponseBuilder: function (request, context) {
    return {
      statusCode: 429,
      error: 'Too Many Requests',
      message: `You have reached the maximum allowed requests. Please try again later.`,
    };
  },
});

  await app.register(multipart, {
    limits: { fileSize: 10 * 1024 * 1024 },
    attachFieldsToBody: false,
    throwFileSizeLimit: true,
  });

  const uploadDir = path.join(process.cwd(), "uploads");
  await app.register(fastifyStatic, {
    root: uploadDir,
    prefix: "/uploads/",
  });

  await app.register(AutoLoad, {
    dir: path.join(__dirname, "plugins"),
    encapsulate: false,
  });

  await app.register(AutoLoad, {
    dir: path.join(__dirname, "modules"),
    matchFilter: (p) => /\.routes\.(ts|js)$/.test(p),
    options: { prefix: "/api/v1" },
  });

  app.ready(() => {
    console.log(app.printRoutes());
  });

  return app;
}
