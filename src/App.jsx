import React from "react";
import { useState, useMemo, useCallback } from "react";
import axios from "axios";
import { useCountries } from "use-react-countries";
import { Select, Option } from "@material-tailwind/react";
import "./App.css";

// Move constants outside component to avoid recreation
const PRAYER_NAMES = {
  Fajr: "الفجر",
  Sunrise: "الشروق",
  Dhuhr: "الظهر",
  Asr: "العصر",
  Maghrib: "المغرب",
  Isha: "العشاء",
};

const PRAYER_ORDER = ["Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"];

const CITIES_BY_COUNTRY = {
  "United States": [
    "New York",
    "Los Angeles",
    "Chicago",
    "Houston",
    "Miami",
    "San Francisco",
    "Seattle",
    "Boston",
  ],
  Egypt: [
    "Cairo",
    "Alexandria",
    "Giza",
    "Mansoura",
    "Luxor",
    "Aswan",
    "Port Said",
    "Suez",
  ],
  "Saudi Arabia": [
    "Riyadh",
    "Jeddah",
    "Mecca",
    "Medina",
    "Dammam",
    "Tabuk",
    "Abha",
    "Hail",
  ],
  "United Arab Emirates": [
    "Dubai",
    "Abu Dhabi",
    "Sharjah",
    "Ajman",
    "Ras Al Khaimah",
    "Fujairah",
    "Umm Al Quwain",
  ],
  Turkey: [
    "Istanbul",
    "Ankara",
    "Izmir",
    "Bursa",
    "Antalya",
    "Gaziantep",
    "Konya",
    "Adana",
  ],
  "United Kingdom": [
    "London",
    "Manchester",
    "Birmingham",
    "Leeds",
    "Glasgow",
    "Sheffield",
    "Bradford",
    "Liverpool",
  ],
  France: [
    "Paris",
    "Marseille",
    "Lyon",
    "Toulouse",
    "Nice",
    "Nantes",
    "Strasbourg",
    "Montpellier",
  ],
  Germany: [
    "Berlin",
    "Munich",
    "Hamburg",
    "Cologne",
    "Frankfurt",
    "Stuttgart",
    "Düsseldorf",
    "Dortmund",
  ],
  Pakistan: [
    "Karachi",
    "Lahore",
    "Islamabad",
    "Rawalpindi",
    "Faisalabad",
    "Multan",
    "Peshawar",
    "Quetta",
  ],
  India: [
    "Mumbai",
    "Delhi",
    "Bangalore",
    "Hyderabad",
    "Chennai",
    "Kolkata",
    "Pune",
    "Ahmedabad",
  ],
  Indonesia: [
    "Jakarta",
    "Surabaya",
    "Bandung",
    "Medan",
    "Semarang",
    "Makassar",
    "Palembang",
    "Tangerang",
  ],
  Malaysia: [
    "Kuala Lumpur",
    "George Town",
    "Ipoh",
    "Shah Alam",
    "Petaling Jaya",
    "Klang",
    "Johor Bahru",
    "Seremban",
  ],
  Morocco: [
    "Casablanca",
    "Rabat",
    "Fez",
    "Marrakech",
    "Agadir",
    "Tangier",
    "Meknes",
    "Oujda",
  ],
  Jordan: [
    "Amman",
    "Zarqa",
    "Irbid",
    "Russeifa",
    "Aqaba",
    "Salt",
    "Madaba",
    "Jerash",
  ],
  Lebanon: [
    "Beirut",
    "Tripoli",
    "Sidon",
    "Tyre",
    "Nabatieh",
    "Baalbek",
    "Jounieh",
    "Zahle",
  ],
  Kuwait: [
    "Kuwait City",
    "Hawalli",
    "Farwaniya",
    "Ahmadi",
    "Jahra",
    "Mubarak Al-Kabeer",
  ],
  Qatar: ["Doha", "Al Rayyan", "Umm Salal", "Al Wakrah", "Al Khor", "Dukhan"],
  Bahrain: ["Manama", "Riffa", "Muharraq", "Hamad Town", "A'ali", "Isa Town"],
  Oman: [
    "Muscat",
    "Salalah",
    "Nizwa",
    "Sur",
    "Sohar",
    "Ibri",
    "Rustaq",
    "Buraimi",
  ],
};

