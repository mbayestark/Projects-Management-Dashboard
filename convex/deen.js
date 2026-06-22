import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const listLogs = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit }) => {
    const logs = await ctx.db.query("deenLogs").collect();
    logs.sort((a, b) => a.date.localeCompare(b.date));
    if (limit) return logs.slice(-limit);
    return logs;
  },
});

export const log = mutation({
  args: { date: v.string(), quranRead: v.boolean() },
  handler: async (ctx, { date, quranRead }) => {
    const existing = await ctx.db
      .query("deenLogs")
      .withIndex("by_date", (q) => q.eq("date", date))
      .first();
    if (existing) {
      await ctx.db.patch(existing._id, { quranRead });
      return existing._id;
    }
    return await ctx.db.insert("deenLogs", { date, quranRead });
  },
});
