// frontend/src/utils/date-helpers.js

/**
 * Finds the most recent Friday for any given date.
 * @param {Date} d - The date to check.
 * @returns {Date} - The Date object for the starting Friday.
 */
export const getWeekStartingFriday = (d = new Date()) => {
  const date = new Date(d);
  const day = date.getDay(); // Sunday = 0, Monday = 1, ... Friday = 5
  // Calculate days to subtract to get back to Friday
  const diff = (day < 5) ? (day + 2) : (day - 5); 
  
  date.setDate(date.getDate() - diff);
  date.setHours(0, 0, 0, 0); // Standardize to midnight
  return date;
};

/**
 * Formats a Date object into "YYYY-MM-DD" for API calls
 * @param {Date} date 
 * @returns {string}
 */
export const toYYYYMMDD = (date) => {
  return date.toISOString().split('T')[0];
};

/**
 * Generates the array of 7 day strings for the week headers.
 * @param {Date} friday - The starting Friday Date object.
 * @returns {string[]} - e.g., ["Friday, Oct 24", "Saturday, Oct 25", ...]
 */
export const getWeekDayNames = (friday) => {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const weekDayNames = [];
  
  // We need to order them Friday -> Thursday
  const dayOrder = [5, 6, 0, 1, 2, 3, 4]; // Friday, Sat, Sun, Mon, Tue, Wed, Thu

  for (let i = 0; i < 7; i++) {
    const newDate = new Date(friday);
    newDate.setDate(friday.getDate() + i);
    
    const dayName = days[dayOrder[i]];
    const monthName = months[newDate.getMonth()];
    const dateNum = newDate.getDate();

    weekDayNames.push(`${dayName}, ${monthName} ${dateNum}`);
  }
  return weekDayNames;
};