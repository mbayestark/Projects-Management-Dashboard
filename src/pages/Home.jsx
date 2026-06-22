import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Link } from "react-router-dom";
import { getGreeting, todayString, daysUntil } from "../lib/utils";
import SegmentedProgress from "../components/SegmentedProgress";
import InlineEdit from "../components/InlineEdit";

const TIER_ORDER = ["critical", "high", "responsibility"];
const TIER_LABELS = { critical: "CRITICAL", high: "HIGH LEVERAGE", responsibility: "RESPONSIBILITY" };

function TodayStrip() {
  const today = todayString();
  const deenLogs = useQuery(api.deen.listLogs, { limit: 1 });
  const healthLogs = useQuery(api.health.listLogs, { limit: 60 });
  const logDeen = useMutation(api.deen.log);
  const logHealth = useMutation(api.health.log);

  const todayDeen = deenLogs?.find((l) => l.date === today);
  const todayHealth = healthLogs?.find((l) => l.date === today);
  const quranDone = todayDeen?.quranRead || false;
  const gymDone = todayHealth?.gymSession || false;

  return (
    <div className="flex gap-3 mb-6">
      <button
        type="button"
        onClick={() => logDeen({ date: today, quranRead: !quranDone })}
        className={`px-4 py-2 text-sm font-medium border transition-colors ${
          quranDone
            ? "bg-accent text-bg border-accent"
            : "bg-transparent text-muted border-border hover:border-accent"
        }`}
      >
        Quran {quranDone ? "✓" : ""}
      </button>
      <button
        type="button"
        onClick={() => logHealth({ date: today, gymSession: !gymDone })}
        className={`px-4 py-2 text-sm font-medium border transition-colors ${
          gymDone
            ? "bg-accent text-bg border-accent"
            : "bg-transparent text-muted border-border hover:border-accent"
        }`}
      >
        Gym {gymDone ? "✓" : ""}
      </button>
    </div>
  );
}

function ProjectCard({ project }) {
  const updateNextAction = useMutation(api.projects.updateNextAction);
  const days = daysUntil(project.deadline);
  const progress = project.totalMilestones > 0
    ? { done: project.doneMilestones, total: project.totalMilestones }
    : { done: 0, total: 0 };

  const nextMilestone = project.milestones?.find((m) => !m.done);

  let deadlineColor = "text-muted";
  if (days !== null) {
    if (days < 0) deadlineColor = "text-danger";
    else if (days <= 7) deadlineColor = "text-accent";
  }

  return (
    <div
      className={`bg-card border border-border p-4 flex flex-col gap-3 ${
        project.tier === "critical" ? "border-l-2 border-l-accent" : "border-l-2 border-l-[#4A4A4A]"
      }`}
    >
      <div className="flex justify-between items-start">
        <Link to={`/project/${project._id}`} className="text-text font-semibold text-base hover:text-accent transition-colors no-underline">
          {project.name}
        </Link>
        {days !== null && (
          <span className={`font-mono text-xs ${deadlineColor} whitespace-nowrap ml-2`}>
            {days < 0 ? `${Math.abs(days)}d overdue` : `${days} days left`}
          </span>
        )}
      </div>

      <SegmentedProgress done={progress.done} total={progress.total} />

      {nextMilestone && (
        <div>
          <div className="text-[11px] text-muted uppercase tracking-wide mb-1">Next milestone</div>
          <div className="text-sm text-text">{nextMilestone.title}</div>
        </div>
      )}

      <div>
        <div className="text-[11px] text-muted uppercase tracking-wide mb-1">Next action</div>
        <InlineEdit
          value={project.nextAction}
          onSave={(val) => updateNextAction({ id: project._id, nextAction: val })}
          placeholder="Define next action"
          className="text-sm"
        />
      </div>
    </div>
  );
}

export default function Home() {
  const projects = useQuery(api.projects.list);
  const alerts = useQuery(api.stats.getDashboardAlerts);
  const seed = useMutation(api.seed.run);

  if (projects === undefined) return <div className="text-muted p-8">Loading...</div>;

  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-16">
        <p className="text-muted">No projects yet.</p>
        <button
          type="button"
          onClick={() => seed()}
          className="px-6 py-3 bg-accent text-bg font-medium"
        >
          Load seed data
        </button>
      </div>
    );
  }

  const grouped = {};
  for (const tier of TIER_ORDER) {
    const items = projects.filter((p) => p.tier === tier);
    if (items.length > 0) grouped[tier] = items;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-text">
          {getGreeting()}, Mbaye
        </h1>
        <div className="font-mono text-sm text-muted">
          {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
        </div>
      </div>

      {alerts && (alerts.missingNextAction.length > 0 || alerts.overdue.length > 0) && (
        <div className="bg-accent/10 border border-accent/30 p-3 mb-6 flex flex-col gap-1">
          {alerts.missingNextAction.length > 0 && (
            <span className="text-sm text-accent">
              {alerts.missingNextAction.length} project{alerts.missingNextAction.length > 1 ? "s" : ""} missing a next action
            </span>
          )}
          {alerts.overdue.map((p) => (
            <span key={p._id} className="text-sm text-danger">
              {p.name} is overdue
            </span>
          ))}
        </div>
      )}

      <TodayStrip />

      {TIER_ORDER.map((tier) =>
        grouped[tier] ? (
          <div key={tier} className="mb-8">
            <div className="text-[11px] font-medium text-muted uppercase tracking-widest mb-3 border-b border-border pb-2">
              {TIER_LABELS[tier]}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {grouped[tier].map((p) => (
                <ProjectCard key={p._id} project={p} />
              ))}
            </div>
          </div>
        ) : null
      )}
    </div>
  );
}
