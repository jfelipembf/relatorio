import { useState, useEffect } from 'react';
import { useSupabase } from '../contexts/SupabaseContext';

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
