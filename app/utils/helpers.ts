/**
 * Date and Time Utility Functions
 * Helper functions for date manipulation and time formatting
 */

/**
 * Generate a week of dates starting from today (8 days total)
 * @returns Array of Date objects representing the next 8 days starting from today
 */
export const getWeekDates = (): Date[] => {
	const dates = [];
	const today = new Date();
	today.setHours(0, 0, 0, 0); // Reset time to start of day

	for (let i = 0; i < 8; i++) {
		const date = new Date(today);
		date.setDate(today.getDate() + i);
		dates.push(date);
	}
	return dates;
};

/**
 * Check if today is Friday
 * @returns true if today is Friday, false otherwise
 */
export const isFriday = (): boolean => {
	const today = new Date();
	return today.getDay() === 5; // Friday
};

/**
 * Convert 24-hour time format to 12-hour format with AM/PM
 * @param time24 - Time string in 24-hour format (e.g., "14:30")
 * @returns Time string in 12-hour format (e.g., "2:30 PM")
 */
export const convertTo12Hour = (time24: string): string => {
	const [hours, minutes] = time24.split(":").map(Number);
	const period = hours >= 12 ? "PM" : "AM";
	const hours12 = hours % 12 || 12;
	return `${hours12}:${minutes.toString().padStart(2, "0")} ${period}`;
};

/**
 * Format a Date object to a short day name
 * @param date - Date object to format
 * @returns Short day name (e.g., "Mon", "Tue")
 */
export const formatDayName = (date: Date): string => {
	const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
	return days[date.getDay()];
};

/**
 * Check if two dates represent the same day (ignoring time)
 * @param date1 - First date to compare
 * @param date2 - Second date to compare
 * @returns true if both dates are on the same day, false otherwise
 */
export const isSameDay = (date1: Date, date2: Date): boolean => {
	return (
		date1.getFullYear() === date2.getFullYear() &&
		date1.getMonth() === date2.getMonth() &&
		date1.getDate() === date2.getDate()
	);
};

/**
 * Format time string to 12-hour format with AM/PM
 * @param time - Time string in 24-hour format (e.g., "14:30")
 * @returns Time string in 12-hour format (e.g., "2:30 PM"), or empty string if invalid
 */
export const formatTime = (time: string): string => {
	if (!time) return "";

	const [hours, minutes] = time.split(":").map(Number);
	const period = hours >= 12 ? "PM" : "AM";
	const hours12 = hours % 12 || 12;
	return `${hours12}:${minutes.toString().padStart(2, "0")} ${period}`;
};
