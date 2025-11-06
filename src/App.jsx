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
import { useToast } from './contexts/ToastContext';
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
  { id: 'evaluation', label: 'Critérios de Avaliação' },
  { id: 'ranking', label: 'Ranking' },
  { id: 'report', label: 'Relatório' }
];

export default function App() {
  // Estados locais para dashboard metrics
  const [activeStudents, setActiveStudents] = useState(0);
  const [churnRate, setChurnRate] = useState(0);
  const [isSavingMetrics, setIsSavingMetrics] = useState(false);
  const [isEditingMetrics, setIsEditingMetrics] = useState(false);
  const [isCreatingProfessor, setIsCreatingProfessor] = useState(false);

  // Toast notifications
  const { showSuccess, showError } = useToast();

  // Estados de navegação
  const [selectedProfessorId, setSelectedProfessorId] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(MONTHS[new Date().getMonth()]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [activeTab, setActiveTab] = useState('dashboard');

  // Hooks customizados
  const { professors, createProfessor } = useProfessors();
  const dashboardHook = useDashboard();
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
      await dashboardHook.saveMetrics(selectedMonth, selectedYear, activeStudents, churnRate);
      showSuccess('Métricas salvas com sucesso!');
      setIsEditingMetrics(false); // Após salvar, não está mais editando
    } catch (error) {
      console.error('Erro ao salvar métricas:', error);
      showError('Erro ao salvar métricas. Tente novamente.');
    }
    setIsSavingMetrics(false);
  };

  const handleActiveStudentsChange = (value) => {
    setActiveStudents(value);
    setIsEditingMetrics(true);
  };

  const handleChurnRateChange = (value) => {
    setChurnRate(value);
    setIsEditingMetrics(true);
  };

  const handleCreateProfessor = async (firstName, lastName) => {
    setIsCreatingProfessor(true);
    try {
      await createProfessor(firstName, lastName);
      showSuccess(`Professor ${firstName} ${lastName} criado com sucesso!`);
    } catch (error) {
      console.error('Erro ao criar professor:', error);
      showError('Erro ao criar professor. Tente novamente.');
      throw error;
    }
    setIsCreatingProfessor(false);
  };

  // Carregar dados do dashboard quando necessário
  useEffect(() => {
    const loadMetrics = async () => {
      try {
        const metrics = await dashboardHook.loadMetrics(selectedMonth, selectedYear);

        // Só carrega dados se não estiver editando
        if (!isEditingMetrics) {
          if (metrics) {
            setActiveStudents(metrics.active_students || 0);
            setChurnRate(metrics.conversion_rate || 0);
          } else {
            setActiveStudents(0);
            setChurnRate(0);
          }
        }
      } catch (error) {
        console.error('Erro ao carregar métricas:', error);
      }
    };

    loadMetrics();
  }, [selectedMonth, selectedYear, dashboardHook]);

  // Carregar dados do dashboard apenas quando a aba dashboard for ativada pela primeira vez ou quando mudar mês/ano
  useEffect(() => {
    if (activeTab === 'dashboard' && dashboardHook.data.length === 0) {
      dashboardHook.loadHistoricalData(selectedMonth, selectedYear);
    }
  }, [activeTab, dashboardHook]);

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
          onActiveStudentsChange={handleActiveStudentsChange}
          onChurnRateChange={handleChurnRateChange}
          onSaveMetrics={handleSaveMetrics}
          isSavingMetrics={isSavingMetrics}
          onCreateProfessor={handleCreateProfessor}
          isCreatingProfessor={isCreatingProfessor}
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
                dashboardData={dashboardHook.data}
                isLoading={dashboardHook.isLoading}
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
