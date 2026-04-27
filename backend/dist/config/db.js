"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = connectDB;
const mongoose_1 = __importDefault(require("mongoose"));
require("dotenv/config");
const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/mydb';
async function connectDB() {
    try {
        await mongoose_1.default.connect(MONGO_URL);
        console.log('MongoDB connected via Mongoose!');
    }
    catch (err) {
        console.error('MongoDB connection failed:', err);
        process.exit(1);
    }
}
