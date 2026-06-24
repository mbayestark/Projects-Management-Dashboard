import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const listByProject = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, { projectId }) => {
    const logs = await ctx.db
      .query("noteLogs")
      .withIndex("by_project", (q) => q.eq("projectId", projectId))
      .collect();
    logs.sort((a, b) => a.date.localeCompare(b.date));
    return logs;
  },
});

export const addEntry = mutation({
  args: { projectId: v.id("projects"), content: v.string() },
  handler: async (ctx, { projectId, content }) => {
    const today = new Date().toISOString().split("T")[0];
    const existing = await ctx.db
      .query("noteLogs")
      .withIndex("by_project_date", (q) =>
        q.eq("projectId", projectId).eq("date", today)
      )
      .first();
    if (existing) {
      await ctx.db.patch(existing._id, {
        content: existing.content + "\n\n" + content,
      });
      return existing._id;
    }
    return await ctx.db.insert("noteLogs", { projectId, date: today, content });
  },
});
