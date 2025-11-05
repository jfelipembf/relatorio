import { useState, useEffect } from 'react';
import { useSupabase } from '../contexts/SupabaseContext';
import { useToast } from '../contexts/ToastContext';

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
