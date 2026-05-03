import { cn } from "@/lib/utils";

export function CRMResponsiveTabs({
  tabs,
  value,
  onChange,
}: {
  tabs: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="scroll-x-soft -mx-1 flex gap-1 overflow-x-auto rounded-full border border-border bg-card/70 p-1 px-1 backdrop-blur-md shadow-[0_8px_24px_-12px_oklch(0_0_0_/_0.6)]">
      {tabs.map((t) => (
        <button
          key={t}
          onClick={() => onChange(t)}
          className={cn(
            "shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold transition",
            value === t ? "text-primary-foreground shadow-[0_6px_20px_-6px_oklch(0.72_0.205_38_/_0.6)]" : "text-muted-foreground hover:text-foreground",
          )}
          style={value === t ? { background: "var(--gradient-primary)" } : undefined}
        >
          {t}
        </button>
      ))}
    </div>
  );
}
