"use client";

import { useMemo, useState } from "react";
import { Plus, Trophy } from "lucide-react";

import type { Goal } from "@/types";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GoalCard } from "@/features/goals/components/goal-card";
import { GoalDialog } from "@/features/goals/components/goal-dialog";
import { useDeleteGoal, useGoals, useUpdateGoal } from "@/features/goals/hooks/use-goals";

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[12px] border border-dashed border-border py-16 text-center">
      <Trophy className="h-8 w-8 text-muted-foreground/40 mb-3" />
      <p className="text-[13px] font-semibold text-muted-foreground">{message}</p>
    </div>
  );
}

export default function GoalsPage() {
  const { data: goals = [], isLoading } = useGoals();
  const updateGoal = useUpdateGoal();
  const deleteGoal = useDeleteGoal();

  const [addOpen, setAddOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  const activeGoals = useMemo(
    () => goals.filter((g) => g.status === "active"),
    [goals],
  );
  const achievedGoals = useMemo(
    () => goals.filter((g) => g.status === "achieved"),
    [goals],
  );

  function handleToggleStatus(goal: Goal) {
    updateGoal.mutate({
      id: goal.id,
      patch: { status: goal.status === "active" ? "achieved" : "active" },
    });
  }

  function handleDelete(id: string) {
    deleteGoal.mutate(id);
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-black tracking-tight text-foreground">Goals</h1>
          <p className="text-[13px] text-muted-foreground mt-0.5">
            Track your training objectives by skill area
          </p>
        </div>
        <Button
          size="sm"
          className="gap-1.5"
          onClick={() => setAddOpen(true)}
        >
          <Plus className="h-4 w-4" />
          Add Goal
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active">
            Active
            {activeGoals.length > 0 && (
              <span className="ml-1.5 rounded-full bg-primary/20 px-1.5 py-0.5 text-[10px] font-bold text-primary">
                {activeGoals.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="achieved">
            Achieved
            {achievedGoals.length > 0 && (
              <span className="ml-1.5 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground">
                {achievedGoals.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-4">
          {isLoading ? (
            <div className="text-[13px] text-muted-foreground">Loading…</div>
          ) : activeGoals.length === 0 ? (
            <EmptyState message="No active goals yet — add one to get started." />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {activeGoals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  onEdit={() => setEditingGoal(goal)}
                  onDelete={() => handleDelete(goal.id)}
                  onToggleStatus={() => handleToggleStatus(goal)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="achieved" className="mt-4">
          {isLoading ? (
            <div className="text-[13px] text-muted-foreground">Loading…</div>
          ) : achievedGoals.length === 0 ? (
            <EmptyState message="No achieved goals yet — keep working!" />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {achievedGoals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  onEdit={() => setEditingGoal(goal)}
                  onDelete={() => handleDelete(goal.id)}
                  onToggleStatus={() => handleToggleStatus(goal)}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <GoalDialog open={addOpen} onOpenChange={setAddOpen} />
      <GoalDialog
        open={!!editingGoal}
        onOpenChange={(v) => { if (!v) setEditingGoal(null); }}
        goal={editingGoal ?? undefined}
      />
    </div>
  );
}
