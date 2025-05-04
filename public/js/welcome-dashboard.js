document.addEventListener('DOMContentLoaded', () => {
    const welcomeH1Element = document.getElementById('welcome-typing-h1');
    const welcomeH2Element = document.getElementById('welcome-typing-h2');
    const welcomeH3Element = document.getElementById('welcome-typing-h3');
    const primaryButton = document.querySelector('.primary-button');
    const secondaryButton = document.querySelector('.secondary-button');
    const contactButton = document.querySelector('.contact-button');
    const signinSection = document.getElementById('signin');
    const loginSection = document.getElementById('login');
    const contactSection = document.getElementById('contact');

    const h1Text = "WELCOME TO";
    const h2Text = "COBUTECH PREMIUM";
    const h3Text = "VIP WEBSITE";
    const typingSpeed = 150;
    let h1Index = 0;
    let h2Index = 0;
    let h3Index = 0;

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
        }
    }

    // Start the typing animation when the page loads
    typeH1();

    // Button click event listeners
    if (primaryButton && signinSection && loginSection && contactSection) {
        primaryButton.addEventListener('click', function(event) {
            event.preventDefault();
            signinSection.style.display = 'block';
            loginSection.style.display = 'none';
            contactSection.style.display = 'none';
            this.classList.add('glowing');
            setTimeout(() => {
                this.classList.remove('glowing');
            }, 1000);
        });
    }

    if (secondaryButton && loginSection && signinSection && contactSection) {
        secondaryButton.addEventListener('click', function(event) {
            event.preventDefault();
            loginSection.style.display = 'block';
            signinSection.style.display = 'none';
            contactSection.style.display = 'none';
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
