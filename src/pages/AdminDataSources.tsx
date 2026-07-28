import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, AlertTriangle, RefreshCw } from "lucide-react";
import { apiClient, DataSourceStatus } from "../lib/api";
import LoadingScreen from "../components/LoadingScreen";

const STATUS_META: Record<string, { label: string; dot: string; text: string }> = {
  synced: { label: "Synced", dot: "bg-risk-low", text: "text-risk-low" },
  rate_limited: { label: "Rate limited", dot: "bg-risk-medium", text: "text-risk-medium" },
  error: { label: "Error", dot: "bg-risk-high", text: "text-risk-high" },
};

function fmtRelative(iso: string | null) {
  if (!iso) return "Never";
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr${hrs === 1 ? "" : "s"} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

export default function AdminDataSources() {
  const [sources, setSources] = useState<DataSourceStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [resyncingId, setResyncingId] = useState<number | null>(null);

  const load = useCallback(() => {
    apiClient
      .getAdminDataSources()
      .then((res) => setSources(res.data))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleResync = async (id: number) => {
    setResyncingId(id);
    try {
      await apiClient.resyncDataSource(id);
    } finally {
      setTimeout(() => {
        setResyncingId(null);
        load();
      }, 1500);
    }
  };

  const hasIssue = sources.some((s) => s.status !== "synced");

  if (loading) return <LoadingScreen label="Loading data sources" />;

  return (
    <div className="max-w-3xl mx-auto px-5 py-10">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <Link to="/admin" className="flex w-fit items-center gap-1.5 text-sm text-ink-muted hover:text-ink-paper mb-6 transition-colors">
          <ArrowLeft size={15} />
          Back to overview
        </Link>

        <span className="label-eyebrow">Admin</span>
        <h1 className="font-display text-4xl mt-2 mb-6 text-ink-paper">Data sources</h1>

        <div className="hidden md:grid grid-cols-[1.5fr_1fr_1fr_1fr_auto] gap-2 px-3 pb-2 text-xs text-ink-faint">
          <span>League</span>
          <span>Source</span>
          <span>Last sync</span>
          <span>Status</span>
          <span></span>
        </div>

        <div className="flex flex-col gap-1.5 mb-5">
          {sources.length === 0 ? (
            <p className="text-sm text-ink-muted px-3 py-6">
              No sync history yet — leagues will appear here after the first scheduled sync runs.
            </p>
          ) : (
            sources.map((s) => {
              const meta = STATUS_META[s.status];
              return (
                <div
                  key={s.id}
                  className="grid grid-cols-2 md:grid-cols-[1.5fr_1fr_1fr_1fr_auto] gap-2 items-center bg-ink-panel border border-ink-hairline rounded-stub px-3 py-3"
                >
                  <span className="col-span-2 md:col-span-1 text-sm font-medium text-ink-paper">{s.name}</span>
                  <span className="text-xs text-ink-muted">{s.source}</span>
                  <span className="text-xs text-ink-muted">{fmtRelative(s.last_synced_at)}</span>
                  <span className={`inline-flex items-center gap-1.5 text-xs ${meta.text}`}>
                    <span className={`w-2 h-2 rounded-full ${meta.dot}`} />
                    {meta.label}
                  </span>
                  <button
                    onClick={() => handleResync(s.id)}
                    disabled={resyncingId === s.id}
                    className="justify-self-start md:justify-self-end text-xs text-ink-muted border border-ink-hairline rounded-stub px-3 py-1.5 hover:text-ink-paper transition-colors disabled:opacity-50 inline-flex items-center gap-1.5"
                  >
                    <RefreshCw size={12} className={resyncingId === s.id ? "animate-spin" : ""} />
                    {resyncingId === s.id ? "Queuing…" : "Resync"}
                  </button>
                </div>
              );
            })
          )}
        </div>

        {hasIssue && (
          <div className="bg-risk-medium/10 border border-risk-medium/30 rounded-stub px-4 py-3 flex items-start gap-2">
            <AlertTriangle size={14} className="text-risk-medium mt-0.5 shrink-0" />
            <p className="text-xs text-risk-medium">
              One or more sources aren't synced. Rate limits clear on their own next run — use Resync to retry a
              specific league immediately.
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
