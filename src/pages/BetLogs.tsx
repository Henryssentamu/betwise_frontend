import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check, X, Lock } from "lucide-react";
import { apiClient, BetLog, unwrapList } from "../lib/api";
import LoadingScreen from "../components/LoadingScreen";

function fmtUGX(v: string | number) {
  const n = typeof v === "string" ? parseFloat(v) : v;
  return "UGX " + Math.round(n).toLocaleString();
}

const RESULT_CLASSES: Record<string, string> = {
  pending: "bg-ink-hairline/40 text-ink-muted border-ink-hairline",
  won: "bg-risk-low/15 text-risk-low border-risk-low/40",
  lost: "bg-risk-high/15 text-risk-high border-risk-high/40",
};

function ResultBadge({ result }: { result: BetLog["result"] }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border font-mono uppercase tracking-wide text-[10px] px-2 py-0.5 ${RESULT_CLASSES[result]}`}
    >
      {result}
    </span>
  );
}

function BetLogRow({ log, onResolved }: { log: BetLog; onResolved: (updated: BetLog) => void }) {
  const [payoutDraft, setPayoutDraft] = useState(() => (log.stake_ugx && log.odds_taken
    ? (parseFloat(log.stake_ugx) * log.odds_taken).toFixed(2)
    : ""));
  const [reportingWon, setReportingWon] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resolvesAutomatically = log.followed_recommendation && log.recommendation !== null;
  const canReport = !resolvesAutomatically && log.result === "pending";

  const submit = async (result: "won" | "lost") => {
    setSubmitting(true);
    setError(null);
    try {
      const payload: { result: "won" | "lost"; payout_ugx?: number } = { result };
      if (result === "won" && payoutDraft) payload.payout_ugx = parseFloat(payoutDraft);
      const res = await apiClient.reportBetResult(log.id, payload);
      onResolved(res.data);
      setReportingWon(false);
    } catch (err: any) {
      setError(err?.response?.data?.non_field_errors?.[0] || err?.response?.data?.detail || "Couldn't report result.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-ink-panel border border-ink-hairline rounded-stub p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <ResultBadge result={log.result} />
          <span className="text-sm text-ink-paper font-medium">{fmtUGX(log.stake_ugx)}</span>
          <span className="text-xs text-ink-faint font-mono">@ {log.odds_taken.toFixed(2)}</span>
          {log.payout_ugx !== null && (
            <span className="text-xs text-ink-muted">payout {fmtUGX(log.payout_ugx)}</span>
          )}
        </div>

        {resolvesAutomatically ? (
          <span className="inline-flex items-center gap-1.5 text-xs text-ink-faint">
            <Lock size={12} />
            Resolves automatically
          </span>
        ) : canReport ? (
          reportingWon ? (
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={payoutDraft}
                onChange={(e) => setPayoutDraft(e.target.value)}
                placeholder="Payout (UGX)"
                className="w-32 bg-ink-bg border border-ink-hairline rounded-stub px-2 py-1 text-xs text-ink-paper focus:border-ticker outline-none"
              />
              <button
                onClick={() => submit("won")}
                disabled={submitting}
                className="text-xs px-3 py-1.5 rounded-stub bg-risk-low/15 text-risk-low border border-risk-low/40 hover:bg-risk-low/25 transition-colors disabled:opacity-50"
              >
                Confirm
              </button>
              <button
                onClick={() => setReportingWon(false)}
                className="text-xs text-ink-faint hover:text-ink-muted"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setReportingWon(true)}
                disabled={submitting}
                className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-stub bg-risk-low/15 text-risk-low border border-risk-low/40 hover:bg-risk-low/25 transition-colors disabled:opacity-50"
              >
                <Check size={12} /> Won
              </button>
              <button
                onClick={() => submit("lost")}
                disabled={submitting}
                className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-stub bg-risk-high/15 text-risk-high border border-risk-high/40 hover:bg-risk-high/25 transition-colors disabled:opacity-50"
              >
                <X size={12} /> Lost
              </button>
            </div>
          )
        ) : null}
      </div>
      {error && <p className="text-xs text-risk-high mt-2">{error}</p>}
    </div>
  );
}

export default function BetLogs() {
  const [logs, setLogs] = useState<BetLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .getBetLogs()
      .then((res) => setLogs(unwrapList(res.data)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingScreen label="Loading bet logs" />;

  return (
    <div className="max-w-3xl mx-auto px-5 py-10">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <span className="label-eyebrow">Bet log</span>
        <h1 className="font-display text-4xl mt-2 mb-8 text-ink-paper">Your bets</h1>

        {logs.length === 0 ? (
          <p className="text-sm text-ink-muted">You haven't logged any bets yet.</p>
        ) : (
          <div className="space-y-2">
            {logs.map((log) => (
              <BetLogRow
                key={log.id}
                log={log}
                onResolved={(updated) =>
                  setLogs((prev) => prev.map((l) => (l.id === updated.id ? updated : l)))
                }
              />
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
