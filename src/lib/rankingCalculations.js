import {
  calculateConversionRate,
  calculateRenewalRate,
  normalizeRateToScore,
  calculateOverallEvaluationScore,
  calculateOverallScore
} from './calculations';

/**
 * Calcula ranking mensal baseado nos dados de performance e avaliação
 * @param {Array} professors - Lista de professores
 * @param {Array} performanceData - Dados de performance do mês
 * @param {Array} evaluationData - Dados de avaliação do mês
 * @returns {Array} Ranking mensal ordenado por pontuação geral
 */
export const calculateMonthlyRanking = (professors, performanceData, evaluationData) => {
  const performanceByProfessor = new Map(
    performanceData.map((item) => [item.professor_id, item])
  );
  const evaluationByProfessor = new Map(
    evaluationData.map((item) => [item.professor_id, item])
  );

  const rows = professors.map((professor) => {
    const perf = performanceByProfessor.get(professor.id);
    const evalRow = evaluationByProfessor.get(professor.id);

    const conversionRate = calculateConversionRate(
      perf?.experimental_classes ?? 0,
      perf?.conversions ?? 0
    );
    const renewalRate = calculateRenewalRate(
      perf?.students_to_renew ?? 0,
      perf?.renewals ?? 0
    );
    const performanceScore = perf ? normalizeRateToScore(conversionRate, renewalRate) : null;

    const evaluationScore = evalRow ? calculateOverallEvaluationScore(evalRow) : null;

    const overallScore = calculateOverallScore(performanceScore, evaluationScore);

    return {
      professorId: professor.id,
      name: `${professor.first_name} ${professor.last_name}`,
      performanceScore,
      evaluationScore,
      overallScore,
      conversionRate,
      renewalRate
    };
  });

  // Ordenar por pontuação geral (decrescente)
  rows.sort((a, b) => (b.overallScore ?? -1) - (a.overallScore ?? -1));

  return rows;
};

/**
 * Calcula ranking geral baseado em dados históricos
 * @param {Array} professors - Lista de professores
 * @param {Array} allPerformanceData - Todos os dados de performance
 * @param {Array} allEvaluationData - Todos os dados de avaliação
 * @returns {Array} Ranking geral ordenado por pontuação média
 */
export const calculateOverallRanking = (professors, allPerformanceData, allEvaluationData) => {
  const professorStats = professors.map((professor) => {
    // Filtrar dados do professor
    const professorPerformance = allPerformanceData.filter(p => p.professor_id === professor.id);
    const professorEvaluations = allEvaluationData.filter(e => e.professor_id === professor.id);

    // Calcular médias históricas
    const avgPerformanceScore = calculateAveragePerformanceScore(professorPerformance);
    const avgEvaluationScore = calculateAverageEvaluationScore(professorEvaluations);
    const overallScore = calculateOverallScore(avgPerformanceScore, avgEvaluationScore);

    return {
      professorId: professor.id,
      name: `${professor.first_name} ${professor.last_name}`,
      avgPerformanceScore,
      avgEvaluationScore,
      overallScore,
      totalMonths: Math.max(professorPerformance.length, professorEvaluations.length)
    };
  });

  // Ordenar por pontuação geral (decrescente)
  professorStats.sort((a, b) => (b.overallScore ?? -1) - (a.overallScore ?? -1));

  return professorStats;
};

/**
 * Calcula pontuação média de performance histórica de um professor
 * @param {Array} performanceData - Dados de performance do professor
 * @returns {number|null} Pontuação média ou null se não houver dados
 */
export const calculateAveragePerformanceScore = (performanceData) => {
  if (!performanceData || performanceData.length === 0) return null;

  const scores = performanceData.map((perf) => {
    const conversionRate = calculateConversionRate(
      perf.experimental_classes ?? 0,
      perf.conversions ?? 0
    );
    const renewalRate = calculateRenewalRate(
      perf.students_to_renew ?? 0,
      perf.renewals ?? 0
    );
    return normalizeRateToScore(conversionRate, renewalRate);
  }).filter(score => score !== null);

  if (scores.length === 0) return null;

  return scores.reduce((sum, score) => sum + score, 0) / scores.length;
};

/**
 * Calcula pontuação média de avaliação histórica de um professor
 * @param {Array} evaluationData - Dados de avaliação do professor
 * @returns {number|null} Pontuação média ou null se não houver dados
 */
export const calculateAverageEvaluationScore = (evaluationData) => {
  if (!evaluationData || evaluationData.length === 0) return null;

  const scores = evaluationData
    .map((evaluation) => calculateOverallEvaluationScore(evaluation))
    .filter(score => score !== null);

  if (scores.length === 0) return null;

  return scores.reduce((sum, score) => sum + score, 0) / scores.length;
};

/**
 * Calcula estatísticas detalhadas de ranking para um professor específico
 * @param {Object} professor - Dados do professor
 * @param {Array} performanceData - Dados de performance
 * @param {Array} evaluationData - Dados de avaliação
 * @returns {Object} Estatísticas detalhadas do professor
 */
export const calculateProfessorRankingStats = (professor, performanceData, evaluationData) => {
  const professorPerformance = performanceData.filter(p => p.professor_id === professor.id);
  const professorEvaluations = evaluationData.filter(e => e.professor_id === professor.id);

  const avgPerformanceScore = calculateAveragePerformanceScore(professorPerformance);
  const avgEvaluationScore = calculateAverageEvaluationScore(professorEvaluations);
  const overallScore = calculateOverallScore(avgPerformanceScore, avgEvaluationScore);

  // Calcular tendências
  const performanceTrend = calculateTrend(professorPerformance.map(p => {
    const conversionRate = calculateConversionRate(p.experimental_classes ?? 0, p.conversions ?? 0);
    const renewalRate = calculateRenewalRate(p.students_to_renew ?? 0, p.renewals ?? 0);
    return normalizeRateToScore(conversionRate, renewalRate);
  }));

  const evaluationTrend = calculateTrend(
    professorEvaluations.map(e => calculateOverallEvaluationScore(e))
  );

  return {
    professorId: professor.id,
    name: `${professor.first_name} ${professor.last_name}`,
    avgPerformanceScore,
    avgEvaluationScore,
    overallScore,
    totalMonths: Math.max(professorPerformance.length, professorEvaluations.length),
    performanceTrend,
    evaluationTrend,
    recentPerformance: professorPerformance.slice(-3), // Últimos 3 meses
    recentEvaluations: professorEvaluations.slice(-3)  // Últimas 3 avaliações
  };
};

/**
 * Calcula tendência baseada em uma série de valores
 * @param {Array} values - Array de valores numéricos
 * @returns {string} 'up', 'down', ou 'stable'
 */
export const calculateTrend = (values) => {
  if (!values || values.length < 2) return 'stable';

  const validValues = values.filter(v => v !== null && v !== undefined);
  if (validValues.length < 2) return 'stable';

  const recent = validValues.slice(-3); // Últimos 3 valores
  const avgRecent = recent.reduce((sum, val) => sum + val, 0) / recent.length;
  const avgPrevious = validValues.slice(0, -3).length > 0
    ? validValues.slice(0, -3).reduce((sum, val) => sum + val, 0) / validValues.slice(0, -3).length
    : avgRecent;

  const diff = avgRecent - avgPrevious;

  if (diff > 0.5) return 'up';
  if (diff < -0.5) return 'down';
  return 'stable';
};
