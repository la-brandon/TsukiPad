/**
 * CurrentWeather.tsx
 *
 * Displays current temperature, conditions, and icon for the selected city.
 *
 * Props:
 *  - data: OpenWeather current weather API response
 */


interface CurrentWeatherProps {
  data: any;
}

function CurrentWeather({ data }: CurrentWeatherProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md w-80 text-center">
      <h2 className="text-2xl font-semibold mb-2">{data.name}</h2>
      <p className="text-lg">{Math.round(data.main.temp)}°C</p>
      <p className="capitalize text-gray-600">{data.weather[0].description}</p>
    </div>
  );
}

export default CurrentWeather;