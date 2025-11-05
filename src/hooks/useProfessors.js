import { useState, useEffect } from 'react';
import { useSupabase } from '../contexts/SupabaseContext';

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
