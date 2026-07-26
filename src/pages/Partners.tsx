import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ExternalLink, Twitter, Instagram, Send, Music2, Youtube, Globe } from "lucide-react";
import { apiClient, BettingPartner, Tipster, unwrapList } from "../lib/api";
import LoadingScreen from "../components/LoadingScreen";

const PLATFORM_ICON: Record<Tipster["platform"], typeof Twitter> = {
  twitter: Twitter,
  instagram: Instagram,
  telegram: Send,
  tiktok: Music2,
  youtube: Youtube,
  website: Globe,
};

function tipsterLink(t: Tipster): string {
  if (t.platform === "website" || t.handle_or_website.startsWith("http")) {
    return t.handle_or_website;
  }
  const handle = t.handle_or_website.replace(/^@/, "");
  const base: Record<Tipster["platform"], string> = {
    twitter: "https://twitter.com/",
    instagram: "https://instagram.com/",
    telegram: "https://t.me/",
    tiktok: "https://tiktok.com/@",
    youtube: "https://youtube.com/@",
    website: "",
  };
  return base[t.platform] + handle;
}

export default function Partners() {
  const [partners, setPartners] = useState<BettingPartner[]>([]);
  const [tipsters, setTipsters] = useState<Tipster[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.all([apiClient.getBettingPartners(), apiClient.getTipsters()])
      .then(([partnersRes, tipstersRes]) => {
        if (cancelled) return;
        setPartners(unwrapList(partnersRes.data));
        setTipsters(unwrapList(tipstersRes.data));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <LoadingScreen label="Loading trusted picks" />;

  return (
    <div className="max-w-2xl mx-auto px-5 py-10">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <span className="label-eyebrow">Where to place your bets, who to follow</span>
        <h1 className="font-display text-4xl mt-2 mb-8 text-ink-paper">Trusted sportsbooks &amp; tipsters</h1>

        <section className="mb-10">
          <h2 className="font-display text-xl text-ink-paper mb-1">Betting companies</h2>
          <p className="text-sm text-ink-muted mb-4">
            Independent sportsbooks our editorial team rates highest for odds coverage and reliability — not affiliated with BetWise.
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
            <p className="text-sm text-ink-muted text-center py-10">No sportsbooks listed yet.</p>
          )}
        </section>

        <section>
          <h2 className="font-display text-xl text-ink-paper mb-1">Tipsters</h2>
          <p className="text-sm text-ink-muted mb-4">
            Independent prediction accounts our editorial team is tracking for a consistent public record — not affiliated with BetWise.
          </p>
          <div className="space-y-3">
            {tipsters.map((t) => {
              const Icon = PLATFORM_ICON[t.platform];
              return (
                <a
                  key={t.id}
                  href={tipsterLink(t)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 bg-ink-panel border border-ink-hairline rounded-stub p-5 hover:border-ticker/50 transition-colors group"
                >
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-ink-panel2 text-ink-faint shrink-0">
                    <Icon size={16} />
                  </span>
                  <div className="flex-1">
                    <div className="font-medium text-ink-paper">{t.name}</div>
                    <div className="text-xs text-ink-muted mt-0.5">{t.highlight_note}</div>
                    <div className="text-xs text-ink-faint mt-0.5 font-mono">{t.handle_or_website}</div>
                  </div>
                  <ExternalLink size={16} className="text-ink-faint group-hover:text-ticker transition-colors" />
                </a>
              );
            })}
          </div>
          {tipsters.length === 0 && (
            <p className="text-sm text-ink-muted text-center py-10">No tipsters listed yet.</p>
          )}
        </section>
      </motion.div>
    </div>
  );
}
