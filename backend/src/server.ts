import { buildApp } from "./application.js";

let appPromise: Promise<Awaited<ReturnType<typeof buildApp>>> | null = null;

function getApp() {
  if (!appPromise) {
    appPromise = buildApp();
  }
  return appPromise;
}

async function startDevServer() {
  const app = await getApp();

  if (process.env.NODE_ENV !== "production") {
    const PORT = 8000;
    try {
      await app.listen({ port: PORT, host: "0.0.0.0" });
      console.log(`Server started at ${PORT}`);
    } catch (err) {
      app.log.error(err);
      process.exit(1);
    }
  }
}

void startDevServer();

export default async function handler(req: any, res: any) {
  const app = await getApp();
  await app.ready();
  app.server.emit("request", req, res);
}
