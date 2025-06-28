export const formatDuration = (minutes: number): string => {
    if (minutes < 60) return "0m";
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const reamainingMinutes = minutes % 60;
    return reamainingMinutes > 0
      ? `${hours}h ${reamainingMinutes}m`
      : `${hours}h`;
  };
//utility function to format time

export const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Invalid Date";
  }
};

// Calculate remaining hours based on total available and time spent
export function calculateRemainingHours(totalHours: number, timeSpent: number): number {
  return Math.max(0, totalHours - timeSpent);
}

// Format time spent for display
export function formatTimeSpent(hours: number): string {
  if (hours === 0) return "0h";
  if (hours < 1) return `${Math.round(hours * 60)}m`;
  return `${hours.toFixed(1)}h`;
}

// Get today's date in YYYY-MM-DD format
export function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

// Check if a date is today
export function isToday(dateString: string): boolean {
  const today = getTodayDateString();
  const taskDate = new Date(dateString).toISOString().split('T')[0];
  return today === taskDate;
}