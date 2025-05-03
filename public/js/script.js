// Inside your public/js/script.js file

const cobuTechTypingElement = document.getElementById('cobu-tech-typing');
const bestTechTextElement = document.getElementById('best-tech-text');
const datetimeTopRightInitial = document.getElementById('datetime-top-right-initial');
const welcomeAnimationElement = document.getElementById('welcome-animation');

const cobuTechText = "WELCOME TO"; // Updated typing text
const bestTechText = "COBUTECH INDUSTRY\nTHE BEST TECH YOU'VE EVER SEEN..."; // Updated tagline
const typingSpeed = 150;
const initialDelay = 10000; // 10 seconds before moving to initialization
const fadeInDelay = 500; // Delay before starting the fade-in

let cobuTechIndex = 0;
let lineIndex = 0;
const lines = cobuTechText.split('\n'); // Split into lines

function typeLine() {
    const currentLine = lines[lineIndex];
    if (cobuTechIndex < currentLine.length) {
        cobuTechTypingElement.textContent = currentLine.substring(0, cobuTechIndex + 1);
        cobuTechIndex++;
        setTimeout(typeLine, typingSpeed);
    } else {
        lineIndex++;
        cobuTechIndex = 0;
        if (lineIndex < lines.length) {
            setTimeout(typeLine, 500); // Small delay between lines
        } else {
            setTimeout(() => {
                bestTechTextElement.innerHTML = bestTechText.replace('\n', '<br>'); // Display tagline
                // Trigger fade-in after typing
                setTimeout(() => {
                    if (welcomeAnimationElement) {
                        welcomeAnimationElement.style.opacity = 1;
                    }
                    // Redirect after the initial delay
                    setTimeout(() => {
                        window.location.href = 'public/initialization.html';
                    }, initialDelay);
                }, fadeInDelay);
            }, 500);
        }
    }
}

function updateDateTime(element) {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', timeZoneName: 'short' };
    element.textContent = now.toLocaleDateString('en-KE', options);
}

document.addEventListener('DOMContentLoaded', () => {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', timeZoneName: 'short' };
    if (datetimeTopRightInitial) {
        datetimeTopRightInitial.textContent = now.toLocaleDateString('en-KE', options);
        setInterval(() => updateDateTime(datetimeTopRightInitial), 1000);
    }
    if (cobuTechTypingElement && bestTechTextElement && welcomeAnimationElement) {
        // Start typing after a small delay to let the page load
        setTimeout(typeLine, 200);
    } else {
        // Fallback redirection if elements are not found
        setTimeout(() => {
            window.location.href = 'public/initialization.html';
        }, initialDelay);
    }
});
