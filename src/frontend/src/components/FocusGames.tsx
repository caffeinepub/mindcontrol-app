import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Gamepad2 } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";

function NumberMemoryGame({ onScore }: { onScore: (s: number) => void }) {
  const [phase, setPhase] = useState<"idle" | "show" | "input" | "result">(
    "idle",
  );
  const [sequence, setSequence] = useState("");
  const [userInput, setUserInput] = useState("");
  const [level, setLevel] = useState(3);

  const startGame = () => {
    const num = String(Math.floor(Math.random() * 10 ** level)).padStart(
      level,
      "0",
    );
    setSequence(num);
    setUserInput("");
    setPhase("show");
    setTimeout(() => setPhase("input"), level * 1000 + 1000);
  };

  const submit = () => {
    if (userInput === sequence) {
      setLevel((l) => l + 1);
      onScore(level * 10);
      toast.success("Correct! Level up!");
      setPhase("idle");
    } else {
      onScore(level * 5);
      setPhase("result");
    }
  };

  return (
    <div className="text-center space-y-4" data-ocid="games.memory.panel">
      <p className="text-xs text-muted-foreground">
        Memorize and type the number back
      </p>
      {phase === "idle" && (
        <Button data-ocid="games.memory.primary_button" onClick={startGame}>
          Start (Level {level})
        </Button>
      )}
      {phase === "show" && (
        <p className="text-4xl font-display font-bold text-primary tracking-widest">
          {sequence}
        </p>
      )}
      {phase === "input" && (
        <div className="space-y-2">
          <Input
            data-ocid="games.memory.input"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Type the number"
            className="text-center text-xl"
            autoFocus
            onKeyDown={(e) => e.key === "Enter" && submit()}
          />
          <Button data-ocid="games.memory.submit_button" onClick={submit}>
            Submit
          </Button>
        </div>
      )}
      {phase === "result" && (
        <div className="space-y-2">
          <p className="text-destructive text-sm">
            Was: <strong>{sequence}</strong>
          </p>
          <Button
            data-ocid="games.memory.retry.button"
            onClick={() => {
              setLevel(3);
              setPhase("idle");
            }}
          >
            Try Again
          </Button>
        </div>
      )}
    </div>
  );
}

function ReactionGame({ onScore }: { onScore: (s: number) => void }) {
  const [state, setState] = useState<"idle" | "waiting" | "ready" | "result">(
    "idle",
  );
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const startRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startGame = () => {
    setState("waiting");
    const delay = 1500 + Math.random() * 3500;
    timerRef.current = setTimeout(() => {
      startRef.current = Date.now();
      setState("ready");
    }, delay);
  };

  const handleClick = () => {
    if (state === "waiting") {
      if (timerRef.current) clearTimeout(timerRef.current);
      setState("idle");
      toast.error("Too early!");
      return;
    }
    if (state === "ready") {
      const rt = Date.now() - startRef.current;
      setReactionTime(rt);
      setState("result");
      onScore(Math.max(0, Math.round(1000 - rt / 2)));
    }
  };

  return (
    <div className="text-center space-y-4" data-ocid="games.reaction.panel">
      <p className="text-xs text-muted-foreground">
        Click when the circle turns green
      </p>
      <button
        type="button"
        data-ocid="games.reaction.canvas_target"
        onClick={handleClick}
        className={`w-32 h-32 rounded-full mx-auto flex items-center justify-center text-sm font-bold transition-colors ${
          state === "ready"
            ? "bg-green-500 text-white cursor-pointer"
            : state === "waiting"
              ? "bg-yellow-500 text-white cursor-pointer"
              : "bg-muted text-muted-foreground"
        }`}
      >
        {state === "idle"
          ? "Ready"
          : state === "waiting"
            ? "Wait..."
            : state === "ready"
              ? "CLICK!"
              : `${reactionTime}ms`}
      </button>
      {state === "idle" && (
        <Button data-ocid="games.reaction.primary_button" onClick={startGame}>
          Start
        </Button>
      )}
      {state === "result" && (
        <div className="space-y-2">
          <p className="text-sm">
            Reaction: <strong>{reactionTime}ms</strong>
          </p>
          <Button
            data-ocid="games.reaction.retry.button"
            onClick={() => setState("idle")}
          >
            Play Again
          </Button>
        </div>
      )}
    </div>
  );
}

const COLORS = [
  "bg-red-500",
  "bg-blue-500",
  "bg-green-500",
  "bg-yellow-500",
] as const;
const COLOR_IDS = ["red", "blue", "green", "yellow"] as const;

