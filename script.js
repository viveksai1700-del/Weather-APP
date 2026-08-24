// =====================================================
// WEATHER APP - UPGRADED SCRIPT
// =====================================================

// -----------------------------------------------------
// DOM ELEMENTS
// -----------------------------------------------------

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

const dateTime = document.getElementById("dateTime");

const loadingMessage =
    document.getElementById("loadingMessage");

const errorMessage =
    document.getElementById("errorMessage");

const recentCities =
    document.getElementById("recentCities");

const hourlyForecast =
    document.getElementById("hourlyForecast");

const dailyForecast =
    document.getElementById("dailyForecast");

const celsiusBtn =
    document.getElementById("celsiusBtn");

const fahrenheitBtn =
    document.getElementById("fahrenheitBtn");


// -----------------------------------------------------
// GLOBAL STATE
// -----------------------------------------------------

let currentTemperatureC = null;
let currentFeelsLikeC = null;

let currentUnit = "C";

let currentWeatherData = null;

let particleContainer = null;

let currentWeatherType = "default";

let lightningTimeout = null;


// =====================================================
// WEATHER ICON
// =====================================================

function getWeatherIcon(code) {

    const weatherCode = Number(code);

    // Clear
    if (weatherCode === 113) {
        return "☀️";
    }

    // Cloudy
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

    // Storm
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


// =====================================================
// GET WEATHER
// =====================================================

async function getWeather(cityOverride = null) {

    const city =
        cityOverride ||
        cityInput.value.trim();

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

            throw new Error(
                "Weather request failed."
            );
        }

        let data = await response.json();

        // Handle newer wttr.in responses
        if (
            data.data &&
            data.data.current_condition
        ) {
            data = data.data;
        }

        if (
            !data.current_condition ||
            !data.current_condition[0]
        ) {

            throw new Error(
                "Invalid weather response."
            );
        }

        currentWeatherData = data;

        updateCurrentWeather(
            data,
            city
        );

        updateForecasts(data);

        saveRecentCity(city);

        loadingMessage.textContent = "";

    } catch (error) {

        console.error(
            "Weather Error:",
            error
        );

        loadingMessage.textContent = "";

        errorMessage.textContent =
            "Unable to find weather information. Please check the city name.";
    }
}


// =====================================================
// UPDATE CURRENT WEATHER
// =====================================================

function updateCurrentWeather(data, city) {

    const current =
        data.current_condition[0];

    // City
    cityName.textContent = city;

    cityInput.value = city;

    // Temperature
    currentTemperatureC =
        Number(current.temp_C);

    currentFeelsLikeC =
        Number(current.FeelsLikeC);

    updateTemperatureDisplay();

    updateFeelsLikeDisplay();

    // Description
    description.textContent =
        current.weatherDesc?.[0]?.value ||
        "Weather unavailable";

    // Humidity
    humidity.textContent =
        `${current.humidity}%`;

    // Wind
    wind.textContent =
        `${current.windspeedKmph} km/h`;

    // Visibility
    if (visibility) {

        visibility.textContent =
            `${current.visibility} km`;
    }

    // Wind Direction
    if (windDirection) {

        windDirection.textContent =
            current.winddir16Point ||
            "--";
    }

    // UV Index
    if (uvIndex) {

        uvIndex.textContent =
            current.uvIndex ||
            "--";
    }

    // Weather Icon
    weatherSymbol.textContent =
        getWeatherIcon(
            current.weatherCode
        );

    // Background
    updateBackground(
        current.weatherCode
    );

    // Atmosphere
    updateAtmosphere(
        current.weatherCode
    );

    // Date
    updateDateTime();

    // Sunrise / Sunset
    updateSunriseSunset(data);
}


// =====================================================
// UPDATE FORECASTS
// =====================================================

function updateForecasts(data) {

    updateHourlyForecast(data);

    updateDailyForecast(data);
}


// =====================================================
// HOURLY FORECAST
// =====================================================

