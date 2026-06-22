import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import Checkbox from "../components/Checkbox";
import InlineEdit from "../components/InlineEdit";

function MilestoneSection({ milestone, projectId }) {
  const toggleTask = useMutation(api.tasks.toggle);
  const createTask = useMutation(api.tasks.create);
  const toggleMilestone = useMutation(api.milestones.toggle);
  const deleteMilestone = useMutation(api.milestones.deleteMilestone);
  const [expanded, setExpanded] = useState(!milestone.done);
  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  const tasks = milestone.tasks || [];
  const doneCount = tasks.filter((t) => t.done).length;

  function handleAddTask() {
    if (!newTitle.trim()) return;
    createTask({
      milestoneId: milestone._id,
      projectId,
      title: newTitle.trim(),
      order: tasks.length,
    });
    setNewTitle("");
    setAdding(false);
  }

  return (
    <div className="border border-border mb-3">
      <div
        className="flex items-center gap-3 p-3 cursor-pointer hover:bg-card/50"
        onClick={() => setExpanded(!expanded)}
      >
        <span className="text-muted text-xs">{expanded ? "▼" : "▶"}</span>
        {tasks.length === 0 && (
          <Checkbox
            checked={milestone.done}
            onChange={() => toggleMilestone({ id: milestone._id })}
          />
        )}
        <span className={`flex-1 text-sm ${milestone.done ? "line-through text-muted" : "text-text"}`}>
          {milestone.title}
        </span>
        {tasks.length > 0 && (
          <span className="font-mono text-xs text-muted">
            {doneCount}/{tasks.length}
          </span>
        )}
      </div>
      {expanded && (
        <div className="px-3 pb-3">
          {tasks.map((task) => (
            <div key={task._id} className="flex items-center gap-3 py-1.5 pl-6">
              <Checkbox
                checked={task.done}
                onChange={() => toggleTask({ id: task._id })}
              />
              <span className={`text-sm ${task.done ? "line-through text-muted" : ""}`}>
                {task.title}
              </span>
            </div>
          ))}
          {adding ? (
            <div className="pl-6 mt-2 flex gap-2">
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddTask();
                  if (e.key === "Escape") { setAdding(false); setNewTitle(""); }
                }}
                placeholder="Task title"
                className="flex-1 bg-transparent border-b border-border text-sm text-text outline-none py-1"
                autoFocus
              />
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setAdding(true)}
              className="text-sm text-muted hover:text-accent pl-6 mt-2"
            >
              + Add task
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              if (confirm("Delete this milestone and all its tasks?")) {
                deleteMilestone({ id: milestone._id });
              }
            }}
            className="text-xs text-muted hover:text-danger pl-6 mt-2 block"
          >
            Delete milestone
          </button>
        </div>
      )}
    </div>
  );
}

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const project = useQuery(api.projects.get, { id });
  const milestones = useQuery(api.milestones.listByProject, { projectId: id });
  const updateNextAction = useMutation(api.projects.updateNextAction);
  const updateNotes = useMutation(api.projects.updateNotes);
  const parkProject = useMutation(api.projects.park);
  const createMilestone = useMutation(api.milestones.create);

  const [addingMilestone, setAddingMilestone] = useState(false);
  const [newMilestoneTitle, setNewMilestoneTitle] = useState("");
  const [notes, setNotes] = useState(null);

  if (project === undefined || milestones === undefined) {
    return <div className="text-muted p-8">Loading...</div>;
  }
  if (!project) {
    return <div className="text-muted p-8">Project not found.</div>;
  }

  const currentNotes = notes ?? project.notes ?? "";

  const tierColors = {
    critical: "bg-accent text-bg",
    high: "bg-border text-text",
    responsibility: "bg-border text-text",
  };

  return (
    <div>
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="text-sm text-muted hover:text-text mb-4"
      >
        ← Back
      </button>

      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-text mb-2">{project.name}</h1>
        <div className="flex gap-2 items-center flex-wrap">
          <span className={`text-xs px-2 py-0.5 ${tierColors[project.tier] || "bg-border text-text"}`}>
            {project.tier}
          </span>
          <span className="text-xs text-muted">{project.category}</span>
          {project.deadline && (
            <span className="text-xs font-mono text-muted">Due {project.deadline}</span>
          )}
        </div>
      </div>

      <div className="mb-6">
        <div className="text-[11px] text-muted uppercase tracking-wide mb-2">Next action</div>
        <InlineEdit
          value={project.nextAction}
          onSave={(val) => updateNextAction({ id: project._id, nextAction: val })}
          placeholder="Define next action"
          className="text-base"
        />
      </div>

      <div className="mb-6">
        <div className="text-[11px] text-muted uppercase tracking-wide mb-3">Milestones & Tasks</div>
        {milestones.map((m) => (
          <MilestoneSection key={m._id} milestone={m} projectId={project._id} />
        ))}
        {addingMilestone ? (
          <div className="flex gap-2 mt-2">
            <input
              type="text"
              value={newMilestoneTitle}
              onChange={(e) => setNewMilestoneTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && newMilestoneTitle.trim()) {
                  createMilestone({
                    projectId: project._id,
                    title: newMilestoneTitle.trim(),
                    order: milestones.length,
                  });
                  setNewMilestoneTitle("");
                  setAddingMilestone(false);
                }
                if (e.key === "Escape") { setAddingMilestone(false); setNewMilestoneTitle(""); }
              }}
              placeholder="Milestone title"
              className="flex-1 bg-transparent border-b border-border text-sm text-text outline-none py-1"
              autoFocus
            />
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setAddingMilestone(true)}
            className="text-sm text-muted hover:text-accent mt-2"
          >
            + Add milestone
          </button>
        )}
      </div>

      <div className="mb-6">
        <div className="text-[11px] text-muted uppercase tracking-wide mb-2">Notes</div>
        <textarea
          value={currentNotes}
          onChange={(e) => setNotes(e.target.value)}
          onBlur={() => {
            if (currentNotes !== (project.notes ?? "")) {
              updateNotes({ id: project._id, notes: currentNotes });
            }
          }}
          placeholder="Add notes..."
          rows={4}
          className="w-full bg-card border border-border p-3 text-sm text-text outline-none resize-y"
        />
      </div>

      <button
        type="button"
        onClick={() => {
          parkProject({ id: project._id });
          navigate("/");
        }}
        className="text-sm text-muted hover:text-danger border border-border px-4 py-2"
      >
        Park project
      </button>
    </div>
  );
}
