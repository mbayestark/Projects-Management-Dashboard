import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  handler: async (ctx) => {
    const projects = await ctx.db
      .query("projects")
      .filter((q) => q.neq(q.field("tier"), "parked"))
      .collect();
    const result = [];
    for (const project of projects) {
      const milestones = await ctx.db
        .query("milestones")
        .withIndex("by_project", (q) => q.eq("projectId", project._id))
        .collect();
      milestones.sort((a, b) => a.order - b.order);
      const tasks = await ctx.db
        .query("tasks")
        .withIndex("by_project", (q) => q.eq("projectId", project._id))
        .collect();
      result.push({
        ...project,
        milestones,
        totalMilestones: milestones.length,
        doneMilestones: milestones.filter((m) => m.done).length,
        totalTasks: tasks.length,
        doneTasks: tasks.filter((t) => t.done).length,
      });
    }
    return result;
  },
});

export const listParked = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("projects")
      .filter((q) => q.eq(q.field("tier"), "parked"))
      .collect();
  },
});

export const get = query({
  args: { id: v.id("projects") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    category: v.string(),
    tier: v.string(),
    nextAction: v.string(),
    deadline: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("projects", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const updateNextAction = mutation({
  args: { id: v.id("projects"), nextAction: v.string() },
  handler: async (ctx, { id, nextAction }) => {
    await ctx.db.patch(id, { nextAction });
  },
});

export const updateNotes = mutation({
  args: { id: v.id("projects"), notes: v.string() },
  handler: async (ctx, { id, notes }) => {
    await ctx.db.patch(id, { notes });
  },
});

export const park = mutation({
  args: { id: v.id("projects") },
  handler: async (ctx, { id }) => {
    await ctx.db.patch(id, { tier: "parked" });
  },
});

export const unpark = mutation({
  args: { id: v.id("projects"), tier: v.optional(v.string()) },
  handler: async (ctx, { id, tier }) => {
    await ctx.db.patch(id, { tier: tier || "high" });
  },
});
