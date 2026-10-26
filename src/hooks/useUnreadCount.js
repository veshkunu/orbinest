import { useAuth } from "../context/AuthContext";
import { countUnread } from "../services/notificationService";
import { useQuery } from "./useQuery";

export function useUnreadCount() {
  const { user } = useAuth();
  const { data = 0 } = useQuery(`unread:${user?.id}`, () => (user ? countUnread(user.id) : 0));
  return data;
}
