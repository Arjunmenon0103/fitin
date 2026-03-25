import { View, Text, StyleSheet, ScrollView } from 'react-native';

export default function ProfileScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.placeholder}>
        <Text style={styles.emoji}>👤</Text>
        <Text style={styles.title}>Profile Setup</Text>
        <Text style={styles.desc}>
          Onboarding wizard will be implemented here.{'\n'}
          Same flow as the web app: name, age, body stats, goals, region.
        </Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Profile captures:</Text>
        <Text style={styles.infoItem}>• Name, age, gender</Text>
        <Text style={styles.infoItem}>• Height, current weight, target weight</Text>
        <Text style={styles.infoItem}>• Activity level (sedentary to very active)</Text>
        <Text style={styles.infoItem}>• Fitness goal (lose/maintain/build)</Text>
        <Text style={styles.infoItem}>• Region (India / Germany / USA)</Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Storage:</Text>
        <Text style={styles.infoItem}>AsyncStorage for local persistence</Text>
        <Text style={styles.infoItem}>Same Zustand store architecture as web</Text>
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
    marginTop: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  infoTitle: { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 10 },
  infoItem: { fontSize: 14, color: '#6b7280', lineHeight: 24 },
});
