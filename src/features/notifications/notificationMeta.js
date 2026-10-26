import { AlarmClock, CircleCheck, ClipboardList, Megaphone, MessageSquare, TriangleAlert } from "lucide-react";

/** One grey outline icon per type; the title says what happened, colour is kept for data. */
export const NOTIFICATION_TYPES = {
  task_assigned: { icon: ClipboardList },
  task_due_soon: { icon: AlarmClock },
  task_overdue: { icon: TriangleAlert },
  task_completed: { icon: CircleCheck },
  comment_added: { icon: MessageSquare },
  announcement: { icon: Megaphone },
};
