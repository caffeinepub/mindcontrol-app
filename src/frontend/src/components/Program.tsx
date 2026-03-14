import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Lock } from "lucide-react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";

const DAYS = [
  {
    title: "Awareness",
    task: "Write down why you want to quit and what you've lost.",
  },
  {
    title: "Cold Turkey",
    task: "Commit to 24 hours. Set up website blockers.",
  },
  {
    title: "Trigger Map",
    task: "Identify your top 3 triggers and write alternatives.",
  },
  { title: "Dopamine Reset", task: "No screens for 2 hours. Go for a walk." },
  {
    title: "Body Connection",
    task: "Exercise for 45 minutes. Feel your body.",
  },
  {
    title: "Social Reconnect",
    task: "Call a friend or family member you've been avoiding.",
  },
  {
    title: "First Week Done",
    task: "Celebrate! Write what you noticed this week.",
  },
  {
    title: "Identity Shift",
    task: "Write 10 qualities of the person you want to become.",
  },
  {
    title: "Morning Ritual",
    task: "Design a morning routine. Wake up 30 min earlier.",
  },
  { title: "Mindfulness", task: "Meditate for 20 minutes. Focus on breath." },
  {
    title: "Gratitude",
    task: "Write 5 things you're grateful for. Read them out loud.",
  },
  {
    title: "Physical Challenge",
    task: "Do a workout that pushes your limit today.",
  },
  { title: "Digital Detox", task: "No social media for the entire day." },
  {
    title: "Journaling",
    task: "Write freely for 15 minutes about your journey.",
  },
  {
    title: "Mid-Point",
    task: "Reflect on the first 14 days. What has changed?",
  },
  {
    title: "Accountability",
    task: "Tell one trusted person about your commitment.",
  },
  { title: "New Hobby", task: "Try one new activity for 30+ minutes." },
  {
    title: "Sleep Audit",
    task: "Assess your sleep. Set a consistent bedtime tonight.",
  },
  {
    title: "Nutrition",
    task: "Eat clean for the entire day. No processed food.",
  },
  { title: "Deep Work", task: "Spend 2 hours in focused, meaningful work." },
  { title: "Forgiveness", task: "Write a letter of forgiveness to yourself." },
  {
    title: "Future Vision",
    task: "Write a detailed description of your life in 1 year.",
  },
  {
    title: "Stress Mastery",
    task: "Practice box breathing whenever stress appears today.",
  },
  { title: "Community", task: "Join an accountability group or online forum." },
  {
    title: "Reward Yourself",
    task: "Do something you genuinely enjoy. You've earned it.",
  },
  {
    title: "Review Triggers",
    task: "Revisit your trigger map. Update it with new insights.",
  },
  {
    title: "Mentor Others",
    task: "Share one tip with someone who might need it.",
  },
  { title: "Physical Peak", task: "Attempt your hardest workout yet." },
  {
    title: "Gratitude Letter",
    task: "Write a letter to your future self. Seal it.",
  },
  {
    title: "30 Days Strong",
    task: "You did it. Celebrate and plan the next 30 days.",
  },
];

export default function Program() {
  const qc = useQueryClient();
  const { actor } = useActor();

  const { data: progress, isLoading } = useQuery({
    queryKey: ["program"],
    queryFn: () => actor!.getMyProgramProgress(),
    enabled: !!actor,
  });

  const completeDayMutation = useMutation({
    mutationFn: async (day: number) => {
      await actor!.markProgramDayComplete(BigInt(day));
      await actor!.addXP(BigInt(30));
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["program"] });
      qc.invalidateQueries({ queryKey: ["xp"] });
      toast.success("+30 XP! Keep going!");
    },
  });

  const completedDays = new Set(
    (progress?.completedDays ?? []).map((d) => Number(d)),
  );
  const completedCount = completedDays.size;
  const nextDay = completedCount + 1;

  return (
    <div className="p-6 space-y-6" data-ocid="program.page">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold">
            30-Day Brain Rewire
          </h2>
          <p className="text-muted-foreground text-sm">
            Complete daily tasks to rewire your brain
          </p>
        </div>
        <Badge variant="secondary" className="text-sm">
          {completedCount}/30 days
        </Badge>
      </div>

      <div className="space-y-1">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{Math.round((completedCount / 30) * 100)}% complete</span>
          <span>Day {completedCount}/30</span>
        </div>
        <Progress value={(completedCount / 30) * 100} className="h-2" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {DAYS.map((day, idx) => {
          const dayNum = idx + 1;
          const done = completedDays.has(dayNum);
          const isNext = dayNum === nextDay;
          const locked = dayNum > nextDay;
          return (
            <div
              key={day.title}
              data-ocid={`program.item.${dayNum}`}
              className={`p-4 rounded-lg border transition-colors ${
                done
                  ? "bg-accent/10 border-accent/30"
                  : isNext
                    ? "border-primary/50 bg-primary/5"
                    : locked
                      ? "border-border opacity-50"
                      : "border-border"
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-xs text-muted-foreground">Day {dayNum}</p>
                  <p className="font-semibold text-sm">{day.title}</p>
                </div>
                {done ? (
                  <CheckCircle2
                    size={18}
                    className="text-accent flex-shrink-0"
                  />
                ) : locked ? (
                  <Lock
                    size={14}
                    className="text-muted-foreground flex-shrink-0"
                  />
                ) : null}
              </div>
              <p className="text-xs text-muted-foreground mb-3">{day.task}</p>
              {isNext && !done && (
                <Button
                  size="sm"
                  data-ocid="program.complete.button"
                  className="w-full text-xs h-7"
                  disabled={
                    completeDayMutation.isPending || isLoading || !actor
                  }
                  onClick={() => completeDayMutation.mutate(dayNum)}
                >
                  Mark Complete (+30 XP)
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
