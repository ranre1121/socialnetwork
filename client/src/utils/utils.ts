export const formatPostDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffHours < 24) {
    if (diffHours === 0) {
      if (diffMinutes === 0) return "Just now";
      return `${diffMinutes}m ago`;
    }
    return `${diffHours}h ago`;
  }
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
};

export const formatMessageDate = (dateString: string) => {
  const [year, month, day] = dateString.split(":").map(Number);
  const date = new Date(year, month - 1, day);
  const today = new Date();

  const isToday =
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();

  if (isToday) return "Today";

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  return `${monthNames[month - 1]} ${day}`;
};
