import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Map "mo:core/Map";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Int "mo:core/Int";
import List "mo:core/List";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User Profile
  public type UserProfile = {
    nickname : Text;
    joinDate : Int;
    level : Nat;
  };

  // Daily Check-in / Streak
  public type StreakData = {
    currentStreak : Nat;
    longestStreak : Nat;
    lastCheckInDate : Int;
  };

  // Daily Habits
  public type Habit = {
    name : Text;
    completed : Bool;
  };

  public type HabitsData = {
    habits : [Habit];
    lastResetDate : Int;
  };

  // 30-day Brain Rewire Program
  public type ProgramProgress = {
    completedDays : [Nat]; // Days 1-30 that are completed
  };

  // XP and Badges
  public type Badge = {
    name : Text;
    earnedDate : Int;
  };

  public type XPData = {
    totalXP : Nat;
    badges : [Badge];
  };

  // Leaderboard Entry
  public type LeaderboardEntry = {
    nickname : Text;
    streakCount : Nat;
  };

  // Mindset Coach Conversation
  public type ChatMessage = {
    userMessage : Text;
    coachResponse : Text;
    timestamp : Int;
  };

  // Focus Game Score
  public type GameScore = {
    gameName : Text;
    score : Nat;
    date : Int;
  };

  // Storage maps (per-user data)
  let userProfiles = Map.empty<Principal, UserProfile>();
  let userStreaks = Map.empty<Principal, StreakData>();
  let userHabits = Map.empty<Principal, HabitsData>();
  let userPrograms = Map.empty<Principal, ProgramProgress>();
  let userXP = Map.empty<Principal, XPData>();
  let userChatHistory = Map.empty<Principal, [ChatMessage]>();
  let userGameScores = Map.empty<Principal, [GameScore]>();

  // Leaderboard (public, but uses anonymous nicknames)
  let leaderboard = List.empty<LeaderboardEntry>();

  // ============ User Profile Functions ============

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // ============ Streak Functions ============

  public query ({ caller }) func getMyStreak() : async ?StreakData {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access streak data");
    };
    userStreaks.get(caller);
  };

  public shared ({ caller }) func doCheckIn() : async StreakData {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can check in");
    };

    let now = Time.now();
    let currentData = userStreaks.get(caller);

    let newData = switch (currentData) {
      case (null) {
        {
          currentStreak = 1;
          longestStreak = 1;
          lastCheckInDate = now;
        };
      };
      case (?data) {
        let dayInNanos = 86_400_000_000_000; // 24 hours in nanoseconds
        let timeSinceLastCheckIn = now - data.lastCheckInDate;

        if (timeSinceLastCheckIn < dayInNanos) {
          // Already checked in today
          data;
        } else if (timeSinceLastCheckIn < 2 * dayInNanos) {
          // Consecutive day
          let newStreak = data.currentStreak + 1;
          {
            currentStreak = newStreak;
            longestStreak = if (newStreak > data.longestStreak) { newStreak } else { data.longestStreak };
            lastCheckInDate = now;
          };
        } else {
          // Streak broken
          {
            currentStreak = 1;
            longestStreak = data.longestStreak;
            lastCheckInDate = now;
          };
        };
      };
    };

    userStreaks.add(caller, newData);
    newData;
  };

  // ============ Habits Functions ============

  public query ({ caller }) func getMyHabits() : async ?HabitsData {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access habits");
    };
    userHabits.get(caller);
  };

  public shared ({ caller }) func setMyHabits(habits : [Habit]) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can set habits");
    };

    let now = Time.now();
    userHabits.add(caller, {
      habits = habits;
      lastResetDate = now;
    });
  };

  public shared ({ caller }) func markHabitComplete(habitName : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can mark habits complete");
    };

    switch (userHabits.get(caller)) {
      case (null) {
        Runtime.trap("No habits found for user");
      };
      case (?habitsData) {
        let updatedHabits = habitsData.habits.map(
          func(h : Habit) : Habit {
            if (h.name == habitName) {
              { name = h.name; completed = true };
            } else {
              h;
            };
          }
        );
        userHabits.add(caller, {
          habits = updatedHabits;
          lastResetDate = habitsData.lastResetDate;
        });
      };
    };
  };

  // ============ Brain Rewire Program Functions ============

  public query ({ caller }) func getMyProgramProgress() : async ?ProgramProgress {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access program progress");
    };
    userPrograms.get(caller);
  };

  public shared ({ caller }) func markProgramDayComplete(day : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update program progress");
    };

    if (day < 1 or day > 30) {
      Runtime.trap("Day must be between 1 and 30");
    };

    let currentProgress = userPrograms.get(caller);
    let completedDays = switch (currentProgress) {
      case (null) { [day] };
      case (?progress) {
        // Add day if not already completed
        let alreadyCompleted = progress.completedDays.find(func(d : Nat) : Bool { d == day });
        switch (alreadyCompleted) {
          case (null) {
            progress.completedDays.concat([day]);
          };
          case (?_) {
            progress.completedDays;
          };
        };
      };
    };

    userPrograms.add(caller, { completedDays = completedDays });
  };

  // ============ XP and Badges Functions ============

  public query ({ caller }) func getMyXP() : async ?XPData {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access XP data");
    };
    userXP.get(caller);
  };

  public shared ({ caller }) func addXP(points : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add XP");
    };

    let currentXP = userXP.get(caller);
    let newXPData = switch (currentXP) {
      case (null) {
        { totalXP = points; badges = [] };
      };
      case (?xpData) {
        {
          totalXP = xpData.totalXP + points;
          badges = xpData.badges;
        };
      };
    };

    userXP.add(caller, newXPData);
  };

  public shared ({ caller }) func awardBadge(badgeName : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can earn badges");
    };

    let now = Time.now();
    let currentXP = userXP.get(caller);
    let newXPData = switch (currentXP) {
      case (null) {
        {
          totalXP = 0;
          badges = [{ name = badgeName; earnedDate = now }];
        };
      };
      case (?xpData) {
        {
          totalXP = xpData.totalXP;
          badges = xpData.badges.concat([{ name = badgeName; earnedDate = now }]);
        };
      };
    };

    userXP.add(caller, newXPData);
  };

  // ============ Leaderboard Functions ============

  public query func getLeaderboard() : async [LeaderboardEntry] {
    // Public access - anyone can view leaderboard (including guests)
    leaderboard.toArray();
  };

  public shared ({ caller }) func addLeaderboardEntry(nickname : Text, streakCount : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add leaderboard entries");
    };

    leaderboard.add({ nickname = nickname; streakCount = streakCount });
  };

  // ============ Chat History Functions ============

  public query ({ caller }) func getMyChatHistory() : async [ChatMessage] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access chat history");
    };

    switch (userChatHistory.get(caller)) {
      case (null) { [] };
      case (?history) { history };
    };
  };

  public shared ({ caller }) func addChatMessage(userMessage : Text, coachResponse : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add chat messages");
    };

    let now = Time.now();
    let message = {
      userMessage = userMessage;
      coachResponse = coachResponse;
      timestamp = now;
    };

    let currentHistory = userChatHistory.get(caller);
    let newHistory = switch (currentHistory) {
      case (null) { [message] };
      case (?history) { history.concat([message]) };
    };

    userChatHistory.add(caller, newHistory);
  };

  // ============ Game Scores Functions ============

  public query ({ caller }) func getMyGameScores() : async [GameScore] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access game scores");
    };

    switch (userGameScores.get(caller)) {
      case (null) { [] };
      case (?scores) { scores };
    };
  };

  public shared ({ caller }) func addGameScore(gameName : Text, score : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add game scores");
    };

    let now = Time.now();
    let gameScore = {
      gameName = gameName;
      score = score;
      date = now;
    };

    let currentScores = userGameScores.get(caller);
    let newScores = switch (currentScores) {
      case (null) { [gameScore] };
      case (?scores) { scores.concat([gameScore]) };
    };

    userGameScores.add(caller, newScores);
  };

  // ============ Admin Functions ============

  public shared ({ caller }) func clearAllUserData() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can clear all data");
    };

    userProfiles.clear();
    userStreaks.clear();
    userHabits.clear();
    userPrograms.clear();
    userXP.clear();
    userChatHistory.clear();
    userGameScores.clear();
    leaderboard.clear();
  };

  public shared ({ caller }) func clearLeaderboard() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can clear leaderboard");
    };

    leaderboard.clear();
  };
};
