/**
 * App.tsx — TsukiPad
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
type AuthUser = { id: number; username: string; createdAt: string };

function App() {
  // ── Auth ──
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isSubmittingAuth, setIsSubmittingAuth] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // ── Data ──
  const [weather, setWeather] = useState<any>(null);
  const [forecast, setForecast] = useState<WeatherSummary[]>([]);
  const [calendarEntries, setCalendarEntries] = useState<JournalEntry[]>([]);
  const [city, setCity] = useState<string>('Scarborough');

  // ── UI ──
  const [rightPanelOpen, setRightPanelOpen] = useState(false);
  const [rightPanelMode, setRightPanelMode] = useState<RightPanelMode>('day');
  const [panelDate, setPanelDate] = useState<string | null>(null);
  const [panelNoteId, setPanelNoteId] = useState<number | null>(null);
  const [currentMonth, setCurrentMonth] = useState(() => new Date());

  // ── Derived ──
  const forecastByDate: ForecastByDate = useMemo(() => {
    const map: ForecastByDate = {};
    forecast.forEach(d => { if (d.date) map[d.date] = d; });
    return map;
  }, [forecast]);

  const today = useMemo(() => {
    const t = new Date(); t.setHours(0, 0, 0, 0); return t;
  }, []);

  const memories = useMemo(() =>
    calendarEntries.filter(e => { const d = new Date(e.date); d.setHours(0, 0, 0, 0); return d < today; }),
    [calendarEntries, today]);

  const reminders = useMemo(() =>
    calendarEntries.filter(e => { const d = new Date(e.date); d.setHours(0, 0, 0, 0); return d >= today; }),
    [calendarEntries, today]);

  // ── Auth handlers ──
  const handleAuthSubmit = async () => {
    setAuthError(''); setIsSubmittingAuth(true);
    try {
      const result = authMode === 'login'
        ? await login(username, password)
        : await register(username, password);
      if (result.user) {
        setIsLoggedIn(true); setCurrentUser(result.user);
        setUsername(''); setPassword('');
      }
    } catch { setAuthError('Something went wrong'); }
    finally { setIsSubmittingAuth(false); }
  };

  const handleLogout = async () => {
    await logout();
    setIsLoggedIn(false); setCurrentUser(null);
    setCalendarEntries([]); setCity('Scarborough');
    setWeather(null); setForecast([]);
  };

  // ── Data loaders ──
  async function handleCitySearch(cityName: string) {
    setCity(cityName);
    try { setWeather(await fetchCurrentWeather(cityName)); }
    catch (err) { console.error(err); }
  }

  async function loadJournalEntries() {
    try { setCalendarEntries(await fetchJournalEntries()); }
    catch (err) { console.error(err); }
  }

  async function refreshEntries() { await loadJournalEntries(); }

  // ── Calendar nav ──
  function goToPrevMonth() {
    setCurrentMonth(p => { const d = new Date(p); d.setMonth(d.getMonth() - 1); return d; });
  }
  function goToNextMonth() {
    setCurrentMonth(p => { const d = new Date(p); d.setMonth(d.getMonth() + 1); return d; });
  }

  // ── Panel handlers ──
  function openDayPanel(date: string) {
    setPanelDate(date); setPanelNoteId(null);
    setRightPanelMode('day'); setRightPanelOpen(true);
  }
  function openNotePanel(noteId: number) {
    setPanelNoteId(noteId); setRightPanelMode('note'); setRightPanelOpen(true);
  }

  // ── Effects ──
  useEffect(() => {
    if (!isLoggedIn) {
      setCalendarEntries([]); setRightPanelOpen(false);
      setPanelDate(null); setPanelNoteId(null); return;
    }
    loadJournalEntries();
  }, [currentUser]);

  useEffect(() => {
    if (!city) return;
    fetchFiveDayForecast(city).then(setForecast).catch(console.error);
  }, [city]);

  useEffect(() => {
    getMe()
      .then(r => { if (r.user) { setIsLoggedIn(true); setCurrentUser(r.user); } })
      .catch(() => { })
      .finally(() => setAuthLoading(false));
  }, []);

  if (authLoading) return <LoadingScreen />;
  if (!isLoggedIn) return (
    <AuthScreen
      mode={authMode} username={username} password={password}
      authError={authError} isSubmitting={isSubmittingAuth}
      onUsernameChange={setUsername} onPasswordChange={setPassword}
      onSubmit={handleAuthSubmit}
      onModeChange={mode => { setAuthMode(mode); setAuthError(''); }}
    />
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--paper)', display: 'flex', flexDirection: 'column' }}>
      {/* Top bar */}
      <header style={{
        borderBottom: '1px solid var(--border)',
        background: 'var(--paper-card)',
        padding: '0 1.5rem',
        height: '56px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: 'var(--shadow-xs)',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.625rem' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 600, color: 'var(--ink)', letterSpacing: '-0.02em' }}>
            TsukiPad ☽
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {currentUser && (
            <span style={{ fontSize: '0.8125rem', color: 'var(--ink-soft)' }}>
              {currentUser.username}
            </span>
          )}
          <button className="btn-ghost" onClick={handleLogout} style={{ padding: '0.375rem 0.875rem', fontSize: '0.8rem' }}>
            Sign out
          </button>
        </div>
      </header>

      {/* Body */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '260px 1fr', gap: 0, overflow: 'hidden', height: 'calc(100vh - 56px)' }}>
        {/* ── Sidebar ── */}
        <aside style={{
          borderRight: '1px solid var(--border)',
          background: 'var(--paper-warm)',
          overflowY: 'auto',
          padding: '1.25rem 1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
        }}>
          {/* Weather search */}
          <div>
            <p className="section-label" style={{ marginBottom: '0.625rem' }}>Location</p>
            <SearchBar onSearch={handleCitySearch} />
          </div>

          {/* Current weather */}
          {weather && (
            <div>
              <p className="section-label" style={{ marginBottom: '0.625rem' }}>Weather</p>
              <CurrentWeather data={weather} />
            </div>
          )}

          {/* Mini month */}
          <div>
            <p className="section-label" style={{ marginBottom: '0.625rem' }}>Navigate</p>
            <MiniMonth
              currentMonth={currentMonth}
              onPrevMonth={goToPrevMonth}
              onNextMonth={goToNextMonth}
              onSelectDate={openDayPanel}
            />
          </div>

          {/* Notes */}
          <div>
            <p className="section-label" style={{ marginBottom: '0.625rem' }}>Upcoming</p>
            <NotesList title="Reminders" notes={reminders} onSelectEntry={openNotePanel} />
          </div>

          <div>
            <p className="section-label" style={{ marginBottom: '0.625rem' }}>Past</p>
            <NotesList title="Memories" notes={memories} onSelectEntry={openNotePanel} />
          </div>
        </aside>

        {/* ── Main calendar ── */}
        <main style={{ overflowY: 'auto', padding: '1.5rem', background: 'var(--paper)' }}>
          <MonthlyCalendar
            currentMonth={currentMonth}
            journalEntries={calendarEntries}
            forecastByDate={forecastByDate}
            onPrevMonth={goToPrevMonth}
            onNextMonth={goToNextMonth}
            onSelectDate={openDayPanel}
            onSelectEntry={openNotePanel}
          />
        </main>
      </div>

      {/* Right panel */}
      <RightPanel
        isOpen={rightPanelOpen}
        mode={rightPanelMode}
        date={panelDate}
        noteId={panelNoteId}
        entries={calendarEntries}
        onClose={() => setRightPanelOpen(false)}
        onSelectNote={id => { setPanelNoteId(id); setRightPanelMode('note'); }}
        onBackToDay={date => { setPanelDate(date); setPanelNoteId(null); setRightPanelMode('day'); }}
        onCreateNote={createJournalEntry}
        onAfterCreate={refreshEntries}
        onUpdateNote={async (id, body) => {
          await updateJournalEntry(id, body);
          await refreshEntries();
          setPanelNoteId(id); setRightPanelMode('note');
        }}
        onDeleteNote={async id => {
          await deleteJournalEntry(id);
          await refreshEntries();
        }}
      />
    </div>
  );
}

export default App;
