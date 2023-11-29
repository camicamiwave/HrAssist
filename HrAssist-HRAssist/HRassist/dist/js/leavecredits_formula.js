function calculateLeaveCredits(start_date, end_date) {
    // Conversion tables
    const month_conversion = {
        1: 1.25, 2: 2.5, 3: 3.75, 4: 5, 5: 6.25, 6: 7.5,
        7: 8.75, 8: 10, 9: 11.25, 10: 12.5, 11: 13.75, 12: 15
    };

    // Parse start and end dates
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);

    // Calculate the number of months and days worked
    const monthsWorked = (endDate.getFullYear() - startDate.getFullYear()) * 12 + endDate.getMonth() - startDate.getMonth();
    const daysInLastMonth = Math.min(endDate.getDate(), (new Date(endDate.getFullYear(), endDate.getMonth() + 1, 1) - startDate) / (1000 * 60 * 60 * 24));

    // Calculate leave credits
    let leaveCredits = monthsWorked * month_conversion[startDate.getMonth() + 1];
    leaveCredits += month_conversion[startDate.getMonth() + 1] * (daysInLastMonth / 30);

    return leaveCredits * 2; // Multiply by 2 for both vacation and sick leave
}

// Example usage Static palang toh
const startDate = "2023-01-01";
const endDate = "2023-04-30";
const result = calculateLeaveCredits(startDate, endDate);
console.log(`The overall leave credits for the employee are: ${result} days`);
