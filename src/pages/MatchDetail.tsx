import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from "recharts";
import { apiClient, MatchDetail as MatchDetailType } from "../lib/api";
import LoadingScreen from "../components/LoadingScreen";

const SEVERITY_META: Record<string, { label: string; className: string }> = {
  minor: { label: "Minor knock", className: "text-risk-low border-risk-low/40 bg-risk-low/10" },
  major: { label: "Major concern", className: "text-risk-medium border-risk-medium/40 bg-risk-medium/10" },
  confirmed_out: { label: "Confirmed out", className: "text-risk-high border-risk-high/40 bg-risk-high/10" },
};

function formatKickoff(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  }) + " at " + d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

export default function MatchDetail() {
  const { id } = useParams<{ id: string }>();
  const [match, setMatch] = useState<MatchDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    apiClient
      .getMatchDetail(Number(id))
      .then((res) => {
        if (!cancelled) setMatch(res.data);
      })
      .catch(() => {
        if (!cancelled) setError("Couldn't load this match.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) return <LoadingScreen label="Pulling match data" />;
  if (error || !match) {
    return (
      <div className="max-w-2xl mx-auto px-5 py-20 text-center text-ink-muted">
        {error || "Match not found."}
      </div>
    );
  }

  const h2h = match.head_to_head;
  const h2hData = h2h
    ? [
        { name: match.home_team.short_name, value: h2h.team_a_wins, fill: "#4FD1C5" },
        { name: "Draws", value: h2h.draws, fill: "#5D6C70" },
        { name: match.away_team.short_name, value: h2h.team_b_wins, fill: "#D9A441" },
      ]
    : [];

  const allNews = [
    ...match.home_team_news.map((n) => ({ ...n, team: match.home_team.short_name })),
    ...match.away_team_news.map((n) => ({ ...n, team: match.away_team.short_name })),
  ];

  return (
    <div className="max-w-2xl mx-auto px-5 py-10">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <Link to="/recommendations" className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink-paper mb-6 transition-colors">
          <ArrowLeft size={15} />
          Back to recommendations
        </Link>

        <span className="label-eyebrow">{match.league?.name}</span>
        <h1 className="font-display text-4xl mt-2 mb-1 text-ink-paper">
          {match.home_team.name}
          <span className="text-ink-faint mx-2">vs</span>
          {match.away_team.name}
        </h1>
        <p className="text-sm text-ink-muted mb-8">{formatKickoff(match.kickoff_at)}</p>

        {/* Head-to-head */}
        {h2h && (
          <div className="bg-ink-panel border border-ink-hairline rounded-stub p-5 mb-6">
            <span className="label-eyebrow">
              Head-to-head — last {h2h.matches_considered} meetings
            </span>
            <div className="h-40 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={h2hData} layout="vertical" margin={{ left: 10 }}>
                  <XAxis type="number" hide />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={80}
                    stroke="#93A3A7"
                    fontSize={12}
                    fontFamily="IBM Plex Mono"
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={22}>
                    {h2hData.map((entry, idx) => (
                      <Cell key={idx} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Form */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {[match.home_team, match.away_team].map((team) => (
            <div key={team.id} className="bg-ink-panel border border-ink-hairline rounded-stub p-5">
              <span className="label-eyebrow">{team.short_name} form score</span>
              <div className="ledger-value text-3xl text-ink-paper mt-2">
                {team.current_form_score.toFixed(0)}
                <span className="text-sm text-ink-faint">/100</span>
              </div>
              <div className="w-full h-1.5 bg-ink-hairline rounded-full mt-3 overflow-hidden">
                <div
                  className="h-full bg-ticker rounded-full"
                  style={{ width: `${Math.min(100, Math.max(0, team.current_form_score))}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Squad news */}
        {allNews.length > 0 && (
          <div className="bg-ink-panel border border-ink-hairline rounded-stub p-5">
            <span className="label-eyebrow">Squad news</span>
            <div className="space-y-3 mt-4">
              {allNews.map((n) => {
                const meta = SEVERITY_META[n.severity] || SEVERITY_META.minor;
                return (
                  <div key={n.id} className="flex items-start gap-3">
                    <AlertTriangle size={15} className={meta.className.split(" ")[0] + " shrink-0 mt-0.5"} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-ink-paper">{n.player_name}</span>
                        <span className="text-xs text-ink-faint">· {n.team}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border font-mono uppercase ${meta.className}`}>
                          {meta.label}
                        </span>
                      </div>
                      <p className="text-xs text-ink-muted mt-1">{n.note}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
