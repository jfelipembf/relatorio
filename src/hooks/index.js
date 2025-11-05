import { useState, useEffect } from 'react';
import { useSupabase } from '../contexts/SupabaseContext';
import { useToast } from '../contexts/ToastContext';

// Hook para operações de dashboard
export const useDashboard = () => {
  const { dashboardMetrics } = useSupabase();
  const { showSuccess, showError } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState([]);

  const loadHistoricalData = async (selectedMonth, selectedYear) => {
    // Evitar carregamento se já temos dados e não mudou o período
    if (data.length > 0 && selectedMonth && selectedYear) {
      return;
    }

    setIsLoading(true);
    try {
      const historicalData = await dashboardMetrics.getHistoricalData(selectedMonth, selectedYear);
      setData(historicalData);
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
      showError('Erro ao carregar dados do dashboard');
    }
    setIsLoading(false);
  };

  const saveMetrics = async (month, year, activeStudents, churnRate) => {
    try {
      await dashboardMetrics.save(month, year, activeStudents, churnRate);
      showSuccess('Métricas salvas com sucesso!');
      // Recarregar dados após salvar
      await loadHistoricalData(month, year);
    } catch (error) {
      console.error('Erro ao salvar métricas:', error);
      showError('Erro ao salvar métricas');
    }
  };

  const loadMetrics = async (month, year) => {
    try {
      const metrics = await dashboardMetrics.getByMonthYear(month, year);
      return metrics;
    } catch (error) {
      console.error('Erro ao carregar métricas:', error);
      return null;
    }
  };

  return {
    data,
    isLoading,
    loadHistoricalData,
    saveMetrics,
    loadMetrics
  };
};

// Hook para operações de professores
export const useProfessors = () => {
  const { professors } = useSupabase();
  const [professorsList, setProfessorsList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadProfessors = async () => {
    setIsLoading(true);
    try {
      const data = await professors.getAll();
      setProfessorsList(data);
    } catch (error) {
      console.error('Erro ao carregar professores:', error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadProfessors();
  }, []);

  return {
    professors: professorsList,
    isLoading,
    refetch: loadProfessors
  };
};

// Hook para operações de performance
export const usePerformance = (professorId, month, year) => {
  const { performance } = useSupabase();
  const { showSuccess, showError } = useToast();
  const [data, setData] = useState(null);
  const [yearlyData, setYearlyData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const loadData = async () => {
    if (!professorId) return;

    setIsLoading(true);
    try {
      const [performanceData, yearlyPerformanceData] = await Promise.all([
        performance.getByProfessor(professorId, month, year),
        performance.getYearlyData(professorId, year)
      ]);

      setData(performanceData);
      setYearlyData(yearlyPerformanceData);
    } catch (error) {
      console.error('Erro ao carregar dados de performance:', error);
    }
    setIsLoading(false);
  };

  const saveData = async (payload) => {
    setIsSaving(true);
    try {
      await performance.save(professorId, month, year, payload);
      showSuccess('Dados de desempenho salvos com sucesso!');
      await loadData(); // Recarregar dados
    } catch (error) {
      console.error('Erro ao salvar desempenho:', error);
      showError('Erro ao salvar dados de desempenho');
    }
    setIsSaving(false);
  };

  useEffect(() => {
    loadData();
  }, [professorId, month, year]);

  return {
    data,
    yearlyData,
    isLoading,
    isSaving,
    saveData,
    refetch: loadData
  };
};

// Hook para operações de avaliação
export const useEvaluation = (professorId, month, year) => {
  const { evaluations } = useSupabase();
  const { showSuccess, showError } = useToast();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const loadData = async () => {
    if (!professorId) return;

    setIsLoading(true);
    try {
      const evaluationData = await evaluations.getByProfessor(professorId, month, year);
      setData(evaluationData);
    } catch (error) {
      console.error('Erro ao carregar avaliação:', error);
    }
    setIsLoading(false);
  };

  const saveData = async (payload) => {
    setIsSaving(true);
    try {
      await evaluations.save(professorId, month, year, payload);
      showSuccess('Avaliação salva com sucesso!');
      await loadData(); // Recarregar dados
    } catch (error) {
      console.error('Erro ao salvar avaliação:', error);
      showError('Erro ao salvar avaliação');
    }
    setIsSaving(false);
  };

  useEffect(() => {
    loadData();
  }, [professorId, month, year]);

  return {
    data,
    isLoading,
    isSaving,
    saveData,
    refetch: loadData
  };
};

// Hook para operações de ranking
export const useRanking = (month, year) => {
  const { rankings } = useSupabase();
  const [monthlyRanking, setMonthlyRanking] = useState([]);
  const [overallRanking, setOverallRanking] = useState([]);
  const [isMonthlyLoading, setIsMonthlyLoading] = useState(false);
  const [isOverallLoading, setIsOverallLoading] = useState(false);

  const loadMonthlyRanking = async () => {
    setIsMonthlyLoading(true);
    try {
      const data = await rankings.getMonthly(month, year);
      setMonthlyRanking(data);
    } catch (error) {
      console.error('Erro ao carregar ranking mensal:', error);
    }
    setIsMonthlyLoading(false);
  };

  const loadOverallRanking = async () => {
    setIsOverallLoading(true);
    try {
      const data = await rankings.getOverall();
      setOverallRanking(data);
    } catch (error) {
      console.error('Erro ao carregar ranking geral:', error);
    }
    setIsOverallLoading(false);
  };

  useEffect(() => {
    if (month && year) {
      loadMonthlyRanking();
    }
  }, [month, year]);

  useEffect(() => {
    loadOverallRanking();
  }, []);

  return {
    monthlyRanking,
    overallRanking,
    isMonthlyLoading,
    isOverallLoading,
    refetchMonthly: loadMonthlyRanking,
    refetchOverall: loadOverallRanking
  };
};
