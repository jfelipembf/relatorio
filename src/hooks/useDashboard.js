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
