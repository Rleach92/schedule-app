// frontend/src/components/schedule/WeekNavigator.js
import React from 'react';
import './WeekNavigator.css'; // 1. Import CSS

// 2. Delete styles object

function WeekNavigator({ weekStart, onWeekChange }) {

  const getNextWeek = () => {
    const nextFriday = new Date(weekStart);
    nextFriday.setDate(weekStart.getDate() + 7);
    onWeekChange(nextFriday);
  };

  const getPrevWeek = () => {
    const prevFriday = new Date(weekStart);
    prevFriday.setDate(weekStart.getDate() - 7);
    onWeekChange(prevFriday);
  };

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  const options = { month: 'short', day: 'numeric', year: 'numeric' }; // Add year
  const displayStart = weekStart.toLocaleDateString('en-US', options);
  const displayEnd = weekEnd.toLocaleDateString('en-US', options);

  // 3. Use className
  return (
    <nav className="week-navigator">
      <button onClick={getPrevWeek} className="week-navigator-button">&lt; Prev</button>
      <div className="week-navigator-date-display">
        {displayStart} - {displayEnd}
      </div>
      <button onClick={getNextWeek} className="week-navigator-button">Next &gt;</button>
    </nav>
  );
}

export default WeekNavigator;