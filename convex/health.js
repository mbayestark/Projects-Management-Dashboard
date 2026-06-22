import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const listLogs = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit }) => {
    const logs = await ctx.db.query("healthLogs").collect();
    logs.sort((a, b) => a.date.localeCompare(b.date));
    if (limit) return logs.slice(-limit);
    return logs;
  },
});

export const listAthleticTests = query({
  handler: async (ctx) => {
    const tests = await ctx.db.query("athleticTests").collect();
    tests.sort((a, b) => a.date.localeCompare(b.date));
    return tests;
  },
});

export const log = mutation({
  args: {
    date: v.string(),
    weight: v.optional(v.number()),
    restingHR: v.optional(v.number()),
    gymSession: v.optional(v.boolean()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("healthLogs")
      .withIndex("by_date", (q) => q.eq("date", args.date))
      .first();
    if (existing) {
      const patch = {};
      if (args.weight !== undefined) patch.weight = args.weight;
      if (args.restingHR !== undefined) patch.restingHR = args.restingHR;
      if (args.gymSession !== undefined) patch.gymSession = args.gymSession;
      if (args.notes !== undefined) patch.notes = args.notes;
      await ctx.db.patch(existing._id, patch);
      return existing._id;
    }
    return await ctx.db.insert("healthLogs", args);
  },
});

export const logAthleticTest = mutation({
  args: {
    date: v.string(),
    spiderDrill: v.optional(v.number()),
    run2400m: v.optional(v.number()),
    lateralShuffle: v.optional(v.number()),
    verticalJump: v.optional(v.number()),
    plankHold: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("athleticTests", args);
  },
});