// Custom hook for prayer times
const usePrayerTimes = () => {
  const [prayerTimes, setPrayerTimes] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchPrayerTimes = useCallback(async (city, country) => {
    if (!city || !country) return;

    setLoading(true);
    setError("");

    try {
      const response = await axios.get(
        "https://api.aladhan.com/v1/timingsByCity",
        {
          params: {
            city,
            country,
            method: 5, // Egyptian General Authority of Survey
          },
          timeout: 10000, // 10 second timeout
        }
      );

      if (response.data.code === 200) {
        setPrayerTimes(response.data.data);
      } else {
        setError("Failed to fetch prayer times for this location");
      }
    } catch (error) {
      console.error("Error fetching prayer times:", error);
      if (error.code === "ECONNABORTED") {
        setError("Request timeout. Please check your internet connection.");
      } else if (error.response?.status === 404) {
        setError("Location not found. Please try a different city.");
      } else {
        setError("Failed to fetch prayer times. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const resetState = useCallback(() => {
    setPrayerTimes(null);
    setError("");
  }, []);

  return { prayerTimes, loading, error, fetchPrayerTimes, resetState };
};

// Utility functions
const convertTo12Hour = (time24) => {
  if (!time24) return "";

  const timeOnly = time24.split(" ")[0];
  const [hours, minutes] = timeOnly.split(":");
  const hour = parseInt(hours, 10);

  if (hour === 0) {
    return `12:${minutes} AM`;
  } else if (hour < 12) {
    return `${hour}:${minutes} AM`;
  } else if (hour === 12) {
    return `12:${minutes} PM`;
  } else {
    return `${hour - 12}:${minutes} PM`;
  }
};

// Component for prayer time item
const PrayerTimeItem = React.memo(({ prayer, time, arabicName }) => (
  <div className="flex justify-between items-center bg-white rounded-lg p-4 shadow-sm border border-purple-100 hover:shadow-md transition-shadow duration-200">
    <div className="flex flex-col">
      <span className="text-purple-800 font-semibold text-base">
        {arabicName}
      </span>
      <span className="text-purple-600 text-xs font-medium">{prayer}</span>
    </div>
    <span className="text-purple-700 font-bold text-xl">
      {convertTo12Hour(time)}
    </span>
  </div>
));

// Component for location confirmation
const LocationConfirmation = React.memo(
  ({ selectedCountry, selectedCity, selectedCountryObj }) => (
    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg p-4 animate-fade-in shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center shadow-sm">
            <svg
              className="w-4 h-4 text-green-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-green-800">
            Selected Location
          </p>
          <div className="flex items-center gap-2 mt-1">
            {selectedCountryObj && (
              <img
                src={selectedCountryObj.flags.svg}
                alt={selectedCountry}
                className="h-5 w-5 rounded-full object-cover border-2 border-green-300 shadow-sm"
              />
            )}
            <p className="text-green-700 font-bold text-sm">
              {selectedCity
                ? `${selectedCity}, ${selectedCountry}`
                : selectedCountry}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
);

// Component for error message
const ErrorMessage = React.memo(({ error }) => (
  <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 animate-fade-in">
    <div className="flex items-center gap-2">
      <svg
        className="w-4 h-4 text-red-600 flex-shrink-0"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fillRule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
          clipRule="evenodd"
        />
      </svg>
      <p className="text-red-700 text-sm font-medium">{error}</p>
    </div>
  </div>
));

const App = () => {
  const { countries } = useCountries();
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const { prayerTimes, loading, error, fetchPrayerTimes, resetState } =
    usePrayerTimes();

  // Memoized computed values
  const availableCountries = useMemo(
    () => countries.filter(({ name }) => CITIES_BY_COUNTRY[name]),
    [countries]
  );

  const availableCities = useMemo(
    () => (selectedCountry ? CITIES_BY_COUNTRY[selectedCountry] || [] : []),
    [selectedCountry]
  );

  const selectedCountryObj = useMemo(
    () => countries.find((country) => country.name === selectedCountry),
    [countries, selectedCountry]
  );

  const formattedPrayerTimes = useMemo(() => {
    if (!prayerTimes?.timings) return [];

    return PRAYER_ORDER.filter((prayer) => prayerTimes.timings[prayer]).map(
      (prayer) => ({
        prayer,
        time: prayerTimes.timings[prayer],
        arabicName: PRAYER_NAMES[prayer],
      })
    );
  }, [prayerTimes]);

  // Event handlers
  const handleCountryChange = useCallback(
    (value) => {
      setSelectedCountry(value);
      setSelectedCity("");
      resetState();
    },
    [resetState]
  );

  const handleCityChange = useCallback(
    (value) => {
      setSelectedCity(value);
      resetState();
    },
    [resetState]
  );

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      if (selectedCity && selectedCountry) {
        fetchPrayerTimes(selectedCity, selectedCountry);
      }
    },
    [selectedCity, selectedCountry, fetchPrayerTimes]
  );

  // Form validation
  const isFormValid = selectedCity && selectedCountry && !loading;

  return (
    <main className="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen flex flex-col justify-center items-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-lg">
        <div className="flex flex-col items-center mb-8">
          <img
            src="/logo.svg"
            alt="Pray Time Logo"
            className="w-24 h-24 mb-4 rounded-full shadow-lg"
          />
          <h1 className="text-3xl font-bold text-center text-gray-800">
            Today's Prayer Times
          </h1>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit} noValidate>
          {/* Country Selection */}
          <div className="w-full">
            <Select
              size="lg"
              label="Select Country"
              value={selectedCountry}
              onChange={handleCountryChange}
              className="flex justify-between px-2 !border-2 !border-gray-300 hover:!border-gray-400 focus:!border-blue-500 !rounded-lg !shadow-sm"
              labelProps={{
                className:
                  "!text-gray-600 peer-focus:!text-blue-500 !font-medium",
              }}
              menuProps={{
                className:
                  "!max-h-60 !border-2 !border-gray-200 !shadow-xl !rounded-lg !bg-white",
              }}
              selected={(element) =>
                element &&
                React.cloneElement(element, {
                  disabled: true,
                  className:
                    "flex items-center opacity-100 px-0 gap-2 pointer-events-none text-gray-800 font-medium",
                })
              }
            >
              {availableCountries.map(({ name, flags }) => (
                <Option
                  key={name}
                  value={name}
                  className="flex items-center gap-3 hover:!bg-blue-50 focus:!bg-blue-100 active:!bg-blue-100 transition-all duration-200 py-3 px-4 !rounded-md mx-1 my-0.5"
                >
                  <img
                    src={flags.svg}
                    alt={name}
                    className="h-6 w-6 rounded-full object-cover border-2 border-gray-200 shadow-sm flex-shrink-0"
                    loading="lazy"
                  />
                  <span className="text-gray-700 font-medium text-sm truncate">
                    {name}
                  </span>
                </Option>
              ))}
            </Select>
          </div>

          {/* City Selection */}
          {selectedCountry && availableCities.length > 0 && (
            <div className="w-full animate-fade-in">
              <Select
                size="lg"
                label="Select City"
                value={selectedCity}
                onChange={handleCityChange}
                className="flex justify-between px-2 !border-2 !border-gray-300 hover:!border-gray-400 focus:!border-blue-500 !rounded-lg !shadow-sm"
                labelProps={{
                  className:
                    "!text-gray-600 peer-focus:!text-blue-500 !font-medium",
                }}
                menuProps={{
                  className:
                    "!max-h-60 !border-2 !border-gray-200 !shadow-xl !rounded-lg !bg-white",
                }}
              >
                {availableCities.map((city) => (
                  <Option
                    key={city}
                    value={city}
                    className="hover:!bg-blue-50 focus:!bg-blue-100 active:!bg-blue-100 transition-all duration-200 py-3 px-4 !rounded-md mx-1 my-0.5"
                  >
                    <span className="text-gray-700 font-medium text-sm">
                      {city}
                    </span>
                  </Option>
                ))}
              </Select>
            </div>
          )}

          {/* Location Confirmation */}
          {selectedCountry && (
            <LocationConfirmation
              selectedCountry={selectedCountry}
              selectedCity={selectedCity}
              selectedCountryObj={selectedCountryObj}
            />
          )}

          {/* Error Message */}
          {error && <ErrorMessage error={error} />}

          {/* Prayer Times Display */}
          {prayerTimes && (
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-lg p-6 space-y-4 animate-fade-in">
              <div className="flex items-center gap-2 mb-4">
                <svg
                  className="w-6 h-6 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h3 className="text-xl font-bold text-purple-800">
                  مواقيت الصلاة - {selectedCity}, {selectedCountry}
                </h3>
              </div>
              <div className="space-y-3">
                {formattedPrayerTimes.map((prayerTime, index) => (
                  <PrayerTimeItem
                    key={prayerTime.prayer}
                    prayer={prayerTime.prayer}
                    time={prayerTime.time}
                    arabicName={prayerTime.arabicName}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!isFormValid}
            className={`w-full font-bold py-4 px-6 rounded-lg shadow-lg transition-all duration-300 focus:outline-none focus:ring-4 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
              isFormValid
                ? "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white hover:shadow-xl focus:ring-green-300"
                : "bg-gradient-to-r from-blue-500 to-indigo-600 text-white focus:ring-blue-300"
            }`}
            aria-label={
              selectedCity && selectedCountry
                ? `Get prayer times for ${selectedCity}`
                : "Select country and city first"
            }
          >
            <span className="flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <svg
                    className="animate-spin w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Loading Prayer Times...
                </>
              ) : (
                <>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {selectedCity && selectedCountry
                    ? `Get Prayer Times for ${selectedCity}`
                    : "Select Country & City"}
                </>
              )}
            </span>
          </button>
        </form>
      </div>
      <footer className="mt-8 text-gray-600 text-sm">
        <p className="text-center">
          Made with ❤️ by{" "}
          <a
            href="https://www.instagram.com/kelentooooon"
            className="text-blue-600 hover:underline capitalize"
            target="_blank"
            rel="noopener noreferrer"
          >
            ehab mohamed
          </a>
        </p>
        <p className="text-center mt-2">
          and thanks to{" "}
          <a
            href="https://aladhan.com/"
            className="text-blue-600 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Aladhan API
          </a>{" "}
          for providing prayer times data.
        </p>
      </footer>
    </main>
  );
};

export default App;
