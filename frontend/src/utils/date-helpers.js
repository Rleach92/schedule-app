// src/utils/date-helpers.js

/**
 * Calculates the Date object for the most recent Friday at midnight (00:00:00), 
 * which serves as the start of your custom work week.
 */
export function getWeekStartingFriday() {
    const today = new Date();
    const dayOfWeek = today.getDay(); 
    
    let diff = dayOfWeek - 5; 
    
    if (dayOfWeek < 5) {
        diff += 7; 
    }
    
    today.setDate(today.getDate() - diff);
    today.setHours(0, 0, 0, 0); 

    return today;
}


/**
 * Converts a Date object into a YYYY-MM-DD string format (e.g., "2023-10-25").
 * Uses UTC methods to create a consistent date string regardless of local timezone.
 */
export function toYYYYMMDD(date) {
    if (!(date instanceof Date) || isNaN(date.getTime())) {
        console.error("Invalid date object passed to toYYYYMMDD:", date);
        return ''; 
    }
    
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0'); 
    const day = String(date.getUTCDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}


// --- NEW FUNCTION: CONVERTS 24HR TIME TO 12HR AM/PM ---
export function formatTime12Hr(time24hr) {
    if (!time24hr || typeof time24hr !== 'string') {
        return time24hr;
    }
    
    try {
        const [hours, minutes] = time24hr.split(':').map(Number);
        
        // Use a dummy date to leverage JS Date object's reliable formatting
        const date = new Date(2000, 0, 1, hours, minutes); 

        return date.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit', 
            hour12: true 
        });
    } catch (e) {
        console.error("Failed to format time:", time24hr);
        return time24hr; 
    }
}
// ----------------------------------------------------


export const getWeekDayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];