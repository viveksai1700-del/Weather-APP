// =====================================================
// WEATHER APP - COMPLETE SCRIPT
// =====================================================

// -----------------------------
// DOM ELEMENTS
// -----------------------------

const cityInput = document.getElementById("cityInput");
const cityName = document.getElementById("cityName");
const temperature = document.getElementById("temperature");
const description = document.getElementById("description");

const humidity = document.getElementById("humidity");
const wind = document.getElementById("wind");
const feelsLike = document.getElementById("feelsLike");

const weatherSymbol = document.getElementById("weatherSymbol");

const errorMessage = document.getElementById("errorMessage");
const loadingMessage = document.getElementById("loadingMessage");
const dateTime = document.getElementById("dateTime");

const recentCities = document.getElementById("recentCities");

const hourlyForecast = document.getElementById("hourlyForecast");
const dailyForecast = document.getElementById("dailyForecast");

const celsiusBtn = document.getElementById("celsiusBtn");
const fahrenheitBtn = document.getElementById("fahrenheitBtn");


// Optional elements.
// These are used only if they exist in your HTML.

const visibility = document.getElementById("visibility");
const windDirection = document.getElementById("windDirection");
const uvIndex = document.getElementById("uvIndex");

const sunrise = document.getElementById("sunrise");
const sunset = document.getElementById("sunset");


// =====================================================
// GLOBAL VARIABLES
// =====================================================

let currentTemperatureC = null;
let currentFeelsLikeC = null;

let currentUnit = "C";

let currentWeatherData = null;

let currentWeatherType = "default";

let particleContainer = null;

let lightningTimeout = null;


// =====================================================
// PARTICLE CSS
// =====================================================

function addParticleStyles() {

    if (document.getElementById("weatherParticleStyles")) {
        return;
    }

    const style = document.createElement("style");

    style.id = "weatherParticleStyles";

    style.textContent = `

        #weatherParticles {
            position: fixed;
            inset: 0;

            width: 100vw;
            height: 100vh;

            overflow: hidden;

            pointer-events: none;

            z-index: 1;
        }

        .weather-particle {
            position: absolute;

            pointer-events: none;

            will-change:
                transform,
                opacity;
        }


        /* -----------------------------
           RAIN
        ----------------------------- */

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

            box-shadow:
                0 0 5px
                rgba(96, 165, 250, 0.25);
        }


        @keyframes rainFall {

            0% {
                transform:
                    translate3d(
                        -20px,
                        -100px,
                        0
                    )
                    rotate(15deg);
            }

            100% {
                transform:
                    translate3d(
                        70px,
                        110vh,
                        0
                    )
                    rotate(15deg);
            }
        }


        /* -----------------------------
           SNOW
        ----------------------------- */

        .snow-particle {
            border-radius: 50%;

            background:
                rgba(255, 255, 255, 0.9);

            box-shadow:
                0 0 8px
                rgba(255, 255, 255, 0.55);
        }


        @keyframes snowFall {

            0% {
                transform:
                    translate3d(
                        0,
                        -50px,
                        0
                    );
            }

            25% {
                transform:
                    translate3d(
                        30px,
                        25vh,
                        0
                    );
            }

            50% {
                transform:
                    translate3d(
                        -25px,
                        50vh,
                        0
                    );
            }

            75% {
                transform:
                    translate3d(
                        25px,
                        75vh,
                        0
                    );
            }

            100% {
                transform:
                    translate3d(
                        -15px,
                        110vh,
                        0
                    );
            }
        }


        /* -----------------------------
           SUN
        ----------------------------- */

        .sun-particle {
            width: 5px;
            height: 5px;

            border-radius: 50%;

            background:
                rgba(253, 224, 71, 0.75);

            box-shadow:
                0 0 12px
                rgba(251, 191, 36, 0.65);
        }


        @keyframes sunFloat {

            0% {
                transform:
                    translate3d(
                        -10px,
                        10px,
                        0
                    )
                    scale(0.8);
            }

            100% {
                transform:
                    translate3d(
                        25px,
                        -30px,
                        0
                    )
                    scale(1.2);
            }
        }


        /* -----------------------------
           CLOUDS
        ----------------------------- */

        .cloud-particle {
            width: 200px;
            height: 60px;

            border-radius: 50%;

            background:
                rgba(226, 232, 240, 0.055);

            filter:
                blur(12px);
        }


        @keyframes cloudMove {

            0% {
                transform:
                    translateX(-250px);
            }

            100% {
                transform:
                    translateX(120vw);
            }
        }


        /* -----------------------------
           LIGHTNING
        ----------------------------- */

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

    `;

    document.head.appendChild(style);
}


