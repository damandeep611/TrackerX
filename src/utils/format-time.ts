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