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

const errorMessage = document.getElementById("errorMessage");
const loadingMessage = document.getElementById("loadingMessage");
const dateTime = document.getElementById("dateTime");

const recentCities = document.getElementById("recentCities");

const hourlyForecast = document.getElementById("hourlyForecast");
const dailyForecast = document.getElementById("dailyForecast");

const celsiusBtn = document.getElementById("celsiusBtn");
const fahrenheitBtn = document.getElementById("fahrenheitBtn");


// =====================================================
// GLOBAL STATE
// =====================================================

let currentTemperatureC = null;
let currentFeelsLikeC = null;

let currentUnit = "C";

let currentWeatherData = null;

let currentWeatherType = "default";

let particleContainer = null;

let particleAnimationFrame = null;


// =====================================================
// PARTICLE SYSTEM
// =====================================================

function createParticleContainer() {

    if (particleContainer) {
        particleContainer.remove();
    }

    particleContainer =
        document.createElement("div");

    particleContainer.id =
        "weatherParticles";

    particleContainer.style.position = "fixed";
    particleContainer.style.inset = "0";
    particleContainer.style.pointerEvents = "none";
    particleContainer.style.overflow = "hidden";
    particleContainer.style.zIndex = "-1";

    document.body.appendChild(
        particleContainer
    );
}


// =====================================================
// CLEAR PARTICLES
// =====================================================

function clearParticles() {

    if (!particleContainer) {
        return;
    }

    particleContainer.innerHTML = "";

    if (particleAnimationFrame) {

        cancelAnimationFrame(
            particleAnimationFrame
        );

        particleAnimationFrame = null;
    }
}


