const cobuTechTypingElement = document.getElementById('cobu-tech-typing');
const bestTechTextElement = document.getElementById('best-tech-text');
const datetimeTopRightInitial = document.getElementById('datetime-top-right-initial');
const welcomeAnimationElement = document.getElementById('welcome-animation');

const bestTechText = "THE BEST TECH YOU'VE NEVER SEEN...";
const firstTextDisplayTime = 5000; // 5 seconds for "COBU-TECH INDUSTRY"
const secondTextDisplayTime = 5000; // 5 seconds for the second text
const fadeOutDuration = 1000; // 1 second for fade out

function fadeOut(element, callback) {
    element.style.transition = `opacity ${fadeOutDuration / 1000}s ease-in-out`;
    element.style.opacity = 0;
    setTimeout(() => {
        element.style.display = 'none';
        if (callback) {
            callback();
        }
    }, fadeOutDuration);
}

function fadeIn(element) {
    element.style.opacity = 0;
    element.style.display = 'block';
    element.style.transition = `opacity ${fadeOutDuration / 1000}s ease-in-out`;
    setTimeout(() => {
        element.style.opacity = 1;
    }, 50); // Small delay to ensure transition works
}

function updateDateTime(element) {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', timeZoneName: 'short' };
    element.textContent = now.toLocaleDateString('en-KE', options);
}

document.addEventListener('DOMContentLoaded', () => {
    // Display initial content
    if (datetimeTopRightInitial) {
        updateDateTime(datetimeTopRightInitial);
        setInterval(() => updateDateTime(datetimeTopRightInitial), 1000);
    }

    // Sequence of events
    setTimeout(() => {
        fadeOut(cobuTechTypingElement, () => {
            fadeIn(bestTechTextElement);
            setTimeout(() => {
                window.location.href = '/public/initialization.html';
            }, secondTextDisplayTime);
        });
    }, firstTextDisplayTime);
});
