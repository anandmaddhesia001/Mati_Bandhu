import { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Loader2, LocateIcon } from "lucide-react";
import { toast } from "react-toastify"; // Import toast
import "react-toastify/dist/ReactToastify.css"; // Import CSS for react-toastify
import WeatherMap from "./WeatherMap";

const dummyWeather = {
  name: "Unknown",
  sys: { country: "--" },
  weather: [{ main: "Clear", icon: "01d" }],
  main: { temp: 0, feels_like: 0, humidity: 0 },
  wind: { speed: 0 }
};

const dummyForecast = [
  { day: "Mon", temp: 0, condition: "Clear", icon: "01d" },
  { day: "Tue", temp: 0, condition: "Clear", icon: "01d" },
  { day: "Wed", temp: 0, condition: "Clear", icon: "01d" },
  { day: "Thu", temp: 0, condition: "Clear", icon: "01d" },
  { day: "Fri", temp: 0, condition: "Clear", icon: "01d" }
];

// Weather code mapping functions for Open-Meteo
const getWeatherCondition = (code) => {
  const conditions = {
    0: "Clear", 1: "Clear", 2: "Partly Cloudy", 3: "Cloudy",
    45: "Fog", 48: "Fog", 51: "Drizzle", 53: "Drizzle", 55: "Drizzle",
    61: "Rain", 63: "Rain", 65: "Rain", 66: "Freezing Rain", 67: "Freezing Rain",
    71: "Snow", 73: "Snow", 75: "Snow", 77: "Snow",
    80: "Rain", 81: "Rain", 82: "Rain", 85: "Snow", 86: "Snow",
    95: "Thunderstorm", 96: "Thunderstorm", 99: "Thunderstorm"
  };
  return conditions[code] || "Unknown";
};

const getWeatherIcon = (code) => {
  const icons = {
    0: "01d", 1: "01d", 2: "02d", 3: "03d",
    45: "50d", 48: "50d", 51: "09d", 53: "09d", 55: "09d",
    61: "10d", 63: "10d", 65: "10d", 66: "13d", 67: "13d",
    71: "13d", 73: "13d", 75: "13d", 77: "13d",
    80: "10d", 81: "10d", 82: "10d", 85: "13d", 86: "13d",
    95: "11d", 96: "11d", 99: "11d"
  };
  return icons[code] || "01d";
};

