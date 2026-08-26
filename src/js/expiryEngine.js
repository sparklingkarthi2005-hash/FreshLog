export function calculateExpiry(item) {
  let totalDays = item.defaultDays;

  // Apply Storage Multipliers
  if (item.storage === 'fridge') {
    totalDays *= 2;
  } else if (item.storage === 'freezer') {
    totalDays *= 5;
  }

  const addedDate = new Date(item.addedDate);
  const now = new Date();
  const diffMs = now - addedDate;
  const daysPassed = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const remainingDays = totalDays - daysPassed;

  const percentage = Math.max(0, Math.min(100, (remainingDays / totalDays) * 100));

  let statusText = `${remainingDays}d left`;
  let badgeColor = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
  let barColor = 'bg-emerald-400';

  if (remainingDays <= 0) {
    statusText = 'Expired';
    badgeColor = 'bg-rose-500/20 text-rose-300 border-rose-500/40';
    barColor = 'bg-rose-500';
  } else if (remainingDays <= 2) {
    statusText = `${remainingDays}d left (Critical)`;
    badgeColor = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
    barColor = 'bg-amber-400';
  }

  return { remainingDays, percentage, statusText, badgeColor, barColor };
}