import type { ReactNode } from "react";

import { Card } from "@/components/ui/card";

export function DashboardShell({
  metrics,
  content,
}: {
  metrics: ReactNode;
  content: ReactNode;
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <Card className="p-5 sm:p-6">{metrics}</Card>
      <Card className="p-5 sm:p-6">{content}</Card>
    </div>
  );
}
