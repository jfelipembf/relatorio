/**
 * Constantes de mensagens inteligentes para o dashboard
 * Mensagens personalizadas para o coordenador Zu sobre o desempenho das métricas
 */

export const DASHBOARD_MESSAGES = {
  // Mensagens para Alunos Ativos
  activeStudents: {
    increase: [
      "🎉 Excelente notícia, Zu! Tivemos um crescimento significativo nos alunos ativos este mês!",
      "🚀 Ótimo trabalho, equipe! Os alunos ativos aumentaram consideravelmente!",
      "📈 Crescimento sólido nos alunos ativos. Vamos manter esse ritmo, Zu!",
      "💪 Impressionante! Mais alunos se juntaram a nós este mês!"
    ],
    decrease: [
      "⚠️ Atenção, Zu. Observamos uma redução nos alunos ativos este mês.",
      "📉 Houve uma diminuição nos alunos ativos. Vamos investigar as causas.",
      "🔍 Precisamos entender o que levou à redução dos alunos ativos, Zu.",
      "📊 Os alunos ativos diminuíram. Vamos analisar os dados em detalhes."
    ],
    stable: [
      "📊 Os alunos ativos se mantiveram estáveis este mês, Zu.",
      "🔄 Manutenção dos níveis de alunos ativos. Vamos buscar crescimento.",
      "📈 Estabilidade nos alunos ativos. Oportunidade para estratégias de expansão."
    ]
  },

  // Mensagens para Churn Rate
  churnRate: {
    increase: [
      "⚠️ Alerta, Zu! O churn aumentou este mês. Precisamos agir rapidamente!",
      "🚨 Cuidado! Observamos um aumento na taxa de churn.",
      "📈 O churn subiu. Vamos identificar e resolver os pontos de atrito, Zu.",
      "🔴 Aumento no churn detectado. Precisamos de estratégias de retenção!"
    ],
    decrease: [
      "🎯 Excelente! Conseguimos reduzir a taxa de churn este mês, Zu!",
      "✅ Parabéns! O churn diminuiu. Nossas estratégias estão funcionando!",
      "📉 Redução no churn. Ótimo sinal de satisfação dos alunos!",
      "💚 Menos alunos nos deixando. Vamos continuar melhorando a retenção!"
    ],
    stable: [
      "📊 Taxa de churn se manteve estável este mês, Zu.",
      "🔄 Churn sem variações significativas. Oportunidade para redução.",
      "📈 Estabilidade no churn. Vamos focar em estratégias de retenção."
    ]
  },

  // Mensagens para NPS
  nps: {
    increase: [
      "🌟 Incrível, Zu! O NPS aumentou! Nossos alunos estão mais satisfeitos!",
      "🎉 NPS em alta! Excelente trabalho da equipe!",
      "📈 Satisfação dos alunos crescendo. Vamos manter essa tendência!",
      "⭐ Aumento no NPS. Os alunos estão recomendando mais nossa escola!"
    ],
    decrease: [
      "⚠️ Atenção, Zu. Observamos uma queda no NPS este mês.",
      "📉 NPS diminuiu. Precisamos entender o que está afetando a satisfação.",
      "🔍 Queda no NPS detectada. Vamos ouvir o feedback dos alunos.",
      "📊 Redução na satisfação. Momento de focar na experiência do aluno."
    ],
    stable: [
      "📊 NPS se manteve estável este mês, Zu.",
      "🔄 Satisfação dos alunos sem variações. Oportunidade para crescimento.",
      "📈 Estabilidade no NPS. Vamos buscar aumentar a satisfação."
    ]
  },

  // Mensagens gerais/combinações
  general: {
    excellent: [
      "🏆 Excelente performance geral, Zu! Todas as métricas em alta!",
      "🎯 Resultados impressionantes! Parabéns a toda equipe!",
      "🌟 Performance excepcional em todas as frentes!",
      "💪 Estamos no caminho certo. Continue assim, Zu!"
    ],
    concerning: [
      "⚠️ Precisamos atenção, Zu. Algumas métricas precisam de ajustes.",
      "🔍 Momento de análise. Vamos identificar pontos de melhoria.",
      "📊 Dados mostram necessidade de ação. Vamos trabalhar nisso!",
      "🎯 Oportunidade de melhoria identificada. Vamos ajustar nossa estratégia."
    ],
    mixed: [
      "📊 Performance mista este mês. Alguns pontos positivos e outros para melhorar.",
      "🔄 Resultados equilibrados. Vamos focar nos pontos que precisam de atenção.",
      "📈 Mês de contrastes. Vamos aprender com os pontos fortes e fracos.",
      "⚖️ Situação equilibrada. Momento de otimizar o que funciona e corrigir o que não."
    ]
  }
};

