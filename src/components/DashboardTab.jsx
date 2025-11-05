import { useEffect, useState, useMemo } from 'react';
import Plot from 'plotly.js-basic-dist';
import createPlotlyComponent from 'react-plotly.js/factory';
import { supabase } from '../lib/supabaseClient';
import { MONTHS } from '../lib/constants';

const Plotly = createPlotlyComponent(Plot);

export default function DashboardTab({ selectedMonth, selectedYear }) {
  const [dashboardData, setDashboardData] = useState(null);
  const [last12MonthsData, setLast12MonthsData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [activeStudents, setActiveStudents] = useState('');
  const [conversionRate, setConversionRate] = useState('');

  const fetchDashboardData = async () => {
    setIsLoading(true);

    try {
      // Buscar dados do mês atual
      const { data: currentMonthData, error: currentError } = await supabase
        .from('dashboard_metrics')
        .select('*')
        .eq('month', selectedMonth)
        .eq('year', selectedYear)
        .maybeSingle();

      if (currentError && currentError.code !== 'PGRST116') {
        console.error('Erro ao carregar dados do dashboard', currentError);
      } else {
        setDashboardData(currentMonthData);
        if (currentMonthData) {
          setActiveStudents(currentMonthData.active_students?.toString() || '');
          setConversionRate(currentMonthData.conversion_rate?.toString() || '');
        }
      }

      // Buscar dados dos professores para calcular médias
      const [performanceResponse, evaluationResponse, professorsResponse] = await Promise.all([
        supabase.from('professor_performance').select('*'),
        supabase.from('professor_evaluations').select('*'),
        supabase.from('professors').select('*')
      ]);

      const performanceData = performanceResponse.data || [];
      const evaluationData = evaluationResponse.data || [];
      const professorsData = professorsResponse.data || [];

      // Calcular métricas dos últimos 12 meses
      const currentDate = new Date(selectedYear, MONTHS.indexOf(selectedMonth));
      const last12Months = [];

      for (let i = 11; i >= 0; i--) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
        const monthName = MONTHS[date.getMonth()];
        const year = date.getFullYear();

        // Filtrar dados do mês
        const monthPerformance = performanceData.filter(p => p.month === monthName && p.year === year);
        const monthEvaluations = evaluationData.filter(e => e.month === monthName && e.year === year);

        // Calcular médias
        const avgConversionRate = monthPerformance.length > 0
          ? monthPerformance.reduce((sum, p) => sum + (p.conversion_rate || 0), 0) / monthPerformance.length
          : null;

        const avgNPS = monthEvaluations.length > 0
          ? monthEvaluations.reduce((sum, e) => sum + (e.nps_avg || 0), 0) / monthEvaluations.length
          : null;

        // Buscar ou criar registro do dashboard
        const { data: dashboardRecord } = await supabase
          .from('dashboard_metrics')
          .select('*')
          .eq('month', monthName)
          .eq('year', year)
          .maybeSingle();

        // Calcular totais
        const totalExperimentalClasses = monthPerformance.reduce((sum, p) => sum + (p.experimental_classes || 0), 0);
        const totalConversions = monthPerformance.reduce((sum, p) => sum + (p.conversions || 0), 0);
        const totalStudentsToRenew = monthPerformance.reduce((sum, p) => sum + (p.students_to_renew || 0), 0);
        const totalRenewals = monthPerformance.reduce((sum, p) => sum + (p.renewals || 0), 0);

        // Salvar automaticamente as médias calculadas
        const dashboardUpsertData = {
          month: monthName,
          year: year,
          total_professors: professorsData.length,
          total_experimental_classes: totalExperimentalClasses,
          total_conversions: totalConversions,
          total_students_to_renew: totalStudentsToRenew,
          total_renewals: totalRenewals,
          average_conversion_rate: avgConversionRate,
          average_nps: avgNPS,
          active_students: dashboardRecord?.active_students || 0,
          conversion_rate: dashboardRecord?.conversion_rate || 0.00
        };

        await supabase
          .from('dashboard_metrics')
          .upsert(dashboardUpsertData);
      }

      setLast12MonthsData(last12Months);

    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    }

    setIsLoading(false);
  };

  // Calcular métricas gerais dos últimos 12 meses
  const generalMetrics = useMemo(() => {
    if (last12MonthsData.length === 0) return null;

    const validData = last12MonthsData.filter(item => item.average_conversion_rate != null);
    const validNPS = last12MonthsData.filter(item => item.average_nps != null);

    return {
      averageConversionRate: validData.length > 0
        ? validData.reduce((sum, item) => sum + parseFloat(item.average_conversion_rate), 0) / validData.length
        : 0,
      averageNPS: validNPS.length > 0
        ? validNPS.reduce((sum, item) => sum + parseFloat(item.average_nps), 0) / validNPS.length
        : 0,
      totalActiveStudents: last12MonthsData.reduce((sum, item) => sum + (item.active_students || 0), 0),
      totalProfessors: last12MonthsData.reduce((sum, item) => sum + (item.total_professors || 0), 0)
    };
  }, [last12MonthsData]);

  const handleSave = async () => {
    setIsSaving(true);

    try {
      const data = {
        month: selectedMonth,
        year: selectedYear,
        active_students: parseInt(activeStudents) || 0,
        conversion_rate: parseFloat(conversionRate) || 0.00
      };

      const { error } = await supabase
        .from('dashboard_metrics')
        .upsert(data);

      if (error) {
        console.error('Erro ao salvar dados do dashboard', error);
      } else {
        await fetchDashboardData(); // Recarregar dados
      }
    } catch (error) {
      console.error('Erro ao salvar:', error);
    }

    setIsSaving(false);
  };

  useEffect(() => {
    fetchDashboardData();
  }, [selectedMonth, selectedYear]);

  // Preparar dados para os gráficos
  const conversionRateData = last12MonthsData.map(item => ({
    x: item.label,
    y: item.average_conversion_rate || 0
  }));

  const npsData = last12MonthsData.map(item => ({
    x: item.label,
    y: item.average_nps || 0
  }));

  const activeStudentsData = last12MonthsData.map(item => ({
    x: item.label,
    y: item.active_students || 0
  }));

  return (
    <div className="dashboard-tab">
      <div className="form-section">
        <h3>Métricas Gerais - {selectedMonth}/{selectedYear}</h3>

        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="activeStudents">
              Alunos Ativos
            </label>
            <input
              id="activeStudents"
              type="number"
              min="0"
              value={activeStudents}
              onChange={(e) => setActiveStudents(e.target.value)}
              placeholder="Ex: 150"
            />
          </div>

          <div className="form-group">
            <label htmlFor="conversionRate">
              Taxa de Conversão (%)
            </label>
            <input
              id="conversionRate"
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={conversionRate}
              onChange={(e) => setConversionRate(e.target.value)}
              placeholder="Ex: 25.5"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="save-button"
        >
          {isSaving ? 'Salvando...' : 'Salvar Métricas'}
        </button>
      </div>

      {generalMetrics && (
        <div className="summary-section">
          <h3>Resumo Geral (Últimos 12 meses)</h3>
          <div className="summary-grid">
            <div className="summary-card">
              <h4>Taxa de Conversão Média</h4>
              <span className="metric-value">{generalMetrics.averageConversionRate.toFixed(1)}%</span>
            </div>
            <div className="summary-card">
              <h4>NPS Médio</h4>
              <span className="metric-value">{generalMetrics.averageNPS.toFixed(1)}</span>
            </div>
            <div className="summary-card">
              <h4>Total de Professores</h4>
              <span className="metric-value">{generalMetrics.totalProfessors}</span>
            </div>
            <div className="summary-card">
              <h4>Alunos Ativos (Total)</h4>
              <span className="metric-value">{generalMetrics.totalActiveStudents}</span>
            </div>
          </div>
        </div>
      )}

      <div className="charts-section">
        <h3>Evolução dos Últimos 12 Meses</h3>

        <div className="charts-grid">
          <div className="chart-container">
            <h4>Taxa de Conversão</h4>
            <Plotly
              data={[{
                type: 'scatter',
                mode: 'lines+markers',
                x: conversionRateData.map(d => d.x),
                y: conversionRateData.map(d => d.y),
                line: { color: '#3b82f6' },
                marker: { color: '#3b82f6' }
              }]}
              layout={{
                margin: { t: 20, r: 20, b: 40, l: 40 },
                height: 300,
                xaxis: { tickangle: -45 },
                yaxis: { title: 'Taxa (%)' }
              }}
              config={{ displayModeBar: false }}
            />
          </div>

          <div className="chart-container">
            <h4>NPS</h4>
            <Plotly
              data={[{
                type: 'scatter',
                mode: 'lines+markers',
                x: npsData.map(d => d.x),
                y: npsData.map(d => d.y),
                line: { color: '#10b981' },
                marker: { color: '#10b981' }
              }]}
              layout={{
                margin: { t: 20, r: 20, b: 40, l: 40 },
                height: 300,
                xaxis: { tickangle: -45 },
                yaxis: { title: 'NPS' }
              }}
              config={{ displayModeBar: false }}
            />
          </div>

          <div className="chart-container">
            <h4>Alunos Ativos</h4>
            <Plotly
              data={[{
                type: 'bar',
                x: activeStudentsData.map(d => d.x),
                y: activeStudentsData.map(d => d.y),
                marker: { color: '#f59e0b' }
              }]}
              layout={{
                margin: { t: 20, r: 20, b: 40, l: 40 },
                height: 300,
                xaxis: { tickangle: -45 },
                yaxis: { title: 'Alunos' }
              }}
              config={{ displayModeBar: false }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
