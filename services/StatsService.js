import AsyncStorage from '@react-native-async-storage/async-storage';

const STATS_KEY = 'smileStats';

// Helper to get date in "YYYY-MM-DD" format
const getFormattedDate = (date) => {
  return date.toISOString().split('T')[0];
};

/**
 * Increments the smile count for the current day.
 */
export const incrementSmileCountForToday = async () => {
  try {
    const today = getFormattedDate(new Date());
    const existingStatsRaw = await AsyncStorage.getItem(STATS_KEY);
    const stats = existingStatsRaw ? JSON.parse(existingStatsRaw) : {};

    // Increment today's count, initializing if it doesn't exist
    stats[today] = (stats[today] || 0) + 1;

    await AsyncStorage.setItem(STATS_KEY, JSON.stringify(stats));
    console.log(`Smile count for ${today} is now ${stats[today]}`);
  } catch (e) {
    console.error("Failed to save stats.", e);
  }
};

/**
 * Processes the raw stats data into a structured format for the UI.
 */
export const getProcessedStats = async () => {
  try {
    const existingStatsRaw = await AsyncStorage.getItem(STATS_KEY);
    const stats = existingStatsRaw ? JSON.parse(existingStatsRaw) : {};

    let totalCount = 0;
    let bestDay = { date: 'N/A', count: 0 };
    
    // Calculate total and find the best day
    for (const date in stats) {
      const count = stats[date];
      totalCount += count;
      if (count > bestDay.count) {
        bestDay = { date, count };
      }
    }

    // Get today's count
    const todayStr = getFormattedDate(new Date());
    const todayCount = stats[todayStr] || 0;

    // Get weekly breakdown for the last 7 days
    const weeklyData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = getFormattedDate(d);
      weeklyData.push({
        date: dateStr,
        day: d.toLocaleDateString('en-US', { weekday: 'short' }), // "Sun", "Mon"
        count: stats[dateStr] || 0,
      });
    }

    return {
      todayCount,
      totalCount,
      bestDay,
      weeklyData,
    };

  } catch (e) {
    console.error("Failed to read stats.", e);
    return { todayCount: 0, totalCount: 0, bestDay: { date: 'N/A', count: 0 }, weeklyData: [] };
  }
};

/**
 * Clears all stored statistics (for testing).
 */
export const clearStats = async () => {
  try {
    await AsyncStorage.removeItem(STATS_KEY);
    console.log("Stats cleared successfully.");
  } catch (e) {
    console.error("Failed to clear stats.", e);
  }
};