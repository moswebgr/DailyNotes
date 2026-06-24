import { SafeAreaView, StyleSheet } from 'react-native';
import CalendarWithNotes from '../components/calendar/CalendarWithNotes';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
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
});
