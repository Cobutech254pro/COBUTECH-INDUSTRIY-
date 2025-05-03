const datetimeTopRightInit = document.getElementById('datetime-top-right-init');
const skipInitializationButton = document.getElementById('skip-initialization');
const skipWaitMessage = document.getElementById('skip-wait-message');
const countdownTimerElement = document.getElementById('countdown-timer');
const initializationPage = document.getElementById('initialization-page');

const countdownDuration = 60;
const backgroundColorChangeInterval = 1000;
const backgroundColors = ["#f44336", "#2196f3", "#4caf50", "#ff9800", "#9c27b0"];
const skipThreshold = 5; // User can skip when countdown is at or below this value

let countdown = countdownDuration;
let colorIndex = 0;
let canSkip = false;

function updateDateTime(element) {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', timeZoneName: 'short' };
    element.textContent = now.toLocaleDateString('en-KE', options);
}

function startInitialization() {
    updateDateTime(datetimeTopRightInit);
    setInterval(() => updateDateTime(datetimeTopRightInit), 1000);
    updateCountdown();
    changeBackgroundColor();
    setInterval(changeBackgroundColor, backgroundColorChangeInterval);
}

function updateCountdown() {
    countdownTimerElement.textContent = countdown;
    if (countdown > 0) {
        setTimeout(() => {
            countdown--;
            if (countdown <= skipThreshold) {
                canSkip = true;
            }
            updateCountdown();
        }, 1000);
    } else {
        window.location.href = '/public/welcome-dashboard.html'; // Redirect
    }
}

function changeBackgroundColor() {
    document.body.style.backgroundColor = backgroundColors[colorIndex];
    colorIndex = (colorIndex + 1) % backgroundColors.length;
}

skipInitializationButton.addEventListener('click', () => {
    if (canSkip) {
        window.location.href = '/public/welcome-dashboard.html'; // Redirect
    } else {
        skipWaitMessage.classList.remove('hidden');
        setTimeout(() => {
            skipWaitMessage.classList.add('hidden');
        }, 2000);
    }
});

document.addEventListener('DOMContentLoaded', () => {
    startInitialization();
});