export default function WeatherTemp() {
  const [query, setQuery] = useState("");
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [hourlyWeather, setHourlyWeather] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchWeatherByCoords = async (latitude, longitude) => {
    try {
      setLoading(true);
      const weatherRes = await axios.get(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=temperature_2m,relative_humidity_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`
      );

      // Transform Open-Meteo data to match expected format
      const transformedWeather = {
        name: "Current Location",
        sys: { country: "Unknown" },
        weather: [{ main: getWeatherCondition(weatherRes.data.current_weather.weather_code), icon: getWeatherIcon(weatherRes.data.current_weather.weather_code) }],
        main: { 
          temp: weatherRes.data.current_weather.temperature, 
          feels_like: weatherRes.data.current_weather.temperature, 
          humidity: weatherRes.data.hourly.relative_humidity_2m ? weatherRes.data.hourly.relative_humidity_2m[0] : 50 
        },
        wind: { speed: 0 } // Open-Meteo doesn't provide wind in current_weather
      };

      const transformedForecast = weatherRes.data.daily.time.slice(0, 5).map((date, index) => ({
        day: new Date(date).toLocaleDateString("en-US", { weekday: "short" }),
        temp: `${weatherRes.data.daily.temperature_2m_max[index]}°C`,
        condition: getWeatherCondition(weatherRes.data.daily.weather_code[index]),
        icon: getWeatherIcon(weatherRes.data.daily.weather_code[index])
      }));

      setWeather(transformedWeather);
      setForecast(transformedForecast);
      setHourlyWeather([]); // Open-Meteo hourly data structure is different
    } catch {
      setWeather(dummyWeather);
      setForecast(dummyForecast);
      setHourlyWeather([]);
      toast.error("Unable to fetch weather data. Showing dummy data.");
    } finally {
      setLoading(false);
    }
  };

  const handleGeolocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        fetchWeatherByCoords(pos.coords.latitude, pos.coords.longitude);
      },
      () => {
        toast.error("Location access denied.");
      }
    );
  };

  const searchWeather = async (city) => {
    const searchQuery = city || query;
    if (!searchQuery) return;

    try {
      setLoading(true);
      
      // Geocode city to coordinates using Nominatim (free, no API key)
      const geoRes = await axios.get(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=1`
      );
      
      if (geoRes.data.length === 0) {
        toast.error("City not found.");
        return;
      }
      
      const { lat, lon } = geoRes.data[0];
      await fetchWeatherByCoords(lat, lon);
      
    } catch {
      toast.error("City not found.");
    } finally {
      setLoading(false);
    }
  };

  // Initial load: try geolocation
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          fetchWeatherByCoords(pos.coords.latitude, pos.coords.longitude);
        },
        () => {
          setWeather(dummyWeather);
          setForecast(dummyForecast);
          toast.warn("Could not fetch location, showing dummy data.");
        }
      );
    } else {
      setWeather(dummyWeather);
      setForecast(dummyForecast);
      toast.warn("Geolocation not supported, showing dummy data.");
    }
  }, []);

  return (
    <div className="min-h-screen  py-14 flex items-center justify-center">
      <div className="w-full max-w-3xl rounded-2xl shadow-xl p-8 ">
        {/* Search Input */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8 flex gap-4"
        >
          <input
            type="text"
            placeholder="🌍 Enter city (e.g., Delhi)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && searchWeather()}
            className="w-full p-4 border border-green-300 rounded-xl shadow-sm focus:ring-2 focus:ring-green-500 bg-white placeholder:text-green-700 text-green-800"
          />
          <button
            onClick={handleGeolocation}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-xl flex items-center justify-center"
            title="Use my location"
          >
            <LocateIcon className="w-5 h-5" />
          </button>
        </motion.div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center my-8">
            <Loader2 className="animate-spin w-10 h-10 text-green-700" />
          </div>
        )}

        {/* Current Weather */}
        {weather && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-center mb-8"
          >
            <div className="bg-white rounded-xl shadow-lg p-6 border border-green-100">
              <h2 className="text-3xl font-semibold text-green-800">
                {weather.name}, {weather.sys.country}
              </h2>
              <div className="flex justify-center items-center mt-4 gap-2">
                <img
                  src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
                  alt="weather icon"
                  className="w-16 h-16"
                />
                <p className="text-xl text-blue-700">
                  {weather.weather[0].main}
                </p>
              </div>
              <p className="text-5xl font-bold text-green-900 mt-2">
                {weather.main.temp}°C
              </p>
              <p className="text-sm text-gray-600 mt-2">
                Feels like: {weather.main.feels_like}°C | Humidity:{" "}
                {weather.main.humidity}% | Wind: {weather.wind.speed} m/s
              </p>
            </div>
          </motion.div>
        )}

        {/* Hourly Weather */}
        {hourlyWeather.length > 0 && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mt-8"
          >
            <h3 className="text-lg font-semibold text-green-400 mb-4">
              🕒 Hourly Forecast
            </h3>
            <div className="overflow-x-auto pb-4">
              <div className="flex gap-4">
                {hourlyWeather.map((hour, idx) => (
                  <div
                    key={idx}
                    className="min-w-[90px] bg-white border border-green-100 shadow-sm rounded-lg p-4 text-center"
                  >
                    <p className="text-green-700 text-sm font-medium">{hour.time}</p>
                    <img
                      src={`https://openweathermap.org/img/wn/${hour.icon}.png`}
                      alt={hour.condition}
                      className="w-10 h-10 mx-auto"
                    />
                    <p className="text-blue-700 text-xl">{hour.temp}°</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* 5-Day Forecast */}
        {forecast.length > 0 && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mt-8"
          >
            <h3 className="text-lg font-semibold mb-4 text-green-400">
              📅 5-Day Forecast
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
              {forecast.map((day, idx) => (
                <div
                  key={idx}
                  className="bg-white border border-green-100 shadow-xl rounded-xl p-6 text-center"
                >
                  <p className="font-semibold text-green-700">{day.day}</p>
                  <img
                    src={`https://openweathermap.org/img/wn/${day.icon}@2x.png`}
                    alt={day.condition}
                    className="w-16 h-16 mx-auto"
                  />
                  <p className="text-lg text-blue-700">{day.condition}</p>
                  <p className="font-bold text-2xl text-green-800">{day.temp}°C</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
        {/* Map */}
        <div className="mt-8">
          <WeatherMap />
        </div>
      </div>
    </div>
  );
}
