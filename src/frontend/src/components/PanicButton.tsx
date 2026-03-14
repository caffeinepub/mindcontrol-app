import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Zap } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const QUOTES = [
  "Every urge passes. You are stronger than this moment.",
  "Your future self is watching. Make them proud.",
  "Discipline is choosing what you want most over what you want now.",
  "You've overcome this before. You can do it again.",
  "The pain of discipline is less than the pain of regret.",
  "You are rewriting your story. Stay the course.",
  "This urge is temporary. Your freedom is permanent.",
  "One moment of willpower changes everything.",
];

type Phase = "idle" | "inhale" | "hold-in" | "exhale" | "hold-out";
const PHASES: Phase[] = ["inhale", "hold-in", "exhale", "hold-out"];
const LABELS: Record<Phase, string> = {
  idle: "",
  inhale: "Breathe In",
  "hold-in": "Hold",
  exhale: "Breathe Out",
  "hold-out": "Hold",
};

export default function PanicButton() {
  const [active, setActive] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [countdown, setCountdown] = useState(4);
  const [quoteIdx, setQuoteIdx] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const phaseIdxRef = useRef(0);
  const countRef = useRef(4);

  useEffect(() => {
    if (!active) return;
    phaseIdxRef.current = 0;
    setPhase(PHASES[0]);
    countRef.current = 4;
    setCountdown(4);
    timerRef.current = setInterval(() => {
      countRef.current -= 1;
      setCountdown(countRef.current);
      if (countRef.current <= 0) {
        phaseIdxRef.current = (phaseIdxRef.current + 1) % PHASES.length;
        setPhase(PHASES[phaseIdxRef.current]);
        countRef.current = 4;
        setCountdown(4);
        if (phaseIdxRef.current === 0)
          setQuoteIdx((q) => (q + 1) % QUOTES.length);
      }
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [active]);

  const circleScale =
    active && (phase === "inhale" || phase === "hold-in")
      ? "scale-150 opacity-100"
      : "scale-100 opacity-70";
  const circleTrans =
    phase === "inhale" || phase === "exhale"
      ? "transition-transform duration-[4000ms] ease-in-out"
      : "";

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen p-6 gap-8"
      data-ocid="panic.page"
    >
      <div className="text-center">
        <h2 className="text-3xl font-display font-bold mb-2">Panic Mode</h2>
        <p className="text-muted-foreground">
          {active
            ? "Focus on your breath. You've got this."
            : "Hit the button when you feel an urge."}
        </p>
      </div>

      {!active ? (
        <Button
          size="lg"
          variant="destructive"
          data-ocid="panic.start.primary_button"
          onClick={() => setActive(true)}
          className="w-48 h-48 rounded-full text-xl font-bold shadow-2xl hover:scale-105 transition-transform"
        >
          <div className="flex flex-col items-center gap-2">
            <Zap size={36} />I Need Help
          </div>
        </Button>
      ) : (
        <div className="relative flex items-center justify-center w-72 h-72">
          <div
            className={`absolute rounded-full bg-primary/20 w-48 h-48 ${circleScale} ${circleTrans}`}
          />
          <div
            className={`absolute rounded-full bg-primary/10 w-56 h-56 ${circleScale} ${circleTrans}`}
            style={{ transitionDelay: "0.1s" }}
          />
          <div className="relative z-10 flex flex-col items-center gap-2 text-center">
            <span className="text-5xl font-display font-bold text-primary">
              {countdown}
            </span>
            <span className="text-lg font-medium">{LABELS[phase]}</span>
          </div>
        </div>
      )}

      {active && (
        <>
          <Card className="max-w-md">
            <CardContent className="p-6 text-center">
              <p className="text-lg italic text-muted-foreground">
                "{QUOTES[quoteIdx]}"
              </p>
            </CardContent>
          </Card>
          <Button
            variant="outline"
            data-ocid="panic.stop.button"
            onClick={() => {
              setActive(false);
              setPhase("idle");
            }}
          >
            I'm okay now
          </Button>
        </>
      )}
    </div>
  );
}
