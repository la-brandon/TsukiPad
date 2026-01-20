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
 * The App component acts as the "controller" of the app, wiring together:
 *  - SearchBar (for selecting city)
 *  - CurrentWeather (current conditions)
 *  - MonthlyCalendar (main UI grid)
 *  - AddMemoryModal (creating new journal entries)
 *  - EditNoteModal (editing/deleting entries)
 */


import { useState, useEffect, useMemo } from 'react';
import SearchBar from './components/Weather/SearchBar';
import CurrentWeather from './components/Weather/CurrentWeather';
import MonthlyCalendar from './components/Calendar/MonthlyCalendar';
import { JournalEntry, WeatherSummary, ForecastByDate } from './types';
import { fetchCurrentWeather, fetchFiveDayForecast } from './lib/api/weather';
import { fetchJournalEntries } from './lib/api/journal';
import MiniMonth from './components/Calendar/MiniMonth';
import NotesList from './components/Sidebar/NotesList';
import RightPanel from './components/Sidebar/RightPanel';
import { createJournalEntry, updateJournalEntry, deleteJournalEntry } from './lib/api/journal';



function App() {

  // -------------------------
  // State variables
  // -------------------------
  type RightPanelMode = 'day' | 'note';

  const [rightPanelOpen, setRightPanelOpen] = useState(false);
  const [rightPanelMode, setRightPanelMode] = useState<RightPanelMode>('day');
  const [panelDate, setPanelDate] = useState<string | null>(null);
  const [panelNoteId, setPanelNoteId] = useState<number | null>(null);
  const [weather, setWeather] = useState<any>(null); // To display weather for current day (might be unnecessary)
  const [forecast, setForecast] = useState<WeatherSummary[]>([]);  // To get the forecast for the 5 days and display it
  const [calendarEntries, setCalendarEntries] = useState<JournalEntry[]>([]); // To store and grab all the entries we have notes for
  const [city, setCity] = useState<string>('Scarborough'); // What city we are displaying weather information for
  const [currentMonth, setCurrentMonth] = useState(() => new Date()); // To know what month we are on and what month to display


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



  // ASYNC FUNCTIONS
  //
  // Search handler: updates city + loads current weather box
  async function handleSearch(cityName: string) {
    setCity(cityName);

    try {
      const data = await fetchCurrentWeather(cityName);
      setWeather(data);
    } catch (err) {
      console.error('Failed to fetch current weather:', err);
      // optional: setWeather(null) or show error UI
    }
  }


  // Function to load up the journal entries from db (soon to be db)
  async function loadJournalEntries() {
    try {
      const data = await fetchJournalEntries();

      const withIds = data.map((entry, index) => ({
        ...entry,
        id: index,
      }));

      setCalendarEntries(withIds);
    } catch (err) {
      console.error('Failed to fetch journal data', err);
    }
  }



  // If note saved then we call to reload entries
  async function handleNoteSaved() {
    await loadJournalEntries();
  }

  // BUTTON FUNCTIONS
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

  // RIGHT SIDEBAR UTILITY FUNCTIONS
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


  // USE EFFECTS
  // Load journal entries from backend on startup
  useEffect(() => {
    loadJournalEntries();
  }, []);

  // Fetch forecast whenever the selected city changes
  useEffect(() => {
    if (!city) return;

    async function loadForecast() {
      try {
        const dailyForecast = await fetchFiveDayForecast(city);
        setForecast(dailyForecast);
      } catch (err) {
        console.error('Failed to fetch forecast:', err);
        // optional: setForecast([]) or show error UI
      }
    }

    loadForecast();
  }, [city]);





  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-100 to-white">
      <div className="grid grid-cols-12 gap-4 p-4 min-h-screen">
        {/* Sidebar */}
        <aside className="col-span-12 md:col-span-4 lg:col-span-3 space-y-4 h-full overflow-auto">
          <div className="bg-white/70 rounded-xl border p-3">
            <h1 className="text-xl font-bold">tsukiCalendar</h1>
            <p className="text-xs text-gray-600 mt-1">
              Weather + memories + reminders
            </p>
          </div>

          {/* City search */}
          <div className="bg-white/70 rounded-xl border p-3">
            <SearchBar onSearch={handleSearch} />
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
        onAfterCreate={handleNoteSaved}

        onUpdateNote={async (id, body) => {
          await updateJournalEntry(id, body);
          await handleNoteSaved();
          setPanelNoteId(id);
          setRightPanelMode('note');
        }}
        onDeleteNote={async (id) => {
          await deleteJournalEntry(id);
          await handleNoteSaved();
        }}
      />


    </div>
  );




}

export default App;
