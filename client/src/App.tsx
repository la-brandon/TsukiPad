/**
 * App.tsx
 *
 * This is the main root component of the application.
 * Responsibilities:
 *  - Loads and stores weather, forecast, and journal data
 *  - Handles top-level UI state (current month, selected date, editing entry)
 *  - Coordinates all child components (Calendar, Weather UI, Modals)
 *  - Provides callbacks for creating, editing, and deleting journal entries
 * 
 */


import { useState, useEffect, useMemo } from 'react';
import SearchBar from './components/Weather/SearchBar';
import CurrentWeather from './components/Weather/CurrentWeather';
import MonthlyCalendar from './components/Calendar/MonthlyCalendar';
import MiniMonth from './components/Calendar/MiniMonth';
import NotesList from './components/Sidebar/NotesList';
import RightPanel from './components/Sidebar/RightPanel';
import AuthScreen from './components/Auth/AuthScreen';
import LoadingScreen from './components/Auth/LoadingScreen';

import { JournalEntry, WeatherSummary, ForecastByDate } from './types';
import { fetchCurrentWeather, fetchFiveDayForecast } from './lib/api/weather';
import {
  fetchJournalEntries,
  createJournalEntry,
  updateJournalEntry,
  deleteJournalEntry,
} from './lib/api/journal';
import { login, logout, getMe, register } from './lib/api/auth';

type RightPanelMode = 'day' | 'note';
type AuthUser = {
  id: number;
  username: string;
  createdAt: string;
};

