import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  Platform,
  useWindowDimensions,
  KeyboardAvoidingView,
  Modal,
  Alert,
  Image,
} from 'react-native';
import storage from '../../utils/storage';

const STORAGE_KEY = 'activities.v2';
const SETTINGS_KEY = 'settings.v1';
const NOTE_COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

type ThemeMode = 'light' | 'dark';
type SearchScope = 'day' | 'all';
type SortOrder = 'newest' | 'oldest';

interface Settings {
  theme: ThemeMode;
  defaultColor: string;
  defaultSearchScope: SearchScope;
  sortOrder: SortOrder;
  showCalendarCounts: boolean;
}

const DEFAULT_SETTINGS: Settings = {
  theme: 'light',
  defaultColor: NOTE_COLORS[0],
  defaultSearchScope: 'day',
  sortOrder: 'newest',
  showCalendarCounts: true,
};

function isoDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

function monthMatrix(year: number, month: number) {
  const first = new Date(year, month, 1);
  const startDay = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const rows: Array<Array<{ day: number | null; date?: Date }>> = [];
  let week: Array<{ day: number | null; date?: Date }> = [];
  for (let i = 0; i < startDay; i++) week.push({ day: null });
  for (let d = 1; d <= daysInMonth; d++) {
    week.push({ day: d, date: new Date(year, month, d) });
    if (week.length === 7) {
      rows.push(week);
      week = [];
    }
  }
  if (week.length) {
    while (week.length < 7) week.push({ day: null });
    rows.push(week);
  }
  return rows;
}

interface Note {
  id: string;
  text: string;
  color: string;
  timestamp: number;
  favorite?: boolean;
}

type NoteEntry = {
  date: string;
  note: Note;
};

