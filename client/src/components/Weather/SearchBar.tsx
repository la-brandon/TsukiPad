/**
 * SearchBar.tsx — redesigned
 */

import { useState } from 'react';

interface SearchBarProps {
  onSearch: (city: string) => void;
}

function SearchBar({ onSearch }: SearchBarProps) {
  const [city, setCity] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (city.trim()) onSearch(city.trim());
  }

  return (
    <div style={{ display: 'flex', gap: '0.5rem' }}>
      <input
        type="text"
        value={city}
        onChange={e => setCity(e.target.value)}
        placeholder="Search city…"
        onKeyDown={e => e.key === 'Enter' && handleSubmit(e as any)}
        style={{
          flex: 1,
          padding: '0.5rem 0.75rem',
          fontSize: '0.8125rem',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-sm)',
          background: 'var(--paper-card)',
          color: 'var(--ink)',
          outline: 'none',
          fontFamily: 'var(--font-body)',
          minWidth: 0,
        }}
      />
      <button
        onClick={handleSubmit as any}
        className="btn-primary"
        style={{ padding: '0.5rem 0.875rem', fontSize: '0.8rem', flexShrink: 0 }}
      >
        Go
      </button>
    </div>
  );
}

export default SearchBar;
