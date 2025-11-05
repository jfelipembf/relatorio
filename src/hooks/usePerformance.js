import { useState, useEffect } from 'react';
import { useSupabase } from '../contexts/SupabaseContext';
import { useToast } from '../contexts/ToastContext';

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
