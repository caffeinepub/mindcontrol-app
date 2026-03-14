import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Trophy } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";

export default function Leaderboard() {
  const qc = useQueryClient();
  const { actor } = useActor();
  const [nickname, setNickname] = useState("");

  const { data: entries, isLoading } = useQuery({
    queryKey: ["leaderboard"],
    queryFn: () => actor!.getLeaderboard(),
    enabled: !!actor,
  });
  const { data: myStreak } = useQuery({
    queryKey: ["streak"],
    queryFn: () => actor!.getMyStreak(),
    enabled: !!actor,
  });

  const submitMutation = useMutation({
    mutationFn: () =>
      actor!.addLeaderboardEntry(
        nickname,
        myStreak?.currentStreak ?? BigInt(0),
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["leaderboard"] });
      toast.success("Submitted!");
      setNickname("");
    },
    onError: () => toast.error("Failed to submit"),
  });

  const sorted = [...(entries ?? [])]
    .sort((a, b) => Number(b.streakCount) - Number(a.streakCount))
    .slice(0, 10);
  const medalColors = ["text-yellow-400", "text-gray-400", "text-amber-600"];

  return (
    <div className="p-6 space-y-6" data-ocid="leaderboard.page">
      <div>
        <h2 className="text-2xl font-display font-bold">Leaderboard</h2>
        <p className="text-muted-foreground text-sm">
          Top streaks in the community
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Submit Your Streak</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Input
            data-ocid="leaderboard.nickname.input"
            placeholder="Your nickname"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className="max-w-xs"
            onKeyDown={(e) =>
              e.key === "Enter" && nickname && submitMutation.mutate()
            }
          />
          <Badge variant="outline" className="self-center text-sm">
            {myStreak ? Number(myStreak.currentStreak) : 0} days
          </Badge>
          <Button
            data-ocid="leaderboard.submit.primary_button"
            disabled={!nickname || submitMutation.isPending || !actor}
            onClick={() => submitMutation.mutate()}
          >
            Submit
          </Button>
        </CardContent>
      </Card>

      <Card data-ocid="leaderboard.table">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Rank</TableHead>
                <TableHead>Nickname</TableHead>
                <TableHead className="text-right">Streak</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <>
                  <TableRow>
                    <TableCell>
                      <Skeleton className="h-4 w-8" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-16" />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <Skeleton className="h-4 w-8" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-16" />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <Skeleton className="h-4 w-8" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-16" />
                    </TableCell>
                  </TableRow>
                </>
              ) : sorted.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="text-center text-muted-foreground py-8"
                    data-ocid="leaderboard.empty_state"
                  >
                    No entries yet. Be the first!
                  </TableCell>
                </TableRow>
              ) : (
                sorted.map((entry, idx) => (
                  <TableRow
                    key={`${entry.nickname}-${idx}`}
                    data-ocid={`leaderboard.row.${idx + 1}`}
                  >
                    <TableCell>
                      {idx < 3 ? (
                        <Trophy size={14} className={medalColors[idx]} />
                      ) : (
                        <span className="text-muted-foreground text-xs">
                          {idx + 1}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">
                      {entry.nickname}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant="secondary">
                        {Number(entry.streakCount)} days
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
