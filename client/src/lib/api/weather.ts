/**
 * lib/api/weather.ts
 *
 * Centralized helper functions for calling the OpenWeather API.
 * Exposes:
 *  - fetchCurrentWeather(city)
 *  - fetchFiveDayForecast(city)
 *
 * These are used by App.tsx so that networking logic is not mixed
 * with UI state and rendering.
 */

import { WeatherSummary } from '../../types';

const API_BASE = 'https://api.openweathermap.org/data/2.5';

/** Helper to get the API key or throw a clear error */
function getApiKey(): string {
    const key = import.meta.env.VITE_API_KEY;
    if (!key) {
        throw new Error('Missing VITE_API_KEY in environment.');
    }
    return key;
}

/**
 * Fetches current weather data for a given city.
 * Returns the raw OpenWeather "current weather" response.
 */
export async function fetchCurrentWeather(city: string): Promise<any> {
    const apiKey = getApiKey();

    const res = await fetch(
        `${API_BASE}/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`
    );

    if (!res.ok) {
        throw new Error(`Failed to fetch current weather for "${city}"`);
    }

    return res.json();
}

/**
 * Fetches the 5-day / 3-hour forecast for a city and
 * aggregates it into an array of WeatherSummary, one per day.
 */
export async function fetchFiveDayForecast(city: string): Promise<WeatherSummary[]> {
    const apiKey = getApiKey();

    // 1. Fetch 5-day / 3-hour forecast
    const res = await fetch(
        `${API_BASE}/forecast?q=${encodeURIComponent(city)}&units=metric&appid=${apiKey}`
    );

    if (!res.ok) {
        throw new Error(`Failed to fetch forecast for "${city}"`);
    }

    const data = await res.json();

    if (!data.list) {
        return [];
    }

    // 2. Aggregate by date (YYYY-MM-DD)
    const dailyMap: Record<string, WeatherSummary> = {};

    data.list.forEach((item: any) => {
        const date = item.dt_txt.split(' ')[0]; // "YYYY-MM-DD"
        const temp = item.main.temp;
        const weather = item.weather[0].main;
        const icon = item.weather[0].icon;

        if (!dailyMap[date]) {
            dailyMap[date] = {
                date,
                tempMin: temp,
                tempMax: temp,
                weather,
                icon,
            };
        } else {
            dailyMap[date].tempMin = Math.min(dailyMap[date].tempMin, temp);
            dailyMap[date].tempMax = Math.max(dailyMap[date].tempMax, temp);
        }
    });

    // 3. Convert map to array and take the next 5 days
    const dailyForecast = Object.values(dailyMap).slice(0, 5);
    return dailyForecast;
}
