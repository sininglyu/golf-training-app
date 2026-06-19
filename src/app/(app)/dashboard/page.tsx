"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useProgressMetrics } from "@/features/dashboard/hooks/use-progress-metrics";

export default function DashboardPage() {
  const { data, isLoading } = useProgressMetrics();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Progress</h1>
        <p className="text-sm text-muted-foreground">
          A snapshot of your game over the last 30 days.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading || !data
          ? Array.from({ length: 8 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <CardDescription>Loading…</CardDescription>
                  <CardTitle className="text-2xl">—</CardTitle>
                </CardHeader>
              </Card>
            ))
          : data.map((metric) => (
              <Card key={metric.label}>
                <CardHeader>
                  <CardDescription>{metric.label}</CardDescription>
                  <CardTitle className="text-2xl">
                    {metric.value}
                    {metric.unit ? (
                      <span className="ml-1 text-sm font-normal text-muted-foreground">
                        {metric.unit}
                      </span>
                    ) : null}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {metric.snapshot ? (
                    <span className="text-xs text-muted-foreground">
                      Latest snapshot
                    </span>
                  ) : (
                    <span
                      className={
                        metric.delta >= 0
                          ? "text-xs font-medium text-primary"
                          : "text-xs font-medium text-destructive"
                      }
                    >
                      {metric.delta >= 0 ? "▲" : "▼"}{" "}
                      {Math.abs(metric.delta)} vs last period
                    </span>
                  )}
                </CardContent>
              </Card>
            ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent focus areas</CardTitle>
          <CardDescription>
            Charts and deeper trends will live here.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Hook up real charts (e.g. Recharts) to <code>useProgressMetrics</code>.
        </CardContent>
      </Card>
    </div>
  );
}
