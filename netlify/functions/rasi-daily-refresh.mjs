export default async (request) => {
  const nextRun = (() => {
    try { return JSON.parse(request.body || "{}").next_run; } catch { return null; }
  })();

  // Scheduled jobs are intentionally kept lightweight. The public reader can
  // request fresh AI content through rasi-daily; this job provides a daily
  // execution hook for the future persistence/cache layer.
  console.log("Siddha Astro daily Rasi refresh", { nextRun, date: new Date().toISOString() });
};

export const config = {
  schedule: "@daily",
};
