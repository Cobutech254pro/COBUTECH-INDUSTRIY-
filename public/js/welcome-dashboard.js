document.addEventListener('DOMContentLoaded', () => {
    const welcomeH1Element = document.getElementById('welcome-typing-h1');
    const welcomeH2Element = document.getElementById('welcome-typing-h2');
    const welcomeH3Element = document.getElementById('welcome-typing-h3');
    const primaryButton = document.querySelector('.primary-button');
    const secondaryButton = document.querySelector('.secondary-button');
    const contactButton = document.querySelector('.contact-button');

    const h1Text = "WELCOME TO";
    const h2Text = "COBUTECH PREMIUM";
    const h3Text = "VIP WEBSITE";
    const typingSpeed = 150;
    const displayTime = 20000; // 20 seconds in milliseconds
    let h1Index = 0;
    let h2Index = 0;
    let h3Index = 0;
    let isTypingComplete = false;

    function typeH1() {
        if (h1Index < h1Text.length) {
            welcomeH1Element.textContent += h1Text.charAt(h1Index);
            h1Index++;
            setTimeout(typeH1, typingSpeed);
        } else {
            setTimeout(typeH2, 500); // Start typing H2 after a short delay
        }
    }

    function typeH2() {
        if (h2Index < h2Text.length) {
            welcomeH2Element.textContent += h2Text.charAt(h2Index);
            h2Index++;
            setTimeout(typeH2, typingSpeed);
        } else {
            setTimeout(typeH3, 500); // Start typing H3 after a short delay
        }
    }

    function typeH3() {
        if (h3Index < h3Text.length) {
            welcomeH3Element.textContent += h3Text.charAt(h3Index);
            h3Index++;
            setTimeout(typeH3, typingSpeed);
        } else {
            isTypingComplete = true;
            setTimeout(eraseWelcomeText, displayTime); // Start erasing after 20 seconds
        }
    }

    function eraseWelcomeText() {
        const eraseSpeed = 50;
        if (welcomeH3Element.textContent.length > 0) {
            welcomeH3Element.textContent = welcomeH3Element.textContent.slice(0, -1);
            setTimeout(eraseWelcomeText, eraseSpeed);
        } else if (welcomeH2Element.textContent.length > 0) {
            welcomeH2Element.textContent = welcomeH2Element.textContent.slice(0, -1);
            setTimeout(eraseWelcomeText, eraseSpeed);
        } else if (welcomeH1Element.textContent.length > 0) {
            welcomeH1Element.textContent = welcomeH1Element.textContent.slice(0, -1);
            setTimeout(eraseWelcomeText, eraseSpeed);
        }
    }

    // Start the typing animation when the page loads
    typeH1();

    // Button click event listeners for the glowing effect
    if (primaryButton) {
        primaryButton.addEventListener('click', function() {
            this.classList.add('glowing');
            setTimeout(() => {
                this.classList.remove('glowing');
            }, 1000);
        });
    }

    if (secondaryButton) {
        secondaryButton.addEventListener('click', function() {
            this.classList.add('glowing');
            setTimeout(() => {
                this.classList.remove('glowing');
            }, 1000);
        });
    }

    if (contactButton) {
        contactButton.addEventListener('click', function() {
            this.classList.add('glowing');
            setTimeout(() => {
                this.classList.remove('glowing');
            }, 1000);
        });
    }
});
