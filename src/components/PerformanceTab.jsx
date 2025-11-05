import { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import Plot from 'react-plotly.js';
import { MONTHS } from '../lib/constants';
import {
  calculateConversionRate,
  calculateRenewalRate,
  normalizeRateToScore
} from '../lib/calculations';

const DEFAULT_VALUES = {
  experimental_classes: 0,
  conversions: 0,
  students_to_renew: 0,
  renewals: 0
};

export default function PerformanceTab({
  selectedMonth,
  selectedYear,
  initialData = {},
  yearlyData = [],
  onSave,
  isSaving = false
}) {
  const [formValues, setFormValues] = useState(DEFAULT_VALUES);

  useEffect(() => {
    setFormValues((values) => ({
      ...values,
      ...DEFAULT_VALUES,
      ...initialData
    }));
  }, [initialData]);

  const conversionRate = useMemo(
    () => calculateConversionRate(formValues.experimental_classes, formValues.conversions),
    [formValues.experimental_classes, formValues.conversions]
  );

  const renewalRate = useMemo(
    () => calculateRenewalRate(formValues.students_to_renew, formValues.renewals),
    [formValues.students_to_renew, formValues.renewals]
  );

  const performanceScore = useMemo(
    () => normalizeRateToScore(conversionRate, renewalRate),
    [conversionRate, renewalRate]
  );

  const handleChange = (field) => (event) => {
    setFormValues((values) => ({
      ...values,
      [field]: Number(event.target.value)
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSave({
      ...formValues,
      conversion_rate: conversionRate,
      renewal_rate: renewalRate,
      month: selectedMonth,
      year: selectedYear
    });
  };

  const orderedYearlyData = useMemo(() => {
    if (!yearlyData?.length) return [];
    const monthIndex = Object.fromEntries(MONTHS.map((month, index) => [month, index]));
    return [...yearlyData].sort((a, b) => monthIndex[a.month] - monthIndex[b.month]);
  }, [yearlyData]);

  const periodLabels = orderedYearlyData.map((item) => `${item.month} ${item.year}`);
  const conversionSeries = orderedYearlyData.map((item) => item.conversion_rate ?? 0);
  const renewalSeries = orderedYearlyData.map((item) => item.renewal_rate ?? 0);

  return (
    <div className="tab-content">
      <form className="card-grid" onSubmit={handleSubmit}>
        <article className="card">
          <h2>Resumo do Período</h2>
          <div className="field-grid">
            <label>
              Aulas experimentais
              <input
                type="number"
                min="0"
                step="1"
                value={formValues.experimental_classes}
                onChange={handleChange('experimental_classes')}
              />
            </label>
            <label>
              Conversões
              <input
                type="number"
                min="0"
                step="1"
                value={formValues.conversions}
                onChange={handleChange('conversions')}
              />
            </label>
            <label>
              Alunos a renovar
              <input
                type="number"
                min="0"
                step="1"
                value={formValues.students_to_renew}
                onChange={handleChange('students_to_renew')}
              />
            </label>
            <label>
              Renovações
              <input
                type="number"
                min="0"
                step="1"
                value={formValues.renewals}
                onChange={handleChange('renewals')}
              />
            </label>
          </div>
          <div className="metric-grid">
            <div className="metric">
              <span>Taxa de conversão</span>
              <strong>{conversionRate.toFixed(1)}%</strong>
            </div>
            <div className="metric">
              <span>Taxa de renovação</span>
              <strong>{renewalRate.toFixed(1)}%</strong>
            </div>
            <div className="metric">
              <span>Score (0-5)</span>
              <strong>{performanceScore.toFixed(2)}</strong>
            </div>
          </div>
          <button type="submit" className="primary-button" disabled={isSaving}>
            {isSaving ? 'Salvando...' : 'Salvar dados do mês'}
          </button>
        </article>

        <article className="card">
          <h2>Histórico anual ({selectedYear})</h2>
          {periodLabels.length ? (
            <Plot
              data={[
                {
                  x: periodLabels,
                  y: conversionSeries,
                  type: 'scatter',
                  mode: 'lines+markers',
                  name: 'Conversão (%)',
                  marker: { color: '#4c66eb' }
                },
                {
                  x: periodLabels,
                  y: renewalSeries,
                  type: 'scatter',
                  mode: 'lines+markers',
                  name: 'Renovação (%)',
                  marker: { color: '#1abc9c' }
                }
              ]}
              layout={{
                autosize: true,
                margin: { l: 50, r: 20, t: 30, b: 60 },
                legend: { orientation: 'h' },
                yaxis: { title: 'Percentual', ticksuffix: '%' },
                xaxis: { title: 'Período' }
              }}
              config={{ displayModeBar: false, responsive: true }}
              style={{ width: '100%', height: 360 }}
              useResizeHandler
            />
          ) : (
            <p>Sem dados registrados para {selectedYear}.</p>
          )}
        </article>
      </form>
    </div>
  );
}

PerformanceTab.propTypes = {
  selectedMonth: PropTypes.string.isRequired,
  selectedYear: PropTypes.number.isRequired,
  initialData: PropTypes.shape({
    experimental_classes: PropTypes.number,
    conversions: PropTypes.number,
    students_to_renew: PropTypes.number,
    renewals: PropTypes.number
  }),
  yearlyData: PropTypes.arrayOf(PropTypes.object),
  onSave: PropTypes.func.isRequired,
  isSaving: PropTypes.bool
};
