const cityInput = document.getElementById("cityInput");
const cityName = document.getElementById("cityName");
const temperature = document.getElementById("temperature");
const description = document.getElementById("description");

const humidity = document.getElementById("humidity");
const wind = document.getElementById("wind");
const feelsLike = document.getElementById("feelsLike");

const visibility = document.getElementById("visibility");
const windDirection = document.getElementById("windDirection");
const uvIndex = document.getElementById("uvIndex");

const sunrise = document.getElementById("sunrise");
const sunset = document.getElementById("sunset");

const weatherSymbol = document.getElementById("weatherSymbol");
const weatherIcon = document.getElementById("weatherIcon");

const errorMessage = document.getElementById("errorMessage");
const loadingMessage = document.getElementById("loadingMessage");
const dateTime = document.getElementById("dateTime");

const recentCities = document.getElementById("recentCities");

const hourlyForecast = document.getElementById("hourlyForecast");
const dailyForecast = document.getElementById("dailyForecast");

const celsiusBtn = document.getElementById("celsiusBtn");
const fahrenheitBtn = document.getElementById("fahrenheitBtn");


// ========================================
// GLOBAL STATE
// ========================================

let currentTemperatureC = null;
let currentFeelsLikeC = null;

let currentUnit = "C";

let currentWeatherData = null;


// ========================================
// GET WEATHER
// ========================================

async function getWeather(cityOverride = null) {

    const city = cityOverride || cityInput.value.trim();

    if (city === "") {

        errorMessage.textContent =
            "Please enter a city name.";

        return;
    }

    errorMessage.textContent = "";

    loadingMessage.textContent =
        "Loading weather data...";

    try {

        const response = await fetch(
            `https://wttr.in/${encodeURIComponent(city)}?format=j1`
        );

        if (!response.ok) {
            throw new Error("Weather request failed.");
        }

        const data = await response.json();

        if (
            !data.current_condition ||
            data.current_condition.length === 0
        ) {
            throw new Error("Invalid weather data.");
        }

        currentWeatherData = data;

        const currentWeather =
            data.current_condition[0];


        // ========================================
        // CURRENT WEATHER
        // ========================================

        cityName.textContent = city;

        cityInput.value = city;

        currentTemperatureC =
            Number(currentWeather.temp_C);

        currentFeelsLikeC =
            Number(currentWeather.FeelsLikeC);


        updateTemperatureDisplay();

        updateFeelsLikeDisplay();


        description.textContent =
            currentWeather.weatherDesc[0].value;


        humidity.textContent =
            `${currentWeather.humidity}%`;


        wind.textContent =
            `${currentWeather.windspeedKmph} km/h`;


        visibility.textContent =
            `${currentWeather.visibility} km`;


        windDirection.textContent =
            `${currentWeather.winddir16Point}`;


        uvIndex.textContent =
            currentWeather.uvIndex;


        // ========================================
        // WEATHER ICON
        // ========================================

        const weatherCode =
            currentWeather.weatherCode;

        weatherSymbol.textContent =
            getWeatherIcon(weatherCode);


        updateBackground(weatherCode);


        // ========================================
        // DATE / TIME
        // ========================================

        updateDateTime();


        // ========================================
        // SUNRISE / SUNSET
        // ========================================

        updateSunData(data);


        // ========================================
        // FORECASTS
        // ========================================

        generateHourlyForecast(data);

        generateDailyForecast(data);


        // ========================================
        // RECENT SEARCHES
        // ========================================

        saveRecentCity(city);


        loadingMessage.textContent = "";

    }

    catch (error) {

        console.error(error);

        loadingMessage.textContent = "";

        errorMessage.textContent =
            "Unable to find weather information. Please check the city name.";

        clearForecasts();
    }
}


// ========================================
// WEATHER ICON
// ========================================

function getWeatherIcon(code) {

    const weatherCode = Number(code);


    // Clear
    if (weatherCode === 113) {
        return "☀️";
    }


    // Partly cloudy / cloudy
    if (
        [116, 119, 122].includes(weatherCode)
    ) {
        return "☁️";
    }


    // Rain
    if (
        [
            176,
            263,
            266,
            293,
            296,
            299,
            302,
            305,
            308
        ].includes(weatherCode)
    ) {
        return "🌧️";
    }


    // Snow
    if (
        [
            179,
            182,
            185,
            227,
            230,
            323,
            326,
            329,
            332,
            335,
            338
        ].includes(weatherCode)
    ) {
        return "❄️";
    }


    // Thunderstorm
    if (
        [
            200,
            386,
            389,
            392,
            395
        ].includes(weatherCode)
    ) {
        return "⛈️";
    }


    return "☁️";
}


// ========================================
// BACKGROUND
// ========================================

