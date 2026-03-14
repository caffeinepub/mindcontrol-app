import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import {
  Calendar,
  CheckSquare,
  Gamepad2,
  LayoutDashboard,
  LogIn,
  LogOut,
  MessageCircle,
  Moon,
  Sun,
  Trophy,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import Coach from "./components/Coach";
import Dashboard from "./components/Dashboard";
import FocusGames from "./components/FocusGames";
import Habits from "./components/Habits";
import Leaderboard from "./components/Leaderboard";
import PanicButton from "./components/PanicButton";
import Program from "./components/Program";
import { useInternetIdentity } from "./hooks/useInternetIdentity";

type Tab =
  | "dashboard"
  | "panic"
  | "habits"
  | "program"
  | "games"
  | "leaderboard"
  | "coach";

const navItems: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
  { id: "panic", label: "Panic Button", icon: <Zap size={18} /> },
  { id: "habits", label: "Habits", icon: <CheckSquare size={18} /> },
  { id: "program", label: "30-Day Program", icon: <Calendar size={18} /> },
  { id: "games", label: "Focus Games", icon: <Gamepad2 size={18} /> },
  { id: "leaderboard", label: "Leaderboard", icon: <Trophy size={18} /> },
  { id: "coach", label: "AI Coach", icon: <MessageCircle size={18} /> },
];

export default function App() {
  const [dark, setDark] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const { identity, login, clear } = useInternetIdentity();

  useEffect(() => {
    if (dark) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [dark]);

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <aside className="w-56 flex-shrink-0 bg-sidebar border-r border-sidebar-border flex flex-col">
        <div className="p-4 border-b border-sidebar-border">
          <h1 className="font-display font-bold text-lg text-primary">
            MindControl
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Rewire your brain
          </p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => (
            <button
              type="button"
              key={item.id}
              data-ocid={`nav.${item.id}.link`}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === item.id
                  ? "bg-primary/20 text-primary"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-sidebar-border space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Theme</span>
            <Button
              variant="ghost"
              size="icon"
              data-ocid="theme.toggle"
              onClick={() => setDark(!dark)}
              className="h-7 w-7"
            >
              {dark ? <Sun size={14} /> : <Moon size={14} />}
            </Button>
          </div>
          {identity ? (
            <Button
              variant="outline"
              size="sm"
              data-ocid="auth.logout.button"
              onClick={() => clear()}
              className="w-full text-xs"
            >
              <LogOut size={12} className="mr-1" /> Sign Out
            </Button>
          ) : (
            <Button
              size="sm"
              data-ocid="auth.login.button"
              onClick={() => login()}
              className="w-full text-xs"
            >
              <LogIn size={12} className="mr-1" /> Sign In
            </Button>
          )}
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto">
        {activeTab === "dashboard" && <Dashboard />}
        {activeTab === "panic" && <PanicButton />}
        {activeTab === "habits" && <Habits />}
        {activeTab === "program" && <Program />}
        {activeTab === "games" && <FocusGames />}
        {activeTab === "leaderboard" && <Leaderboard />}
        {activeTab === "coach" && <Coach />}
      </main>
      <Toaster />
    </div>
  );
}
