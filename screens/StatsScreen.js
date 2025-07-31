import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { BarChart } from 'react-native-chart-kit';
import { getProcessedStats, clearStats } from '../services/StatsService';
import { Ionicons } from '@expo/vector-icons';

const screenWidth = Dimensions.get('window').width;

const StatsScreen = ({ navigation }) => {
  const [stats, setStats] = useState(null);

  useFocusEffect(
    React.useCallback(() => {
      const fetchStats = async () => {
        const processedStats = await getProcessedStats();
        setStats(processedStats);
      };
      fetchStats();
    }, [])
  );

  const handleClearStats = async () => {
    await clearStats();
    const processedStats = await getProcessedStats();
    setStats(processedStats);
  };

  if (!stats) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading stats...</Text>
      </View>
    );
  }
  
  const chartData = {
    labels: stats.weeklyData.map(d => d.day),
    datasets: [
      {
        data: stats.weeklyData.map(d => d.count),
      },
    ],
  };

  const chartConfig = {
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(67, 198, 172, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForBackgroundLines: {
        stroke: '#e3e3e3',
        strokeDasharray: '',
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
           <Ionicons name="arrow-back" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Your Smile Stats</Text>
      </View>

      <View style={styles.summaryContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{stats.todayCount}</Text>
          <Text style={styles.statLabel}>Smiles Today</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{stats.totalCount}</Text>
          <Text style={styles.statLabel}>Total Smiles</Text>
        </View>
      </View>
      
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🌟 Best Day</Text>
        <Text style={styles.bestDayText}>
          {stats.bestDay.count > 0 ? `${stats.bestDay.date} with ${stats.bestDay.count} smiles!` : 'Start smiling!'}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Weekly Breakdown</Text>
        <BarChart
          data={chartData}
          // --- THIS IS THE FIX ---
          // Adjusted width to account for the card's internal padding (20 + 20)
          width={screenWidth - 80} 
          height={220}
          chartConfig={chartConfig}
          yAxisLabel=""
          yAxisSuffix=""
          verticalLabelRotation={0}
          fromZero={true}
          style={{
            marginVertical: 8,
            borderRadius: 16,
          }}
        />
      </View>
      
      <TouchableOpacity onPress={handleClearStats} style={styles.clearButton}>
        <Text style={styles.clearButtonText}>Clear All Stats</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f6fa' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 50, paddingBottom: 10 },
  backButton: { marginRight: 15, padding: 5 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#232526' },
  summaryContainer: { flexDirection: 'row', justifyContent: 'space-around', marginHorizontal: 10, marginBottom: 20, },
  statBox: { flex: 1, backgroundColor: '#fff', borderRadius: 16, padding: 20, alignItems: 'center', marginHorizontal: 10, elevation: 3, shadowColor: '#43c6ac', shadowOpacity: 0.1, shadowRadius: 10 },
  statValue: { fontSize: 32, fontWeight: 'bold', color: '#43c6ac' },
  statLabel: { fontSize: 16, color: '#555', marginTop: 5 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 20, marginHorizontal: 20, marginBottom: 20, elevation: 3, shadowColor: '#43c6ac', shadowOpacity: 0.1, shadowRadius: 10, },
  cardTitle: { fontSize: 20, fontWeight: '600', color: '#232526', marginBottom: 5, },
  bestDayText: { fontSize: 18, color: '#444' },
  clearButton: { backgroundColor: '#e74c3c', padding: 15, borderRadius: 16, marginHorizontal: 20, marginBottom: 40, alignItems: 'center' },
  clearButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});

export default StatsScreen;