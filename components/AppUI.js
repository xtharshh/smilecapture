import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, useColorScheme, Appearance, Modal, StatusBar } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

import {
  initNotifications,
  startForegroundNotifications,
  stopForegroundNotifications,
  startTestNotifications,
  stopTestNotifications,
  setReminderInterval,
  setDNDMode
} from '../services/NotificationService';

const LAUGHING_QUOTES = [
  "Connecting people with smiles, just like Nokia! 😊",
  "A day without laughter is like a phone without signal—ask Nokia, they always kept us connected! 📶",
  "Keep smiling, it’s as iconic as the Nokia ringtone! 🎵",
  "Stay strong and smile—Nokia 3310 style! 💪📱",
  "Smile, it’s free therapy—Nokia would approve! 😃"
];

const JOKES = [
  "Why did the smartphone go to school? To become smarter!",
  "Why did the phone get glasses? Because it lost its contacts!",
  "Why was the cell phone wearing a tuxedo? It had a fancy ringtone!",
  "Why did the mobile phone go to therapy? It lost its sense of touch!",
  "Why did Nokia never get lost? Because it always had good reception!"
];

const getRandomQuote = () => {
  return LAUGHING_QUOTES[Math.floor(Math.random() * LAUGHING_QUOTES.length)];
};

const AppUI = () => {
  const [isActive, setIsActive] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [interval, setInterval] = useState(15);
  const [showPicker, setShowPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState(null);
  const [dndStart, setDNDStart] = useState(new Date(0, 0, 0, 22, 0));
  const [dndEnd, setDNDEnd] = useState(new Date(0, 0, 0, 7, 0));
  const [dndStartTime, setDNDStartTime] = useState({ hour: 22, minute: 0 });
  const [dndEndTime, setDNDEndTime] = useState({ hour: 7, minute: 0 });
  const [dndSaved, setDndSaved] = useState(false);
  const [quote, setQuote] = useState(getRandomQuote());
  const [modalVisible, setModalVisible] = useState(false);
  const [joke, setJoke] = useState('');
  const navigation = useNavigation();
  const colorScheme = useColorScheme() || Appearance.getColorScheme();

  useEffect(() => {
    initNotifications();
  }, []);

  // Helper to check if current time is in DND window
  const isInDND = () => {
    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    const startMinutes = dndStart.getHours() * 60 + dndStart.getMinutes();
    const endMinutes = dndEnd.getHours() * 60 + dndEnd.getMinutes();

    if (startMinutes < endMinutes) {
      // DND does not cross midnight
      return nowMinutes >= startMinutes && nowMinutes < endMinutes;
    } else {
      // DND crosses midnight
      return nowMinutes >= startMinutes || nowMinutes < endMinutes;
    }
  };

  const toggleNotifications = async () => {
    if (isInDND()) {
      alert('Do Not Disturb is active. Reminders will not start.');
      return;
    }
    if (isActive) {
      await stopForegroundNotifications();
    } else {
      await setReminderInterval(interval);
      await startForegroundNotifications();
    }
    setIsActive(!isActive);
  };

  const toggleTestNotifications = async () => {
    if (isInDND()) {
      alert('Do Not Disturb is active. Test notifications will not start.');
      return;
    }
    if (isTesting) {
      await stopTestNotifications();
    } else {
      await startTestNotifications();
    }
    setIsTesting(!isTesting);
  };

  const showTimePicker = (mode) => {
    setPickerMode(mode);
    setShowPicker(true);
  };

  const handleTimeChange = (event, selectedTime) => {
    setShowPicker(false);
    if (selectedTime) {
      if (pickerMode === 'start') {
        setDNDStart(selectedTime);
      } else {
        setDNDEnd(selectedTime);
      }
      setDndSaved(false);
    }
  };

  const updateDNDSettings = () => {
    const start = {
      hour: dndStart.getHours(),
      minute: dndStart.getMinutes()
    };
    const end = {
      hour: dndEnd.getHours(),
      minute: dndEnd.getMinutes()
    };

    setDNDMode(start, end);
    setDNDStartTime(start);
    setDNDEndTime(end);
    setDndSaved(true);
    setTimeout(() => setDndSaved(false), 2000);
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatTimeFromObject = (timeObj) => {
    if (!timeObj) return '';
    const date = new Date(0, 0, 0, timeObj.hour, timeObj.minute);
    return formatTime(date);
  };

  const showJokeModal = () => {
    const randomJoke = JOKES[Math.floor(Math.random() * JOKES.length)];
    setJoke(randomJoke);
    setModalVisible(true);
  };

  // Colors for dark/light mode
  const isDark = colorScheme === 'dark';
  // Force cardBg to always be white (or set your preferred color)
  const cardBg = '#fff';
  const textColor = isDark ? '#fff' : '#232526';
  const subTextColor = isDark ? '#b0b0b0' : '#888';
  // Force dark text for card content
  const cardTextColor = '#232526';
  const cardSubTextColor = '#555';

  return (
    <View style={[styles.safeArea, { backgroundColor: '#f5f6fa' }]}>
      <StatusBar backgroundColor="#f5f6fa" barStyle="dark-content" />
      {/* Emoji with onPress */}
      <TouchableOpacity onPress={showJokeModal} activeOpacity={0.7}>
        <Text style={[styles.bigEmoji, { marginTop: 30 }]}>😄</Text>
      </TouchableOpacity>
      <Text style={styles.emojiHint}>Click on emoji to see joke</Text>
      <Text style={[styles.laughingQuote, { color: subTextColor }]}>
        <Text style={styles.quoteMark}>“</Text>
        {quote}
        <Text style={styles.quoteMark}>”</Text>
      </Text>

      <View style={[styles.card, { backgroundColor: cardBg, shadowColor: isDark ? '#000' : '#43c6ac' }]}>
        <Text style={[styles.label, { color: cardTextColor }]}>Reminder Interval</Text>
        <View style={styles.intervalContainer}>
          {[15, 30, 60, 120].map((mins) => (
            <TouchableOpacity
              key={mins}
              style={[
                styles.intervalButton,
                interval === mins && { backgroundColor: '#43c6ac' }
              ]}
              onPress={() => setInterval(mins)}
            >
              <Text style={[
                styles.intervalText,
                { color: interval === mins ? '#fff' : cardTextColor, fontWeight: interval === mins ? 'bold' : 'normal' }
              ]}>
                {mins === 60 ? '1 hour' : mins === 120 ? '2 hours' : `${mins} min`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: cardBg, shadowColor: isDark ? '#000' : '#43c6ac' }]}>
        <Text style={[styles.label, { color: cardTextColor }]}>Do Not Disturb (Sleep Time)</Text>
        <View style={styles.timeRow}>
          <TouchableOpacity
            style={styles.timeButton}
            onPress={() => showTimePicker('start')}>
            <Text style={{ color: cardTextColor }}>{formatTime(dndStart)}</Text>
          </TouchableOpacity>
          <Text style={{ color: cardTextColor, fontWeight: 'bold' }}> to </Text>
          <TouchableOpacity
            style={styles.timeButton}
            onPress={() => showTimePicker('end')}>
            <Text style={{ color: cardTextColor }}>{formatTime(dndEnd)}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.saveButton,
              { backgroundColor: dndSaved ? '#4CAF50' : '#43c6ac' }
            ]}
            onPress={updateDNDSettings}>
            <Text style={styles.saveButtonText}>
              {dndSaved ? 'Saved!' : 'Save'}
            </Text>
          </TouchableOpacity>
        </View>
        {Platform.OS === 'android' && showPicker && (
          <DateTimePicker
            value={pickerMode === 'start' ? dndStart : dndEnd}
            mode="time"
            is24Hour={true}
            display="spinner"
            onChange={handleTimeChange}
          />
        )}
        {Platform.OS === 'ios' && (
          <View style={styles.iosPickerContainer}>
            <DateTimePicker
              value={dndStart}
              mode="time"
              display="spinner"
              onChange={(event, selectedTime) => {
                if (selectedTime) setDNDStart(selectedTime);
              }}
            />
            <Text style={{ color: textColor }}>to</Text>
            <DateTimePicker
              value={dndEnd}
              mode="time"
              display="spinner"
              onChange={(event, selectedTime) => {
                if (selectedTime) setDNDEnd(selectedTime);
              }}
            />
          </View>
        )}
      </View>

      <TouchableOpacity
        style={[styles.actionButton, isActive && { backgroundColor: '#4CAF50' }]}
        onPress={toggleNotifications}>
        <Text style={styles.actionButtonText}>
          {isActive ? 'Stop Reminders' : `Start Reminders (${interval} min)`}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.actionButton, isTesting && { backgroundColor: '#e67e22' }]}
        onPress={toggleTestNotifications}>
        <Text style={styles.actionButtonText}>
          {isTesting ? 'Stop Test' : 'Start Test (5 sec)'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.actionButton, { backgroundColor: '#185a9d' }]}
        onPress={() => navigation.navigate('Camera')}
      >
        <Text style={styles.actionButtonText}>Click to Smile</Text>
      </TouchableOpacity>

      <Text style={[styles.statusText, { color: subTextColor }]}>
        {isTesting ? 'TEST MODE ACTIVE' :
          isActive ? `REMINDERS ACTIVE (${interval} min intervals)` :
            'NOTIFICATIONS OFF'}
        {(dndStartTime && dndEndTime) ?
          ` | DND: ${formatTimeFromObject(dndStartTime)} - ${formatTimeFromObject(dndEndTime)}` : ''}
      </Text>

      {/* Modal for jokes */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.jokeTitle}>😂 Funny Joke</Text>
            <Text style={styles.jokeText}>{joke}</Text>
            <TouchableOpacity style={styles.closeModalButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.closeModalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safeArea: { flex: 1, alignItems: 'center', justifyContent: 'flex-start', paddingTop: 0 },
  bigEmoji: {
    fontSize: 100,
    textAlign: 'center',
    marginBottom: 2,

  },
  emojiHint: {
    fontSize: 15,
    color: '#888',
    fontStyle: 'italic',
    marginBottom: 4,
    textAlign: 'center',
  },
  laughingQuote: {
    fontSize: 20,
    fontWeight: '600',
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 14,
    backgroundColor: '#eafaf1',
    borderLeftWidth: 5,
    borderLeftColor: '#43c6ac',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 16,
    marginHorizontal: 18,
    shadowColor: '#43c6ac',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 6,
    elevation: 2,
  },
  quoteMark: {
    color: '#43c6ac',
    fontSize: 28,
    fontWeight: 'bold',
  },
  card: {
    width: '92%',
    borderRadius: 22,
    padding: 18,
    marginBottom: 18,
    backgroundColor: '#fff', // Ensure this is set
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4,
  },
  label: { fontSize: 20, fontWeight: '600', marginLeft: 10, marginBottom: 10 },
  intervalContainer: { flexDirection: 'row', justifyContent: 'space-between' },
  intervalButton: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    marginHorizontal: 5,
    marginBottom: 4,
  },
  intervalText: { fontSize: 16 },
  timeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  timeButton: {
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
    marginHorizontal: 5,
    minWidth: 60,
    alignItems: 'center',
    marginLeft: 10,
  },
  saveButton: {
    padding: 15,
    borderRadius: 10,
    marginLeft: 18,
    minWidth: 80,
    alignItems: 'center'
  },
  saveButtonText: { color: '#fff', fontWeight: 'bold' },
  iosPickerContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  actionButton: {
    padding: 16,
    borderRadius: 18,
    backgroundColor: '#126132ff',
    marginVertical: 8,
    width: '92%',
    alignItems: 'center',
    shadowColor: '#43c6ac',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 3,
  },
  actionButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  statusText: { marginTop: 18, fontSize: 15, textAlign: 'center', color: '#00000' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 22,
    padding: 28,
    alignItems: 'center',
    width: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  jokeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#43c6ac',
    textAlign: 'center',
  },
  jokeText: {
    fontSize: 18,
    color: '#232526',
    marginBottom: 24,
    textAlign: 'center',
  },
  closeModalButton: {
    backgroundColor: '#43c6ac',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 32,
  },
  closeModalButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  previewContainer: {
    flex: 1,
    backgroundColor: '#fff', // was 'black'
    justifyContent: 'center',
    alignItems: 'center'
  },
});

export default AppUI;