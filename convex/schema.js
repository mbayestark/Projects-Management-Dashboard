import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  projects: defineTable({
    name: v.string(),
    category: v.string(),
    tier: v.string(),
    nextAction: v.string(),
    deadline: v.optional(v.string()),
    notes: v.optional(v.string()),
    createdAt: v.number(),
  }),

  milestones: defineTable({
    projectId: v.id("projects"),
    title: v.string(),
    done: v.boolean(),
    doneAt: v.optional(v.number()),
    order: v.number(),
  }).index("by_project", ["projectId"]),

  tasks: defineTable({
    milestoneId: v.id("milestones"),
    projectId: v.id("projects"),
    title: v.string(),
    done: v.boolean(),
    doneAt: v.optional(v.number()),
    order: v.number(),
  })
    .index("by_milestone", ["milestoneId"])
    .index("by_project", ["projectId"]),

  healthLogs: defineTable({
    date: v.string(),
    weight: v.optional(v.number()),
    restingHR: v.optional(v.number()),
    gymSession: v.optional(v.boolean()),
    notes: v.optional(v.string()),
  }).index("by_date", ["date"]),

  athleticTests: defineTable({
    date: v.string(),
    spiderDrill: v.optional(v.number()),
    run2400m: v.optional(v.number()),
    lateralShuffle: v.optional(v.number()),
    verticalJump: v.optional(v.number()),
    plankHold: v.optional(v.number()),
  }).index("by_date", ["date"]),

  deenLogs: defineTable({
    date: v.string(),
    quranRead: v.boolean(),
  }).index("by_date", ["date"]),

  ideas: defineTable({
    title: v.string(),
    body: v.optional(v.string()),
    category: v.string(),
    status: v.string(),
    promotedToProjectId: v.optional(v.id("projects")),
    createdAt: v.number(),
    updatedAt: v.number(),
  }),
});
