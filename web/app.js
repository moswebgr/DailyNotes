// Store for demo data
class AppState {
    constructor() {
        this.notes = this.loadNotes();
        this.settings = this.loadSettings();
        this.selectedDate = new Date();
        this.viewMonth = { year: new Date().getFullYear(), month: new Date().getMonth() };
        this.searchQuery = '';
        this.searchScope = this.settings.defaultSearchScope;
        this.selectedColor = this.settings.defaultColor;
    }

    loadNotes() {
        const saved = localStorage.getItem('activities.v2');
        return saved ? JSON.parse(saved) : this.getDemoNotes();
    }

    loadSettings() {
        const saved = localStorage.getItem('settings.v1');
        return saved ? JSON.parse(saved) : {
            theme: 'light',
            defaultColor: '#3b82f6',
            defaultSearchScope: 'day',
            sortOrder: 'newest',
            showCalendarCounts: true
        };
    }

    getDemoNotes() {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        return {
            [this.formatDate(today)]: [
                { id: '1', text: 'Welcome to Daily Notes! 📝', color: '#3b82f6', timestamp: today.getTime() - 3600000, favorite: true },
                { id: '2', text: 'Organize your thoughts with colors', color: '#ef4444', timestamp: today.getTime() - 1800000, favorite: false }
            ],
            [this.formatDate(tomorrow)]: [
                { id: '3', text: 'Plan your next day 🎯', color: '#10b981', timestamp: tomorrow.getTime(), favorite: false }
            ],
            [this.formatDate(yesterday)]: [
                { id: '4', text: 'Reflect on yesterday ✨', color: '#8b5cf6', timestamp: yesterday.getTime(), favorite: false }
            ]
        };
    }

    formatDate(date) {
        return date.toISOString().slice(0, 10);
    }

    getDateString(date) {
        return date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
    }

    getDaysInMonth(year, month) {
        return new Date(year, month + 1, 0).getDate();
    }

    getFirstDayOfMonth(year, month) {
        return new Date(year, month, 1).getDay();
    }

    getNotesForDate(date) {
        const key = this.formatDate(date);
        return this.notes[key] || [];
    }

    getNotesByMonth(year, month) {
        return Object.entries(this.notes).filter(([date]) => {
            const [y, m] = date.split('-').map(Number);
            return y === year && m - 1 === month;
        }).flatMap(([date, noteList]) => noteList.map(note => ({ date, note })));
    }

    addNote(text) {
        const key = this.formatDate(this.selectedDate);
        const newNote = {
            id: Date.now().toString(),
            text,
            color: this.selectedColor,
            timestamp: Date.now(),
            favorite: false
        };
        if (!this.notes[key]) this.notes[key] = [];
        this.notes[key].push(newNote);
        this.saveNotes();
        return newNote;
    }

    deleteNote(date, id) {
        if (this.notes[date]) {
            this.notes[date] = this.notes[date].filter(n => n.id !== id);
            this.saveNotes();
        }
    }

    toggleFavorite(date, id) {
        if (this.notes[date]) {
            const note = this.notes[date].find(n => n.id === id);
            if (note) {
                note.favorite = !note.favorite;
                this.saveNotes();
            }
        }
    }

    saveNotes() {
        localStorage.setItem('activities.v2', JSON.stringify(this.notes));
    }
}

// Initialize app state
const appState = new AppState();

// Render functions
function renderApp() {
    const container = document.getElementById('app');
    container.innerHTML = `
        <div class="app-header">
            <div class="app-header-logo">📝</div>
            <h1>Daily Notes</h1>
        </div>
        <div class="app-content">
            ${renderCalendar()}
            ${renderNotes()}
        </div>
    `;
    
    attachEventListeners();
}

function renderCalendar() {
    const { year, month } = appState.viewMonth;
    const daysInMonth = appState.getDaysInMonth(year, month);
    const firstDay = appState.getFirstDayOfMonth(year, month);
    const today = new Date();
    const selectedKey = appState.formatDate(appState.selectedDate);
    const todayKey = appState.formatDate(today);

    let html = `<div class="card">
        <div class="calendar-header">
            ${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => `<div class="weekday">${d}</div>`).join('')}
        </div>
        <div class="calendar-grid">`;

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
        html += '<div class="calendar-day empty"></div>';
    }

    // Days of month
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const dateKey = appState.formatDate(date);
        const count = appState.getNotesForDate(date).length;
        const isSelected = dateKey === selectedKey;
        const isToday = dateKey === todayKey;
        const classes = `calendar-day ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''}`;

        html += `<div class="${classes}" data-date="${dateKey}">
            ${day}
            ${count > 0 && appState.settings.showCalendarCounts ? `<div class="count">${count}</div>` : ''}
        </div>`;
    }

    // Fill remaining cells
    const totalCells = firstDay + daysInMonth;
    const remaining = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
    for (let i = 0; i < remaining; i++) {
        html += '<div class="calendar-day empty"></div>';
    }

    html += '</div></div>';
    return html;
}