// =====================================================
// PARTICLE STYLE
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
            will-change: transform, opacity;
        }

        .rain-particle {
            width: 1.5px;
            height: 45px;
            border-radius: 999px;

            background:
                linear-gradient(
                    to bottom,
                    transparent,
                    rgba(147, 197, 253, 0.65)
                );

            filter:
                drop-shadow(
                    0 0 4px
                    rgba(96, 165, 250, 0.25)
                );
        }

        .snow-particle {
            width: 6px;
            height: 6px;

            border-radius: 50%;

            background:
                rgba(255, 255, 255, 0.8);

            box-shadow:
                0 0 8px
                rgba(255, 255, 255, 0.5);
        }

        .sun-particle {
            width: 5px;
            height: 5px;

            border-radius: 50%;

            background:
                rgba(253, 224, 71, 0.65);

            box-shadow:
                0 0 12px
                rgba(251, 191, 36, 0.6);
        }

        .cloud-particle {
            width: 180px;
            height: 55px;

            border-radius: 50%;

            background:
                rgba(226, 232, 240, 0.045);

            filter: blur(12px);
        }

        .lightning-flash {
            position: fixed;
            inset: 0;

            background:
                rgba(255, 255, 255, 0.08);

            pointer-events: none;

            opacity: 0;

            z-index: -1;
        }

        @keyframes lightningFlash {
            0%, 100% {
                opacity: 0;
            }

            10% {
                opacity: 0.7;
            }

            15% {
                opacity: 0.05;
            }

            22% {
                opacity: 0.45;
            }

            30% {
                opacity: 0;
            }
        }
    `;

    document.head.appendChild(style);
}


// =====================================================
// RAIN PARTICLES
// =====================================================

function createRainParticles() {

    clearParticles();

    const count =
        window.innerWidth < 600
            ? 70
            : 130;

    for (let i = 0; i < count; i++) {

        const particle =
            document.createElement("div");

        particle.className =
            "weather-particle rain-particle";

        const left =
            Math.random() * 105;

        const duration =
            0.55 + Math.random() * 0.6;

        const delay =
            Math.random() * 1.5;

        const size =
            0.7 + Math.random() * 0.8;

        particle.style.left =
            `${left}%`;

        particle.style.top =
            `${-20 - Math.random() * 100}px`;

        particle.style.height =
            `${30 + Math.random() * 35}px`;

        particle.style.opacity =
            `${0.15 + Math.random() * 0.45}`;

        particle.style.transform =
            `rotate(15deg) scale(${size})`;

        particle.style.animation =
            `rainParticleFall ${duration}s linear ${delay}s infinite`;

        particleContainer.appendChild(
            particle
        );
    }


    addRainAnimation();
}


// =====================================================
// RAIN ANIMATION
// =====================================================

function addRainAnimation() {

    if (
        document.getElementById(
            "rainAnimationStyle"
        )
    ) {
        return;
    }

    const style =
        document.createElement("style");

    style.id =
        "rainAnimationStyle";

    style.textContent = `

        @keyframes rainParticleFall {

            0% {
                transform:
                    translate3d(
                        -10px,
                        -100px,
                        0
                    )
                    rotate(15deg);
            }

            100% {
                transform:
                    translate3d(
                        35px,
                        110vh,
                        0
                    )
                    rotate(15deg);
            }
        }
    `;

    document.head.appendChild(
        style
    );
}


// =====================================================
// SNOW PARTICLES
// =====================================================

function createSnowParticles() {

    clearParticles();

    const count =
        window.innerWidth < 600
            ? 45
            : 80;

    for (let i = 0; i < count; i++) {

        const particle =
            document.createElement("div");

        particle.className =
            "weather-particle snow-particle";

        particle.style.left =
            `${Math.random() * 100}%`;

        particle.style.top =
            `${-10 - Math.random() * 100}px`;

        const size =
            3 + Math.random() * 6;

        particle.style.width =
            `${size}px`;

        particle.style.height =
            `${size}px`;

        particle.style.opacity =
            `${0.25 + Math.random() * 0.65}`;

        particle.style.animation =
            `snowParticleFall ${
                7 + Math.random() * 10
            }s linear ${
                Math.random() * 8
            }s infinite`;

        particleContainer.appendChild(
            particle
        );
    }


    addSnowAnimation();
}


// =====================================================
// SNOW ANIMATION
// =====================================================

function addSnowAnimation() {

    if (
        document.getElementById(
            "snowAnimationStyle"
        )
    ) {
        return;
    }

    const style =
        document.createElement("style");

    style.id =
        "snowAnimationStyle";

    style.textContent = `

        @keyframes snowParticleFall {

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
                        25px,
                        25vh,
                        0
                    );
            }

            50% {
                transform:
                    translate3d(
                        -20px,
                        50vh,
                        0
                    );
            }

            75% {
                transform:
                    translate3d(
                        20px,
                        75vh,
                        0
                    );
            }

            100% {
                transform:
                    translate3d(
                        -10px,
                        110vh,
                        0
                    );
            }
        }
    `;

    document.head.appendChild(
        style
    );
}


// =====================================================
// SUN PARTICLES
// =====================================================

function createSunParticles() {

    clearParticles();

    const count =
        window.innerWidth < 600
            ? 18
            : 30;

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
            `${0.15 + Math.random() * 0.4}`;

        particle.style.animation =
            `sunParticleFloat ${
                5 + Math.random() * 7
            }s ease-in-out ${
                Math.random() * 5
            }s infinite alternate`;

        particleContainer.appendChild(
            particle
        );
    }


    addSunAnimation();
}


// =====================================================
// SUN ANIMATION
// =====================================================

function addSunAnimation() {

    if (
        document.getElementById(
            "sunAnimationStyle"
        )
    ) {
        return;
    }

    const style =
        document.createElement("style");

    style.id =
        "sunAnimationStyle";

    style.textContent = `

        @keyframes sunParticleFloat {

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
    `;

    document.head.appendChild(
        style
    );
}


// =====================================================
// CLOUD PARTICLES
// =====================================================

function createCloudParticles() {

    clearParticles();

    const count =
        window.innerWidth < 600
            ? 3
            : 5;

    for (let i = 0; i < count; i++) {

        const cloud =
            document.createElement("div");

        cloud.className =
            "weather-particle cloud-particle";

        cloud.style.left =
            `${-20 + Math.random() * 100}%`;

        cloud.style.top =
            `${10 + Math.random() * 40}%`;

        cloud.style.opacity =
            `${0.2 + Math.random() * 0.25}`;

        cloud.style.transform =
            `scale(
                ${0.7 + Math.random() * 0.8}
            )`;

        cloud.style.animation =
            `cloudParticleMove ${
                18 + Math.random() * 15
            }s linear ${
                Math.random() * 10
            }s infinite`;

        particleContainer.appendChild(
            cloud
        );
    }


    addCloudAnimation();
}


// =====================================================
// CLOUD ANIMATION
// =====================================================

function addCloudAnimation() {

    if (
        document.getElementById(
            "cloudAnimationStyle"
        )
    ) {
        return;
    }

    const style =
        document.createElement("style");

    style.id =
        "cloudAnimationStyle";

    style.textContent = `

        @keyframes cloudParticleMove {

            0% {
                margin-left: -200px;
            }

            100% {
                margin-left: 110vw;
            }
        }
    `;

    document.head.appendChild(
        style
    );
}


// =====================================================
// STORM EFFECT
// =====================================================

function createStormParticles() {

    createRainParticles();

    createLightning();
}


// =====================================================
// LIGHTNING
// =====================================================

function createLightning() {

    const flash =
        document.createElement("div");

    flash.className =
        "lightning-flash";

    flash.id =
        "stormLightning";

    document.body.appendChild(
        flash
    );

    scheduleLightning();
}


// =====================================================
// SCHEDULE LIGHTNING
// =====================================================

function scheduleLightning() {

    if (
        currentWeatherType !== "storm"
    ) {
        return;
    }

    const delay =
        4000 + Math.random() * 9000;

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
            "lightningFlash 0.65s ease";

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

        createStormParticles();

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

        const response =
            await fetch(
                `https://wttr.in/${encodeURIComponent(city)}?format=j1`
            );


        if (!response.ok) {
            throw new Error(
                "Weather request failed."
            );
        }


        const data =
            await response.json();


        if (
            !data.current_condition ||
            data.current_condition.length === 0
        ) {
            throw new Error(
                "Invalid weather data."
            );
        }


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
            "Unable to find weather information. Please check the city name.";

        clearForecasts();
    }
}


