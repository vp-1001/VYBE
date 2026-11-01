import { BudgetItem, Currency } from '../types/event';

export interface BudgetMetrics {
  totalBudget: number;
  plannedTotal: number;
  actualTotal: number;
  remainingPlanned: number;
  remainingActual: number;
  costPerGuest: number;
  utilizationRate: number; // 0 to 100+
  contingencyTotal: number;
  contingencyPercentage: number;
  isOverrun: boolean;
  overrunAmount: number;
  categoryBreakdown: {
    category: string;
    planned: number;
    actual: number;
    percentageOfBudget: number;
    itemCount: number;
  }[];
}

export function formatCurrency(amount: number, currency: Currency = 'INR'): string {
  const rounded = Math.round(amount);
  if (currency === 'INR') {
    // Standard Indian Numbering System formatting (e.g. 1,00,000)
    const str = Math.abs(rounded).toString();
    let lastThree = str.substring(str.length - 3);
    const otherNumbers = str.substring(0, str.length - 3);
    if (otherNumbers !== '') {
      lastThree = ',' + lastThree;
    }
    const formatted = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree;
    return `${rounded < 0 ? '-' : ''}₹${formatted}`;
  }

  const symbols: Record<Currency, string> = {
    INR: '₹',
    USD: '$',
    EUR: '€',
    GBP: '£',
  };
  return `${symbols[currency] || '$'}${Math.abs(rounded).toLocaleString('en-US')}`;
}

export function calculateBudgetMetrics(
  items: BudgetItem[],
  totalBudget: number,
  guestCount: number
): BudgetMetrics {
  const safeTotalBudget = Math.max(0, Number(totalBudget) || 0);
  const plannedTotal = items.reduce((sum, item) => sum + Math.max(0, Number(item?.estimatedCost) || 0), 0);
  const actualTotal = items.reduce((sum, item) => sum + Math.max(0, Number(item?.actualCost) || 0), 0);
  const remainingPlanned = safeTotalBudget - plannedTotal;
  const remainingActual = safeTotalBudget - actualTotal;
  const safeGuestCount = Math.max(1, Number(guestCount) || 1);
  const costPerGuest = Math.round(plannedTotal / safeGuestCount);
  const utilizationRate = safeTotalBudget > 0 ? (plannedTotal / safeTotalBudget) * 100 : 0;
  const isOverrun = plannedTotal > safeTotalBudget;
  const overrunAmount = isOverrun ? plannedTotal - safeTotalBudget : 0;

  // Contingency calculations
  const contingencyItems = items.filter(
    (i) => (i?.category || '').toLowerCase() === 'contingency'
  );
  const contingencyTotal = contingencyItems.reduce(
    (s, i) => s + Math.max(0, Number(i?.estimatedCost) || 0),
    0
  );
  const contingencyPercentage =
    safeTotalBudget > 0 ? (contingencyTotal / safeTotalBudget) * 100 : 0;

  // Group by category
  const categoryMap = new Map<string, { planned: number; actual: number; count: number }>();
  for (const item of items) {
    const cat = item?.category || 'General';
    const existing = categoryMap.get(cat) || { planned: 0, actual: 0, count: 0 };
    existing.planned += Math.max(0, Number(item?.estimatedCost) || 0);
    existing.actual += Math.max(0, Number(item?.actualCost) || 0);
    existing.count += 1;
    categoryMap.set(cat, existing);
  }

  const categoryBreakdown = Array.from(categoryMap.entries()).map(([category, val]) => ({
    category,
    planned: val.planned,
    actual: val.actual,
    percentageOfBudget: safeTotalBudget > 0 ? (val.planned / safeTotalBudget) * 100 : 0,
    itemCount: val.count,
  }));

  // Sort by highest planned cost
  categoryBreakdown.sort((a, b) => b.planned - a.planned);

  return {
    totalBudget: safeTotalBudget,
    plannedTotal,
    actualTotal,
    remainingPlanned,
    remainingActual,
    costPerGuest,
    utilizationRate,
    contingencyTotal,
    contingencyPercentage,
    isOverrun,
    overrunAmount,
    categoryBreakdown,
  };
}

