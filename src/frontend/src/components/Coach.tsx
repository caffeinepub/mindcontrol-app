import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bot, Send, User } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";

const RESPONSES: { keywords: string[]; response: string }[] = [
  {
    keywords: ["urge", "crave", "want", "tempt"],
    response:
      "Urges are waves — they peak and fade. Do 20 push-ups or splash cold water on your face right now. It typically passes in under 20 minutes. You've come this far.",
  },
  {
    keywords: ["bored", "nothing", "empty", "lonely"],
    response:
      "Boredom is a major trigger. Call someone, go outside, or dive into the 30-day program. Your brain needs real stimulation, not cheap dopamine.",
  },
  {
    keywords: ["stressed", "anxious", "overwhelm", "panic"],
    response:
      "Try box breathing: 4s in, 4s hold, 4s out, 4s hold. Repeat 4 times. Stress is temporary. Your resolve is permanent.",
  },
  {
    keywords: ["proud", "good", "great", "strong", "winning"],
    response:
      "That's the real you showing up. Momentum is powerful. Keep this energy — what's one thing you can do today to make tomorrow even better?",
  },
  {
    keywords: ["fail", "relapse", "mess", "gave up", "broke"],
    response:
      "A relapse is data, not defeat. Write down what triggered you and what to build next. Reset and get back on track. Every expert failed first.",
  },
  {
    keywords: ["sad", "depress", "down", "hopeless"],
    response:
      "Recovery affects your emotions — the brain is recalibrating. These feelings are real but temporary. Reach out to someone you trust today.",
  },
  {
    keywords: ["sleep", "tired", "exhausted"],
    response:
      "Sleep is critical for willpower and recovery. Aim for 8 hours, consistent bedtime. No screens 30 minutes before bed.",
  },
];

const DEFAULT_RESPONSE =
  "The fact that you're here talking about it means you're already fighting. Every day you choose discipline, your brain grows stronger. Keep going.";

function getCoachResponse(message: string): string {
  const lower = message.toLowerCase();
  for (const entry of RESPONSES) {
    if (entry.keywords.some((kw) => lower.includes(kw))) return entry.response;
  }
  return DEFAULT_RESPONSE;
}

export default function Coach() {
  const qc = useQueryClient();
  const { actor } = useActor();
  const [input, setInput] = useState("");

  const { data: history, isLoading } = useQuery({
    queryKey: ["chat"],
    queryFn: () => actor!.getMyChatHistory(),
    enabled: !!actor,
  });

  const sendMutation = useMutation({
    mutationFn: async (msg: string) => {
      await actor!.addChatMessage(msg, getCoachResponse(msg));
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["chat"] });
      setInput("");
    },
    onError: () => toast.error("Failed to send message"),
  });

  const messages = [...(history ?? [])].sort(
    (a, b) => Number(a.timestamp) - Number(b.timestamp),
  );

  return (
    <div
      className="p-6 flex flex-col"
      style={{ height: "calc(100vh - 0px)" }}
      data-ocid="coach.page"
    >
      <div className="mb-4">
        <h2 className="text-2xl font-display font-bold">AI Mindset Coach</h2>
        <p className="text-muted-foreground text-sm">
          Tell me how you're feeling
        </p>
      </div>
      <Card className="flex-1 flex flex-col overflow-hidden min-h-0">
        <ScrollArea className="flex-1 p-4">
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-16 w-3/4" />
              <Skeleton className="h-16 w-2/3" />
              <Skeleton className="h-16 w-3/4" />
            </div>
          ) : messages.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center h-32 text-center"
              data-ocid="coach.empty_state"
            >
              <Bot size={32} className="text-muted-foreground mb-2" />
              <p className="text-muted-foreground text-sm">
                Start by sharing how you're feeling today.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg, idx) => (
                <div
                  key={`${Number(msg.timestamp)}-${idx}`}
                  data-ocid={`coach.item.${idx + 1}`}
                  className="space-y-2"
                >
                  <div className="flex gap-2 justify-end">
                    <div className="bg-primary/20 rounded-lg px-3 py-2 max-w-[80%] text-sm">
                      {msg.userMessage}
                    </div>
                    <User
                      size={16}
                      className="flex-shrink-0 mt-1 text-primary"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Bot size={16} className="flex-shrink-0 mt-1 text-accent" />
                    <div className="bg-muted rounded-lg px-3 py-2 max-w-[80%] text-sm text-muted-foreground">
                      {msg.coachResponse}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        <CardContent className="border-t p-3">
          <div className="flex gap-2">
            <Textarea
              data-ocid="coach.message.textarea"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="How are you feeling right now?"
              className="resize-none min-h-[60px]"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  if (input.trim() && actor) sendMutation.mutate(input.trim());
                }
              }}
            />
            <Button
              data-ocid="coach.send.primary_button"
              disabled={!input.trim() || sendMutation.isPending || !actor}
              onClick={() => sendMutation.mutate(input.trim())}
              className="self-end"
            >
              <Send size={14} />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