/**
 * Gera mensagem inteligente baseada nos dados disponíveis
 * Funciona mesmo com poucos dados históricos
 * @param {Array} historicalData - Dados históricos disponíveis
 * @returns {Object} Objeto com mensagens para cada métrica e visão geral
 */
export const generateSmartMessages = (historicalData) => {
  const messages = {
    activeStudents: '',
    churnRate: '',
    nps: '',
    general: '',
    studentLoss: null,
    churnClassification: null,
    trendAnalysis: null,
    analysisMonth: null,
    hasEnoughData: false // Indica se há dados suficientes para análise histórica
  };

  if (!historicalData || historicalData.length === 0) {
    messages.general = 'Sem dados suficientes para gerar mensagens inteligentes.';
    return messages;
  }

  // Encontrar o último mês que tem dados reais (não zeros)
  const monthsWithRealData = historicalData.filter(month =>
    month.activeStudents > 0 || month.churnRate > 0
  );

  if (monthsWithRealData.length === 0) {
    messages.general = 'Aguardando primeiros dados para gerar mensagens inteligentes.';
    return messages;
  }

  // Usar o último mês com dados reais como "atual"
  const currentMonthData = monthsWithRealData[monthsWithRealData.length - 1];
  const previousMonthData = monthsWithRealData.length > 1 ?
    monthsWithRealData[monthsWithRealData.length - 2] : null;

  messages.analysisMonth = currentMonthData;
  messages.hasEnoughData = monthsWithRealData.length >= 2;

  const currentMetrics = {
    activeStudents: currentMonthData.activeStudents,
    churnRate: currentMonthData.churnRate,
    nps: currentMonthData.avgNPS
  };

  const previousMetrics = previousMonthData ? {
    activeStudents: previousMonthData.activeStudents,
    churnRate: previousMonthData.churnRate,
    nps: previousMonthData.avgNPS
  } : null;

  // Análise básica (mês atual vs anterior, se disponível)
  if (messages.hasEnoughData && previousMonthData) {
    // Análise de tendência simples com os dados reais disponíveis
    const realDataForTrend = monthsWithRealData.slice(-Math.min(6, monthsWithRealData.length));
    const activeStudentsTrend = analyzeTrend(realDataForTrend, 'activeStudents');
    const churnTrend = analyzeTrend(realDataForTrend, 'churnRate');
    const npsTrend = analyzeTrend(realDataForTrend, 'avgNPS');

    messages.trendAnalysis = {
      activeStudents: activeStudentsTrend,
      churn: churnTrend,
      nps: npsTrend
    };

    // Calcular informações sobre alunos perdidos
    if (currentMetrics.activeStudents !== undefined && previousMetrics.activeStudents !== undefined) {
      messages.studentLoss = calculateStudentLoss(currentMetrics.activeStudents, previousMetrics.activeStudents);
    }
  }

  // Classificar churn atual
  if (currentMetrics.churnRate !== undefined) {
    messages.churnClassification = classifyChurnRate(currentMetrics.churnRate);
  }

  // Gerar mensagens básicas
  messages.activeStudents = generateBasicMessage('activeStudents', currentMetrics.activeStudents, previousMetrics?.activeStudents, messages);
  messages.churnRate = generateBasicMessage('churnRate', currentMetrics.churnRate, previousMetrics?.churnRate, messages);
  messages.nps = generateBasicMessage('nps', currentMetrics.nps, previousMetrics?.nps, messages);

  // Mensagem geral
  messages.general = generateGeneralMessage(currentMetrics, previousMetrics, messages);

  return messages;
};

