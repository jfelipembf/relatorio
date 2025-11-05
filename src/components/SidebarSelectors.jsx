import PropTypes from 'prop-types';
import { MONTHS } from '../lib/constants';

const currentYear = new Date().getFullYear();
const YEARS = [currentYear - 1, currentYear, currentYear + 1];

export default function SidebarSelectors({
  professors,
  selectedProfessorId = undefined,
  onProfessorChange,
  selectedYear,
  onYearChange,
  selectedMonth,
  onMonthChange
}) {
  return (
    <aside className="sidebar">
      <section>
        <label htmlFor="year-select">Ano</label>
        <select
          id="year-select"
          value={selectedYear}
          onChange={(event) => onYearChange(Number(event.target.value))}
        >
          {YEARS.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </section>

      <section>
        <label htmlFor="month-select">Mês</label>
        <select
          id="month-select"
          value={selectedMonth}
          onChange={(event) => onMonthChange(event.target.value)}
        >
          {MONTHS.map((month) => (
            <option key={month} value={month}>
              {month}
            </option>
          ))}
        </select>
      </section>

      <section>
        <label htmlFor="professor-select">Professor</label>
        <select
          id="professor-select"
          value={selectedProfessorId ?? ''}
          onChange={(event) => onProfessorChange(Number(event.target.value))}
        >
          <option value="" disabled>
            Selecione um professor
          </option>
          {professors.map((professor) => (
            <option key={professor.id} value={professor.id}>
              {`${professor.first_name} ${professor.last_name}`}
            </option>
          ))}
        </select>
      </section>
    </aside>
  );
}

SidebarSelectors.propTypes = {
  professors: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      first_name: PropTypes.string.isRequired,
      last_name: PropTypes.string.isRequired
    })
  ).isRequired,
  selectedProfessorId: PropTypes.number,
  onProfessorChange: PropTypes.func.isRequired,
  selectedYear: PropTypes.number.isRequired,
  onYearChange: PropTypes.func.isRequired,
  selectedMonth: PropTypes.string.isRequired,
  onMonthChange: PropTypes.func.isRequired
};
