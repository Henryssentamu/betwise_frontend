import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { apiClient, Recommendation, unwrapList } from "../lib/api";
import RecommendationCard from "../components/RecommendationCard";
import LoadingScreen from "../components/LoadingScreen";

const RISK_FILTERS = [
  { value: "", label: "All" },
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

export default function Recommendations() {
  const [recs, setRecs] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [riskFilter, setRiskFilter] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    apiClient
      .getRecommendations(riskFilter ? { risk_tier: riskFilter } : undefined)
      .then((res) => {
        if (!cancelled) setRecs(unwrapList(res.data));
      })
      .catch(() => {
        if (!cancelled) setError("Couldn't load recommendations. Try again shortly.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [riskFilter]);

  return (
    <div className="max-w-3xl mx-auto px-5 py-10">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <span className="label-eyebrow">This week</span>
        <h1 className="font-display text-4xl mt-2 mb-6 text-ink-paper">Recommendations</h1>

        <div className="flex gap-2 mb-8">
          {RISK_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setRiskFilter(f.value)}
              className={`px-3.5 py-1.5 rounded-full text-sm font-mono border transition-colors ${
                riskFilter === f.value
                  ? "border-ticker text-ticker bg-ticker/10"
                  : "border-ink-hairline text-ink-muted hover:border-ink-faint"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading && <LoadingScreen label="Scoring matches" />}

        {!loading && error && (
          <div className="bg-risk-high/10 border border-risk-high/30 rounded-stub px-4 py-3 text-sm text-risk-high">
            {error}
          </div>
        )}

        {!loading && !error && recs.length === 0 && (
          <div className="text-center py-20">
            <p className="text-ink-muted text-sm mb-1">No recommendations yet.</p>
            <p className="text-ink-faint text-xs">
              This usually means your subscription isn't active yet, or matches haven't been scored for this window.
            </p>
          </div>
        )}

        <div className="space-y-4">
          {recs.map((rec) => (
            <RecommendationCard key={rec.id} rec={rec} />
          ))}
        </div>
      </motion.div>
    </div>
  );
}
