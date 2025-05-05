document.addEventListener('DOMContentLoaded', () => {
  const datetimeElement = document.getElementById('datetime-top-right-initial');
  const bestTechText = document.getElementById('best-tech-text');
  const cobuTechTyping = document.getElementById('cobu-tech-typing');

  // Set static date and time
  const now = new Date();
  const options = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZoneName: 'short'
  };
  datetimeElement.textContent = now.toLocaleDateString('en-GB', options);

  // Animate "COBU-TECH INDUSTRY" fade in and out
  cobuTechTyping.style.opacity = '1';

  setTimeout(() => {
    cobuTechTyping.style.opacity = '0';

    // Start typing animation after COBU-TECH fades
    bestTechText.textContent = "THE BETTER TECH YOU'VE EVER SEEN";
    bestTechText.style.opacity = '1';
    bestTechText.style.animation = 'typing 3s steps(30, end) forwards';
  }, 3000);

  // Redirect after full sequence
  setTimeout(() => {
    window.location.href = '/public/initialization.html';
  }, 6000);
});
