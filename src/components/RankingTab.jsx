import { useState } from 'react';
import PropTypes from 'prop-types';

function RankingTable({ rows = [] }) {
  if (!rows?.length) {
    return <p>Sem dados suficientes para montar o ranking.</p>;
  }

  return (
    <div className="card">
      <table className="ranking-table">
        <thead>
          <tr>
            <th>Posição</th>
            <th>Professor</th>
            <th>Desempenho (40%)</th>
            <th>Avaliações (60%)</th>
            <th>Pontuação Total (0-5)</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={row.professorId ?? index}>
              <td>{`#${index + 1}`}</td>
              <td>{row.name}</td>
              <td>{row.performanceScore != null ? row.performanceScore.toFixed(2) : 'Sem dados'}</td>
              <td>{row.evaluationScore != null ? row.evaluationScore.toFixed(2) : 'Sem dados'}</td>
              <td>{row.overallScore != null ? row.overallScore.toFixed(2) : 'Sem dados'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

RankingTable.propTypes = {
  rows: PropTypes.arrayOf(
    PropTypes.shape({
      professorId: PropTypes.number,
      name: PropTypes.string.isRequired,
      performanceScore: PropTypes.number,
      evaluationScore: PropTypes.number,
      overallScore: PropTypes.number
    })
  )
};

export default function RankingTab({
  selectedMonth,
  selectedYear,
  monthlyRanking = [],
  overallRanking = [],
  isMonthlyLoading = false,
  isOverallLoading = false
}) {
  const [mode, setMode] = useState('monthly');
  const isMonthly = mode === 'monthly';

  return (
    <div className="tab-content">
      <div className="card">
        <div className="tab-switch">
          <button
            type="button"
            className={mode === 'monthly' ? 'active' : ''}
            onClick={(event) => {
              event.preventDefault();
              setMode('monthly');
            }}
          >
            Ranking Mensal ({selectedMonth} {selectedYear})
          </button>
          <button
            type="button"
            className={mode === 'overall' ? 'active' : ''}
            onClick={(event) => {
              event.preventDefault();
              setMode('overall');
            }}
          >
            Ranking Geral (Histórico)
          </button>
        </div>
      </div>

      {isMonthly ? (
        isMonthlyLoading ? (
          <p>Carregando ranking mensal...</p>
        ) : (
          <RankingTable rows={monthlyRanking} />
        )
      ) : isOverallLoading ? (
        <p>Carregando ranking geral...</p>
      ) : (
        <RankingTable rows={overallRanking} />
      )}
    </div>
  );
}

RankingTab.propTypes = {
  selectedMonth: PropTypes.string.isRequired,
  selectedYear: PropTypes.number.isRequired,
  monthlyRanking: PropTypes.array,
  overallRanking: PropTypes.array,
  isMonthlyLoading: PropTypes.bool,
  isOverallLoading: PropTypes.bool
};