/**
 * Gera mensagem básica para uma métrica específica
 * @param {string} metricType - Tipo da métrica
 * @param {number} currentValue - Valor atual
 * @param {number} previousValue - Valor anterior (pode ser null)
 * @param {Object} context - Contexto com informações adicionais
 * @returns {string} Mensagem gerada
 */
const generateBasicMessage = (metricType, currentValue, previousValue, context) => {
  if (currentValue === undefined || currentValue === null) {
    return `Sem dados disponíveis para ${getMetricLabel(metricType)}.`;
  }

  let baseMessage = '';

  // Análise mensal se houver dados anteriores
  if (previousValue !== undefined && previousValue !== null) {
    const variation = getVariationType(currentValue, previousValue);

    switch (metricType) {
      case 'activeStudents':
        baseMessage = getRandomMessage(DASHBOARD_MESSAGES.activeStudents[variation]);
        if (context.studentLoss && context.studentLoss.isDecrease) {
          baseMessage += ` Perdemos ${context.studentLoss.lossCount} aluno${context.studentLoss.lossCount !== 1 ? 's' : ''} em relação ao mês anterior.`;
        } else if (context.studentLoss && context.studentLoss.isIncrease) {
          baseMessage += ` Ganhamos ${Math.abs(context.studentLoss.difference)} aluno${Math.abs(context.studentLoss.difference) !== 1 ? 's' : ''} em relação ao mês anterior!`;
        }
        break;

      case 'churnRate':
        const churnType = variation === 'decrease' ? 'decrease' : variation === 'increase' ? 'increase' : 'stable';
        baseMessage = getRandomMessage(DASHBOARD_MESSAGES.churnRate[churnType]);
        baseMessage += ` Taxa atual: ${currentValue.toFixed(1)}% (${context.churnClassification?.label}).`;
        break;

      case 'nps':
        baseMessage = getRandomMessage(DASHBOARD_MESSAGES.nps[variation]);
        break;
    }

    // Adicionar análise de tendência se disponível
    if (context.trendAnalysis && context.trendAnalysis[metricType] && context.trendAnalysis[metricType].trend !== 'insufficient_data') {
      const trend = context.trendAnalysis[metricType];
      const periodText = context.hasEnoughData ? 'nos últimos meses' : 'com os dados disponíveis';

      if (trend.direction === 'increasing') {
        baseMessage += ` ${periodText.charAt(0).toUpperCase() + periodText.slice(1)}, observamos uma tendência positiva.`;
      } else if (trend.direction === 'decreasing') {
        baseMessage += ` ${periodText.charAt(0).toUpperCase() + periodText.slice(1)}, observamos uma tendência negativa.`;
      }
    }

  } else {
    // Apenas valor atual sem comparação
    switch (metricType) {
      case 'activeStudents':
        baseMessage = `Atualmente temos ${currentValue} alunos ativos matriculados.`;
        break;
      case 'churnRate':
        baseMessage = `Taxa de churn atual: ${currentValue.toFixed(1)}% (${context.churnClassification?.label}).`;
        break;
      case 'nps':
        baseMessage = `NPS atual: ${currentValue.toFixed(1)} pontos.`;
        break;
    }
  }

  return baseMessage;
};

/**
 * Gera mensagem geral baseada em todas as métricas
 * @param {Object} currentMetrics - Métricas atuais
 * @param {Object} previousMetrics - Métricas anteriores
 * @param {Object} context - Contexto completo
 * @returns {string} Mensagem geral
 */
