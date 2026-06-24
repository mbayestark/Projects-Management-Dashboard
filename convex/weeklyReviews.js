import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getLast = query({
  handler: async (ctx) => {
    const all = await ctx.db.query("weeklyReviews").collect();
    if (all.length === 0) return null;
    all.sort((a, b) => b.completedAt - a.completedAt);
    return all[0];
  },
});

export const complete = mutation({
  args: {
    weekStart: v.string(),
    intentionsByProject: v.array(
      v.object({
        projectId: v.id("projects"),
        intention: v.string(),
        nextActionUpdated: v.boolean(),
      })
    ),
    tiersReordered: v.optional(v.boolean()),
    generalNote: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("weeklyReviews", {
      ...args,
      completedAt: Date.now(),
    });
  },
});
