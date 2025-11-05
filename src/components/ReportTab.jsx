import PropTypes from 'prop-types';
import { calculateConversionRate, calculateOverallEvaluationScore, calculateOverallScore, calculateRenewalRate, normalizeRateToScore, getAverageKey } from '../lib/calculations';
import { COLUMN_MAPPING, CRITERION_PREFIXES } from '../lib/constants';

const COLUMN_ENTRIES = Object.entries(COLUMN_MAPPING).map(([key, column]) => {
  const [criterion, topic] = key.split('|');
  return { criterion, topic, column };
});

export default function ReportTab({
  professor = null,
  selectedMonth,
  selectedYear,
  performanceData = null,
  evaluationData = null,
  overallRanking = []
}) {
  if (!professor) {
    return <p>Selecione um professor para visualizar o relatório.</p>;
  }

  const conversionRate = calculateConversionRate(
    performanceData?.experimental_classes ?? 0,
    performanceData?.conversions ?? 0
  );

  const renewalRate = calculateRenewalRate(
    performanceData?.students_to_renew ?? 0,
    performanceData?.renewals ?? 0
  );

  const performanceScore = normalizeRateToScore(conversionRate, renewalRate);
  const evaluationScore = calculateOverallEvaluationScore(evaluationData);
  const overallScore = calculateOverallScore(performanceScore, evaluationScore);

  const rankingPosition =
    overallRanking.findIndex((row) => row.professorId === professor.id) + 1 || null;
  const rankingScore =
    overallRanking.find((row) => row.professorId === professor.id)?.overallScore ?? null;

  const criterionAverages = Object.keys(CRITERION_PREFIXES).map((criterion) => {
    const key = getAverageKey(criterion);
    return {
      criterion,
      average: evaluationData?.[key] ?? null
    };
  });

  const observations = COLUMN_ENTRIES.map((entry) => {
    const observation = evaluationData?.[`observacao_${entry.column}`];
    if (!observation?.trim()) return null;
    return {
      criterion: entry.criterion,
      topic: entry.topic,
      observation
    };
  }).filter(Boolean);

  return (
    <div className="tab-content report">
      <section className="card report__header">
        <div>
          <h2>
            Relatório de {professor.first_name} {professor.last_name}
          </h2>
          <p className="subtle">
            Período: {selectedMonth} {selectedYear}
          </p>
        </div>
        <div className="metric-grid">
          <div className="metric">
            <span>Pontuação de desempenho</span>
            <strong>{performanceScore.toFixed(2)}</strong>
          </div>
          <div className="metric">
            <span>Pontuação de avaliação</span>
            <strong>{evaluationScore != null ? evaluationScore.toFixed(2) : 'Sem dados'}</strong>
          </div>
          <div className="metric">
            <span>Pontuação geral</span>
            <strong>{overallScore != null ? overallScore.toFixed(2) : 'Sem dados'}</strong>
          </div>
        </div>
      </section>

      <section className="card">
        <h3>Resumo de desempenho</h3>
        {performanceData ? (
          <table className="simple-table">
            <tbody>
              <tr>
                <td>Aulas experimentais</td>
                <td>{performanceData.experimental_classes}</td>
              </tr>
              <tr>
                <td>Conversões</td>
                <td>{performanceData.conversions}</td>
              </tr>
              <tr>
                <td>Taxa de conversão</td>
                <td>{conversionRate.toFixed(1)}%</td>
              </tr>
              <tr>
                <td>Alunos a renovar</td>
                <td>{performanceData.students_to_renew}</td>
              </tr>
              <tr>
                <td>Renovações</td>
                <td>{performanceData.renewals}</td>
              </tr>
              <tr>
                <td>Taxa de renovação</td>
                <td>{renewalRate.toFixed(1)}%</td>
              </tr>
            </tbody>
          </table>
        ) : (
          <p>Sem dados de desempenho para este período.</p>
        )}
      </section>

      <section className="card">
        <h3>Resumo das avaliações</h3>
        {evaluationData ? (
          <>
            <table className="simple-table">
              <thead>
                <tr>
                  <th>Critério</th>
                  <th>Média</th>
                </tr>
              </thead>
              <tbody>
                {criterionAverages.map((item) => (
                  <tr key={item.criterion}>
                    <td>{item.criterion}</td>
                    <td>{item.average != null ? item.average.toFixed(2) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <h4>Observações registradas</h4>
            {observations.length ? (
              <ul className="observation-list">
                {observations.map((obs) => (
                  <li key={`${obs.criterion}-${obs.topic}`}>
                    <strong>{obs.criterion} • {obs.topic}:</strong> {obs.observation}
                  </li>
                ))}
              </ul>
            ) : (
              <p>Nenhuma observação foi registrada neste período.</p>
            )}
          </>
        ) : (
          <p>Sem dados de avaliação para este período.</p>
        )}
      </section>

      <section className="card">
        <h3>Posição no ranking geral</h3>
        {rankingPosition ? (
          <div className="metric-grid">
            <div className="metric metric--large">
              <span>Classificação</span>
              <strong>#{rankingPosition}</strong>
            </div>
            <div className="metric metric--large">
              <span>Pontuação</span>
              <strong>{rankingScore != null ? rankingScore.toFixed(2) : 'Sem dados'}</strong>
            </div>
          </div>
        ) : (
          <p>Este professor ainda não aparece no ranking geral.</p>
        )}
      </section>
    </div>
  );
}

ReportTab.propTypes = {
  professor: PropTypes.shape({
    id: PropTypes.number.isRequired,
    first_name: PropTypes.string.isRequired,
    last_name: PropTypes.string.isRequired
  }),
  selectedMonth: PropTypes.string.isRequired,
  selectedYear: PropTypes.number.isRequired,
  performanceData: PropTypes.object,
  evaluationData: PropTypes.object,
  overallRanking: PropTypes.arrayOf(
    PropTypes.shape({
      professorId: PropTypes.number.isRequired,
      overallScore: PropTypes.number
    })
  )
};
