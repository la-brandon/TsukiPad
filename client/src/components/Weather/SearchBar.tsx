/**
 * SearchBar.tsx
 *
 * Simple controlled input field that lets users type a city name.
 * On submit, calls the onSearch callback provided by the parent.
 *
 * Props:
 *  - onSearch(city: string)
 */


import { useState } from 'react';

interface SearchBarProps {
  onSearch: (city: string) => void;
}

function SearchBar({ onSearch }: SearchBarProps) {
  const [city, setCity] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (city.trim()) onSearch(city);
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
      <input
        type="text"
        value={city}
        onChange={(e) => setCity(e.target.value)}
        placeholder="Enter city name"
        className="border border-gray-300 rounded px-4 py-2 w-64 focus:outline-none focus:ring"
      />
      <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
        Search
      </button>
    </form>
  );
}

export default SearchBar;