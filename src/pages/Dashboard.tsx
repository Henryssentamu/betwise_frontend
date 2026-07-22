import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownRight, Minus, TrendingUp } from "lucide-react";
import { apiClient, SeasonPlan, PaceSummary } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import LoadingScreen from "../components/LoadingScreen";

function fmtUGX(v: string | number) {
  const n = typeof v === "string" ? parseFloat(v) : v;
  return "UGX " + Math.round(n).toLocaleString();
}

const PACE_META = {
  ahead: { label: "Ahead of pace", icon: ArrowUpRight, className: "text-risk-low" },
  on_track: { label: "On track", icon: Minus, className: "text-ticker" },
  behind: { label: "Behind pace", icon: ArrowDownRight, className: "text-risk-high" },
};

export default function Dashboard() {
  const { user } = useAuth();
  const [plan, setPlan] = useState<SeasonPlan | null>(null);
  const [pace, setPace] = useState<PaceSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasNoPlan, setHasNoPlan] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [planRes, paceRes] = await Promise.all([
          apiClient.getActiveSeasonPlan(),
          apiClient.getPaceDashboard(),
        ]);
        if (!cancelled) {
          setPlan(planRes.data);
          setPace(paceRes.data);
        }
      } catch (err: any) {
        if (!cancelled && err?.response?.status === 404) {
          setHasNoPlan(true);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <LoadingScreen label="Loading your season" />;

  if (hasNoPlan || !plan) {
    return (
      <div className="max-w-xl mx-auto px-5 py-24 text-center">
        <span className="label-eyebrow">No active season</span>
        <h1 className="font-display text-4xl mt-2 mb-3 text-ink-paper">
          Set up your season to get started
        </h1>
        <p className="text-sm text-ink-muted mb-8">
          Tell us your budget and target, and we'll build weekly stakes and start scoring matches for you.
        </p>
        <Link
          to="/onboarding"
          className="inline-block bg-ticker text-ink-bg font-medium px-6 py-3 rounded-stub hover:bg-ticker-glow transition-colors"
        >
          Plan my season
        </Link>
      </div>
    );
  }

  const meta = pace ? PACE_META[pace.pace_status] : PACE_META.on_track;
  const PaceIcon = meta.icon;

  const currentWeek = plan.weekly_targets?.find((wt) => {
    const start = new Date(wt.week_starts_on);
    const end = new Date(start);
    end.setDate(end.getDate() + 7);
    const now = new Date();
    return now >= start && now < end;
  });

  return (
    <div className="max-w-6xl mx-auto px-5 py-10">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <span className="label-eyebrow">Welcome back{user ? ", " + user.username : ""}</span>
        <h1 className="font-display text-4xl mt-2 mb-8 text-ink-paper">Season overview</h1>

        {/* KPI cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-ink-panel border border-ink-hairline rounded-stub p-5">
            <span className="label-eyebrow">Invested</span>
            <div className="ledger-value text-2xl text-ink-paper mt-2">
              {pace ? fmtUGX(pace.total_invested_ugx) : "—"}
            </div>
          </div>
          <div className="bg-ink-panel border border-ink-hairline rounded-stub p-5">
            <span className="label-eyebrow">Earned</span>
            <div className="ledger-value text-2xl text-ink-paper mt-2">
              {pace ? fmtUGX(pace.total_earned_ugx) : "—"}
            </div>
          </div>
          <div className="bg-ink-panel border border-ink-hairline rounded-stub p-5">
            <span className="label-eyebrow">Net</span>
            <div className="ledger-value text-2xl text-ink-paper mt-2">
              {pace ? fmtUGX(pace.net_ugx) : "—"}
            </div>
          </div>
          <div className="bg-ink-panel border border-ink-hairline rounded-stub p-5">
            <span className="label-eyebrow">Pace</span>
            <div className={`flex items-center gap-1.5 mt-2 ${meta.className}`}>
              <PaceIcon size={18} />
              <span className="font-display text-xl">{meta.label}</span>
            </div>
          </div>
        </div>

        {/* Odds progress */}
        {pace && (
          <div className="bg-ink-panel border border-ink-hairline rounded-stub p-5 mb-8">
            <span className="label-eyebrow">Odds progress</span>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-3">
              <div>
                <div className="text-xs text-ink-faint">Won</div>
                <div className="ledger-value text-xl text-risk-low">{pace.season_bets_won}</div>
              </div>
              <div>
                <div className="text-xs text-ink-faint">Lost</div>
                <div className="ledger-value text-xl text-risk-high">{pace.season_bets_lost}</div>
              </div>
              <div>
                <div className="text-xs text-ink-faint">Pending</div>
                <div className="ledger-value text-xl text-ink-paper">{pace.season_bets_pending}</div>
              </div>
              <div>
                <div className="text-xs text-ink-faint">Avg odds on wins</div>
                <div className="ledger-value text-xl text-ink-paper">
                  {pace.season_avg_odds_achieved_on_wins !== null
                    ? pace.season_avg_odds_achieved_on_wins.toFixed(2)
                    : "—"}
                </div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-ink-hairline text-sm">
              <span className="text-ink-muted">Target odds to chase: </span>
              <span className="ledger-value text-ink-paper">
                {pace.season_target_odds_to_chase.toFixed(2)}
              </span>
              <span className="text-ink-muted"> — </span>
              {pace.season_odds_gap === null ? (
                <span className="text-ink-faint">no wins logged yet</span>
              ) : pace.season_odds_gap <= 0 ? (
                <span className="text-risk-low">on target</span>
              ) : (
                <span className="text-risk-high">behind by {pace.season_odds_gap.toFixed(2)}</span>
              )}
            </div>
          </div>
        )}

        {/* Narrative + course correction */}
        {pace?.course_correction_message && (
          <div className="bg-ticker/5 border border-ticker/25 rounded-stub p-5 mb-8 flex gap-3">
            <TrendingUp size={20} className="text-ticker shrink-0 mt-0.5" />
            <p className="text-sm text-ink-paper leading-relaxed">{pace.course_correction_message}</p>
          </div>
        )}

        {/* This week's target */}
        {currentWeek && (
          <div className="bg-ink-panel border border-ink-hairline rounded-stub p-5 mb-8">
            <span className="label-eyebrow">This week's target — week {currentWeek.week_number}</span>
            <div className="flex flex-wrap gap-8 mt-3">
              <div>
                <div className="text-xs text-ink-faint">Stake</div>
                <div className="ledger-value text-xl text-ink-paper">
                  {fmtUGX(currentWeek.target_stake_ugx)}
                </div>
              </div>
              <div>
                <div className="text-xs text-ink-faint">Odds to chase</div>
                <div className="ledger-value text-xl text-ink-paper">
                  {currentWeek.target_odds_to_chase.toFixed(2)}
                </div>
              </div>
            </div>
            <Link
              to="/this-week"
              className="inline-block mt-4 text-sm text-ticker hover:text-ticker-glow transition-colors"
            >
              View full week breakdown →
            </Link>
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <Link
            to="/recommendations"
            className="inline-flex items-center gap-2 bg-ticker text-ink-bg font-medium px-6 py-3 rounded-stub hover:bg-ticker-glow transition-colors"
          >
            View this week's recommendations
            <ArrowUpRight size={16} />
          </Link>
          <Link
            to="/this-week"
            className="inline-flex items-center gap-2 border border-ink-hairline text-ink-paper font-medium px-6 py-3 rounded-stub hover:border-ticker transition-colors"
          >
            This week's plan
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
