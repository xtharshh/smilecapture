import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  useColorScheme,
  Appearance,
  Modal,
  StatusBar,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';

import { incrementSmileCountForToday } from '../services/StatsService';

import {
  initNotifications,
  scheduleRepeatingNotifications,
  stopRepeatingNotifications,
  manageDNDSchedule,
  cancelDNDSchedule,
  startTestNotifications,
  stopTestNotifications,
} from '../services/NotificationService';

const LAUGHING_QUOTES = [
  "Connecting people with smiles—no signal needed! 😊",
  "A day without laughter is like a phone without signal—stay connected with joy! 📶",
  "Keep smiling, it’s as iconic as your favorite ringtone! 🎵",
  "Stay strong and smile—classic style, unbreakable spirit! 💪📱",
  "Laughter: the original wireless connection. 🔗😂",
  "Smiling is like charging your soul—100% happiness guaranteed! 🔋😊",
  "Why so serious? Life’s better with a giggle and a grin! 😄🎉",
  "Laugh like your battery’s always full. 🔋🤣",
  "Smiles are free, but they’re worth a fortune. 💸😁",
  "Your laugh is your personal ringtone—make it loud and proud! 🎶😆",
  "Grin like you just got unlimited data and zero responsibilities. 📱😜",
  "Laughter is the best app—no updates needed! 📲😂"
];

const JOKES = [
  "Why did the smartphone go to school? To become smarter!",
  "Why did the phone get glasses? Because it lost its contacts!",
  "Why was the cell phone wearing a tuxedo? It had a fancy ringtone!",
  "Why did the mobile phone go to therapy? It lost its sense of touch!",
  "Why did Nokia never get lost? Because it always had good reception!"
];

