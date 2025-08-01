import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// --- Using specific identifiers for DND triggers ---
const DND_START_ID = 'dnd-start-trigger';
const DND_END_ID = 'dnd-end-trigger';

// --- Keys for AsyncStorage ---
const INTERVAL_STORAGE_KEY = 'smileReminderInterval';
const REMINDERS_ACTIVE_FLAG = 'remindersAreActive'; // IMPORTANT: Tracks user's intent

// --- SIMPLIFIED LISTENER ---
// This listener now ONLY handles DND triggers. It does NOT reschedule main reminders.
Notifications.addNotificationReceivedListener(async (notification) => {
  const action = notification.request.content.data?.action;

  // If this isn't a DND notification, do nothing.
  if (!action) {
    return;
  }

  if (action === 'dnd_start') {
    console.log('[Listener] DND start trigger received. Stopping all reminders for the night.');
    // When DND starts, it simply cancels everything.
    await Notifications.cancelAllScheduledNotificationsAsync();
  } 
  else if (action === 'dnd_end') {
    console.log('[Listener] DND end trigger received. Checking if reminders should restart...');
    // When DND ends, check if the user *wanted* them active.
    const shouldBeActive = await AsyncStorage.getItem(REMINDERS_ACTIVE_FLAG);
    if (shouldBeActive === 'true') {
      const savedInterval = await AsyncStorage.getItem(INTERVAL_STORAGE_KEY);
      if (savedInterval) {
        const interval = parseInt(savedInterval, 10);
        console.log(`[Listener] Reminders were active. Restarting for every ${interval} minutes.`);
        // Call the main scheduling function to set up the repeating task again.
        await scheduleRepeatingNotifications(interval);
      }
    } else {
      console.log('[Listener] Reminders were not active, so they will not be restarted.');
    }
  }
});

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

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
      sound: 'default',
    });
  }
  return true;
}

/**
 * Schedules a TRUE repeating notification. This is called from the UI.
 * @param {number} intervalInMinutes The interval for reminders.
 */
export async function scheduleRepeatingNotifications(intervalInMinutes) {
  // Always clear previous tasks before starting a new one.
  await Notifications.cancelAllScheduledNotificationsAsync();

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "😊 Time to Smile!",
      body: "You look beautiful when you smile! Keep shining! 🌟",
      sound: 'default',
    },
    // Use a simple, reliable repeating trigger.
    trigger: {
      seconds: intervalInMinutes * 60,
      repeats: true,
      channelId: 'reminders',
    },
  });
  
  // Set the flags to indicate that reminders are now ON.
  await AsyncStorage.setItem(REMINDERS_ACTIVE_FLAG, 'true');
  await AsyncStorage.setItem(INTERVAL_STORAGE_KEY, String(intervalInMinutes));
  console.log(`SUCCESS: Scheduled repeating reminders for every ${intervalInMinutes} minutes.`);
}

/**
 * Stops ALL scheduled notifications. This is called from the UI.
 */
export async function stopRepeatingNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
  // Set the flag to indicate reminders are now OFF.
  await AsyncStorage.setItem(REMINDERS_ACTIVE_FLAG, 'false');
  console.log('SUCCESS: Stopped all scheduled notifications. Reminders are now INACTIVE.');
}

/**
 * Manages the DND schedule. It sets up its OWN triggers, separate from the main ones.
 */
export async function manageDNDSchedule(dndStart, dndEnd) {
  // Always clear old DND triggers before setting new ones.
  await Notifications.cancelScheduledNotificationAsync(DND_START_ID);
  await Notifications.cancelScheduledNotificationAsync(DND_END_ID);

  // Schedule the trigger to STOP reminders
  await Notifications.scheduleNotificationAsync({
    identifier: DND_START_ID,
    content: { data: { action: 'dnd_start' } },
    trigger: { hour: dndStart.hour, minute: dndStart.minute, repeats: true, channelId: 'reminders' },
  });

  // Schedule the trigger to potentially RESTART reminders
  await Notifications.scheduleNotificationAsync({
    identifier: DND_END_ID,
    content: { data: { action: 'dnd_end' } },
    trigger: { hour: dndEnd.hour, minute: dndEnd.minute, repeats: true, channelId: 'reminders' },
  });
  
  console.log(`SUCCESS: DND triggers set for ${dndStart.hour}:${dndStart.minute} (stop) and ${dndEnd.hour}:${dndEnd.minute} (start).`);
}

/**
 * Cancels only the DND trigger notifications.
 */
export async function cancelDNDSchedule() {
  await Notifications.cancelScheduledNotificationAsync(DND_START_ID);
  await Notifications.cancelScheduledNotificationAsync(DND_END_ID);
  console.log('SUCCESS: Cancelled DND trigger notifications.');
}

// --- Test Functions (Unchanged, they work fine) ---
let testNotificationInterval = null;
export async function startTestNotifications() {
  stopTestNotifications();
  await sendTestNotification();
  testNotificationInterval = setInterval(sendTestNotification, 5000);
}
export function stopTestNotifications() {
  if (testNotificationInterval) {
    clearInterval(testNotificationInterval);
    testNotificationInterval = null;
  }
}
async function sendTestNotification() {
  await Notifications.scheduleNotificationAsync({
    content: { title: "🛠️ TEST: Smile Check", body: "This is a test notification! 😊" },
    trigger: { seconds: 1 },
  });
}