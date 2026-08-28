import { PriorityScoreInput } from './types';

/**
 * Calculates domain priority score for opportunities.
 * Priority Score = (Economic Impact * Probability * Urgency * Feasibility * Reversibility) / (Risk * Effort + 0.1)
 */
export function calculatePriorityScore(input: PriorityScoreInput): number {
  const numerator =
    input.economicImpact *
    input.probability *
    input.urgency *
    input.feasibility *
    input.reversibility;

  const denominator = input.risk * input.effort + 0.1;

  const score = numerator / denominator;
  return Math.round(score * 100) / 100;
}
