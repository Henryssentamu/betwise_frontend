import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Search } from "lucide-react";
import { apiClient, AdminNotificationLogEntry, AdminNotificationSummary } from "../lib/api";
import LoadingScreen from "../components/LoadingScreen";

const STATUS_CLASSES: Record<string, string> = {
  sent: "bg-risk-low/15 text-risk-low",
  failed: "bg-risk-high/15 text-risk-high",
};

const TYPE_LABEL: Record<string, string> = {
  subscription_expiring_monthly: "Monthly expiry",
  subscription_expiring_seasonal: "Seasonal expiry",
};

function fmtDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export default function AdminNotifications() {
  const [logs, setLogs] = useState<AdminNotificationLogEntry[]>([]);
  const [summary, setSummary] = useState<AdminNotificationSummary>({});
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    apiClient
      .getAdminNotificationLog({
        search: search || undefined,
        type: type || undefined,
        status: status || undefined,
        page,
      })
      .then((res) => {
        setLogs(res.data.results);
        setCount(res.data.count);
        setSummary(res.data.summary);
      })
      .finally(() => setLoading(false));
  }, [search, type, status, page]);

  useEffect(() => {
    load();
  }, [load]);

  const pageSize = 20;
  const totalPages = Math.max(1, Math.ceil(count / pageSize));

  return (
    <div className="max-w-5xl mx-auto px-5 py-10">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <Link to="/admin" className="flex w-fit items-center gap-1.5 text-sm text-ink-muted hover:text-ink-paper mb-6 transition-colors">
          <ArrowLeft size={15} />
          Back to overview
        </Link>

        <span className="label-eyebrow">Admin</span>
        <h1 className="font-display text-4xl mt-2 mb-6 text-ink-paper">Notifications</h1>

        <div className="grid grid-cols-2 gap-3 mb-6">
          {Object.entries(TYPE_LABEL).map(([key, label]) => {
            const stats = summary[key] || { sent: 0, failed: 0 };
            return (
              <div key={key} className="bg-ink-panel border border-ink-hairline rounded-stub p-4">
                <p className="text-xs text-ink-muted mb-2">{label}</p>
                <div className="flex items-baseline gap-4">
                  <span className="text-2xl font-mono text-risk-low">{stats.sent}</span>
                  <span className="text-xs text-ink-faint">sent</span>
                  {stats.failed > 0 && (
                    <>
                      <span className="text-2xl font-mono text-risk-high">{stats.failed}</span>
                      <span className="text-xs text-ink-faint">failed</span>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-3 mb-5">
          <form
            className="relative flex-1 min-w-[220px]"
            onSubmit={(e) => {
              e.preventDefault();
              setPage(1);
              setSearch(searchInput.trim());
            }}
          >
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by username or email"
              className="w-full bg-ink-panel border border-ink-hairline rounded-stub pl-9 pr-3 py-2 text-sm text-ink-paper focus:border-ticker outline-none"
            />
          </form>

          <select
            value={type}
            onChange={(e) => {
              setPage(1);
              setType(e.target.value);
            }}
            className="bg-ink-panel border border-ink-hairline rounded-stub px-3 py-2 text-sm text-ink-muted outline-none"
          >
            <option value="">All types</option>
            <option value="subscription_expiring_monthly">Monthly expiry</option>
            <option value="subscription_expiring_seasonal">Seasonal expiry</option>
          </select>

          <select
            value={status}
            onChange={(e) => {
              setPage(1);
              setStatus(e.target.value);
            }}
            className="bg-ink-panel border border-ink-hairline rounded-stub px-3 py-2 text-sm text-ink-muted outline-none"
          >
            <option value="">All statuses</option>
            <option value="sent">Sent</option>
            <option value="failed">Failed</option>
          </select>
        </div>

        {loading ? (
          <LoadingScreen label="Loading notifications" />
        ) : (
          <>
            <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-2 px-3 pb-2 text-xs text-ink-faint">
              <span>User</span>
              <span>Type</span>
              <span>Subscription ends</span>
              <span>Status</span>
              <span>Sent</span>
            </div>
            <div className="flex flex-col gap-1.5">
              {logs.length === 0 ? (
                <p className="text-sm text-ink-muted px-3 py-6">No notifications match these filters.</p>
              ) : (
                logs.map((log) => (
                  <div
                    key={log.id}
                    className="grid grid-cols-2 md:grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-2 items-center bg-ink-panel border border-ink-hairline rounded-stub px-3 py-3"
                  >
                    <div className="col-span-2 md:col-span-1">
                      <p className="text-sm font-medium text-ink-paper">{log.username}</p>
                      <p className="text-xs text-ink-faint">{log.email}</p>
                    </div>
                    <span className="text-sm text-ink-muted">{TYPE_LABEL[log.notification_type]}</span>
                    <span className="text-sm text-ink-muted">{fmtDate(log.subscription_ends_at)}</span>
                    <div>
                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded-md w-fit inline-block ${STATUS_CLASSES[log.status]}`}>
                        {log.status === "sent" ? "Sent" : "Failed"}
                      </span>
                      {log.status === "failed" && log.detail && (
                        <p className="text-[11px] text-risk-high mt-1">{log.detail}</p>
                      )}
                    </div>
                    <span className="text-xs text-ink-faint">{fmtDate(log.created_at)}</span>
                  </div>
                ))
              )}
            </div>

            <div className="flex items-center justify-between mt-5">
              <p className="text-xs text-ink-faint">
                Showing {logs.length ? (page - 1) * pageSize + 1 : 0}–{(page - 1) * pageSize + logs.length} of {count}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="text-xs text-ink-muted border border-ink-hairline rounded-stub px-3 py-1.5 disabled:opacity-40 hover:text-ink-paper transition-colors"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="text-xs text-ink-muted border border-ink-hairline rounded-stub px-3 py-1.5 disabled:opacity-40 hover:text-ink-paper transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
