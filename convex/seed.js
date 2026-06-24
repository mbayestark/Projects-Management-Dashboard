import { mutation } from "./_generated/server";

export const run = mutation({
  handler: async (ctx) => {
    const existing = await ctx.db.query("projects").first();
    if (existing) return "already seeded";
    const today = new Date().toISOString().split("T")[0];
    const DAY = 86400000;

    // ─── NLP Research ───
    const nlp = await ctx.db.insert("projects", {
      name: "NLP Research — Clinical",
      category: "career",
      tier: "critical",
      nextAction: "Set up CamemBERT/DrBERT training environment",
      createdAt: Date.now(),
    });

    // Phase A — done
    const phA = await ctx.db.insert("phases", { projectId: nlp, title: "Phase A — Evaluation Set", order: 0, done: true });
    const nlpA1 = await ctx.db.insert("milestones", { projectId: nlp, phaseId: phA, title: "Complete 115 synthetic French clinical notes", done: true, doneAt: Date.now() - DAY * 30, order: 0 });
    const nlpA2 = await ctx.db.insert("milestones", { projectId: nlp, phaseId: phA, title: "Define 11-label annotation schema", done: true, doneAt: Date.now() - DAY * 28, order: 1 });
    const nlpA3 = await ctx.db.insert("milestones", { projectId: nlp, phaseId: phA, title: "Build pre-annotation script (Label Studio JSON)", done: true, doneAt: Date.now() - DAY * 25, order: 2 });
    const nlpA4 = await ctx.db.insert("milestones", { projectId: nlp, phaseId: phA, title: "Manual review in Label Studio — all 115 notes", done: true, doneAt: Date.now() - DAY * 15, order: 3 });
    const nlpA5 = await ctx.db.insert("milestones", { projectId: nlp, phaseId: phA, title: "Rule-based baseline extractor", done: true, doneAt: Date.now() - DAY * 8, order: 4 });
    const nlpA6 = await ctx.db.insert("milestones", { projectId: nlp, phaseId: phA, title: "Compute baseline F1 scores (overall 0.97)", done: true, doneAt: Date.now() - DAY * 5, order: 5 });
    const nlpA7 = await ctx.db.insert("milestones", { projectId: nlp, phaseId: phA, title: "Submit June 30 deliverable + write README", done: true, doneAt: Date.now() - DAY * 2, order: 6 });

    // Phase B
    const phB = await ctx.db.insert("phases", { projectId: nlp, title: "Phase B — Fine-tuned NER", order: 1, done: false });
    const nlpB1 = await ctx.db.insert("milestones", { projectId: nlp, phaseId: phB, title: "Set up training environment", done: false, order: 0 });
    await ctx.db.insert("tasks", { milestoneId: nlpB1, projectId: nlp, title: "Install CamemBERT/DrBERT dependencies", done: false, order: 0, context: "deep_work" });
    await ctx.db.insert("tasks", { milestoneId: nlpB1, projectId: nlp, title: "Verify CUDA/MPS availability", done: false, order: 1, context: "deep_work" });
    const nlpB2 = await ctx.db.insert("milestones", { projectId: nlp, phaseId: phB, title: "Prepare data split", done: false, order: 1 });
    await ctx.db.insert("tasks", { milestoneId: nlpB2, projectId: nlp, title: "Convert Label Studio export to HuggingFace NER format", done: false, order: 0, context: "deep_work" });
    await ctx.db.insert("tasks", { milestoneId: nlpB2, projectId: nlp, title: "Split into train/val/test (80/10/10)", done: false, order: 1, context: "deep_work" });
    const nlpB3 = await ctx.db.insert("milestones", { projectId: nlp, phaseId: phB, title: "Fine-tune model", done: false, order: 2 });
    await ctx.db.insert("tasks", { milestoneId: nlpB3, projectId: nlp, title: "Run training loop", done: false, order: 0, context: "deep_work" });
    await ctx.db.insert("tasks", { milestoneId: nlpB3, projectId: nlp, title: "Monitor val loss, stop at best checkpoint", done: false, order: 1, context: "deep_work" });
    const nlpB4 = await ctx.db.insert("milestones", { projectId: nlp, phaseId: phB, title: "Evaluate Method B", done: false, order: 3 });
    await ctx.db.insert("tasks", { milestoneId: nlpB4, projectId: nlp, title: "Compute F1 per label", done: false, order: 0, context: "deep_work" });
    await ctx.db.insert("tasks", { milestoneId: nlpB4, projectId: nlp, title: "Measure model size, RAM, latency per note", done: false, order: 1, context: "deep_work" });

    // Phase C
    const phC = await ctx.db.insert("phases", { projectId: nlp, title: "Phase C — Local LLM", order: 2, done: false });
    const nlpC1 = await ctx.db.insert("milestones", { projectId: nlp, phaseId: phC, title: "Set up Mistral-7B quantized locally", done: false, order: 0 });
    await ctx.db.insert("tasks", { milestoneId: nlpC1, projectId: nlp, title: "Download and run GGUF via llama.cpp or Ollama", done: false, order: 0, context: "deep_work" });
    const nlpC2 = await ctx.db.insert("milestones", { projectId: nlp, phaseId: phC, title: "Design structured output prompt", done: false, order: 1 });
    await ctx.db.insert("tasks", { milestoneId: nlpC2, projectId: nlp, title: "Write system prompt for 11-label extraction", done: false, order: 0, context: "deep_work" });
    await ctx.db.insert("tasks", { milestoneId: nlpC2, projectId: nlp, title: "Validate JSON output format", done: false, order: 1, context: "deep_work" });
    const nlpC3 = await ctx.db.insert("milestones", { projectId: nlp, phaseId: phC, title: "Evaluate Method C", done: false, order: 2 });
    await ctx.db.insert("tasks", { milestoneId: nlpC3, projectId: nlp, title: "Compute F1 per label", done: false, order: 0, context: "deep_work" });
    await ctx.db.insert("tasks", { milestoneId: nlpC3, projectId: nlp, title: "Measure model size, RAM, latency", done: false, order: 1, context: "deep_work" });

    // Phase D
    const phD = await ctx.db.insert("phases", { projectId: nlp, title: "Phase D — Final Report", order: 3, done: false });
    const nlpD1 = await ctx.db.insert("milestones", { projectId: nlp, phaseId: phD, title: "Find second annotator — compute IAA on 30 notes", done: false, order: 0 });
    const nlpD2 = await ctx.db.insert("milestones", { projectId: nlp, phaseId: phD, title: "Write final comparison report (F1, size, RAM, latency A/B/C)", done: false, order: 1 });
    const nlpD3 = await ctx.db.insert("milestones", { projectId: nlp, phaseId: phD, title: "Submit final research deliverable", done: false, order: 2 });

    // ─── Hotel Proposal ───
    const hotel = await ctx.db.insert("projects", {
      name: "Hotel Proposal — Lamantin",
      category: "entrepreneurship",
      tier: "high",
      nextAction: "Define research questions needed to pitch confidently",
      createdAt: Date.now(),
    });
    const hotelM1 = await ctx.db.insert("milestones", { projectId: hotel, title: "Research & context deep dive", done: false, order: 0 });
    await ctx.db.insert("tasks", { milestoneId: hotelM1, projectId: hotel, title: "Map OTA landscape — Booking/Expedia cut %", done: false, order: 0, context: "deep_work" });
    await ctx.db.insert("tasks", { milestoneId: hotelM1, projectId: hotel, title: "Document Lamantin's booking funnel weaknesses", done: false, order: 1, context: "deep_work" });
    await ctx.db.insert("tasks", { milestoneId: hotelM1, projectId: hotel, title: "Research 3 comparable hotels with direct booking success", done: false, order: 2, context: "deep_work" });
    const hotelM2 = await ctx.db.insert("milestones", { projectId: hotel, title: "Full document — shortcomings + feature details", done: false, order: 1 });
    await ctx.db.insert("tasks", { milestoneId: hotelM2, projectId: hotel, title: "Write shortcomings section", done: false, order: 0, context: "deep_work" });
    await ctx.db.insert("tasks", { milestoneId: hotelM2, projectId: hotel, title: "Detail direct booking website features", done: false, order: 1, context: "deep_work" });
    await ctx.db.insert("tasks", { milestoneId: hotelM2, projectId: hotel, title: "Detail maintenance tracking features", done: false, order: 2, context: "deep_work" });
    await ctx.db.insert("tasks", { milestoneId: hotelM2, projectId: hotel, title: "Detail AI reputation monitoring features", done: false, order: 3, context: "deep_work" });
    const hotelM3 = await ctx.db.insert("milestones", { projectId: hotel, title: "Pitch-ready final proposal submitted", done: false, order: 2 });
    await ctx.db.insert("tasks", { milestoneId: hotelM3, projectId: hotel, title: "Final review pass", done: false, order: 0, context: "quick" });
    await ctx.db.insert("tasks", { milestoneId: hotelM3, projectId: hotel, title: "Submit to contact", done: false, order: 1, context: "quick" });

    // ─── SCR Engine ───
    const scr = await ctx.db.insert("projects", {
      name: "SCR Engine",
      category: "entrepreneurship",
      tier: "high",
      nextAction: "Start with interest rate risk — read Solvency II standard formula overview",
      createdAt: Date.now(),
    });
    const scrM1 = await ctx.db.insert("milestones", { projectId: scr, title: "Master SCR jargon & Solvency II theory", done: false, order: 0 });
    await ctx.db.insert("tasks", { milestoneId: scrM1, projectId: scr, title: "Understand SCR structure and sub-modules", done: false, order: 0, context: "deep_work" });
    await ctx.db.insert("tasks", { milestoneId: scrM1, projectId: scr, title: "Learn interest rate risk computation", done: false, order: 1, context: "deep_work" });
    await ctx.db.insert("tasks", { milestoneId: scrM1, projectId: scr, title: "Learn equity risk computation", done: false, order: 2, context: "deep_work" });
    await ctx.db.insert("tasks", { milestoneId: scrM1, projectId: scr, title: "Learn market risk aggregation with correlation matrix", done: false, order: 3, context: "deep_work" });
    await ctx.db.insert("tasks", { milestoneId: scrM1, projectId: scr, title: "Session with domain expert to validate understanding", done: false, order: 4, context: "errand" });
    const scrM2 = await ctx.db.insert("milestones", { projectId: scr, title: "Define technical spec", done: false, order: 1 });
    await ctx.db.insert("tasks", { milestoneId: scrM2, projectId: scr, title: "Define input data format", done: false, order: 0, context: "deep_work" });
    await ctx.db.insert("tasks", { milestoneId: scrM2, projectId: scr, title: "Define computation modules", done: false, order: 1, context: "deep_work" });
    await ctx.db.insert("tasks", { milestoneId: scrM2, projectId: scr, title: "Define output format and reporting", done: false, order: 2, context: "deep_work" });
    const scrM3 = await ctx.db.insert("milestones", { projectId: scr, title: "Begin build — core computation engine", done: false, order: 2 });
    await ctx.db.insert("tasks", { milestoneId: scrM3, projectId: scr, title: "Set up project scaffold", done: false, order: 0, context: "deep_work" });
    await ctx.db.insert("tasks", { milestoneId: scrM3, projectId: scr, title: "Implement interest rate risk module", done: false, order: 1, context: "deep_work" });
    await ctx.db.insert("tasks", { milestoneId: scrM3, projectId: scr, title: "Implement equity risk module", done: false, order: 2, context: "deep_work" });
    await ctx.db.insert("tasks", { milestoneId: scrM3, projectId: scr, title: "Implement aggregation module", done: false, order: 3, context: "deep_work" });

    // ─── SG Financial Report ───
    const sgFin = await ctx.db.insert("projects", {
      name: "SG — Financial Report",
      category: "sg",
      tier: "responsibility",
      nextAction: "Compile this semester's transactions into report structure",
      createdAt: Date.now(),
    });
    const sgFinM1 = await ctx.db.insert("milestones", { projectId: sgFin, title: "Gather all transaction records", done: false, order: 0 });
    await ctx.db.insert("tasks", { milestoneId: sgFinM1, projectId: sgFin, title: "Collect Gala expense receipts", done: false, order: 0, context: "errand" });
    await ctx.db.insert("tasks", { milestoneId: sgFinM1, projectId: sgFin, title: "Collect shop sales records", done: false, order: 1, context: "quick" });
    await ctx.db.insert("tasks", { milestoneId: sgFinM1, projectId: sgFin, title: "Collect DAUST Impact revenue", done: false, order: 2, context: "quick" });
    const sgFinM2 = await ctx.db.insert("milestones", { projectId: sgFin, title: "Draft report", done: false, order: 1 });
    await ctx.db.insert("tasks", { milestoneId: sgFinM2, projectId: sgFin, title: "Write income section", done: false, order: 0, context: "deep_work" });
    await ctx.db.insert("tasks", { milestoneId: sgFinM2, projectId: sgFin, title: "Write expenses section", done: false, order: 1, context: "deep_work" });
    await ctx.db.insert("tasks", { milestoneId: sgFinM2, projectId: sgFin, title: "Write balance and summary", done: false, order: 2, context: "deep_work" });
    await ctx.db.insert("milestones", { projectId: sgFin, title: "Review with SG President", done: false, order: 2 });
    await ctx.db.insert("milestones", { projectId: sgFin, title: "Submit final report", done: false, order: 3 });

    // ─── SG Shop Revenue ───
    const sgShop = await ctx.db.insert("projects", {
      name: "SG — Shop Revenue",
      category: "sg",
      tier: "responsibility",
      nextAction: "Compute DAUST Impact revenue and add to 120k baseline",
      createdAt: Date.now(),
    });
    await ctx.db.insert("milestones", { projectId: sgShop, title: "Compute DAUST Impact revenue", done: false, order: 0 });
    await ctx.db.insert("milestones", { projectId: sgShop, title: "Reach 500k FCFA", done: false, order: 1 });
    await ctx.db.insert("milestones", { projectId: sgShop, title: "Reach 1M FCFA", done: false, order: 2 });
    await ctx.db.insert("milestones", { projectId: sgShop, title: "Reach 1.5M FCFA", done: false, order: 3 });

    // ─── Parked ───
    await ctx.db.insert("projects", {
      name: "Property Management System",
      category: "entrepreneurship",
      tier: "parked",
      nextAction: "Revisit after hotel proposal and NLP deadline",
      createdAt: Date.now(),
    });

    // ─── Health seed ───
    await ctx.db.insert("healthLogs", { date: today, weight: 108 });

    // ─── Identity statement ───
    await ctx.db.insert("userSettings", {
      key: "identityStatement",
      value: "I ship research, train like an athlete, and show up for the deen every day.",
    });

    return "seeded";
  },
});
