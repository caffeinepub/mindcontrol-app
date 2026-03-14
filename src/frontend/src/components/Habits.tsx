import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";

const DEFAULT_HABITS = [
  "Exercise for 30 minutes",
  "Cold shower",
  "Meditate for 10 minutes",
  "No social media",
  "Read 10 pages",
  "Drink 8 glasses of water",
  "Sleep 8 hours",
  "Journal your thoughts",
  "No junk food",
  "Go outside for a walk",
];

export default function Habits() {
  const qc = useQueryClient();
  const { actor } = useActor();

  const { data: habitsData, isLoading } = useQuery({
    queryKey: ["habits"],
    queryFn: async () => {
      const data = await actor!.getMyHabits();
      if (!data || data.habits.length === 0) {
        await actor!.setMyHabits(
          DEFAULT_HABITS.map((name) => ({ name, completed: false })),
        );
        return actor!.getMyHabits();
      }
      return data;
    },
    enabled: !!actor,
  });

  const toggleMutation = useMutation({
    mutationFn: async (name: string) => {
      await actor!.markHabitComplete(name);
      await actor!.addXP(BigInt(10));
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["habits"] });
      qc.invalidateQueries({ queryKey: ["xp"] });
      toast.success("+10 XP");
    },
  });

  const habits = habitsData?.habits ?? [];
  const completed = habits.filter((h) => h.completed).length;
  const pct =
    habits.length > 0 ? Math.round((completed / habits.length) * 100) : 0;

  return (
    <div className="p-6 space-y-6" data-ocid="habits.page">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold">Daily Habits</h2>
          <p className="text-muted-foreground text-sm">
            Dopamine detox checklist
          </p>
        </div>
        <Badge variant="secondary" className="text-sm px-3 py-1">
          {completed}/{habits.length} done
        </Badge>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            Today's Completion
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between text-xs text-muted-foreground mb-2">
            <span>{pct}% complete</span>
            <span>
              {completed} of {habits.length}
            </span>
          </div>
          <Progress value={pct} className="h-3" />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 space-y-2">
          {isLoading ? (
            <>
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </>
          ) : (
            habits.map((habit, idx) => (
              <div
                key={habit.name}
                data-ocid={`habits.item.${idx + 1}`}
                className={`flex items-center gap-3 p-3 rounded-md border transition-colors ${
                  habit.completed
                    ? "bg-accent/10 border-accent/30"
                    : "border-border hover:bg-muted/50"
                }`}
              >
                <Checkbox
                  id={`habit-${habit.name}`}
                  data-ocid={`habits.checkbox.${idx + 1}`}
                  checked={habit.completed}
                  disabled={habit.completed || toggleMutation.isPending}
                  onCheckedChange={() => {
                    if (!habit.completed) toggleMutation.mutate(habit.name);
                  }}
                />
                <label
                  htmlFor={`habit-${habit.name}`}
                  className={`flex-1 text-sm cursor-pointer ${habit.completed ? "line-through text-muted-foreground" : ""}`}
                >
                  {habit.name}
                </label>
                {habit.completed && (
                  <Badge
                    variant="outline"
                    className="text-xs text-accent border-accent"
                  >
                    +10 XP
                  </Badge>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
