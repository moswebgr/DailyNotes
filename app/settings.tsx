import { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, View, Text, Switch, TouchableOpacity, ScrollView } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import storage from '../src/utils/storage';

const SETTINGS_KEY = 'settings.v1';
const NOTE_COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

const DEFAULT_SETTINGS = {
  theme: 'light' as const,
  defaultColor: NOTE_COLORS[0],
  defaultSearchScope: 'day' as const,
  sortOrder: 'newest' as const,
  showCalendarCounts: true,
};

type Settings = typeof DEFAULT_SETTINGS;

export default function SettingsScreen() {
  const router = useRouter();
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);

  useEffect(() => {
    (async () => {
      try {
        const raw = await storage.getItem(SETTINGS_KEY);
        if (raw) setSettings(JSON.parse(raw));
      } catch (e) {
        console.warn('Failed to load settings', e);
      }
    })();
  }, []);

  async function save(newSettings: Settings) {
    setSettings(newSettings);
    try {
      await storage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
    } catch (e) {
      console.warn('Failed to save settings', e);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ title: 'Settings' }} />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Theme</Text>
          <View style={styles.row}>
            <TouchableOpacity
              style={[styles.optionButton, settings.theme === 'light' && styles.optionActive]}
              onPress={() => save({ ...settings, theme: 'light' })}
            >
              <Text style={styles.optionText}>Light</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.optionButton, settings.theme === 'dark' && styles.optionActive]}
              onPress={() => save({ ...settings, theme: 'dark' })}
            >
              <Text style={styles.optionText}>Dark</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Default note color</Text>
          <View style={styles.colorRow}>
            {NOTE_COLORS.map((color) => (
              <TouchableOpacity
                key={color}
                style={[styles.colorPicker, { backgroundColor: color }, settings.defaultColor === color && styles.colorPickerActive]}
                onPress={() => save({ ...settings, defaultColor: color })}
              />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Default search scope</Text>
          <View style={styles.row}>
            {['day', 'all'].map((scope) => (
              <TouchableOpacity
                key={scope}
                style={[styles.optionButton, settings.defaultSearchScope === scope && styles.optionActive]}
                onPress={() => save({ ...settings, defaultSearchScope: scope as Settings['defaultSearchScope'] })}
              >
                <Text style={styles.optionText}>{scope === 'day' ? 'Day' : 'All'}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sort order</Text>
          <View style={styles.row}>
            <TouchableOpacity
              style={[styles.optionButton, settings.sortOrder === 'newest' && styles.optionActive]}
              onPress={() => save({ ...settings, sortOrder: 'newest' })}
            >
              <Text style={styles.optionText}>Newest first</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.optionButton, settings.sortOrder === 'oldest' && styles.optionActive]}
              onPress={() => save({ ...settings, sortOrder: 'oldest' })}
            >
              <Text style={styles.optionText}>Oldest first</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Calendar day counts</Text>
          <Switch
            value={settings.showCalendarCounts}
            onValueChange={(value) => save({ ...settings, showCalendarCounts: value })}
          />
        </View>

        <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
          <Text style={styles.closeButtonText}>Close settings</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#eef2ff' },
  container: { padding: 18, paddingBottom: 32 },
  section: { marginBottom: 22 },
  sectionRow: { marginBottom: 22, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 10, color: '#0f172a' },
  row: { flexDirection: 'row', gap: 12 },
  optionButton: { flex: 1, backgroundColor: '#fff', borderRadius: 14, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0' },
  optionActive: { backgroundColor: '#1e40af', borderColor: '#1e40af' },
  optionText: { color: '#0f172a', fontWeight: '700' },
  colorRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  colorPicker: { width: 40, height: 40, borderRadius: 20, borderWidth: 2, borderColor: 'transparent' },
  colorPickerActive: { borderColor: '#1e40af' },
  closeButton: { marginTop: 24, backgroundColor: '#1e40af', paddingVertical: 14, borderRadius: 14, alignItems: 'center' },
  closeButtonText: { color: '#fff', fontWeight: '700' },
});
