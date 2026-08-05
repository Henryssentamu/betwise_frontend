import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Bell, Check } from "lucide-react";
import { apiClient, Notification, unwrapList } from "../lib/api";
import LoadingScreen from "../components/LoadingScreen";

function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
  });
}

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);

  const load = () => {
    apiClient
      .getNotifications()
      .then((res) => setNotifications(unwrapList(res.data)))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleMarkRead = async (id: string) => {
    const res = await apiClient.markNotificationRead(id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? res.data : n)));
  };

  const handleMarkAllRead = async () => {
    setMarkingAll(true);
    try {
      await apiClient.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } finally {
      setMarkingAll(false);
    }
  };

  const hasUnread = notifications.some((n) => !n.is_read);

  if (loading) return <LoadingScreen label="Loading notifications" />;

  return (
    <div className="max-w-2xl mx-auto px-5 py-10">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="label-eyebrow">Notifications</span>
            <h1 className="font-display text-4xl mt-2 text-ink-paper">Your notifications</h1>
          </div>
          {hasUnread && (
            <button
              onClick={handleMarkAllRead}
              disabled={markingAll}
              className="text-sm text-ink-muted hover:text-ink-paper border border-ink-hairline rounded-stub px-3 py-2 transition-colors disabled:opacity-50"
            >
              Mark all read
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <Bell size={28} className="text-ink-faint mb-3" />
            <p className="text-sm text-ink-muted">You don't have any notifications yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`bg-ink-panel border rounded-stub p-4 flex items-start gap-3 ${
                  n.is_read ? "border-ink-hairline" : "border-ticker/40 bg-ticker/5"
                }`}
              >
                {!n.is_read && <span className="w-2 h-2 mt-1.5 rounded-full bg-ticker shrink-0" />}
                <div className="flex-1">
                  <p className="text-sm text-ink-paper font-medium">{n.title}</p>
                  <p className="text-sm text-ink-muted mt-1">{n.body}</p>
                  <p className="text-xs text-ink-faint mt-2">{fmtDateTime(n.created_at)}</p>
                </div>
                {!n.is_read && (
                  <button
                    onClick={() => handleMarkRead(n.id)}
                    className="text-ink-faint hover:text-ticker transition-colors shrink-0"
                    aria-label="Mark as read"
                    title="Mark as read"
                  >
                    <Check size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
