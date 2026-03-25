import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';

const FEATURES = [
  { href: '/workout', title: 'Weekly Workout Plan', desc: 'Structured splits with exercise demos', emoji: '💪' },
  { href: '/meals', title: 'Meal Planner', desc: 'Regional meals: India, Germany, USA', emoji: '🍽️' },
  { href: '/dashboard', title: 'Weight Dashboard', desc: 'Track weight daily with charts', emoji: '📊' },
  { href: '/profile', title: 'Your Profile', desc: 'Set goals, activity & region', emoji: '👤' },
];

export default function HomeScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>
          Fit<Text style={styles.heroAccent}>In</Text>
        </Text>
        <Text style={styles.heroSub}>
          Your free fitness & meal planning companion.
        </Text>
      </View>

      {FEATURES.map((f) => (
        <Link key={f.href} href={f.href as any} asChild>
          <TouchableOpacity style={styles.card}>
            <Text style={styles.cardEmoji}>{f.emoji}</Text>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{f.title}</Text>
              <Text style={styles.cardDesc}>{f.desc}</Text>
            </View>
          </TouchableOpacity>
        </Link>
      ))}

      <Text style={styles.footer}>FitIn v1.0 — Free forever</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  content: { padding: 20 },
  hero: { alignItems: 'center', marginBottom: 24, marginTop: 12 },
  heroTitle: { fontSize: 36, fontWeight: '800', color: '#111827' },
  heroAccent: { color: '#22c55e' },
  heroSub: { fontSize: 14, color: '#6b7280', marginTop: 6, textAlign: 'center' },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  cardEmoji: { fontSize: 32, marginRight: 14 },
  cardContent: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 2 },
  cardDesc: { fontSize: 13, color: '#6b7280' },
  footer: { textAlign: 'center', fontSize: 11, color: '#d1d5db', marginTop: 20, marginBottom: 40 },
});