function updateHourlyForecast(data) {

    if (!hourlyForecast) {
        return;
    }

    hourlyForecast.innerHTML = "";

    if (
        !data.weather ||
        !data.weather[0] ||
        !data.weather[0].hourly
    ) {
        return;
    }

    const hourly =
        data.weather[0].hourly;

    hourly.forEach((hour, index) => {

        const card =
            document.createElement("div");

        card.className =
            "hourly-card";

        const hourTime =
            formatHour(hour.time);

        const icon =
            getWeatherIcon(
                hour.weatherCode
            );

        const temperatureValue =
            getTemperature(
                hour.tempC
            );

        const rainChance =
            hour.chanceofrain ||
            "0";

        card.innerHTML = `
            <div class="hour">
                ${
                    index === 0
                        ? "Now"
                        : hourTime
                }
            </div>

            <div class="hour-icon">
                ${icon}
            </div>

            <div class="hour-temp">
                ${temperatureValue}
            </div>

            <div class="hour-rain">
                ${rainChance}% rain
            </div>
        `;

        hourlyForecast.appendChild(card);
    });
}


// =====================================================
// FORMAT HOUR
// =====================================================

function formatHour(time) {

    const numericTime =
        Number(time);

    const hour =
        Math.floor(
            numericTime / 100
        );

    if (hour === 0) {
        return "12 AM";
    }

    if (hour < 12) {
        return `${hour} AM`;
    }

    if (hour === 12) {
        return "12 PM";
    }

    return `${hour - 12} PM`;
}


// =====================================================
// DAILY FORECAST
// =====================================================

function updateDailyForecast(data) {

    if (!dailyForecast) {
        return;
    }

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

            const high =
                getTemperature(
                    day.maxtempC
                );

            const low =
                getTemperature(
                    day.mintempC
                );

            const rainChance =
                getDailyRainChance(day);

            card.innerHTML = `
                <div class="day">
                    ${dayName}
                </div>

                <div class="day-icon">
                    ${icon}
                </div>

                <div class="temps">
                    <span>
                        ${high}
                    </span>

                    <span class="low">
                        ${low}
                    </span>
                </div>

                <div class="day-rain">
                    ${rainChance}% rain
                </div>
            `;

            dailyForecast.appendChild(card);
        });
}


// =====================================================
// DAILY ICON
// =====================================================

function getDailyIcon(day) {

    if (
        !day.hourly ||
        day.hourly.length === 0
    ) {
        return "☁️";
    }

    // Find the most representative
    // weather condition from the day.

    const middleIndex =
        Math.floor(
            day.hourly.length / 2
        );

    const middleHour =
        day.hourly[middleIndex];

    return getWeatherIcon(
        middleHour.weatherCode
    );
}


// =====================================================
// DAILY RAIN CHANCE
// =====================================================

function getDailyRainChance(day) {

    if (
        !day.hourly ||
        day.hourly.length === 0
    ) {
        return 0;
    }

    const chances =
        day.hourly.map(hour =>
            Number(
                hour.chanceofrain || 0
            )
        );

    return Math.max(...chances);
}


// =====================================================
// TEMPERATURE FORMAT
// =====================================================

function getTemperature(celsius) {

    if (currentUnit === "C") {

        return `${Number(celsius)}°`;
    }

    return `${convertToFahrenheit(celsius)}°`;
}


// =====================================================
// CELSIUS → FAHRENHEIT
// =====================================================

function convertToFahrenheit(celsius) {

    return (
        Number(celsius) * 9 / 5 + 32
    ).toFixed(1);
}


// =====================================================
// TEMPERATURE DISPLAY
// =====================================================

function updateTemperatureDisplay() {

    if (
        currentTemperatureC === null
    ) {
        return;
    }

    if (currentUnit === "C") {

        temperature.textContent =
            `${currentTemperatureC}°C`;

    } else {

        temperature.textContent =
            `${convertToFahrenheit(
                currentTemperatureC
            )}°F`;
    }
}


// =====================================================
// FEELS LIKE DISPLAY
// =====================================================

function updateFeelsLikeDisplay() {

    if (
        currentFeelsLikeC === null
    ) {
        return;
    }

    if (currentUnit === "C") {

        feelsLike.textContent =
            `${currentFeelsLikeC}°C`;

    } else {

        feelsLike.textContent =
            `${convertToFahrenheit(
                currentFeelsLikeC
            )}°F`;
    }
}


// =====================================================
// CHANGE UNIT
// =====================================================

function setUnit(unit) {

    currentUnit = unit;

    if (celsiusBtn) {

        celsiusBtn.classList.toggle(
            "active",
            unit === "C"
        );
    }

    if (fahrenheitBtn) {

        fahrenheitBtn.classList.toggle(
            "active",
            unit === "F"
        );
    }

    updateTemperatureDisplay();

    updateFeelsLikeDisplay();

    if (currentWeatherData) {

        updateForecasts(
            currentWeatherData
        );
    }
}


