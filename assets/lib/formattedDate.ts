import { format, formatDistanceToNow } from "date-fns";
export const formattedDate = (date: string | Date | undefined) => {
    // Check if the date is undefined or null
    if (date === undefined || date === null) {
      return "No Date Provided";  // You can customize this fallback message
    }
    // Ensure the date is a valid Date object or string
    const validDate = new Date(date);
    // If it's an invalid date, return an appropriate fallback
    if (isNaN(validDate.getTime())) {
      return "Invalid Date";
    }
    // Return the formatted date
    return format(validDate, "MMM d, yyyy");
}

export const formatDateToNow = (date: string | Date | undefined) => {
  return formatDistanceToNow(date ?? new Date(), { addSuffix: true })
}