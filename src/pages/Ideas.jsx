import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import { Link } from "react-router-dom";

const STATUSES = ["raw", "thinking", "validated", "promoted"];
const CATEGORIES = ["entrepreneurship", "tech", "sg", "other"];

function IdeaCard({ idea }) {
  const updateIdea = useMutation(api.ideas.update);
  const promote = useMutation(api.ideas.promoteToProject);
  const [expanded, setExpanded] = useState(false);
  const [editingBody, setEditingBody] = useState(false);
  const [body, setBody] = useState(idea.body || "");
  const [showPromote, setShowPromote] = useState(false);
  const [promoteName, setPromoteName] = useState(idea.title);
  const [promoteTier, setPromoteTier] = useState("high");

  return (
    <div className="bg-card border border-border p-4 mb-3">
      <div className="flex justify-between items-start gap-2 mb-2">
        <button type="button" onClick={() => setExpanded(!expanded)} className="text-text font-semibold text-sm text-left flex-1">
          {idea.title}
        </button>
        <select
          value={idea.status}
          onChange={(e) => updateIdea({ id: idea._id, status: e.target.value })}
          className="bg-card border border-border text-xs text-muted px-2 py-1 outline-none"
        >
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <div className="text-[11px] text-muted uppercase tracking-wide mb-2">{idea.category}</div>
      {expanded && (
        <div className="mt-3">
          {editingBody ? (
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              onBlur={() => { updateIdea({ id: idea._id, body }); setEditingBody(false); }}
              rows={3}
              className="w-full bg-transparent border border-border p-2 text-sm text-text outline-none resize-y"
              autoFocus
            />
          ) : (
            <div onClick={() => setEditingBody(true)} className="text-sm text-muted cursor-pointer min-h-[2rem]">
              {idea.body || "Click to add notes..."}
            </div>
          )}
          <div className="flex justify-between items-center mt-3">
            <span className="text-xs text-muted">
              Updated {new Date(idea.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </span>
            {idea.status === "validated" && !showPromote && (
              <button type="button" onClick={() => setShowPromote(true)} className="text-xs text-accent hover:underline">
                Promote to project →
              </button>
            )}
            {idea.status === "promoted" && idea.promotedToProjectId && (
              <Link to={`/project/${idea.promotedToProjectId}`} className="text-xs text-accent no-underline hover:underline">
                View project →
              </Link>
            )}
          </div>
          {showPromote && (
            <div className="mt-3 border border-border p-3 flex flex-col gap-2">
              <input type="text" value={promoteName} onChange={(e) => setPromoteName(e.target.value)}
                placeholder="Project name" className="bg-transparent border-b border-border text-sm text-text outline-none py-1" />
              <select value={promoteTier} onChange={(e) => setPromoteTier(e.target.value)}
                className="bg-card border border-border text-sm text-text px-2 py-1 outline-none">
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="responsibility">Responsibility</option>
              </select>
              <div className="flex gap-2">
                <button type="button" onClick={() => {
                  promote({ id: idea._id, projectName: promoteName, tier: promoteTier });
                  setShowPromote(false);
                }} className="px-4 py-2 bg-accent text-bg text-sm font-medium">Create project</button>
                <button type="button" onClick={() => setShowPromote(false)} className="text-sm text-muted">Cancel</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Ideas() {
  const ideas = useQuery(api.ideas.list);
  const createIdea = useMutation(api.ideas.create);
  const [filter, setFilter] = useState("all");
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ title: "", body: "", category: "tech" });

  if (ideas === undefined) return <div className="text-muted p-8">Loading...</div>;
  const filtered = filter === "all" ? ideas : ideas.filter((i) => i.status === filter);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-text">Idea Incubation</h1>
        <button type="button" onClick={() => setAdding(true)} className="text-sm text-accent hover:underline">+ New idea</button>
      </div>

      {adding && (
        <div className="bg-card border border-border p-4 mb-4">
          <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Idea title" className="w-full bg-transparent border-b border-border text-sm text-text outline-none py-1 mb-2" autoFocus />
          <textarea value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })}
            placeholder="Notes (optional)" rows={2} className="w-full bg-transparent border border-border p-2 text-sm text-text outline-none resize-y mb-2" />
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="bg-card border border-border text-sm text-text px-2 py-1 outline-none mb-3">
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <div className="flex gap-2">
            <button type="button" onClick={() => {
              if (form.title.trim()) {
                createIdea({ title: form.title.trim(), body: form.body || undefined, category: form.category });
                setForm({ title: "", body: "", category: "tech" });
                setAdding(false);
              }
            }} className="px-4 py-2 bg-accent text-bg text-sm font-medium">Add</button>
            <button type="button" onClick={() => setAdding(false)} className="text-sm text-muted">Cancel</button>
          </div>
        </div>
      )}

      <div className="flex gap-2 mb-4 flex-wrap">
        {["all", ...STATUSES].map((s) => (
          <button key={s} type="button" onClick={() => setFilter(s)}
            className={`px-3 py-1 text-xs border transition-colors ${
              filter === s ? "border-accent text-accent" : "border-border text-muted hover:text-text"
            }`}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-muted text-sm">No ideas in this filter.</p>
      ) : (
        filtered.map((idea) => <IdeaCard key={idea._id} idea={idea} />)
      )}
    </div>
  );
}
