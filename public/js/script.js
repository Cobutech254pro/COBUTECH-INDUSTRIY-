const cobuTechTypingElement = document.getElementById('cobu-tech-typing');
const bestTechTextElement = document.getElementById('best-tech-text');
const datetimeTopRightInitial = document.getElementById('datetime-top-right-initial');
const welcomeAnimationElement = document.getElementById('welcome-animation');
const logoContainer = document.querySelector('.logo-container'); // Get the logo container

const cobuTechText = "WELCOME TO COBUTECH INDUSTRY";
const bestTechText = "THE BEST TECH YOU'VE EVER SEEN...";
const typingSpeed = 100;
const initialDelay = 10000; // 10 seconds before moving to initialization
const typingStartDelay = 1000; // Delay before typing starts (after logo is visible)
const fadeInDelay = 500; // Delay before starting the fade-in

let cobuTechIndex = 0;

function typeText() {
    if (cobuTechIndex < cobuTechText.length) {
        cobuTechTypingElement.textContent = cobuTechText.substring(0, cobuTechIndex + 1);
        cobuTechIndex++;
        setTimeout(typeText, typingSpeed);
    } else {
        // Typing complete, now show the tagline with fade-in
        setTimeout(() => {
            bestTechTextElement.textContent = bestTechText;
            welcomeAnimationElement.style.opacity = 1;
            // Redirect after the initial delay from page load
            setTimeout(() => {
                window.location.href = '/public/initialization.html';
            }, initialDelay);
        }, fadeInDelay);
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
    if (cobuTechTypingElement && bestTechTextElement && welcomeAnimationElement && logoContainer) {
        // Logo is visible immediately due to HTML structure
        // Start typing after a small delay
        setTimeout(() => {
            welcomeAnimationElement.style.opacity = 1; // Make the animation container visible for typing
            typeText();
        }, typingStartDelay);
    } else {
        // Fallback redirection if elements are not found
        setTimeout(() => {
            window.location.href = '/public/initialization.html';
        }, initialDelay);
    }
});