function App() {

  // -------------------------
  // STATE VARIABLES
  // -------------------------

  // -------------------------
  // Auth state
  // -------------------------
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isSubmittingAuth, setIsSubmittingAuth] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login'); // To toggle between login and register screens if needed                                                

  // -------------------------                                                                  
  // App data state
  // -------------------------
  const [weather, setWeather] = useState<any>(null); // To display weather for current day (might be unnecessary)
  const [forecast, setForecast] = useState<WeatherSummary[]>([]);  // To get the forecast for the 5 days and display it
  const [calendarEntries, setCalendarEntries] = useState<JournalEntry[]>([]); // To store and grab all the entries we have notes for
  const [city, setCity] = useState<string>('Scarborough'); // What city we are displaying weather information for

  // -------------------------
  // Calendar / panel UI state
  // -------------------------
  const [rightPanelOpen, setRightPanelOpen] = useState(false); // To determine if the right panel is open or closed
  const [rightPanelMode, setRightPanelMode] = useState<RightPanelMode>('day'); // To determine the mode of the right panel... (day view to display the day or note view to display a specific note)
  const [panelDate, setPanelDate] = useState<string | null>(null); // Which date we are viewing in the right panel
  const [panelNoteId, setPanelNoteId] = useState<number | null>(null); // Which note we are editing/viewing in the right panel
  const [currentMonth, setCurrentMonth] = useState(() => new Date()); // To know what month we are on and what month to display

  // -------------------------
  // Derived data
  // -------------------------

  // Memoized mapping of forecast data by date for easy lookup in the calendar
  const forecastByDate: ForecastByDate = useMemo(() => {
    const map: ForecastByDate = {};
    forecast.forEach((day) => {
      if (!day.date) return;
      map[day.date] = day;
    });
    return map;
  }, [forecast]);

  // Variables to determine if notes are memories or reminders
  const today = useMemo(() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return t;
  }, []);

  const memories = useMemo(() => {
    return calendarEntries.filter((e) => {
      const d = new Date(e.date);
      d.setHours(0, 0, 0, 0);
      return d < today;
    });
  }, [calendarEntries, today]);

  const reminders = useMemo(() => {
    return calendarEntries.filter((e) => {
      const d = new Date(e.date);
      d.setHours(0, 0, 0, 0);
      return d >= today;
    });
  }, [calendarEntries, today]);

  // -------------------------
  // Auth handlers
  // -------------------------

  // Function to handle login, sets auth state accordingly
  const handleAuthSubmit = async () => {
    setAuthError('');
    setIsSubmittingAuth(true);

    try {
      const result = authMode === 'login'
        ? await login(username, password)
        : await register(username, password);

      if (result.user) {
        setIsLoggedIn(true);
        setCurrentUser(result.user);
        setUsername('');
        setPassword('');
      }
    } catch (error) {
      setAuthError('Something went wrong');
    } finally {
      setIsSubmittingAuth(false);
    }
  };

  // Function to handle logout, clears auth state
  const handleLogout = async () => {
    await logout();
    setIsLoggedIn(false);
    setCurrentUser(null);
    setCalendarEntries([]);
    setCity('Scarborough');
    setWeather(null);
    setForecast([]);
  };

  // -------------------------
  // Data loaders
  // -------------------------

  // updates city + loads current weather for that city
  async function handleCitySearch(cityName: string) {
    setCity(cityName);

    try {
      const data = await fetchCurrentWeather(cityName);
      setWeather(data);
    } catch (err) {
      console.error('Failed to fetch current weather:', err);
    }
  }


  // Function to load up the journal entries from db 
  async function loadJournalEntries() {
    try {
      const data = await fetchJournalEntries();
      setCalendarEntries(data);
    } catch (err) {
      console.error('Failed to fetch journal data', err);
    }
  }

  // Refreshes the entries, say if an update is made
  async function refreshEntries() {
    await loadJournalEntries();
  }

  // -------------------------
  // Calendar navigation
  // -------------------------

  // Changing to previous month
  function goToPrevMonth() {
    setCurrentMonth(prev => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() - 1);
      return d;
    });
  }

  // Changing to next month
  function goToNextMonth() {
    setCurrentMonth(prev => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() + 1);
      return d;
    });
  }

  // -------------------------
  // Right panel handlers
  // -------------------------
  function openDayPanel(date: string) {
    setPanelDate(date);
    setPanelNoteId(null);
    setRightPanelMode('day');
    setRightPanelOpen(true);
  }

  function openNotePanel(noteId: number) {
    setPanelNoteId(noteId);
    setRightPanelMode('note');
    setRightPanelOpen(true);
  }


  // -------------------------
  // Use Effects
  // -------------------------

  // Load journal entries from backend on startup
  useEffect(() => {
    if (!isLoggedIn) {
      setCalendarEntries([]);
      setRightPanelOpen(false);
      setPanelDate(null);
      setPanelNoteId(null);
      return;
    }

    loadJournalEntries();
  }, [currentUser]);

  // Fetch forecast whenever the selected city changes
  useEffect(() => {
    if (!city) return;

    async function loadForecast() {
      try {
        const dailyForecast = await fetchFiveDayForecast(city);
        setForecast(dailyForecast);
      } catch (err) {
        console.error('Failed to fetch forecast:', err);
      }
    }

    loadForecast();
  }, [city]);

  // Checking session on app load, seeing if logged in
  useEffect(() => {
    async function checkSession() {
      try {
        const result = await getMe();

        if (result.user) {
          setIsLoggedIn(true);
          setCurrentUser(result.user);
        } else {
          setIsLoggedIn(false);
          setCurrentUser(null);
        }
      } catch (err) {
        console.error('Failed to check session', err);
        setIsLoggedIn(false);
        setCurrentUser(null);
      } finally {
        setAuthLoading(false);
      }
    }

    checkSession();
  }, []);

  // -------------------------
  // Auth gate
  // -------------------------
  if (authLoading) {
    return <LoadingScreen />;
  }

  if (!isLoggedIn) {
    return (
      <AuthScreen
        mode={authMode}
        username={username}
        password={password}
        authError={authError}
        isSubmitting={isSubmittingAuth}
        onUsernameChange={setUsername}
        onPasswordChange={setPassword}
        onSubmit={handleAuthSubmit}
        onModeChange={(mode) => {
          setAuthMode(mode);
          setAuthError('');
        }}
      />
    );
  }

  // -------------------------
  // Main app UI
  // -------------------------
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-100 to-white">
      <div className="grid grid-cols-12 gap-4 p-4 min-h-screen">
        {/* Sidebar */}
        <aside className="col-span-12 md:col-span-4 lg:col-span-3 space-y-4 h-full overflow-auto">
          <div className="bg-white/70 rounded-xl border p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h1 className="text-xl font-bold">TsukiPad</h1>
                <p className="text-xs text-gray-600 mt-1">
                  Memory Calendar Journal
                </p>
                {currentUser && (
                  <p className="text-sm text-gray-700 mt-2">
                    Welcome, {currentUser.username}
                  </p>
                )}
              </div>

              <button
                onClick={handleLogout}
                className="px-3 py-1 rounded-lg border text-sm hover:bg-gray-100"
              >
                Logout
              </button>
            </div>
          </div>

          {/* City search */}
          <div className="bg-white/70 rounded-xl border p-3">
            <SearchBar onSearch={handleCitySearch} />
          </div>

          {/* Current weather box */}
          {weather && (
            <div className="bg-white/70 rounded-xl border p-3">
              <CurrentWeather data={weather} />
            </div>
          )}

          {/* Mini month */}
          <MiniMonth
            currentMonth={currentMonth}
            onPrevMonth={goToPrevMonth}
            onNextMonth={goToNextMonth}
            onSelectDate={(d) => openDayPanel(d)}
          />

          {/* Notes lists */}
          <NotesList
            title="Reminders"
            notes={reminders}
            onSelectEntry={(id) => openNotePanel(id)}
          />

          <NotesList
            title="Memories"
            notes={memories}
            onSelectEntry={(id) => openNotePanel(id)}
          />
        </aside>

        {/* Main calendar */}
        <main className="col-span-12 md:col-span-8 lg:col-span-9 h-full">
          <div className="bg-white/70 rounded-xl border p-3 h-full flex flex-col">
            <MonthlyCalendar
              currentMonth={currentMonth}
              journalEntries={calendarEntries}
              forecastByDate={forecastByDate}
              onPrevMonth={goToPrevMonth}
              onNextMonth={goToNextMonth}
              onSelectDate={(d) => openDayPanel(d)}
              onSelectEntry={(id) => openNotePanel(id)}
            />
          </div>
        </main>
      </div>
      <RightPanel
        isOpen={rightPanelOpen}
        mode={rightPanelMode}
        date={panelDate}
        noteId={panelNoteId}
        entries={calendarEntries}
        onClose={() => setRightPanelOpen(false)}
        onSelectNote={(id) => {
          setPanelNoteId(id);
          setRightPanelMode('note');
        }}
        onBackToDay={(date) => {
          setPanelDate(date);
          setPanelNoteId(null);
          setRightPanelMode('day');
        }}

        onCreateNote={createJournalEntry}
        onAfterCreate={refreshEntries}

        onUpdateNote={async (id, body) => {
          await updateJournalEntry(id, body);
          await refreshEntries();
          setPanelNoteId(id);
          setRightPanelMode('note');
        }}
        onDeleteNote={async (id) => {
          await deleteJournalEntry(id);
          await refreshEntries();
        }}
      />
    </div>
  );
}

export default App;
