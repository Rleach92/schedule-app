// frontend/src/pages/MonthlySchedulePage.js
// ... (imports and state logic remain the same) ...

// ADD globalRefreshKey PROP
function MonthlySchedulePage({ globalRefreshKey }) {
  // ... (component logic remains the same) ...
  
  // --- Calendar Grid Generation Logic (remains the same) ---
  const generateCalendarGrid = () => {
    // ... (grid generation logic remains the same) ...
    return grid;
  };

  // --- Navigation Functions (Use setCurrentDate) ---
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 2, 1));
  };
  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month, 1));
  };
  // --------------------------

  return (
    <div className="monthly-schedule-container">
      <h2>{monthNames[month - 1]} {year}</h2>
      <div className="month-navigation">
        <button onClick={goToPreviousMonth}>&lt; Previous Month</button>
        <button onClick={goToNextMonth}>Next Month &gt;</button>
      </div>

      {loading && <p>Loading calendar...</p>}
      {error && <p className="error-message">{error}</p>}

      {!loading && !error && (
        // 🐛 MOBILE FIX: Wrap table in a responsive container
        <div className="calendar-responsive-wrapper">
          <table className="calendar-table">
            <thead>
              <tr>
                {dayNames.map(day => <th key={day}>{day}</th>)}
              </tr>
            </thead>
            <tbody>
              {generateCalendarGrid()}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default MonthlySchedulePage;