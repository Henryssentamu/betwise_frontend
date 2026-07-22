import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { Recommendation } from "../lib/api";
import RiskBadge from "./RiskBadge";

function formatKickoff(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  }) + " · " + d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

const BET_TYPE_LABEL: Record<string, string> = {
  home_win: "Home win",
  away_win: "Away win",
  draw: "Draw",
  corners: "Corners",
  btts: "Both teams to score",
  over_under: "Over/Under",
};

export default function RecommendationCard({ rec }: { rec: Recommendation }) {
  const m = rec.match;

  return (
    <Link to={`/matches/${m.id}`} className="block group">
      <div className="stub-card transition-colors hover:border-ticker/50">
        {/* Left: match info */}
        <div className="flex-1 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="label-eyebrow">{m.league?.name ?? "League"}</span>
            <span className="label-eyebrow">{formatKickoff(m.kickoff_at)}</span>
          </div>

          <div className="font-display text-2xl leading-none tracking-tight text-ink-paper mb-1">
            {m.home_team?.short_name ?? m.home_team?.name}
            <span className="text-ink-faint mx-2">vs</span>
            {m.away_team?.short_name ?? m.away_team?.name}
          </div>

          <p className="text-sm text-ink-muted mt-3 leading-relaxed line-clamp-2">
            {rec.reasoning_summary}
          </p>

          <div className="flex items-center gap-3 mt-4">
            <RiskBadge tier={rec.risk_tier} size="sm" />
            <span className="text-xs text-ink-faint font-mono">
              {BET_TYPE_LABEL[rec.bet_type] ?? rec.bet_type}
            </span>
          </div>
        </div>

        {/* Perforated tear line + stub */}
        <div className="stub-perforation w-36 shrink-0 flex flex-col items-center justify-center gap-2 py-5 px-4 bg-ink-panel2">
          <span className="label-eyebrow">Confidence</span>
          <span className="font-display text-4xl text-ticker leading-none">
            {Math.round(rec.confidence_score)}
            <span className="text-lg text-ticker/60">%</span>
          </span>
          <span className="ledger-value text-xs text-ink-muted">
            odds {rec.suggested_odds_min.toFixed(2)}–{rec.suggested_odds_max.toFixed(2)}
          </span>
          <ChevronRight
            size={16}
            className="text-ink-faint mt-1 group-hover:text-ticker group-hover:translate-x-0.5 transition-all"
          />
        </div>
      </div>
    </Link>
  );
}
