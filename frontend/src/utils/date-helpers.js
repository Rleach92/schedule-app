// src/utils/date-helpers.js

/**
 * Calculates the Date object for the most recent Friday at midnight (00:00:00), 
 * which serves as the start of your custom work week.
 * * The JavaScript getDay() returns 0 for Sunday, 5 for Friday, 6 for Saturday.
 * This logic ensures the week always starts on Friday.
 *
 * @returns {Date} The Date object for the starting Friday of the current week.
 */
export function getWeekStartingFriday() {
    const today = new Date();
    const dayOfWeek = today.getDay(); 
    
    // We want the difference from Friday (5).
    let diff = dayOfWeek - 5; 
    
    // If today is Sunday (0), Monday (1), Tuesday (2), Wednesday (3), or Thursday (4), 
    // the previous Friday is in the past week, so we must subtract an additional 7 days.
    if (dayOfWeek < 5) {
        diff += 7; // Example: Mon(1) - Fri(5) = -4. -4 + 7 = 3. Goes back 3 days to Friday.
    }
    
    // Adjust the date by the calculated difference
    today.setDate(today.getDate() - diff);
    
    // Set time to midnight (00:00:00) to ensure the date comparison is clean and consistent
    today.setHours(0, 0, 0, 0); 

    return today;
}


/**
 * Converts a Date object into a YYYY-MM-DD string format (e.g., "2023-10-25").
 * Uses UTC methods to create a consistent date string regardless of local timezone, 
 * which is critical for clean API communication.
 *
 * @param {Date} date - The Date object to format.
 * @returns {string} The formatted date string.
 */
export function toYYYYMMDD(date) {
    if (!(date instanceof Date) || isNaN(date.getTime())) {
        console.error("Invalid date object passed to toYYYYMMDD:", date);
        return ''; // Return an empty string or handle error as appropriate
    }
    
    // Use UTC methods to ensure the date string does not shift based on the server's or client's timezone.
    const year = date.getUTCFullYear();
    // Months are 0-indexed, so add 1. padStart ensures two digits (e.g., '01').
    const month = String(date.getUTCMonth() + 1).padStart(2, '0'); 
    const day = String(date.getUTCDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}


/**
 * Export the array of day names to resolve the build error and be used in components.
 * This array is ordered starting with Sunday to match the native Date.getDay() index.
 * * Note: If your component logic relies on Monday being the first day (index 0), 
 * you'll need to adjust the array or adjust the index within the component.
 */
export const getWeekDayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];