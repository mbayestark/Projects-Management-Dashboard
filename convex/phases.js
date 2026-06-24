import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    projectId: v.id("projects"),
    title: v.string(),
    order: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("phases", { ...args, done: false });
  },
});

export const markDone = mutation({
  args: { id: v.id("phases") },
  handler: async (ctx, { id }) => {
    await ctx.db.patch(id, { done: true });
  },
});
