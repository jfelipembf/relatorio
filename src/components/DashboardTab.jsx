import { useMemo } from 'react';
import PropTypes from 'prop-types';
import Plot from 'react-plotly.js';
import { calculateGeneralDashboardMetrics, prepareDashboardChartData } from '../lib/dashboardCalculations';
import { generateSmartMessages } from '../lib/dashboardMessages';

export default function DashboardTab({ selectedMonth, selectedYear, dashboardData, isLoading }) {
  // Calcular métricas gerais dos últimos 12 meses
  const generalMetrics = useMemo(() => {
    return calculateGeneralDashboardMetrics(dashboardData);
  }, [dashboardData]);

  // Preparar dados para os gráficos
  const chartData = useMemo(() => {
    return prepareDashboardChartData(dashboardData);
  }, [dashboardData]);

  // Gerar mensagens inteligentes
  const smartMessages = useMemo(() => {
    return generateSmartMessages(dashboardData);
  }, [dashboardData]);

  if (isLoading) {
    return (
      <div className="tab-content">
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p>Carregando dados do dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="tab-content">
      {/* Mensagens inteligentes para Zu */}
      {smartMessages && (
        <div className="card">
          <h2>💬 Mensagens para você, Zu</h2>
          <div className="messages-grid">
            {smartMessages.activeStudents && (
              <div className="message-card">
                <h4>👥 Alunos Ativos</h4>
                <p>{smartMessages.activeStudents}</p>
              </div>
            )}
            {smartMessages.churnRate && (
              <div className="message-card">
                <h4 className="message-card-header">
                  📊 Taxa de Churn
                  <div className="tooltip-container">
                    <span className="info-icon">ℹ️</span>
                    <div className="tooltip">
                      <div className="tooltip-title">O que é Churn?</div>
                      <div className="tooltip-content">
                        • <strong>Taxa de evasão</strong> de alunos<br/>
                        • <em>Quando alunos não renovam seus planos</em><br/>
                        • Pode ser por <strong>insatisfação</strong> ou outros motivos<br/>
                        • <span className="text-danger">Quando AUMENTA</span>: mais alunos saindo (ruim)<br/>
                        • <span className="text-success">Quando DIMINUI</span>: menos alunos saindo (bom)<br/>
                        • <strong className="text-warning">Meta: manter abaixo de 7%</strong>
                      </div>
                    </div>
                  </div>
                </h4>
                <p>{smartMessages.churnRate}</p>
              </div>
            )}
            {smartMessages.nps && (
              <div className="message-card">
                <h4>⭐ NPS</h4>
                <p>{smartMessages.nps}</p>
              </div>
            )}
          </div>
          {smartMessages.general && (
            <div className="message-card message-card--general">
              <h4>🎯 Avaliação Geral</h4>
              <p>{smartMessages.general}</p>
            </div>
          )}
        </div>
      )}

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
          {chartData.periodLabels?.length ? (
            <Plot
              data={[{
                x: chartData.periodLabels,
                y: chartData.activeStudentsData,
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
          {chartData.periodLabels?.length ? (
            <Plot
              data={[{
                x: chartData.periodLabels,
                y: chartData.churnData,
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
  selectedYear: PropTypes.number.isRequired,
  dashboardData: PropTypes.array,
  isLoading: PropTypes.bool
};
