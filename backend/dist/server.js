"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
const application_js_1 = require("./application.js");
let appPromise = null;
function getApp() {
    if (!appPromise) {
        appPromise = (0, application_js_1.buildApp)();
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
        }
        catch (err) {
            app.log.error(err);
            process.exit(1);
        }
    }
}
void startDevServer();
async function handler(req, res) {
    const app = await getApp();
    await app.ready();
    app.server.emit("request", req, res);
}
