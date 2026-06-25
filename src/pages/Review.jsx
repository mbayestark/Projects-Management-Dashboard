import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";

function getMonday() {
  const d = new Date();
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return d.toISOString().split("T")[0];
}

export default function Review() {
  const projects = useQuery(api.projects.list);
  const lastReview = useQuery(api.weeklyReviews.getLast);
  const weeklyPerf = useQuery(api.stats.getWeeklyPerformance);
  const streak = useQuery(api.deen.getStreak);
  const completeReview = useMutation(api.weeklyReviews.complete);
  const updateNextAction = useMutation(api.projects.updateNextAction);

  const [step, setStep] = useState(0);
  const [projectIdx, setProjectIdx] = useState(0);
  const [intentions, setIntentions] = useState({});
  const [generalNote, setGeneralNote] = useState("");
  const [done, setDone] = useState(false);

  if (!projects || weeklyPerf === undefined) return <div className="text-muted p-8">Loading...</div>;

  const weekStart = getMonday();

  if (done) {
    return (
      <div className="text-center py-16">
        <div className="text-accent font-mono text-3xl mb-4">✓</div>
        <h2 className="text-xl font-semibold text-text mb-2">Review complete</h2>
        <p className="text-sm text-muted">Next review: Sunday</p>
      </div>
    );
  }

  // Step 0: Last week snapshot
  if (step === 0) {
    return (
      <div>
        <h1 className="text-2xl font-semibold text-text mb-6">Weekly Review</h1>
        <div className="text-[11px] text-muted uppercase tracking-widest mb-4">Step 1 — Last week snapshot</div>
        <div className="border border-border p-4 mb-6">
          <div className="font-mono text-lg text-accent mb-3">{weeklyPerf.totalCompleted} tasks completed</div>
          {weeklyPerf.byProject.map(({ name, tasks }) => (
            <div key={name} className="text-sm text-muted mb-1">{name}: {tasks} tasks</div>
          ))}
          {streak && <div className="text-sm text-muted mt-3">Quran streak: {streak.currentStreak} days</div>}
        </div>
        <button type="button" onClick={() => setStep(1)} className="px-6 py-3 bg-accent text-bg font-medium">
          Continue
        </button>
      </div>
    );
  }

  // Step 1: Project sweep
  if (step === 1) {
    const project = projects[projectIdx];
    if (!project) { setStep(2); return null; }
    const intention = intentions[project._id] || project.nextAction;

    return (
      <div>
        <h1 className="text-2xl font-semibold text-text mb-2">Weekly Review</h1>
        <div className="text-[11px] text-muted uppercase tracking-widest mb-4">
          Step 2 — Project sweep ({projectIdx + 1}/{projects.length})
        </div>
        <div className="border border-border p-4 mb-6">
          <h2 className="text-lg font-semibold text-text mb-4">{project.name}</h2>
          <div className="mb-4">
            <div className="text-xs text-muted mb-1">Next action intention</div>
            <input
              type="text"
              value={intention}
              onChange={(e) => setIntentions({ ...intentions, [project._id]: e.target.value })}
              className="w-full bg-card border border-border px-3 py-2 text-sm text-text outline-none"
            />
          </div>
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={() => {
            if (intention !== project.nextAction) {
              updateNextAction({ id: project._id, nextAction: intention });
            }
            if (projectIdx < projects.length - 1) setProjectIdx(projectIdx + 1);
            else setStep(2);
          }} className="px-6 py-3 bg-accent text-bg font-medium">
            {projectIdx < projects.length - 1 ? "Next project" : "Continue"}
          </button>
          <button type="button" onClick={() => {
            if (projectIdx < projects.length - 1) setProjectIdx(projectIdx + 1);
            else setStep(2);
          }} className="px-6 py-3 border border-border text-muted">
            Skip
          </button>
        </div>
      </div>
    );
  }

  // Step 2: General note + submit
  if (step === 2) {
    return (
      <div>
        <h1 className="text-2xl font-semibold text-text mb-2">Weekly Review</h1>
        <div className="text-[11px] text-muted uppercase tracking-widest mb-4">Step 3 — Weekly intentions</div>
        <div className="mb-6">
          <textarea
            value={generalNote}
            onChange={(e) => setGeneralNote(e.target.value)}
            placeholder="General reflections, notes for next week..."
            rows={4}
            className="w-full bg-card border border-border p-3 text-sm text-text outline-none resize-y"
          />
        </div>
        <button type="button" onClick={async () => {
          const intentionsByProject = projects.map((p) => ({
            projectId: p._id,
            intention: intentions[p._id] || p.nextAction,
            nextActionUpdated: (intentions[p._id] || "") !== p.nextAction && !!intentions[p._id],
          }));
          await completeReview({ weekStart, intentionsByProject, generalNote: generalNote || undefined });
          setDone(true);
        }} className="px-6 py-3 bg-accent text-bg font-medium">
          Complete review
        </button>
      </div>
    );
  }

  return null;
}