const generateGeneralMessage = (currentMetrics, previousMetrics, context) => {
  const hasHistoricalData = previousMetrics !== null;
  const monthName = context.analysisMonth?.month || 'Mês atual';
  const year = context.analysisMonth?.year || new Date().getFullYear();

  if (!hasHistoricalData) {
    return `Análise baseada nos dados atuais de ${monthName}/${year}. Adicione mais dados históricos para insights mais detalhados.`;
  }

  // Análise geral baseada na variação das métricas
  const variations = [];
  if (currentMetrics.activeStudents !== undefined && previousMetrics.activeStudents !== undefined) {
    variations.push(getVariationType(currentMetrics.activeStudents, previousMetrics.activeStudents));
  }
  if (currentMetrics.churnRate !== undefined && previousMetrics.churnRate !== undefined) {
    // Para churn, diminuição é positiva
    const churnVar = getVariationType(currentMetrics.churnRate, previousMetrics.churnRate);
    variations.push(churnVar === 'decrease' ? 'positive' : churnVar === 'increase' ? 'negative' : 'stable');
  }
  if (currentMetrics.nps !== undefined && previousMetrics.nps !== undefined) {
    variations.push(getVariationType(currentMetrics.nps, previousMetrics.nps));
  }

  const positiveChanges = variations.filter(v => v === 'increase' || v === 'positive').length;
  const negativeChanges = variations.filter(v => v === 'decrease' || v === 'negative').length;

  let generalMessage = '';
  if (positiveChanges > negativeChanges) {
    generalMessage = getRandomMessage(DASHBOARD_MESSAGES.general.excellent);
  } else if (negativeChanges > positiveChanges) {
    generalMessage = getRandomMessage(DASHBOARD_MESSAGES.general.concerning);
  } else {
    generalMessage = getRandomMessage(DASHBOARD_MESSAGES.general.mixed);
  }

  generalMessage += ` (Análise baseada nos dados de ${monthName}/${year})`;

  return generalMessage;
};

/**
 * Retorna o rótulo amigável para uma métrica
 * @param {string} metricType - Tipo da métrica
 * @returns {string} Rótulo da métrica
 */
const getMetricLabel = (metricType) => {
  switch (metricType) {
    case 'activeStudents': return 'alunos ativos';
    case 'churnRate': return 'taxa de churn';
    case 'nps': return 'NPS';
    default: return metricType;
  }
};

/**
 * Classifica a taxa de churn em categorias progressivas
 * @param {number} churnRate - Taxa de churn em porcentagem
 * @returns {Object} Objeto com classificação e descrição
 */
export const classifyChurnRate = (churnRate) => {
  if (churnRate <= 5) {
    return { level: 'excellent', label: 'Excelente', description: 'Taxa excepcional!' };
  } else if (churnRate <= 7) {
    return { level: 'good', label: 'Bom', description: 'Taxa dentro do esperado' };
  } else if (churnRate <= 10) {
    return { level: 'moderate', label: 'Moderado', description: 'Atenção necessária' };
  } else if (churnRate <= 12) {
    return { level: 'concerning', label: 'Preocupante', description: 'Alto índice de evasão' };
  } else if (churnRate <= 15) {
    return { level: 'high', label: 'Alto', description: 'Índice crítico de evasão' };
  } else if (churnRate <= 20) {
    return { level: 'very_high', label: 'Muito Alto', description: 'Situação crítica!' };
  } else {
    return { level: 'critical', label: 'Crítico', description: 'Intervenção imediata necessária!' };
  }
};

/**
 * Retorna uma mensagem aleatória de um array
 * @param {Array} messages - Array de mensagens
 * @returns {string} Mensagem aleatória ou string vazia se array vazio
 */
const getRandomMessage = (messages) => {
  if (!messages || messages.length === 0) return '';
  return messages[Math.floor(Math.random() * messages.length)];
};

/**
 * Determina o tipo de variação entre dois valores
 * @param {number} currentValue - Valor atual
 * @param {number} previousValue - Valor anterior
 * @returns {string} 'increase', 'decrease', ou 'stable'
 */
const getVariationType = (currentValue, previousValue) => {
  if (currentValue > previousValue) return 'increase';
  if (currentValue < previousValue) return 'decrease';
  return 'stable';
};

/**
 * Analisa tendência em uma série de dados
 * @param {Array} data - Array de objetos de dados históricos
 * @param {string} key - Chave do valor a ser analisado
 * @returns {Object} Objeto com análise de tendência
 */
