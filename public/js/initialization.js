const datetimeTopRightInit = document.getElementById('datetime-top-right-init');
const countdownTimerElement = document.getElementById('countdown-timer');
const loadingTextElement = document.getElementById('loading-text');
const pleaseWaitTextElement = document.getElementById('please-wait-text');

const countdownDuration = 60;
const loadingWords = "LOADING...";
const typingSpeed = 150;
let countdown = countdownDuration;
let loadingIndex = 0;

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
        }, 500);
    }
}

function startInitialization() {
    updateDateTime(datetimeTopRightInit);
    setInterval(() => updateDateTime(datetimeTopRightInit), 1000);
    updateCountdown();
    typeLoading(); // Start the typing animation for "LOADING..."
}

function updateCountdown() {
    countdownTimerElement.textContent = countdown;
    if (countdown > 0) {
        setTimeout(() => {
            countdown--;
            updateCountdown();
        }, 1000);
    } else {
        window.location.href = '/public/welcome-dashboard.html'; // Redirect
    }
}

document.addEventListener('DOMContentLoaded', () => {
    startInitialization();
});
