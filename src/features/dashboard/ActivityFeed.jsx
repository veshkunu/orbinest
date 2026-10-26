import { Link } from "react-router-dom";
import { CircleCheck, CirclePlus, MessageSquare } from "lucide-react";
import { formatRelative } from "../../lib/format";

const TYPES = {
  completed: { icon: CircleCheck, verb: "finished" },
  comment: { icon: MessageSquare, verb: "commented on" },
  created: { icon: CirclePlus, verb: "created" },
};

/** Latest team events, newest first. */
export function ActivityFeed({ events, byId }) {
  return (
    <ol className="flex flex-col">
      {events.map((e, i) => {
        const { icon: Icon, verb } = TYPES[e.type];
        const actor = byId(e.actorId);
        const last = i === events.length - 1;
        return (
          <li key={e.id} className="relative flex gap-3 pb-5 last:pb-0">
            {!last && <span className="absolute top-7 bottom-1 left-2 w-px bg-line" aria-hidden="true" />}
            <Icon className="relative mt-0.5 size-4 shrink-0 text-ink-muted" aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <p className="text-sm text-ink">
                <span className="font-semibold">{actor ? actor.firstName : "Someone"}</span> {verb}{" "}
                <Link to={`/tasks/${e.taskId}`} className="font-medium text-brand-700 hover:underline">
                  {e.taskTitle}
                </Link>
              </p>
              <time dateTime={e.at} className="text-xs text-ink-muted">
                {formatRelative(e.at)}
              </time>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