function updateBackground(code) {

    const weatherCode = Number(code);

    document.body.className = "";


    if (weatherCode === 113) {

        document.body.classList.add("clear");

    }

    else if (
        [116, 119, 122].includes(weatherCode)
    ) {

        document.body.classList.add("cloudy");

    }

    else if (
        [
            176,
            263,
            266,
            293,
            296,
            299,
            302,
            305,
            308
        ].includes(weatherCode)
    ) {

        document.body.classList.add("rain");

    }

    else if (
        [
            179,
            182,
            185,
            227,
            230,
            323,
            326,
            329,
            332,
            335,
            338
        ].includes(weatherCode)
    ) {

        document.body.classList.add("snow");

    }

    else if (
        [
            200,
            386,
            389,
            392,
            395
        ].includes(weatherCode)
    ) {

        document.body.classList.add("storm");

    }

    else {

        document.body.classList.add("cloudy");

    }
}


// ========================================
// DATE / TIME
// ========================================

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
        now.toLocaleDateString(
            "en-US",
            options
        );
}


// ========================================
// SUNRISE / SUNSET
// ========================================

function updateSunData(data) {

    if (
        !data.weather ||
        !data.weather[0] ||
        !data.weather[0].astronomy
    ) {
        sunrise.textContent = "--:--";
        sunset.textContent = "--:--";
        return;
    }


    const astronomy =
        data.weather[0].astronomy[0];


    sunrise.textContent =
        formatTime(astronomy.sunrise);


    sunset.textContent =
        formatTime(astronomy.sunset);
}


function formatTime(time) {

    if (!time) {
        return "--:--";
    }

    return time;
}


// ========================================
// HOURLY FORECAST
// ========================================

function generateHourlyForecast(data) {

    hourlyForecast.innerHTML = "";


    if (
        !data.weather ||
        !data.weather[0] ||
        !data.weather[0].hourly
    ) {
        return;
    }


    const hourlyData =
        data.weather[0].hourly;


    hourlyData.forEach((hour, index) => {

        const card =
            document.createElement("div");

        card.className =
            "hourly-card";


        const time =
            formatHour(hour.time);


        const icon =
            getWeatherIcon(hour.weatherCode);


        const temp =
            currentUnit === "C"
                ? `${hour.tempC}°`
                : `${convertToFahrenheit(hour.tempC)}°`;


        card.innerHTML = `
            <div class="hour">
                ${index === 0 ? "Now" : time}
            </div>

            <div class="hour-icon">
                ${icon}
            </div>

            <div class="hour-temp">
                ${temp}
            </div>
        `;


        hourlyForecast.appendChild(card);
    });
}


// ========================================
// FORMAT HOURLY TIME
// ========================================

function formatHour(time) {

    const numericTime =
        Number(time);


    if (numericTime === 0) {
        return "12 AM";
    }


    if (numericTime < 100) {

        return `${numericTime / 100} AM`;
    }


    const hour =
        Math.floor(numericTime / 100);


    if (hour < 12) {
        return `${hour} AM`;
    }


    if (hour === 12) {
        return "12 PM";
    }


    return `${hour - 12} PM`;
}


// ========================================
// DAILY FORECAST
// ========================================

function generateDailyForecast(data) {

    dailyForecast.innerHTML = "";


    if (!data.weather) {
        return;
    }


    data.weather
        .slice(0, 5)
        .forEach((day, index) => {

            const card =
                document.createElement("div");

            card.className =
                "daily-card";


            const date =
                new Date(day.date);


            const dayName =
                index === 0
                    ? "Today"
                    : date.toLocaleDateString(
                        "en-US",
                        {
                            weekday: "short"
                        }
                    );


            const icon =
                getDailyIcon(day);


            const maxTemp =
                currentUnit === "C"
                    ? `${day.maxtempC}°`
                    : `${convertToFahrenheit(day.maxtempC)}°`;


            const minTemp =
                currentUnit === "C"
                    ? `${day.mintempC}°`
                    : `${convertToFahrenheit(day.mintempC)}°`;


            card.innerHTML = `
                <div class="day">
                    ${dayName}
                </div>

                <div class="day-icon">
                    ${icon}
                </div>

                <div class="temps">
                    <span>${maxTemp}</span>
                    <span class="low">${minTemp}</span>
                </div>
            `;


            dailyForecast.appendChild(card);
        });
}


// ========================================
// DAILY WEATHER ICON
// ========================================

function getDailyIcon(day) {

    if (
        !day.hourly ||
        day.hourly.length === 0
    ) {
        return "☁️";
    }


    const middleHour =
        day.hourly[
            Math.floor(day.hourly.length / 2)
        ];


    return getWeatherIcon(
        middleHour.weatherCode
    );
}


// ========================================
// UNIT CONVERSION
// ========================================

function convertToFahrenheit(celsius) {

    return (
        (Number(celsius) * 9 / 5) + 32
    ).toFixed(1);
}


// ========================================
// SET UNIT
// ========================================

