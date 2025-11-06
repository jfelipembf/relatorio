import { createContext, useContext } from 'react';
import { supabase } from '../lib/supabaseClient';
import { calculateDashboardMetrics } from '../lib/dashboardCalculations';
import { calculateMonthlyRanking, calculateOverallRanking } from '../lib/rankingCalculations';


const SupabaseContext = createContext();

export const useSupabase = () => {
  const context = useContext(SupabaseContext);
  if (!context) {
    throw new Error('useSupabase must be used within a SupabaseProvider');
  }
  return context;
};

export const SupabaseProvider = ({ children }) => {
  // Dashboard Metrics Operations
  const dashboardMetrics = {
    // Buscar métricas do mês/ano específico
    getByMonthYear: async (month, year) => {
      const { data, error } = await supabase
        .from('dashboard_metrics')
        .select('*')
        .eq('month', month)
        .eq('year', year)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data;
    },

    // Salvar métricas (insert ou update)
    save: async (month, year, activeStudents, churnRate) => {
      const data = {
        month,
        year,
        active_students: activeStudents,
        conversion_rate: churnRate
      };

      // Verificar se já existe
      const existing = await dashboardMetrics.getByMonthYear(month, year);

      if (existing) {
        // Update
        const { data: result, error } = await supabase
          .from('dashboard_metrics')
          .update(data)
          .eq('month', month)
          .eq('year', year)
          .select()
          .single();

        if (error) throw error;
        return result;
      } else {
        // Insert
        const { data: result, error } = await supabase
          .from('dashboard_metrics')
          .insert(data)
          .select()
          .single();

        if (error) throw error;
        return result;
      }
    },

    // Buscar dados históricos para gráficos
    getHistoricalData: async (selectedMonth, selectedYear) => {
      const [performanceResponse, evaluationResponse, professorsResponse, dashboardResponse] = await Promise.all([
        supabase.from('professor_performance').select('*'),
        supabase.from('professor_evaluations').select('*'),
        supabase.from('professors').select('*'),
        supabase.from('dashboard_metrics').select('*')
      ]);

      const performanceData = performanceResponse.data || [];
      const evaluationData = evaluationResponse.data || [];
      const dashboardData = dashboardResponse.data || [];

      return calculateDashboardMetrics(
        performanceData,
        evaluationData,
        dashboardData,
        selectedMonth,
        selectedYear
      );
    }
  };

  // Professors Operations
  const professors = {
    getAll: async () => {
      const { data, error } = await supabase
        .from('professors')
        .select('*')
        .order('first_name', { ascending: true });

      if (error) throw error;
      return data;
    },

    create: async (firstName, lastName) => {
      const { data, error } = await supabase
        .from('professors')
        .insert({
          first_name: firstName,
          last_name: lastName
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  };

  // Performance Operations
  const performance = {
    getByProfessor: async (professorId, month, year) => {
      const { data, error } = await supabase
        .from('professor_performance')
        .select('*')
        .eq('professor_id', professorId)
        .eq('month', month)
        .eq('year', year)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },

    save: async (professorId, month, year, data) => {
      const performanceData = {
        professor_id: professorId,
        month,
        year,
        ...data
      };

      const { data: result, error } = await supabase
        .from('professor_performance')
        .upsert(performanceData)
        .select()
        .single();

      if (error) throw error;
      return result;
    },

    getYearlyData: async (professorId, year) => {
      const { data, error } = await supabase
        .from('professor_performance')
        .select('*')
        .eq('professor_id', professorId)
        .eq('year', year)
        .order('month');

      if (error) throw error;
      return data;
    }
  };

  // Evaluation Operations
  const evaluations = {
    getByProfessor: async (professorId, month, year) => {
      const { data, error } = await supabase
        .from('professor_evaluations')
        .select('*')
        .eq('professor_id', professorId)
        .eq('month', month)
        .eq('year', year)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },

    save: async (professorId, month, year, data) => {
      const evaluationData = {
        professor_id: professorId,
        month,
        year,
        ...data
      };

      const { data: result, error } = await supabase
        .from('professor_evaluations')
        .upsert(evaluationData)
        .select()
        .single();

      if (error) throw error;
      return result;
    }
  };

  // Ranking Operations
  const rankings = {
    getMonthly: async (month, year) => {
      const [performanceResponse, evaluationResponse, professorsResponse] = await Promise.all([
        supabase.from('professor_performance').select('*').eq('month', month).eq('year', year),
        supabase.from('professor_evaluations').select('*').eq('month', month).eq('year', year),
        supabase.from('professors').select('*')
      ]);

      const performanceData = performanceResponse.data || [];
      const evaluationData = evaluationResponse.data || [];
      const professors = professorsResponse.data || [];

      return calculateMonthlyRanking(professors, performanceData, evaluationData);
    },

    getOverall: async () => {
      const [performanceResponse, evaluationResponse, professorsResponse] = await Promise.all([
        supabase.from('professor_performance').select('*'),
        supabase.from('professor_evaluations').select('*'),
        supabase.from('professors').select('*')
      ]);

      const performanceData = performanceResponse.data || [];
      const evaluationData = evaluationResponse.data || [];
      const professors = professorsResponse.data || [];

      return calculateOverallRanking(professors, performanceData, evaluationData);
    }
  };

  const value = {
    dashboardMetrics,
    professors,
    performance,
    evaluations,
    rankings
  };

  return (
    <SupabaseContext.Provider value={value}>
      {children}
    </SupabaseContext.Provider>
  );
};
