// src/utils/date-helpers.js

/**
 * Calculates the date of the most recent Friday (including today if today is Friday)
 * which serves as the start of your work week.
 *
 * @returns {Date} The Date object for the starting Friday of the current week.
 */
export function getWeekStartingFriday() {
    const today = new Date();
    // JS getDay() returns 0 for Sunday, 5 for Friday, 6 for Saturday.
    const dayOfWeek = today.getDay(); 

    // Calculate the difference from Friday (which is index 5)
    // We want the difference in days.
    let diff = dayOfWeek - 5; // e.g., Sat (6) - Fri (5) = 1 day difference
    
    // If today is before Friday (Mon-Thurs), we need to go back 7 days to the *previous* Friday.
    // E.g., Thursday (4) - 5 = -1. We want to go back 8 days: -1 - 7 = -8.
    if (dayOfWeek < 5) {
        diff -= 7;
    }
    
    // Adjust the date by the calculated difference
    today.setDate(today.getDate() - diff);
    
    // Set time to midnight (00:00:00) to ensure the comparison is always at the start of the day
    today.setHours(0, 0, 0, 0); 

    return today;
}

/**
 * Converts a Date object into a YYYY-MM-DD string format (e.g., "2023-10-25").
 * Ensures consistent date strings for API calls, preventing timezone errors.
 *
 * @param {Date} date - The Date object to format.
 * @returns {string} The formatted date string.
 */
export function toYYYYMMDD(date) {
    if (!(date instanceof Date) || isNaN(date)) {
        console.error("Invalid date object passed to toYYYYMMDD:", date);
        return null;
    }
    
    // Use UTC methods to create a consistent date string regardless of local timezone.
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const day = String(date.getUTCDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

// You might also need this array for display in another component:
export const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];