// =====================================================
// UPDATE WEATHER DATA
// =====================================================

function updateWeatherFromData(
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


    visibility.textContent =
        `${currentWeather.visibility} km`;


    windDirection.textContent =
        currentWeather.winddir16Point;


    uvIndex.textContent =
        currentWeather.uvIndex;


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


    updateDateTime();


    generateHourlyForecast(
        data
    );


    generateDailyForecast(
        data
    );
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
// SUNRISE / SUNSET
// =====================================================

function updateSunData(data) {

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
        formatTime(
            astronomy.sunrise
        );


    sunset.textContent =
        formatTime(
            astronomy.sunset
        );
}


function formatTime(time) {

    if (!time) {
        return "--:--";
    }

    return time;
}


// =====================================================
// HOURLY FORECAST
// =====================================================

function generateHourlyForecast(
    data
) {

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


    hourlyData.forEach(
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
                    ${index === 0
                        ? "Now"
                        : time}
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


    if (numericTime < 100) {
        return `${numericTime / 100} AM`;
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

    dailyForecast.innerHTML = "";


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
// UNIT CONVERSION
// =====================================================

function convertToFahrenheit(
    celsius
) {

    return (
        Number(celsius) * 9 / 5 + 32
    ).toFixed(1);
}


// =====================================================
// SET UNIT
// =====================================================

function setUnit(unit) {

    currentUnit =
        unit;


    if (unit === "C") {

        celsiusBtn.classList.add(
            "active"
        );

        fahrenheitBtn.classList.remove(
            "active"
        );

    } else {

        fahrenheitBtn.classList.add(
            "active"
        );

        celsiusBtn.classList.remove(
            "active"
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
// TEMPERATURE
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
// FEELS LIKE
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


function displayRecentCities() {

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
// CURRENT LOCATION
// =====================================================

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


                currentWeatherData =
                    data;


                updateWeatherFromData(
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

                console.error(error);

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
// CLEAR FORECASTS
// =====================================================

function clearForecasts() {

    hourlyForecast.innerHTML =
        "";

    dailyForecast.innerHTML =
        "";
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
// INITIALIZE
// =====================================================

createParticleContainer();

addParticleStyles();

updateDateTime();

setInterval(
    updateDateTime,
    60000
);

displayRecentCities();


// =====================================================
// HANDLE RESIZE
// =====================================================

let resizeTimer;

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