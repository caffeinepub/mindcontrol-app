# MindControl App

## Current State
New project — no existing code.

## Requested Changes (Diff)

### Add
- Streak tracker: daily check-ins, current streak, longest streak
- Urge panic button: breathing exercise (box breathing animation), motivational quotes
- Dopamine detox habits checklist: daily healthy habits to complete
- 30-day brain rewire program: structured daily tasks/readings
- Focus mini-games: simple attention/memory games
- Leaderboard: top streaks (local/anonymous)
- Progress dashboard: charts for streak history, habits completed, program progress
- AI mindset coach: pre-written responses to common urges/struggles (no LLM)
- Gamification: XP points, badges, level system
- Dark/light mode toggle
- All data persisted in localStorage

### Modify
N/A

### Remove
N/A

## Implementation Plan
1. Backend: store user profile, streaks, habit logs, program progress, XP/badges
2. Frontend: multi-tab layout (Dashboard, Panic Button, Habits, Program, Games, Leaderboard, Coach)
3. Streak logic: daily check-in resets or continues streak
4. Breathing exercise: animated box breathing UI on panic button
5. Habits: daily checklist that resets each day
6. 30-day program: list of 30 days with tasks, mark complete
7. Focus games: number memory, reaction time, pattern match
8. Leaderboard: top 10 streaks stored
9. Dashboard: progress charts using recharts
10. Coach: keyword-triggered pre-written motivational responses
11. Gamification: XP awarded for check-ins, habits, games; badge unlocks
12. Dark/light mode via Tailwind
