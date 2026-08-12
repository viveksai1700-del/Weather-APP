const cityInput = document.getElementById("cityInput");
const cityName = document.getElementById("cityName");
const temperature = document.getElementById("temperature");
const description = document.getElementById("description");
const humidity = document.getElementById("humidity");
const wind = document.getElementById("wind");
const feelsLike = document.getElementById("feelsLike");
const weatherSymbol = document.getElementById("weatherSymbol");
const errorMessage = document.getElementById("errorMessage");
const dateTime = document.getElementById("dateTime");
const loadingMessage = document.getElementById("loadingMessage");
const recentCities = document.getElementById("recentCities");

let currentTemperatureC = null;
let currentFeelsLikeC = null;
let currentUnit = "C";


async function getWeather() {

    const city = cityInput.value.trim();

    if (city === "") {
        errorMessage.textContent = "Please enter a city name.";
        return;
    }

    errorMessage.textContent = "";
    loadingMessage.textContent = "Loading weather data...";

    try {

        const response = await fetch(
            `https://wttr.in/${encodeURIComponent(city)}?format=j1`
        );

        if (!response.ok) {
            throw new Error("Unable to fetch weather data.");
        }

        const data = await response.json();

        const currentWeather = data.current_condition[0];

        cityName.textContent = city;

        currentTemperatureC = Number(currentWeather.temp_C);
        currentFeelsLikeC = Number(currentWeather.FeelsLikeC);

        updateTemperatureDisplay();

        description.textContent =
            currentWeather.weatherDesc[0].value;

        humidity.textContent =
            `${currentWeather.humidity}%`;

        wind.textContent =
            `${currentWeather.windspeedKmph} km/h`;

        updateFeelsLikeDisplay();

        weatherSymbol.textContent =
            getWeatherIcon(currentWeather.weatherCode);

        updateBackground(currentWeather.weatherCode);

        loadingMessage.textContent = "";

        saveRecentCity(city);

    } catch (error) {

        loadingMessage.textContent = "";

        errorMessage.textContent =
            "Unable to find weather information. Please check the city name.";
    }
}


function getWeatherIcon(code) {

    const weatherCode = Number(code);

    if (weatherCode === 113) {
        return "☀";
    }

    if ([116, 119, 122].includes(weatherCode)) {
        return "☁";
    }

    if (
        [176, 263, 266, 293, 296, 299, 302, 305, 308].includes(weatherCode)
    ) {
        return "☂";
    }

    if (
        [179, 182, 185, 227, 230, 323, 326, 329, 332, 335, 338].includes(weatherCode)
    ) {
        return "❄";
    }

    if ([200, 386, 389, 392, 395].includes(weatherCode)) {
        return "⚡";
    }

    return "☁";
}


function updateBackground(code) {

    const weatherCode = Number(code);

    document.body.className = "";

    if (weatherCode === 113) {
        document.body.classList.add("clear");
    }

    else if ([116, 119, 122].includes(weatherCode)) {
        document.body.classList.add("cloudy");
    }

    else if (
        [176, 263, 266, 293, 296, 299, 302, 305, 308].includes(weatherCode)
    ) {
        document.body.classList.add("rain");
    }

    else if (
        [179, 182, 185, 227, 230, 323, 326, 329, 332, 335, 338].includes(weatherCode)
    ) {
        document.body.classList.add("snow");
    }

    else if ([200, 386, 389, 392, 395].includes(weatherCode)) {
        document.body.classList.add("storm");
    }

    else {
        document.body.classList.add("cloudy");
    }
}


function updateDateTime() {

    const now = new Date();

    const options = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    };

    dateTime.textContent =
        now.toLocaleDateString("en-US", options);
}


function saveRecentCity(city) {

    let cities =
        JSON.parse(localStorage.getItem("recentCities")) || [];

    cities = cities.filter(
        existingCity =>
            existingCity.toLowerCase() !== city.toLowerCase()
    );

    cities.unshift(city);

    if (cities.length > 5) {
        cities.pop();
    }

    localStorage.setItem(
        "recentCities",
        JSON.stringify(cities)
    );

    displayRecentCities();
}


function displayRecentCities() {

    const cities =
        JSON.parse(localStorage.getItem("recentCities")) || [];

    recentCities.innerHTML = "";

    cities.forEach(city => {

        const li = document.createElement("li");

        li.textContent = city;

        li.addEventListener("click", () => {

            cityInput.value = city;

            getWeather();
        });

        recentCities.appendChild(li);
    });
}


function setUnit(unit) {

    currentUnit = unit;

    updateTemperatureDisplay();
    updateFeelsLikeDisplay();
}


function updateTemperatureDisplay() {

    if (currentTemperatureC === null) {
        return;
    }

    if (currentUnit === "C") {

        temperature.textContent =
            `${currentTemperatureC}°C`;

    } else {

        const fahrenheit =
            (currentTemperatureC * 9 / 5) + 32;

        temperature.textContent =
            `${fahrenheit.toFixed(1)}°F`;
    }
}


function updateFeelsLikeDisplay() {

    if (currentFeelsLikeC === null) {
        return;
    }

    if (currentUnit === "C") {

        feelsLike.textContent =
            `${currentFeelsLikeC}°C`;

    } else {

        const fahrenheit =
            (currentFeelsLikeC * 9 / 5) + 32;

        feelsLike.textContent =
            `${fahrenheit.toFixed(1)}°F`;
    }
}


cityInput.addEventListener("keydown", function (event) {

    if (event.key === "Enter") {
        getWeather();
    }
});


updateDateTime();

setInterval(updateDateTime, 60000);

displayRecentCities();