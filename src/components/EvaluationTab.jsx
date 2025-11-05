import { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { COLUMN_MAPPING, CRITERION_PREFIXES } from '../lib/constants';
import { calculateOverallEvaluationScore, getAverageKey, getColumnKey } from '../lib/calculations';

const CRITERIA = [
  {
    name: 'Organização',
    topics: [
      { label: 'Planejamento de aulas', alwaysVisible: true },
      { label: 'Organização dos materiais', alwaysVisible: true },
      { label: 'Processos de avaliação', requireEvaluationMonth: true },
      { label: 'Prazos de avaliação', requireEvaluationMonth: true }
    ]
  },
  {
    name: 'Técnica de Ensino',
    topics: [
      { label: 'Metodologia utilizada' },
      { label: 'Adaptação ao nível dos alunos' },
      { label: 'Clareza na explicação' },
      { label: 'Uso de recursos didáticos' },
      { label: 'Interação com alunos' }
    ]
  },
  {
    name: 'NPS',
    topics: [
      { label: 'Satisfação dos alunos' },
      { label: 'Recomendação' },
      { label: 'Expectativas atendidas' }
    ]
  },
  {
    name: 'Segurança',
    topics: [
      { label: 'Cuidados com equipamentos' },
      { label: 'Orientação sobre segurança' },
      { label: 'Prevenção de acidentes' },
      { label: 'Atitude preventiva' }
    ]
  },
  {
    name: 'Assiduidade',
    topics: [
      { label: 'Pontualidade' },
      { label: 'Frequência às aulas' },
      { label: 'Compromisso com horários' },
      { label: 'Ausências justificadas' }
    ]
  }
];

function buildDefaultData(existing) {
  const base = { is_evaluation_period: false };

  Object.values(COLUMN_MAPPING).forEach((column) => {
    base[column] = existing?.[column] ?? 3;
    base[`observacao_${column}`] = existing?.[`observacao_${column}`] ?? '';
  });

  Object.values(CRITERION_PREFIXES).forEach((prefix) => {
    const key = `${prefix}_avg`;
    base[key] = existing?.[key] ?? null;
  });

  base.is_evaluation_period = Boolean(existing?.is_evaluation_period);
  return base;
}

export default function EvaluationTab({
  evaluationData = null,
  selectedMonth,
  selectedYear,
  onSave,
  isSaving = false
}) {
  const [formValues, setFormValues] = useState(buildDefaultData(evaluationData));
  const [overallAverage, setOverallAverage] = useState(null);

  useEffect(() => {
    const base = buildDefaultData(evaluationData);
    setFormValues(base);
  }, [evaluationData]);

  useEffect(() => {
    const averages = Object.entries(formValues)
      .filter(([key, value]) => key.endsWith('_avg') && typeof value === 'number')
      .map(([, value]) => value);
    if (averages.length) {
      setOverallAverage(
        averages.reduce((acc, curr) => acc + curr, 0) / averages.length
      );
    } else {
      setOverallAverage(null);
    }
  }, [formValues]);

  const handleScoreChange = (column) => (event) => {
    const value = Number(event.target.value);
    setFormValues((prev) => ({
      ...prev,
      [column]: value
    }));
  };

  const handleObservationChange = (column) => (event) => {
    const value = event.target.value;
    setFormValues((prev) => ({
      ...prev,
      [`observacao_${column}`]: value
    }));
  };

  const handleEvaluationPeriodToggle = (event) => {
    const checked = event.target.checked;
    setFormValues((prev) => ({
      ...prev,
      is_evaluation_period: checked
    }));
  };

  const visibleTopics = useMemo(() => {
    const isEval = formValues.is_evaluation_period;
    return CRITERIA.map((criterion) => ({
      ...criterion,
      topics: criterion.topics.filter(
        (topic) => topic.alwaysVisible || !topic.requireEvaluationMonth || isEval
      )
    }));
  }, [formValues.is_evaluation_period]);

  const criterionAverage = (criterionName, topics) => {
    if (!topics.length) return null;
    const scores = topics.map((topic) => formValues[getColumnKey(criterionName, topic.label)] ?? 0);
    if (!scores.length) return null;
    return scores.reduce((acc, curr) => acc + curr, 0) / scores.length;
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const payload = {
      professor_id: evaluationData?.professor_id,
      month: selectedMonth,
      year: selectedYear,
      is_evaluation_period: formValues.is_evaluation_period
    };

    visibleTopics.forEach((criterion) => {
      const avgKey = getAverageKey(criterion.name);
      const avg = criterionAverage(criterion.name, criterion.topics);
      payload[avgKey] = avg;

      criterion.topics.forEach((topic) => {
        const columnKey = getColumnKey(criterion.name, topic.label);
        payload[columnKey] = formValues[columnKey];
        payload[`observacao_${columnKey}`] = formValues[`observacao_${columnKey}`];
      });
    });

    onSave(payload);
  };

  return (
    <form className="evaluation-form" onSubmit={handleSubmit}>
      <div className="card">
        <label className="toggle">
          <input
            type="checkbox"
            checked={formValues.is_evaluation_period}
            onChange={handleEvaluationPeriodToggle}
          />
          <span>Este é um mês de avaliação</span>
        </label>
        <p className="subtle">
          Habilite para incluir critérios adicionais que só aparecem em períodos de avaliação.
        </p>
      </div>

      {visibleTopics.map((criterion) => {
        const avgKey = getAverageKey(criterion.name);
        const average = criterionAverage(criterion.name, criterion.topics);
        return (
          <section className="card" key={criterion.name}>
            <header className="card-header">
              <div>
                <h2>{criterion.name}</h2>
                <p className="subtle">Avalie cada tópico de 1 a 5 e registre observações específicas.</p>
              </div>
              <div className="metric">
                <span>Média {criterion.name}</span>
                <strong>{average ? average.toFixed(2) : '—'}</strong>
              </div>
            </header>
            <div className="topic-grid">
              {criterion.topics.map((topic) => {
                const columnKey = getColumnKey(criterion.name, topic.label);
                const observationKey = `observacao_${columnKey}`;
                return (
                  <article className="topic-card" key={columnKey}>
                    <div className="topic-card__header">
                      <h3 className={topic.label.length > 25 ? 'topic-title--small' : ''}>{topic.label}</h3>
                      <span className={clsx('badge', { 'badge--optional': topic.requireEvaluationMonth })}>
                        Nota: {formValues[columnKey]}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      step="1"
                      value={formValues[columnKey]}
                      onChange={handleScoreChange(columnKey)}
                    />
                    <textarea
                      placeholder="Observações..."
                      value={formValues[observationKey]}
                      onChange={handleObservationChange(columnKey)}
                      rows="2"
                    />
                  </article>
                );
              })}
            </div>
            <input type="hidden" name={avgKey} value={average ?? ''} />
          </section>
        );
      })}

      <div className="card summary-card">
        <div>
          <h2>Resumo geral</h2>
          <p className="subtle">
            Média calculada automaticamente a partir dos critérios preenchidos acima.
          </p>
        </div>
        <div className="metric metric--large">
          <span>Média geral</span>
          <strong>{overallAverage ? overallAverage.toFixed(2) : '—'}</strong>
        </div>
        <button type="submit" className="primary-button" disabled={isSaving}>
          {isSaving ? 'Salvando...' : 'Salvar avaliação'}
        </button>
      </div>
    </form>
  );
}

EvaluationTab.propTypes = {
  evaluationData: PropTypes.object,
  selectedMonth: PropTypes.string.isRequired,
  selectedYear: PropTypes.number.isRequired,
  onSave: PropTypes.func.isRequired,
  isSaving: PropTypes.bool
};
