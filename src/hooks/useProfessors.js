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

  const createProfessor = async (firstName, lastName) => {
    try {
      await professors.create(firstName, lastName);
      await loadProfessors(); // Recarrega a lista após criar
    } catch (error) {
      console.error('Erro ao criar professor:', error);
      throw error;
    }
  };

  return {
    professors: professorsList,
    isLoading,
    refetch: loadProfessors,
    createProfessor
  };
};
