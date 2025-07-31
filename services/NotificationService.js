import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const INTERVAL_STORAGE_KEY = 'smileReminderInterval';
const DND_START_ID = 'dnd-start-trigger';
const DND_END_ID = 'dnd-end-trigger';

// --- Global Listener for Notification Responses ---
// This runs when a notification is received, even if the app is in the background.
Notifications.addNotificationReceivedListener(async (notification) => {
  const { action } = notification.request.content.data;
  console.log('Received notification in background/foreground with action:', action);

  if (action === 'dnd_start') {
    // DND period is beginning, so we cancel the smile reminders.
    await stopRepeatingNotifications();
    console.log('[DND Manager] DND started. Reminders stopped.');
  } else if (action === 'dnd_end') {
    // DND period has ended. We need to restart the reminders.
    const savedInterval = await AsyncStorage.getItem(INTERVAL_STORAGE_KEY);
    if (savedInterval) {
      await scheduleRepeatingNotifications(parseInt(savedInterval, 10));
      console.log(`[DND Manager] DND ended. Reminders restarted for every ${savedInterval} minutes.`);
    }
  }
});


// Configure how notifications are handled when the app is in the foreground.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Request permissions and set up the Android notification channel.
export async function initNotifications() {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') {
    alert('Failed to get permissions for notifications!');
    return false;
  }
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('reminders', {
      name: 'Smile Reminders 😊',
      importance: Notifications.AndroidImportance.HIGH,
    });
  }
  return true;
}

/**
 * Schedules the main, visible repeating notifications.
 * @param {number} intervalInMinutes The interval for reminders.
 */
export async function scheduleRepeatingNotifications(intervalInMinutes) {
  await stopRepeatingNotifications(); // Always clear before setting new ones

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "😊 Time to Smile!",
      body: "You look beautiful when you smile! Keep shining! 🌟",
    },
    trigger: {
      seconds: intervalInMinutes * 60,
      repeats: true,
    },
  });
  console.log(`Scheduled repeating smile reminders for every ${intervalInMinutes} minutes.`);
  // Also save the interval so the DND manager can use it.
  await AsyncStorage.setItem(INTERVAL_STORAGE_KEY, String(intervalInMinutes));
}

/**
 * Stops the main, visible repeating notifications.
 */
export async function stopRepeatingNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
  console.log('Cancelled all scheduled smile reminders.');
}

/**
 * Manages the DND schedule by setting silent, daily triggers.
 * @param {{hour: number, minute: number}} dndStart The DND start time.
 * @param {{hour: number, minute: number}} dndEnd The DND end time.
 */
export async function manageDNDSchedule(dndStart, dndEnd) {
  // Cancel any existing DND triggers before setting new ones.
  await Notifications.cancelScheduledNotificationAsync(DND_START_ID);
  await Notifications.cancelScheduledNotificationAsync(DND_END_ID);
  console.log('Cancelled previous DND triggers.');

  // Schedule a silent trigger to STOP reminders when DND starts
  await Notifications.scheduleNotificationAsync({
    identifier: DND_START_ID,
    content: {
      title: 'DND Manager', // Not visible to user
      body: 'Stopping reminders for the night.', // Not visible to user
      data: { action: 'dnd_start' },
    },
    trigger: {
      hour: dndStart.hour,
      minute: dndStart.minute,
      repeats: true,
    },
  });
  console.log(`DND 'STOP' trigger set for ${dndStart.hour}:${dndStart.minute} daily.`);

  // Schedule a silent trigger to START reminders when DND ends
  await Notifications.scheduleNotificationAsync({
    identifier: DND_END_ID,
    content: {
      title: 'DND Manager', // Not visible
      body: 'Restarting reminders for the day.', // Not visible
      data: { action: 'dnd_end' },
    },
    trigger: {
      hour: dndEnd.hour,
      minute: dndEnd.minute,
      repeats: true,
    },
  });
  console.log(`DND 'START' trigger set for ${dndEnd.hour}:${dndEnd.minute} daily.`);
}

/**
 * Cancels the silent DND trigger notifications.
 */
export async function cancelDNDSchedule() {
  await Notifications.cancelScheduledNotificationAsync(DND_START_ID);
  await Notifications.cancelScheduledNotificationAsync(DND_END_ID);
  console.log('Cancelled DND trigger notifications.');
}

// --- Test Functions (remain unchanged) ---
let testNotificationInterval = null;

export async function startTestNotifications() {
  stopTestNotifications();
  await sendTestNotification();
  testNotificationInterval = setInterval(async () => {
    await sendTestNotification();
  }, 5000);
}

export function stopTestNotifications() {
  if (testNotificationInterval) {
    clearInterval(testNotificationInterval);
    testNotificationInterval = null;
  }
}

async function sendTestNotification() {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "🛠️ TEST: Smile Check",
      body: "This is a test notification! 😊",
    },
    trigger: { seconds: 1 },
  });
}