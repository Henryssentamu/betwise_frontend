const RISK_OPTIONS = [
  { value: "low", label: "Low", desc: "Steadier picks, smaller swings" },
  { value: "medium", label: "Medium", desc: "Balanced risk and reward" },
  { value: "high", label: "High", desc: "Bigger odds, bigger swings" },
] as const;

interface RiskAppetitePickerProps {
  value: "low" | "medium" | "high";
  onChange: (tier: "low" | "medium" | "high") => void;
  disabled?: boolean;
}

export default function RiskAppetitePicker({ value, onChange, disabled }: RiskAppetitePickerProps) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {RISK_OPTIONS.map((opt) => (
        <button
          type="button"
          key={opt.value}
          onClick={() => onChange(opt.value)}
          disabled={disabled}
          className={`text-left px-3 py-2.5 rounded-stub border text-sm transition-colors disabled:opacity-60 ${
            value === opt.value
              ? "border-ticker bg-ticker/10 text-ink-paper"
              : "border-ink-hairline text-ink-muted hover:border-ink-faint"
          }`}
        >
          <div className="font-medium">{opt.label}</div>
          <div className="text-[11px] text-ink-faint mt-0.5">{opt.desc}</div>
        </button>
      ))}
    </div>
  );
}
