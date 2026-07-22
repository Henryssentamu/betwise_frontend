interface RiskBadgeProps {
  tier: "low" | "medium" | "high";
  size?: "sm" | "md";
}

const TIER_LABEL: Record<string, string> = {
  low: "Low risk",
  medium: "Medium risk",
  high: "High risk",
};

const TIER_CLASSES: Record<string, string> = {
  low: "bg-risk-low/15 text-risk-low border-risk-low/40",
  medium: "bg-risk-medium/15 text-risk-medium border-risk-medium/40",
  high: "bg-risk-high/15 text-risk-high border-risk-high/40",
};

export default function RiskBadge({ tier, size = "md" }: RiskBadgeProps) {
  const sizeClasses = size === "sm" ? "text-[10px] px-2 py-0.5" : "text-xs px-2.5 py-1";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-mono uppercase tracking-wide ${TIER_CLASSES[tier]} ${sizeClasses}`}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ backgroundColor: "currentColor" }}
      />
      {TIER_LABEL[tier]}
    </span>
  );
}