function setUnit(unit) {

    currentUnit = unit;


    if (unit === "C") {

        celsiusBtn.classList.add("active");
        fahrenheitBtn.classList.remove("active");

    }

    else {

        fahrenheitBtn.classList.add("active");
        celsiusBtn.classList.remove("active");

    }


    updateTemperatureDisplay();

    updateFeelsLikeDisplay();


    if (currentWeatherData) {

        generateHourlyForecast(
            currentWeatherData
        );

        generateDailyForecast(
            currentWeatherData
        );
    }
}


// ========================================
// TEMPERATURE DISPLAY
// ========================================

function updateTemperatureDisplay() {

    if (currentTemperatureC === null) {
        return;
    }


    if (currentUnit === "C") {

        temperature.textContent =
            `${currentTemperatureC}°C`;

    }

    else {

        temperature.textContent =
            `${convertToFahrenheit(currentTemperatureC)}°F`;
    }
}


// ========================================
// FEELS LIKE
// ========================================

function updateFeelsLikeDisplay() {

    if (currentFeelsLikeC === null) {
        return;
    }


    if (currentUnit === "C") {

        feelsLike.textContent =
            `${currentFeelsLikeC}°C`;

    }

    else {

        feelsLike.textContent =
            `${convertToFahrenheit(currentFeelsLikeC)}°F`;
    }
}


// ========================================
// RECENT SEARCHES
// ========================================

function saveRecentCity(city) {

    let cities =
        JSON.parse(
            localStorage.getItem("recentCities")
        ) || [];


    cities =
        cities.filter(
            existingCity =>
                existingCity.toLowerCase()
                !== city.toLowerCase()
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
        JSON.parse(
            localStorage.getItem("recentCities")
        ) || [];


    recentCities.innerHTML = "";


    cities.forEach(city => {

        const li =
            document.createElement("li");


        li.textContent =
            city;


        li.addEventListener(
            "click",
            () => {

                cityInput.value =
                    city;

                getWeather();
            }
        );


        recentCities.appendChild(li);
    });
}


// ========================================
// CURRENT LOCATION
// ========================================

function getCurrentLocation() {

    if (!navigator.geolocation) {

        errorMessage.textContent =
            "Geolocation is not supported by your browser.";

        return;
    }


    loadingMessage.textContent =
        "Detecting your location...";

    errorMessage.textContent = "";


    navigator.geolocation.getCurrentPosition(

        async position => {

            const latitude =
                position.coords.latitude;

            const longitude =
                position.coords.longitude;


            try {

                loadingMessage.textContent =
                    "Getting your weather...";


                const response =
                    await fetch(
                        `https://wttr.in/${latitude},${longitude}?format=j1`
                    );


                if (!response.ok) {
                    throw new Error(
                        "Location weather failed."
                    );
                }


                const data =
                    await response.json();


                const area =
                    data.nearest_area?.[0];


                const city =
                    area?.areaName?.[0]?.value ||
                    "Current Location";


                cityInput.value =
                    city;


                currentWeatherData =
                    data;


                updateWeatherFromData(
                    data,
                    city
                );


                saveRecentCity(city);


                loadingMessage.textContent = "";

            }

            catch (error) {

                console.error(error);

                loadingMessage.textContent = "";

                errorMessage.textContent =
                    "Unable to get weather for your location.";
            }
        },

        () => {

            loadingMessage.textContent = "";

            errorMessage.textContent =
                "Location access was denied. Please allow location access and try again.";
        }
    );
}


// ========================================
// UPDATE WEATHER FROM DATA
// ========================================

function updateWeatherFromData(
    data,
    city
) {

    const currentWeather =
        data.current_condition[0];


    cityName.textContent =
        city;


    currentTemperatureC =
        Number(currentWeather.temp_C);


    currentFeelsLikeC =
        Number(currentWeather.FeelsLikeC);


    updateTemperatureDisplay();

    updateFeelsLikeDisplay();


    description.textContent =
        currentWeather.weatherDesc[0].value;


    humidity.textContent =
        `${currentWeather.humidity}%`;


    wind.textContent =
        `${currentWeather.windspeedKmph} km/h`;


    visibility.textContent =
        `${currentWeather.visibility} km`;


    windDirection.textContent =
        currentWeather.winddir16Point;


    uvIndex.textContent =
        currentWeather.uvIndex;


    weatherSymbol.textContent =
        getWeatherIcon(
            currentWeather.weatherCode
        );


    updateBackground(
        currentWeather.weatherCode
    );


    updateSunData(data);

    updateDateTime();

    generateHourlyForecast(data);

    generateDailyForecast(data);
}


// ========================================
// CLEAR FORECASTS
// ========================================

function clearForecasts() {

    hourlyForecast.innerHTML = "";

    dailyForecast.innerHTML = "";
}


// ========================================
// ENTER KEY
// ========================================

cityInput.addEventListener(
    "keydown",
    function (event) {

        if (event.key === "Enter") {

            getWeather();
        }
    }
);


// ========================================
// INITIALIZE
// ========================================

updateDateTime();

setInterval(
    updateDateTime,
    60000
);

displayRecentCities();