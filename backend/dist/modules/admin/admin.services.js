"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAdmin = exports.getAdmin = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const admin_model_js_1 = require("./admin.model.js");
const bcrypt_1 = __importDefault(require("bcrypt"));
const AppError_js_1 = require("../../utils/AppError.js");
const getAdmin = async (query) => {
    if (query.id) {
        if (!mongoose_1.default.Types.ObjectId.isValid(query.id))
            return null;
        return admin_model_js_1.Admin.findById(query.id).exec();
    }
    const mongoQuery = {};
    if (query.email)
        mongoQuery.email = query.email;
    if (query.refreshToken)
        mongoQuery.refreshToken = query.refreshToken;
    if (Object.keys(mongoQuery).length === 0) {
        throw new Error('Provide at least one search field');
    }
    return admin_model_js_1.Admin.findOne(mongoQuery).select("+password").exec();
};
exports.getAdmin = getAdmin;
const createAdmin = async (input) => {
    const existing = await admin_model_js_1.Admin.findOne({ email: input.email }).exec();
    if (existing) {
        throw new AppError_js_1.AppError("Admin with this email already exists", 409);
    }
    const hashedPassword = await bcrypt_1.default.hash(input.password, 12);
    const admin = new admin_model_js_1.Admin({
        name: input.name,
        email: input.email,
        password: hashedPassword,
    });
    await admin.save();
    return admin;
};
exports.createAdmin = createAdmin;
