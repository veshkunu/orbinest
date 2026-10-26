import { useState } from "react";
import { ArrowRightLeft, CircleCheck, CirclePlus, Pencil, RefreshCw } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { TASK_STATUS } from "../../lib/constants";
import { formatRelative } from "../../lib/format";
import { addComment } from "../../services/taskService";
import { Avatar, Button, Textarea } from "../../components/ui";

const EVENT_ICONS = { created: CirclePlus, edited: Pencil, reassigned: ArrowRightLeft, status: RefreshCw, done: CircleCheck };

/** Merge comments and system events into one oldest-first timeline. */
function buildTimeline(task) {
  const events = [
    { id: `${task.id}-created`, kind: "event", type: "created", actorId: task.createdById, at: task.createdAt },
    ...(task.activity ?? []).map((a) => ({ ...a, kind: "event" })),
    ...task.comments.map((c) => ({ ...c, kind: "comment", at: c.createdAt })),
  ];
  // Seed data has completion dates but no status events; show them anyway
  if (task.completedAt && !(task.activity ?? []).some((a) => a.type === "status" && a.to === "done")) {
    events.push({ id: `${task.id}-done`, kind: "event", type: "done", actorId: task.assigneeId, at: task.completedAt });
  }
  return events.sort((a, b) => a.at.localeCompare(b.at));
}

function describe(event, name) {
  switch (event.type) {
    case "created":
      return `${name(event.actorId)} created this task`;
    case "edited":
      return `${name(event.actorId)} edited the details`;
    case "reassigned":
      return `${name(event.actorId)} reassigned it from ${name(event.from)} to ${name(event.to)}`;
    case "status":
      return event.to === "done"
        ? `${name(event.actorId)} marked it as done`
        : `${name(event.actorId)} changed status to ${TASK_STATUS[event.to].label.toLowerCase()}`;
    case "done":
      return `${name(event.actorId)} marked it as done`;
    default:
      return "";
  }
}

function CommentForm({ taskId }) {
  const { user } = useAuth();
  const [body, setBody] = useState("");
  const [error, setError] = useState("");
  const [posting, setPosting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!body.trim()) {
      setError("Write a comment before posting.");
      return;
    }
    setPosting(true);
    await addComment(taskId, user.id, body);
    setPosting(false);
    setBody("");
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex gap-3">
      <Avatar person={user} size="sm" className="mt-7 hidden sm:inline-grid" />
      <div className="flex flex-1 flex-col gap-3">
        <Textarea
          label="Add a comment"
          rows={3}
          value={body}
          error={error}
          onChange={(e) => {
            setBody(e.target.value);
            setError("");
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSubmit(e);
          }}
        />
        <div className="flex items-center justify-between gap-3">
          <p className="hidden text-xs text-ink-muted sm:block">Ctrl + Enter to post</p>
          <Button type="submit" variant="secondary" loading={posting} className="ml-auto">
            Post comment
          </Button>
        </div>
      </div>
    </form>
  );
}

export function TaskActivity({ task, byId }) {
  const { user } = useAuth();
  const name = (id) => (id === user.id ? "You" : (byId(id)?.firstName ?? "Someone"));
  const timeline = buildTimeline(task);

  return (
    <div className="flex flex-col gap-6">
      <ol className="flex flex-col gap-5">
        {timeline.map((item) =>
          item.kind === "comment" ? (
            <li key={item.id} className="flex gap-3">
              <Avatar person={byId(item.authorId)} size="sm" />
              <div className="min-w-0 flex-1 rounded-lg border border-line bg-canvas px-4 py-3">
                <p className="flex flex-wrap items-baseline gap-x-2 text-sm">
                  <span className="font-semibold text-ink">{name(item.authorId)}</span>
                  <time dateTime={item.at} className="text-xs text-ink-muted">
                    {formatRelative(item.at)}
                  </time>
                </p>
                <p className="mt-1 text-sm whitespace-pre-line text-ink">{item.body}</p>
              </div>
            </li>
          ) : (
            <li key={item.id} className="flex items-center gap-3 text-sm text-ink-muted">
              <span className="grid size-8 shrink-0 place-items-center">
                {(() => {
                  const Icon = EVENT_ICONS[item.type] ?? RefreshCw;
                  return <Icon className="size-4" aria-hidden="true" />;
                })()}
              </span>
              <span>
                {describe(item, name)} ·{" "}
                <time dateTime={item.at} className="text-xs">
                  {formatRelative(item.at)}
                </time>
              </span>
            </li>
          ),
        )}
      </ol>
      <div className="border-t border-line pt-5">
        <CommentForm taskId={task.id} />
      </div>
    </div>
  );
}
