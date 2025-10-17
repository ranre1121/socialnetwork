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
