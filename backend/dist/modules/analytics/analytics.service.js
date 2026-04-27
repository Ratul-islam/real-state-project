"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.trackListingEvent = trackListingEvent;
exports.getListingStats = getListingStats;
exports.getOverallStats = getOverallStats;
const mongoose_1 = __importDefault(require("mongoose"));
const eventAnalytics_model_js_1 = require("./eventAnalytics.model.js");
const dailyEvent_model_js_1 = require("./dailyEvent.model.js");
const listing_model_js_1 = require("../listings/listing.model.js");
function dayStringUTC(d) {
    const yyyy = d.getUTCFullYear();
    const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
    const dd = String(d.getUTCDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
}
function parseRangeToDates(range) {
    const now = new Date();
    const n = Number(String(range || "30d").replace("d", "")) || 30;
    const from = new Date(now.getTime() - n * 24 * 60 * 60 * 1000);
    return { from, to: now };
}
const DEDUP_WINDOW_MS = 30 * 60 * 1000;
async function trackListingEvent(payload) {
    const { listingId, type, visitorId } = payload;
    if (!mongoose_1.default.isValidObjectId(listingId)) {
        return { accepted: false, reason: "Invalid listingId" };
    }
    if (!visitorId || visitorId.length < 6) {
        return { accepted: false, reason: "Invalid visitorId" };
    }
    const now = new Date();
    if (type === "page_view") {
        const since = new Date(now.getTime() - DEDUP_WINDOW_MS);
        const exists = await eventAnalytics_model_js_1.ListingEvent.findOne({
            listingId,
            type,
            visitorId,
            ts: { $gte: since },
        }).select({ _id: 1 });
        if (exists) {
            return { accepted: true, deduped: true };
        }
    }
    await eventAnalytics_model_js_1.ListingEvent.create({
        listingId,
        type,
        visitorId,
        referrer: payload.referrer || "",
        userAgent: payload.userAgent || "",
        ts: now,
    });
    const day = dayStringUTC(now);
    const inc = {};
    if (type === "page_view")
        inc.views = 1;
    if (type === "contact_click")
        inc.contactClicks = 1;
    if (type === "share_click")
        inc.shareClicks = 1;
    if (type === "save_click")
        inc.saveClicks = 1;
    await dailyEvent_model_js_1.ListingStatsDaily.updateOne({ listingId, day }, {
        $inc: inc,
        $addToSet: { visitorIds: visitorId },
        $setOnInsert: { listingId, day },
    }, { upsert: true });
    const doc = await dailyEvent_model_js_1.ListingStatsDaily.findOne({ listingId, day }).select({ visitorIds: 1 }).lean();
    await dailyEvent_model_js_1.ListingStatsDaily.updateOne({ listingId, day }, { $set: { uniqueVisitors: doc?.visitorIds?.length ?? 0 } });
    return { accepted: true, deduped: false };
}
async function getListingStats(listingId, range = "30d") {
    if (!mongoose_1.default.isValidObjectId(listingId)) {
        throw new Error("Invalid listingId");
    }
    const { from, to } = parseRangeToDates(range);
    const fromDay = dayStringUTC(from);
    const toDay = dayStringUTC(to);
    const daily = await dailyEvent_model_js_1.ListingStatsDaily.find({
        listingId,
        day: { $gte: fromDay, $lte: toDay },
    })
        .select({ visitorIds: 0 })
        .sort({ day: 1 })
        .lean();
    const totals = daily.reduce((acc, d) => {
        acc.views += d.views || 0;
        acc.contactClicks += d.contactClicks || 0;
        acc.shareClicks += d.shareClicks || 0;
        acc.saveClicks += d.saveClicks || 0;
        acc.uniqueVisitors += d.uniqueVisitors || 0;
        return acc;
    }, { views: 0, contactClicks: 0, shareClicks: 0, saveClicks: 0, uniqueVisitors: 0 });
    return { listingId, range, from, to, totals, daily };
}
async function getOverallStats(range = "30d") {
    const { from, to } = parseRangeToDates(range);
    const fromDay = dayStringUTC(from);
    const toDay = dayStringUTC(to);
    const dailyAll = await dailyEvent_model_js_1.ListingStatsDaily.aggregate([
        { $match: { day: { $gte: fromDay, $lte: toDay } } },
        {
            $group: {
                _id: "$day",
                views: { $sum: "$views" },
                contactClicks: { $sum: "$contactClicks" },
                shareClicks: { $sum: "$shareClicks" },
                saveClicks: { $sum: "$saveClicks" },
                uniqueVisitors: { $sum: "$uniqueVisitors" },
            },
        },
        { $sort: { _id: 1 } },
        {
            $project: {
                _id: 0,
                day: "$_id",
                views: 1,
                contactClicks: 1,
                shareClicks: 1,
                saveClicks: 1,
                uniqueVisitors: 1,
            },
        },
    ]);
    const totals = dailyAll.reduce((acc, d) => {
        acc.views += d.views || 0;
        acc.contactClicks += d.contactClicks || 0;
        acc.shareClicks += d.shareClicks || 0;
        acc.saveClicks += d.saveClicks || 0;
        acc.uniqueVisitors += d.uniqueVisitors || 0;
        return acc;
    }, { views: 0, contactClicks: 0, shareClicks: 0, saveClicks: 0, uniqueVisitors: 0 });
    const [totalListings, newListings] = await Promise.all([
        listing_model_js_1.Listing.countDocuments({}),
        listing_model_js_1.Listing.countDocuments({ createdAt: { $gte: from, $lte: to } }),
    ]);
    return {
        range,
        from,
        to,
        totals,
        daily: dailyAll,
        totalListings,
        newListings,
    };
}
