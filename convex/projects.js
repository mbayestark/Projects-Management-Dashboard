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
      const phases = await ctx.db
        .query("phases")
        .withIndex("by_project", (q) => q.eq("projectId", project._id))
        .collect();
      phases.sort((a, b) => a.order - b.order);
      const milestones = await ctx.db
        .query("milestones")
        .withIndex("by_project", (q) => q.eq("projectId", project._id))
        .collect();
      milestones.sort((a, b) => a.order - b.order);
      const tasks = await ctx.db
        .query("tasks")
        .withIndex("by_project", (q) => q.eq("projectId", project._id))
        .collect();
      const currentPhase = phases.find((p) => !p.done);
      result.push({
        ...project,
        phases,
        milestones,
        currentPhase: currentPhase || null,
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
    const project = await ctx.db.get(id);
    if (!project) return null;
    const phases = await ctx.db
      .query("phases")
      .withIndex("by_project", (q) => q.eq("projectId", id))
      .collect();
    phases.sort((a, b) => a.order - b.order);
    const milestones = await ctx.db
      .query("milestones")
      .withIndex("by_project", (q) => q.eq("projectId", id))
      .collect();
    milestones.sort((a, b) => a.order - b.order);
    for (const m of milestones) {
      const tasks = await ctx.db
        .query("tasks")
        .withIndex("by_milestone", (q) => q.eq("milestoneId", m._id))
        .collect();
      tasks.sort((a, b) => a.order - b.order);
      m.tasks = tasks;
    }
    const noteLogs = await ctx.db
      .query("noteLogs")
      .withIndex("by_project", (q) => q.eq("projectId", id))
      .collect();
    noteLogs.sort((a, b) => a.date.localeCompare(b.date));
    return { ...project, phases, milestones, noteLogs };
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    category: v.string(),
    tier: v.string(),
    nextAction: v.string(),
    deadline: v.optional(v.string()),
    originIdeaId: v.optional(v.id("ideas")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("projects", { ...args, createdAt: Date.now() });
  },
});

export const updateNextAction = mutation({
  args: { id: v.id("projects"), nextAction: v.string() },
  handler: async (ctx, { id, nextAction }) => {
    await ctx.db.patch(id, { nextAction });
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