// =====================================================
// CREATE PARTICLE CONTAINER
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


    // Keep the dashboard above the particles.

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
// CLEAR PARTICLES
// =====================================================

function clearParticles() {

    if (particleContainer) {
        particleContainer.innerHTML = "";
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
// RAIN PARTICLES
// =====================================================

function createRainParticles() {

    clearParticles();

    const count =
        window.innerWidth < 600
            ? 80
            : 150;


    for (let i = 0; i < count; i++) {

        const particle =
            document.createElement("div");

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


        const duration =
            0.55 + Math.random() * 0.65;


        const delay =
            Math.random() * 1.5;


        particle.style.animation =
            `rainFall ${duration}s linear ${delay}s infinite`;


        particleContainer.appendChild(
            particle
        );
    }
}


// =====================================================
// SNOW PARTICLES
// =====================================================

function createSnowParticles() {

    clearParticles();

    const count =
        window.innerWidth < 600
            ? 45
            : 85;


    for (let i = 0; i < count; i++) {

        const particle =
            document.createElement("div");

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


        const duration =
            7 + Math.random() * 10;


        const delay =
            Math.random() * 7;


        particle.style.animation =
            `snowFall ${duration}s linear ${delay}s infinite`;


        particleContainer.appendChild(
            particle
        );
    }
}


// =====================================================
// SUN PARTICLES
// =====================================================

function createSunParticles() {

    clearParticles();

    const count =
        window.innerWidth < 600
            ? 18
            : 32;


    for (let i = 0; i < count; i++) {

        const particle =
            document.createElement("div");

        particle.className =
            "weather-particle sun-particle";


        particle.style.left =
            `${Math.random() * 100}%`;


        particle.style.top =
            `${Math.random() * 100}%`;


        particle.style.opacity =
            `${0.15 + Math.random() * 0.45}`;


        const duration =
            5 + Math.random() * 7;


        const delay =
            Math.random() * 5;


        particle.style.animation =
            `sunFloat ${duration}s ease-in-out ${delay}s infinite alternate`;


        particleContainer.appendChild(
            particle
        );
    }
}


// =====================================================
// CLOUD PARTICLES
// =====================================================

function createCloudParticles() {

    clearParticles();

    const count =
        window.innerWidth < 600
            ? 3
            : 6;


    for (let i = 0; i < count; i++) {

        const cloud =
            document.createElement("div");

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


        const duration =
            18 + Math.random() * 15;


        const delay =
            Math.random() * 10;


        cloud.style.animation =
            `cloudMove ${duration}s linear ${delay}s infinite`;


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
        document.createElement("div");

    flash.id =
        "stormLightning";

    flash.className =
        "lightning-flash";


    document.body.appendChild(
        flash
    );


    scheduleLightning();
}


// =====================================================
// LIGHTNING SCHEDULER
// =====================================================

function scheduleLightning() {

    if (
        currentWeatherType !== "storm"
    ) {
        return;
    }


    const delay =
        4000 +
        Math.random() * 8000;


    lightningTimeout =
        setTimeout(
            () => {

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

            },
            delay
        );
}


// =====================================================
// UPDATE ATMOSPHERE
// =====================================================

function updateAtmosphere(code) {

    const weatherCode =
        Number(code);


    createParticleContainer();


    if (weatherCode === 113) {

        currentWeatherType =
            "clear";

        createSunParticles();

    }

    else if (
        [116, 119, 122]
            .includes(weatherCode)
    ) {

        currentWeatherType =
            "cloudy";

        createCloudParticles();

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

        currentWeatherType =
            "rain";

        createRainParticles();

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

        currentWeatherType =
            "snow";

        createSnowParticles();

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

        currentWeatherType =
            "storm";

        createRainParticles();

        createLightning();

    }

    else {

        currentWeatherType =
            "cloudy";

        createCloudParticles();
    }
}


// =====================================================
// GET WEATHER
// =====================================================

async function getWeather(
    cityOverride = null
) {

    const city =
        cityOverride ||
        cityInput.value.trim();


    if (city === "") {

        errorMessage.textContent =
            "Please enter a city name.";

        return;
    }


    errorMessage.textContent =
        "";

    loadingMessage.textContent =
        "Loading weather data...";


    try {

        const response =
            await fetch(
                `https://wttr.in/${encodeURIComponent(city)}?format=j1`
            );


        if (!response.ok) {

            throw new Error(
                "Unable to fetch weather data."
            );
        }


        const data =
            await response.json();


        if (
            !data.current_condition ||
            !data.current_condition[0]
        ) {

            throw new Error(
                "Invalid weather data."
            );
        }


        currentWeatherData =
            data;


        updateWeather(
            data,
            city
        );


        saveRecentCity(
            city
        );


        loadingMessage.textContent =
            "";

    }

    catch (error) {

        console.error(
            "Weather error:",
            error
        );


        loadingMessage.textContent =
            "";


        errorMessage.textContent =
            "Unable to find weather information. Please check the city name.";
    }
}


// =====================================================
// UPDATE WEATHER
// =====================================================

function updateWeather(
    data,
    city
) {

    const currentWeather =
        data.current_condition[0];


    cityName.textContent =
        city;


    cityInput.value =
        city;


    currentTemperatureC =
        Number(
            currentWeather.temp_C
        );


    currentFeelsLikeC =
        Number(
            currentWeather.FeelsLikeC
        );


    updateTemperatureDisplay();

    updateFeelsLikeDisplay();


    description.textContent =
        currentWeather
            .weatherDesc[0]
            .value;


    humidity.textContent =
        `${currentWeather.humidity}%`;


    wind.textContent =
        `${currentWeather.windspeedKmph} km/h`;


    if (visibility) {

        visibility.textContent =
            `${currentWeather.visibility} km`;
    }


    if (windDirection) {

        windDirection.textContent =
            currentWeather.winddir16Point;
    }


    if (uvIndex) {

        uvIndex.textContent =
            currentWeather.uvIndex;
    }


    const weatherCode =
        currentWeather.weatherCode;


    weatherSymbol.textContent =
        getWeatherIcon(
            weatherCode
        );


    updateBackground(
        weatherCode
    );


    updateAtmosphere(
        weatherCode
    );


    updateSunData(
        data
    );


    generateHourlyForecast(
        data
    );


    generateDailyForecast(
        data
    );


    updateDateTime();
}


// =====================================================
// WEATHER ICON
// =====================================================

function getWeatherIcon(code) {

    const weatherCode =
        Number(code);


    if (weatherCode === 113) {
        return "☀️";
    }


    if (
        [116, 119, 122]
            .includes(weatherCode)
    ) {
        return "☁️";
    }


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
// UPDATE BACKGROUND
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

    }

    else if (
        [116, 119, 122]
            .includes(weatherCode)
    ) {

        document.body.classList.add(
            "cloudy"
        );

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

        document.body.classList.add(
            "rain"
        );

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

        document.body.classList.add(
            "snow"
        );

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

        document.body.classList.add(
            "storm"
        );

    }

    else {

        document.body.classList.add(
            "cloudy"
        );
    }
}


// =====================================================
// DATE AND TIME
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
// SUNRISE / SUNSET
// =====================================================

function updateSunData(data) {

    if (
        !sunrise ||
        !sunset
    ) {
        return;
    }


    if (
        !data.weather ||
        !data.weather[0] ||
        !data.weather[0].astronomy
    ) {

        sunrise.textContent =
            "--:--";

        sunset.textContent =
            "--:--";

        return;
    }


    const astronomy =
        data.weather[0]
            .astronomy[0];


    sunrise.textContent =
        astronomy.sunrise ||
        "--:--";


    sunset.textContent =
        astronomy.sunset ||
        "--:--";
}


// =====================================================
// HOURLY FORECAST
// =====================================================

function generateHourlyForecast(
    data
) {

    if (!hourlyForecast) {
        return;
    }


    hourlyForecast.innerHTML =
        "";


    if (
        !data.weather ||
        !data.weather[0] ||
        !data.weather[0].hourly
    ) {
        return;
    }


    data.weather[0]
        .hourly
        .forEach(
            (hour, index) => {

                const card =
                    document.createElement(
                        "div"
                    );


                card.className =
                    "hourly-card";


                const time =
                    formatHour(
                        hour.time
                    );


                const icon =
                    getWeatherIcon(
                        hour.weatherCode
                    );


                const temp =
                    currentUnit === "C"
                        ? `${hour.tempC}°`
                        : `${convertToFahrenheit(
                            hour.tempC
                        )}°`;


                card.innerHTML = `

                    <div class="hour">
                        ${
                            index === 0
                                ? "Now"
                                : time
                        }
                    </div>

                    <div class="hour-icon">
                        ${icon}
                    </div>

                    <div class="hour-temp">
                        ${temp}
                    </div>

                `;


                hourlyForecast.appendChild(
                    card
                );
            }
        );
}


// =====================================================
// FORMAT HOUR
// =====================================================

function formatHour(time) {

    const numericTime =
        Number(time);


    if (numericTime === 0) {
        return "12 AM";
    }


    const hour =
        Math.floor(
            numericTime / 100
        );


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

function generateDailyForecast(
    data
) {

    if (!dailyForecast) {
        return;
    }


    dailyForecast.innerHTML =
        "";


    if (!data.weather) {
        return;
    }


    data.weather
        .slice(0, 5)
        .forEach(
            (day, index) => {

                const card =
                    document.createElement(
                        "div"
                    );


                card.className =
                    "daily-card";


                const date =
                    new Date(
                        day.date
                    );


                const dayName =
                    index === 0
                        ? "Today"
                        : date.toLocaleDateString(
                            "en-US",
                            {
                                weekday:
                                    "short"
                            }
                        );


                const icon =
                    getDailyIcon(
                        day
                    );


                const maxTemp =
                    currentUnit === "C"
                        ? `${day.maxtempC}°`
                        : `${convertToFahrenheit(
                            day.maxtempC
                        )}°`;


                const minTemp =
                    currentUnit === "C"
                        ? `${day.mintempC}°`
                        : `${convertToFahrenheit(
                            day.mintempC
                        )}°`;


                card.innerHTML = `

                    <div class="day">
                        ${dayName}
                    </div>

                    <div class="day-icon">
                        ${icon}
                    </div>

                    <div class="temps">

                        <span>
                            ${maxTemp}
                        </span>

                        <span class="low">
                            ${minTemp}
                        </span>

                    </div>

                `;


                dailyForecast.appendChild(
                    card
                );
            }
        );
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


    const middleHour =
        day.hourly[
            Math.floor(
                day.hourly.length / 2
            )
        ];


    return getWeatherIcon(
        middleHour.weatherCode
    );
}


// =====================================================
// CELSIUS → FAHRENHEIT
// =====================================================

function convertToFahrenheit(
    celsius
) {

    return (
        Number(celsius) * 9 / 5 + 32
    ).toFixed(1);
}


// =====================================================
// CHANGE UNIT
// =====================================================

function setUnit(unit) {

    currentUnit =
        unit;


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

        generateHourlyForecast(
            currentWeatherData
        );

        generateDailyForecast(
            currentWeatherData
        );
    }
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

    }

    else {

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

    }

    else {

        feelsLike.textContent =
            `${convertToFahrenheit(
                currentFeelsLikeC
            )}°F`;
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


// =====================================================
// DISPLAY RECENT SEARCHES
// =====================================================

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


    recentCities.innerHTML =
        "";


    cities.forEach(
        city => {

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
        }
    );
}


// =====================================================
// CURRENT LOCATION
// =====================================================

function getCurrentLocation() {

    if (
        !navigator.geolocation
    ) {

        errorMessage.textContent =
            "Geolocation is not supported by your browser.";

        return;
    }


    loadingMessage.textContent =
        "Detecting your location...";


    errorMessage.textContent =
        "";


    navigator.geolocation.getCurrentPosition(

        async position => {

            try {

                const latitude =
                    position.coords.latitude;

                const longitude =
                    position.coords.longitude;


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


                currentWeatherData =
                    data;


                updateWeather(
                    data,
                    city
                );


                saveRecentCity(
                    city
                );


                loadingMessage.textContent =
                    "";

            }

            catch (error) {

                console.error(
                    error
                );


                loadingMessage.textContent =
                    "";


                errorMessage.textContent =
                    "Unable to get weather for your location.";
            }
        },


        () => {

            loadingMessage.textContent =
                "";


            errorMessage.textContent =
                "Location access was denied. Please allow location access and try again.";
        }
    );
}


// =====================================================
// ENTER KEY SEARCH
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
// RESIZE PARTICLES
// =====================================================

let resizeTimer = null;


window.addEventListener(
    "resize",
    () => {

        clearTimeout(
            resizeTimer
        );


        resizeTimer =
            setTimeout(
                () => {

                    if (
                        currentWeatherData
                    ) {

                        const current =
                            currentWeatherData
                                .current_condition[0];


                        updateAtmosphere(
                            current.weatherCode
                        );
                    }

                },
                500
            );
    }
);


// =====================================================
// INITIALIZATION
// =====================================================

addParticleStyles();

createParticleContainer();

updateDateTime();

setInterval(
    updateDateTime,
    60000
);

displayRecentCities();


// =====================================================
// DEFAULT UNIT
// =====================================================

if (celsiusBtn) {

    celsiusBtn.classList.add(
        "active"
    );
}