export default function CalendarWithNotes() {
  const today = useMemo(() => new Date(), []);
  const [viewMonth, setViewMonth] = useState({ year: today.getFullYear(), month: today.getMonth() });
  const [selected, setSelected] = useState<Date>(today);
  const [notes, setNotes] = useState<Record<string, Note[]>>({});
  const [input, setInput] = useState('');
  const [selectedColor, setSelectedColor] = useState(DEFAULT_SETTINGS.defaultColor);
  const [editingNote, setEditingNote] = useState<NoteEntry | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchScope, setSearchScope] = useState<SearchScope>(DEFAULT_SETTINGS.defaultSearchScope);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const { width } = useWindowDimensions();
  const dayCellSize = Math.max(42, Math.min(52, Math.floor((width - 40) / 7)));

  useEffect(() => {
    (async () => {
      try {
        const rawNotes = await storage.getItem(STORAGE_KEY);
        if (rawNotes) setNotes(JSON.parse(rawNotes));
        const rawSettings = await storage.getItem(SETTINGS_KEY);
        if (rawSettings) {
          const parsed: Settings = JSON.parse(rawSettings);
          setSettings(parsed);
          setSelectedColor(parsed.defaultColor);
          setSearchScope(parsed.defaultSearchScope);
        }
      } catch (e) {
        console.warn('Failed to load activities or settings', e);
      }
    })();
  }, []);

  useEffect(() => {
    const s = selected;
    setViewMonth({ year: s.getFullYear(), month: s.getMonth() });
  }, [selected]);

  async function persist(newNotes: Record<string, Note[]>) {
    setNotes(newNotes);
    try {
      await storage.setItem(STORAGE_KEY, JSON.stringify(newNotes));
    } catch (e) {
      console.warn('Failed to save activities', e);
    }
  }

  function prevMonth() {
    setViewMonth((cur) => {
      const m = cur.month - 1;
      return m < 0 ? { year: cur.year - 1, month: 11 } : { year: cur.year, month: m };
    });
  }

  function nextMonth() {
    setViewMonth((cur) => {
      const m = cur.month + 1;
      return m > 11 ? { year: cur.year + 1, month: 0 } : { year: cur.year, month: m };
    });
  }

  function goToday() {
    setSelected(new Date());
    setSearchScope(settings.defaultSearchScope);
  }

  const matrix = monthMatrix(viewMonth.year, viewMonth.month);
  const selectedKey = isoDate(selected);
  const dayNotes = notes[selectedKey] || [];
  const isDark = settings.theme === ('dark' as const);

  const allNotes = useMemo(
    () =>
      Object.entries(notes).flatMap(([date, noteList]) =>
        noteList.map((note) => ({ date, note })),
      ),
    [notes],
  );

  const monthNotes = useMemo(
    () =>
      allNotes.filter(({ date }) => {
        const [year, month] = date.split('-').map(Number);
        return year === viewMonth.year && month - 1 === viewMonth.month;
      }),
    [allNotes, viewMonth],
  );

  const monthNoteCount = monthNotes.length;
  const monthActiveDays = new Set(monthNotes.map((entry) => entry.date)).size;

  const notesToShow: NoteEntry[] = searchScope === 'all' ? allNotes : dayNotes.map((note) => ({ date: selectedKey, note }));

  const filteredNotes = searchQuery.trim()
    ? notesToShow.filter(({ note }) => note.text.toLowerCase().includes(searchQuery.toLowerCase()))
    : notesToShow;

  const displayedNotes = [...filteredNotes].sort((a, b) => {
    const favoriteA = a.note.favorite ? 1 : 0;
    const favoriteB = b.note.favorite ? 1 : 0;
    if (favoriteA !== favoriteB) return favoriteB - favoriteA;
    if (settings.sortOrder === 'newest') {
      return b.note.timestamp - a.note.timestamp;
    }
    return a.note.timestamp - b.note.timestamp;
  });

  function formatNoteDate(date: string) {
    return new Date(date).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  async function addNote() {
    if (!input.trim()) return;
    const key = selectedKey;
    const newNote: Note = {
      id: `${Date.now()}`,
      text: input.trim(),
      color: selectedColor,
      timestamp: Date.now(),
      favorite: false,
    };
    const updated = { ...notes, [key]: [...dayNotes, newNote] };
    setInput('');
    await persist(updated);
  }

  async function saveEditingNote() {
    if (!editingNote) return;
    const key = editingNote.date;
    const existing = notes[key] || [];
    const updated = existing.map((note) =>
      note.id === editingNote.note.id ? editingNote.note : note,
    );
    await persist({ ...notes, [key]: updated });
    setEditingNote(null);
  }

  async function removeNote(date: string, id: string) {
    const existing = notes[date] || [];
    const next = existing.filter((note) => note.id !== id);
    await persist({ ...notes, [date]: next });
  }

  async function toggleFavorite(date: string, id: string) {
    const existing = notes[date] || [];
    const next = existing.map((note) =>
      note.id === id ? { ...note, favorite: !note.favorite } : note,
    );
    await persist({ ...notes, [date]: next });
  }

  async function clearDay() {
    Alert.alert('Clear all notes?', `Delete all ${dayNotes.length} note(s) for this day?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const updated = { ...notes, [selectedKey]: [] };
          await persist(updated);
        },
      },
    ]);
  }

  async function clearMonth() {
    if (monthNoteCount === 0) return;
    Alert.alert(
      'Clear month notes?',
      `Delete all ${monthNoteCount} note(s) across ${monthActiveDays} day(s) in this month?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const updated = { ...notes };
            monthNotes.forEach(({ date }) => {
              delete updated[date];
            });
            await persist(updated);
          },
        },
      ],
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.wrapper}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={80}
    >
      <ScrollView contentContainerStyle={[styles.container, isDark && styles.darkContainer]} keyboardShouldPersistTaps="handled">
        <View style={styles.screenHeader}>
          <View style={styles.headerLogoContainer}>
            <Image
              source={require('../../../assets/images/icon.png')}
              style={styles.headerLogo}
            />
          </View>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={prevMonth} style={styles.navButton} activeOpacity={0.75}>
              <Text style={styles.navButtonText}>‹</Text>
            </TouchableOpacity>
            <Text style={styles.headerText} numberOfLines={1}>
              {new Date(viewMonth.year, viewMonth.month).toLocaleString(undefined, {
                month: 'long',
                year: 'numeric',
              })}
            </Text>
            <TouchableOpacity onPress={nextMonth} style={styles.navButton} activeOpacity={0.75}>
              <Text style={styles.navButtonText}>›</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.card, isDark && styles.darkCard]}>
          <View style={styles.weekDaysRow}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <Text key={d} style={styles.weekDayText}>
                {d}
              </Text>
            ))}
          </View>

          {matrix.map((week, i) => (
            <View style={styles.weekRow} key={i}>
              {week.map((cell, ci) => {
                const isSelected = cell.date && isoDate(cell.date) === selectedKey;
                const isToday = cell.date && isoDate(cell.date) === isoDate(today);
                const count = cell.date ? (notes[isoDate(cell.date)] || []).length : 0;
                return (
                  <TouchableOpacity
                    key={ci}
                    style={[
                      styles.dayCell,
                      { width: dayCellSize, height: dayCellSize },
                      isSelected && styles.selectedDay,
                      isToday && styles.todayDay,
                    ]}
                    onPress={() => cell.date && setSelected(cell.date)}
                    disabled={!cell.day}
                  >
                    <Text style={[styles.dayText, isToday && styles.todayText]}>{cell.day ?? ''}</Text>
                    {count > 0 && settings.showCalendarCounts && (
                      <View style={styles.dayCountPill}>
                        <Text style={styles.dayCountText}>{count}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>

        <View style={styles.notesPane}>
          <View style={styles.notesHeaderTop}>
            <View style={{ flex: 1 }}>
              <Text style={styles.notesTitle}>{searchScope === 'all' ? 'All notes' : selected.toDateString()}</Text>
              <Text style={styles.notesCount}>{displayedNotes.length} note{displayedNotes.length === 1 ? '' : 's'}</Text>
            </View>
            <View style={styles.headerButtons}>
              <TouchableOpacity onPress={goToday} style={styles.todayBtn}>
                <Text style={styles.todayBtnText}>Today</Text>
              </TouchableOpacity>
              {searchScope === 'day' && dayNotes.length > 0 && (
                <TouchableOpacity onPress={clearDay} style={styles.clearBtn}>
                  <Text style={styles.clearBtnText}>Clear</Text>
                </TouchableOpacity>
              )}
              {searchScope === 'day' && monthNoteCount > 0 && (
                <TouchableOpacity onPress={clearMonth} style={styles.clearMonthBtn}>
                  <Text style={styles.clearMonthBtnText}>Clear month</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          <View style={styles.searchScopeRow}>
            <TouchableOpacity
              onPress={() => setSearchScope('day')}
              style={[styles.scopeButton, searchScope === 'day' && styles.scopeButtonActive]}
            >
              <Text style={[styles.scopeButtonText, searchScope === 'day' && styles.scopeButtonTextActive]}>Day</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setSearchScope('all')}
              style={[styles.scopeButton, searchScope === 'all' && styles.scopeButtonActive]}
            >
              <Text style={[styles.scopeButtonText, searchScope === 'all' && styles.scopeButtonTextActive]}>All</Text>
            </TouchableOpacity>
          </View>

          <TextInput
            placeholder="Search notes..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
            placeholderTextColor="#cbd5e1"
          />

          <View style={[styles.notesCard, isDark && styles.darkNotesCard]}>
            {displayedNotes.length === 0 ? (
              <Text style={styles.emptyText}>
                {searchQuery
                  ? 'No matching notes.'
                  : searchScope === 'all'
                  ? 'No notes yet. Start adding across days.'
                  : 'No notes yet. Add one below!'}
              </Text>
            ) : (
              displayedNotes.map(({ date, note }) => (
                <View key={`${date}-${note.id}`} style={[styles.noteRow, { borderLeftColor: note.color, borderLeftWidth: 4 }]}> 
                  <View style={styles.noteRowTop}>
                    <Text style={styles.noteText} numberOfLines={2}>{note.text}</Text>
                    <TouchableOpacity
                      onPress={() => toggleFavorite(date, note.id)}
                      style={[styles.favoriteButton, note.favorite && styles.favoriteActive]}
                    >
                      <Text style={[styles.favoriteText, note.favorite && styles.favoriteTextActive]}>
                        {note.favorite ? '★' : '☆'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.noteTime}>
                    {new Date(note.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                    {searchScope === 'all' ? ` · ${formatNoteDate(date)}` : ''}
                  </Text>
                  <View style={styles.noteRowFooter}>
                    <TouchableOpacity onPress={() => setEditingNote({ date, note })} style={styles.noteRowContent}>
                      <Text style={styles.editLink}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => removeNote(date, note.id)} style={styles.deleteButton}>
                      <Text style={styles.deleteButtonText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>

          <View style={styles.colorRow}>
            {NOTE_COLORS.map((color) => (
              <TouchableOpacity
                key={color}
                style={[styles.colorPicker, { backgroundColor: color }, selectedColor === color && styles.colorPickerActive]}
                onPress={() => setSelectedColor(color)}
              />
            ))}
          </View>

          <View style={styles.inputRow}>
            <TextInput
              placeholder="Add note..."
              placeholderTextColor={isDark ? '#94a3b8' : '#94a3b8'}
              value={input}
              onChangeText={setInput}
              onSubmitEditing={addNote}
              returnKeyType="done"
              style={[styles.input, isDark && styles.darkInput]}
            />
            <TouchableOpacity onPress={addNote} style={styles.addButton}>
              <Text style={styles.addButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <Modal visible={!!editingNote} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Note</Text>
            <TextInput
              value={editingNote?.note.text}
              onChangeText={(text) =>
                setEditingNote(editingNote ? { ...editingNote, note: { ...editingNote.note, text } } : null)
              }
              style={styles.modalInput}
              placeholder="Note text"
              multiline
            />
            <View style={styles.colorRow}>
              {NOTE_COLORS.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorPicker,
                    { backgroundColor: color },
                    editingNote?.note.color === color && styles.colorPickerActive,
                  ]}
                  onPress={() =>
                    setEditingNote(editingNote ? { ...editingNote, note: { ...editingNote.note, color } } : null)
                  }
                />
              ))}
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={() => setEditingNote(null)}
                style={[styles.modalButton, styles.modalCancel]}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={saveEditingNote} style={[styles.modalButton, styles.modalSave]}>
                <Text style={styles.modalSaveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1 },
  container: { padding: 18, paddingBottom: 32, backgroundColor: '#eef2ff' },
  screenHeader: { marginBottom: 18, alignItems: 'center' },
  screenTitle: { fontSize: 28, fontWeight: '800', color: '#1e40af', marginBottom: 12 },
  headerLogoContainer: { alignItems: 'center', marginBottom: 10 },
  headerLogo: { width: 80, height: 80, borderRadius: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  navButton: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  navButtonText: { fontSize: 22, color: '#1e40af', fontWeight: '600' },
  headerText: { fontSize: 18, fontWeight: '700', textAlign: 'center', flex: 1, marginHorizontal: 8 },
  card: { backgroundColor: '#ffffff', borderRadius: 22, padding: 18, marginBottom: 18, shadowColor: '#000', shadowOpacity: 0.08, shadowOffset: { width: 0, height: 8 }, shadowRadius: 18, elevation: 6 },
  darkContainer: { backgroundColor: '#0f172a' },
  darkCard: { backgroundColor: '#1f2937' },
  darkNotesCard: { backgroundColor: '#111827', borderColor: '#334155' },
  darkInput: { backgroundColor: '#1f2937', borderColor: '#334155', color: '#e2e8f0' },
  weekDaysRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  weekDayText: { width: 34, textAlign: 'center', fontSize: 11, color: '#6b7280', fontWeight: '600' },
  weekRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  dayCell: { borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9fafc' },
  dayText: { fontSize: 14, color: '#111827', fontWeight: '500' },
  selectedDay: { backgroundColor: '#dbeafe', borderWidth: 2, borderColor: '#1e40af' },
  todayDay: { backgroundColor: '#fef3c7', borderWidth: 2, borderColor: '#f59e0b' },
  todayText: { color: '#d97706', fontWeight: '700' },
  dayCountPill: { marginTop: 6, minWidth: 20, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 12, backgroundColor: '#1e40af', alignItems: 'center' },
  dayCountText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  notesPane: { marginBottom: 16 },
  notesHeaderTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  notesTitle: { fontSize: 18, fontWeight: '700' },
  notesCount: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  headerButtons: { flexDirection: 'row', gap: 8 },
  todayBtn: { backgroundColor: '#f59e0b', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8 },
  todayBtnText: { color: '#fff', fontWeight: '600', fontSize: 12 },
  clearBtn: { backgroundColor: '#ef4444', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8 },
  clearBtnText: { color: '#fff', fontWeight: '600', fontSize: 12 },
  clearMonthBtn: { backgroundColor: '#e2e8f0', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8 },
  clearMonthBtnText: { color: '#334155', fontWeight: '700', fontSize: 12 },
  searchScopeRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  scopeButton: { flex: 1, backgroundColor: '#f1f5f9', borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
  scopeButtonActive: { backgroundColor: '#1e40af' },
  scopeButtonText: { color: '#475569', fontWeight: '600' },
  scopeButtonTextActive: { color: '#fff' },
  searchInput: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 12, fontSize: 14 },
  notesCard: { backgroundColor: '#fff', borderRadius: 18, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#e5e7eb' },
  emptyText: { color: '#6b7280', fontSize: 14, lineHeight: 20 },
  noteRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, padding: 12, backgroundColor: '#f8fafc', borderRadius: 12 },
  noteText: { flex: 1, fontSize: 14, color: '#111827', marginRight: 12, fontWeight: '500' },
  noteTime: { fontSize: 11, color: '#9ca3af', marginTop: 4 },
  noteRowTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  noteRowFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  noteRowContent: { flex: 1 },
  editLink: { color: '#1e40af', fontWeight: '700', fontSize: 13 },
  favoriteButton: { paddingHorizontal: 8, paddingVertical: 6, borderRadius: 8 },
  favoriteText: { fontSize: 16, color: '#9ca3af' },
  favoriteActive: { backgroundColor: '#fde68a' },
  favoriteTextActive: { color: '#b45309' },
  deleteButton: { paddingHorizontal: 10, paddingVertical: 6, backgroundColor: '#fee2e2', borderRadius: 8 },
  deleteButtonText: { color: '#dc2626', fontWeight: '700', fontSize: 12 },
  colorRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 12 },
  colorPicker: { width: 40, height: 40, borderRadius: 20, borderWidth: 2, borderColor: 'transparent' },
  colorPickerActive: { borderColor: '#000', shadowColor: '#000', shadowOpacity: 0.3, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4, elevation: 3 },
  inputRow: { flexDirection: 'row', alignItems: 'center' },
  input: { flex: 1, backgroundColor: '#fff', borderWidth: 1, borderColor: '#d1d5db', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, marginRight: 10 },
  addButton: { backgroundColor: '#1e40af', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 16, justifyContent: 'center', alignItems: 'center' },
  addButtonText: { color: '#fff', fontWeight: '700', fontSize: 18 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 16 },
  modalContent: { backgroundColor: '#fff', borderRadius: 18, padding: 20, width: '100%' },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 14 },
  modalInput: { backgroundColor: '#f9fafc', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, padding: 12, marginBottom: 14, fontSize: 14, minHeight: 80 },
  modalButtons: { flexDirection: 'row', gap: 10 },
  modalButton: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  modalCancel: { backgroundColor: '#e5e7eb' },
  modalCancelText: { color: '#374151', fontWeight: '700' },
  modalSave: { backgroundColor: '#1e40af' },
  modalSaveText: { color: '#fff', fontWeight: '700' },
});
