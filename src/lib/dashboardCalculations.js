import { MONTHS } from './constants';

/**
 * Calcula métricas agregadas do dashboard para os últimos 12 meses
 * @param {Array} performanceData - Dados de performance de professores
 * @param {Array} evaluationData - Dados de avaliação de professores
 * @param {Array} dashboardData - Dados específicos do dashboard (alunos ativos, churn)
 * @param {string} selectedMonth - Mês selecionado
 * @param {number} selectedYear - Ano selecionado
 * @returns {Array} Array com métricas dos últimos 12 meses
 */
export const calculateDashboardMetrics = (
  performanceData,
  evaluationData,
  dashboardData,
  selectedMonth,
  selectedYear
) => {
  const currentDate = new Date(selectedYear, MONTHS.indexOf(selectedMonth));
  const last12Months = [];

  for (let i = 11; i >= 0; i--) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
    const monthName = MONTHS[date.getMonth()];
    const year = date.getFullYear();

    // Filtrar dados do mês
    const monthPerformance = performanceData.filter(p => p.month === monthName && p.year === year);
    const monthEvaluations = evaluationData.filter(e => e.month === monthName && e.year === year);
    const monthDashboard = dashboardData.find(d => d.month === monthName && d.year === year);

    // Calcular médias
    const avgConversionRate = monthPerformance.length > 0
      ? monthPerformance.reduce((sum, p) => sum + (p.conversion_rate || 0), 0) / monthPerformance.length
      : 0;

    const avgNPS = monthEvaluations.length > 0
      ? monthEvaluations.reduce((sum, e) => sum + (e.nps_avg || 0), 0) / monthEvaluations.length
      : 0;

    // Calcular totais
    const totalConversions = monthPerformance.reduce((sum, p) => sum + (p.conversions || 0), 0);
    const totalRenewals = monthPerformance.reduce((sum, p) => sum + (p.renewals || 0), 0);

    last12Months.push({
      month: monthName,
      year: year,
      label: `${monthName}/${year.toString().slice(-2)}`,
      avgConversionRate,
      avgNPS,
      totalConversions,
      totalRenewals,
      activeStudents: monthDashboard?.active_students || 0,
      churnRate: monthDashboard?.conversion_rate || 0
    });
  }

  return last12Months;
};

/**
 * Calcula métricas gerais agregadas do dashboard
 * @param {Array} dashboardData - Dados do dashboard dos últimos 12 meses
 * @returns {Object|null} Métricas gerais calculadas ou null se não houver dados
 */
export const calculateGeneralDashboardMetrics = (dashboardData) => {
  if (!dashboardData || dashboardData.length === 0) return null;

  const validData = dashboardData.filter(item => item.avgConversionRate > 0);
  const validNPS = dashboardData.filter(item => item.avgNPS > 0);

  return {
    averageConversionRate: validData.length > 0
      ? validData.reduce((sum, item) => sum + item.avgConversionRate, 0) / validData.length
      : 0,
    averageNPS: validNPS.length > 0
      ? validNPS.reduce((sum, item) => sum + item.avgNPS, 0) / validNPS.length
      : 0,
    totalConversions: dashboardData.reduce((sum, item) => sum + item.totalConversions, 0),
    totalRenewals: dashboardData.reduce((sum, item) => sum + item.totalRenewals, 0)
  };
};

/**
 * Prepara dados para gráficos do dashboard
 * @param {Array} dashboardData - Dados do dashboard
 * @returns {Object} Dados formatados para gráficos
 */
export const prepareDashboardChartData = (dashboardData) => {
  if (!dashboardData) return {};

  return {
    periodLabels: dashboardData.map(item => item.label),
    conversionRateData: dashboardData.map(item => item.avgConversionRate),
    npsData: dashboardData.map(item => item.avgNPS),
    activeStudentsData: dashboardData.map(item => item.activeStudents),
    churnData: dashboardData.map(item => item.churnRate)
  };
};
