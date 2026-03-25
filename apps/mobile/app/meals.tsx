import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { generateDailyMealPlan } from '@fitin/core';
import type { Region, MealTime } from '@fitin/core';

const REGIONS: { id: Region; flag: string; name: string }[] = [
  { id: 'india', flag: '🇮🇳', name: 'India' },
  { id: 'germany', flag: '🇩🇪', name: 'Germany' },
  { id: 'usa', flag: '🇺🇸', name: 'USA' },
];

const MEAL_TIMES: { key: MealTime; label: string; emoji: string }[] = [
  { key: 'breakfast', label: 'Breakfast', emoji: '🌅' },
  { key: 'lunch', label: 'Lunch', emoji: '☀️' },
  { key: 'snack', label: 'Snack', emoji: '🍎' },
  { key: 'dinner', label: 'Dinner', emoji: '🌙' },
];

export default function MealsScreen() {
  const [region, setRegion] = useState<Region>('india');
  const today = new Date().toISOString().split('T')[0];
  const plan = generateDailyMealPlan(region, 2000, today);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.regionRow}>
        {REGIONS.map((r) => (
          <TouchableOpacity
            key={r.id}
            style={[styles.regionBtn, region === r.id && styles.regionBtnActive]}
            onPress={() => setRegion(r.id)}
          >
            <Text style={styles.regionFlag}>{r.flag}</Text>
            <Text style={[styles.regionName, region === r.id && styles.regionNameActive]}>{r.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {MEAL_TIMES.map(({ key, label, emoji }) => {
        const meal = plan[key];
        return (
          <View key={key} style={styles.mealCard}>
            <View style={styles.mealHeader}>
              <Text style={styles.mealEmoji}>{emoji}</Text>
              <Text style={styles.mealLabel}>{label}</Text>
            </View>
            <Text style={styles.mealName}>{meal.name}</Text>
            <Text style={styles.mealDesc}>{meal.description}</Text>
            <View style={styles.macroRow}>
              <View style={styles.macro}>
                <Text style={styles.macroVal}>{meal.macros.calories}</Text>
                <Text style={styles.macroLabel}>kcal</Text>
              </View>
              <View style={styles.macro}>
                <Text style={styles.macroVal}>{meal.macros.proteinG}g</Text>
                <Text style={styles.macroLabel}>protein</Text>
              </View>
              <View style={styles.macro}>
                <Text style={styles.macroVal}>{meal.macros.carbsG}g</Text>
                <Text style={styles.macroLabel}>carbs</Text>
              </View>
              <View style={styles.macro}>
                <Text style={styles.macroVal}>{meal.macros.fatG}g</Text>
                <Text style={styles.macroLabel}>fat</Text>
              </View>
            </View>
          </View>
        );
      })}

      <View style={styles.totalsCard}>
        <Text style={styles.totalsTitle}>Daily Totals</Text>
        <Text style={styles.totalsVal}>{plan.totalMacros.calories} kcal</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  content: { padding: 20 },
  regionRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  regionBtn: {
    flex: 1,
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  regionBtnActive: { borderColor: '#22c55e', backgroundColor: '#f0fdf4' },
  regionFlag: { fontSize: 28, marginBottom: 4 },
  regionName: { fontSize: 13, fontWeight: '600', color: '#6b7280' },
  regionNameActive: { color: '#22c55e' },
  mealCard: {
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
  mealHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  mealEmoji: { fontSize: 20 },
  mealLabel: { fontSize: 14, fontWeight: '600', color: '#6b7280' },
  mealName: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 4 },
  mealDesc: { fontSize: 13, color: '#6b7280', marginBottom: 12 },
  macroRow: { flexDirection: 'row', gap: 8 },
  macro: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderRadius: 10,
    padding: 8,
    alignItems: 'center',
  },
  macroVal: { fontSize: 14, fontWeight: '700', color: '#374151' },
  macroLabel: { fontSize: 10, color: '#9ca3af', marginTop: 2 },
  totalsCard: {
    backgroundColor: '#f0fdf4',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 40,
  },
  totalsTitle: { fontSize: 14, fontWeight: '600', color: '#15803d', marginBottom: 4 },
  totalsVal: { fontSize: 22, fontWeight: '800', color: '#22c55e' },
});
