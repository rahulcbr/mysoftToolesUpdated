export function recordRecentTool(toolId: string) {
  if (typeof window === "undefined") return;
  try {
    const stored = localStorage.getItem("recentTools");
    let list: string[] = stored ? JSON.parse(stored) : [];
    list = [toolId, ...list.filter((id) => id !== toolId)].slice(0, 10);
    localStorage.setItem("recentTools", JSON.stringify(list));
  } catch (_) {}
}