const analyzeTrend = (data, key) => {
  if (!data || data.length < 2) {
    return { trend: 'insufficient_data', direction: null };
  }

  // Filtrar dados válidos
  const validData = data.filter(item => item[key] !== undefined && item[key] !== null);

  if (validData.length < 2) {
    return { trend: 'insufficient_data', direction: null };
  }

  // Dividir em primeira e segunda metade
  const midPoint = Math.floor(validData.length / 2);
  const firstHalf = validData.slice(0, midPoint);
  const secondHalf = validData.slice(midPoint);

  // Calcular médias
  const firstAvg = firstHalf.reduce((sum, item) => sum + item[key], 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((sum, item) => sum + item[key], 0) / secondHalf.length;

  // Determinar direção
  let direction = 'stable';
  if (secondAvg > firstAvg * 1.05) { // 5% de margem para considerar aumento
    direction = 'increasing';
  } else if (secondAvg < firstAvg * 0.95) { // 5% de margem para considerar diminuição
    direction = 'decreasing';
  }

  return {
    trend: 'analyzed',
    direction,
    firstHalfAvg: firstAvg,
    secondHalfAvg: secondAvg,
    dataPoints: validData.length
  };
};

/**
 * Calcula perda/ganho de alunos entre dois meses
 * @param {number} currentStudents - Alunos atuais
 * @param {number} previousStudents - Alunos do mês anterior
 * @returns {Object} Objeto com informações sobre perda/ganho de alunos
 */
const calculateStudentLoss = (currentStudents, previousStudents) => {
  const difference = currentStudents - previousStudents;
  const isIncrease = difference > 0;
  const isDecrease = difference < 0;

  return {
    difference,
    isIncrease,
    isDecrease,
    lossCount: Math.abs(difference)
  };
};
export const calculateGrowthPlan = (currentStudents, targetStudents = 350, monthsAhead = 8, maxChurnRate = 7) => {
  const totalGrowthNeeded = targetStudents - currentStudents; // 350 - 180 = 170
  const avgChurnRate = maxChurnRate / 100; // 0.07

  // Cada mês: Novos alunos - (Alunos atuais * churn) = Crescimento mensal necessário
  // Para chegar ao total necessário, precisamos resolver:
  // Novos alunos = Crescimento mensal + (Alunos atuais * churn)

  const monthlyPlans = [];
  let projectedStudents = currentStudents;

  for (let month = 1; month <= monthsAhead; month++) {
    // Ajustar churn gradualmente (começar mais alto e reduzir)
    const currentChurnRate = Math.max(5.5, maxChurnRate - (month * 0.2)); // Reduz de 7% para 5.5%
    const churnRate = currentChurnRate / 100;

    // Calcular quantos alunos precisamos adicionar este mês
    // Considerando que alguns serão perdidos por churn
    const remainingGrowth = targetStudents - projectedStudents;
    const growthNeededThisMonth = remainingGrowth / (monthsAhead - month + 1);

    // Novos alunos = crescimento necessário + alunos que serão perdidos por churn
    const churnLoss = Math.round(projectedStudents * churnRate);
    const newStudentsNeeded = Math.round(growthNeededThisMonth + churnLoss);

    // Aplicar o crescimento
    const newProjectedStudents = projectedStudents + newStudentsNeeded - churnLoss;

    monthlyPlans.push({
      month,
      studentsStart: Math.round(projectedStudents),
      newStudents: newStudentsNeeded,
      churnRate: currentChurnRate,
      churnLoss: churnLoss,
      studentsEnd: Math.round(newProjectedStudents),
      growthAchieved: Math.round(newProjectedStudents - projectedStudents)
    });

    projectedStudents = newProjectedStudents;
  }

  return {
    initialStudents: currentStudents,
    targetStudents,
    totalMonths: monthsAhead,
    totalGrowthNeeded,
    monthlyPlans,
    finalProjection: Math.round(projectedStudents),
    success: Math.abs(projectedStudents - targetStudents) <= 5 // Margem de erro de 5 alunos
  };
};
