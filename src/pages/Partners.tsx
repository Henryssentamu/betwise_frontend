import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import { apiClient, BettingPartner, unwrapList } from "../lib/api";
import LoadingScreen from "../components/LoadingScreen";

export default function Partners() {
  const [partners, setPartners] = useState<BettingPartner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    apiClient
      .getBettingPartners()
      .then((res) => {
        if (!cancelled) setPartners(unwrapList(res.data));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <LoadingScreen label="Loading partners" />;

  return (
    <div className="max-w-2xl mx-auto px-5 py-10">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <span className="label-eyebrow">Where to place your bets</span>
        <h1 className="font-display text-4xl mt-2 mb-2 text-ink-paper">Betting partners</h1>
        <p className="text-sm text-ink-muted mb-8">
          BetWise doesn't take bets. These are the sportsbooks our editorial team rates highest for odds and reliability.
        </p>

        <div className="space-y-3">
          {partners.map((p, idx) => (
            <a
              key={p.id}
              href={p.website_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 bg-ink-panel border border-ink-hairline rounded-stub p-5 hover:border-ticker/50 transition-colors group"
            >
              <span className="font-display text-2xl text-ink-faint w-8">{idx + 1}</span>
              <div className="flex-1">
                <div className="font-medium text-ink-paper">{p.name}</div>
                <div className="text-xs text-ink-muted mt-0.5">{p.highlight_note}</div>
              </div>
              <ExternalLink size={16} className="text-ink-faint group-hover:text-ticker transition-colors" />
            </a>
          ))}
        </div>

        {partners.length === 0 && (
          <p className="text-sm text-ink-muted text-center py-16">No partners listed yet.</p>
        )}
      </motion.div>
    </div>
  );
}
