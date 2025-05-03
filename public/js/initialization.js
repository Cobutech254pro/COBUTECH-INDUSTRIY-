const datetimeTopRightInit = document.getElementById('datetime-top-right-init');
const countdownTimerElement = document.getElementById('countdown-timer');
const loadingTextElement = document.getElementById('loading-text');
const pleaseWaitTextElement = document.getElementById('please-wait-text');
const countdownCircleContainer = document.querySelector('.countdown-circle-container'); // Get the circle element

const countdownDuration = 60;
const loadingWords = "LOADING...";
const typingSpeed = 150;
const circleColorChangeInterval = 200; // Change color every 200 milliseconds
const circleColors = ["rgba(255, 255, 0, 0.7)", "rgba(0, 255, 255, 0.7)", "rgba(255, 0, 255, 0.7)", "rgba(0, 255, 0, 0.7)"]; // Example colors
let countdown = countdownDuration;
let loadingIndex = 0;
let loadingSequenceComplete = false;
let circleColorIndex = 0;

function updateDateTime(element) {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', timeZoneName: 'short' };
    element.textContent = now.toLocaleDateString('en-KE', options);
}

function typeLoading() {
    if (loadingIndex < loadingWords.length) {
        loadingTextElement.textContent += loadingWords.charAt(loadingIndex);
        loadingIndex++;
        setTimeout(typeLoading, typingSpeed);
    } else {
        // After "LOADING...", show "PLEASE WAIT..." after a short delay
        setTimeout(() => {
            pleaseWaitTextElement.classList.remove('hidden');
            loadingSequenceComplete = true; // Indicate loading sequence is finished
            startCountdown(); // Start the countdown after "PLEASE WAIT..." appears
            setInterval(changeCircleColor, circleColorChangeInterval); // Start changing circle color
        }, 500);
    }
}

function changeCircleColor() {
    if (countdownCircleContainer) {
        countdownCircleContainer.style.backgroundColor = circleColors[circleColorIndex];
        circleColorIndex = (circleColorIndex + 1) % circleColors.length;
    }
}

function startCountdown() {
    countdownTimerElement.textContent = countdown;
    if (countdown > 0) {
        setTimeout(() => {
            countdown--;
            startCountdown();
        }, 1000);
    } else {
        window.location.href = '/public/welcome-dashboard.html'; // Redirect
    }
}

function startInitialization() {
    updateDateTime(datetimeTopRightInit);
    setInterval(() => updateDateTime(datetimeTopRightInit), 1000);
    typeLoading(); // Start the typing animation for "LOADING..."
}

document.addEventListener('DOMContentLoaded', () => {
    startInitialization();
});
