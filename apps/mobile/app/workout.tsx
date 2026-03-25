import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { generateWeekPlan, getExerciseById, SPLIT_LABELS, DAY_NAMES } from '@fitin/core';

const plan = generateWeekPlan('ppl');

export default function WorkoutScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>{SPLIT_LABELS['ppl']}</Text>

      {plan.days.map((day, i) => (
        <View key={i} style={styles.dayCard}>
          <View style={styles.dayHeader}>
            <Text style={styles.dayName}>{DAY_NAMES[i]}</Text>
            <Text style={styles.dayLabel}>{day.label}</Text>
          </View>
          {day.isRestDay ? (
            <Text style={styles.restText}>Rest & Recover</Text>
          ) : (
            day.exercises.map((we, j) => {
              const ex = getExerciseById(we.exerciseId);
              return (
                <View key={j} style={styles.exerciseRow}>
                  <Text style={styles.exName}>{ex?.name || we.exerciseId}</Text>
                  <Text style={styles.exDetail}>
                    {we.sets}x{we.reps} • {we.restSeconds}s rest
                  </Text>
                </View>
              );
            })
          )}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  content: { padding: 20 },
  heading: { fontSize: 22, fontWeight: '700', color: '#111827', marginBottom: 16 },
  dayCard: {
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
  dayHeader: { marginBottom: 10 },
  dayName: { fontSize: 11, fontWeight: '600', color: '#22c55e', textTransform: 'uppercase' },
  dayLabel: { fontSize: 16, fontWeight: '700', color: '#111827', marginTop: 2 },
  restText: { fontSize: 14, color: '#9ca3af', fontStyle: 'italic', textAlign: 'center', paddingVertical: 16 },
  exerciseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  exName: { fontSize: 14, fontWeight: '600', color: '#374151', flex: 1 },
  exDetail: { fontSize: 12, color: '#6b7280' },
});
