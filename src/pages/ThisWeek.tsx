import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CalendarDays, TrendingUp } from "lucide-react";
import { apiClient, WeekDetail, MonthSummary } from "../lib/api";
import LoadingScreen from "../components/LoadingScreen";

function fmtUGX(v: string | number) {
  const n = typeof v === "string" ? parseFloat(v) : v;
  return "UGX " + Math.round(n).toLocaleString();
}

function fmtDateOnly(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function OddsGap({ gap }: { gap: number | null }) {
  if (gap === null) return <span className="text-ink-faint">no wins yet</span>;
  if (gap <= 0) return <span className="text-risk-low">on target</span>;
  return <span className="text-risk-high">behind by {gap.toFixed(2)}</span>;
}

export default function ThisWeek() {
  const [week, setWeek] = useState<WeekDetail | null>(null);
  const [months, setMonths] = useState<MonthSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasNoPlan, setHasNoPlan] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [weekRes, monthsRes] = await Promise.all([
          apiClient.getWeekPlan("current"),
          apiClient.getMonthlyBreakdown(),
        ]);
        if (!cancelled) {
          setWeek(weekRes.data);
          setMonths(monthsRes.data.months);
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

  if (loading) return <LoadingScreen label="Loading this week's plan" />;

  if (hasNoPlan || !week) {
    return (
      <div className="max-w-xl mx-auto px-5 py-24 text-center">
        <span className="label-eyebrow">No active season</span>
        <h1 className="font-display text-4xl mt-2 mb-3 text-ink-paper">
          Set up your season to get started
        </h1>
        <Link
          to="/onboarding"
          className="inline-block bg-ticker text-ink-bg font-medium px-6 py-3 rounded-stub hover:bg-ticker-glow transition-colors"
        >
          Plan my season
        </Link>
      </div>
    );
  }

  const advice = week.bet_frequency_advice;

  return (
    <div className="max-w-4xl mx-auto px-5 py-10">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <span className="label-eyebrow">Week {week.week_number}</span>
        <h1 className="font-display text-4xl mt-2 mb-8 text-ink-paper">This week's plan</h1>

        {/* Budget */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-ink-panel border border-ink-hairline rounded-stub p-5">
            <span className="label-eyebrow">Target stake</span>
            <div className="ledger-value text-2xl text-ink-paper mt-2">{fmtUGX(week.target_stake_ugx)}</div>
          </div>
          <div className="bg-ink-panel border border-ink-hairline rounded-stub p-5">
            <span className="label-eyebrow">Spent</span>
            <div className="ledger-value text-2xl text-ink-paper mt-2">{fmtUGX(week.spent_ugx)}</div>
          </div>
          <div className="bg-ink-panel border border-ink-hairline rounded-stub p-5">
            <span className="label-eyebrow">Remaining</span>
            <div className="ledger-value text-2xl text-ink-paper mt-2">
              {fmtUGX(week.remaining_budget_ugx)}
            </div>
          </div>
          <div className="bg-ink-panel border border-ink-hairline rounded-stub p-5">
            <span className="label-eyebrow">Net</span>
            <div className="ledger-value text-2xl text-ink-paper mt-2">{fmtUGX(week.net_ugx)}</div>
          </div>
        </div>

        {/* Odds */}
        <div className="bg-ink-panel border border-ink-hairline rounded-stub p-5 mb-8">
          <span className="label-eyebrow">Odds progress</span>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-3">
            <div>
              <div className="text-xs text-ink-faint">Won</div>
              <div className="ledger-value text-xl text-risk-low">{week.bets_won}</div>
            </div>
            <div>
              <div className="text-xs text-ink-faint">Lost</div>
              <div className="ledger-value text-xl text-risk-high">{week.bets_lost}</div>
            </div>
            <div>
              <div className="text-xs text-ink-faint">Pending</div>
              <div className="ledger-value text-xl text-ink-paper">{week.bets_pending}</div>
            </div>
            <div>
              <div className="text-xs text-ink-faint">Avg odds on wins</div>
              <div className="ledger-value text-xl text-ink-paper">
                {week.avg_odds_achieved_on_wins !== null ? week.avg_odds_achieved_on_wins.toFixed(2) : "—"}
              </div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-ink-hairline text-sm">
            <span className="text-ink-muted">Target odds to chase: </span>
            <span className="ledger-value text-ink-paper">{week.target_odds_to_chase.toFixed(2)}</span>
            <span className="text-ink-muted"> — </span>
            <OddsGap gap={week.odds_gap} />
          </div>
        </div>

        {/* Bet frequency advice — primary CTA */}
        <div className="bg-ticker/5 border border-ticker/25 rounded-stub p-5 mb-8 flex gap-3">
          <TrendingUp size={20} className="text-ticker shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-ink-paper leading-relaxed">{advice.message}</p>
            {advice.recommended_days.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {advice.recommended_days.map((d) => (
                  <span
                    key={d}
                    className="text-xs font-mono text-ticker border border-ticker/30 rounded-stub px-2 py-1"
                  >
                    {fmtDateOnly(d)}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Daily breakdown — only days with qualifying matches are returned */}
        {week.daily_breakdown.length > 0 && (
          <div className="mb-10">
            <span className="label-eyebrow">Daily breakdown</span>
            <div className="mt-3 space-y-2">
              {week.daily_breakdown.map((day) => (
                <div
                  key={day.date}
                  className="bg-ink-panel border border-ink-hairline rounded-stub p-4 flex flex-wrap items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-2">
                    <CalendarDays size={15} className="text-ink-faint" />
                    <span className="text-sm text-ink-paper font-medium">{fmtDateOnly(day.date)}</span>
                    <span className="text-xs text-ink-faint">
                      {day.qualifying_match_count} qualifying match{day.qualifying_match_count === 1 ? "" : "es"}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-6 text-sm">
                    <div>
                      <span className="text-ink-faint text-xs">Target </span>
                      <span className="ledger-value text-ink-paper">{fmtUGX(day.target_stake_ugx)}</span>
                    </div>
                    <div>
                      <span className="text-ink-faint text-xs">Remaining </span>
                      <span className="ledger-value text-ink-paper">{fmtUGX(day.remaining_budget_ugx)}</span>
                    </div>
                    <div>
                      <OddsGap gap={day.odds_gap} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Monthly progress */}
        {months.length > 0 && (
          <div>
            <span className="label-eyebrow">Monthly progress</span>
            <div className="mt-3 space-y-2">
              {months.map((mo) => (
                <div
                  key={mo.month_number}
                  className="bg-ink-panel border border-ink-hairline rounded-stub p-4 flex flex-wrap items-center justify-between gap-4"
                >
                  <div>
                    <div className="text-sm text-ink-paper font-medium">Month {mo.month_number}</div>
                    <div className="text-xs text-ink-faint">
                      {fmtDateOnly(mo.starts_on)} – {fmtDateOnly(mo.ends_on)}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-6 text-sm">
                    <div>
                      <span className="text-ink-faint text-xs">Spent </span>
                      <span className="ledger-value text-ink-paper">{fmtUGX(mo.spent_ugx)}</span>
                    </div>
                    <div>
                      <span className="text-ink-faint text-xs">Earned </span>
                      <span className="ledger-value text-ink-paper">{fmtUGX(mo.earned_ugx)}</span>
                    </div>
                    <div>
                      <span className="text-ink-faint text-xs">Net </span>
                      <span className="ledger-value text-ink-paper">{fmtUGX(mo.net_ugx)}</span>
                    </div>
                    <div>
                      <OddsGap gap={mo.odds_gap} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
