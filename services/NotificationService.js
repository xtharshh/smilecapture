import * as Notifications from 'expo-notifications';
import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import { Platform } from 'react-native';

const BACKGROUND_TASK = 'smile-reminder-task';
let testNotificationInterval = null;
let currentInterval = 15 * 60;
let dndStartTime = null;
let dndEndTime = null;

TaskManager.defineTask(BACKGROUND_TASK, async () => {
  if (!isDNDActive()) {
    await sendNotification();
  }
  return BackgroundFetch.Result.NewData;
});

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function initNotifications() {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') return false;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('reminders', {
      name: 'Smile Reminders 😊',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF6347',
    });
  }
  return true;
}

export function setReminderInterval(minutes) {
  currentInterval = minutes * 60;
}

export function setDNDMode(startTime, endTime) {
  dndStartTime = startTime;
  dndEndTime = endTime;
  console.log('DND set to:', startTime, 'to', endTime);
}

function isDNDActive() {
  if (!dndStartTime || !dndEndTime) return false;
  
  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();
  const startTime = dndStartTime.hour * 60 + dndStartTime.minute;
  const endTime = dndEndTime.hour * 60 + dndEndTime.minute;

  return startTime <= endTime 
    ? currentTime >= startTime && currentTime < endTime
    : currentTime >= startTime || currentTime < endTime;
}

export async function startForegroundNotifications() {
  try {
    await BackgroundFetch.registerTaskAsync(BACKGROUND_TASK, {
      minimumInterval: currentInterval,
      stopOnTerminate: false,
      startOnBoot: true,
    });
    if (!isDNDActive()) {
      await sendNotification();
    }
  } catch (err) {
    console.log('BackgroundFetch failed:', err);
  }
}

export async function stopForegroundNotifications() {
  await BackgroundFetch.unregisterTaskAsync(BACKGROUND_TASK);
}

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

async function sendNotification() {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "😊 Time to Smile!",
      body: "You look beautiful when you smile! Keep shining! 🌟",
      sound: true,
    },
    trigger: { seconds: 2 }
  });
}

async function sendTestNotification() {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "🛠️ TEST: Smile Check",
      body: "This is a test notification! 😊",
      sound: true,
    },
    trigger: { seconds: 1 }
  });
}