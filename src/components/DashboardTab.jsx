import { useEffect, useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import Plot from 'react-plotly.js';
import { supabase } from '../lib/supabaseClient';
import { MONTHS } from '../lib/constants';

export default function DashboardTab({ selectedMonth, selectedYear }) {
  const [last12MonthsData, setLast12MonthsData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchDashboardData = async () => {
    setIsLoading(true);

    try {
      // Buscar dados dos professores para calcular médias
      const [performanceResponse, evaluationResponse, professorsResponse, dashboardResponse] = await Promise.all([
        supabase.from('professor_performance').select('*'),
        supabase.from('professor_evaluations').select('*'),
        supabase.from('professors').select('*'),
        supabase.from('dashboard_metrics').select('*')
      ]);

      const performanceData = performanceResponse.data || [];
      const evaluationData = evaluationResponse.data || [];
      const professorsData = professorsResponse.data || [];
      const dashboardData = dashboardResponse.data || [];

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
        const monthDashboard = dashboardData.find(d => d.month === monthName && d.year === year);

        // Calcular médias
        const avgConversionRate = monthPerformance.length > 0
          ? monthPerformance.reduce((sum, p) => sum + (p.conversion_rate || 0), 0) / monthPerformance.length
          : 0;

        const avgNPS = monthEvaluations.length > 0
          ? monthEvaluations.reduce((sum, e) => sum + (e.nps_avg || 0), 0) / monthEvaluations.length
          : 0;

        // Calcular totais
        const totalConversions = monthPerformance.reduce((sum, p) => sum + (p.conversions || 0), 0);
        const totalRenewals = monthPerformance.reduce((sum, p) => sum + (p.renewals || 0), 0);

        last12Months.push({
          month: monthName,
          year: year,
          label: `${monthName}/${year.toString().slice(-2)}`,
          avgConversionRate,
          avgNPS,
          totalConversions,
          totalRenewals,
          totalProfessors: professorsData.length,
          activeStudents: monthDashboard?.active_students || 0,
          churnRate: monthDashboard?.conversion_rate || 0 // Usando conversion_rate como churn
        });
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

    const validData = last12MonthsData.filter(item => item.avgConversionRate > 0);
    const validNPS = last12MonthsData.filter(item => item.avgNPS > 0);

    return {
      averageConversionRate: validData.length > 0
        ? validData.reduce((sum, item) => sum + item.avgConversionRate, 0) / validData.length
        : 0,
      averageNPS: validNPS.length > 0
        ? validNPS.reduce((sum, item) => sum + item.avgNPS, 0) / validNPS.length
        : 0,
      totalConversions: last12MonthsData.reduce((sum, item) => sum + item.totalConversions, 0),
      totalRenewals: last12MonthsData.reduce((sum, item) => sum + item.totalRenewals, 0)
    };
  }, [last12MonthsData]);

  useEffect(() => {
    fetchDashboardData();
  }, [selectedMonth, selectedYear]);

  // Preparar dados para os gráficos
  const periodLabels = last12MonthsData.map(item => item.label);
  const conversionRateData = last12MonthsData.map(item => item.avgConversionRate);
  const npsData = last12MonthsData.map(item => item.avgNPS);
  const activeStudentsData = last12MonthsData.map(item => item.activeStudents);
  const churnData = last12MonthsData.map(item => item.churnRate);

  return (
    <div className="tab-content">
      {/* Resumo geral */}
      <div className="card">
        <h2>Resumo Geral - Últimos 12 Meses</h2>
        <div className="metric-grid">
          <div className="metric">
            <span>Taxa de Conversão Média</span>
            <strong>{generalMetrics?.averageConversionRate.toFixed(1) || '0.0'}%</strong>
          </div>
          <div className="metric">
            <span>NPS Médio</span>
            <strong>{generalMetrics?.averageNPS.toFixed(1) || '0.0'}</strong>
          </div>
          <div className="metric">
            <span>Total de Conversões</span>
            <strong>{generalMetrics?.totalConversions || 0}</strong>
          </div>
          <div className="metric">
            <span>Total de Renovações</span>
            <strong>{generalMetrics?.totalRenewals || 0}</strong>
          </div>
        </div>
      </div>

      {/* Gráficos lado a lado */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '24px' }}>
        {/* Alunos Ativos */}
        <div className="card">
          <h2>Alunos Ativos - Histórico</h2>
          {periodLabels.length ? (
            <Plot
              data={[{
                x: periodLabels,
                y: activeStudentsData,
                type: 'bar',
                marker: { color: '#10b981' }
              }]}
              layout={{
                autosize: true,
                margin: { l: 40, r: 20, t: 20, b: 40 },
                height: 280,
                yaxis: { title: 'Alunos' },
                xaxis: { tickangle: -45 }
              }}
              config={{ displayModeBar: false, responsive: true }}
              style={{ width: '100%' }}
              useResizeHandler
            />
          ) : (
            <p style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
              Sem dados de alunos
            </p>
          )}
        </div>

        {/* Taxa de Churn */}
        <div className="card">
          <h2>Taxa de Churn - Histórico</h2>
          {periodLabels.length ? (
            <Plot
              data={[{
                x: periodLabels,
                y: churnData,
                type: 'scatter',
                mode: 'lines+markers',
                marker: { color: '#ef4444' }
              }]}
              layout={{
                autosize: true,
                margin: { l: 40, r: 20, t: 20, b: 40 },
                height: 280,
                yaxis: { title: 'Churn (%)' },
                xaxis: { tickangle: -45 }
              }}
              config={{ displayModeBar: false, responsive: true }}
              style={{ width: '100%' }}
              useResizeHandler
            />
          ) : (
            <p style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
              Sem dados de churn
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

DashboardTab.propTypes = {
  selectedMonth: PropTypes.string.isRequired,
  selectedYear: PropTypes.number.isRequired
};
