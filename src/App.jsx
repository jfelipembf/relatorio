import { useEffect, useMemo, useState } from 'react';
import { supabase } from './lib/supabaseClient';
import { MONTHS } from './lib/constants';
import {
  calculateConversionRate,
  calculateRenewalRate,
  calculateOverallEvaluationScore,
  calculateOverallScore,
  normalizeRateToScore
} from './lib/calculations';
import './styles/app.css';
import SidebarSelectors from './components/SidebarSelectors.jsx';
import PerformanceTab from './components/PerformanceTab.jsx';
import EvaluationTab from './components/EvaluationTab.jsx';
import RankingTab from './components/RankingTab.jsx';
import ReportTab from './components/ReportTab.jsx';
import Header from './components/Header.jsx';

const currentDate = new Date();
const initialMonth = MONTHS[currentDate.getMonth()];
const initialYear = currentDate.getFullYear();

const TABS = [
  { id: 'performance', label: 'Desempenho' },
  { id: 'evaluation', label: 'Avaliação de Critérios' },
  { id: 'ranking', label: 'Ranking' },
  { id: 'report', label: 'Relatório' }
];

export default function App() {
  const [professors, setProfessors] = useState([]);
  const [selectedProfessorId, setSelectedProfessorId] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(initialMonth);
  const [selectedYear, setSelectedYear] = useState(initialYear);
  const [activeTab, setActiveTab] = useState('performance');

  const [performanceData, setPerformanceData] = useState(null);
  const [yearlyPerformanceData, setYearlyPerformanceData] = useState([]);
  const [evaluationData, setEvaluationData] = useState(null);

  const [monthlyRanking, setMonthlyRanking] = useState([]);
  const [overallRanking, setOverallRanking] = useState([]);

  const [isLoading, setIsLoading] = useState(false);
  const [isSavingPerformance, setIsSavingPerformance] = useState(false);
  const [isSavingEvaluation, setIsSavingEvaluation] = useState(false);
  const [isMonthlyRankingLoading, setIsMonthlyRankingLoading] = useState(false);
  const [isOverallRankingLoading, setIsOverallRankingLoading] = useState(false);

  const selectedProfessor = useMemo(
    () => professors.find((professor) => professor.id === selectedProfessorId) ?? null,
    [professors, selectedProfessorId]
  );

  const fetchProfessors = async () => {
    const { data, error } = await supabase
      .from('professors')
      .select('*')
      .order('first_name', { ascending: true });

    if (error) {
      console.error('Erro ao carregar professores', error);
      return;
    }
    setProfessors(data);
    if (!selectedProfessorId && data.length) {
      setSelectedProfessorId(data[0].id);
    }
  };

  const fetchPerformance = async () => {
    if (!selectedProfessorId) return;
    setIsLoading(true);

    const { data: monthData, error: monthError } = await supabase
      .from('professor_performance')
      .select('*')
      .eq('professor_id', selectedProfessorId)
      .eq('month', selectedMonth)
      .eq('year', selectedYear)
      .maybeSingle();

    if (monthError && monthError.code !== 'PGRST116') {
      console.error('Erro ao carregar desempenho mensal', monthError);
    } else {
      setPerformanceData(monthData);
    }

    const { data: yearData, error: yearError } = await supabase
      .from('professor_performance')
      .select('*')
      .eq('professor_id', selectedProfessorId)
      .eq('year', selectedYear);

    if (yearError) {
      console.error('Erro ao carregar histórico anual', yearError);
      setYearlyPerformanceData([]);
    } else {
      setYearlyPerformanceData(yearData ?? []);
    }

    setIsLoading(false);
  };

  const fetchEvaluation = async () => {
    if (!selectedProfessorId) return;
    setIsLoading(true);

    const { data, error } = await supabase
      .from('professor_evaluations')
      .select('*')
      .eq('professor_id', selectedProfessorId)
      .eq('month', selectedMonth)
      .eq('year', selectedYear)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      console.error('Erro ao carregar avaliação', error);
      setEvaluationData(null);
    } else {
      setEvaluationData(data);
    }

    setIsLoading(false);
  };

  const fetchMonthlyRanking = async () => {
    setIsMonthlyRankingLoading(true);

    const [performanceResponse, evaluationResponse] = await Promise.all([
      supabase
        .from('professor_performance')
        .select('*')
        .eq('month', selectedMonth)
        .eq('year', selectedYear),
      supabase
        .from('professor_evaluations')
        .select('*')
        .eq('month', selectedMonth)
        .eq('year', selectedYear)
    ]);

    if (performanceResponse.error) {
      console.error('Erro ao carregar ranking (desempenho)', performanceResponse.error);
    }
    if (evaluationResponse.error) {
      console.error('Erro ao carregar ranking (avaliação)', evaluationResponse.error);
    }

    const performanceByProfessor = new Map(
      (performanceResponse.data ?? []).map((item) => [item.professor_id, item])
    );
    const evaluationByProfessor = new Map(
      (evaluationResponse.data ?? []).map((item) => [item.professor_id, item])
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
        overallScore
      };
    });

    rows.sort((a, b) => (b.overallScore ?? -1) - (a.overallScore ?? -1));
    setMonthlyRanking(rows);
    setIsMonthlyRankingLoading(false);
  };

  const fetchOverallRanking = async () => {
    setIsOverallRankingLoading(true);

    const [performanceResponse, evaluationResponse] = await Promise.all([
      supabase.from('professor_performance').select('*'),
      supabase.from('professor_evaluations').select('*')
    ]);

    if (performanceResponse.error) {
      console.error('Erro ao carregar ranking geral (desempenho)', performanceResponse.error);
    }
    if (evaluationResponse.error) {
      console.error('Erro ao carregar ranking geral (avaliação)', evaluationResponse.error);
    }

    const performanceGrouped = new Map();
    (performanceResponse.data ?? []).forEach((record) => {
      const list = performanceGrouped.get(record.professor_id) ?? [];
      list.push(record);
      performanceGrouped.set(record.professor_id, list);
    });

    const evaluationGrouped = new Map();
    (evaluationResponse.data ?? []).forEach((record) => {
      const list = evaluationGrouped.get(record.professor_id) ?? [];
      list.push(record);
      evaluationGrouped.set(record.professor_id, list);
    });

    const rows = professors.map((professor) => {
      const perfRecords = performanceGrouped.get(professor.id) ?? [];
      const evalRecords = evaluationGrouped.get(professor.id) ?? [];

      const perfScores = perfRecords.map((record) => {
        const conversionRate = record.conversion_rate ?? calculateConversionRate(
          record.experimental_classes ?? 0,
          record.conversions ?? 0
        );
        const renewalRate = record.renewal_rate ?? calculateRenewalRate(
          record.students_to_renew ?? 0,
          record.renewals ?? 0
        );
        return normalizeRateToScore(conversionRate, renewalRate);
      });

      const performanceScore = perfScores.length
        ? perfScores.reduce((acc, curr) => acc + curr, 0) / perfScores.length
        : null;

      const evalScores = evalRecords
        .map((record) => calculateOverallEvaluationScore(record))
        .filter((value) => value != null);

      const evaluationScore = evalScores.length
        ? evalScores.reduce((acc, curr) => acc + curr, 0) / evalScores.length
        : null;

      const overallScore = calculateOverallScore(performanceScore, evaluationScore);

      return {
        professorId: professor.id,
        name: `${professor.first_name} ${professor.last_name}`,
        performanceScore,
        evaluationScore,
        overallScore
      };
    });

    rows.sort((a, b) => (b.overallScore ?? -1) - (a.overallScore ?? -1));
    setOverallRanking(rows);
    setIsOverallRankingLoading(false);
  };

  const handleSavePerformance = async (payload) => {
    if (!selectedProfessorId) return;
    setIsSavingPerformance(true);
    const data = {
      ...payload,
      professor_id: selectedProfessorId
    };
    const response = await supabase.from('professor_performance').upsert(data);
    if (response.error) {
      console.error('Erro ao salvar desempenho', response.error);
    } else {
      await fetchPerformance();
      await fetchMonthlyRanking();
      await fetchOverallRanking();
    }
    setIsSavingPerformance(false);
  };

  const handleSaveEvaluation = async (payload) => {
    if (!selectedProfessorId) return;
    setIsSavingEvaluation(true);
    const data = {
      professor_id: selectedProfessorId,
      ...payload
    };
    const response = await supabase.from('professor_evaluations').upsert(data);
    if (response.error) {
      console.error('Erro ao salvar avaliação', response.error);
    } else {
      await fetchEvaluation();
      await fetchMonthlyRanking();
      await fetchOverallRanking();
    }
    setIsSavingEvaluation(false);
  };

  useEffect(() => {
    fetchProfessors();
  }, []);

  useEffect(() => {
    if (!selectedProfessorId) return;
    fetchPerformance();
    fetchEvaluation();
  }, [selectedProfessorId, selectedMonth, selectedYear]);

  useEffect(() => {
    if (!professors.length) return;
    fetchMonthlyRanking();
    fetchOverallRanking();
  }, [professors, selectedMonth, selectedYear]);

  return (
    <>
      <Header />
      <main>
      <SidebarSelectors
        professors={professors}
        selectedProfessorId={selectedProfessorId}
        onProfessorChange={setSelectedProfessorId}
        selectedYear={selectedYear}
        onYearChange={setSelectedYear}
        selectedMonth={selectedMonth}
        onMonthChange={setSelectedMonth}
      />

      <div className="content">
        <nav className="tabs">
          {TABS.map((tab) => (
            <button
              key={`${tab.id}-${activeTab === tab.id ? 'active' : 'inactive'}`}
              type="button"
              className={activeTab === tab.id ? 'active' : ''}
              onClick={(event) => {
                event.preventDefault();
                setActiveTab(tab.id);
              }}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {isLoading && !selectedProfessor ? (
          <p>Carregando dados...</p>
        ) : (
          <>
            {activeTab === 'performance' && (
              <PerformanceTab
                selectedMonth={selectedMonth}
                selectedYear={selectedYear}
                initialData={performanceData}
                yearlyData={yearlyPerformanceData}
                onSave={handleSavePerformance}
                isSaving={isSavingPerformance}
              />
            )}

            {activeTab === 'evaluation' && (
              <EvaluationTab
                evaluationData={evaluationData}
                selectedMonth={selectedMonth}
                selectedYear={selectedYear}
                onSave={handleSaveEvaluation}
                isSaving={isSavingEvaluation}
              />
            )}

            {activeTab === 'ranking' && (
              <RankingTab
                selectedMonth={selectedMonth}
                selectedYear={selectedYear}
                monthlyRanking={monthlyRanking}
                overallRanking={overallRanking}
                isMonthlyLoading={isMonthlyRankingLoading}
                isOverallLoading={isOverallRankingLoading}
              />
            )}

            {activeTab === 'report' && (
              <ReportTab
                professor={selectedProfessor}
                selectedMonth={selectedMonth}
                selectedYear={selectedYear}
                performanceData={performanceData}
                evaluationData={evaluationData}
                overallRanking={overallRanking}
              />
            )}
          </>
        )}
      </div>
    </main>
    </>
  );
}