// =====================================================
// SUNRISE / SUNSET
// =====================================================

function updateSunriseSunset(data) {

    if (
        !data.weather ||
        !data.weather[0] ||
        !data.weather[0].astronomy
    ) {
        return;
    }

    const astronomy =
        data.weather[0]
            .astronomy[0];

    if (sunrise) {

        sunrise.textContent =
            astronomy.sunrise ||
            "--:--";
    }

    if (sunset) {

        sunset.textContent =
            astronomy.sunset ||
            "--:--";
    }
}


// =====================================================
// DATE / TIME
// =====================================================

function updateDateTime() {

    const now =
        new Date();

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


// =====================================================
// BACKGROUND
// =====================================================

function updateBackground(code) {

    const weatherCode =
        Number(code);

    document.body.classList.remove(
        "clear",
        "cloudy",
        "rain",
        "snow",
        "storm"
    );

    if (weatherCode === 113) {

        document.body.classList.add(
            "clear"
        );

    } else if (
        [116, 119, 122]
            .includes(weatherCode)
    ) {

        document.body.classList.add(
            "cloudy"
        );

    } else if (
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

        document.body.classList.add(
            "rain"
        );

    } else if (
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

        document.body.classList.add(
            "snow"
        );

    } else if (
        [
            200,
            386,
            389,
            392,
            395
        ].includes(weatherCode)
    ) {

        document.body.classList.add(
            "storm"
        );

    } else {

        document.body.classList.add(
            "cloudy"
        );
    }
}


// =====================================================
// PARTICLE CONTAINER
// =====================================================

function createParticleContainer() {

    if (particleContainer) {
        particleContainer.remove();
    }

    particleContainer =
        document.createElement("div");

    particleContainer.id =
        "weatherParticles";

    particleContainer.style.position =
        "fixed";

    particleContainer.style.inset =
        "0";

    particleContainer.style.width =
        "100vw";

    particleContainer.style.height =
        "100vh";

    particleContainer.style.pointerEvents =
        "none";

    particleContainer.style.overflow =
        "hidden";

    particleContainer.style.zIndex =
        "1";

    document.body.appendChild(
        particleContainer
    );

    const app =
        document.querySelector(
            ".weather-app"
        );

    if (app) {

        app.style.position =
            "relative";

        app.style.zIndex =
            "2";
    }
}


// =====================================================
// PARTICLE STYLES
// =====================================================

function addParticleStyles() {

    if (
        document.getElementById(
            "weatherParticleStyles"
        )
    ) {
        return;
    }

    const style =
        document.createElement("style");

    style.id =
        "weatherParticleStyles";

    style.textContent = `

        .weather-particle {
            position: absolute;
            pointer-events: none;
        }

        .rain-particle {
            width: 2px;
            height: 42px;

            border-radius: 999px;

            background:
                linear-gradient(
                    to bottom,
                    transparent,
                    rgba(147, 197, 253, 0.8)
                );

            animation:
                rainFall linear infinite;
        }

        @keyframes rainFall {

            from {
                transform:
                    translate(
                        -20px,
                        -100px
                    )
                    rotate(15deg);
            }

            to {
                transform:
                    translate(
                        70px,
                        110vh
                    )
                    rotate(15deg);
            }
        }

        .snow-particle {
            border-radius: 50%;

            background:
                rgba(255, 255, 255, 0.9);

            box-shadow:
                0 0 8px
                rgba(255, 255, 255, 0.55);

            animation:
                snowFall linear infinite;
        }

        @keyframes snowFall {

            0% {
                transform:
                    translate(
                        0,
                        -50px
                    );
            }

            25% {
                transform:
                    translate(
                        30px,
                        25vh
                    );
            }

            50% {
                transform:
                    translate(
                        -25px,
                        50vh
                    );
            }

            75% {
                transform:
                    translate(
                        25px,
                        75vh
                    );
            }

            100% {
                transform:
                    translate(
                        -15px,
                        110vh
                    );
            }
        }

        .sun-particle {
            width: 5px;
            height: 5px;

            border-radius: 50%;

            background:
                rgba(253, 224, 71, 0.75);

            box-shadow:
                0 0 12px
                rgba(251, 191, 36, 0.65);

            animation:
                sunFloat ease-in-out infinite alternate;
        }

        @keyframes sunFloat {

            from {
                transform:
                    translate(
                        -10px,
                        10px
                    )
                    scale(0.8);
            }

            to {
                transform:
                    translate(
                        25px,
                        -30px
                    )
                    scale(1.2);
            }
        }

        .cloud-particle {
            width: 200px;
            height: 60px;

            border-radius: 50%;

            background:
                rgba(226, 232, 240, 0.055);

            filter:
                blur(12px);

            animation:
                cloudMove linear infinite;
        }

        @keyframes cloudMove {

            from {
                transform:
                    translateX(-250px);
            }

            to {
                transform:
                    translateX(120vw);
            }
        }

        .lightning-flash {
            position: fixed;

            inset: 0;

            width: 100vw;
            height: 100vh;

            pointer-events: none;

            background:
                rgba(255, 255, 255, 0.18);

            opacity: 0;

            z-index: 1;
        }

        @keyframes lightningFlash {

            0% {
                opacity: 0;
            }

            10% {
                opacity: 0.8;
            }

            15% {
                opacity: 0.05;
            }

            25% {
                opacity: 0.45;
            }

            35% {
                opacity: 0;
            }

            100% {
                opacity: 0;
            }
        }

        .hour-rain,
        .day-rain {
            margin-top: 6px;

            font-size: 10px;

            color:
                rgba(147, 197, 253, 0.75);
        }

    `;

    document.head.appendChild(style);
}


// =====================================================
// CLEAR PARTICLES
// =====================================================

function clearParticles() {

    if (particleContainer) {

        particleContainer.innerHTML =
            "";
    }

    if (lightningTimeout) {

        clearTimeout(
            lightningTimeout
        );

        lightningTimeout =
            null;
    }

    const oldFlash =
        document.getElementById(
            "stormLightning"
        );

    if (oldFlash) {
        oldFlash.remove();
    }
}


// =====================================================
// CREATE RAIN
// =====================================================

function createRainParticles() {

    clearParticles();

    const count =
        window.innerWidth < 600
            ? 75
            : 140;

    for (
        let i = 0;
        i < count;
        i++
    ) {

        const particle =
            document.createElement(
                "div"
            );

        particle.className =
            "weather-particle rain-particle";

        particle.style.left =
            `${Math.random() * 110}%`;

        particle.style.top =
            `${-150 - Math.random() * 500}px`;

        particle.style.height =
            `${25 + Math.random() * 35}px`;

        particle.style.opacity =
            `${0.25 + Math.random() * 0.55}`;

        particle.style.animationDuration =
            `${0.55 + Math.random() * 0.65}s`;

        particle.style.animationDelay =
            `${Math.random() * 1.5}s`;

        particleContainer.appendChild(
            particle
        );
    }
}


// =====================================================
// CREATE SNOW
// =====================================================

function createSnowParticles() {

    clearParticles();

    const count =
        window.innerWidth < 600
            ? 45
            : 85;

    for (
        let i = 0;
        i < count;
        i++
    ) {

        const particle =
            document.createElement(
                "div"
            );

        particle.className =
            "weather-particle snow-particle";

        const size =
            3 + Math.random() * 6;

        particle.style.width =
            `${size}px`;

        particle.style.height =
            `${size}px`;

        particle.style.left =
            `${Math.random() * 100}%`;

        particle.style.top =
            `${-50 - Math.random() * 300}px`;

        particle.style.opacity =
            `${0.25 + Math.random() * 0.65}`;

        particle.style.animationDuration =
            `${7 + Math.random() * 10}s`;

        particle.style.animationDelay =
            `${Math.random() * 7}s`;

        particleContainer.appendChild(
            particle
        );
    }
}


// =====================================================
// CREATE SUN
// =====================================================

function createSunParticles() {

    clearParticles();

    const count =
        window.innerWidth < 600
            ? 18
            : 30;

    for (
        let i = 0;
        i < count;
        i++
    ) {

        const particle =
            document.createElement(
                "div"
            );

        particle.className =
            "weather-particle sun-particle";

        particle.style.left =
            `${Math.random() * 100}%`;

        particle.style.top =
            `${Math.random() * 100}%`;

        particle.style.opacity =
            `${0.15 + Math.random() * 0.45}`;

        particle.style.animationDuration =
            `${5 + Math.random() * 7}s`;

        particle.style.animationDelay =
            `${Math.random() * 5}s`;

        particleContainer.appendChild(
            particle
        );
    }
}


// =====================================================
// CREATE CLOUDS
// =====================================================

function createCloudParticles() {

    clearParticles();

    const count =
        window.innerWidth < 600
            ? 3
            : 6;

    for (
        let i = 0;
        i < count;
        i++
    ) {

        const cloud =
            document.createElement(
                "div"
            );

        cloud.className =
            "weather-particle cloud-particle";

        cloud.style.left =
            `${-20 - Math.random() * 30}%`;

        cloud.style.top =
            `${8 + Math.random() * 45}%`;

        cloud.style.opacity =
            `${0.15 + Math.random() * 0.25}`;

        cloud.style.transform =
            `scale(
                ${0.7 + Math.random() * 0.7}
            )`;

        cloud.style.animationDuration =
            `${18 + Math.random() * 15}s`;

        cloud.style.animationDelay =
            `${Math.random() * 10}s`;

        particleContainer.appendChild(
            cloud
        );
    }
}


// =====================================================
// LIGHTNING
// =====================================================

function createLightning() {

    const flash =
        document.createElement(
            "div"
        );

    flash.id =
        "stormLightning";

    flash.className =
        "lightning-flash";

    document.body.appendChild(
        flash
    );

    scheduleLightning();
}


function scheduleLightning() {

    if (
        currentWeatherType !==
        "storm"
    ) {
        return;
    }

    const delay =
        4000 +
        Math.random() * 8000;

    lightningTimeout =
        setTimeout(() => {

            const flash =
                document.getElementById(
                    "stormLightning"
                );

            if (!flash) {
                return;
            }

            flash.style.animation =
                "none";

            void flash.offsetWidth;

            flash.style.animation =
                "lightningFlash 0.7s ease";

            scheduleLightning();

        }, delay);
}


// =====================================================
// UPDATE ATMOSPHERE
// =====================================================

function updateAtmosphere(code) {

    const weatherCode =
        Number(code);

    createParticleContainer();

    addParticleStyles();

    if (weatherCode === 113) {

        currentWeatherType =
            "clear";

        createSunParticles();

    } else if (
        [116, 119, 122]
            .includes(weatherCode)
    ) {

        currentWeatherType =
            "cloudy";

        createCloudParticles();

    } else if (
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

        currentWeatherType =
            "rain";

        createRainParticles();

    } else if (
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

        currentWeatherType =
            "snow";

        createSnowParticles();

    } else if (
        [
            200,
            386,
            389,
            392,
            395
        ].includes(weatherCode)
    ) {

        currentWeatherType =
            "storm";

        createRainParticles();

        createLightning();

    } else {

        currentWeatherType =
            "cloudy";

        createCloudParticles();
    }
}


// =====================================================
// RECENT SEARCHES
// =====================================================

function saveRecentCity(city) {

    let cities =
        JSON.parse(
            localStorage.getItem(
                "recentCities"
            )
        ) || [];

    cities =
        cities.filter(
            existingCity =>
                existingCity.toLowerCase() !==
                city.toLowerCase()
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

    if (!recentCities) {
        return;
    }

    const cities =
        JSON.parse(
            localStorage.getItem(
                "recentCities"
            )
        ) || [];

    recentCities.innerHTML = "";

    cities.forEach(city => {

        const li =
            document.createElement(
                "li"
            );

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

        recentCities.appendChild(
            li
        );
    });
}


// =====================================================
// ENTER KEY
// =====================================================

cityInput.addEventListener(
    "keydown",
    event => {

        if (event.key === "Enter") {
            getWeather();
        }
    }
);


// =====================================================
// INITIALIZATION
// =====================================================

addParticleStyles();

createParticleContainer();

updateDateTime();

displayRecentCities();


// Update clock every minute

setInterval(
    updateDateTime,
    60000
);


// =====================================================
// RESIZE HANDLER
// =====================================================

let resizeTimer;

window.addEventListener(
    "resize",
    () => {

        clearTimeout(
            resizeTimer
        );

        resizeTimer =
            setTimeout(() => {

                if (
                    currentWeatherData &&
                    currentWeatherData
                        .current_condition
                ) {

                    updateAtmosphere(
                        currentWeatherData
                            .current_condition[0]
                            .weatherCode
                    );
                }

            }, 500);
    }
);