import { CRITERION_PREFIXES, COLUMN_MAPPING } from './constants';

export const calculateConversionRate = (experimentalClasses, conversions) =>
  experimentalClasses > 0 ? (conversions / experimentalClasses) * 100 : 0;

export const calculateRenewalRate = (studentsToRenew, renewals) =>
  studentsToRenew > 0 ? (renewals / studentsToRenew) * 100 : 0;

export const normalizeRateToScore = (conversionRate, renewalRate) => {
  const normalized = ((conversionRate + renewalRate) / 2) * 0.05;
  return Math.min(Number.isFinite(normalized) ? normalized : 0, 5);
};

export const calculateOverallEvaluationScore = (record) => {
  if (!record) return null;
  const averages = Object.entries(record)
    .filter(([key, value]) => key.endsWith('_avg') && typeof value === 'number')
    .map(([, value]) => value);
  if (!averages.length) return null;
  return averages.reduce((acc, curr) => acc + curr, 0) / averages.length;
};

export const calculateOverallScore = (performanceScore, evaluationScore) => {
  if (performanceScore != null && evaluationScore != null) {
    return performanceScore * 0.4 + evaluationScore * 0.6;
  }
  if (performanceScore != null) {
    return performanceScore * 0.4;
  }
  if (evaluationScore != null) {
    return evaluationScore * 0.6;
  }
  return null;
};

export const getAverageKey = (criterion) => {
  const prefix = CRITERION_PREFIXES[criterion];
  return `${prefix}_avg`;
};

export const getColumnKey = (criterion, topic) => COLUMN_MAPPING[`${criterion}|${topic}`];

export const stripNullish = (object) => Object.fromEntries(
  Object.entries(object).filter(([, value]) => value !== undefined && value !== null)
);
