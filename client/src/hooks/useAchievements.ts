import { useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

/**
 * Hook to automatically check and unlock achievements
 * Call this after actions that might trigger badges
 */
export function useAchievementCheck() {
  const utils = trpc.useUtils();
  const checkMutation = trpc.achievements.checkAndUnlock.useMutation({
    onSuccess: (data) => {
      // Show toast for newly unlocked badges
      if (data.newlyUnlocked && data.newlyUnlocked.length > 0) {
        data.newlyUnlocked.forEach((badgeId) => {
          const badgeName = getBadgeName(badgeId);
          toast.success(`🏆 Achievement Unlocked: ${badgeName}!`, {
            duration: 5000,
          });
        });
        
        // Invalidate achievements list to refresh UI
        utils.achievements.list.invalidate();
      }
    },
  });

  return {
    checkAchievements: () => checkMutation.mutate(),
    isChecking: checkMutation.isPending,
  };
}

/**
 * Auto-check achievements after specific mutations
 */
export function useAutoAchievementCheck() {
  const { checkAchievements } = useAchievementCheck();

  // Return a callback to be called after successful mutations
  return {
    onSuccess: () => {
      // Delay slightly to ensure database is updated
      setTimeout(() => {
        checkAchievements();
      }, 500);
    },
  };
}

function getBadgeName(badgeId: string): string {
  const names: Record<string, string> = {
    first_calibration: "First Calibration",
    calibration_10: "Calibration Novice",
    calibration_50: "Calibration Adept",
    calibration_100: "Calibration Master",
    streak_3: "3-Day Streak",
    streak_7: "Week Warrior",
    streak_30: "Month Master",
    streak_100: "Centurion",
    first_module: "First Module",
    modules_5: "Learning Path",
    modules_all: "Complete Mastery",
    first_connection: "First Connection",
    inner_circle_5: "Inner Circle",
    first_insight: "First Insight",
    insights_10: "Self-Aware",
  };
  return names[badgeId] || badgeId;
}