function renderNotes() {
    const selectedKey = appState.formatDate(appState.selectedDate);
    const allNotes = Object.entries(appState.notes).flatMap(([date, noteList]) =>
        noteList.map(note => ({ date, note }))
    );

    let notesToShow = appState.searchScope === 'all' ? allNotes : appState.getNotesForDate(appState.selectedDate).map(note => ({ date: selectedKey, note }));

    // Filter by search
    if (appState.searchQuery.trim()) {
        notesToShow = notesToShow.filter(({ note }) =>
            note.text.toLowerCase().includes(appState.searchQuery.toLowerCase())
        );
    }

    // Sort
    notesToShow.sort((a, b) => {
        const favA = a.note.favorite ? 1 : 0;
        const favB = b.note.favorite ? 1 : 0;
        if (favA !== favB) return favB - favA;
        return appState.settings.sortOrder === 'newest' ? b.note.timestamp - a.note.timestamp : a.note.timestamp - b.note.timestamp;
    });

    const colorClasses = {
        '#3b82f6': 'color-blue',
        '#ef4444': 'color-red',
        '#10b981': 'color-green',
        '#f59e0b': 'color-yellow',
        '#8b5cf6': 'color-purple',
        '#ec4899': 'color-pink'
    };

    const colorMap = {
        '#ef4444': 'color-red',
        '#10b981': 'color-green',
        '#f59e0b': 'color-yellow',
        '#8b5cf6': 'color-purple',
        '#ec4899': 'color-pink'
    };

    let html = `<div class="card">
        <div class="notes-section">
            <div class="notes-header">
                <div>
                    <div class="notes-title">${appState.searchScope === 'all' ? 'All notes' : appState.getDateString(appState.selectedDate)}</div>
                    <div class="notes-count">${notesToShow.length} note${notesToShow.length === 1 ? '' : 's'}</div>
                </div>
            </div>

            <div class="scope-toggle">
                <button class="scope-btn ${appState.searchScope === 'day' ? 'active' : ''}" data-scope="day">Day</button>
                <button class="scope-btn ${appState.searchScope === 'all' ? 'active' : ''}" data-scope="all">All</button>
            </div>

            <input type="text" class="search-input" placeholder="Search notes..." value="${appState.searchQuery}">

            <div class="notes-list">
                ${notesToShow.length === 0 ? `
                    <div class="empty-state">
                        ${appState.searchQuery ? 'No matching notes.' : (appState.searchScope === 'all' ? 'No notes yet. Start adding across days.' : 'No notes yet. Add one below!')}
                    </div>
                ` : notesToShow.map(({ date, note }) => `
                    <div class="note-item ${colorMap[note.color] || ''}" style="border-left-color: ${note.color}">
                        <div class="note-text">${escapeHtml(note.text)}</div>
                        <div class="note-time">${new Date(note.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}${appState.searchScope === 'all' ? ` · ${new Date(date).toLocaleDateString()}` : ''}</div>
                        <div class="favorite-badge" data-date="${date}" data-id="${note.id}" title="Toggle favorite">
                            ${note.favorite ? '★' : '☆'}
                        </div>
                    </div>
                `).join('')}
            </div>

            <div class="color-row">
                ${['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'].map(color => `
                    <button class="color-btn ${appState.selectedColor === color ? 'selected' : ''}" data-color="${color}" style="background: ${color};" title="Select color"></button>
                `).join('')}
            </div>

            <div class="input-row">
                <input type="text" class="note-input" placeholder="Add note..." id="noteInput">
                <button class="add-btn" id="addBtn">+</button>
            </div>
        </div>
    </div>`;

    html += '</div>';
    return html;
}

function attachEventListeners() {
    // Calendar days
    document.querySelectorAll('.calendar-day:not(.empty)').forEach(el => {
        el.addEventListener('click', () => {
            const date = el.dataset.date;
            if (date) {
                appState.selectedDate = new Date(date);
                renderApp();
            }
        });
    });

    // Scope toggle
    document.querySelectorAll('.scope-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            appState.searchScope = btn.dataset.scope;
            renderApp();
        });
    });

    // Search input
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            appState.searchQuery = e.target.value;
            renderApp();
        });
    }

    // Color buttons
    document.querySelectorAll('.color-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            appState.selectedColor = btn.dataset.color;
            renderApp();
        });
    });

    // Add note
    const addBtn = document.getElementById('addBtn');
    const noteInput = document.getElementById('noteInput');
    if (addBtn && noteInput) {
        const addNote = () => {
            if (noteInput.value.trim()) {
                appState.addNote(noteInput.value.trim());
                noteInput.value = '';
                renderApp();
            }
        };
        addBtn.addEventListener('click', addNote);
        noteInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') addNote();
        });
    }

    // Favorite badges
    document.querySelectorAll('.favorite-badge').forEach(badge => {
        badge.addEventListener('click', () => {
            const date = badge.dataset.date;
            const id = badge.dataset.id;
            appState.toggleFavorite(date, id);
            renderApp();
        });
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Initialize
renderApp();
