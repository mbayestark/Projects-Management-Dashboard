import { mutation } from "./_generated/server";

export const run = mutation({
  handler: async (ctx) => {
    const existing = await ctx.db.query("projects").first();
    if (existing) return "already seeded";

    // --- NLP Research ---
    const nlp = await ctx.db.insert("projects", {
      name: "NLP Research",
      category: "career",
      tier: "critical",
      nextAction: "Review annotation batch — snippets 17–30",
      deadline: "2026-06-30",
      createdAt: Date.now(),
    });
    const nlpM1 = await ctx.db.insert("milestones", {
      projectId: nlp, title: "Complete 115 synthetic French clinical snippets",
      done: true, doneAt: Date.now() - 86400000 * 10, order: 0,
    });
    const nlpM2 = await ctx.db.insert("milestones", {
      projectId: nlp, title: "Review all 115 annotations",
      done: false, order: 1,
    });
    const nlpM3 = await ctx.db.insert("milestones", {
      projectId: nlp, title: "Pre-annotation script outputting Label Studio JSON",
      done: true, doneAt: Date.now() - 86400000 * 5, order: 2,
    });
    const nlpM4 = await ctx.db.insert("milestones", {
      projectId: nlp, title: "Baseline F1 score from rule-based extractor",
      done: false, order: 3,
    });
    await ctx.db.insert("tasks", { milestoneId: nlpM2, projectId: nlp, title: "Review snippets 1–16", done: true, doneAt: Date.now() - 86400000 * 3, order: 0 });
    await ctx.db.insert("tasks", { milestoneId: nlpM2, projectId: nlp, title: "Review snippets 17–30", done: false, order: 1 });
    await ctx.db.insert("tasks", { milestoneId: nlpM2, projectId: nlp, title: "Review snippets 31–50", done: false, order: 2 });
    await ctx.db.insert("tasks", { milestoneId: nlpM2, projectId: nlp, title: "Review snippets 51–75", done: false, order: 3 });
    await ctx.db.insert("tasks", { milestoneId: nlpM2, projectId: nlp, title: "Review snippets 76–100", done: false, order: 4 });
    await ctx.db.insert("tasks", { milestoneId: nlpM2, projectId: nlp, title: "Review snippets 101–115", done: false, order: 5 });
    await ctx.db.insert("tasks", { milestoneId: nlpM4, projectId: nlp, title: "Define rule-based extraction logic", done: false, order: 0 });
    await ctx.db.insert("tasks", { milestoneId: nlpM4, projectId: nlp, title: "Run extractor on annotated set", done: false, order: 1 });
    await ctx.db.insert("tasks", { milestoneId: nlpM4, projectId: nlp, title: "Compute and report F1 score", done: false, order: 2 });

    // --- Hotel Proposal ---
    const hotel = await ctx.db.insert("projects", {
      name: "Hotel Proposal — Lamantin",
      category: "entrepreneurship",
      tier: "high",
      nextAction: "Define research questions needed to pitch confidently",
      createdAt: Date.now(),
    });
    const hotelM1 = await ctx.db.insert("milestones", {
      projectId: hotel, title: "Research & context deep dive",
      done: false, order: 0,
    });
    const hotelM2 = await ctx.db.insert("milestones", {
      projectId: hotel, title: "Full document: shortcomings + feature details",
      done: false, order: 1,
    });
    const hotelM3 = await ctx.db.insert("milestones", {
      projectId: hotel, title: "Pitch-ready final proposal submitted",
      done: false, order: 2,
    });
    await ctx.db.insert("tasks", { milestoneId: hotelM1, projectId: hotel, title: "Map current OTA landscape (Booking, Expedia cut %)", done: false, order: 0 });
    await ctx.db.insert("tasks", { milestoneId: hotelM1, projectId: hotel, title: "Document Lamantin's current booking funnel weaknesses", done: false, order: 1 });
    await ctx.db.insert("tasks", { milestoneId: hotelM1, projectId: hotel, title: "Research 3 comparable hotels with direct booking success", done: false, order: 2 });
    await ctx.db.insert("tasks", { milestoneId: hotelM2, projectId: hotel, title: "Write shortcomings section", done: false, order: 0 });
    await ctx.db.insert("tasks", { milestoneId: hotelM2, projectId: hotel, title: "Detail direct booking website features", done: false, order: 1 });
    await ctx.db.insert("tasks", { milestoneId: hotelM2, projectId: hotel, title: "Detail maintenance tracking system features", done: false, order: 2 });
    await ctx.db.insert("tasks", { milestoneId: hotelM2, projectId: hotel, title: "Detail AI reputation monitoring features", done: false, order: 3 });
    await ctx.db.insert("tasks", { milestoneId: hotelM3, projectId: hotel, title: "Final review pass", done: false, order: 0 });
    await ctx.db.insert("tasks", { milestoneId: hotelM3, projectId: hotel, title: "Submit to contact", done: false, order: 1 });

    // --- SCR Engine ---
    const scr = await ctx.db.insert("projects", {
      name: "SCR Engine",
      category: "entrepreneurship",
      tier: "high",
      nextAction: "Start with interest rate risk — read Solvency II standard formula overview",
      createdAt: Date.now(),
    });
    const scrM1 = await ctx.db.insert("milestones", {
      projectId: scr, title: "Master SCR jargon & Solvency II theory",
      done: false, order: 0,
    });
    const scrM2 = await ctx.db.insert("milestones", {
      projectId: scr, title: "Define technical spec",
      done: false, order: 1,
    });
    const scrM3 = await ctx.db.insert("milestones", {
      projectId: scr, title: "Begin build — core computation engine",
      done: false, order: 2,
    });
    await ctx.db.insert("tasks", { milestoneId: scrM1, projectId: scr, title: "Understand SCR structure and sub-modules", done: false, order: 0 });
    await ctx.db.insert("tasks", { milestoneId: scrM1, projectId: scr, title: "Learn interest rate risk computation", done: false, order: 1 });
    await ctx.db.insert("tasks", { milestoneId: scrM1, projectId: scr, title: "Learn equity risk computation", done: false, order: 2 });
    await ctx.db.insert("tasks", { milestoneId: scrM1, projectId: scr, title: "Learn market risk aggregation with correlation matrix", done: false, order: 3 });
    await ctx.db.insert("tasks", { milestoneId: scrM1, projectId: scr, title: "Session with domain expert to validate understanding", done: false, order: 4 });
    await ctx.db.insert("tasks", { milestoneId: scrM2, projectId: scr, title: "Define input data format", done: false, order: 0 });
    await ctx.db.insert("tasks", { milestoneId: scrM2, projectId: scr, title: "Define computation modules", done: false, order: 1 });
    await ctx.db.insert("tasks", { milestoneId: scrM2, projectId: scr, title: "Define output format and reporting", done: false, order: 2 });
    await ctx.db.insert("tasks", { milestoneId: scrM3, projectId: scr, title: "Set up project scaffold", done: false, order: 0 });
    await ctx.db.insert("tasks", { milestoneId: scrM3, projectId: scr, title: "Implement interest rate risk module", done: false, order: 1 });
    await ctx.db.insert("tasks", { milestoneId: scrM3, projectId: scr, title: "Implement equity risk module", done: false, order: 2 });
    await ctx.db.insert("tasks", { milestoneId: scrM3, projectId: scr, title: "Implement aggregation module", done: false, order: 3 });

    // --- SG Financial Report ---
    const sgFin = await ctx.db.insert("projects", {
      name: "SG — Financial Report",
      category: "sg",
      tier: "responsibility",
      nextAction: "Compile this semester's transactions into report structure",
      createdAt: Date.now(),
    });
    const sgFinM1 = await ctx.db.insert("milestones", {
      projectId: sgFin, title: "Gather all transaction records",
      done: false, order: 0,
    });
    const sgFinM2 = await ctx.db.insert("milestones", {
      projectId: sgFin, title: "Draft report",
      done: false, order: 1,
    });
    const sgFinM3 = await ctx.db.insert("milestones", {
      projectId: sgFin, title: "Review with SG President",
      done: false, order: 2,
    });
    const sgFinM4 = await ctx.db.insert("milestones", {
      projectId: sgFin, title: "Submit final report",
      done: false, order: 3,
    });
    await ctx.db.insert("tasks", { milestoneId: sgFinM1, projectId: sgFin, title: "Collect Gala expense receipts", done: false, order: 0 });
    await ctx.db.insert("tasks", { milestoneId: sgFinM1, projectId: sgFin, title: "Collect shop sales records", done: false, order: 1 });
    await ctx.db.insert("tasks", { milestoneId: sgFinM1, projectId: sgFin, title: "Collect DAUST Impact revenue", done: false, order: 2 });
    await ctx.db.insert("tasks", { milestoneId: sgFinM2, projectId: sgFin, title: "Write income section", done: false, order: 0 });
    await ctx.db.insert("tasks", { milestoneId: sgFinM2, projectId: sgFin, title: "Write expenses section", done: false, order: 1 });
    await ctx.db.insert("tasks", { milestoneId: sgFinM2, projectId: sgFin, title: "Write balance and summary", done: false, order: 2 });

    // --- SG Shop Revenue ---
    const sgShop = await ctx.db.insert("projects", {
      name: "SG — Shop Revenue",
      category: "sg",
      tier: "responsibility",
      nextAction: "Compute DAUST Impact revenue and add to 120k baseline",
      createdAt: Date.now(),
    });
    await ctx.db.insert("milestones", {
      projectId: sgShop, title: "Compute DAUST Impact revenue",
      done: false, order: 0,
    });
    await ctx.db.insert("milestones", {
      projectId: sgShop, title: "Reach 500k FCFA",
      done: false, order: 1,
    });
    await ctx.db.insert("milestones", {
      projectId: sgShop, title: "Reach 1M FCFA",
      done: false, order: 2,
    });
    await ctx.db.insert("milestones", {
      projectId: sgShop, title: "Reach 1.5M FCFA",
      done: false, order: 3,
    });

    // --- Parked: Property Management System ---
    await ctx.db.insert("projects", {
      name: "Property Management System",
      category: "entrepreneurship",
      tier: "parked",
      nextAction: "Revisit after NLP deadline and hotel proposal",
      createdAt: Date.now(),
    });

    // --- Health seed ---
    const today = new Date().toISOString().split("T")[0];
    await ctx.db.insert("healthLogs", {
      date: today,
      weight: 108,
    });

    return "seeded";
  },
});
