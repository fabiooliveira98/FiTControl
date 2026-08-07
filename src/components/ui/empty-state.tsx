import type { ReactNode } from "react";

import { Card, CardDescription, CardTitle } from "@/components/ui/card";

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <Card className="p-6 text-center sm:p-8">
      <CardTitle>{title}</CardTitle>
      <CardDescription className="mx-auto mt-3 max-w-xl">{description}</CardDescription>
      {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
    </Card>
  );
}
