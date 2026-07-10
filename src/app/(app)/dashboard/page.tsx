"use client";

import { Card } from "@/components/ui/card";
import { ShotsGainedSection } from "@/features/dashboard/components/shots-gained-section";
import { useProgressMetrics } from "@/features/dashboard/hooks/use-progress-metrics";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const { data, isLoading } = useProgressMetrics();

  return (
    <div className="mx-auto max-w-[1200px] space-y-8">
      {/* Page header */}
      <div className="space-y-1">
        <p className="text-[11px] font-extrabold uppercase tracking-[.2em] text-primary">
          Overview · Last 6 Rounds
        </p>
        <h1 className="text-[30px] font-black leading-none tracking-[-0.02em] text-foreground">
          Your Progress
        </h1>
      </div>

      {/* Metric grid */}
      <div className="grid grid-cols-2 gap-[14px] sm:grid-cols-4">
        {isLoading || !data
          ? Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="flex min-h-[138px] flex-col p-[18px]">
                <div className="h-3 w-20 animate-pulse rounded bg-muted" />
                <div className="mt-auto space-y-2">
                  <div className="h-10 w-24 animate-pulse rounded bg-muted" />
                  <div className="h-5 w-16 animate-pulse rounded bg-muted" />
                </div>
              </Card>
            ))
          : data.map((metric) => {
              const isPositive = metric.delta >= 0;
              return (
                <Card
                  key={metric.label}
                  className="flex min-h-[138px] flex-col p-[18px] transition-colors"
                >
                  <span className="text-[11px] font-extrabold uppercase tracking-[.13em] text-muted-foreground">
                    {metric.label}
                  </span>
                  <div className="mt-auto">
                    <div className="flex items-baseline gap-1">
                      <span className="font-mono text-[44px] font-semibold leading-none tracking-[-0.04em] text-foreground">
                        {metric.value}
                      </span>
                      {metric.unit ? (
                        <span className="font-mono text-[17px] font-medium text-muted-foreground">
                          {metric.unit}
                        </span>
                      ) : null}
                    </div>
                    {!metric.snapshot ? (
                      <div className="mt-2 flex items-center gap-2">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[12px] font-bold",
                            isPositive
                              ? "bg-primary/[.14] text-positive"
                              : "bg-destructive/[.14] text-negative",
                          )}
                        >
                          {isPositive ? "▲" : "▼"} {Math.abs(metric.delta)}
                        </span>
                      </div>
                    ) : null}
                  </div>
                </Card>
              );
            })}
      </div>

      <ShotsGainedSection />
    </div>
  );
}
