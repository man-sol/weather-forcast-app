// CONFIG
const API_KEY = "4e0f2a991f315f88bb1699b720d1250a";


//   DOM ELEMENTS

const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const locationBtn = document.getElementById("locationBtn");
const toggleTempBtn = document.getElementById("toggleTemp");
const recentCities = document.getElementById("recentCities");
const errorMsg = document.getElementById("errorMsg");

const cityName = document.getElementById("cityName");
const temperatureEl = document.getElementById("temperature");
const description = document.getElementById("description");
const humidity = document.getElementById("humidity");
const wind = document.getElementById("wind");
const weatherIcon = document.getElementById("weatherIcon");
const forecast = document.getElementById("forecast");
const alertBox = document.getElementById("alertBox");

const weatherSection = document.getElementById("weatherSection");
const emptyState = document.getElementById("emptyState");

// Defining States

let isCelsius = true;
let currentTempC = null;

// Adding events

searchBtn.addEventListener("click", () => {
  const city = cityInput.value.trim();
  if (!city) return showError("City name cannot be empty");
  fetchByCity(city);
});

locationBtn.addEventListener("click", () => {
  if (!navigator.geolocation) {
    return showError("Geolocation not supported");
  }

  navigator.geolocation.getCurrentPosition(
    pos => fetchByCoords(pos.coords.latitude, pos.coords.longitude),
    () => showError("Location permission denied")
  );
});

toggleTempBtn.addEventListener("click", () => {
  if (currentTempC === null) return;
  isCelsius = !isCelsius;
  updateTemperature();
});

recentCities.addEventListener("change", e => {
  if (e.target.value !== "default") {
    fetchByCity(e.target.value);
  }
});

// fetch by city name

async function fetchByCity(city) {
  try {
    hideError();

    // Convert city to coordinates
    const geoRes = await fetch(
      `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${API_KEY}`
    );
    const geoData = await geoRes.json();

    if (!geoData.length) throw new Error("City not found");

    const { lat, lon, name } = geoData[0];
    saveCity(name);
    fetchByCoords(lat, lon);

  } catch (err) {
    showError(err.message);
  }
}


// fetching using Coordinates

async function fetchByCoords(lat, lon) {
  try {
    hideError();

    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}`
    );

    if (!res.ok) throw new Error("Unable to fetch weather");

    const data = await res.json();
    displayWeather(data);
    fetchForecast(lat, lon);

  } catch (err) {
    showError(err.message);
  }
}

// Display weather 

function displayWeather(data) {
  emptyState.classList.add("hidden");
  weatherSection.classList.remove("hidden");

  cityName.textContent = data.name;

  currentTempC = (data.main.temp - 273.15).toFixed(1);
  updateTemperature();

  description.textContent = data.weather[0].description;
  humidity.textContent = `${data.main.humidity}%`;
  wind.textContent = `${data.wind.speed} m/s`;

  weatherIcon.src =
    `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;

  handleExtremeHeat();
  setBackground(data.weather[0].main.toLowerCase());
}


