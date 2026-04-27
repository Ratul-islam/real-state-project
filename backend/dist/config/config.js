"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConfig = exports.setConfig = void 0;
let config = null;
const setConfig = (c) => { config = c; };
exports.setConfig = setConfig;
const getConfig = () => {
    if (!config)
        throw new Error('Config not initialized');
    return config;
};
exports.getConfig = getConfig;
