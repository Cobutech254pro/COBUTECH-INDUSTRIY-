const cobuTechTypingElement = document.getElementById('cobu-tech-typing');
const bestTechTextElement = document.getElementById('best-tech-text');
const datetimeTopRightInitial = document.getElementById('datetime-top-right-initial');
const initialWelcomePage = document.getElementById('initial-welcome-page');

const cobuTechText = "WELCOME TO"; // Updated typing text
const bestTechText = "COBUTECH INDUSTRY\nTHE BEST TECH YOU'VE EVER SEEN..."; // Updated tagline
const typingSpeed = 150;
const initialDelay = 10000; // 10 seconds before moving to initialization

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
                setTimeout(() => {
                    window.location.href = '/public/initialization.html'; // Redirect
                }, initialDelay - (typingSpeed * cobuTechText.length + 500));
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
    updateDateTime(datetimeTopRightInitial);
    setInterval(() => updateDateTime(datetimeTopRightInitial), 1000);
    typeLine(); // Start the typing animation
});
