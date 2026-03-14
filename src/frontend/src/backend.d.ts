import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface StreakData {
    lastCheckInDate: bigint;
    longestStreak: bigint;
    currentStreak: bigint;
}
export interface LeaderboardEntry {
    nickname: string;
    streakCount: bigint;
}
export interface HabitsData {
    lastResetDate: bigint;
    habits: Array<Habit>;
}
export interface GameScore {
    date: bigint;
    score: bigint;
    gameName: string;
}
export interface Habit {
    name: string;
    completed: boolean;
}
export interface ChatMessage {
    userMessage: string;
    timestamp: bigint;
    coachResponse: string;
}
export interface XPData {
    totalXP: bigint;
    badges: Array<Badge>;
}
export interface ProgramProgress {
    completedDays: Array<bigint>;
}
export interface UserProfile {
    nickname: string;
    joinDate: bigint;
    level: bigint;
}
export interface Badge {
    earnedDate: bigint;
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addChatMessage(userMessage: string, coachResponse: string): Promise<void>;
    addGameScore(gameName: string, score: bigint): Promise<void>;
    addLeaderboardEntry(nickname: string, streakCount: bigint): Promise<void>;
    addXP(points: bigint): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    awardBadge(badgeName: string): Promise<void>;
    clearAllUserData(): Promise<void>;
    clearLeaderboard(): Promise<void>;
    doCheckIn(): Promise<StreakData>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getLeaderboard(): Promise<Array<LeaderboardEntry>>;
    getMyChatHistory(): Promise<Array<ChatMessage>>;
    getMyGameScores(): Promise<Array<GameScore>>;
    getMyHabits(): Promise<HabitsData | null>;
    getMyProgramProgress(): Promise<ProgramProgress | null>;
    getMyStreak(): Promise<StreakData | null>;
    getMyXP(): Promise<XPData | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    markHabitComplete(habitName: string): Promise<void>;
    markProgramDayComplete(day: bigint): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setMyHabits(habits: Array<Habit>): Promise<void>;
}
