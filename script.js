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

// Toggle temperature 

function updateTemperature() {
  temperatureEl.textContent = isCelsius
    ? `${currentTempC} °C`
    : `${(currentTempC * 9 / 5 + 32).toFixed(1)} °F`;
}

// extreme temprature alert

function handleExtremeHeat() {
  if (currentTempC > 40) {
    alertBox.textContent = "Extreme heat alert!";
    alertBox.classList.remove("hidden");
  } else {
    alertBox.classList.add("hidden");
  }
}

//Forecast of 5 days 

async function fetchForecast(lat, lon) {
  const res = await fetch(
    `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}`
  );
  const data = await res.json();

  forecast.innerHTML = "";

  data.list
    .filter((_, index) => index % 8 === 0)
    .slice(0, 5)
    .forEach(day => {
      const tempC = (day.main.temp - 273.15).toFixed(1);

      forecast.innerHTML += `
        <div class="forecast-card">
          <p>${new Date(day.dt_txt).toDateString()}</p>
          <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}.png" />
          <p>${tempC} °C</p>
          <p>Humidity: ${day.main.humidity}%</p>
          <p>Wind: ${day.wind.speed} m/s</p>
        </div>
      `;
    });
}

//  background handlers

function setBackground(condition) {
  document.body.classList.remove("rain", "clouds", "clear");

  if (condition.includes("rain")) {
    document.body.classList.add("rain");
  } else if (condition.includes("cloud")) {
    document.body.classList.add("clouds");
  } else {
    document.body.classList.add("clear");
  }

}

// Recent searches  drop down 

function saveCity(city) {
  let cities = JSON.parse(localStorage.getItem("cities")) || [];
  if (!cities.includes(city)) cities.push(city);
  localStorage.setItem("cities", JSON.stringify(cities));
  renderCities();
}

function renderCities() {
  const cities = JSON.parse(localStorage.getItem("cities")) || [];
  if (!cities.length) return;

  recentCities.classList.remove("hidden");
  recentCities.innerHTML = `<option value="default">Recent cities</option>`;

  cities.forEach(city => {
    recentCities.innerHTML += `<option value="${city}">${city}</option>`;
  });
}

// Error handling


function showError(message) {
  errorMsg.textContent = message;
  errorMsg.classList.remove("hidden");
}

function hideError() {
  errorMsg.classList.add("hidden");
}

// Initialization code

renderCities();