// Animation JSON files (make sure these files exist in the assets folder)
const SMILE_ANIMATION = require('../assets/smile-animation.json');
const LAUGH_ANIMATION = require('../assets/laugh-animation.json');

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
  const [dndSaved, setDndSaved] = useState(false);
  const [quote, setQuote] = useState(getRandomQuote());
  const [modalVisible, setModalVisible] = useState(false);
  const [joke, setJoke] = useState('');
  const navigation = useNavigation();
  const colorScheme = useColorScheme() || Appearance.getColorScheme();

  // Animation state: 'smile' or 'laugh'
  const [animationKey, setAnimationKey] = useState('smile');

  useEffect(() => {
    initNotifications();

    // Switch to laugh animation after 7 seconds
    const animationTimer = setTimeout(() => {
      setAnimationKey('laugh');
    }, 7000);

    // Cleanup timer on unmount
    return () => clearTimeout(animationTimer);
  }, []);

  const isDNDActive = () => {
    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    const startMinutes = dndStart.getHours() * 60 + dndStart.getMinutes();
    const endMinutes = dndEnd.getHours() * 60 + dndEnd.getMinutes();
    if (startMinutes <= endMinutes) {
      return nowMinutes >= startMinutes && nowMinutes < endMinutes;
    } else {
      return nowMinutes >= startMinutes || nowMinutes < endMinutes;
    }
  };

  const toggleNotifications = async () => {
    if (isActive) {
      await stopRepeatingNotifications();
      await cancelDNDSchedule();
    } else {
      if (isDNDActive()) {
        alert('Do Not Disturb is active. Reminders will start after the DND period ends.');
      } else {
        await scheduleRepeatingNotifications(interval);
      }
      const start = { hour: dndStart.getHours(), minute: dndStart.getMinutes() };
      const end = { hour: dndEnd.getHours(), minute: dndEnd.getMinutes() };
      await manageDNDSchedule(start, end);
    }
    setIsActive(!isActive);
  };

  const updateDNDSettings = async () => {
    const start = { hour: dndStart.getHours(), minute: dndStart.getMinutes() };
    const end = { hour: dndEnd.getHours(), minute: dndEnd.getMinutes() };
    setDndSaved(true);
    setTimeout(() => setDndSaved(false), 2000);
    if (isActive) {
      await manageDNDSchedule(start, end);
    }
  };

  const toggleTestNotifications = async () => {
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
      if (pickerMode === 'start') setDNDStart(selectedTime);
      else setDNDEnd(selectedTime);
      setDndSaved(false);
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const showJokeModal = () => {
    const randomJoke = JOKES[Math.floor(Math.random() * JOKES.length)];
    setJoke(randomJoke);
    setModalVisible(true);
  };

  const handleSmileClick = async () => {
    await incrementSmileCountForToday();
    navigation.navigate('Camera');
  };

  const isDark = colorScheme === 'dark';
  const cardTextColor = '#232526';
  const subTextColor = isDark ? '#b0b0b0' : '#888';

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#f5f6fa" barStyle="dark-content" />
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerContainer}>
          <TouchableOpacity
            style={styles.statsIcon}
            onPress={() => navigation.navigate('Stats')}
          >
            <Ionicons name="stats-chart" size={32} color="#43c6ac" />
          </TouchableOpacity>

          <TouchableOpacity onPress={showJokeModal} activeOpacity={0.7}>
            <LottieView
              key={animationKey} // helps force re-render
              source={animationKey === 'smile' ? SMILE_ANIMATION : LAUGH_ANIMATION}
              style={styles.lottieAnimation}
              autoPlay
              loop
            />
          </TouchableOpacity>
        </View>

        <Text style={styles.emojiHint}>Click the animation to see a joke</Text>
        <Text style={styles.laughingQuote}>
          <Text style={styles.quoteMark}>“</Text>
          {quote}
          <Text style={styles.quoteMark}>”</Text>
        </Text>

        <View style={[styles.card, { shadowColor: isDark ? '#000' : '#43c6ac' }]}>
          <Text style={[styles.label, { color: cardTextColor }]}>Reminder Interval</Text>
          <View style={styles.intervalContainer}>
            {[15, 30, 60, 120].map((mins) => (
              <TouchableOpacity
                key={mins}
                style={[styles.intervalButton, interval === mins && { backgroundColor: '#43c6ac' }]}
                onPress={() => setInterval(mins)}
              >
                <Text
                  style={[
                    styles.intervalText,
                    { color: interval === mins ? '#fff' : cardTextColor, fontWeight: interval === mins ? 'bold' : 'normal' }
                  ]}
                >
                  {mins < 61 ? `${mins} min` : `${mins / 60} hr`}{mins > 60 ? 's' : ''}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={[styles.card, { shadowColor: isDark ? '#000' : '#43c6ac' }]}>
          <Text style={[styles.label, { color: cardTextColor }]}>Do Not Disturb (Sleep Time)</Text>
          <View style={styles.timeRow}>
            <TouchableOpacity style={styles.timeButton} onPress={() => showTimePicker('start')}>
              <Text style={{ color: cardTextColor }}>{formatTime(dndStart)}</Text>
            </TouchableOpacity>
            <Text style={{ color: cardTextColor, fontWeight: 'bold' }}> to </Text>
            <TouchableOpacity style={styles.timeButton} onPress={() => showTimePicker('end')}>
              <Text style={{ color: cardTextColor }}>{formatTime(dndEnd)}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: dndSaved ? '#4CAF50' : '#43c6ac' }]}
              onPress={updateDNDSettings}
            >
              <Text style={styles.saveButtonText}>{dndSaved ? 'Saved!' : 'Save'}</Text>
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
                onChange={(event, selectedTime) => { if (selectedTime) setDNDStart(selectedTime); }}
              />
              <Text style={{ color: cardTextColor }}>to</Text>
              <DateTimePicker
                value={dndEnd}
                mode="time"
                display="spinner"
                onChange={(event, selectedTime) => { if (selectedTime) setDNDEnd(selectedTime); }}
              />
            </View>
          )}
        </View>

        {/* Reminder Button */}
        <TouchableOpacity
          style={[styles.actionButton, isActive && { backgroundColor: '#4CAF50' }]}
          onPress={toggleNotifications}
        >
          <Ionicons
            name={isActive ? "notifications-off-outline" : "notifications-outline"}
            size={22}
            color="#fff"
            style={{ marginRight: 8 }}
          />
          <Text style={styles.actionButtonText}>
            {isActive ? 'Stop Reminders' : `Start Reminders (${interval} min)`}
          </Text>
        </TouchableOpacity>

        {/* Test Button */}
        <TouchableOpacity
          style={[styles.actionButton, isTesting && { backgroundColor: '#e67e22' }]}
          onPress={toggleTestNotifications}
        >
          <Ionicons
            name={isTesting ? "pause-circle-outline" : "play-circle-outline"}
            size={22}
            color="#fff"
            style={{ marginRight: 8 }}
          />
          <Text style={styles.actionButtonText}>
            {isTesting ? 'Stop Test' : 'Start Test (5 sec)'}
          </Text>
        </TouchableOpacity>

        {/* Smile Button */}
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#185a9d' }]}
          onPress={handleSmileClick}
        >
          <Ionicons
            name="happy-outline"
            size={22}
            color="#fff"
            style={{ marginRight: 8 }}
          />
          <Text style={styles.actionButtonText}>Click to Smile</Text>
        </TouchableOpacity>

        <Text style={[styles.statusText, { color: subTextColor }]}>
          {isTesting ? 'TEST MODE ACTIVE' :
            isActive ? `REMINDERS ACTIVE (every ${interval} min)` :
              'NOTIFICATIONS OFF'}
        </Text>

        <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
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

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f6fa',
  },
  scrollContainer: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingBottom: 40,
    paddingHorizontal: 10,
  },
  headerContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 30,
    marginBottom: 5,
    position: 'relative',
    height: 220,
  },
  statsIcon: {
    position: 'absolute',
    top: 0,
    left: 10,
    zIndex: 10,
    padding: 10,
  },
  lottieAnimation: {
    width: 200,
    height: 200,
  },
  emojiHint: {
    fontSize: 15,
    color: '#888',
    fontStyle: 'italic',
    marginBottom: 15,
    textAlign: 'center',
  },
  laughingQuote: {
    fontSize: 20,
    fontWeight: '600',
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 20,
    backgroundColor: '#eafaf1',
    borderLeftWidth: 5,
    borderLeftColor: '#43c6ac',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 16,
    marginHorizontal: 8,
    shadowColor: '#43c6ac',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
    color: '#555',
  },
  quoteMark: {
    color: '#43c6ac',
    fontSize: 28,
    fontWeight: 'bold'
  },
  card: {
    width: '100%',
    borderRadius: 22,
    padding: 20,
    marginBottom: 20,
    backgroundColor: '#fff',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4,
  },
  label: {
    fontSize: 20,
    fontWeight: '600',
    marginLeft: 10,
    marginBottom: 15
  },
  intervalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around'
  },
  intervalButton: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: '#f0f0f0'
  },
  intervalText: { fontSize: 16 },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  timeButton: {
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
    marginHorizontal: 5,
    minWidth: 80,
    alignItems: 'center',
  },
  saveButton: {
    padding: 15,
    borderRadius: 10,
    marginLeft: 'auto',
    minWidth: 80,
    alignItems: 'center',
  },
  saveButtonText: { color: '#fff', fontWeight: 'bold' },
  iosPickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButton: {
    padding: 16,
    borderRadius: 18,
    backgroundColor: '#126132ff',
    marginVertical: 8,
    width: '100%',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',

    shadowColor: '#43c6ac',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 3,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold'
  },
  statusText: {
    marginTop: 20,
    fontSize: 15,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 22,
    padding: 28,
    alignItems: 'center',
    width: '85%',
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
});

export default AppUI;
