import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import axios from "axios";
import loc from '../../assets/location-icon.png';
import { FaCloudSun, FaWind, FaTint, FaLeaf, FaSmog, FaMapMarkerAlt } from "react-icons/fa";

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

// Open-Meteo API (no API key needed)
const WeatherMap = () => {
  const [location, setLocation] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Get user's location from browser
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ latitude, longitude });
        },
        (error) => {
          console.error("Error getting location:", error);
          // You can set a default location here if needed
          setLocation({ latitude: 40.730610, longitude: -73.935242 }); // Default: New York City
        }
      );
    } else {
      console.log("Geolocation is not supported by this browser.");
    }
  }, []);

  useEffect(() => {
    if (location) {
      const fetchWeatherData = async () => {
        try {
          setLoading(true);
          // Fetch weather data from Open-Meteo
          const weatherResponse = await axios.get(
            `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current_weather=true&hourly=temperature_2m,relative_humidity_2m,weather_code&timezone=auto`
          );
          
          // Transform Open-Meteo data to expected format
          const transformedWeather = {
            name: "Current Location",
            sys: { country: "Unknown" },
            weather: [{ main: getWeatherCondition(weatherResponse.data.current_weather.weather_code), icon: getWeatherIcon(weatherResponse.data.current_weather.weather_code) }],
            main: { 
              temp: weatherResponse.data.current_weather.temperature, 
              humidity: weatherResponse.data.hourly.relative_humidity_2m ? weatherResponse.data.hourly.relative_humidity_2m[0] : 50 
            },
            wind: { speed: weatherResponse.data.current_weather.windspeed || 0 }
          };
          
          setWeatherData(transformedWeather);
          setLoading(false);
        } catch (error) {
          setLoading(false);
          console.error("Failed to fetch data:", error);
        }
      };
      fetchWeatherData();
    }
  }, [location]);

  if (!location) {
    return (
      <div className="flex items-center justify-center h-96">
        <span className="text-green-700 font-semibold text-lg animate-pulse">
          <FaMapMarkerAlt className="inline mr-2" />
          Loading your location...
        </span>
      </div>
    );
  }

  const mapCenter = [location.latitude, location.longitude];
  const zoom = 13;

  return (
    <div className="mt-10 max-w-3xl mx-auto">
      {/* Map */}
      <div className="rounded-2xl shadow-2xl h-96 mb-8 border-2 border-green-200 overflow-hidden animate-fade-in">
        <MapContainer
          center={mapCenter}
          zoom={zoom}
          style={{ height: "100%", width: "100%" }}
          className="rounded-2xl"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <Marker
            position={mapCenter}
            icon={L.icon({
              iconUrl: loc,
              iconSize: [40, 40],
            })}
          >
            <Popup>
              <div className="text-center">
                <h3 className="text-lg font-bold text-green-700 mb-2 flex items-center justify-center gap-2">
                  <FaCloudSun className="text-yellow-400" /> Weather Info
                </h3>
                {weatherData ? (
                  <div className="space-y-1 text-gray-700">
                    <p>
                      <FaCloudSun className="inline text-yellow-400 mr-1" />
                      Temperature: <span className="font-semibold">{weatherData.main.temp}°C</span>
                    </p>
                    <p>
                      <FaTint className="inline text-blue-400 mr-1" />
                      Humidity: <span className="font-semibold">{weatherData.main.humidity}%</span>
                    </p>
                    <p>
                      <FaWind className="inline text-green-500 mr-1" />
                      Wind Speed: <span className="font-semibold">{weatherData.wind.speed} m/s</span>
                    </p>
                  </div>
                ) : (
                  <p>Loading weather data...</p>
                )}
              </div>
            </Popup>
          </Marker>
        </MapContainer>
      </div>

      {/* Agriculture Tip */}
      <div className="bg-gradient-to-r from-green-100 via-lime-100 to-emerald-100 border border-green-200 rounded-xl shadow p-6 flex items-center gap-4 animate-fade-in">
        <FaLeaf className="text-green-500 text-2xl animate-bounce" />
        <span className="text-green-700 font-semibold text-lg">
          Tip: Monitor weather and air quality for healthier crops and smarter farming decisions!
        </span>
      </div>

      {/* Animations */}
      <style>
        {`
          @keyframes fade-in {
            from { opacity: 0; transform: translateY(10px);}
            to { opacity: 1; transform: translateY(0);}
          }
          .animate-fade-in {
            animation: fade-in 0.7s;
          }
        `}
      </style>
    </div>
  );
};

export default WeatherMap;
