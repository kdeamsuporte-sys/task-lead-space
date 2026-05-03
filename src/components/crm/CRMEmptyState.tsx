import type { LucideIcon } from "lucide-react";

export function CRMEmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="glass-elevated flex flex-col items-center justify-center rounded-3xl px-6 py-14 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/25">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <div className="mt-4 text-base font-bold">{title}</div>
      {description && <div className="mt-1 max-w-md text-sm text-muted-foreground">{description}</div>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