export interface RebalanceProposal {
  targetCategory: string;
  delta: number;
  newBudgetTotal: number;
  willExceedBudget: boolean;
  overrunAmount: number;
  adjustedItems: {
    id: string;
    category: string;
    name: string;
    oldEstimated: number;
    newEstimated: number;
    difference: number;
  }[];
  explanation: string;
}

/**
 * Deterministically balances a proposed category adjustment.
 * If targetCategory is increased by delta, it searches for non-target items
 * (preferring 'optional' or 'nice-to-have' or 'Miscellaneous' / 'Decorations' / 'Contingency')
 * to offset the delta so the total budget is preserved.
 */
export function proposeDeterministicRebalance(
  items: BudgetItem[],
  totalBudget: number,
  targetCategory: string,
  delta: number
): RebalanceProposal {
  const currentTotal = items.reduce((acc, i) => acc + (Number(i.estimatedCost) || 0), 0);
  const targetItems = items.filter((i) => i.category.toLowerCase() === targetCategory.toLowerCase());

  if (targetItems.length === 0) {
    return {
      targetCategory,
      delta,
      newBudgetTotal: currentTotal + delta,
      willExceedBudget: currentTotal + delta > totalBudget,
      overrunAmount: Math.max(0, currentTotal + delta - totalBudget),
      adjustedItems: [],
      explanation: `Category "${targetCategory}" does not exist in the current budget items.`,
    };
  }

  const adjusted: RebalanceProposal['adjustedItems'] = [];
  const primaryTarget = targetItems[0];
  const oldTargetEstimated = primaryTarget.estimatedCost;
  const newTargetEstimated = Math.max(0, oldTargetEstimated + delta);
  adjusted.push({
    id: primaryTarget.id,
    category: primaryTarget.category,
    name: primaryTarget.name,
    oldEstimated: oldTargetEstimated,
    newEstimated: newTargetEstimated,
    difference: delta,
  });

  // If delta is positive (an increase), we look to reduce other items if possible
  let remainingToOffset = delta;
  if (delta > 0) {
    // Sort other candidates by flexibility: optional > nice-to-have > must-have
    const otherItems = items
      .filter((i) => i.id !== primaryTarget.id && i.estimatedCost > 0)
      .sort((a, b) => {
        const priorityScore = (p?: string) => (p === 'optional' ? 3 : p === 'nice-to-have' ? 2 : 1);
        return priorityScore(b.priority) - priorityScore(a.priority);
      });

    for (const item of otherItems) {
      if (remainingToOffset <= 0) break;
      // We can reduce at most up to 40% of an item or its available headroom, minimum 0
      const maxCut = Math.min(item.estimatedCost * 0.4, remainingToOffset);
      if (maxCut >= 500) {
        const cut = Math.round(maxCut);
        adjusted.push({
          id: item.id,
          category: item.category,
          name: item.name,
          oldEstimated: item.estimatedCost,
          newEstimated: item.estimatedCost - cut,
          difference: -cut,
        });
        remainingToOffset -= cut;
      }
    }
  }

  const finalSum = items.reduce((sum, item) => {
    const adj = adjusted.find((a) => a.id === item.id);
    return sum + (adj ? adj.newEstimated : item.estimatedCost);
  }, 0);

  const willExceedBudget = finalSum > totalBudget;
  const overrunAmount = Math.max(0, finalSum - totalBudget);

  const explanation = remainingToOffset > 0 && delta > 0
    ? `Increased ${targetCategory} by ${formatCurrency(delta)}. Rebalanced ${formatCurrency(delta - remainingToOffset)} from other categories. Remaining ${formatCurrency(remainingToOffset)} could not be safely offset without cutting essential items, resulting in ${willExceedBudget ? `an overrun of ${formatCurrency(overrunAmount)}` : 'a tight margin'}.`
    : `Successfully increased ${targetCategory} by ${formatCurrency(delta)} and rebalanced from flexible categories to stay strictly within the ${formatCurrency(totalBudget)} budget.`;

  return {
    targetCategory,
    delta,
    newBudgetTotal: finalSum,
    willExceedBudget,
    overrunAmount,
    adjustedItems: adjusted,
    explanation,
  };
}
