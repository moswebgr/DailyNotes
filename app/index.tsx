import { SafeAreaView, StyleSheet, View, Text } from 'react-native';
import { Link } from 'expo-router';
import CalendarWithNotes from '../src/components/calendar/CalendarWithNotes';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.homeHeader}>
        <Text style={styles.homeTitle}>Daily Notes</Text>
        <Link href="/settings" style={styles.settingsButton}>
          <Text style={styles.settingsButtonText}>Settings</Text>
        </Link>
      </View>
      <CalendarWithNotes />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#eef2ff',
    padding: 0,
  },
  homeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  homeTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1e40af',
  },
  settingsButton: {
    backgroundColor: '#1e40af',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  settingsButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
});
