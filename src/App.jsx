import { useState, useEffect, useMemo } from 'react';
import { MONTHS } from './lib/constants';
import './styles/app.css';
import SidebarSelectors from './components/SidebarSelectors.jsx';
import PerformanceTab from './components/PerformanceTab.jsx';
import EvaluationTab from './components/EvaluationTab.jsx';
import RankingTab from './components/RankingTab.jsx';
import ReportTab from './components/ReportTab.jsx';
import DashboardTab from './components/DashboardTab.jsx';
import Header from './components/Header.jsx';
import ToastContainer from './components/ToastContainer.jsx';
import {
  useDashboard,
  useProfessors,
  usePerformance,
  useEvaluation,
  useRanking
} from './hooks';

const TABS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'performance', label: 'Desempenho' },
  { id: 'evaluation', label: 'Avaliação de Critérios' },
  { id: 'ranking', label: 'Ranking' },
  { id: 'report', label: 'Relatório' }
];

export default function App() {
  // Estados locais para dashboard metrics
  const [activeStudents, setActiveStudents] = useState(0);
  const [churnRate, setChurnRate] = useState(0);
  const [isSavingMetrics, setIsSavingMetrics] = useState(false);

  // Estados de navegação
  const [selectedProfessorId, setSelectedProfessorId] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(MONTHS[new Date().getMonth()]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [activeTab, setActiveTab] = useState('dashboard');

  // Hooks customizados
  const { professors } = useProfessors();
  const dashboard = useDashboard();
  const performance = usePerformance(selectedProfessorId, selectedMonth, selectedYear);
  const evaluation = useEvaluation(selectedProfessorId, selectedMonth, selectedYear);
  const ranking = useRanking(selectedMonth, selectedYear);

  // Estado derivado para professor selecionado
  const selectedProfessor = useMemo(
    () => professors.find((professor) => professor.id === selectedProfessorId) ?? null,
    [professors, selectedProfessorId]
  );

  // Funções simplificadas
  const handleSaveMetrics = async () => {
    setIsSavingMetrics(true);
    try {
      await dashboard.saveMetrics(selectedMonth, selectedYear, activeStudents, churnRate);
    } catch (error) {
      console.error('Erro ao salvar métricas:', error);
    }
    setIsSavingMetrics(false);
  };

  // Carregar dados do dashboard quando necessário
  useEffect(() => {
    const loadMetrics = async () => {
      const metrics = await dashboard.loadMetrics(selectedMonth, selectedYear);
      if (metrics) {
        setActiveStudents(metrics.active_students || 0);
        setChurnRate(metrics.conversion_rate || 0);
      } else {
        setActiveStudents(0);
        setChurnRate(0);
      }
    };
    loadMetrics();
  }, [selectedMonth, selectedYear, dashboard]);

  // Carregar dados do dashboard apenas quando a aba dashboard for ativada pela primeira vez ou quando mudar mês/ano
  useEffect(() => {
    if (activeTab === 'dashboard' && dashboard.data.length === 0) {
      dashboard.loadHistoricalData(selectedMonth, selectedYear);
    }
  }, [activeTab, dashboard]);

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
          activeStudents={activeStudents}
          churnRate={churnRate}
          onActiveStudentsChange={setActiveStudents}
          onChurnRateChange={setChurnRate}
          onSaveMetrics={handleSaveMetrics}
          isSavingMetrics={isSavingMetrics}
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

          <>
            {activeTab === 'dashboard' && (
              <DashboardTab
                selectedMonth={selectedMonth}
                selectedYear={selectedYear}
                dashboardData={dashboard.data}
                isLoading={dashboard.isLoading}
              />
            )}

            {activeTab === 'performance' && (
              <PerformanceTab
                selectedMonth={selectedMonth}
                selectedYear={selectedYear}
                initialData={performance.data}
                yearlyData={performance.yearlyData}
                onSave={performance.saveData}
                isSaving={performance.isSaving}
              />
            )}

            {activeTab === 'evaluation' && (
              <EvaluationTab
                evaluationData={evaluation.data}
                selectedMonth={selectedMonth}
                selectedYear={selectedYear}
                onSave={evaluation.saveData}
                isSaving={evaluation.isSaving}
              />
            )}

            {activeTab === 'ranking' && (
              <RankingTab
                selectedMonth={selectedMonth}
                selectedYear={selectedYear}
                monthlyRanking={ranking.monthlyRanking}
                overallRanking={ranking.overallRanking}
                isMonthlyLoading={ranking.isMonthlyLoading}
                isOverallLoading={ranking.isOverallLoading}
              />
            )}

            {activeTab === 'report' && (
              <ReportTab
                professor={selectedProfessor}
                selectedMonth={selectedMonth}
                selectedYear={selectedYear}
                performanceData={performance.data}
                evaluationData={evaluation.data}
                overallRanking={ranking.overallRanking}
              />
            )}
          </>
        </div>
      </main>
      <ToastContainer />
    </>
  );
}
