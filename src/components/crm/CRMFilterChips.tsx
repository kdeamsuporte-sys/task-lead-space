import { cn } from "@/lib/utils";

export function CRMFilterChips({
  options,
  value,
  onChange,
  className,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
  className?: string;
}) {
  return (
    <div className={cn("scroll-x-soft -mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1", className)}>
      {options.map((o) => (
        <button
          key={o}
          onClick={() => onChange(o)}
          className={cn(
            "shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition",
            value === o
              ? "border-primary/40 bg-primary/12 text-primary shadow-[0_4px_16px_-6px_oklch(0.72_0.205_38_/_0.5)]"
              : "border-border bg-card/60 text-muted-foreground hover:text-foreground",
          )}
        >
          {o}
        </button>
      ))}
    </div>
  );
}