function PatternGame({ onScore }: { onScore: (s: number) => void }) {
  const [pattern, setPattern] = useState<number[]>([]);
  const [userPattern, setUserPattern] = useState<number[]>([]);
  const [showing, setShowing] = useState(-1);
  const [phase, setPhase] = useState<"idle" | "showing" | "input" | "result">(
    "idle",
  );

  const playPattern = useCallback((pat: number[]) => {
    setPhase("showing");
    let i = 0;
    const showNext = () => {
      if (i >= pat.length) {
        setShowing(-1);
        setPhase("input");
        return;
      }
      setShowing(pat[i]);
      setTimeout(() => {
        setShowing(-1);
        i++;
        setTimeout(showNext, 300);
      }, 600);
    };
    setTimeout(showNext, 400);
  }, []);

  const startGame = useCallback(() => {
    const first = Math.floor(Math.random() * 4);
    setPattern([first]);
    setUserPattern([]);
    playPattern([first]);
  }, [playPattern]);

  const handleInput = (colorIdx: number) => {
    if (phase !== "input") return;
    const newUser = [...userPattern, colorIdx];
    setUserPattern(newUser);
    if (newUser[newUser.length - 1] !== pattern[newUser.length - 1]) {
      setPhase("result");
      onScore(pattern.length * 15);
      return;
    }
    if (newUser.length === pattern.length) {
      toast.success("Correct! +1");
      const newPattern = [...pattern, Math.floor(Math.random() * 4)];
      setPattern(newPattern);
      setUserPattern([]);
      setTimeout(() => playPattern(newPattern), 600);
    }
  };

  return (
    <div className="text-center space-y-4" data-ocid="games.pattern.panel">
      <p className="text-xs text-muted-foreground">Repeat the color pattern</p>
      <div className="grid grid-cols-2 gap-2 w-40 mx-auto">
        {COLORS.map((color, idx) => (
          <button
            type="button"
            key={COLOR_IDS[idx]}
            data-ocid={`games.pattern.toggle.${idx + 1}`}
            onClick={() => handleInput(idx)}
            disabled={phase !== "input"}
            className={`h-16 rounded-lg ${color} transition-all ${showing === idx ? "opacity-100 scale-105" : "opacity-40"} disabled:cursor-default`}
          />
        ))}
      </div>
      {phase === "idle" && (
        <Button data-ocid="games.pattern.primary_button" onClick={startGame}>
          Start
        </Button>
      )}
      {phase === "showing" && (
        <p className="text-sm text-muted-foreground">Watch...</p>
      )}
      {phase === "input" && <p className="text-sm">Length: {pattern.length}</p>}
      {phase === "result" && (
        <div className="space-y-2">
          <p className="text-sm">
            Score: <strong>{pattern.length}</strong>
          </p>
          <Button
            data-ocid="games.pattern.retry.button"
            onClick={() => {
              setPhase("idle");
              setPattern([]);
              setUserPattern([]);
            }}
          >
            Try Again
          </Button>
        </div>
      )}
    </div>
  );
}

export default function FocusGames() {
  const qc = useQueryClient();
  const { actor } = useActor();
  const { data: scores } = useQuery({
    queryKey: ["scores"],
    queryFn: () => actor!.getMyGameScores(),
    enabled: !!actor,
  });

  const scoreMutation = useMutation({
    mutationFn: async ({ game, score }: { game: string; score: number }) => {
      await actor!.addGameScore(game, BigInt(score));
      await actor!.addXP(BigInt(Math.floor(score / 10)));
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["scores"] });
      qc.invalidateQueries({ queryKey: ["xp"] });
    },
  });

  const getBest = (game: string) => {
    const gs = (scores ?? []).filter((s) => s.gameName === game);
    return gs.length === 0
      ? "—"
      : Math.max(...gs.map((s) => Number(s.score))).toString();
  };

  const saveScore = (game: string) => (score: number) => {
    if (score > 0 && actor) scoreMutation.mutate({ game, score });
  };

  return (
    <div className="p-6 space-y-6" data-ocid="games.page">
      <div>
        <h2 className="text-2xl font-display font-bold">Focus Games</h2>
        <p className="text-muted-foreground text-sm">
          Train your attention and earn XP
        </p>
      </div>
      <div className="flex gap-3 flex-wrap">
        {["NumberMemory", "ReactionTime", "PatternMatch"].map((game) => (
          <Badge key={game} variant="outline" className="text-xs">
            <Gamepad2 size={10} className="mr-1" />
            {game}: {getBest(game)}
          </Badge>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Number Memory</CardTitle>
          </CardHeader>
          <CardContent>
            <NumberMemoryGame onScore={saveScore("NumberMemory")} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Reaction Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ReactionGame onScore={saveScore("ReactionTime")} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Pattern Match</CardTitle>
          </CardHeader>
          <CardContent>
            <PatternGame onScore={saveScore("PatternMatch")} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
