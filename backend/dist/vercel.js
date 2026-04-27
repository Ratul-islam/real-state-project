"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
const application_js_1 = require("./application.js");
let appPromise = null;
async function getApp() {
    if (!appPromise)
        appPromise = (0, application_js_1.buildApp)();
    const app = await appPromise;
    await app.ready();
    return app;
}
async function handler(req, res) {
    const app = await getApp();
    app.server.emit("request", req, res);
}
