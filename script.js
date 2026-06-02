// Particle System
const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');
let particles = [];
let animationId;

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

class Particle {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = Math.random() * canvas.width;
        this.y = canvas.height + Math.random() * 100;
        this.size = Math.random() * 2 + 0.5;
        this.speedY = Math.random() * 0.5 + 0.2;
        this.speedX = (Math.random() - 0.5) * 0.3;
        this.opacity = Math.random() * 0.3 + 0.1;
        this.life = 0;
        this.maxLife = Math.random() * 300 + 200;
    }

    update() {
        this.y -= this.speedY;
        this.x += this.speedX;
        this.life++;

        if (this.y < -10 || this.life > this.maxLife) {
            this.reset();
        }
    }

    draw() {
        const fadeIn = Math.min(this.life / 50, 1);
        const fadeOut = Math.max((this.maxLife - this.life) / 50, 0);
        const alpha = this.opacity * Math.min(fadeIn, fadeOut);

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(99, 102, 241, ${alpha})`;
        ctx.fill();
    }
}

function initParticles() {
    resizeCanvas();
    particles = [];
    const particleCount = Math.min(Math.floor(window.innerWidth / 20), 80);
    for (let i = 0; i < particleCount; i++) {
        const p = new Particle();
        p.y = Math.random() * canvas.height;
        particles.push(p);
    }
}

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
        p.update();
        p.draw();
    });
    animationId = requestAnimationFrame(animateParticles);
}

// Initialize particles
initParticles();
animateParticles();

window.addEventListener('resize', () => {
    resizeCanvas();
    initParticles();
});

// Navbar scroll effect
const navbar = document.getElementById('navbar');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.scrollY;

    if (currentScroll > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }

    lastScroll = currentScroll;
});

// Mobile menu toggle
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const navLinks = document.getElementById('navLinks');

mobileMenuBtn.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    mobileMenuBtn.textContent = navLinks.classList.contains('active') ? '✕' : '☰';
    mobileMenuBtn.setAttribute('aria-expanded', navLinks.classList.contains('active'));
});

// Close mobile menu on link click
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        mobileMenuBtn.textContent = '☰';
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
    });
});

// Intersection Observer for fade-in animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');

            // Animate skill bars
            const skillBars = entry.target.querySelectorAll('.skill-progress');
            skillBars.forEach(bar => {
                const width = bar.getAttribute('data-width');
                setTimeout(() => {
                    bar.style.width = width + '%';
                }, 200);
            });
        }
    });
}, observerOptions);

document.querySelectorAll('.fade-in').forEach(el => {
    observer.observe(el);
});

// Contact form handling
const contactForm = document.getElementById('contactForm');
const formStatus = document.getElementById('formStatus');

contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const btn = contactForm.querySelector('button[type="submit"]');
    const originalText = btn.textContent;
    btn.textContent = 'Sending...';
    btn.disabled = true;

    // Simulate form submission (replace with actual form service later)
    setTimeout(() => {
        formStatus.textContent = 'Message sent successfully! I will get back to you soon.';
        formStatus.className = 'form-status success';
        contactForm.reset();
        btn.textContent = originalText;
        btn.disabled = false;

        setTimeout(() => {
            formStatus.className = 'form-status';
        }, 5000);
    }, 1500);
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Typing effect for terminal
const terminalLines = document.querySelectorAll('.terminal-body');
terminalLines.forEach(terminal => {
    const originalText = terminal.textContent;
    terminal.textContent = '';
    let charIndex = 0;

    function typeChar() {
        if (charIndex < originalText.length) {
            terminal.textContent += originalText[charIndex];
            charIndex++;
            setTimeout(typeChar, 15);
        }
    }

    // Start typing after a delay
    setTimeout(typeChar, 1000);
});

// Active nav link highlighting
const sections = document.querySelectorAll('section[id]');
const navItems = document.querySelectorAll('.nav-links a');

window.addEventListener('scroll', () => {
    let current = '';

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (scrollY >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });

    navItems.forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('href') === '#' + current) {
            item.classList.add('active');
        }
    });
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    cancelAnimationFrame(animationId);
});
// ===============================
// WEATHER + GEOLOCATION
// ===============================

const weatherInfo = document.getElementById("weatherInfo");
const weatherIcon = document.getElementById("hero-weather-icon");

async function loadWeather() {

    if (!navigator.geolocation) {
        weatherInfo.textContent =
            "Geolocation is not supported by your browser";
        return;
    }

    weatherInfo.textContent = "Getting your location...";

    navigator.geolocation.getCurrentPosition(
        async position => {

            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;

            try {

                // Current weather
                const weatherResponse = await fetch(
                    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code`
                );

                const weatherData = await weatherResponse.json();

                // Reverse geocoding
                const geoResponse = await fetch(
                    `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
                );

                const geoData = await geoResponse.json();

                const location =
                    geoData.address.city ||
                    geoData.address.town ||
                    geoData.address.village ||
                    geoData.address.suburb ||
                    "Unknown Location";

                const temperature =
                    Math.round(weatherData.current.temperature_2m);

                const weatherCode =
                    weatherData.current.weather_code;

                const weatherDescription =
                    getWeatherDescription(weatherCode);

                weatherInfo.innerHTML =
                    `
                    📍 ${location}<br>
                    🌡️ ${temperature}°C · ${weatherDescription}
                    `;

                updateWeatherIcon(weatherCode);

            } catch (error) {

                console.error(error);

                weatherInfo.textContent =
                    "Unable to load weather data";
            }
        },

        error => {

            console.error(error);

            switch (error.code) {

                case error.PERMISSION_DENIED:
                    weatherInfo.textContent =
                        "Location permission denied";
                    break;

                case error.POSITION_UNAVAILABLE:
                    weatherInfo.textContent =
                        "Location unavailable";
                    break;

                case error.TIMEOUT:
                    weatherInfo.textContent =
                        "Location request timed out";
                    break;

                default:
                    weatherInfo.textContent =
                        "Unable to get location";
            }
        }
    );
}

// Weather descriptions
function getWeatherDescription(code) {

    const weatherCodes = {

        0: "Clear Sky",

        1: "Mainly Clear",
        2: "Partly Cloudy",
        3: "Overcast",

        45: "Fog",
        48: "Rime Fog",

        51: "Light Drizzle",
        53: "Drizzle",
        55: "Heavy Drizzle",

        61: "Light Rain",
        63: "Rain",
        65: "Heavy Rain",

        71: "Light Snow",
        73: "Snow",
        75: "Heavy Snow",

        80: "Rain Showers",
        81: "Heavy Showers",
        82: "Violent Showers",

        95: "Thunderstorm",
        96: "Thunderstorm & Hail",
        99: "Severe Thunderstorm"
    };

    return weatherCodes[code] || "Unknown";
}

// Update icon
function updateWeatherIcon(code) {

    if (!weatherIcon) return;

    if (code === 0) {
        weatherIcon.className = "fas fa-sun";
    }

    else if ([1, 2].includes(code)) {
        weatherIcon.className = "fas fa-cloud-sun";
    }

    else if (code === 3) {
        weatherIcon.className = "fas fa-cloud";
    }

    else if ([45, 48].includes(code)) {
        weatherIcon.className = "fas fa-smog";
    }

    else if (
        [51,53,55,61,63,65,80,81,82].includes(code)
    ) {
        weatherIcon.className = "fas fa-cloud-rain";
    }

    else if (
        [71,73,75].includes(code)
    ) {
        weatherIcon.className = "fas fa-snowflake";
    }

    else if (
        [95,96,99].includes(code)
    ) {
        weatherIcon.className = "fas fa-bolt";
    }

    else {
        weatherIcon.className = "fas fa-cloud-sun";
    }
}

// Load weather after page loads
window.addEventListener("load", loadWeather);