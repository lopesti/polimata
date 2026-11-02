/** Simple load simulator: if you add N new cards/day for D days */
export function simulateNewCardsLoad(opts: {
  newPerDay: number;
  days: number;
  reviewsPerNewApprox?: number;
}) {
  const reviewsPerNew = opts.reviewsPerNewApprox ?? 3.5;
  const points: { day: number; newCards: number; reviews: number; total: number }[] = [];
  let backlog = 0;
  for (let d = 1; d <= opts.days; d++) {
    const news = opts.newPerDay;
    // decaying review pressure from previous news
    backlog = backlog * 0.85 + news * reviewsPerNew;
    const reviews = Math.round(backlog);
    points.push({
      day: d,
      newCards: news,
      reviews,
      total: news + reviews,
    });
  }
  const peak = Math.max(...points.map((p) => p.total));
  return { points, peak, warning: peak > 120 };
}
