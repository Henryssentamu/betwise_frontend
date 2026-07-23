import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { apiClient, BetLog } from "../lib/api";

interface LogBetFormProps {
  /** Set when logging a bet that followed a system recommendation. */
  recommendationId?: number;
  suggestedOdds?: { min: number; max: number };
  onLogged?: (log: BetLog) => void;
}

export default function LogBetForm({ recommendationId, suggestedOdds, onLogged }: LogBetFormProps) {
  const [stake, setStake] = useState("");
  const [odds, setOdds] = useState(
    suggestedOdds ? (((suggestedOdds.min + suggestedOdds.max) / 2).toFixed(2)) : ""
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logged, setLogged] = useState<BetLog | null>(null);

  const submit = async () => {
    const stakeValue = parseFloat(stake);
    const oddsValue = parseFloat(odds);
    if (!stakeValue || stakeValue <= 0) {
      setError("Enter how much you staked.");
      return;
    }
    if (!oddsValue || oddsValue <= 1) {
      setError("Enter the odds you actually got.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await apiClient.logBet({
        recommendation: recommendationId,
        stake_ugx: stakeValue,
        odds_taken: oddsValue,
        followed_recommendation: recommendationId !== undefined,
      });
      setLogged(res.data);
      onLogged?.(res.data);
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Couldn't log this bet. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (logged) {
    return (
      <div className="flex items-center gap-2 text-sm text-risk-low">
        <CheckCircle2 size={16} />
        Bet logged — track it under Bet log.
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div>
        <label className="block text-xs text-ink-muted mb-1">Stake (UGX)</label>
        <input
          type="number"
          value={stake}
          onChange={(e) => setStake(e.target.value)}
          placeholder="e.g. 20000"
          className="w-32 bg-ink-bg border border-ink-hairline rounded-stub px-3 py-2 text-sm text-ink-paper focus:border-ticker outline-none"
        />
      </div>
      <div>
        <label className="block text-xs text-ink-muted mb-1">Odds taken</label>
        <input
          type="number"
          step="0.01"
          value={odds}
          onChange={(e) => setOdds(e.target.value)}
          placeholder="e.g. 1.85"
          className="w-24 bg-ink-bg border border-ink-hairline rounded-stub px-3 py-2 text-sm text-ink-paper focus:border-ticker outline-none"
        />
      </div>
      <button
        onClick={submit}
        disabled={submitting}
        className="bg-ticker text-ink-bg font-medium text-sm px-4 py-2 rounded-stub hover:bg-ticker-glow transition-colors disabled:opacity-50"
      >
        {submitting ? "Logging…" : "Log this bet"}
      </button>
      {error && <p className="text-xs text-risk-high w-full">{error}</p>}
    </div>
  );
}
