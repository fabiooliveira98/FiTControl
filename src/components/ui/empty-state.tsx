import type { ReactNode } from "react";

import { Card, CardDescription, CardTitle } from "@/components/ui/card";

export function EmptyState({
  title,
  description,
  icon,
  action,
}: {
  title: string;
  description: string;
  icon?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <Card className="p-6 text-center sm:p-8">
      {icon ? (
        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl bg-accent-soft text-primary">
          {icon}
        </div>
      ) : null}
      <CardTitle>{title}</CardTitle>
      <CardDescription className="mx-auto mt-3 max-w-xl">{description}</CardDescription>
      {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
    </Card>
  );
}
