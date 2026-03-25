import { View, Text, StyleSheet, ScrollView } from 'react-native';

export default function DashboardScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.placeholder}>
        <Text style={styles.emoji}>📊</Text>
        <Text style={styles.title}>Weight Dashboard</Text>
        <Text style={styles.desc}>
          Weight tracking with charts will be implemented here.{'\n'}
          Uses the same Zustand stores as the web app with AsyncStorage persistence.
        </Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Features coming:</Text>
        <Text style={styles.infoItem}>• Daily weight logging</Text>
        <Text style={styles.infoItem}>• Weight chart (react-native-chart-kit)</Text>
        <Text style={styles.infoItem}>• BMI & goal progress ring</Text>
        <Text style={styles.infoItem}>• Streak counter</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  content: { padding: 20 },
  placeholder: { alignItems: 'center', paddingVertical: 40 },
  emoji: { fontSize: 64, marginBottom: 16 },
  title: { fontSize: 22, fontWeight: '700', color: '#111827', marginBottom: 8 },
  desc: { fontSize: 14, color: '#6b7280', textAlign: 'center', lineHeight: 22 },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  infoTitle: { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 10 },
  infoItem: { fontSize: 14, color: '#6b7280', lineHeight: 24 },
});
