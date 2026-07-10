import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DrillCard } from "@/features/drills/components/drill-card";
import { DRILLS, type DrillCategory } from "@/features/drills/data";

const CATEGORIES: { value: DrillCategory; label: string }[] = [
  { value: "ott", label: "Off the Tee" },
  { value: "approach", label: "Approach" },
  { value: "shortgame", label: "Short Game" },
  { value: "putting", label: "Putting" },
];

export default function DrillsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[22px] font-black uppercase tracking-[.12em] text-foreground">
          Drill Library
        </h1>
        <p className="mt-1 text-[13px] text-muted-foreground">
          Curated drills from coaches and tour players, organized by strokes gained category.
        </p>
      </div>

      <Tabs defaultValue="ott">
        <TabsList className="w-full justify-start">
          {CATEGORIES.map((c) => (
            <TabsTrigger key={c.value} value={c.value}>
              {c.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {CATEGORIES.map((c) => (
          <TabsContent key={c.value} value={c.value} className="mt-4">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {DRILLS.filter((d) => d.category === c.value).map((drill) => (
                <DrillCard key={drill.id} drill={drill} />
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
