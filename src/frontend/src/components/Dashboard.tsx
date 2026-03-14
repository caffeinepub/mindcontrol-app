import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Award, CheckCircle2, Flame, Star, TrendingUp } from "lucide-react";
import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import type { StreakData } from "../backend";
import { useActor } from "../hooks/useActor";

export default function Dashboard() {
  const qc = useQueryClient();
  const { actor } = useActor();
  const [xpAnim, setXpAnim] = useState(false);

  const { data: streak, isLoading: streakLoading } = useQuery({
    queryKey: ["streak"],
    queryFn: () => actor!.getMyStreak(),
    enabled: !!actor,
  });
  const { data: xpData, isLoading: xpLoading } = useQuery({
    queryKey: ["xp"],
    queryFn: () => actor!.getMyXP(),
    enabled: !!actor,
  });
  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: () => actor!.getCallerUserProfile(),
    enabled: !!actor,
  });
  const { data: habits } = useQuery({
    queryKey: ["habits"],
    queryFn: () => actor!.getMyHabits(),
    enabled: !!actor,
  });
  const { data: progress } = useQuery({
    queryKey: ["program"],
    queryFn: () => actor!.getMyProgramProgress(),
    enabled: !!actor,
  });

  const checkInMutation = useMutation({
    mutationFn: async (): Promise<StreakData> => {
      const result = await actor!.doCheckIn();
      await actor!.addXP(BigInt(50));
      return result;
    },
    onSuccess: (newStreak) => {
      qc.invalidateQueries({ queryKey: ["streak"] });
      qc.invalidateQueries({ queryKey: ["xp"] });
      setXpAnim(true);
      setTimeout(() => setXpAnim(false), 500);
      toast.success(`Day ${newStreak.currentStreak} streak! +50 XP`);
    },
    onError: () => toast.error("Already checked in today!"),
  });

  const currentStreak = streak ? Number(streak.currentStreak) : 0;
  const longestStreak = streak ? Number(streak.longestStreak) : 0;
  const totalXP = xpData ? Number(xpData.totalXP) : 0;
  const level = Math.floor(totalXP / 200) + 1;
  const xpInLevel = totalXP % 200;
  const badges = xpData?.badges ?? [];
  const habitsCompleted = habits?.habits.filter((h) => h.completed).length ?? 0;
  const habitsTotal = habits?.habits.length ?? 0;
  const programDays = progress?.completedDays.length ?? 0;

  const chartData = Array.from({ length: 7 }, (_, i) => ({
    day: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i],
    xp: Math.max(0, totalXP - (6 - i) * 40),
  }));

  return (
    <div className="p-6 space-y-6" data-ocid="dashboard.page">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold">Dashboard</h2>
          <p className="text-muted-foreground text-sm">
            {profile
              ? `Welcome back, ${profile.nickname || "Warrior"}`
              : "Your recovery journey"}
          </p>
        </div>
        <Button
          data-ocid="dashboard.checkin.primary_button"
          onClick={() => checkInMutation.mutate()}
          disabled={checkInMutation.isPending || !actor}
          className="gap-2"
        >
          <CheckCircle2 size={16} />
          {checkInMutation.isPending ? "Checking in..." : "Daily Check-In"}
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card data-ocid="dashboard.streak.card">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-md bg-primary/10">
              <Flame size={20} className="text-primary" />
            </div>
            <div>
              {streakLoading ? (
                <Skeleton className="h-7 w-12" />
              ) : (
                <p className="text-3xl font-display font-bold text-primary">
                  {currentStreak}
                </p>
              )}
              <p className="text-xs text-muted-foreground">Day Streak</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-md bg-accent/10">
              <TrendingUp size={20} className="text-accent" />
            </div>
            <div>
              {streakLoading ? (
                <Skeleton className="h-7 w-12" />
              ) : (
                <p className="text-3xl font-display font-bold text-accent">
                  {longestStreak}
                </p>
              )}
              <p className="text-xs text-muted-foreground">Best Streak</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-md bg-yellow-500/10">
              <Star size={20} className="text-yellow-500" />
            </div>
            <div>
              {xpLoading ? (
                <Skeleton className="h-7 w-12" />
              ) : (
                <p
                  className={`text-3xl font-display font-bold text-yellow-500 ${xpAnim ? "xp-pop" : ""}`}
                >
                  {totalXP}
                </p>
              )}
              <p className="text-xs text-muted-foreground">Total XP</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-md bg-green-500/10">
              <Award size={20} className="text-green-500" />
            </div>
            <div>
              <p className="text-3xl font-display font-bold text-green-500">
                Lv.{level}
              </p>
              <p className="text-xs text-muted-foreground">Level</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Level Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between text-xs text-muted-foreground mb-2">
            <span>Level {level}</span>
            <span>{xpInLevel} / 200 XP</span>
          </div>
          <Progress value={(xpInLevel / 200) * 100} className="h-2" />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Today's Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">Habits</span>
                <span>
                  {habitsCompleted}/{habitsTotal}
                </span>
              </div>
              <Progress
                value={
                  habitsTotal > 0 ? (habitsCompleted / habitsTotal) * 100 : 0
                }
                className="h-1.5"
              />
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">30-Day Program</span>
                <span>{programDays}/30</span>
              </div>
              <Progress value={(programDays / 30) * 100} className="h-1.5" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">XP Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={100}>
              <BarChart data={chartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="oklch(0.3 0.02 260)"
                />
                <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar
                  dataKey="xp"
                  fill="oklch(0.65 0.22 220)"
                  radius={[3, 3, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {badges.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Badges Earned</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {badges.map((badge) => (
                <Badge
                  key={badge.name}
                  variant="secondary"
                  data-ocid="dashboard.badge.item.1"
                >
                  <Award size={12} className="mr-1" />
                  {badge.name}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
